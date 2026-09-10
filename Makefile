include .env
-include .env.local
-include .env.development
-include .env.production

SHELL := /usr/bin/env bash
BIN := ./node_modules/.bin

ENVS=./scripts/env
CONTRACTS=./src/lib/wharf/contracts
CODEX_MODEL ?= gpt-5.6-luna
CODEX_REASONING ?= low

.PHONY: dev
dev: node_modules codegen
	bun run dev --host 

.PHONY: check
check: node_modules codegen
	bun run check && bun run lint

.PHONY: format
format: node_modules
	bun run format

.PHONY: install
install: node_modules
	@if [ -z "$(package)" ]; then \
		echo "Installing all dependencies:"; \
		bun install --frozen-lockfile; \
	else \
		echo "Installing package: $(package)"; \
		bun install --frozen-lockfile $(package); \
	fi

.PHONY: node_modules
node_modules:
	bun install --frozen-lockfile

.PHONY: translate
translate: node_modules
	@command -v codex >/dev/null 2>&1 || { \
		echo "Codex CLI is required. Install it, then run 'codex login'."; \
		exit 1; \
	}
	@codex login status >/dev/null 2>&1 || { \
		echo "Codex CLI is not authenticated. Run 'codex login' and try again."; \
		exit 1; \
	}
	WUCHALE_AI=codex \
	WUCHALE_CODEX_MODEL="$(CODEX_MODEL)" \
	WUCHALE_CODEX_REASONING="$(CODEX_REASONING)" \
	bunx wuchale

.PHONY: build
build: node_modules codegen
	bun run build

.PHONY: build/docker
build/docker: node_modules codegen
	bun run build-docker

$(CONTRACTS)/system.ts:
	$(BIN)/wharfkit generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/system.ts eosio

$(CONTRACTS)/token.ts:
	$(BIN)/wharfkit generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/token.ts eosio.token

$(CONTRACTS)/msig.ts:
	$(BIN)/wharfkit generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/msig.ts eosio.msig

$(CONTRACTS)/eosio.reserv.ts:
ifeq ($(PUBLIC_FEATURE_POWERUP),true)
	$(BIN)/wharfkit generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/eosio.reserv.ts eosio.reserv
else
	cp ./configs/contracts/eosio.reserv.ts $(CONTRACTS)/eosio.reserv.ts
endif	

$(CONTRACTS)/delphihelper.ts:
ifeq ($(PUBLIC_FEATURE_DELPHIHELPER),true)
	$(BIN)/wharfkit generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/delphihelper.ts delphihelper
else
	cp ./configs/contracts/delphihelper.ts $(CONTRACTS)/delphihelper.ts
endif

$(CONTRACTS)/delphioracle.ts:
ifeq ($(PUBLIC_FEATURE_DELPHIORACLE),true)
	$(BIN)/wharfkit generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/delphioracle.ts delphioracle
else
	cp ./configs/contracts/delphioracle.ts $(CONTRACTS)/delphioracle.ts
endif

$(CONTRACTS)/unicove.api.ts:
ifeq ($(PUBLIC_FEATURE_UNICOVE_CONTRACT_API),)
	cp ./configs/contracts/unicove.api.ts $(CONTRACTS)/unicove.api.ts
else
	$(BIN)/wharfkit generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/unicove.api.ts $(PUBLIC_FEATURE_UNICOVE_CONTRACT_API)
endif

$(CONTRACTS)/core.vaulta.ts:
ifeq ($(PUBLIC_FEATURE_VAULTA_CORE_CONTRACT),)
	cp ./configs/contracts/core.vaulta.ts $(CONTRACTS)/core.vaulta.ts
else
	$(BIN)/wharfkit generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/core.vaulta.ts $(PUBLIC_FEATURE_VAULTA_CORE_CONTRACT)
endif

$(CONTRACTS)/eosntime.ts:
ifeq ($(PUBLIC_FEATURE_EOSNTIME),true)
	$(BIN)/wharfkit generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/eosntime.ts time.eosn
else
	cp ./configs/contracts/eosntime.ts $(CONTRACTS)/eosntime.ts
endif

$(CONTRACTS)/eosio.wram.ts:
ifeq ($(PUBLIC_FEATURE_WRAM),true)
	$(BIN)/wharfkit generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/eosio.wram.ts eosio.wram
else
	cp ./configs/contracts/eosio.wram.ts $(CONTRACTS)/eosio.wram.ts
endif

$(CONTRACTS)/eosio.rex.ts:
ifeq ($(PUBLIC_FEATURE_WRAM),true)
	$(BIN)/wharfkit generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/eosio.rex.ts eosio.rex
else
	cp ./configs/contracts/eosio.rex.ts $(CONTRACTS)/eosio.rex.ts
endif

$(CONTRACTS)/sentiment.ts:
ifeq ($(PUBLIC_FEATURE_SENTIMENT),true)
	$(BIN)/wharfkit generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/sentiment.ts $(PUBLIC_FEATURE_SENTIMENT_CONTRACT)
