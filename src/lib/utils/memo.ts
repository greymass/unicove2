const suspiciousPatterns = [
	/https?:\/\//i,
	/www\./i,
	/\b[\w-]+\s*\.\s*(com|io|xyz|vip|net|org|co|app|site|link|click|one|win|top|info|biz|pro|me|cc|tv|gg|fun|live|shop|store|online|tech|dev|ai)\b/i,
	/\b[\w-]+\s*\[\s*\.\s*\]\s*[\w-]+/i,
	/\b[\w-]+\s*\(\s*dot\s*\)\s*[\w-]+/i,
	/\b[\w-]+\s*\(\s*\.\s*\)\s*[\w-]+/i,
	/claim\s+(your|free|now)/i,
	/free\s+(tokens?|airdrop|coins?)/i,
	/verify\s+(your\s+)?(wallet|account)/i,
	/connect\s+(your\s+)?wallet/i,
	/\bairdrop\b/i,
	/activate\s+(your\s+)?(wallet|account)/i,
	/unlock\s+(your\s+)?(tokens?|rewards?)/i,
	/eligib(le|ility)\s+(for|to)/i,
	/claim\s+reward/i
];

export function isSuspiciousMemo(memo: string): boolean {
	if (!memo || memo.trim().length === 0) {
		return false;
	}

	return suspiciousPatterns.some((pattern) => pattern.test(memo));
}
