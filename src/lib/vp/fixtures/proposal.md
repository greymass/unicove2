---
vp: VP-0001
title: Network RAM Endowment for Account Onboarding
standard: VPS-1
status: Draft
authors:
    - Aaron Cox (Greymass)
created: 2026-08-02
accounts:
    - ram.vaulta
    - admin.grants
    - fund.wram
    - eosio.wrap
    - eosio
msigs: []
sentiment: []
requires: []
---

# Network RAM Endowment for Account Onboarding
[English](proposal.md) | [한국어](proposal.ko.md) | [中文](proposal.zh.md)

## Summary

A network-owned account (`ram.vaulta`) holds a RAM endowment sourced from existing network RAM holdings and allows approved creators to gift RAM to newly created accounts. Creators onboard new users (free or paid) without carrying the RAM cost themselves, funding creator sustainability through usage of network RAM rather than its sale. Gifted RAM is permanently sequestered from the RAM market: recipients cannot sell or transfer it, and its only exit is a return to the gifting account. This proposal creates the system only: it launches with no registered creators, and each creator is admitted afterward by its own 15/21 BP MSIG.

## Rationale

- **Onboarding**: Account creation cost is a barrier to bringing new users onto Vaulta. The network holds substantial idle RAM (e.g. `fund.wram` alone holds about 42.08 GiB of idle RAM, `ram_quota` 45,181,400,197 bytes with 3,120 used, as of 2026-08-08) that can be put to work creating accounts.
- **Creator funding**: Onboarding services registered as creators may sell account creation and keep 100% of the proceeds. The network pays nothing directly; its return is user growth. Because the RAM cost is covered by the endowment, the sale price is creator margin.
- **Market neutrality**: The program uses the `giftram` mechanism, so endowed RAM can never re-enter the Bancor pool through recipients. The program spends RAM on growth without selling RAM.
- **Bounded self-dealing, not zero profit**: Gifted RAM cannot be resold into the Bancor pool by anyone, creator or recipient, so mass account creation cannot be turned into token profit. It remains usable as storage: a creator can direct its daily quota into accounts it controls and accrue free, network-funded state, bounded per creator at the daily quota and irreversible once the RAM is occupied. The quota caps the rate of this drain; it does not make the RAM valueless.

## Mechanics

### Account and authority

- `ram.vaulta` is created via BP MSIG (15/21), following the same pattern as other `*.vaulta` accounts (see [VP-0002](../vp-0002-account-creation/proposal.md)).
- `owner`/`active` are held by network governance. `active` includes `ram.vaulta@eosio.code` so the contract can send inline `giftram` under its own authority.
- Creators are not present in the account's native permissions. They are rows in a contract registry table, managed by MSIG through admin actions.

### Contract interface

| Action | Auth | Purpose |
|---|---|---|
| `giftacct(creator, account, bytes, memo)` | `creator` | Verify registry membership, require that `account` is created by `eosio::newaccount` in the same transaction, check and debit the creator's daily byte quota, send inline `eosio::giftram(ram.vaulta, account, bytes)` |
| `addcreator(creator, daily_quota_bytes)` | `ram.vaulta` (MSIG) | Register a creator with a daily quota |
| `rmcreator(creator)` | `ram.vaulta` (MSIG) | Remove a creator |
| `setquota(creator, daily_quota_bytes)` | `ram.vaulta` (MSIG) | Adjust a creator's quota |

Field names above are the deployed ABI's field names. Registry row: creator account, daily quota (bytes), bytes used in the current window, window start. There is no per-gift cap; the daily quota bounds total spend, and the creator chooses the per-account amount. Each gift debits the quota by the gifted bytes **plus the 136-byte `giftedram` row overhead** the gifting account is billed per giftee (confirmed on Vaulta mainnet in transaction `f2c6200c1add5ffc74837bcae1731ff5a66e259376eee6a4d4d7580f044a0b4c`, where a 3,000-byte gift billed exactly 136 bytes of row overhead to the gifter; the same constant appeared in Jungle 4 testing as 4,000 + 136 = 4,136), so the quota bounds actual endowment consumption, not just the nominal gift sizes.