else
	cp ./configs/contracts/sentiment.ts $(CONTRACTS)/sentiment.ts
endif

$(CONTRACTS)/create.gm.ts:
ifneq ($(PUBLIC_FEATURE_CREATE_CONTRACT),)
	$(BIN)/wharfkit generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/create.gm.ts $(PUBLIC_FEATURE_CREATE_CONTRACT)
else
	cp ./configs/contracts/create.gm.ts $(CONTRACTS)/create.gm.ts
endif

FORUM_CONTRACT = forum.$(lastword $(subst ., ,$(PUBLIC_FEATURE_DISCUSSION_CONTRACT)))

$(CONTRACTS)/msg.ts:
ifeq ($(PUBLIC_FEATURE_DISCUSSION),true)
	$(BIN)/wharfkit generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/msg.ts $(PUBLIC_FEATURE_DISCUSSION_CONTRACT)
else
	cp ./configs/contracts/msg.ts $(CONTRACTS)/msg.ts
endif

$(CONTRACTS)/forum.ts:
ifeq ($(PUBLIC_FEATURE_DISCUSSION),true)
	$(BIN)/wharfkit generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/forum.ts $(FORUM_CONTRACT)
else
	cp ./configs/contracts/forum.ts $(CONTRACTS)/forum.ts
endif

codegen: $(CONTRACTS)/system.ts $(CONTRACTS)/token.ts $(CONTRACTS)/msig.ts $(CONTRACTS)/eosio.wram.ts $(CONTRACTS)/eosio.reserv.ts $(CONTRACTS)/eosio.rex.ts $(CONTRACTS)/delphihelper.ts $(CONTRACTS)/delphioracle.ts $(CONTRACTS)/unicove.api.ts $(CONTRACTS)/eosntime.ts $(CONTRACTS)/core.vaulta.ts $(CONTRACTS)/sentiment.ts $(CONTRACTS)/create.gm.ts $(CONTRACTS)/msg.ts $(CONTRACTS)/forum.ts
	mkdir -p $(CONTRACTS)

.PHONY: codegen/base
codegen/base:
	$(BIN)/wharfkit generate -u https://eos.greymass.com -f ./configs/contracts/delphihelper.ts delphihelper
	$(BIN)/wharfkit generate -u https://eos.greymass.com -f ./configs/contracts/delphioracle.ts delphioracle
	$(BIN)/wharfkit generate -u https://eos.greymass.com -f ./configs/contracts/eosntime.ts time.eosn
	$(BIN)/wharfkit generate -u https://jungle4.greymass.com -f ./configs/contracts/core.vaulta.ts core.vaulta
	$(BIN)/wharfkit generate -u $(PUBLIC_API_CHAIN) -f ./configs/contracts/unicove.api.ts $(PUBLIC_FEATURE_UNICOVE_CONTRACT_API)
	$(BIN)/wharfkit generate -u https://eos.greymass.com -f ./configs/contracts/eosio.rex.ts eosio.rex
	$(BIN)/wharfkit generate -u https://eos.greymass.com -f ./configs/contracts/eosio.wram.ts eosio.wram
	$(BIN)/wharfkit generate -u https://jungle4.greymass.com -f ./configs/contracts/sentiment.ts sentiment.gm
	$(BIN)/wharfkit generate -u https://jungle4.greymass.com -f ./configs/contracts/create.gm.ts create.gm
	$(BIN)/wharfkit generate -u https://vaulta.greymass.com -f ./configs/contracts/msg.ts msg
	$(BIN)/wharfkit generate -u https://vaulta.greymass.com -f ./configs/contracts/forum.ts forum.msg
	make format

.PHONY: clean
clean: codegen/clean clean/node_modules clean/sveltekit

.PHONY: clean/node_modules
clean/node_modules:
	rm -rf node_modules

.PHONY: clean/sveltekit
clean/sveltekit:
	rm -rf .svelte-kit

.PHONY: codegen/clean
codegen/clean:
	rm -rf $(CONTRACTS)/*.ts

config/jungle4: codegen/clean
	$(ENVS)/merge-env.sh ./configs/.env.jungle4 .env.local

config/kylin: codegen/clean
	$(ENVS)/merge-env.sh ./configs/.env.kylin .env.local

config/telos: codegen/clean
	$(ENVS)/merge-env.sh ./configs/.env.telos .env.local

config/telostestnet: codegen/clean
	$(ENVS)/merge-env.sh ./configs/.env.telostestnet .env.local

config/vaulta: codegen/clean
	$(ENVS)/merge-env.sh ./configs/.env.vaulta .env.local

config/wax: codegen/clean
	$(ENVS)/merge-env.sh ./configs/.env.wax .env.local

config/waxtestnet: codegen/clean
	$(ENVS)/merge-env.sh ./configs/.env.waxtestnet .env.local
