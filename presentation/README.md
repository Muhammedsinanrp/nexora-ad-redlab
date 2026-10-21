# Nexora Systems — Executive Red Team Final Presentation Outline

This document outlines the slide structure and executive findings presented in `Nexora_Red_Team_Final_Presentation.pptx`.

---

### Slide 1: Title & Engagement Scope
- **Project:** Nexora Systems — Active Directory Red Team Assessment
- **Domain:** `nexora.local`
- **Assessment Type:** Internal Adversary Emulation & Penetration Test
- **Engagement Lead:** Offensive Security Engineering Unit

---

### Slide 2: Executive Summary & Risk Overview
- **Overall Posture:** Critical Vulnerabilities Identified
- **Root Causes:**
  1. Plaintext credentials stored on accessible SMB shares.
  2. Weak Service Principal Name (SPN) passwords vulnerable to offline Kerberoasting.
  3. Excessive Active Directory object discretionary permissions (`GenericAll`).
- **Highest Impact:** Complete Active Directory Domain Controller (`NEXORA-DC` - `192.168.23.129`) compromise achievable from an unprivileged domain user foothold.

---

### Slide 3: Lab Architecture & Systems Topology
- Overview of isolated private subnet (`192.168.23.0/24`):
  - `Windows Server 2022 — NEXORA-DC` (`192.168.23.129`)
  - `Windows 10 Client` (`192.168.23.130`)
  - `Kali Linux` (`192.168.23.131`)
  - `Domain`: `nexora.local` (NetBIOS: `NEXORA`)

---

### Slide 4: Attack Path 1 — Credential Exposure
- Initial reconnaissance of `\\Nexora-SRV-APP01\NexoraApp`
- Recovery of `app.ini` with `NEXORA\svc_backup` password
- Integrity verification via SHA-256 match
- Lateral pivot to `Nexora-SRV-APP01` administrative `C$` share
- **MITRE Mapping:** T1552.001, T1078.002, T1021.002

---

### Slide 5: Attack Path 2 — Kerberoasting
- SPN enumeration targeting `MSSQLSvc/Nexora-SRV-APP01.nexora.local:1433`
- Extraction of Kerberos TGS-REP hash (RC4-HMAC, etype 23)
- Offline Hashcat dictionary auditing (Mode 13100)
- 100% hash recovery rate in under 4 minutes
- **MITRE Mapping:** T1558.003, T1110.002

---

### Slide 6: Attack Path 3 — Active Directory ACL Abuse
- BloodHound graph visualization showing privilege path:
  `dev_user` → `IT-Support` → `GenericAll` → `svc-sql` → `Server Operators`
- Controlled RPC password reset (`setuserinfo2`)
- Elevation to Domain Controller administrative management
- **MITRE Mapping:** T1098, T1069.002, T1068

---

### Slide 7: MITRE ATT&CK Matrix Alignment
- Visual matrix showing technique coverage across Tactics:
  Reconnaissance → Initial Access → Credential Access → Lateral Movement → Privilege Escalation

---

### Slide 8: Strategic & Tactical Remediation
- **Short-Term (0–30 Days):**
  - Delete `app.ini` secrets, rotate `svc_backup` password, restrict SMB permissions.
  - Reset `svc-sql` password to 30+ characters, enforce AES Kerberos encryption.
- **Long-Term (30–90 Days):**
  - Deploy Group Managed Service Accounts (gMSAs).
  - Clean up Active Directory DACLs and remove service accounts from `Server Operators`.
  - Implement Tiered Administration Model.
