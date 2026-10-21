# Nexora Systems — Lab Manual

## 1. Purpose
Document the authorized, isolated Active Directory red-team training lab built for evaluating credential exposure, Kerberoasting vulnerabilities, and Active Directory ACL abuse attack vectors.

---

## 2. Scope & Network Configuration

- **Domain FQDN:** `nexora.local`
- **NetBIOS Domain Name:** `NEXORA`
- **Forest Functional Level:** Windows Server 2016 / 2022
- **Hypervisor:** VMware Workstation / Oracle VirtualBox
- **Virtual Network Type:** Isolated Private Host-Only Subnet (`192.168.23.0/24`)
- **Attacker Platform:** Kali Linux 2024.x (`192.168.23.131`)
- **Isolation Boundary:** Zero internet access, no default gateway, no bridged or external adapters configured during offensive testing.

---

## 3. Lab Systems Specification & Network Register

| Machine | Role / Hostname | OS | IP Address | Subnet Mask | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Windows Server 2022 — NEXORA-DC** | `NEXORA-DC` (`DC.nexora.local`) | Windows Server 2022 Datacenter | `192.168.23.129` | `255.255.255.0` | Active Directory Domain Controller, Kerberos KDC, DNS |
| **Windows 10 Client** | `DESKTOP-M8PCMPL` | Windows 10 Enterprise | `192.168.23.130` | `255.255.255.0` | Domain Client Workstation (Initial access user context) |
| **Kali Linux** | `Nexora-Kali` | Kali Linux 2024.x | `192.168.23.131` | `255.255.255.0` | Red Team testing, enumeration & exploitation workstation |
| **Active Directory Domain** | `nexora.local` | AD DS Forest | — | — | Target security boundary (NetBIOS: `NEXORA`) |

### Hardware Resource Allocations

| Configuration Tier | Host Machine RAM | Windows Server 2022 (DC) | Windows 10 Client | Kali Linux |
| :--- | :--- | :--- | :--- | :--- |
| **Standard Build** | 16 GB | 6 GB RAM, 2 vCPUs | 4 GB RAM, 2 vCPUs | 4 GB RAM, 2 vCPUs |
| **Lite Build** | 8 GB | 3.5 GB RAM, 2 vCPUs | 2.5 GB RAM, 1 vCPU | 2 GB RAM, 1 vCPU |

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
