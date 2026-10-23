# Nexora Active Directory Red Team Simulation Lab

## 1. Project Overview

**Platform:** VMware Workstation Pro  
**Domain:** `nexora.local`  
**Domain Controller:** Windows Server 2022 — `192.168.23.129`  
**Windows Client:** `192.168.23.130`  
**Kali Linux:** `192.168.23.131`  
**Network:** VMware Host-only — `192.168.23.0/24`

This project assesses selected Active Directory security configurations in an isolated virtual lab. The assessment covers SMB permissions, Kerberos service-account exposure, Active Directory ACLs, and domain security configuration.

## 2. Lab Architecture

```text
VMware Workstation Pro
└── Host-only VMnet1: 192.168.23.0/24
    ├── NEXORA-DC — Windows Server 2022
    │   └── 192.168.23.129
    ├── Windows 10 Client
    │   └── 192.168.23.130
    └── Kali Linux Assessment Machine
        └── 192.168.23.131
```

The lab is intended to remain isolated from external networks. Verify all VM network adapters before future testing.

## 3. Path A — SMB Share Permissions

**Target:** Windows 10 client  
**Share:** `NexoraShare`  
**Test account:** `NEXORA\labuser1`

### Evidence
- SMB authentication succeeded.
- Directory listing and file download succeeded.
- File upload returned `NT_STATUS_ACCESS_DENIED`.

### Remediation
Reviewed SMB share and NTFS permissions. The test account retained read access, while the tested remote upload was denied.

### Result
Read-only behavior was validated for the tested account and share. No credential exposure was demonstrated.

## 4. Path B — Kerberos Service Account Assessment

**Account:** `svc_web`  
**SPN:** `HTTP/nexora-app.nexora.local`

### Evidence
- SPN enumeration succeeded.
- A Kerberos service ticket was successfully requested.
- `PasswordNeverExpires` was `False`.
- `PasswordNotRequired` was `False`.
- Group membership review showed `Domain Users`.

### Remediation
The domain minimum password length was increased from 7 to 14 characters. Complexity remained enabled.

### Result
SPN discovery and ticket retrieval were demonstrated. Password cracking was not performed, and a weak password was not demonstrated. Ticket retrieval alone does not prove a vulnerability.

## 5. Path C — Active Directory ACL Review

**Target object:** `CN=Nexora Web Service,OU=Service Accounts,DC=nexora,DC=local`

### Finding
A direct `GenericAll` permission for `BUILTIN\Account Operators` was identified on the service-account object.

### Remediation
Removed the direct `Account Operators` ACL entries.

### Verification
Repeated PowerShell ACL checks and `dsacls` output showed no matching `Account Operators` entry.

### Result
Removal was verified for the specified object. This does not prove that all privilege-escalation paths in the domain are absent.

## 6. Domain Controller Health

The following services were running:
- NTDS
- KDC
- DNS
- Netlogon

The following diagnostic tests passed:
- `dcdiag /test:Advertising`
- `dcdiag /test:Services`

These checks do not constitute a complete security assessment.

## 7. Unresolved Finding — Disabled `krbtgt` Account

The `krbtgt` account remains disabled.

Recorded values:
- `Enabled`: `False`
- `UserAccountControl`: `514`
- `Created`: 18 October 2026, 10:56:39 PM
- `Modified`: 18 October 2026, 11:11:49 PM

Security event review did not establish who disabled the account or why. No matching Event ID 4725 was found in the queried logs.

### Required follow-up
1. Preserve the existing VMware snapshot and relevant logs.
2. Review the domain build process and account lifecycle events.
3. Establish the expected account state using a known-good configuration.
4. Apply an approved recovery or configuration procedure.
5. Re-run appropriate AD and Kerberos health checks.

Do not treat this issue as resolved until the account state and its cause have been investigated.

## 8. MITRE ATT&CK Mapping

| Activity | Candidate technique | Evidence qualification |
|---|---|---|
| Domain account discovery | T1087.002 — Account Discovery: Domain Account | Consistent with the recorded discovery activity |
| Kerberos service-ticket request | T1558.003 — Kerberoasting | Ticket request demonstrated; cracking and credential recovery not demonstrated |
| SMB share access testing | T1135 — Network Share Discovery | Limited mapping; authorized share access was the primary test |
| ACL review and remediation | Defensive configuration review | No separate adversary technique claimed without supporting evidence |

## 9. Limitations

- Testing was restricted to the configured lab environment.
- Password cracking and credential recovery were not demonstrated.
- No successful domain compromise or privilege escalation was recorded.
- Only selected shares, accounts, and directory permissions were assessed.
- The `krbtgt` issue remains unresolved.
- Recorded command outputs should be preserved separately as evidence.

## 10. Conclusion

The lab demonstrated practical experience with SMB permission testing, SPN enumeration, Kerberos service-ticket retrieval, Active Directory ACL remediation, password policy hardening, and Windows Security event investigation.

Selected remediations were verified. However, the assessment did not demonstrate a weak service-account password or successful domain compromise. The disabled `krbtgt` account remains an open issue requiring further investigation.

**Project status:** Core assessment documented; selected remediations verified; further investigation required for the unresolved `krbtgt` finding.
