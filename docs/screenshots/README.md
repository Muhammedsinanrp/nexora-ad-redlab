# Nexora Systems — Lab Evidence Screenshots Gallery

This directory contains the full visual evidence library captured across the **Nexora Active Directory Red Team Simulation Lab** — covering reconnaissance, attack execution, and full domain compromise.

Full assessment report reference: [Nexora_AD_Lab_Assessment_Report.pdf](../Nexora_AD_Lab_Assessment_Report.pdf)

---

## ⚙️ Appendix A — Network Configuration Evidence

### Screenshot A-1: DNS Resolution & Domain Controller Reachability
![Screenshot A-1: DNS Resolution](screenshot_a1_dns_nslookup.jpeg)
- **MITRE:** `T1590` (Gather Victim Network Info)
- **Evidence:** `nslookup nexora.local 192.168.23.129` confirms DC reachability on isolated subnet.

---

### Screenshot A-2: Windows 10 Client Network Configuration
![Screenshot A-2: Client ipconfig](screenshot_a2_client_ipconfig.jpeg)
- **Evidence:** `DESKTOP-M8PCMPL` (`192.168.23.130`) joined to `nexora.local`, DNS pointing to `192.168.23.129`.

---

### Screenshot A-3: Domain Controller Interface Configuration
![Screenshot A-3: DC ipconfig](screenshot_a3_dc_ipconfig.jpeg)
- **Evidence:** `NEXORA-DC` (`192.168.23.129`) Windows Server 2022 Datacenter static IP confirmed.

---

### Screenshot A-4: Windows 10 Client IPv4 Adapter Properties
![Screenshot A-4: IPv4 Properties](screenshot_a4_adapter_ipv4_config.jpeg)
- **Evidence:** GUI verification of client static IP assignment on host-only private subnet.

---

### Screenshot A-5: Advanced TCP/IP DNS Configuration
![Screenshot A-5: DNS Suffix Settings](screenshot_a5_advanced_dns_settings.jpeg)
- **Evidence:** DNS suffix `nexora.local` appended; DNS server list `192.168.23.129` confirmed.

---

## ⚔️ Attack Path Evidence

### Screenshot 1: Helpdesk / Initial Domain User Context
![Helpdesk User — Initial Access](attack_15_helpdesk_user.png)
- **Attack Path:** Initial access user context establishment.
- **MITRE:** `T1078.002` (Valid Accounts: Domain Accounts)
- **Evidence:** Helpdesk / low-privilege domain account used as initial foothold into `nexora.local`.

---

### Screenshot 2: Ping DC01 from Kali — Network Reachability
![Ping DC01 from Kali](attack_09_ping_dc01_from_kali.png)
- **Attack Path:** Attacker → Target Network Reachability Test
- **MITRE:** `T1016` (System Network Configuration Discovery), `T1590`
- **Evidence:** Kali Linux (`192.168.23.131`) confirms ICMP reachability to `NEXORA-DC` (`192.168.23.129`).

---

### Screenshot 3: Password Policy Review
![Password Policy](attack_10_password_policy.png)
- **Attack Path:** Pre-attack AD enumeration & policy audit.
- **MITRE:** `T1201` (Password Policy Discovery)
- **Evidence:** `net accounts /domain` output showing lockout threshold: `0` (None) — no lockout protection configured.

---

## 🔑 Path A — Credential Exposure & SMB Share Access

### Screenshot 4: MITRE T1135 — Network Share Discovery
![T1135 Network Share Discovery](attack_05_mitre_t1135_share_discovery.png)
- **Attack Path:** Path A — Share enumeration phase.
- **MITRE:** `T1135` (Network Share Discovery)
- **Evidence:** SMB share listing from attacker (`192.168.23.131`) revealing `NexoraApp`, `C$`, `ADMIN$`, `NETLOGON`, `SYSVOL`.

---

### Screenshot 5: MITRE T1552.001 — Unsecured Credentials in Files
![T1552.001 Unsecured Credentials](attack_06_mitre_t1552_unsecured_creds.png)
- **Attack Path:** Path A — Credential extraction from `app.ini`.
- **MITRE:** `T1552.001` (Credentials in Files)
- **Evidence:** Plaintext `NEXORA\svc_backup` password recovered from `app.ini` on `\\NEXORA-DC\NexoraApp`.

---

## 🎫 Path B — Kerberoasting

### Screenshot 6: Path B — Kerberoasting SPN Enumeration & Hash Capture
![Path B Kerberoasting](attack_07_path_b_kerberoasting.png)
- **Attack Path:** Path B — SPN enumeration & TGS ticket extraction.
- **MITRE:** `T1558.003` (Kerberoasting)
- **Evidence:** `GetUserSPNs.py` requesting TGS-REP for `svc-sql` (`MSSQLSvc/NEXORA-DC.nexora.local:1433`), etype 23 (RC4-HMAC).

---

### Screenshot 7: Full Hash Dump (`hash.txt`)
![hash.txt Full](attack_14_hash_txt_full.png)
- **Attack Path:** Path B / DCSync — Full credential material capture.
- **MITRE:** `T1003.003` (OS Credential Dumping: NTDS), `T1110.002` (Password Cracking)
- **Evidence:** Complete hash extraction file including domain user NTLMs captured via `secretsdump.py`.

---

## 🔓 Path C — BloodHound Active Directory ACL Abuse

