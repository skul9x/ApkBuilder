import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// @ts-ignore
import { FixedSizeList as List } from 'react-window';

// @ts-ignore
import { GetLogcatDevices, StartLogcat, StopLogcat, ExportLogcat } from "../../../wailsjs/go/main/App";
// @ts-ignore
import { EventsOn } from "../../../wailsjs/runtime/runtime";

interface LogEntry {
    timestamp: string;
    pid: string;
    tid: string;
    level: string;
    tag: string;
    message: string;
}

const LEVEL_COLORS: Record<string, string> = {
    V: "text-[#f1f5f9]", 
    D: "text-[#60a5fa]", 
    I: "text-[#34d399]", 
    W: "text-[#fbbf24]", 
    E: "text-[#f87171]", 
    F: "text-[#f87171] font-bold bg-red-900/30", 
    U: "text-[#94a3b8]", 
};

const LOG_LEVELS = ['V', 'D', 'I', 'W', 'E'];

export default function LogcatViewer() {
    const [devices, setDevices] = useState<{id: string, state: string}[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<string>('');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // UI States
    const [autoScroll, setAutoScroll] = useState(true);
    const listRef = useRef<any>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLevel, setFilterLevel] = useState('V');
    
    const isPlayingRef = useRef(isPlaying);
    isPlayingRef.current = isPlaying;

    // Fetch Devices
    const fetchDevices = async () => {
        try {
            const result = await GetLogcatDevices();
            if (result) {
                // @ts-ignore
                setDevices(result);
                if (result.length > 0 && !selectedDevice) {
                    setSelectedDevice(result[0].id);
                }
            }
        } catch (e) {
            console.error("Error fetching devices", e);
        }
    };

    useEffect(() => {
        fetchDevices();
        const interval = setInterval(fetchDevices, 5000);
        return () => clearInterval(interval);
    }, []);

    // Wails Event Listener for incoming logs
    useEffect(() => {
        EventsOn("onNativeLog", (entry: LogEntry) => {
            if (isPlayingRef.current) {
                setLogs(prev => {
                    // Cắt mảng để tránh phình to quá 50,000 dòng gây chết JS Array
                    const next = [...prev, entry];
                    if (next.length > 50000) return next.slice(next.length - 40000);
                    return next;
                });
            }
        });
    }, []);

    const togglePlay = async () => {
        if (!isPlaying) {
            if (!selectedDevice) return;
            // Bắt đầu streaming
            setIsPlaying(true);
            await StartLogcat(selectedDevice);
        } else {
            // Tạm dừng
            setIsPlaying(false);
            await StopLogcat();
        }
    };

    const clearLogs = () => setLogs([]);

    const handleExport = async () => {
        if (filteredLogs.length === 0) return;
        
        const textContent = filteredLogs.map(log => 
            `${log.timestamp} ${log.level} ${log.pid}-${log.tid} ${log.tag}: ${log.message}`
        ).join('\n');
        
        try {
            // @ts-ignore
            const result = await ExportLogcat(textContent);
            alert(result);
        } catch (e) {
            console.error("Export error", e);
            alert("Lỗi khi xuất file log");
        }
    };

    // Logic lọc log trước khi Render
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            // Lọc theo level:
            // Theo chuẩn, Debug bao gồm cả Info, Warn, Error.. V là verbose tức là tất cả.
            const levelIdx = LOG_LEVELS.indexOf(log.level);
            const targetIdx = LOG_LEVELS.indexOf(filterLevel);
            if (targetIdx !== -1 && levelIdx !== -1 && levelIdx < targetIdx) {
                return false;
            }

            // Lọc chuỗi (Regex Query Mini) kiểu tag:Activity message:Hello
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                // Check prefix đơn giản
                if (query.includes('tag:')) {
                    const tagMatch = query.match(/tag:(\w+)/);
                    if (tagMatch && tagMatch[1]) {
                        if (!log.tag.toLowerCase().includes(tagMatch[1])) return false;
                    }
                }
                if (query.includes('message:')) {
                    const msgMatch = query.match(/message:(\w+)/);
                    if (msgMatch && msgMatch[1]) {
                        if (!log.message.toLowerCase().includes(msgMatch[1])) return false;
                    }
                }
                // Tìm kiếm chung (Full text search)
                if (!query.includes('tag:') && !query.includes('message:')) {
                    const fullText = `${log.tag} ${log.message} ${log.pid}`.toLowerCase();
                    if (!fullText.includes(query)) return false;
                }
            }

            return true;
        });
    }, [logs, filterLevel, searchQuery]);

    // Tự động cuộn xuống cuối khi có log mới
    useEffect(() => {
        if (autoScroll && listRef.current && filteredLogs.length > 0) {
            listRef.current.scrollToItem(filteredLogs.length - 1, "end");
        }
    }, [filteredLogs.length, autoScroll]);

    const handleScroll = ({ scrollDirection, scrollUpdateWasRequested }: any) => {
        if (scrollUpdateWasRequested) return; // Bỏ qua scroll do code gọi
        
        // Nếu user cuộn ngược lên, tắt auto-scroll để giữ vị trí
        if (scrollDirection === 'backward') {
            setAutoScroll(false);
        }
    };

    const Row = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
        const log = filteredLogs[index];
        const colorClass = LEVEL_COLORS[log.level] || LEVEL_COLORS['U'];

        return (
            <div style={style} className={`flex text-[13px] font-mono leading-[24px] hover:bg-[#1e293b]/50 border-b border-[#334155]/30 ${colorClass}`}>
                <div className="w-[120px] shrink-0 px-2 opacity-60 text-xs overflow-hidden text-ellipsis whitespace-nowrap">{log.timestamp}</div>
                <div className="w-[40px] shrink-0 px-2 text-center font-bold">{log.level}</div>
                <div className="w-[80px] shrink-0 px-2 opacity-70 text-right overflow-hidden overflow-ellipsis whitespace-nowrap">{log.pid}-{log.tid}</div>
                <div className="w-[180px] shrink-0 px-2 font-bold whitespace-nowrap overflow-hidden text-ellipsis" title={log.tag}>{log.tag}</div>
                <div className="flex-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis" title={log.message}>{log.message}</div>
            </div>
        );
    }, [filteredLogs]);


    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-[#f1f5f9] rounded-xl overflow-hidden shadow-2xl border border-white/5">
            {/* Top Toolbar */}
            <div className="flex items-center space-x-4 h-[48px] px-4 bg-[#1e293b]/80 backdrop-blur-md border-b border-[#334155]/50 shrink-0">
                <div className="flex items-center space-x-2">
                    <span className="text-xs uppercase font-bold text-[#94a3b8]">Device</span>
                    <select 
                        className="bg-white border border-[#334155] rounded text-sm px-2 py-1 outline-none focus:border-indigo-500 w-[200px] text-black font-medium"
                        value={selectedDevice}
                        onChange={(e) => setSelectedDevice(e.target.value)}
                    >
                        <option value="" className="bg-white text-black">-- Chọn máy --</option>
                        {devices.map(d => (
                            <option key={d.id} value={d.id} className="bg-white text-black">
                                {d.id} ({d.state})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="h-4 w-px bg-[#334155]"></div>

                <div className="flex items-center space-x-2">
                    <button 
                        onClick={togglePlay}
                        disabled={!selectedDevice}
                        className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-bold transition-all ${isPlaying ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-30'}`}
                    >
                        <span>{isPlaying ? '⏸ Pause' : '▶ Play'}</span>
                    </button>
                    
                    <button 
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-bold transition-all ${autoScroll ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-[#334155]/50 text-[#94a3b8] hover:bg-[#334155]'}`}
                        title="Tự động cuộn xuống cuối"
                    >
                        <span>{autoScroll ? '↓ Cuộn: Bật' : '↕ Cuộn: Tắt'}</span>
                    </button>

                    <button 
                        onClick={clearLogs}
                        className="flex items-center space-x-1 px-3 py-1 rounded text-sm font-bold bg-[#334155]/50 hover:bg-[#334155] text-[#94a3b8] transition-all"
                    >
                        <span>🗑 Clear</span>
                    </button>

                    <button 
                        onClick={handleExport}
                        className="flex items-center space-x-1 px-3 py-1 rounded text-sm font-bold bg-[#334155]/50 hover:bg-[#334155] text-[#94a3b8] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={filteredLogs.length === 0}
                    >
                        <span>💾 Export</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center space-x-2 h-[48px] px-4 bg-[#1e293b]/40 border-b border-[#334155]/50 shrink-0">
                <input 
                    type="text" 
                    placeholder="Search logs (e.g., tag:Activity message:Hello hoặc full text)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none text-sm outline-none placeholder-[#64748b] h-full text-white"
                />
                
                <div className="h-4 w-px bg-[#334155]"></div>
                
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-[#64748b]">Level:</span>
                    <select 
                        className="bg-white text-sm font-bold outline-none border-none cursor-pointer text-black px-2 py-1 rounded"
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                    >
                        <option value="V" className="bg-white text-black">Verbose</option>
                        <option value="D" className="bg-white text-black">Debug</option>
                        <option value="I" className="bg-white text-black">Info</option>
                        <option value="W" className="bg-white text-black">Warn</option>
                        <option value="E" className="bg-white text-black">Error</option>
                    </select>
                </div>
            </div>

            {/* Header Table Columns */}
            <div className="flex text-[11px] font-bold uppercase tracking-widest text-[#94a3b8] bg-[#1e293b]/20 border-b border-[#334155]/50 shrink-0">
                <div className="w-[120px] shrink-0 px-2 py-2">Time</div>
                <div className="w-[40px] shrink-0 px-2 py-2 text-center">Lvl</div>
                <div className="w-[80px] shrink-0 px-2 py-2 text-right">PID-TID</div>
                <div className="w-[180px] shrink-0 px-2 py-2">Tag</div>
                <div className="flex-1 px-2 py-2">Message</div>
            </div>

            {/* Virtualized List Area */}
            <div className="flex-1 overflow-hidden relative">
                {filteredLogs.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 text-sm">
                        <span className="text-4xl mb-4">🖥️</span>
                        <span>Không có log nào. Hãy chọn thiết bị và Play stream.</span>
                    </div>
                ) : (
                    <List
                        ref={listRef}
                        height={window.innerHeight - 300}
                        width="100%"
                        itemCount={filteredLogs.length}
                        itemSize={24}
                        onScroll={handleScroll}
                        className="scrollbar-thin scrollbar-thumb-slate-700"
                    >
                        {Row}
                    </List>
                )}
            </div>
        </div>
    );
}
