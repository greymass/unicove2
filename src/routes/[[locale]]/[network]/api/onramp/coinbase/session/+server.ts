import { json, error as svelteKitError } from '@sveltejs/kit';
import * as jose from 'jose';
import type { RequestHandler } from './$types';
import { COINBASE_API_KEY_NAME, COINBASE_API_KEY_SECRET } from '$env/static/private';
import { randomBytes } from 'crypto';

const ONRAMP_TOKEN_HOST = 'api.developer.coinbase.com';
const ONRAMP_TOKEN_PATH = '/onramp/v1/token';

// We are manually generating the JWT instead of using the cdp-sdk as the latter includes a ton of unnecessary dependencies
async function generateCoinbaseJwt() {
	const decodedSecret = Buffer.from(COINBASE_API_KEY_SECRET, 'base64');
	if (decodedSecret.length !== 64) {
		throw new Error(
			'Invalid Coinbase API Secret length. Expected 64 bytes, but got ' + decodedSecret.length
		);
	}
	const privateKey = decodedSecret.subarray(0, 32);
	const publicKey = decodedSecret.subarray(32, 64);

	const jwk = {
		crv: 'Ed25519',
		kty: 'OKP',
		d: privateKey.toString('base64url'),
		x: publicKey.toString('base64url')
	};

	const signingKey = await jose.importJWK(jwk, 'EdDSA');

	const uri = `POST ${ONRAMP_TOKEN_HOST}${ONRAMP_TOKEN_PATH}`;

	const nonce = randomBytes(16).toString('hex');

	const jwt = await new jose.SignJWT({
		sub: COINBASE_API_KEY_NAME,
		iss: 'cdp',
		uri: uri
	})
		.setProtectedHeader({
			alg: 'EdDSA',
			typ: 'JWT',
			kid: COINBASE_API_KEY_NAME,
			nonce: nonce
		})
		.setIssuedAt()
		.setExpirationTime('2m') // Token is valid for 2 minutes
		.setNotBefore('0s')
		.sign(signingKey);

	return jwt;
}

export const POST: RequestHandler = async ({ request }) => {
	const { address, assets } = await request.json();

	if (!address || !assets) {
		throw svelteKitError(400, 'Address and assets are required');
	}

	if (!COINBASE_API_KEY_NAME || !COINBASE_API_KEY_SECRET) {
		console.error('Coinbase API credentials are not set in .env');
		throw svelteKitError(500, 'On-ramp service is not configured correctly.');
	}

	try {
		const jwt = await generateCoinbaseJwt();

		const response = await fetch(`https://${ONRAMP_TOKEN_HOST}${ONRAMP_TOKEN_PATH}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${jwt}`
			},
			body: JSON.stringify({
				addresses: [
					{
						address: address,
						blockchains: ['eosio'] // Encompasses all unicove supported chains
					}
				],
				assets: assets,
				clientIp: request.headers.get('CF-Connecting-IP')
			})
		});

		if (!response.ok) {
			const errorBody = await response.text();
			console.error('Failed to get session token from Coinbase:', response.status, errorBody);
			throw svelteKitError(502, 'Failed to communicate with the on-ramp provider.');
		}

		const responseData = await response.json();
		const sessionToken = responseData.token;

		const results = json({ token: sessionToken });
		results.headers.set('Access-Control-Allow-Origin', 'https://*.unicove.com');
		results.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		results.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		return results;
	} catch (e) {
		console.error('Error generating Coinbase session token:', e);
		throw svelteKitError(500, 'An unexpected error occurred.');
	}
};