### Screenshot 8: BloodHound Data Collecting (SharpHound)
![BloodHound Collecting](attack_01_bloodhound_collecting.png)
- **Attack Path:** Path C — BloodHound ingestion phase.
- **MITRE:** `T1069.002` (Permission Groups Discovery), `T1087.002` (Account Discovery)
- **Evidence:** SharpHound data collection running against `nexora.local`, capturing all ACLs and relationships.

---

### Screenshot 9: BloodHound Data Uploads — Upload 1
![BloodHound Uploads 1](attack_02_bloodhound_uploads.png)
- **Evidence:** First batch of SharpHound collection ZIP uploaded to BloodHound Community Edition.

---

### Screenshot 10: BloodHound Data Uploads — Upload 2
![BloodHound Uploads 2](attack_03_bloodhound_uploads1.png)
- **Evidence:** Second collection batch uploaded, all `nexora.local` objects indexed in Neo4j graph database.

---

### Screenshot 11: Path C — BloodHound GenericAll ACL Attack Path
![Path C BloodHound GenericAll](attack_08_path_c_bloodhound_genericall.png)
- **Attack Path:** Path C — GenericAll privilege escalation visualization.
- **MITRE:** `T1098` (Account Manipulation), `T1069.002`
- **Evidence:** BloodHound graph shows `dev_user` → `GenericAll` → `svc-sql` → `MemberOf` → `Server Operators` → `NEXORA-DC`.

---

## 🏆 Domain Compromise Evidence

### Screenshot 12: Admin Break Glass Account
![Admin Break Glass](attack_11_admin_break_glass.png)
- **Attack Path:** Full Domain Compromise — Administrator account access.
- **MITRE:** `T1078.002` (Valid Accounts), `T1003.003`
- **Evidence:** Break-glass Administrator account validated post-compromise.

---

### Screenshot 13: Hash of Admin Break Glass
![Hash Admin Break Glass](attack_13_hash_admin_breakglass.png)
- **Attack Path:** Full Domain Compromise — NTLM hash extraction.
- **MITRE:** `T1003.003` (NTDS Credential Dumping)
- **Evidence:** `Administrator` NTLM hash extracted via `secretsdump.py` DCSync from `NEXORA-DC`.

---

### Screenshot 14: `krbtgt` & Administrator NTLM Hashes
![Hash krbtgt and Administrator](attack_12_hash_krbtgt_administrator.png)
- **Attack Path:** Full Domain Compromise — Golden Ticket capability demonstrated.
- **MITRE:** `T1003.003` (NTDS), `T1558.001` (Golden Ticket)
- **Evidence:** Both `krbtgt` and `Administrator` NTLM hashes extracted — full forest compromise confirmed.

---

### Screenshot 15: Domain Compromise — Final Validation
![Domain Compromise](attack_04_domain_compromise.png)
- **Attack Path:** Full Domain Compromise achieved — End State.
- **MITRE:** `T1078.002`, `T1003.003`, `T1098`
- **Evidence:** Domain Admin shell or NTLM pass-the-hash session on `NEXORA-DC` (`192.168.23.129`), demonstrating full Active Directory forest compromise from initial low-privilege foothold.

---

## 📊 Evidence Summary Table

| # | Screenshot File | Attack Path | MITRE ATT&CK ID | Category |
| :---: | :--- | :--- | :--- | :--- |
| A-1 | `screenshot_a1_dns_nslookup.jpeg` | Recon | `T1590` | Network Config |
| A-2 | `screenshot_a2_client_ipconfig.jpeg` | Recon | — | Network Config |
| A-3 | `screenshot_a3_dc_ipconfig.jpeg` | Recon | — | Network Config |
| A-4 | `screenshot_a4_adapter_ipv4_config.jpeg` | Recon | — | Network Config |
| A-5 | `screenshot_a5_advanced_dns_settings.jpeg` | Recon | — | Network Config |
| 1 | `attack_15_helpdesk_user.png` | Initial Access | `T1078.002` | Identity |
| 2 | `attack_09_ping_dc01_from_kali.png` | Recon | `T1016` | Network |
| 3 | `attack_10_password_policy.png` | Recon | `T1201` | Policy |
| 4 | `attack_05_mitre_t1135_share_discovery.png` | Path A | `T1135` | SMB Shares |
| 5 | `attack_06_mitre_t1552_unsecured_creds.png` | Path A | `T1552.001` | Credentials |
| 6 | `attack_07_path_b_kerberoasting.png` | Path B | `T1558.003` | Kerberoasting |
| 7 | `attack_14_hash_txt_full.png` | Path B / DCSync | `T1003.003` | Hash Dump |
| 8 | `attack_01_bloodhound_collecting.png` | Path C | `T1069.002` | BloodHound |
| 9 | `attack_02_bloodhound_uploads.png` | Path C | `T1069.002` | BloodHound |
| 10 | `attack_03_bloodhound_uploads1.png` | Path C | `T1069.002` | BloodHound |
| 11 | `attack_08_path_c_bloodhound_genericall.png` | Path C | `T1098` | ACL Abuse |
| 12 | `attack_11_admin_break_glass.png` | Compromise | `T1078.002` | Domain Admin |
| 13 | `attack_13_hash_admin_breakglass.png` | Compromise | `T1003.003` | Hash Dump |
| 14 | `attack_12_hash_krbtgt_administrator.png` | Compromise | `T1003.003`, `T1558.001` | Golden Ticket |
| 15 | `attack_04_domain_compromise.png` | Compromise | `T1098` | Full DA |
