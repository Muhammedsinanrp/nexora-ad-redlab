# Nexora Systems — Lab Manual

## 1. Purpose
Document the authorized, isolated Active Directory red-team training lab built for evaluating credential exposure, Kerberoasting vulnerabilities, and Active Directory ACL abuse attack vectors.

---

## 2. Scope & Network Configuration

- **Domain FQDN:** `nexora.local`
- **NetBIOS Domain Name:** `NEXORA`
- **Forest Functional Level:** Windows Server 2016 / 2022
- **Hypervisor:** Oracle VirtualBox
- **Virtual Network Type:** Host-Only Private Subnet (`vboxnet0` / `10.10.10.0/24`)
- **Attacker Platform:** Kali Linux 2024.x
- **Isolation Boundary:** Zero internet access, no default gateway, no bridged or NAT adapters configured during offensive testing.

---

## 3. Lab Systems Specification

| System Name | Hostname | IPv4 Address | Subnet Mask | Default Gateway | Role / Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Nexora-Kali** | `kali.nexora.local` | `10.10.10.10` | `255.255.255.0` | None | Red Team testing & enumeration workstation |
| **Nexora-DC01** | `DC01.nexora.local` | `10.10.10.20` | `255.255.255.0` | None | Primary Active Directory Domain Controller, DNS, Kerberos KDC |
| **Nexora-WS-HR01** | `WS-HR01.nexora.local` | `10.10.10.30` | `255.255.255.0` | None | Human Resources workstation (Initial access user context) |
| **Nexora-WS-DEV01** | `WS-DEV01.nexora.local` | `10.10.10.40` | `255.255.255.0` | None | Software Development workstation |
| **Nexora-SRV-APP01** | `SRV-APP01.nexora.local` | `10.10.10.50` | `255.255.255.0` | None | Application & Database server hosting `NexoraApp` SMB share |

---

## 4. Installed Tooling & Prerequisites

### Attacker Machine (Nexora-Kali)
- **Impacket Toolkit:** `GetUserSPNs.py`, `smbclient.py`, `secretsdump.py`, `psexec.py`, `wmiexec.py`
- **Enumeration:** `nmap`, `enum4linux-ng`, `crackmapexec` / `netexec`, `ldapsearch`
- **Kerberos & Cracking:** `hashcat` (v6.2+), `john`, `krb5-user`
- **AD Graph Analysis:** `BloodHound Community Edition` (v5.x), `Neo4j` database

### Windows Environment
- **SharpHound:** BloodHound data collector binary (`SharpHound.exe` v2.x)
- **PowerView:** Active Directory reconnaissance PowerShell module
- **Sysinternals Suite:** `Process Explorer`, `Procmon`, `AccessChk`

---

## 5. Lab Safety & Operational Rules

1. **Authorization:** Testing is strictly limited to systems bearing the `nexora.local` domain designation.
2. **Credential Sanitization:** Real-world enterprise passwords, private customer data, or production hash dumps must never be introduced into this lab environment.
3. **Network Isolation:** Lab virtual machines must remain strictly bounded within the private host-only adapter. Do not enable promiscuous mode or external routing.
4. **Data Protection:** Password hashes, cracked potfile contents, and raw ticket materials must be sanitized before publishing public summaries or repository commits.
5. **Reproducibility:** All findings must be documented with corresponding timestamps, tool parameters, SHA-256 hashes, and observed error codes for audit validation.
