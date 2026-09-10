import type { Action, Checksum256Type, NameType } from '@wharfkit/antelope';
import {
	ABI,
	Asset,
	Blob,
	BlockTimestamp,
	Bytes,
	Checksum256,
	Float64,
	Int64,
	Name,
	Struct,
	TimePoint,
	TimePointSec,
	UInt16,
	UInt32,
	UInt64,
	UInt8
} from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4yARtCX3ZlY3Rvcl90b2tlbl9kZWZpbml0aW9uX0USdG9rZW5fZGVmaW5pdGlvbltdLAhhYmlfaGFzaAACBW93bmVyBG5hbWUEaGFzaAtjaGVja3N1bTI1NgdhY2NvdW50AAMHYWNjb3VudARuYW1lBnRva2VucxxCX3ZlY3Rvcl90b2tlbl9kZWZpbml0aW9uX0U/DHplcm9iYWxhbmNlcwVib29sPwlhdmFpbGFibGUAAQdhY2NvdW50BG5hbWUIYmFsYW5jZXMAAwdhY2NvdW50BG5hbWUGdG9rZW5zEnRva2VuX2RlZmluaXRpb25bXQx6ZXJvYmFsYW5jZXMEYm9vbBVibG9ja2NoYWluX3BhcmFtZXRlcnMAERNtYXhfYmxvY2tfbmV0X3VzYWdlBnVpbnQ2NBp0YXJnZXRfYmxvY2tfbmV0X3VzYWdlX3BjdAZ1aW50MzIZbWF4X3RyYW5zYWN0aW9uX25ldF91c2FnZQZ1aW50MzIeYmFzZV9wZXJfdHJhbnNhY3Rpb25fbmV0X3VzYWdlBnVpbnQzMhBuZXRfdXNhZ2VfbGVld2F5BnVpbnQzMiNjb250ZXh0X2ZyZWVfZGlzY291bnRfbmV0X3VzYWdlX251bQZ1aW50MzIjY29udGV4dF9mcmVlX2Rpc2NvdW50X25ldF91c2FnZV9kZW4GdWludDMyE21heF9ibG9ja19jcHVfdXNhZ2UGdWludDMyGnRhcmdldF9ibG9ja19jcHVfdXNhZ2VfcGN0BnVpbnQzMhltYXhfdHJhbnNhY3Rpb25fY3B1X3VzYWdlBnVpbnQzMhltaW5fdHJhbnNhY3Rpb25fY3B1X3VzYWdlBnVpbnQzMhhtYXhfdHJhbnNhY3Rpb25fbGlmZXRpbWUGdWludDMyHmRlZmVycmVkX3RyeF9leHBpcmF0aW9uX3dpbmRvdwZ1aW50MzIVbWF4X3RyYW5zYWN0aW9uX2RlbGF5BnVpbnQzMhZtYXhfaW5saW5lX2FjdGlvbl9zaXplBnVpbnQzMhdtYXhfaW5saW5lX2FjdGlvbl9kZXB0aAZ1aW50MTYTbWF4X2F1dGhvcml0eV9kZXB0aAZ1aW50MTYKY29uZmlnX3JvdwAJD3N5c3RlbV9jb250cmFjdARuYW1lFHN5c3RlbV9jb250cmFjdF9tc2lnBG5hbWUVc3lzdGVtX3Rva2VuX2NvbnRyYWN0BG5hbWUTc3lzdGVtX3Rva2VuX3N5bWJvbAZzeW1ib2wVc3lzdGVtX3JhbWNvcmVfc3ltYm9sBnN5bWJvbBFzeXN0ZW1fcmFtX3N5bWJvbAZzeW1ib2wRc3lzdGVtX3JleF9zeW1ib2wGc3ltYm9sEmdpZnRlZF9yYW1fZW5hYmxlZARib29sCGNoYWluX2lkC2NoZWNrc3VtMjU2CWNvbm5lY3RvcgACB2JhbGFuY2UFYXNzZXQGd2VpZ2h0B2Zsb2F0NjQMY29udHJhY3RoYXNoAAEHYWNjb3VudARuYW1lE2RlbGVnYXRlZF9iYW5kd2lkdGgABARmcm9tBG5hbWUCdG8EbmFtZQpuZXRfd2VpZ2h0BWFzc2V0CmNwdV93ZWlnaHQFYXNzZXQLZGVsZWdhdGlvbnMAAQdhY2NvdW50BG5hbWUMZGlzdHJpYnV0aW9uAAEDZGVmEHRva2VuX2RlZmluaXRpb24SZW9zaW9fZ2xvYmFsX3N0YXRlFWJsb2NrY2hhaW5fcGFyYW1ldGVycw0MbWF4X3JhbV9zaXplBnVpbnQ2NBh0b3RhbF9yYW1fYnl0ZXNfcmVzZXJ2ZWQGdWludDY0D3RvdGFsX3JhbV9zdGFrZQVpbnQ2NB1sYXN0X3Byb2R1Y2VyX3NjaGVkdWxlX3VwZGF0ZRRibG9ja190aW1lc3RhbXBfdHlwZRhsYXN0X3BlcnZvdGVfYnVja2V0X2ZpbGwKdGltZV9wb2ludA5wZXJ2b3RlX2J1Y2tldAVpbnQ2NA9wZXJibG9ja19idWNrZXQFaW50NjQTdG90YWxfdW5wYWlkX2Jsb2NrcwZ1aW50MzIVdG90YWxfYWN0aXZhdGVkX3N0YWtlBWludDY0G3RocmVzaF9hY3RpdmF0ZWRfc3Rha2VfdGltZQp0aW1lX3BvaW50G2xhc3RfcHJvZHVjZXJfc2NoZWR1bGVfc2l6ZQZ1aW50MTYadG90YWxfcHJvZHVjZXJfdm90ZV93ZWlnaHQHZmxvYXQ2NA9sYXN0X25hbWVfY2xvc2UUYmxvY2tfdGltZXN0YW1wX3R5cGUOZXhjaGFuZ2Vfc3RhdGUAAwZzdXBwbHkFYXNzZXQEYmFzZQljb25uZWN0b3IFcXVvdGUJY29ubmVjdG9yFGdldF9hY2NvdW50X3Jlc3BvbnNlAAwHYWNjb3VudARuYW1lDGNvbnRyYWN0aGFzaAtjaGVja3N1bTI1NgdiYWxhbmNlDXRva2VuX2JhbGFuY2ULZGVsZWdhdGlvbnMVZGVsZWdhdGVkX2JhbmR3aWR0aFtdCXByb3Bvc2Fscwpwcm9wb3NhbFtdBnJlZnVuZA5yZWZ1bmRfcmVxdWVzdAZyZXhiYWwLcmV4X2JhbGFuY2UHcmV4ZnVuZAhyZXhfZnVuZAR2b3RlCnZvdGVyX2luZm8JZ2lmdGVkcmFtCmdpZnRlZF9yYW0IYmFsYW5jZXMPdG9rZW5fYmFsYW5jZVtdB2NyZWF0ZWQKdGltZV9wb2ludBZnZXRfYXZhaWxhYmxlX3Jlc3BvbnNlAAIHYWNjb3VudARuYW1lCWF2YWlsYWJsZQRib29sFGdldF9uZXR3b3JrX3Jlc3BvbnNlAAYGZ2xvYmFsE2Vvc2lvX2dsb2JhbF9zdGF0ZT8HcG93ZXJ1cA1wb3dlcnVwX3N0YXRlA3JhbQ5leGNoYW5nZV9zdGF0ZQNyZXgIcmV4X3Bvb2wFdG9rZW4FdG9rZW4OcmFtX2dpZnRfYnl0ZXMFaW50NjQKZ2lmdGVkX3JhbQADBmdpZnRlZQRuYW1lBmdpZnRlcgRuYW1lCXJhbV9ieXRlcwVpbnQ2NAlnaWZ0ZWRyYW0AAQdhY2NvdW50BG5hbWUGZ2xvYmFsAAAHbmV0d29yawAAGXBhaXJfdGltZV9wb2ludF9zZWNfaW50NjQAAgVmaXJzdA50aW1lX3BvaW50X3NlYwZzZWNvbmQFaW50NjQHcG93ZXJ1cAAADXBvd2VydXBfc3RhdGUABQd2ZXJzaW9uBXVpbnQ4A25ldBZwb3dlcnVwX3N0YXRlX3Jlc291cmNlA2NwdRZwb3dlcnVwX3N0YXRlX3Jlc291cmNlDHBvd2VydXBfZGF5cwZ1aW50MzIPbWluX3Bvd2VydXBfZmVlBWFzc2V0FnBvd2VydXBfc3RhdGVfcmVzb3VyY2UADwd2ZXJzaW9uBXVpbnQ4BndlaWdodAVpbnQ2NAx3ZWlnaHRfcmF0aW8FaW50NjQUYXNzdW1lZF9zdGFrZV93ZWlnaHQFaW50NjQUaW5pdGlhbF93ZWlnaHRfcmF0aW8FaW50NjQTdGFyZ2V0X3dlaWdodF9yYXRpbwVpbnQ2NBFpbml0aWFsX3RpbWVzdGFtcA50aW1lX3BvaW50X3NlYxB0YXJnZXRfdGltZXN0YW1wDnRpbWVfcG9pbnRfc2VjCGV4cG9uZW50B2Zsb2F0NjQKZGVjYXlfc2VjcwZ1aW50MzIJbWluX3ByaWNlBWFzc2V0CW1heF9wcmljZQVhc3NldAt1dGlsaXphdGlvbgVpbnQ2NBRhZGp1c3RlZF91dGlsaXphdGlvbgVpbnQ2NBV1dGlsaXphdGlvbl90aW1lc3RhbXAOdGltZV9wb2ludF9zZWMIcHJvcG9zYWwAAw1wcm9wb3NhbF9uYW1lBG5hbWUScGFja2VkX3RyYW5zYWN0aW9uBWJ5dGVzEmVhcmxpZXN0X2V4ZWNfdGltZQx0aW1lX3BvaW50PyQJcHJvcG9zYWxzAAEHYWNjb3VudARuYW1lA3JhbQAABnJlZnVuZAABB2FjY291bnQEbmFtZQ5yZWZ1bmRfcmVxdWVzdAAEBW93bmVyBG5hbWUMcmVxdWVzdF90aW1lDnRpbWVfcG9pbnRfc2VjCm5ldF9hbW91bnQFYXNzZXQKY3B1X2Ftb3VudAVhc3NldAVyZXNldAAAA3JleAAAC3JleF9iYWxhbmNlAAYHdmVyc2lvbgV1aW50OAVvd25lcgRuYW1lCnZvdGVfc3Rha2UFYXNzZXQLcmV4X2JhbGFuY2UFYXNzZXQLbWF0dXJlZF9yZXgFaW50NjQOcmV4X21hdHVyaXRpZXMbcGFpcl90aW1lX3BvaW50X3NlY19pbnQ2NFtdCHJleF9mdW5kAAMHdmVyc2lvbgV1aW50OAVvd25lcgRuYW1lB2JhbGFuY2UFYXNzZXQIcmV4X3Bvb2wACAd2ZXJzaW9uBXVpbnQ4CnRvdGFsX2xlbnQFYXNzZXQMdG90YWxfdW5sZW50BWFzc2V0CnRvdGFsX3JlbnQFYXNzZXQOdG90YWxfbGVuZGFibGUFYXNzZXQJdG90YWxfcmV4BWFzc2V0EG5hbWViaWRfcHJvY2VlZHMFYXNzZXQIbG9hbl9udW0GdWludDY0BnJleGJhbAABB2FjY291bnQEbmFtZQdyZXhmdW5kAAEHYWNjb3VudARuYW1lCXNldGNvbmZpZwAJCGNoYWluX2lkC2NoZWNrc3VtMjU2D3N5c3RlbV9jb250cmFjdARuYW1lFHN5c3RlbV9jb250cmFjdF9tc2lnBG5hbWUVc3lzdGVtX3Rva2VuX2NvbnRyYWN0BG5hbWUTc3lzdGVtX3Rva2VuX3N5bWJvbAZzeW1ib2wVc3lzdGVtX3JhbWNvcmVfc3ltYm9sBnN5bWJvbBFzeXN0ZW1fcmFtX3N5bWJvbAZzeW1ib2wRc3lzdGVtX3JleF9zeW1ib2wGc3ltYm9sEmdpZnRlZF9yYW1fZW5hYmxlZARib29sBXRva2VuAAICaWQQdG9rZW5fZGVmaW5pdGlvbgxkaXN0cmlidXRpb24TdG9rZW5fZGlzdHJpYnV0aW9uPw10b2tlbl9iYWxhbmNlAAIFdG9rZW4FdG9rZW4HYmFsYW5jZQVhc3NldBB0b2tlbl9kZWZpbml0aW9uAAMFY2hhaW4MY2hlY2tzdW0yNTY/CGNvbnRyYWN0BG5hbWUGc3ltYm9sBnN5bWJvbBJ0b2tlbl9kaXN0cmlidXRpb24ABQtjaXJjdWxhdGluZwVhc3NldAZsb2NrZWQFYXNzZXQDbWF4BWFzc2V0BnN0YWtlZAVhc3NldAZzdXBwbHkFYXNzZXQKdm90ZXJfaW5mbwAKBW93bmVyBG5hbWUFcHJveHkEbmFtZQlwcm9kdWNlcnMGbmFtZVtdBnN0YWtlZAVpbnQ2NBBsYXN0X3ZvdGVfd2VpZ2h0B2Zsb2F0NjQTcHJveGllZF92b3RlX3dlaWdodAdmbG9hdDY0CGlzX3Byb3h5BGJvb2wGZmxhZ3MxBnVpbnQzMglyZXNlcnZlZDIGdWludDMyCXJlc2VydmVkMwVhc3NldAV2b3RlcwABB2FjY291bnQEbmFtZQR3aXBlAAAUAAAAIE9NETIHYWNjb3VudOkBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdMb2FkIEFjY291bnQgU3RhdGUnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIGxvYWQgdGhlIGN1cnJlbnQgc3RhdGUgb2YgYW4gYWNjb3VudC4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAFDxmOjMNglhdmFpbGFibGXxAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnQ2hlY2sgTmFtZSBBdmFpbGFibGUnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIGNoZWNrcyB0aGUgYXZhaWxhYmlsaXR5IG9mIGFuIGFjY291bnQgbmFtZS4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAABYoWmiOQhiYWxhbmNlc4MCLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdMb2FkIEJhbGFuY2VzJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byBsb2FkIHRoZSB0b2tlbiBiYWxhbmNlcyBvZiB0aGUgcHJvdmlkZWQgdG9rZW4gY29udHJhY3RzIGFuZCBzeW1ib2xzLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLdCwaRmZmydFDGNvbnRyYWN0aGFzaPkBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdMb2FkIENvbnRyYWN0IEhhc2gnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIGxvYWQgdGhlIGhhc2ggb2YgdGhlIGNvbnRyYWN0IGRlcGxveWVkIHRvIGFuIGFjY291bnQuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAPCkLhumokoLZGVsZWdhdGlvbnPqAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnTG9hZCBEZWxlZ2F0aW9ucycKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gbG9hZCBhbnkgdG9rZW5zIGRlbGVnYXRlZCBieSBhbiBhY2NvdW50LicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLTCpy/q4m7FLDGRpc3RyaWJ1dGlvbv4BLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdMb2FkIFRva2VuIERpc3RyaWJ1dGlvbicKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gbG9hZCB0aGUgY3VycmVudCBkaXN0cmlidXRpb24gaW5mb3JtYXRpb24gb2YgYSB0b2tlbi4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAJDmJpWXYwlnaWZ0ZWRyYW3pAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnTG9hZCBHaWZ0ZWQgUkFNJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byBsb2FkIHRoZSBnaWZ0ZWQgUkFNIHN0YXRlIG9mIGFuIGFjY291bnQuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAAAAERzaGQGZ2xvYmFs2gEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0xvYWQgR2xvYmFsIFN0YXRlJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byBsb2FkIGdsb2JhbCBzdGF0ZSBkYXRhLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAABeyrOaB25ldHdvcmvqAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnTG9hZCBOZXR3b3JrIFN0YXRlJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byBsb2FkIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBuZXR3b3JrLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAKDqqzitB3Bvd2VydXD7AS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnTG9hZCBQb3dlcnVwIFN0YXRlJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byBsb2FkIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBwb3dlcnVwIHN5c3RlbSBjb250cmFjdHMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAADA0WBa6a0JcHJvcG9zYWxzgQItLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0xvYWQgQWNjb3VudCBQcm9wb3NhbHMnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIGxvYWQgbXVsdGlzaWcgcHJvcG9zYWxzIHRoYXQgd2VyZSBwcm9wb3NlZCBieSBhbiBhY2NvdW50LicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAAAAAKS5A3JhbfABLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdMb2FkIFJBTSBNYXJrZXQgU3RhdGUnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIGxvYWQgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIFJBTSBNYXJrZXQuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAAAAKSpl7oGcmVmdW5k5QEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0xvYWQgUmVmdW5kJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byBmaW5kIGFueSBwZW5kaW5nIHJlZnVuZHMgZm9yIGFuIGFjY291bnQuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAAAAICssLoFcmVzZXTsAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnREVCVUc6IFJlc2V0IENvbnRyYWN0IFN0YXRlJwpzdW1tYXJ5OiAnREVCVUc6IFJlc2V0cyB0aGUgY29udHJhY3Qgc3RhdGUgdG8gZGVmYXVsdCB2YWx1ZXMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAAAAAAAuroDcmV46wEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0xvYWQgUkVYIFN0YXRlJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byBsb2FkIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBSRVggY29udHJhY3QuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAAAAERzuroGcmV4YmFs/gEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0xvYWQgUkVYIEJhbGFuY2UnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIGxvYWQgdGhlIEVPUyBiYWxhbmNlIG9mIGFuIGFjY291bnQgaWRsZSBpbiB0aGUgUkVYIGNvbnRyYWN0LicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAACBNvbq6B3JleGZ1bmT1AS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnTG9hZCBSRVggU3RhdGUnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIGxvYWQgdGhlIFJFWCBzdGF0ZSBvZiBhbiBhY2NvdW50IGluIHRoZSBSRVggY29udHJhY3QuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAABgbk2KssIJc2V0Y29uZmlnlQItLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ1NldCBDb250cmFjdCBDb25maWd1cmF0aW9uJwpzdW1tYXJ5OiAnTWFpbnRhaW5lciBhY3Rpb24gdG8gc2V0IHRoZSB2YWx1ZXMgb2YgdGhlIGNvbmZpZyB0YWJsZSB0byB1cGRhdGUgaG93IHRoaXMgY29udHJhY3Qgb3BlcmF0ZXMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAAAAACsMt0Fdm90ZXPmAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnTG9hZCBBY2NvdW50IFZvdGVzJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byBsb2FkIHRoZSB2b3RlcyBjYXN0IGJ5IGFuIGFjY291bnQuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAAAAACgquMEd2lwZdkBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdERUJVRzogV2lwZSBDb250cmFjdCBEYXRhJwpzdW1tYXJ5OiAnREVCVUc6IFJlbW92ZXMgYWxsIGNvbnRyYWN0IHN0YXRlLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQEAAAAAMLcmRQNpNjQAAApjb25maWdfcm93AQNhcGkDYXBpAAAAEQAAACBPTREyFGdldF9hY2NvdW50X3Jlc3BvbnNlAABQ8ZjozDYWZ2V0X2F2YWlsYWJsZV9yZXNwb25zZQAAAFihaaI5D3Rva2VuX2JhbGFuY2VbXdCwaRmZmydFCGFiaV9oYXNoAPCkLhumokoVZGVsZWdhdGVkX2JhbmR3aWR0aFtdMKnL+ribsUsFdG9rZW4AAJDmJpWXYwpnaWZ0ZWRfcmFtAAAAAERzaGQSZW9zaW9fZ2xvYmFsX3N0YXRlAAAAAF7Ks5oUZ2V0X25ldHdvcmtfcmVzcG9uc2UAAACg6qs4rQ1wb3dlcnVwX3N0YXRlAADA0WBa6a0KcHJvcG9zYWxbXQAAAAAAAKS5DmV4Y2hhbmdlX3N0YXRlAAAAAKSpl7oOcmVmdW5kX3JlcXVlc3QAAAAAAAC6ughyZXhfcG9vbAAAAABEc7q6C3JleF9iYWxhbmNlAAAAIE29uroIcmV4X2Z1bmQAAAAAAKwy3Qp2b3Rlcl9pbmZv'
);
export const abi = ABI.from(abiBlob);
export namespace Types {
	@Struct.type('abi_hash')
	export class abi_hash extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Checksum256)
		declare hash: Checksum256;
	}
	@Struct.type('token_definition')
	export class token_definition extends Struct {
		@Struct.field(Checksum256, { optional: true })
		declare chain?: Checksum256;
		@Struct.field(Name)
		declare contract: Name;
		@Struct.field(Asset.Symbol)
		declare symbol: Asset.Symbol;
	}
	@Struct.type('account')
	export class account extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(token_definition, { array: true, optional: true })
		declare tokens?: token_definition[];
		@Struct.field('bool', { optional: true })
		declare zerobalances?: boolean;
	}
	@Struct.type('available')
	export class available extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('balances')
	export class balances extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(token_definition, { array: true })
		declare tokens: token_definition[];
		@Struct.field('bool')
		declare zerobalances: boolean;
	}
	@Struct.type('blockchain_parameters')
	export class blockchain_parameters extends Struct {
		@Struct.field(UInt64)
		declare max_block_net_usage: UInt64;
		@Struct.field(UInt32)
		declare target_block_net_usage_pct: UInt32;
		@Struct.field(UInt32)
		declare max_transaction_net_usage: UInt32;
		@Struct.field(UInt32)
		declare base_per_transaction_net_usage: UInt32;
		@Struct.field(UInt32)
		declare net_usage_leeway: UInt32;
		@Struct.field(UInt32)
		declare context_free_discount_net_usage_num: UInt32;
		@Struct.field(UInt32)
		declare context_free_discount_net_usage_den: UInt32;
		@Struct.field(UInt32)
		declare max_block_cpu_usage: UInt32;
		@Struct.field(UInt32)
		declare target_block_cpu_usage_pct: UInt32;
		@Struct.field(UInt32)
		declare max_transaction_cpu_usage: UInt32;
		@Struct.field(UInt32)
		declare min_transaction_cpu_usage: UInt32;
		@Struct.field(UInt32)
		declare max_transaction_lifetime: UInt32;
		@Struct.field(UInt32)
		declare deferred_trx_expiration_window: UInt32;
		@Struct.field(UInt32)
		declare max_transaction_delay: UInt32;
		@Struct.field(UInt32)
		declare max_inline_action_size: UInt32;
		@Struct.field(UInt16)
		declare max_inline_action_depth: UInt16;
		@Struct.field(UInt16)
		declare max_authority_depth: UInt16;
	}
	@Struct.type('config_row')
	export class config_row extends Struct {
		@Struct.field(Name)
		declare system_contract: Name;
		@Struct.field(Name)
		declare system_contract_msig: Name;
		@Struct.field(Name)
		declare system_token_contract: Name;
		@Struct.field(Asset.Symbol)
		declare system_token_symbol: Asset.Symbol;
		@Struct.field(Asset.Symbol)
		declare system_ramcore_symbol: Asset.Symbol;
		@Struct.field(Asset.Symbol)
		declare system_ram_symbol: Asset.Symbol;
		@Struct.field(Asset.Symbol)
		declare system_rex_symbol: Asset.Symbol;
		@Struct.field('bool')
		declare gifted_ram_enabled: boolean;
		@Struct.field(Checksum256)
		declare chain_id: Checksum256;
	}
	@Struct.type('connector')
	export class connector extends Struct {
		@Struct.field(Asset)
		declare balance: Asset;
		@Struct.field(Float64)
		declare weight: Float64;
	}
	@Struct.type('contracthash')
	export class contracthash extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('delegated_bandwidth')
	export class delegated_bandwidth extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Name)
		declare to: Name;
		@Struct.field(Asset)
		declare net_weight: Asset;
		@Struct.field(Asset)
		declare cpu_weight: Asset;
	}
	@Struct.type('delegations')
	export class delegations extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('distribution')
	export class distribution extends Struct {
		@Struct.field(token_definition)
		declare def: token_definition;
	}
	@Struct.type('eosio_global_state')
	export class eosio_global_state extends blockchain_parameters {
		@Struct.field(UInt64)
		declare max_ram_size: UInt64;
		@Struct.field(UInt64)
		declare total_ram_bytes_reserved: UInt64;
		@Struct.field(Int64)
		declare total_ram_stake: Int64;
		@Struct.field(BlockTimestamp)
		declare last_producer_schedule_update: BlockTimestamp;
		@Struct.field(TimePoint)
		declare last_pervote_bucket_fill: TimePoint;
		@Struct.field(Int64)
		declare pervote_bucket: Int64;
		@Struct.field(Int64)
		declare perblock_bucket: Int64;
		@Struct.field(UInt32)
		declare total_unpaid_blocks: UInt32;
		@Struct.field(Int64)
		declare total_activated_stake: Int64;
		@Struct.field(TimePoint)
		declare thresh_activated_stake_time: TimePoint;
		@Struct.field(UInt16)
		declare last_producer_schedule_size: UInt16;
		@Struct.field(Float64)
		declare total_producer_vote_weight: Float64;
		@Struct.field(BlockTimestamp)
		declare last_name_close: BlockTimestamp;
	}
	@Struct.type('exchange_state')
	export class exchange_state extends Struct {
		@Struct.field(Asset)
		declare supply: Asset;
		@Struct.field(connector)
		declare base: connector;
		@Struct.field(connector)
		declare quote: connector;
	}
	@Struct.type('token_distribution')
	export class token_distribution extends Struct {
		@Struct.field(Asset)
		declare circulating: Asset;
		@Struct.field(Asset)
		declare locked: Asset;
		@Struct.field(Asset)
		declare max: Asset;
		@Struct.field(Asset)
		declare staked: Asset;
		@Struct.field(Asset)
		declare supply: Asset;
	}
	@Struct.type('token')
	export class token extends Struct {
		@Struct.field(token_definition)
		declare id: token_definition;
		@Struct.field(token_distribution, { optional: true })
		declare distribution?: token_distribution;
	}
	@Struct.type('token_balance')
	export class token_balance extends Struct {
		@Struct.field(token)
		declare token: token;
		@Struct.field(Asset)
		declare balance: Asset;
	}
	@Struct.type('proposal')
	export class proposal extends Struct {
		@Struct.field(Name)
		declare proposal_name: Name;
		@Struct.field(Bytes)
		declare packed_transaction: Bytes;
		@Struct.field(TimePoint, { extension: true, optional: true })
		declare earliest_exec_time?: TimePoint;
	}
	@Struct.type('refund_request')
	export class refund_request extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(TimePointSec)
		declare request_time: TimePointSec;
		@Struct.field(Asset)
		declare net_amount: Asset;
		@Struct.field(Asset)
		declare cpu_amount: Asset;
	}
	@Struct.type('pair_time_point_sec_int64')
	export class pair_time_point_sec_int64 extends Struct {
		@Struct.field(TimePointSec)
		declare first: TimePointSec;
		@Struct.field(Int64)
		declare second: Int64;
	}
	@Struct.type('rex_balance')
	export class rex_balance extends Struct {
		@Struct.field(UInt8)
		declare version: UInt8;
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset)
		declare vote_stake: Asset;
		@Struct.field(Asset)
		declare rex_balance: Asset;
		@Struct.field(Int64)
		declare matured_rex: Int64;
		@Struct.field(pair_time_point_sec_int64, { array: true })
		declare rex_maturities: pair_time_point_sec_int64[];
	}
	@Struct.type('rex_fund')
	export class rex_fund extends Struct {
		@Struct.field(UInt8)
		declare version: UInt8;
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Asset)
		declare balance: Asset;
	}
	@Struct.type('voter_info')
	export class voter_info extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Name)
		declare proxy: Name;
		@Struct.field(Name, { array: true })
		declare producers: Name[];
		@Struct.field(Int64)
		declare staked: Int64;
		@Struct.field(Float64)
		declare last_vote_weight: Float64;
		@Struct.field(Float64)
		declare proxied_vote_weight: Float64;
		@Struct.field('bool')
		declare is_proxy: boolean;
		@Struct.field(UInt32)
		declare flags1: UInt32;
		@Struct.field(UInt32)
		declare reserved2: UInt32;
		@Struct.field(Asset)
		declare reserved3: Asset;
	}
	@Struct.type('gifted_ram')
	export class gifted_ram extends Struct {
		@Struct.field(Name)
		declare giftee: Name;
		@Struct.field(Name)
		declare gifter: Name;
		@Struct.field(Int64)
		declare ram_bytes: Int64;
	}
	@Struct.type('get_account_response')
	export class get_account_response extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Checksum256)
		declare contracthash: Checksum256;
		@Struct.field(token_balance)
		declare balance: token_balance;
		@Struct.field(delegated_bandwidth, { array: true })
		declare delegations: delegated_bandwidth[];
		@Struct.field(proposal, { array: true })
		declare proposals: proposal[];
		@Struct.field(refund_request)
		declare refund: refund_request;
		@Struct.field(rex_balance)
		declare rexbal: rex_balance;
		@Struct.field(rex_fund)
		declare rexfund: rex_fund;
		@Struct.field(voter_info)
		declare vote: voter_info;
		@Struct.field(gifted_ram)
		declare giftedram: gifted_ram;
		@Struct.field(token_balance, { array: true })
		declare balances: token_balance[];
		@Struct.field(TimePoint)
		declare created: TimePoint;
	}
	@Struct.type('get_available_response')
	export class get_available_response extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field('bool')
		declare available: boolean;
	}
	@Struct.type('powerup_state_resource')
	export class powerup_state_resource extends Struct {
		@Struct.field(UInt8)
		declare version: UInt8;
		@Struct.field(Int64)
		declare weight: Int64;
		@Struct.field(Int64)
		declare weight_ratio: Int64;
		@Struct.field(Int64)
		declare assumed_stake_weight: Int64;
		@Struct.field(Int64)
		declare initial_weight_ratio: Int64;
		@Struct.field(Int64)
		declare target_weight_ratio: Int64;
		@Struct.field(TimePointSec)
		declare initial_timestamp: TimePointSec;
		@Struct.field(TimePointSec)
		declare target_timestamp: TimePointSec;
		@Struct.field(Float64)
		declare exponent: Float64;
		@Struct.field(UInt32)
		declare decay_secs: UInt32;
		@Struct.field(Asset)
		declare min_price: Asset;
		@Struct.field(Asset)
		declare max_price: Asset;
		@Struct.field(Int64)
		declare utilization: Int64;
		@Struct.field(Int64)
		declare adjusted_utilization: Int64;
		@Struct.field(TimePointSec)
		declare utilization_timestamp: TimePointSec;
	}
	@Struct.type('powerup_state')
	export class powerup_state extends Struct {
		@Struct.field(UInt8)
		declare version: UInt8;
		@Struct.field(powerup_state_resource)
		declare net: powerup_state_resource;
		@Struct.field(powerup_state_resource)
		declare cpu: powerup_state_resource;
		@Struct.field(UInt32)
		declare powerup_days: UInt32;
		@Struct.field(Asset)
		declare min_powerup_fee: Asset;
	}
	@Struct.type('rex_pool')
	export class rex_pool extends Struct {
		@Struct.field(UInt8)
		declare version: UInt8;
		@Struct.field(Asset)
		declare total_lent: Asset;
		@Struct.field(Asset)
		declare total_unlent: Asset;
		@Struct.field(Asset)
		declare total_rent: Asset;
		@Struct.field(Asset)
		declare total_lendable: Asset;
		@Struct.field(Asset)
		declare total_rex: Asset;
		@Struct.field(Asset)
		declare namebid_proceeds: Asset;
		@Struct.field(UInt64)
		declare loan_num: UInt64;
	}
	@Struct.type('get_network_response')
	export class get_network_response extends Struct {
		@Struct.field(eosio_global_state, { optional: true })
		declare global?: eosio_global_state;
		@Struct.field(powerup_state)
		declare powerup: powerup_state;
		@Struct.field(exchange_state)
		declare ram: exchange_state;
		@Struct.field(rex_pool)
		declare rex: rex_pool;
		@Struct.field(token)
		declare token: token;
		@Struct.field(Int64)
		declare ram_gift_bytes: Int64;
	}
	@Struct.type('giftedram')
	export class giftedram extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('global')
	export class global extends Struct {}
	@Struct.type('network')
	export class network extends Struct {}
	@Struct.type('powerup')
	export class powerup extends Struct {}
	@Struct.type('proposals')
	export class proposals extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('ram')
	export class ram extends Struct {}
	@Struct.type('refund')
	export class refund extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('reset')
	export class reset extends Struct {}
	@Struct.type('rex')
	export class rex extends Struct {}
	@Struct.type('rexbal')
	export class rexbal extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('rexfund')
	export class rexfund extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('setconfig')
	export class setconfig extends Struct {
		@Struct.field(Checksum256)
		declare chain_id: Checksum256;
		@Struct.field(Name)
		declare system_contract: Name;
		@Struct.field(Name)
		declare system_contract_msig: Name;
		@Struct.field(Name)
		declare system_token_contract: Name;
		@Struct.field(Asset.Symbol)
		declare system_token_symbol: Asset.Symbol;
		@Struct.field(Asset.Symbol)
		declare system_ramcore_symbol: Asset.Symbol;
		@Struct.field(Asset.Symbol)
		declare system_ram_symbol: Asset.Symbol;
		@Struct.field(Asset.Symbol)
		declare system_rex_symbol: Asset.Symbol;
		@Struct.field('bool')
		declare gifted_ram_enabled: boolean;
	}
	@Struct.type('votes')
	export class votes extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('wipe')
	export class wipe extends Struct {}
}
export const TableMap = {
	config: Types.config_row
};
export interface TableTypes {
	config: Types.config_row;
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export namespace ActionParams {
	export namespace Type {
		export interface token_definition {
			chain?: Checksum256Type;
			contract: NameType;
			symbol: Asset.SymbolType;
		}
	}
	export interface account {
		account: NameType;
		tokens?: Type.token_definition[];
		zerobalances?: boolean;
	}
	export interface available {
		account: NameType;
	}
	export interface balances {
		account: NameType;
		tokens: Type.token_definition[];
		zerobalances: boolean;
	}
	export interface contracthash {
		account: NameType;
	}
	export interface delegations {
		account: NameType;
	}
	export interface distribution {
		def: Type.token_definition;
	}
	export interface giftedram {
		account: NameType;
	}
	export interface global {}
	export interface network {}
	export interface powerup {}
	export interface proposals {
		account: NameType;
	}
	export interface ram {}
	export interface refund {
		account: NameType;
	}
	export interface reset {}
	export interface rex {}
	export interface rexbal {
		account: NameType;
	}
	export interface rexfund {
		account: NameType;
	}
	export interface setconfig {
		chain_id: Checksum256Type;
		system_contract: NameType;
		system_contract_msig: NameType;
		system_token_contract: NameType;
		system_token_symbol: Asset.SymbolType;
		system_ramcore_symbol: Asset.SymbolType;
		system_ram_symbol: Asset.SymbolType;
		system_rex_symbol: Asset.SymbolType;
		gifted_ram_enabled: boolean;
	}
	export interface votes {
		account: NameType;
	}
	export interface wipe {}
}
export interface ActionNameParams {
	account: ActionParams.account;
	available: ActionParams.available;
	balances: ActionParams.balances;
	contracthash: ActionParams.contracthash;
	delegations: ActionParams.delegations;
	distribution: ActionParams.distribution;
	giftedram: ActionParams.giftedram;
	global: ActionParams.global;
	network: ActionParams.network;
	powerup: ActionParams.powerup;
	proposals: ActionParams.proposals;
	ram: ActionParams.ram;
	refund: ActionParams.refund;
	reset: ActionParams.reset;
	rex: ActionParams.rex;
	rexbal: ActionParams.rexbal;
	rexfund: ActionParams.rexfund;
	setconfig: ActionParams.setconfig;
	votes: ActionParams.votes;
	wipe: ActionParams.wipe;
}
export type ActionNames = keyof ActionNameParams;
export interface ActionReturnValues {
	account: Types.get_account_response;
	available: Types.get_available_response;
	balances: Types.token_balance[];
	contracthash: Types.abi_hash;
	delegations: Types.delegated_bandwidth[];
	distribution: Types.token;
	giftedram: Types.gifted_ram;
	global: Types.eosio_global_state;
	network: Types.get_network_response;
	powerup: Types.powerup_state;
	proposals: Types.proposal[];
	ram: Types.exchange_state;
	refund: Types.refund_request;
	rex: Types.rex_pool;
	rexbal: Types.rex_balance;
	rexfund: Types.rex_fund;
	votes: Types.voter_info;
}
export type ActionReturnNames = keyof ActionReturnValues;
export class Contract extends BaseContract {
	constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
		super({
			client: args.client,
			abi: abi,
			account: args.account || Name.from('unicove.gm')
		});
	}
	action<T extends ActionNames>(
		name: T,
		data: ActionNameParams[T],
		options?: ActionOptions
	): Action {
		return super.action(name, data, options);
	}
	readonly<T extends ActionReturnNames>(
		name: T,
		data?: ActionNameParams[T]
	): ActionReturnValues[T] {
		return super.readonly(name, data) as unknown as ActionReturnValues[T];
	}
	table<T extends TableNames>(name: T, scope?: NameType): Table<RowType<T>> {
		return super.table(name, scope, TableMap[name]);
	}
}
