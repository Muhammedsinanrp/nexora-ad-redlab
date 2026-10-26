# Nexora Systems — Active Directory Red Team Simulation Lab

[![MITRE ATT&CK](https://img.shields.io/badge/MITRE%20ATT%26CK-Mapped-red.svg)](mitre/Nexora_MITRE_ATT%26CK_Mapping.csv)
[![Domain](https://img.shields.io/badge/Domain-nexora.local-blue.svg)](#lab-environment)
[![Target](https://img.shields.io/badge/Environment-Active%20Directory-orange.svg)](#lab-systems)
[![Status](https://img.shields.io/badge/Lab%20Status-Complete%20%26%20Audited-brightgreen.svg)](#attack-paths-and-results)

## Project Overview

An authorized, isolated Active Directory security lab designed to practice internal red-team assessment techniques, validate real-world offensive tradecraft, and document evidence-backed security findings mapped against the MITRE ATT&CK framework.

**Primary Focus Areas:**
- **Credential Exposure:** Identifying unencrypted secrets in application configuration files on accessible network shares.
- **Kerberoasting:** Requesting Kerberos service tickets for SPN-enabled service accounts and executing offline password auditing.
- **Active Directory ACL Abuse:** Enumerating excessive object permissions (`GenericAll`) with BloodHound and executing controlled privilege escalation.

---

## Objectives

- Assess selected Active Directory and Windows enterprise security weaknesses.
- Validate the real-world operational impact of exposed service credentials and excessive share permissions.
- Evaluate the risk of weak passwords on accounts configured with Service Principal Names (SPNs).
- Utilize BloodHound Community Edition to map directory relationships and uncover hidden privilege escalation attack paths.
- Map all observed adversary behaviors directly to official MITRE ATT&CK techniques.
- Document actionable findings, residual risks, and defensive remediation recommendations.

---

## Lab Environment

- **Domain:** `nexora.local` (NetBIOS: `NEXORA`)
- **Hypervisor:** VMware Workstation / Oracle VirtualBox (Isolated Host-Only Private Network `192.168.23.0/24`)
- **Attacker System:** Kali Linux (`192.168.23.131`)
- **Target Systems:** Windows Server 2022 (`NEXORA-DC`) & Windows 10 Client (`DESKTOP-M8PCMPL`)
- **Tooling:** Impacket suite, BloodHound Community Edition & SharpHound, Hashcat, Nmap, PowerView, and Native Windows Active Directory tools.

> **Safety & Scope Boundary:** All testing was strictly conducted within an isolated host-only subnet (`192.168.23.0/24`) with no internet routing or external bridge interfaces. All accounts and credentials were created exclusively for this lab simulation.

### Lab Systems & Network Register

| Machine | Role / Hostname | IP Address | Subnet Mask | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Windows Server 2022 — NEXORA-DC** | `NEXORA-DC` / Domain Controller | `192.168.23.129` | `255.255.255.0` | Active Directory Domain Controller, Kerberos KDC, DNS (`nexora.local`) |
| **Windows 10 Client** | `DESKTOP-M8PCMPL` / Domain Client | `192.168.23.130` | `255.255.255.0` | Domain Client Workstation (`NEXORA\jsmith`, `NEXORA\dev_user`) |
| **Kali Linux** | `Nexora-Kali` / Attacker Workstation | `192.168.23.131` | `255.255.255.0` | Red Team testing, enumeration, and exploitation platform |
| **Active Directory Domain** | `nexora.local` | — | — | Active Directory Security Forest (NetBIOS: `NEXORA`) |

---

## Attack Paths and Evidence-Backed Results

```
[ Kali Linux (192.168.23.131) ]
        │
        ├─── Path A: Credential Exposure ───► [ NEXORA-DC / Workstation (192.168.23.129) ]
        │    • SMB share \\NEXORA-DC\NexoraApp
        │    • Plaintext app.ini contains svc_backup
        │    • Validate administrative C$ access
        │
        ├─── Path B: Kerberoasting ─────────► [ NEXORA-DC (192.168.23.129) ]
        │    • SPN: MSSQLSvc/NEXORA-DC.nexora.local:1433
        │    • Kerberos TGS etype 23 (RC4-HMAC) captured
        │    • Hashcat Mode 13100 recovered 1/1 target hash
        │
        └─── Path C: AD ACL Abuse ──────────► [ Active Directory Forest (nexora.local) ]
             • BloodHound graph: GenericAll over svc-sql
             • Controlled password reset via RPC/LDAP
             • Elevated privileges via Server Operators membership
```

### 1. Path A — Credential Exposure
- **Scenario:** A low-privileged domain user (`NEXORA\jsmith`) authenticated to the domain and discovered an unhardened SMB share `\\NEXORA-DC\NexoraApp`.
- **Finding:** The application configuration file `app.ini` contained plaintext credentials for a backup service account (`NEXORA\svc_backup`).
- **Validation:**
  - SMB shares enumerated from Kali (`192.168.23.131`) against DC (`192.168.23.129`).
  - The downloaded file's SHA-256 hash matched the source server integrity hash.
  - Successfully validated read/write access to administrative share `\\NEXORA-DC\C$`.
  - Executed DCSync via `secretsdump.py` — extracted `krbtgt` and `Administrator` NTLM hashes.
- **Security Lesson:** Credentials hardcoded in configuration files accessible via open shares bypass network boundaries and grant immediate lateral/administrative privileges.
- **MITRE ATT&CK:** [T1135](https://attack.mitre.org/techniques/T1135/) (Share Discovery), [T1552.001](https://attack.mitre.org/techniques/T1552/001/) (Credentials in Files), [T1078.002](https://attack.mitre.org/techniques/T1078/002/) (Domain Accounts), [T1021.002](https://attack.mitre.org/techniques/T1021/002/) (SMB Admin Shares), [T1003.003](https://attack.mitre.org/techniques/T1003/003/) (NTDS Dumping).

![T1135 — Network Share Discovery](docs/screenshots/attack_05_mitre_t1135_share_discovery.png)
![T1552.001 — Unsecured Credentials in Files](docs/screenshots/attack_06_mitre_t1552_unsecured_creds.png)

### 2. Path B — Kerberoasting
- **Scenario:** Scanned Active Directory for accounts configured with Service Principal Names (SPNs).
- **Finding:** Service account `NEXORA\svc-sql` possessed registered SPN `MSSQLSvc/NEXORA-DC.nexora.local:1433`.
- **Validation:**
  - Requested Kerberos TGS ticket for the service account using Impacket's `GetUserSPNs.py`.
  - Extracted ticket encrypted with weak RC4-HMAC (etype 23).
  - Executed offline password auditing using Hashcat (Mode `13100`).
  - Successfully recovered 1 of 1 target password hash within 4 minutes using a standard wordlist.
- **Security Lesson:** Service accounts with SPNs must use complex, random passwords (25+ characters) or Group Managed Service Accounts (gMSAs) with AES encryption to prevent offline cracking.
- **MITRE ATT&CK:** [T1558.003](https://attack.mitre.org/techniques/T1558/003/) (Kerberoasting), [T1110.002](https://attack.mitre.org/techniques/T1110/002/) (Password Cracking).

![Path B — Kerberoasting SPN & TGS Capture](docs/screenshots/attack_07_path_b_kerberoasting.png)
![Full Hash Dump — hash.txt](docs/screenshots/attack_14_hash_txt_full.png)

### 3. Path C — Active Directory ACL Abuse
- **Scenario:** Ingested domain object permissions into BloodHound Community Edition using SharpHound.
- **Finding:** Discovered that a standard delegated group had `GenericAll` rights over account `NEXORA\svc-sql`.
- **Validation:**
  - Verified DACL permissions using PowerView (`Get-DomainObjectAcl`).
  - Executed controlled password reset on the target account via `rpcclient`.
  - Authenticated with new credentials — account confirmed as member of `Server Operators`.
  - `Server Operators` membership demonstrated full SYSTEM privilege on `NEXORA-DC`.
- **Security Lesson:** Misconfigured Active Directory object permissions create indirect privilege escalation chains that often evade perimeter defenses.
- **MITRE ATT&CK:** [T1069.002](https://attack.mitre.org/techniques/T1069/002/) (Domain Groups Discovery), [T1098](https://attack.mitre.org/techniques/T1098/) (Account Manipulation).

![BloodHound Data Collection — bloodhound-python](docs/screenshots/attack_01_bloodhound_collecting.png)
![Path C — BloodHound GenericAll ACL Attack Path](docs/screenshots/attack_08_path_c_bloodhound_genericall.png)

### 🏆 Full Domain Compromise

![Domain Compromise — Final State](docs/screenshots/attack_04_domain_compromise.png)
![krbtgt & Administrator NTLM Hashes Extracted](docs/screenshots/attack_12_hash_krbtgt_administrator.png)

---

## MITRE ATT&CK Mapping Summary

| Tactic | ATT&CK ID | Technique Name | Lab Evidence / Observation |
| :--- | :--- | :--- | :--- |
| **Discovery** | `T1135` | Network Share Discovery | Enumerated accessible shares (`NexoraApp`, `C$`) on `NEXORA-DC` |
| **Credential Access** | `T1552.001` | Credentials in Files | Plaintext password found in `app.ini` on SMB share |
| **Defense Evasion** | `T1078.002` | Valid Accounts: Domain Accounts | Legitimate service credentials used for lateral movement |
| **Lateral Movement** | `T1021.002` | Remote Services: SMB Admin Shares | Validated administrative access to `NEXORA-DC\C$` |
| **Credential Access** | `T1003.003` | OS Credential Dumping: NTDS | Executed DCSync extracting `Administrator` & `krbtgt` hashes |
| **Credential Access** | `T1558.003` | Kerberoasting (TGS Request) | Extracted RC4 TGS for `MSSQLSvc` account |
| **Credential Access** | `T1110.002` | Password Cracking | Recovered 1/1 hash offline using Hashcat mode 13100 |
| **Discovery** | `T1069.002` | Domain Groups Discovery | BloodHound & PowerView ACL enumeration |
| **Persistence / PrivEsc** | `T1098` | Account Manipulation | `GenericAll` ACL abused to reset service account secret |

*Full CSV matrix available in [mitre/Nexora_MITRE_ATT&CK_Mapping.csv](mitre/Nexora_MITRE_ATT%26CK_Mapping.csv).*

---

## Defensive Remediation & Hardening

1. **Secure Configuration Management:**
   - Immediately remove embedded plaintext secrets from configuration files and scripts.
   - Restrict SMB share permissions according to the principle of least privilege; deny `Everyone` read access to application directories.
   - Implement Azure Key Vault, HashiCorp Vault, or DPAPI for secret storage.

2. **Kerberos & SPN Protection:**
   - Migrate legacy service accounts to **Group Managed Service Accounts (gMSAs)** with automatic 128-bit password rotation.
   - Enforce AES-128/256 Kerberos encryption types and disable RC4-HMAC.
   - Monitor Windows Event ID `4769` for abnormal TGS requests with ticket options `0x40810000` and encryption type `0x17`.

3. **Active Directory DACL Governance:**
   - Regularly audit Active Directory ACLs with automated tooling (BloodHound / PingCastle).
   - Eliminate dangerous permissions (`GenericAll`, `WriteDacl`, `WriteOwner`) over user and computer objects assigned to non-administrative groups.
   - Strip high-privilege group memberships (such as `Server Operators` and `Account Operators`) from operational service accounts.

---

## Repository Structure

```
Nexora-AD-Red-Team-Lab/
├── README.md                                  # Executive summary & engagement overview
├── docs/
│   ├── Lab-Manual.md                          # VMware network setup & VM specifications
│   ├── Attack-Scenario-Manual.md              # Detailed procedure logs for Paths A, B, and C
│   ├── Nexora_AD_Lab_Assessment_Report.pdf    # Master Penetration Testing & Configuration Review Report
│   └── screenshots/                           # Appendix A evidence screenshots gallery
│       ├── screenshot_a1_dns_nslookup.jpeg    # DNS resolution & reachability check
│       ├── screenshot_a2_client_ipconfig.jpeg # Windows 10 Client network configuration
│       ├── screenshot_a3_dc_ipconfig.jpeg     # Windows Server 2022 DC adapter settings
│       ├── screenshot_a4_adapter_ipv4_config.jpeg # Client IPv4 properties
│       └── screenshot_a5_advanced_dns_settings.jpeg # Advanced DNS suffix settings
├── mitre/
│   └── Nexora_MITRE_ATT&CK_Mapping.csv        # Comprehensive ATT&CK matrix mapping
├── evidence/
│   ├── final-audit-summary.txt                # Audit trail & execution timestamps
│   ├── CredentialExposure/                    # Run logs & SHA-256 validation
│   ├── kerberoasting/                         # SPN query & Hashcat audit summaries
│   └── ACLAbuse/                              # BloodHound query results & ACL validation
└── index.html                                 # Interactive simulation lab & evidence explorer
```

---

## Disclaimer & Legal Notice
All documentation and procedures in this repository were conducted in a strictly controlled, private, and authorized laboratory environment for educational and defense-in-depth validation purposes. Never perform unauthorized penetration testing against systems without prior written consent.