Quota window semantics, stated precisely because they bound the abuse math:

- The 24-hour window is a lazy sliding window: it starts at the first gift after a reset and resets on the first gift at least 24 hours later, rather than at a fixed daily boundary. A creator can therefore spend a full quota late in one window and another full quota just after it rolls, so the worst-case short-term burst is about 2x the daily quota.
- There is no global cap across creators. The aggregate worst-case drain rate is the sum of all registered creators' daily quotas, and it grows only when BPs approve a new creator or a quota increase, since both are 15/21 actions.
- Removing a creator and re-registering it resets its used bytes for the current window; `setquota` adjusts the quota without resetting usage.

### Default quota

The default daily quota for a newly admitted creator is **1 MB/day**, roughly 300 small accounts per day at ~3 KB each plus the 136-byte per-gift overhead. The figure is provisional: it should be tuned against observed creation volume from active creator accounts (for example `gm`) before and after launch, and any change is itself a 15/21 `setquota` decision.

### Becoming a creator

The program launches with zero registered creators, and admission is deliberately minimal: becoming a creator requires exactly one thing, a passed 15/21 BP MSIG carrying `addcreator(creator, daily_quota_bytes)`. An application should publish, wherever the applicant chooses to publish it:

- the account to be registered,
- who operates it and what products or flows will use the allocation,
- the requested daily quota (the default is 1 MB/day).

Filing a proposal in this repository is an optional, more formal application path: it gives BPs a reviewable, permanent document with sentiment tracking, and may help an application's odds. It is not a requirement. An applicant who can pass the `addcreator` MSIG without it is welcome to do so.

### Usage pattern

A creator creates an account in a single transaction with a single signature:

1. `eosio::newaccount`: creator is the registered creator's account (e.g. `gm` creating `foo.gm`; premium-suffix rules apply as normal).
2. `ram.vaulta::giftacct(creator, foo.gm, bytes, memo)`: the contract sends the inline `giftram`.

This is verified against the system contracts and Spring source:

