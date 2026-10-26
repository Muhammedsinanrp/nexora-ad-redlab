# Nexora Systems — Active Directory Security Assessment Lab

> **Assessment status: documented; follow-up required.** This repository contains a controlled VMware lab and evidence from selected Active Directory security checks. It is a learning/portfolio project, not a claim of a complete enterprise penetration test.

## Overview

The lab uses an isolated host-only network to practice Windows domain administration, SMB permission review, Kerberos service-account assessment, BloodHound collection, Active Directory ACL review, and remediation verification.

### Lab network register

| Machine | Hostname / role | IP address | Subnet mask |
|---|---|---:|---:|
| Windows Server 2022 | `NEXORA-DC` — intended domain controller | `192.168.23.129` | `255.255.255.0` |
| Windows 10 | `DESKTOP-M8PCMPL` — domain client | `192.168.23.130` | `255.255.255.0` |
| Kali Linux | `Nexora-Kali` — assessment workstation | `192.168.23.131` | `255.255.255.0` |
| Active Directory domain | `nexora.local` (NetBIOS: `NEXORA`) | — | — |

Verify these values against the running VMs before repeating tests. Evidence in the repository includes a hostname inconsistency: some command output labels `192.168.23.129` as `SVR-APP01` or `dc01.nexora.local`, while the lab register labels it `NEXORA-DC`. Do not treat those names as equivalent until the VM hostname and DNS records have been verified.

## Scope and methodology

- Authorized lab systems only; use an isolated host-only virtual network.
- Review selected SMB shares and permissions.
- Enumerate domain users, groups, computers, OUs, GPOs and relationships with approved lab credentials.
- Review Kerberos SPNs and ticket-request behavior without assuming ticket retrieval proves a weak password.
- Review Active Directory ACLs and record remediation checks.
- Preserve command output and screenshots with dates, source, target, result and limitations.

## Evidence-based results

The current final report supports these conclusions:

- SMB authentication and file listing/download were demonstrated for the specific test share and account; a tested upload was denied.
- Kerberos SPN enumeration and service-ticket retrieval were demonstrated. Password cracking or credential recovery is **not established by the final report**.
- A direct `GenericAll` ACE for `BUILTIN\\Account Operators` on the specified service-account object was reported, and removal was verified for that object only.
- Selected Domain Controller health checks passed.
- The `krbtgt` account was recorded as disabled and its cause remains unresolved.
- A complete domain compromise, DCSync success, recovered hashes, or a Golden Ticket should **not** be claimed based solely on the current conflicting documentation. These claims require independently verifiable, sanitized evidence before inclusion.

See [FINAL-REPORT.md](FINAL-REPORT.md) for results and limitations, and [SECURITY-REVIEW.md](SECURITY-REVIEW.md) for the correction checklist.

## Repository map

- `FINAL-REPORT.md` — assessment findings and limitations.
- `docs/Lab-Manual.md` — environment setup.
- `docs/Attack-Scenario-Manual.md` — lab scenarios.
- `docs/screenshots/README.md` — evidence index and handling notes.
- `mitre/` — candidate technique mapping; mappings must be tied to verified evidence.
- `index.html`, `redteam-lab.html`, `redteam.js` — browser-based visual demo. UI animations and hard-coded counters are **simulated**, not live telemetry.

## Safety and evidence handling

Do not publish real passwords, NTLM hashes, Kerberos tickets, BloodHound exports, or unredacted credential screenshots. If any secret was real or reused, rotate it immediately. Removing a file from the latest commit does not erase it from Git history, forks, caches, or existing clones; follow up with history cleanup and GitHub secret scanning as appropriate.

This project is for authorized training in an isolated lab. Do not test systems without written authorization.
