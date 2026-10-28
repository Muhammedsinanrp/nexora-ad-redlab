# Nexora Active Directory Security Assessment — Final Report

## 1. Executive summary

This report documents selected security checks in an isolated VMware Active Directory lab. The evidence supports a limited assessment of SMB access, Kerberos service-ticket behavior, Active Directory ACLs, Domain Controller health, and one unresolved account-state issue.

**Overall status: Assessment documented; follow-up required.** The available report does not establish a successful domain compromise. Several older repository captions and summaries make stronger claims than this final report supports; those claims should be treated as unverified until their original evidence is reviewed and safely redacted.

## 2. Environment

| Asset | Role | Address |
|---|---|---|
| Windows Server 2022 — `NEXORA-DC` | Intended Domain Controller / DNS | `192.168.23.129/24` |
| Windows 10 — `DESKTOP-M8PCMPL` | Domain client | `192.168.23.130/24` |
| Kali Linux — `Nexora-Kali` | Assessment workstation | `192.168.23.131/24` |
| AD domain | `nexora.local` (NetBIOS `NEXORA`) | `192.168.23.0/24` |

The lab should remain on a VMware host-only network. Verify the live VM configuration before repeating assessment steps.

**Evidence-quality note:** some screenshots and captions identify `192.168.23.129` as `SVR-APP01` or `dc01.nexora.local`, while the register identifies it as `NEXORA-DC`. This discrepancy must be resolved from the live hostname and DNS configuration before treating those records as the same system.

## 3. Finding A — SMB share permissions

**Recorded target:** Windows client/share test; the evidence should be matched to the precise hostname and share before publication.  
**Test account:** `NEXORA\\labuser1`

### Observed evidence
- SMB authentication succeeded.
- Directory listing and file download succeeded.
- The tested file upload returned `NT_STATUS_ACCESS_DENIED`.

### Conclusion
Read access was demonstrated for the tested account and share, while the tested upload was denied. This result does not by itself demonstrate plaintext credential exposure or administrative access.

### Recommended remediation
Review both share and NTFS ACLs, remove unnecessary broad access, and retain least-privilege permissions. Record the exact target, share, account role, timestamp and redacted command output.

## 4. Finding B — Kerberos service-account assessment

**Account:** `svc_web`  
**SPN:** `HTTP/nexora-app.nexora.local`

### Observed evidence
- SPN enumeration succeeded.
- A Kerberos service ticket was requested.
- `PasswordNeverExpires` and `PasswordNotRequired` were both recorded as `False`.
- The account was reported as a member of `Domain Users`.

### Conclusion
SPN discovery and ticket retrieval were demonstrated. The final report does not demonstrate password cracking, a recovered password, or a weak service-account password. Ticket retrieval alone is not proof of a vulnerability.

### Recommended remediation
Use a long, randomly generated service-account password or a Group Managed Service Account where appropriate. Review supported Kerberos encryption settings and monitor unusual service-ticket request patterns.

## 5. Finding C — Active Directory ACL review

**Target object:** `CN=Nexora Web Service,OU=Service Accounts,DC=nexora,DC=local`

### Observed evidence
A direct `GenericAll` permission for `BUILTIN\\Account Operators` was identified on the specified service-account object. The report records removal of the matching ACE and a follow-up check using PowerShell ACL inspection and `dsacls`.

### Conclusion
Removal was verified for the specified object. This does not prove that all risky permissions or privilege-escalation paths in the domain have been eliminated.

### Recommended remediation
Review delegated permissions across privileged users, service accounts, computer objects, OUs and GPOs. Preserve before-and-after ACL output and independently verify each remediation.

## 6. Domain Controller health checks

The following services were recorded as running: NTDS, KDC, DNS and Netlogon. The following checks were recorded as passing: `dcdiag /test:Advertising` and `dcdiag /test:Services`.

These selected checks do not constitute a complete health or security assessment.

## 7. Unresolved issue — disabled `krbtgt` account

The recorded state is `Enabled: False` and `UserAccountControl: 514`. The report states that the available event review did not establish who disabled the account or why, and no matching Event ID 4725 was found in the queried logs.

### Required follow-up
1. Preserve the current VM snapshot and relevant logs.
2. Review the domain build procedure and account lifecycle events.
3. Compare the state with a known-good, documented lab configuration.
4. Apply an approved recovery/configuration procedure only after confirming the intended state.
5. Re-run relevant AD and Kerberos health checks and record the results.

Do not mark this issue resolved until its cause and intended state are verified.

## 8. MITRE ATT&CK mapping

| Activity | Candidate technique | Evidence qualification |
|---|---|---|
| Domain account discovery | T1087.002 — Account Discovery: Domain Account | Use only where the saved output supports it |
| Kerberos service-ticket request | T1558.003 — Kerberoasting | Ticket request shown; cracking/recovery not demonstrated by this report |
| SMB share discovery | T1135 — Network Share Discovery | Retain only where the screenshot/log shows share enumeration |
| ACL review and remediation | Defensive configuration review | Do not label remediation itself as an adversary technique |

Technique mapping is an interpretation, not proof that every associated attack stage succeeded. Keep the mapping scoped to directly observed behavior.

## 9. Limitations

- Only selected systems, shares, accounts and directory permissions were reviewed.
- No successful domain compromise or privilege escalation is established by this report.
- Password cracking and credential recovery are not demonstrated here.
- The `krbtgt` account state remains unresolved.
- Hostname and target mapping discrepancies remain to be verified.
- Browser dashboard animations and counters are simulated and must not be presented as live assessment telemetry.

## 10. Conclusion

The lab provides documented practice with SMB permission testing, SPN enumeration, Kerberos ticket retrieval, Active Directory ACL review/remediation, password-policy hardening and Windows event investigation. Selected checks and remediations were recorded, but the evidence does not support a claim of full domain compromise. Resolve the hostname discrepancy and disabled `krbtgt` issue, redact sensitive evidence, and retain reproducible proof before expanding the conclusions.

**Project status:** Core assessment documented; selected remediation checks recorded; follow-up required.
