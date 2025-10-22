import { ParseKeys } from "i18next";

// keymap containing information about available hotkeys
type HotkeyMapType = {
	[key: string]: {
		[key: string]: {
			name: string,
			description: ParseKeys,
			sequence: string[],
		}
	}
}

export const availableHotkeys: HotkeyMapType = {
	general: {
		HOTKEY_CHEATSHEET: {
			name: "hotkey_cheatsheet",
			description: "HOTKEYS.DESCRIPTIONS.GENERAL.CHEAT_SHEET",
			sequence: ["h"],
		},
		EVENT_VIEW: {
			name: "event_view",
			description: "HOTKEYS.DESCRIPTIONS.GENERAL.EVENT_VIEW",
			sequence: ["e"],
		},
		SERIES_VIEW: {
			name: "series_view",
			description: "HOTKEYS.DESCRIPTIONS.GENERAL.SERIES_VIEW",
			sequence: ["s"],
		},
		NEW_EVENT: {
			name: "new_event",
			description: "HOTKEYS.DESCRIPTIONS.GENERAL.NEW_EVENT",
			sequence: ["n"],
		},
		NEW_SERIES: {
			name: "new_series",
			description: "HOTKEYS.DESCRIPTIONS.GENERAL.NEW_SERIES",
			sequence: ["j"],
		},
		MAIN_MENU: {
			name: "main_menu",
			description: "HOTKEYS.DESCRIPTIONS.GENERAL.MAIN_MENU",
			sequence: ["m"],
		},
		/* NEXT_DASHBOARD_FILTER: {
            name: 'select_next_dashboard_filter',
            description: 'HOTKEYS.DESCRIPTIONS.GENERAL.SELECT_NEXT_DASHBOARD_FILTER',
            combo: ['f'],
            sequence: 'f',
            action: 'keyup',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA']
        },
        PREVIOUS_DASHBOARD_FILTER: {
            name: 'select_previous_dashboard_filter',
            description: 'HOTKEYS.DESCRIPTIONS.GENERAL.SELECT_PREVIOUS_DASHBOARD_FILTER',
            combo: ['F'],
            sequence: 'F',
            action: 'keyup',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA']
        },*/
		NEXT_PANEL: {
    		name: "next_step",
    		description: "HOTKEYS.DESCRIPTIONS.GENERAL.NEXT_PANEL",
    		sequence: ["alt+enter"], // Alt + Enter moves forward
  		},
  		PREVIOUS_PANEL: {
    		name: "previous_step",
    		description: "HOTKEYS.DESCRIPTIONS.GENERAL.PREVIOUS_PANEL",
    		sequence: ["alt+backspace"], // Alt + Backspace moves backward
  		},
		REMOVE_FILTERS: {
			name: "remove_filters",
			description: "HOTKEYS.DESCRIPTIONS.GENERAL.REMOVE_FILTERS",
			sequence: ["r"],
		},
		CLOSE_MODAL: {
			name: "close_modal",
			description: "HOTKEYS.DESCRIPTIONS.GENERAL.CLOSE_MODAL",
			sequence: ["Esc"],
		},
	},
};
