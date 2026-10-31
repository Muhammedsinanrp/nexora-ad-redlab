# NEXORA SYSTEMS | Active Directory Red Team Simulation Lab

**Offensive Security Internship Project — Internmo**

![Status](https://img.shields.io/badge/Status-Assessment%20documented-orange)
![Domain](https://img.shields.io/badge/AD%20Domain-nexora.local-blue)
![Platform](https://img.shields.io/badge/Platform-VMware%20%7C%20Windows%20Server%202022-informational)
![Evidence](https://img.shields.io/badge/Evidence-Recorded%20%2B%20validation%20pending-lightgrey)

This repository documents the design, execution notes, evidence and security assessment of an isolated Windows Active Directory training lab. It is organized as a practical red-team portfolio and reporting package. The current evidence supports selected enumeration, access-control and hardening checks; it does **not** establish a complete domain compromise.

---

## Project overview

The Nexora lab is a controlled environment built to practice enterprise Active Directory assessment techniques from a Kali Linux workstation. The assessment focuses on identifying directory services, validating network and SMB access, reviewing Group Policy, examining service principal names (SPNs), evaluating delegated permissions, and documenting remediation.

**Project objectives**
- Build and validate a small Windows Active Directory environment.
- Practice DNS, LDAP, SMB and Kerberos enumeration.
- Review service-account exposure and delegated AD permissions.
- Map directly observed activity to MITRE ATT&CK.
- Record evidence, limitations, remediation and follow-up validation.
- Present the work in a reproducible, security-conscious portfolio format.

## Lab architecture

The documented environment uses VMware virtual machines on an isolated host-only network.

| System | Role | Documented address |
|---|---|---|
| Windows Server 2022 — `NEXORA-DC` | Intended Domain Controller / DNS | `192.168.23.129/24` |
| Windows 10 — `DESKTOP-M8PCMPL` | Domain client | `192.168.23.130/24` |
| Kali Linux — `Nexora-Kali` | Assessment workstation | `192.168.23.131/24` |
| Active Directory | Domain / NetBIOS | `nexora.local` / `NEXORA` |

> **Validation note:** Existing screenshots and notes use more than one hostname for `192.168.23.129`. Verify the live hostname, DNS records and VM network before correlating target-specific evidence. The table reflects the current report, not a claim that the discrepancy has been resolved.

## Assessment workstreams

### 1. Discovery and directory enumeration
- Validate DNS resolution and domain-controller discovery.
- Query LDAP and review selected domain objects.
- Review the current AD inventory and summarize BloodHound collection results.

### 2. SMB access review
- Validate authentication to the tested SMB service.
- Review accessible shares and directory listing permissions.
- Record the tested download and denied upload behavior.
- Confirm the exact host, share and account context for each result.

### 3. Kerberos and service-account review
- Enumerate the SPN associated with `svc_web`: `HTTP/nexora-app.nexora.local`.
- Record the actual service-ticket request result, including failures.
- Distinguish SPN discovery and ticket retrieval from password cracking or credential recovery. Neither successful cracking nor password recovery is established by the current final report.

### 4. AD permissions and remediation
- Review the reported `GenericAll` ACE on the Nexora Web Service object.
- Record the reported removal and follow-up check.
- Treat the verification as scoped to the specified object; it is not proof that all risky permissions in the domain are eliminated.

### 5. Domain Controller and policy checks
- Review selected AD DS, DNS, KDC and Netlogon service states.
- Record selected `dcdiag` checks.
- Inspect the Default Domain Policy and distinguish configured values from effective resultant policy.

## Current assessment summary

| Area | Current documented result | Status |
|---|---|---|
| SMB | Authentication, listing and download recorded; tested upload denied | Partial |
| SPN enumeration | `svc_web` SPN recorded | Documented |
| Kerberos ticket request | Historical runs conflict; one clock-skew failure recorded | Revalidation required |
| AD ACL | Specific ACE removal and follow-up check reported | Scoped remediation |
| DC health | Selected services and `dcdiag` checks reported passing | Partial |
| `krbtgt` state | Account reported disabled; cause not established | Open issue |
| Host identity | Conflicting names associated with one documented IP | Open issue |

See [FINAL-REPORT.md](FINAL-REPORT.md) for the detailed findings, qualifications and remediation guidance, and [EVIDENCE-REGISTER.md](EVIDENCE-REGISTER.md) for the evidence inventory and validation checklist.

## MITRE ATT&CK mapping

The repository includes a mapping file under [mitre/](mitre/). Technique references are included only where they are supported by observed activity. A technique mapping is an analytical classification, not proof that an entire attack chain succeeded.

## Repository structure

```text
nexora-ad-redlab/
├── README.md
├── FINAL-REPORT.md
├── EVIDENCE-REGISTER.md
├── SECURITY-REVIEW.md
├── docs/
│   ├── Attack-Scenario-Manual.md
│   ├── Lab-Manual.md
│   ├── Nexora_AD_Lab_Assessment_Report.pdf
│   └── screenshots/
├── evidence/
│   ├── ACLAbuse/
│   ├── CredentialExposure/
│   ├── kerberoasting/
│   ├── final-audit-summary.txt
│   └── README.md
├── mitre/
├── notes/
├── presentation/
├── index.html
├── redteam-lab.html
└── supporting JavaScript and CSS
```

## Reproduction and validation

1. Keep all virtual machines on a host-only network with no route to production or corporate systems.
2. Take clean snapshots before assessment activity.
3. Record each command, source VM, target, timestamp, account role and observed result.
4. Preserve failed tests as failures and keep conflicting runs separate.
5. Redact credentials, hashes, tickets, tokens, private keys and personal data before committing evidence.
6. Re-run checks after remediation and attach the resulting sanitized output.
7. Do not claim an attack path is reproducible until it has been repeated from a clean snapshot.

See [docs/Lab-Manual.md](docs/Lab-Manual.md) and [docs/Attack-Scenario-Manual.md](docs/Attack-Scenario-Manual.md).

## Tools and technologies

- **Operating systems:** Kali Linux, Windows Server 2022, Windows client
- **Directory and network assessment:** BloodHound, LDAP utilities, SMB client tools, NetExec
- **Kerberos / AD tooling:** Impacket utilities and native Windows administration tools
- **Validation and reporting:** PowerShell, `dcdiag`, Git, Markdown, MITRE ATT&CK

Only use these tools against systems you own or are explicitly authorized to assess.

## Safety and scope

- This is an educational lab, not authorization to test external systems.
- Keep the environment isolated from the internet, corporate and production networks.
- Use synthetic lab identities and passwords only.
- Never commit live credentials, raw credential dumps, unredacted tickets, private keys, or sensitive BloodHound exports.
- The web dashboard contains demonstration/simulated UI elements; do not interpret animated counters or demo output as live telemetry.

## Current project status

**Assessment documented; follow-up validation required.** The available final report does not demonstrate full domain compromise, DCSync, hash recovery, Golden Ticket use or successful password cracking. The disabled `krbtgt` state and host identity discrepancy remain open validation items.

## Author and project context

Prepared as an Active Directory security lab and portfolio project for cybersecurity internship learning. Findings are reported conservatively and should be updated only when fresh, sanitized evidence supports the change.
