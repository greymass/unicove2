import type {
	Action,
	AssetType,
	Checksum256Type,
	NameType,
	UInt32Type,
	UInt8Type
} from '@wharfkit/antelope';
import {
	ABI,
	Asset,
	Blob,
	Checksum256,
	Int64,
	Name,
	Struct,
	UInt32,
	UInt8
} from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4yADEQYWNjb3VudF92b3RlX3JvdwADBXZvdGVyBG5hbWUHYWNjb3VudARuYW1lCXZvdGVfdHlwZQV1aW50OAtiYWxhbmNlX3JvdwACB2FjY291bnQEbmFtZQdiYWxhbmNlBWFzc2V0C2J1bGtybXZvdGVzAAIIdG9waWNfaWQEbmFtZQludW1fdm90ZXMGdWludDMyCmNoYW5nZXZvdGUAAwV2b3RlcgRuYW1lCHRvcGljX2lkBG5hbWUJdm90ZV90eXBlBXVpbnQ4CmNvbmZpZ19yb3cABAdlbmFibGVkBGJvb2wPc3lzdGVtX2NvbnRyYWN0BG5hbWUEZmVlcwtmZWVzX2NvbmZpZwdtZXRyaWNzDm1ldHJpY3NfY29uZmlnC2NyZWF0ZXRvcGljAAQHY3JlYXRvcgRuYW1lAmlkBG5hbWULZGVzY3JpcHRpb24Gc3RyaW5nB3BheW1lbnQFYXNzZXQLZGVsZXRldG9waWMAAQJpZARuYW1lB2Rpc2FibGUAAAZlbmFibGUAAAtmZWVzX2NvbmZpZwAEBXRva2VuEHRva2VuX2RlZmluaXRpb24IcmVjZWl2ZXIEbmFtZQtjcmVhdGV0b3BpYwVhc3NldAZhY3Rpb24EbmFtZRlnZXRfYWNjb3VudF92b3RlX3Jlc3BvbnNlAAMFdm90ZXIEbmFtZQdhY2NvdW50BG5hbWUJdm90ZV90eXBlBXVpbnQ4FmdldF9tc2lnX3ZvdGVfcmVzcG9uc2UABAV2b3RlcgRuYW1lCHByb3Bvc2VyBG5hbWUNcHJvcG9zYWxfbmFtZQRuYW1lCXZvdGVfdHlwZQV1aW50OBJnZXRfdG9waWNfcmVzcG9uc2UAAwJpZARuYW1lC2Rlc2NyaXB0aW9uBnN0cmluZwdjcmVhdG9yBG5hbWUXZ2V0X3RvcGljX3ZvdGVfcmVzcG9uc2UAAwV2b3RlcgRuYW1lCHRvcGljX2lkBG5hbWUJdm90ZV90eXBlBXVpbnQ4GmdldF92b3Rlcl9tZXRyaWNzX3Jlc3BvbnNlAAYFdm90ZXIEbmFtZQ1zeXN0ZW1fc3Rha2VkBWludDY0DXN5c3RlbV9saXF1aWQFaW50NjQJcmFtX2J5dGVzBWludDY0CHZfc3Rha2VkBWludDY0CHZfbGlxdWlkBWludDY0GWdldF92b3Rlcl93ZWlnaHRfcmVzcG9uc2UAAgV2b3RlcgRuYW1lBndlaWdodAVpbnQ2NAtnZXRhY2N0dm90ZQACBXZvdGVyBG5hbWUHYWNjb3VudARuYW1lCmdldGFjdHZ0cnMAAQdhY2NvdW50BG5hbWUJZ2V0bWV0cmljAAEFdm90ZXIEbmFtZQpnZXRtZXRyaWNzAAEGdm90ZXJzBm5hbWVbXQtnZXRtc2lndm90ZQADBXZvdGVyBG5hbWUIcHJvcG9zZXIEbmFtZQ1wcm9wb3NhbF9uYW1lBG5hbWULZ2V0bXNpZ3Z0cnMAAghwcm9wb3NlcgRuYW1lDXByb3Bvc2FsX25hbWUEbmFtZQhnZXR0b3BpYwABAmlkBG5hbWUJZ2V0dG9waWNzAAAMZ2V0dG9waWN2b3RlAAIFdm90ZXIEbmFtZQh0b3BpY19pZARuYW1lDGdldHRvcGljdnRycwABCHRvcGljX2lkBG5hbWUHZ2V0dm90ZQACBXZvdGVyBG5hbWUIdG9waWNfaWQEbmFtZQlnZXR2b3RlcnMAAQh0b3BpY19pZARuYW1lCWdldHdlaWdodAABBXZvdGVyBG5hbWUKZ2V0d2VpZ2h0cwABBnZvdGVycwZuYW1lW10ObWV0cmljc19jb25maWcABQxzeXN0ZW1fdG9rZW4QdG9rZW5fZGVmaW5pdGlvbgxsZWdhY3lfdG9rZW4QdG9rZW5fZGVmaW5pdGlvbgp3cmFtX3Rva2VuEHRva2VuX2RlZmluaXRpb24Hdl90b2tlbhB0b2tlbl9kZWZpbml0aW9uEHZfc3Rha2VfY29udHJhY3QEbmFtZQ1tc2lnX3ZvdGVfcm93AAQFdm90ZXIEbmFtZQhwcm9wb3NlcgRuYW1lDXByb3Bvc2FsX25hbWUEbmFtZQl2b3RlX3R5cGUFdWludDgEb3BlbgABB2FjY291bnQEbmFtZQpyZW1vdmV2b3RlAAIFdm90ZXIEbmFtZQh0b3BpY19pZARuYW1lBXJlc2V0AAAKcm1hY2N0dm90ZQACBXZvdGVyBG5hbWUHYWNjb3VudARuYW1lCnJtbXNpZ3ZvdGUAAwV2b3RlcgRuYW1lCHByb3Bvc2VyBG5hbWUNcHJvcG9zYWxfbmFtZQRuYW1lC3JtdG9waWN2b3RlAAIFdm90ZXIEbmFtZQh0b3BpY19pZARuYW1lCXNldGNvbmZpZwAGD3N5c3RlbV9jb250cmFjdARuYW1lDnRva2VuX2NvbnRyYWN0BG5hbWUMdG9rZW5fYWN0aW9uBG5hbWUMdG9rZW5fc3ltYm9sBnN5bWJvbAxmZWVfcmVjZWl2ZXIEbmFtZQ9jcmVhdGV0b3BpY19mZWUFYXNzZXQMc2V0bWV0cmljY2ZnAAEHbWV0cmljcw5tZXRyaWNzX2NvbmZpZxB0b2tlbl9kZWZpbml0aW9uAAMFY2hhaW4MY2hlY2tzdW0yNTY/CGNvbnRyYWN0BG5hbWUGc3ltYm9sBnN5bWJvbAl0b3BpY19yb3cAAwJpZARuYW1lC2Rlc2NyaXB0aW9uBnN0cmluZwdjcmVhdG9yBG5hbWUOdG9waWNfdm90ZV9yb3cAAwV2b3RlcgRuYW1lCHRvcGljX2lkBG5hbWUJdm90ZV90eXBlBXVpbnQ4C3VwZGF0ZXRvcGljAAICaWQEbmFtZQtkZXNjcmlwdGlvbgZzdHJpbmcEdm90ZQADBXZvdGVyBG5hbWUIdG9waWNfaWQEbmFtZQl2b3RlX3R5cGUFdWludDgLdm90ZWFjY291bnQAAwV2b3RlcgRuYW1lB2FjY291bnQEbmFtZQl2b3RlX3R5cGUFdWludDgIdm90ZW1zaWcABAV2b3RlcgRuYW1lCHByb3Bvc2VyBG5hbWUNcHJvcG9zYWxfbmFtZQRuYW1lCXZvdGVfdHlwZQV1aW50OAl2b3RldG9waWMAAwV2b3RlcgRuYW1lCHRvcGljX2lkBG5hbWUJdm90ZV90eXBlBXVpbnQ4CHdpdGhkcmF3AAIHYWNjb3VudARuYW1lCHF1YW50aXR5BWFzc2V0IgCwynTLC6M+C2J1bGtybXZvdGVzsAItLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0J1bGsgUmVtb3ZlIFZvdGVzJwpzdW1tYXJ5OiAnTWFpbnRhaW5lciBhY3Rpb24gdG8gcmVtb3ZlIG11bHRpcGxlIHZvdGVzIGZyb20gYSB0b3BpYyBmb3IgYWRtaW5pc3RyYXRpdmUgcHVycG9zZXMuIFJlbW92ZXMgdXAgdG8gdGhlIHNwZWNpZmllZCBudW1iZXIgb2Ygdm90ZXMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAIDKdCs2TUMKY2hhbmdldm90ZYkCLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdDaGFuZ2UgVm90ZScKc3VtbWFyeTogJ0FsbG93cyBhIHVzZXIgdG8gY2hhbmdlIHRoZWlyIGV4aXN0aW5nIHZvdGUgb24gYSB0b3BpYyBmcm9tIHN1cHBvcnQgdG8gb3Bwb3NpdGlvbiBvciB2aWNlIHZlcnNhLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQCQqzSrbNRFC2NyZWF0ZXRvcGlj5AEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0NyZWF0ZSBUb3BpYycKc3VtbWFyeTogJ0NyZWF0ZXMgYSBuZXcgdG9waWMgd2l0aCB0aGUgc3BlY2lmaWVkIElEIGFuZCBkZXNjcmlwdGlvbi4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AkKs0q6yiSgtkZWxldGV0b3BpY9YBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdEZWxldGUgVG9waWMnCnN1bW1hcnk6ICdEZWxldGVzIGFuIGV4aXN0aW5nIHRvcGljIGZyb20gdGhlIHJlZ2lzdHJ5LicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAEDFY7BLB2Rpc2FibGWFAi0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnRGlzYWJsZSBDb250cmFjdCcKc3VtbWFyeTogJ01haW50YWluZXIgYWN0aW9uIHRvIGRpc2FibGUgdGhlIGNvbnRyYWN0LCBwcmV2ZW50aW5nIHVzZXIgYWN0aW9ucyBmcm9tIGJlaW5nIGV4ZWN1dGVkLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAAACoeMxUBmVuYWJsZfwBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdFbmFibGUgQ29udHJhY3QnCnN1bW1hcnk6ICdNYWludGFpbmVyIGFjdGlvbiB0byBlbmFibGUgdGhlIGNvbnRyYWN0LCBhbGxvd2luZyB1c2VyIGFjdGlvbnMgdG8gYmUgZXhlY3V0ZWQuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAFSmOyNksmILZ2V0YWNjdHZvdGUAAAC+eWdksmIKZ2V0YWN0dnRycwAAAEDuZiWzYglnZXRtZXRyaWMAAABG7mYls2IKZ2V0bWV0cmljcwAAVKabOSyzYgtnZXRtc2lndm90ZQAA8M2bOSyzYgtnZXRtc2lndnRycwAAAADIVZqzYghnZXR0b3BpY9YBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdHZXQgVG9waWMnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIHJldHJpZXZlIGEgdG9waWMgYnkgaXRzIElELicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQAAwMhVmrNiCWdldHRvcGljc+YBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdHZXQgQWxsIFRvcGljcycKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gcmV0cmlldmUgYWxsIHRvcGljcyBmcm9tIHRoZSByZWdpc3RyeS4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS2gMt3IVZqzYgxnZXR0b3BpY3ZvdGUAgG/eyFWas2IMZ2V0dG9waWN2dHJzAAAAAEBlurNiB2dldHZvdGXmAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnR2V0IFZvdGUnCnN1bW1hcnk6ICdSZWFkLW9ubHkgYWN0aW9uIHRvIHJldHJpZXZlIGEgc3BlY2lmaWMgdXNlclwncyB2b3RlIG9uIGEgdG9waWMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAADAV2W6s2IJZ2V0dm90ZXJz+QEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ0dldCBBbGwgVm90ZXJzJwpzdW1tYXJ5OiAnUmVhZC1vbmx5IGFjdGlvbiB0byByZXRyaWV2ZSBhbGwgdm90ZXJzIGFuZCB0aGVpciB2b3RlcyBmb3IgYSBzcGVjaWZpYyB0b3BpYy4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAMiNOcWzYglnZXR3ZWlnaHScAi0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiAnR2V0IFZvdGVyIFdlaWdodCcKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gcmV0cmlldmUgdGhlIHZvdGluZyB3ZWlnaHQgb2YgYSB2b3RlciBiYXNlZCBvbiB0aGVpciBzdGFrZWQgdG9rZW5zIGluIHRoZSBzeXN0ZW0gY29udHJhY3QuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAADOjTnFs2IKZ2V0d2VpZ2h0c68CLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdHZXQgTXVsdGlwbGUgVm90ZXIgV2VpZ2h0cycKc3VtbWFyeTogJ1JlYWQtb25seSBhY3Rpb24gdG8gcmV0cmlldmUgdGhlIHZvdGluZyB3ZWlnaHRzIG9mIG11bHRpcGxlIHZvdGVycyBiYXNlZCBvbiB0aGVpciBzdGFrZWQgdG9rZW5zIGluIHRoZSBzeXN0ZW0gY29udHJhY3QuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAAAAAAwVaUEb3BlbgAAgMp0q02lugpyZW1vdmV2b3Rl2QEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ1JlbW92ZSBWb3RlJwpzdW1tYXJ5OiAnQWxsb3dzIGEgdXNlciB0byByZW1vdmUgdGhlaXIgdm90ZSBmcm9tIGEgdG9waWMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAAAAICssLoFcmVzZXQAAIDKdGeEjLwKcm1hY2N0dm90ZQAAgMp0M4elvApybW1zaWd2b3RlAABUphu5SrO8C3JtdG9waWN2b3RlAAAAYG5NirLCCXNldGNvbmZpZ5UCLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdTZXQgQ29udHJhY3QgQ29uZmlndXJhdGlvbicKc3VtbWFyeTogJ01haW50YWluZXIgYWN0aW9uIHRvIHNldCB0aGUgdmFsdWVzIG9mIHRoZSBjb25maWcgdGFibGUgdG8gdXBkYXRlIGhvdyB0aGlzIGNvbnRyYWN0IG9wZXJhdGVzLicKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLcAWQu5mJbPCDHNldG1ldHJpY2NmZwAAkKs0q2xS1Qt1cGRhdGV0b3BpY9cBLS0tCgpzcGVjX3ZlcnNpb246ICIwLjIuMCIKdGl0bGU6ICdVcGRhdGUgVG9waWMnCnN1bW1hcnk6ICdVcGRhdGVzIHRoZSBkZXNjcmlwdGlvbiBvZiBhbiBleGlzdGluZyB0b3BpYy4nCmljb246IGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNDcyOTI4NjE/cz00MDAmdT0zYjFhZjY2ZTkwZGQ4NTFmNGQ3YzA5NmVkNmEyZmJiNGI5ZTE5MGRhCgotLS0AAAAAAKAy3QR2b3Rl9wEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogJ1ZvdGUgb24gVG9waWMnCnN1bW1hcnk6ICdBbGxvd3MgYSB1c2VyIHRvIGV4cHJlc3MgdGhlaXIgc2VudGltZW50IChzdXBwb3J0IG9yIG9wcG9zaXRpb24pIG9uIGEgdG9waWMuJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAPLUFCGjMt0Ldm90ZWFjY291bnQAAAAAzGGpMt0Idm90ZW1zaWcAAABArtKsMt0Jdm90ZXRvcGljAAAAANzc1LLjCHdpdGhkcmF3AAaAVaY7T00RMgNpNjQAABBhY2NvdW50X3ZvdGVfcm93AAAAQKFpojkDaTY0AAALYmFsYW5jZV9yb3cAAAAAMLcmRQNpNjQAAApjb25maWdfcm93AADAKtPNHJYDaTY0AAANbXNpZ192b3RlX3JvdwAAAABg5CrNA2k2NAAACXRvcGljX3JvdwAAAAAArDLdA2k2NAAADnRvcGljX3ZvdGVfcm93AQlzZW50aW1lbnQJc2VudGltZW50AAAADgBUpjsjZLJiGWdldF9hY2NvdW50X3ZvdGVfcmVzcG9uc2UAAL55Z2SyYhtnZXRfYWNjb3VudF92b3RlX3Jlc3BvbnNlW10AAEDuZiWzYhpnZXRfdm90ZXJfbWV0cmljc19yZXNwb25zZQAARu5mJbNiHGdldF92b3Rlcl9tZXRyaWNzX3Jlc3BvbnNlW10AVKabOSyzYhZnZXRfbXNpZ192b3RlX3Jlc3BvbnNlAPDNmzkss2IYZ2V0X21zaWdfdm90ZV9yZXNwb25zZVtdAAAAyFWas2ISZ2V0X3RvcGljX3Jlc3BvbnNlAADAyFWas2IUZ2V0X3RvcGljX3Jlc3BvbnNlW12gMt3IVZqzYhdnZXRfdG9waWNfdm90ZV9yZXNwb25zZYBv3shVmrNiGWdldF90b3BpY192b3RlX3Jlc3BvbnNlW10AAABAZbqzYhdnZXRfdG9waWNfdm90ZV9yZXNwb25zZQAAwFdlurNiGWdldF90b3BpY192b3RlX3Jlc3BvbnNlW10AAMiNOcWzYhlnZXRfdm90ZXJfd2VpZ2h0X3Jlc3BvbnNlAADOjTnFs2IbZ2V0X3ZvdGVyX3dlaWdodF9yZXNwb25zZVtd'
);
export const abi = ABI.from(abiBlob);
export namespace Types {
	@Struct.type('account_vote_row')
	export class account_vote_row extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('balance_row')
	export class balance_row extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Asset)
		declare balance: Asset;
	}
	@Struct.type('bulkrmvotes')
	export class bulkrmvotes extends Struct {
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt32)
		declare num_votes: UInt32;
	}
	@Struct.type('changevote')
	export class changevote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
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
	@Struct.type('fees_config')
	export class fees_config extends Struct {
		@Struct.field(token_definition)
		declare token: token_definition;
		@Struct.field(Name)
		declare receiver: Name;
		@Struct.field(Asset)
		declare createtopic: Asset;
		@Struct.field(Name)
		declare action: Name;
	}
	@Struct.type('metrics_config')
	export class metrics_config extends Struct {
		@Struct.field(token_definition)
		declare system_token: token_definition;
		@Struct.field(token_definition)
		declare legacy_token: token_definition;
		@Struct.field(token_definition)
		declare wram_token: token_definition;
		@Struct.field(token_definition)
		declare v_token: token_definition;
		@Struct.field(Name)
		declare v_stake_contract: Name;
	}
	@Struct.type('config_row')
	export class config_row extends Struct {
		@Struct.field('bool')
		declare enabled: boolean;
		@Struct.field(Name)
		declare system_contract: Name;
		@Struct.field(fees_config)
		declare fees: fees_config;
		@Struct.field(metrics_config)
		declare metrics: metrics_config;
	}
	@Struct.type('createtopic')
	export class createtopic extends Struct {
		@Struct.field(Name)
		declare creator: Name;
		@Struct.field(Name)
		declare id: Name;
		@Struct.field('string')
		declare description: string;
		@Struct.field(Asset)
		declare payment: Asset;
	}
	@Struct.type('deletetopic')
	export class deletetopic extends Struct {
		@Struct.field(Name)
		declare id: Name;
	}
	@Struct.type('disable')
	export class disable extends Struct {}
	@Struct.type('enable')
	export class enable extends Struct {}
	@Struct.type('get_account_vote_response')
	export class get_account_vote_response extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('get_msig_vote_response')
	export class get_msig_vote_response extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare proposer: Name;
		@Struct.field(Name)
		declare proposal_name: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('get_topic_response')
	export class get_topic_response extends Struct {
		@Struct.field(Name)
		declare id: Name;
		@Struct.field('string')
		declare description: string;
		@Struct.field(Name)
		declare creator: Name;
	}
	@Struct.type('get_topic_vote_response')
	export class get_topic_vote_response extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('get_voter_metrics_response')
	export class get_voter_metrics_response extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Int64)
		declare system_staked: Int64;
		@Struct.field(Int64)
		declare system_liquid: Int64;
		@Struct.field(Int64)
		declare ram_bytes: Int64;
		@Struct.field(Int64)
		declare v_staked: Int64;
		@Struct.field(Int64)
		declare v_liquid: Int64;
	}
	@Struct.type('get_voter_weight_response')
	export class get_voter_weight_response extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Int64)
		declare weight: Int64;
	}
	@Struct.type('getacctvote')
	export class getacctvote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('getactvtrs')
	export class getactvtrs extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('getmetric')
	export class getmetric extends Struct {
		@Struct.field(Name)
		declare voter: Name;
	}
	@Struct.type('getmetrics')
	export class getmetrics extends Struct {
		@Struct.field(Name, { array: true })
		declare voters: Name[];
	}
	@Struct.type('getmsigvote')
	export class getmsigvote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare proposer: Name;
		@Struct.field(Name)
		declare proposal_name: Name;
	}
	@Struct.type('getmsigvtrs')
	export class getmsigvtrs extends Struct {
		@Struct.field(Name)
		declare proposer: Name;
		@Struct.field(Name)
		declare proposal_name: Name;
	}
	@Struct.type('gettopic')
	export class gettopic extends Struct {
		@Struct.field(Name)
		declare id: Name;
	}
	@Struct.type('gettopics')
	export class gettopics extends Struct {}
	@Struct.type('gettopicvote')
	export class gettopicvote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
	}
	@Struct.type('gettopicvtrs')
	export class gettopicvtrs extends Struct {
		@Struct.field(Name)
		declare topic_id: Name;
	}
	@Struct.type('getvote')
	export class getvote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
	}
	@Struct.type('getvoters')
	export class getvoters extends Struct {
		@Struct.field(Name)
		declare topic_id: Name;
	}
	@Struct.type('getweight')
	export class getweight extends Struct {
		@Struct.field(Name)
		declare voter: Name;
	}
	@Struct.type('getweights')
	export class getweights extends Struct {
		@Struct.field(Name, { array: true })
		declare voters: Name[];
	}
	@Struct.type('msig_vote_row')
	export class msig_vote_row extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare proposer: Name;
		@Struct.field(Name)
		declare proposal_name: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('open')
	export class open extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('removevote')
	export class removevote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
	}
	@Struct.type('reset')
	export class reset extends Struct {}
	@Struct.type('rmacctvote')
	export class rmacctvote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('rmmsigvote')
	export class rmmsigvote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare proposer: Name;
		@Struct.field(Name)
		declare proposal_name: Name;
	}
	@Struct.type('rmtopicvote')
	export class rmtopicvote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
	}
	@Struct.type('setconfig')
	export class setconfig extends Struct {
		@Struct.field(Name)
		declare system_contract: Name;
		@Struct.field(Name)
		declare token_contract: Name;
		@Struct.field(Name)
		declare token_action: Name;
		@Struct.field(Asset.Symbol)
		declare token_symbol: Asset.Symbol;
		@Struct.field(Name)
		declare fee_receiver: Name;
		@Struct.field(Asset)
		declare createtopic_fee: Asset;
	}
	@Struct.type('setmetriccfg')
	export class setmetriccfg extends Struct {
		@Struct.field(metrics_config)
		declare metrics: metrics_config;
	}
	@Struct.type('topic_row')
	export class topic_row extends Struct {
		@Struct.field(Name)
		declare id: Name;
		@Struct.field('string')
		declare description: string;
		@Struct.field(Name)
		declare creator: Name;
	}
	@Struct.type('topic_vote_row')
	export class topic_vote_row extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('updatetopic')
	export class updatetopic extends Struct {
		@Struct.field(Name)
		declare id: Name;
		@Struct.field('string')
		declare description: string;
	}
	@Struct.type('vote')
	export class vote extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('voteaccount')
	export class voteaccount extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('votemsig')
	export class votemsig extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare proposer: Name;
		@Struct.field(Name)
		declare proposal_name: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('votetopic')
	export class votetopic extends Struct {
		@Struct.field(Name)
		declare voter: Name;
		@Struct.field(Name)
		declare topic_id: Name;
		@Struct.field(UInt8)
		declare vote_type: UInt8;
	}
	@Struct.type('withdraw')
	export class withdraw extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Asset)
		declare quantity: Asset;
	}
}
export const TableMap = {
	accountvotes: Types.account_vote_row,
	balance: Types.balance_row,
	config: Types.config_row,
	msigvotes: Types.msig_vote_row,
	topics: Types.topic_row,
	votes: Types.topic_vote_row
};
export interface TableTypes {
	accountvotes: Types.account_vote_row;
	balance: Types.balance_row;
	config: Types.config_row;
	msigvotes: Types.msig_vote_row;
	topics: Types.topic_row;
	votes: Types.topic_vote_row;
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export namespace ActionParams {
	export namespace Type {
		export interface metrics_config {
			system_token: Type.token_definition;
			legacy_token: Type.token_definition;
			wram_token: Type.token_definition;
			v_token: Type.token_definition;
			v_stake_contract: NameType;
		}
		export interface token_definition {
			chain?: Checksum256Type;
			contract: NameType;
			symbol: Asset.SymbolType;
		}
	}
	export interface bulkrmvotes {
		topic_id: NameType;
		num_votes: UInt32Type;
	}
	export interface changevote {
		voter: NameType;
		topic_id: NameType;
		vote_type: UInt8Type;
	}
	export interface createtopic {
		creator: NameType;
		id: NameType;
		description: string;
		payment: AssetType;
	}
	export interface deletetopic {
		id: NameType;
	}
	export interface disable {}
	export interface enable {}
	export interface getacctvote {
		voter: NameType;
		account: NameType;
	}
	export interface getactvtrs {
		account: NameType;
	}
	export interface getmetric {
		voter: NameType;
	}
	export interface getmetrics {
		voters: NameType[];
	}
	export interface getmsigvote {
		voter: NameType;
		proposer: NameType;
		proposal_name: NameType;
	}
	export interface getmsigvtrs {
		proposer: NameType;
		proposal_name: NameType;
	}
	export interface gettopic {
		id: NameType;
	}
	export interface gettopics {}
	export interface gettopicvote {
		voter: NameType;
		topic_id: NameType;
	}
	export interface gettopicvtrs {
		topic_id: NameType;
	}
	export interface getvote {
		voter: NameType;
		topic_id: NameType;
	}
	export interface getvoters {
		topic_id: NameType;
	}
	export interface getweight {
		voter: NameType;
	}
	export interface getweights {
		voters: NameType[];
	}
	export interface open {
		account: NameType;
	}
	export interface removevote {
		voter: NameType;
		topic_id: NameType;
	}
	export interface reset {}
	export interface rmacctvote {
		voter: NameType;
		account: NameType;
	}
	export interface rmmsigvote {
		voter: NameType;
		proposer: NameType;
		proposal_name: NameType;
	}
	export interface rmtopicvote {
		voter: NameType;
		topic_id: NameType;
	}
	export interface setconfig {
		system_contract: NameType;
		token_contract: NameType;
		token_action: NameType;
		token_symbol: Asset.SymbolType;
		fee_receiver: NameType;
		createtopic_fee: AssetType;
	}
	export interface setmetriccfg {
		metrics: Type.metrics_config;
	}
	export interface updatetopic {
		id: NameType;
		description: string;
	}
	export interface vote {
		voter: NameType;
		topic_id: NameType;
		vote_type: UInt8Type;
	}
	export interface voteaccount {
		voter: NameType;
		account: NameType;
		vote_type: UInt8Type;
	}
	export interface votemsig {
		voter: NameType;
		proposer: NameType;
		proposal_name: NameType;
		vote_type: UInt8Type;
	}
	export interface votetopic {
		voter: NameType;
		topic_id: NameType;
		vote_type: UInt8Type;
	}
	export interface withdraw {
		account: NameType;
		quantity: AssetType;
	}
}
export interface ActionNameParams {
	bulkrmvotes: ActionParams.bulkrmvotes;
	changevote: ActionParams.changevote;
	createtopic: ActionParams.createtopic;
	deletetopic: ActionParams.deletetopic;
	disable: ActionParams.disable;
	enable: ActionParams.enable;
	getacctvote: ActionParams.getacctvote;
	getactvtrs: ActionParams.getactvtrs;
	getmetric: ActionParams.getmetric;
	getmetrics: ActionParams.getmetrics;
	getmsigvote: ActionParams.getmsigvote;
	getmsigvtrs: ActionParams.getmsigvtrs;
	gettopic: ActionParams.gettopic;
	gettopics: ActionParams.gettopics;
	gettopicvote: ActionParams.gettopicvote;
	gettopicvtrs: ActionParams.gettopicvtrs;
	getvote: ActionParams.getvote;
	getvoters: ActionParams.getvoters;
	getweight: ActionParams.getweight;
	getweights: ActionParams.getweights;
	open: ActionParams.open;
	removevote: ActionParams.removevote;
	reset: ActionParams.reset;
	rmacctvote: ActionParams.rmacctvote;
	rmmsigvote: ActionParams.rmmsigvote;
	rmtopicvote: ActionParams.rmtopicvote;
	setconfig: ActionParams.setconfig;
	setmetriccfg: ActionParams.setmetriccfg;
	updatetopic: ActionParams.updatetopic;
	vote: ActionParams.vote;
	voteaccount: ActionParams.voteaccount;
	votemsig: ActionParams.votemsig;
	votetopic: ActionParams.votetopic;
	withdraw: ActionParams.withdraw;
}
export type ActionNames = keyof ActionNameParams;
export interface ActionReturnValues {
	getacctvote: Types.get_account_vote_response;
	getactvtrs: Types.get_account_vote_response[];
	getmetric: Types.get_voter_metrics_response;
	getmetrics: Types.get_voter_metrics_response[];
	getmsigvote: Types.get_msig_vote_response;
	getmsigvtrs: Types.get_msig_vote_response[];
	gettopic: Types.get_topic_response;
	gettopics: Types.get_topic_response[];
	gettopicvote: Types.get_topic_vote_response;
	gettopicvtrs: Types.get_topic_vote_response[];
	getvote: Types.get_topic_vote_response;
	getvoters: Types.get_topic_vote_response[];
	getweight: Types.get_voter_weight_response;
	getweights: Types.get_voter_weight_response[];
}
export type ActionReturnNames = keyof ActionReturnValues;
export class Contract extends BaseContract {
	constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
		super({
			client: args.client,
			abi: abi,
			account: args.account || Name.from('sentiment.gm')
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
