import { browser } from '$app/environment';
import type { ActionDisplayVariants } from '$lib/types';
import { SupportedCurrencies } from '$lib/types/currencies';
import { locales } from 'virtual:wuchale/locales';

export enum SettingKeys {
	'actionDisplayVariant' = 'actionDisplayVariant',
	'debugMode' = 'debugMode',
	'developerMode' = 'developerMode',
	'increasedPrecision' = 'increasedPrecision',
	'locale' = 'locale',
	'mockPrice' = 'mockPrice',
	'preventAccountPageSwitching' = 'preventAccountPageSwitching',
	'searchAccountSwitch' = 'searchAccountSwitch',
	'searchShowPages' = 'searchShowPages',
	'showApprovedProposals' = 'showApprovedProposals',
	'warnSuspiciousMemos' = 'warnSuspiciousMemos'
}

export enum TimeSeconds {
	'1m' = 60,
	'5m' = 300,
	'10m' = 600,
	'15m' = 900,
	'30m' = 1800,
	'1h' = 3600,
	'2h' = 7200,
	'4h' = 14400,
	'8h' = 28800,
	'12h' = 43200,
	'1d' = 86400,
	'2d' = 172800,
	'3d' = 259200,
	'1w' = 604800,
	'2w' = 1209600,
	'1mo' = 2592000,
	'3mo' = 7776000,
	'6mo' = 15552000,
	'1y' = 31536000
}

export interface SettingsData {
	actionDisplayVariant?: ActionDisplayVariants;
	displayCurrency: SupportedCurrencies;
	debugMode?: boolean;
	developerMode?: boolean;
	increasedPrecision?: boolean;
	locale: string;
	mockPrice?: boolean;
	preventAccountPageSwitching?: boolean;
	searchAccountSwitch?: boolean;
	searchShowPages?: boolean;
	showApprovedProposals?: boolean;
	warnSuspiciousMemos?: boolean;
}

function getDefaultLocale() {
	let defaultLocale = 'en';
	if (browser) {
		const fromNavigator = navigator.language.split('-')[0];
		if (locales.includes(fromNavigator)) {
			defaultLocale = fromNavigator;
		}
	}
	return defaultLocale;
}

const defaultSettings: SettingsData = {
	actionDisplayVariant: 'table',
	displayCurrency: SupportedCurrencies.USD,
	debugMode: false,
	developerMode: false,
	increasedPrecision: false,
	locale: getDefaultLocale(),
	mockPrice: false,
	preventAccountPageSwitching: false,
	searchAccountSwitch: false,
	searchShowPages: true,
	showApprovedProposals: false,
	warnSuspiciousMemos: true
};

export class SettingsState {
	data = $state<SettingsData>(defaultSettings);

	constructor() {
		if (browser) {
			const item = localStorage.getItem('unicove-settings');
			if (item)
				this.data = {
					...defaultSettings,
					...this.deserialize(item)
				};
		}
		$effect(() => {
			localStorage.setItem('unicove-settings', this.serialize(this.data));
		});
	}

	get<T>(key: SettingKeys, value: T) {
		const keyName = key as keyof SettingsData;
		if (!this.data[keyName]) {
			return value;
		}
		return this.data[keyName] as T;
	}

	serialize(data: SettingsData): string {
		return JSON.stringify(data);
	}

	deserialize(item: string): SettingsData {
		return JSON.parse(item);
	}
}
