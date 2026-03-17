import {useState, useEffect, useRef} from 'react';
import './App.css';
import {
    SelectFolder, 
    LoadProject, 
    SaveApkName, 
    RunGradle, 
    GetDeviceCount, 
    ParseErrors, 
    IncrementVersion,
    DeepClean,
    StopGradle,
    InstallApk,
    OpenApkFolder,
    GetGoVersion
} from "../wailsjs/go/main/App";
import {EventsOn} from "../wailsjs/runtime";

interface LogEntry {
    type: 'info' | 'success' | 'error' | 'raw';
    message: string;
}

function App() {
    const [projectPath, setProjectPath] = useState('');
    const [apkName, setApkName] = useState('');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [deviceCount, setDeviceCount] = useState(0);
    const [isBusy, setIsBusy] = useState(false);
    const [toast, setToast] = useState<{message: string, type: 'info' | 'success' | 'error'} | null>(null);
    const [variant, setVariant] = useState('Debug');
    const [refreshDeps, setRefreshDeps] = useState(false);
    const [goVersion, setGoVersion] = useState('');
    
    const logEndRef = useRef<HTMLDivElement>(null);

    const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        setToast({message, type});
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        EventsOn("log", (entry: LogEntry) => {
            setLogs(prev => [...prev.slice(-2000), entry]);
        });

        const timer = setInterval(async () => {
            try {
                const count = await GetDeviceCount();
                setDeviceCount(count);
            } catch (e) {}
        }, 3000);

        GetGoVersion().then(setGoVersion).catch(console.error);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                if (!isBusy && projectPath) handleBuild();
            }
            if (e.key === 'Escape') {
                if (isBusy) handleStop();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isBusy, projectPath]);

    const handleSelectFolder = async () => {
        try {
            const folder = await SelectFolder();
            if (folder) {
                const res = await LoadProject(folder);
                if (res.error) {
                    addLog('error', res.error);
                } else {
                    setProjectPath(res.path);
                    setApkName(res.apk_name || '');
                    addLog('info', `📂 Đã tải dự án: ${res.path}`);
                }
            }
        } catch (e) {
            addLog('error', `Lỗi mở hộp thoại chọn thư mục: ${e}`);
        }
    };

    const addLog = (type: LogEntry['type'], message: string) => {
        setLogs(prev => [...prev, { type, message }]);
    };

    const handleAction = async (task: () => Promise<any>, startMsg: string) => {
        if (!projectPath) return;
        setIsBusy(true);
        addLog('info', startMsg);
        try {
            await task();
        } catch (e) {
            addLog('error', `Hành động thất bại: ${e}`);
        }
        setIsBusy(false);
    }

    const handleBuild = () => {
        let cmd = `assemble${variant}`;
        if (refreshDeps) cmd += " --refresh-dependencies";
        handleAction(() => RunGradle(projectPath, cmd), `🚀 Đang khởi chạy Build: ${cmd}`);
    };

    const handleClean = () => handleAction(() => RunGradle(projectPath, "clean"), `🧹 Đang dọn dẹp dự án...`);
    
    const handleDeepClean = () => {
        if (!projectPath) return;
        if (window.confirm("Xóa Sạch Cache sẽ xóa toàn bộ file build cũ. Bạn có chắc chắn?")) {
            handleAction(async () => {
                await DeepClean(projectPath);
                addLog('success', '✨ Đã xóa cache build thành công!');
            }, `🔥 Đang thực hiện Xóa Sạch Cache...`);
        }
    };

    const handleStop = () => {
        if (!projectPath) return;
        StopGradle(projectPath);
        addLog('info', `🛑 Đã gửi lệnh dừng tới Gradle Daemon.`);
    };

    const handleInstall = async () => {
        if (!projectPath) return;
        setIsBusy(true);
        addLog('info', `📲 Đang thực hiện cài đặt qua ADB...`);
        try {
            const res = await InstallApk(projectPath, variant);
            addLog(res.includes('✅') ? 'success' : 'error', res);
        } catch (e) {
            addLog('error', `Cài đặt thất bại: ${e}`);
        }
        setIsBusy(false);
    };

    const handleOpenFolder = async () => {
        if (!projectPath) return;
        try {
            const res = await OpenApkFolder(projectPath, variant);
            addLog(res.includes('✅') ? 'info' : 'error', res);
        } catch (e) {
            addLog('error', `Lỗi mở thư mục: ${e}`);
        }
    };

    const copyErrors = async () => {
        const fullLog = logs.map(l => l.message).join('\n');
        try {
            const errors = await ParseErrors(fullLog);
            if (errors) {
                await navigator.clipboard.writeText(errors);
                addLog('success', '📋 Đã sao chép các lỗi quan trọng vào clipboard!');
            } else {
                addLog('info', '🔍 Không tìm thấy lỗi quan trọng nào trong log.');
            }
        } catch (e) {
            addLog('error', `Sao chép thất bại: ${e}`);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#060b14] text-[#f8fafc] font-sans select-none overflow-hidden">
            {/* Minimalist Apple-style Header */}
            <header className="flex items-center justify-between px-8 py-5 bg-[#0b1120] border-b border-[#1e293b] z-20">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white leading-tight">Apk Builder</h1>
                        <div className="flex items-center space-x-2">
                            <span className="text-[9px] text-[#94a3b8] font-black uppercase tracking-[0.3em]">Next-Gen Go Engine</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center">
                    <div className="flex items-center space-x-3 bg-white/5 px-5 py-2.5 rounded-full border border-white/10 shadow-inner">
                        <div className={`w-2.5 h-2.5 rounded-full ${deviceCount > 0 ? 'bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.5)] animate-pulse' : 'bg-red-500'}`}></div>
                        <span className="text-[11px] font-black tracking-widest text-[#94a3b8] uppercase">{deviceCount} {deviceCount === 1 ? 'Thiết bị' : 'Thiết bị'} Sẵn Sàng</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Advanced Sidebar */}
                <aside className="w-[340px] bg-[#0b1120] border-r border-[#1e293b] p-8 flex flex-col space-y-10 overflow-y-auto">
                    <section className="sidebar-section">
                        <h3 className="sidebar-label">Cấu Hình Dự Án</h3>
                        
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-[#64748b] ml-1 uppercase tracking-wider">Thư Mục Gốc</label>
                            <div className="input-card group">
                                <div className="text-[12px] font-medium text-[#94a3b8] break-all leading-relaxed mb-4 min-h-[36px]">
                                    {projectPath || <span className="italic opacity-50">Chưa chọn folder dự án...</span>}
                                </div>
                                <button 
                                    onClick={handleSelectFolder}
                                    className="w-full py-3 bg-[#1e293b] hover:bg-[#334155] text-white text-[11px] font-bold rounded-xl border border-[#334155] shadow-sm transition-all focus:ring-2 focus:ring-blue-500/20"
                                >
                                    Thay Đổi Thư Mục
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-[#64748b] ml-1 uppercase tracking-wider">Tên Sản Phẩm (APK)</label>
                            <input 
                                type="text"
                                value={apkName}
                                onChange={(e) => setApkName(e.target.value)}
                                onBlur={() => SaveApkName(projectPath, apkName)}
                                className="w-full bg-[#0b1120] px-5 py-3.5 rounded-2xl border border-[#1e293b] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-[13px] transition-all text-blue-400"
                                placeholder="App_Production_V1.0.0"
                            />
                        </div>
                    </section>

                    <section className="sidebar-section">
                        <h3 className="sidebar-label">Tùy Chọn Build</h3>
                        
                        <div className="bg-[#151e32] p-5 rounded-2xl border border-[#1e293b] space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] font-medium text-[#94a3b8]">Phiên Bản Build</span>
                                <div className="flex bg-[#060b14] p-1.5 rounded-xl border border-[#1e293b]">
                                    {['Debug', 'Release'].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => setVariant(v)}
                                            className={`px-4 py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${variant === v ? 'bg-[#1d4ed8] text-white shadow-lg' : 'text-[#64748b] hover:text-[#94a3b8]'}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-medium text-[#94a3b8] group-hover:text-[#f8fafc] transition-colors">Làm Mới Triệt Để</span>
                                    <span className="text-[9px] text-[#475569]">Xóa cache & tải lại deps</span>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={refreshDeps} 
                                    onChange={(e) => setRefreshDeps(e.target.checked)}
                                    className="w-5 h-5 rounded-lg border-[#334155] bg-[#060b14] text-blue-500 focus:ring-0 accent-blue-600 cursor-pointer"
                                />
                            </label>
                        </div>
                    </section>
                    
                    <div className="flex-1 flex flex-col justify-end">
                        <button 
                            onClick={handleDeepClean}
                            className="w-full py-4 bg-orange-500/5 hover:bg-orange-500/10 text-orange-400 text-[11px] font-bold rounded-2xl border border-orange-500/20 transition-all flex items-center justify-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            <span>Hard Reset Gradle Cache</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col p-8 space-y-8">
                    {/* Action Bar */}
                    <div className="flex items-stretch space-x-6 h-28">
                        <button 
                            disabled={isBusy || !projectPath}
                            onClick={handleBuild}
                            className="flex-1 btn-primary-gradient rounded-[28px] group relative overflow-hidden p-6"
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative flex flex-col items-center justify-center space-y-2">
                                <div className={`p-2.5 rounded-xl bg-white/15 shadow-inner ${isBusy ? 'animate-spin' : ''}`}>
                                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <span className="text-[14px] font-black uppercase tracking-[0.25em]">{isBusy ? 'Đang Thực Thi...' : 'Khởi Chạy Build'}</span>
                            </div>
                        </button>

                        <div className="flex-[1.2] flex space-x-3">
                            <button 
                                disabled={isBusy || !projectPath}
                                onClick={handleClean}
                                title="Dọn dẹp thư mục build"
                                className="flex-1 btn-secondary rounded-[24px] flex flex-col items-center justify-center space-y-1.5"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Dọn Dẹp</span>
                            </button>

                            <button 
                                disabled={isBusy || !projectPath}
                                onClick={handleOpenFolder}
                                title="Mở thư mục chứa APK"
                                className="flex-1 btn-secondary rounded-[24px] flex flex-col items-center justify-center space-y-1.5"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Thư Mục</span>
                            </button>

                            <button 
                                disabled={isBusy || !projectPath}
                                onClick={handleInstall}
                                title="Cài đặt APK vào thiết bị"
                                className="flex-1 btn-secondary rounded-[24px] flex flex-col items-center justify-center space-y-1.5"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Cài Đặt</span>
                            </button>
                        </div>

                        <button 
                            disabled={!isBusy}
                            onClick={handleStop}
                            className={`w-20 rounded-[24px] flex items-center justify-center transition-all ${isBusy ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 active:scale-95' : 'bg-[#151e32] text-[#334155] border border-[#1e293b] cursor-not-allowed'}`}
                        >
                            <div className="w-5 h-5 bg-current rounded-sm"></div>
                        </button>
                    </div>

                    {/* Console Window */}
                    <div className="console-window flex-1 relative">
                        <div className="console-header">
                            <div className="flex items-center space-x-5">
                                <div className="flex space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                                </div>
                                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-[0.25em]">Terminal Output</span>
                            </div>
                            
                            <button 
                                onClick={copyErrors}
                                className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-red-500/20 transition-all"
                            >
                                Lọc & Copy Lỗi
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 font-mono text-[13px] leading-[1.8] selection:bg-blue-500/30">
                            {logs.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-6">
                                    <div className="w-20 h-20 border-2 border-dashed border-[#1e293b] rounded-full flex items-center justify-center animate-pulse">
                                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <p className="font-bold tracking-[0.4em] uppercase text-xs">Ready for input</p>
                                </div>
                            )}
                            {logs.map((log, i) => (
                                <div key={i} className={`flex space-x-6 mb-2 group animate-in fade-in slide-in-from-left-2 duration-300
                                    ${log.type === 'error' ? 'text-red-400 bg-red-500/5 rounded-lg -mx-2 px-2' : ''}
                                    ${log.type === 'info' ? 'text-blue-400 font-bold' : ''}
                                    ${log.type === 'success' ? 'text-green-400 font-bold' : ''}
                                    ${log.type === 'raw' ? 'text-[#64748b]' : ''}
                                `}>
                                    <span className="opacity-10 shrink-0 w-10 text-right tabular-nums select-none group-hover:opacity-30 transition-opacity">{i + 1}</span>
                                    <span className="w-full break-all">
                                        {log.type !== 'raw' && <span className="mr-3 text-[10px] font-black tracking-widest bg-current/10 px-2 py-0.5 rounded uppercase">[{log.type === 'info' ? 'INF' : log.type === 'success' ? 'OK' : log.type === 'error' ? 'ERR' : log.type}]</span>}
                                        {log.message}
                                    </span>
                                </div>
                            ))}
                            <div ref={logEndRef} className="h-8" />
                        </div>

                        {/* Loading progress bar inside console top */}
                        {isBusy && (
                            <div className="absolute top-[64px] left-0 right-0 h-[3px] bg-blue-500/10 overflow-hidden">
                                <div className="h-full bg-blue-500 animate-loading w-1/3"></div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="px-8 py-3 bg-[#0b1120] border-t border-[#1e293b] flex justify-between items-center text-[10px] text-[#64748b] font-medium uppercase tracking-widest z-20">
                <div>
                   Copyright © 2026 Nguyễn Duy Trường
                </div>
                <div className="flex items-center space-x-4">
                    <span>Engine: Wails v2</span>
                    <span className="text-blue-500/50">•</span>
                    <span>Runtime: {goVersion || 'Go'}</span>
                </div>
            </footer>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-10 right-10 px-8 py-5 rounded-[24px] shadow-2xl backdrop-blur-2xl border border-white/10 flex items-center space-x-4 animate-in slide-in-from-right-10 fade-in duration-500 z-50 ${
                    toast.type === 'success' ? 'bg-green-500/20 text-green-400' :
                    toast.type === 'error' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-600/20 text-blue-300'
                }`}>
                    <div className="w-2.5 h-2.5 rounded-full bg-current animate-pulse shadow-[0_0_12px_rgba(currentColor,0.5)]"></div>
                    <span className="font-extrabold text-[13px] tracking-tight">{toast.message}</span>
                </div>
            )}
        </div>
    );
}

export default App;
