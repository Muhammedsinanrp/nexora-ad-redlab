# Nexora Systems — Evidence Index

This folder contains screenshots from the Nexora Active Directory lab. Treat screenshots as evidence only when the target identity and result can be matched to the original command output. Some older captions in this repository contain inconsistent hostnames or stronger claims than the current final report supports.

## Lab network register

| Machine | Hostname / role | IP address | Subnet mask |
|---|---|---:|---|
| Windows Server 2022 | `NEXORA-DC` — intended Domain Controller | `192.168.23.129` | `255.255.255.0` |
| Windows 10 | `DESKTOP-M8PCMPL` — domain client | `192.168.23.130` | `255.255.255.0` |
| Kali Linux | `Nexora-Kali` — assessment workstation | `192.168.23.131` | `255.255.255.0` |
| Active Directory | `nexora.local` (NetBIOS: `NEXORA`) | `192.168.23.0/24` | — |

## Evidence handling warning

**Do not publish screenshots that display passwords, hashes, tickets, tokens, or other reusable secrets.** Replace sensitive images with redacted copies before merging this branch. Removing a caption does not redact the image itself. If a secret was real or reused, rotate it.

## Evidence groups

- **Network configuration:** DNS resolution, client IP configuration, Domain Controller interface configuration, IPv4 properties and DNS suffix settings.
- **SMB share review:** share enumeration and access-control tests. The visible NetExec example previously included a plaintext password; use a redacted screenshot and placeholder text in captions.
- **Kerberos assessment:** SPN enumeration and service-ticket retrieval. Do not publish raw ticket material or cracked secrets.
- **BloodHound collection and ACL review:** directory collection and relationship analysis. The collector output reported 1 domain, 5 computers, 31 users, 56 groups, 2 GPOs, 10 OUs, 19 containers and 0 trusts. It also reported a hostname mismatch for `SVR-APP01`; verify the actual host identity before interpreting this as a confirmed DC result.
- **Hash or compromise screenshots:** any image showing NTLM hashes, `krbtgt`, DCSync output, or a “domain compromised” claim must be withheld from public display until the source evidence is verified and all secrets are irreversibly redacted.

## Required caption format

For each retained screenshot, record:

1. Evidence ID and capture date/time.
2. Source machine and IP.
3. Target hostname and IP as independently verified.
4. Tool/command with credentials replaced by `<REDACTED>`.
5. Observed output (not an inference).
6. Relevant MITRE ATT&CK technique only where supported.
7. Limitations or discrepancies.

For overall findings and limitations, see [FINAL-REPORT.md](../../FINAL-REPORT.md). The current assessment does **not** establish full domain compromise.
