// Plain .ts on purpose: wuchale extracts only from .svelte/.svelte.ts, so prototype strings stay out of the locale files.

export type LocaleKey = 'en' | 'ko' | 'zh';

export interface Disclosure {
	/** Short answer, always visible in the collapsed state. */
	answer: string;
	/** The question the row is answering, for accessible labelling. */
	label: string;
	/** Expanded detail. */
	detail: string;
	/** The clause as it reads inside variant C's sentence. */
	clause: string;
}

export interface Copy {
	heading: string;
	reassurance: string;
	create: string;
	creating: string;
	ownWallet: string;
	failure: string;
	specimenCaption: string;
	cardIssuer: string;
	cardNameField: string;
	cardCreatedField: string;
	sentenceLead: string;
	clauseSeparator: string;
	sentenceTail: string;
	disclosures: Disclosure[];
}

const en: Copy = {
	heading: 'Get a Vaulta account.',
	reassurance:
		'One click, nothing to install, and you come straight back here with your account ready to use.',
	create: 'Create account',
	creating: 'Waiting for Anchor',
	ownWallet: 'Prefer your own wallet?',
	failure: 'The popup closed before an account was created. You can try again at any time.',
	specimenCaption: 'A name you can read, not an address you have to copy.',
	cardIssuer: 'Vaulta',
	cardNameField: 'your name here',
	cardCreatedField: 'created',
	sentenceLead: 'Creating a Vaulta account is ',
	clauseSeparator: ',\u00a0',
	sentenceTail: '.',
	disclosures: [
		{
			label: 'What does it cost?',
			answer: 'Free',
			clause: 'free',
			detail:
				'Nothing, to you. A new account needs network resources to exist, and Unicove covers that cost so you can start using Vaulta straight away.'
		},
		{
			label: 'What do I need first?',
			answer: 'Nothing installed',
			clause: 'needs nothing installed',
			detail:
				'No wallet, no browser extension, no seed phrase to write down. A device you can unlock and the browser you are already using is the whole list.'
		},
		{
			label: 'Who holds my keys?',
			answer: 'You do',
			clause: 'keeps your keys on your device',
			detail:
				'Your account is secured by a passkey created on this device and held by you. Unicove never sees it, and cannot move anything on your behalf.'
		},
		{
			label: 'What can I do after?',
			answer: 'Send, stake, vote, explore',
			clause: 'and takes about ten seconds',
			detail:
				'Send and receive tokens, stake for rewards, vote on the network, and sign in to apps built on Vaulta, all from this account.'
		}
	]
};

const ko: Copy = {
	heading: 'Vaulta 계정을 만드세요.',
	reassurance:
		'클릭 한 번이면 됩니다. 설치할 것도 없고, 계정이 준비된 상태로 곧바로 이 페이지로 돌아옵니다.',
	create: '계정 만들기',
	creating: 'Anchor를 기다리는 중',
	ownWallet: '직접 사용하는 지갑이 있으신가요?',
	failure: '계정이 생성되기 전에 팝업이 닫혔습니다. 언제든지 다시 시도할 수 있습니다.',
	specimenCaption: '복사해야 하는 주소가 아니라, 읽을 수 있는 이름입니다.',
	cardIssuer: 'Vaulta',
	cardNameField: '여기에 이름',
	cardCreatedField: '생성일',
	sentenceLead: 'Vaulta 계정 만들기는 ',
	clauseSeparator: ',\u00a0',
	sentenceTail: '.',
	disclosures: [
		{
			label: '비용이 얼마인가요?',
			answer: '무료',
			clause: '무료이고',
			detail:
				'사용자에게는 비용이 없습니다. 새 계정에는 네트워크 자원이 필요하지만 Unicove가 그 비용을 부담하므로 바로 Vaulta를 사용할 수 있습니다.'
		},
		{
			label: '먼저 준비할 것이 있나요?',
			answer: '설치 불필요',
			clause: '설치가 필요 없으며',
			detail:
				'지갑도, 브라우저 확장 프로그램도, 적어 두어야 할 시드 문구도 필요 없습니다. 잠금을 해제할 수 있는 기기와 지금 사용 중인 브라우저면 충분합니다.'
		},
		{
			label: '키는 누가 보관하나요?',
			answer: '본인이 보관합니다',
			clause: '키는 기기에 남고',
			detail:
				'계정은 이 기기에서 생성된 패스키로 보호되며 본인이 보관합니다. Unicove는 이를 볼 수 없고, 대신 자산을 옮길 수도 없습니다.'
		},
		{
			label: '그다음에는 무엇을 할 수 있나요?',
			answer: '전송, 스테이킹, 투표, 탐색',
			clause: '10초 정도 걸립니다',
			detail:
				'토큰을 보내고 받고, 스테이킹으로 보상을 받고, 네트워크 투표에 참여하고, Vaulta 위에 구축된 앱에 로그인할 수 있습니다.'
		}
	]
};

