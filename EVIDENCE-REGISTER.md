# Nexora Lab — Evidence Register and Validation Log

> **Status:** Evidence register created from the project notes and current report. This file is not a substitute for original screenshots, command output, event logs, or a fresh validation run. Add each original artefact under `evidence/` and update the corresponding row only after checking it.

## Evidence handling rules

- Capture the complete terminal window or relevant GUI panel with the VM name and timestamp visible where practical.
- Save raw output separately from screenshots. Record the exact command, execution host, target, account role (never its password), timestamp, result, and limitations.
- Use synthetic lab credentials only. Redact passwords, hashes, tickets, tokens, personal data, and private keys before committing.
- Do not commit live credential files, BloodHound databases/exports, memory dumps, packet captures containing credentials, or unredacted logs.
- Preserve failed tests as failed tests. Do not convert an error into a successful finding.
- Use filenames such as `E-001-dns-service-status.png` and `E-001-dns-service-status.txt`.

## Current evidence register

| ID | Area | Recorded observation | Evidence status | Limitation / next validation |
|---|---|---|---|---|
| E-001 | AD/DNS baseline | Domain `nexora.local`; AD DS, DNS, KDC and Netlogon checks were recorded in the project history. | Previously documented | Capture a fresh, timestamped server-side service and DNS check. |
| E-002 | DNS/DC discovery | DNS records and domain-controller discovery were reported working in prior lab sessions. | Previously documented | Repeat from a clean Kali/Windows client session and record resolver, query and result. |
| E-003 | LDAP enumeration | Authenticated LDAP queries enumerated domain objects, including `Administrator`, `Guest`, `krbtgt`, `labuser1`, and `svc_web`. | Previously documented | Store sanitized output and verify current directory state. |
| E-004 | SMB access | SMB authentication, listing and file download were recorded; a tested upload was denied with `NT_STATUS_ACCESS_DENIED`. | Reported in final report | Attach the original sanitized output and identify the exact host/share/account role. |
| E-005 | Group Policy | The Default Domain Policy `GptTmpl.inf` was read from SYSVOL. Reported settings include minimum password length 14, complexity enabled, history 24, maximum age 42 days, and Kerberos clock skew 5 minutes. | Previously documented | Capture the current effective policy; distinguish configured GPO values from effective resultant policy. |
| E-006 | SPN discovery | `svc_web` was enumerated with SPN `HTTP/nexora-app.nexora.local`. | Previously documented | Reconfirm the SPN and account attributes on the live DC. |
| E-007 | Kerberos ticket request | The earlier ticket request failed with `KRB_AP_ERR_SKEW`; the final report separately records a successful ticket request. | Conflicting run records | Preserve both runs with timestamps. Re-run after synchronizing lab clocks and record the actual result. Ticket retrieval does not prove cracking or password recovery. |
| E-008 | AD ACL review | The final report records a direct `GenericAll` ACE for `BUILTIN\\Account Operators` on the Nexora Web Service object and a follow-up removal check. | Reported in final report | Add before/after ACL exports with sensitive identifiers reviewed; validate other objects separately. |
| E-009 | Domain Controller health | `NTDS`, `KDC`, `DNS`, `Netlogon` and selected `dcdiag` checks were reported passing. | Reported in final report | Attach timestamped output and run a broader health check if required. |
| E-010 | `krbtgt` account | Final report records `Enabled: False` / `UserAccountControl: 514`; reason was not established. | Open issue | Investigate build history and relevant event logs. Do not change account state without confirming intended lab configuration. |
| E-011 | BloodHound | Earlier collection was recorded as 1 domain, 5 computers, 31 users, 56 groups, 2 GPOs, 10 OUs and 19 containers. | Historical snapshot | Recollect from the current lab. Do not commit raw databases or unredacted exports. |
| E-012 | Host identity | Documentation/screenshots associate `192.168.23.129` with multiple host labels, including `NEXORA-DC`, `dc01.nexora.local`, and `SVR-APP01`. | Unresolved discrepancy | Verify live hostname, DNS records, VM NIC and screenshot capture context before correlating target-specific findings. |

## Recommended folder layout

```text
evidence/
  README.md
  screenshots/
    E-001-dns-service-status.png
    E-002-dns-resolution.png
    E-003-ldap-enumeration-redacted.png
    E-004-smb-permissions-redacted.png
    E-005-gpo-password-policy.png
    E-006-svc-web-spn.png
    E-007-kerberos-ticket-result-redacted.png
    E-008-acl-before-after-redacted.png
    E-009-dcdiag-health.png
    E-010-krbtgt-account-state-redacted.png
    E-011-bloodhound-summary-redacted.png
    E-012-hostname-ip-validation.png
  logs/
    README.md
  hashes/
    SHA256SUMS.txt
```

Only create a file when the corresponding original evidence exists. Do not add empty placeholder screenshots and do not generate evidence from this table.

## Validation checklist

- [ ] Confirm each VM's live hostname, IP, subnet, DNS server and VMware network mode.
- [ ] Resolve the `192.168.23.129` hostname discrepancy.
- [ ] Re-run DNS, LDAP, SMB and DC health checks; preserve raw sanitized output.
- [ ] Compare system clocks and repeat the Kerberos request only after resolving clock skew.
- [ ] Record the actual `svc_web` SPN ticket request result; do not claim password cracking unless independently demonstrated.
- [ ] Verify the ACL state before and after remediation, including the exact object and ACE.
- [ ] Investigate why `krbtgt` is disabled and document the intended state.
- [ ] Review every image and log for secrets before committing.
- [ ] Calculate SHA-256 hashes for the final evidence artefacts and store them in `hashes/SHA256SUMS.txt`.
- [ ] Re-run each required attack path from a clean snapshot if the assignment rubric requires reproducibility.

## Submission note

The repository currently supports a **documented partial assessment with follow-up required**. Do not mark all attack paths complete or claim full domain compromise until the required end-to-end evidence and repeatability checks are present.