- `giftram` requires only the gifter's authority ([`delegate_bandwidth.cpp`](https://github.com/VaultaFoundation/system-contracts/blob/9edc8bcfd128f382ae11b88655d958d07f5230d2/contracts/eosio.system/src/delegate_bandwidth.cpp#L164-L165)), satisfied inline via `eosio.code`. The network account never signs.
- `giftram` checks the recipient exists at execution time; `newaccount` runs first in the same transaction.
- The contract enforces this pairing: `giftacct` reads the packed transaction (`read_transaction`) and rejects unless a top-level `eosio::newaccount` creating `account` is present. Gifts are structurally impossible outside account creation.
- New-account RAM billing is validated at end of transaction (Spring [`transaction_context::finalize`](https://github.com/AntelopeIO/spring/blob/e6a99f68b67abc4d89fe716755b2e1394a4991f7/libraries/chain/transaction_context.cpp#L386-L409)), so the inline gift covers the new account's footprint; this is the same mechanism the classic `newaccount` + `buyrambytes` pattern relies on. Accounts also receive the system's standard 1,400 free bytes ([`ram_gift_bytes`](https://github.com/VaultaFoundation/system-contracts/blob/9edc8bcfd128f382ae11b88655d958d07f5230d2/contracts/eosio.system/include/eosio.system/eosio.system.hpp#L75)) once they hold any RAM, which the gift itself triggers, reducing the gift size needed.

### Endowment

- **Seed**: 1–2 GB transferred from `admin.grants` via `ramtransfer` (≈300,000+ small accounts at ~3 KB each). `admin.grants` has previously distributed RAM, so this path is proven. Note the ratio: `admin.grants` holds `ram_quota` 2,812,891,144 bytes (about 2.62 GiB) as of 2026-08-08, so a 2 GB seed is a large fraction of that account's entire balance.
- **Long-term reserve**: `fund.wram` (about 42.08 GiB, idle, as of 2026-08-08) is named as the intended future source, to be tapped by a subsequent MSIG once the program has a track record. Nothing in the contract depends on the RAM's origin.

### Abuse handling

- **Quota as first line**: The per-creator daily byte quota bounds drain rate and caps self-dealing (a creator supplying RAM to accounts it controls) at that rate. Because the quota debits the per-giftee row overhead as well as the gift itself, many tiny gifts cannot drain the endowment faster than the quota implies. Abuse surfaces as visible on-chain drift within a detection window rather than an overnight drain.
- **No griefing via the program**: The single-gifter rule means a 1-byte gift blocks an account from receiving gifted RAM from anyone else. Since `giftacct` only reaches accounts created in the same transaction, the program cannot be used to grief pre-existing accounts. The equivalent vector through a direct `eosio::giftram` remains a system-contract concern, out of scope here.
- **Compromised creator keys**: The immediate remedy is the creator's own: rotating its keys evicts the attacker at once, with no governance involvement, and its registration survives intact. No contract action is needed or provided for this case.
- **Creator removal**: A malicious or defunct creator is removed (or has its quota zeroed) by 15/21 MSIG via `rmcreator`/`setquota`, and assembling 15 of 21 BP signatures takes days, not minutes. The exposure while the MSIG assembles is the daily quota multiplied by that window: at the 1 MB/day default and a pessimistic five-day window, about 5 MB, an accepted loss. Every byte gifted and occupied in that window is unrecoverable (see Recovery).
- **Recovery**: `ungiftram` is giftee-initiated in the system contract as deployed; the gifter has no unilateral clawback. BPs may use `eosio.wrap` under 15/21 to execute `ungiftram` with a giftee's authority, but a forced return only succeeds when the gifted bytes are unoccupied. Removal and forced return stop a creator from gifting more; neither recovers RAM already gifted and occupied. Forced recovery is available only against gifts that were never used, so it does not address a creator that fills the RAM it takes.
- **No system contract changes**: This proposal requires no amendment to `eosio.system`.

## Scope Boundaries

- This proposal creates the system and registers no creators. Admissions happen afterward, one 15/21 `addcreator` MSIG per creator, as described in Becoming a creator.
- Gifting to pre-existing accounts is **out of scope** and contract-enforced: `giftacct` requires an `eosio::newaccount` for `account` in the same transaction. The accepted trade-off is that creators cannot top up an account after creation: gifts happen at creation or not at all.
- No revenue share: creators keep 100% of anything they charge. The subsidy is the funding mechanism.
- This is distinct from `new.vaulta` (self-serve, payment-driven account creation; see [VP-0002](../vp-0002-account-creation/proposal.md)). This program is creator-driven, with the network covering RAM.

## Known Constraints

- **One gifter per account**: The system contract allows a single RAM gifter per account at a time. Accounts created under this program cannot receive gifted RAM from another party (e.g. an app) until they return the network's gift in full. Buying their own RAM is unaffected.
- **Full-return only**: `ungiftram` returns the entire gift; partial returns are not supported.

## Open Questions

- Should the contract emit a log action per gift for easier indexing/monitoring?
- Exact seed size from `admin.grants` (1 GB vs 2 GB)?

## Next Steps

A working prototype has been developed and demonstrated on the Jungle 4 testnet, with its source published at [`contracts/gift`](https://github.com/aaroncox/vaulta-contracts/tree/746cdef811814b455f7eb4a0c6c58849f3462863/contracts/gift). Remaining work includes settling the open questions, productionizing the contract, and preparing the MSIG sequence (create `ram.vaulta`, deploy the contract, set `eosio.code`, and transfer the seed RAM). Creator admissions follow as separate MSIGs once the system is live.