const zh: Copy = {
	heading: '创建你的 Vaulta 账户。',
	reassurance: '只需点击一次，无需安装任何东西，账户创建完成后会立即回到本页面。',
	create: '创建账户',
	creating: '正在等待 Anchor',
	ownWallet: '想使用自己的钱包？',
	failure: '弹出窗口在账户创建完成前被关闭。你可以随时重试。',
	specimenCaption: '一个可以读出来的名字，而不是需要复制的地址。',
	cardIssuer: 'Vaulta',
	cardNameField: '你的名字',
	cardCreatedField: '创建于',
	sentenceLead: '创建 Vaulta 账户是',
	clauseSeparator: '，',
	sentenceTail: '。',
	disclosures: [
		{
			label: '需要多少费用？',
			answer: '免费',
			clause: '免费的',
			detail:
				'对你而言没有任何费用。新账户需要占用网络资源，这部分成本由 Unicove 承担，你可以直接开始使用 Vaulta。'
		},
		{
			label: '需要先准备什么？',
			answer: '无需安装',
			clause: '无需安装任何东西',
			detail:
				'不需要钱包，不需要浏览器扩展，也不需要抄写助记词。你只需要一台能解锁的设备，以及正在使用的这个浏览器。'
		},
		{
			label: '谁持有我的密钥？',
			answer: '你自己',
			clause: '密钥保存在你的设备上',
			detail:
				'你的账户由本设备上创建的通行密钥保护，并由你自己持有。Unicove 无法看到它，也无法代你转移任何资产。'
		},
		{
			label: '创建之后能做什么？',
			answer: '转账、质押、投票、浏览',
			clause: '大约需要十秒',
			detail:
				'收发代币、质押获取奖励、参与网络投票，以及登录基于 Vaulta 构建的应用，全部通过这一个账户完成。'
		}
	]
};

export const copyByLocale: Record<LocaleKey, Copy> = { en, ko, zh };

/** 12 characters, all valid Antelope name glyphs. */
export const SPECIMEN_NAME = 'yournamehere';

export const harness = {
	title: 'Fork A prototype: the account front door',
	subtitle: 'Ticket 13. Dev only. Not linked from anywhere.',
	variant: 'Variant',
	variants: [
		{ key: 'a', label: 'A. The Name' },
		{ key: 'b', label: 'B. The Blank Card' },
		{ key: 'c', label: 'C. The Sentence' }
	],
	locale: 'Locale',
	locales: [
		{ key: 'en', label: 'EN' },
		{ key: 'ko', label: 'KO' },
		{ key: 'zh', label: 'ZH' }
	],
	width: 'Width',
	widths: [
		{ key: 'wide', label: 'Desktop' },
		{ key: 'narrow', label: 'Mobile 390' }
	],
	phase: 'State',
	phases: [
		{ key: 'idle', label: 'Idle' },
		{ key: 'creating', label: 'Creating' },
		{ key: 'failed', label: 'Failed' }
	],
	allOpen: 'All rows open',
	live: 'Wire the real Anchor popup'
} as const;
