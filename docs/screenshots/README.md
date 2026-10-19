# Nexora Systems — Lab Evidence Screenshots Gallery

This directory contains technical screenshots and visual evidence captured during the execution of the active directory simulation lab on `nexora.local`.

---

### 1. Lab Architecture & Network Topology
![Lab Topology](00_lab_network_topology.jpg)
- **Description:** Complete network schema for the isolated VirtualBox private subnet (`10.10.10.0/24`) connecting Nexora-Kali (`10.10.10.10`), Nexora-DC01 (`10.10.10.20`), Nexora-WS-HR01 (`10.10.10.30`), Nexora-WS-DEV01 (`10.10.10.40`), and Nexora-SRV-APP01 (`10.10.10.50`).

---

### 2. Path A: Credential Exposure & Administrative SMB Access
![Path A SMB Exposure](01_credential_exposure_smb.jpg)
- **Techniques:** MITRE `T1552.001` (Credentials in Files), `T1078.002` (Domain Accounts), `T1021.002` (SMB Admin Shares).
- **Description:** Impacket's `smbclient.py` retrieving `app.ini` from share `\\Nexora-SRV-APP01\NexoraApp` and NetExec validating administrative read/write privileges on `ADMIN$` and `C$`.

---

### 3. Path B: Offline Kerberoasting Auditing with Hashcat
![Path B Hashcat](02_hashcat_kerberoast.jpg)
- **Techniques:** MITRE `T1558.003` (Kerberoasting), `T1110.002` (Password Cracking).
- **Description:** Hashcat v6.2 running Mode 13100 (Kerberos 5, etype 23, TGS-REP) against `svc-sql` ticket, reaching status `Cracked` with 100% digest recovery.

---

### 4. Path C: BloodHound Active Directory ACL Abuse
![Path C BloodHound](03_bloodhound_acl_path.jpg)
- **Techniques:** MITRE `T1098` (Account Manipulation), `T1069.002` (Domain Groups Discovery).
- **Description:** BloodHound Community Edition visualization showing the attack path: `dev_user` → `GenericAll` → `svc-sql` → `MemberOf` → `Server Operators` → `Nexora-DC01`.
