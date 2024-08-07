SHELL := /usr/bin/env bash
BIN := ./node_modules/.bin

.PHONY: dev
dev: node_modules
	bun run dev

.PHONY: check
check: node_modules
	bun run check

.PHONY: format
format: node_modules
	bun run format

node_modules:
	bun install --yarn

codegen:
	npx @wharfkit/cli generate -u https://eos.greymass.com -f src/lib/wharf/contracts/system.ts eosio
	npx @wharfkit/cli generate -u https://eos.greymass.com -f src/lib/wharf/contracts/token.ts eosio.token
	npx @wharfkit/cli generate -u https://eos.greymass.com -f src/lib/wharf/contracts/delphioracle.ts delphioracle