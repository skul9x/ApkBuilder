package config

import (
	"encoding/json"
	"os"
)

type Settings struct {
	LastProject string            `json:"last_project"`
	Projects    map[string]string `json:"projects"`
}

const SettingsFile = "builder_settings.json"

func Load() (*Settings, error) {
	if _, err := os.Stat(SettingsFile); os.IsNotExist(err) {
		return &Settings{Projects: make(map[string]string)}, nil
	}

	data, err := os.ReadFile(SettingsFile)
	if err != nil {
		return nil, err
	}

	var s Settings
	if err := json.Unmarshal(data, &s); err != nil {
		return nil, err
	}
	if s.Projects == nil {
		s.Projects = make(map[string]string)
	}
	return &s, nil
}

func (s *Settings) Save() error {
	data, err := json.MarshalIndent(s, "", "    ")
	if err != nil {
		return err
	}
	return os.WriteFile(SettingsFile, data, 0644)
}
