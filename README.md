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

## 🏗️ Lab Architecture

The lab operates on a strictly isolated, host-only virtual network (`192.168.23.0/24`) with no route to the internet.

### Standard Build (Recommended)

Use this baseline topology for a repeatable lab build:

| Virtual machine | Purpose | Recommended configuration | Network |
|---|---|---|---|
| Windows Server 2022 | Active Directory Domain Services and DNS (`nexora.local`) | 2–4 vCPUs, 4–6 GB RAM, 60 GB disk | Host-only VMnet |
| Windows 10 | Domain-joined client workstation | 2 vCPUs, 4–6 GB RAM, 50–60 GB disk | Same host-only VMnet |
| Kali Linux | Authorized assessment workstation | 2–4 vCPUs, 4–6 GB RAM, 40 GB disk | Same host-only VMnet |

*These are suggested starting resources, not verified specifications of the existing VMs. Adjust them to the host computer’s available resources. Keep the lab on a host-only network with no internet or production route; do not add a bridged adapter.*

| System | Role | Documented address |
|---|---|---|
| Windows Server 2022 — `NEXORA-DC` | Intended Domain Controller / DNS | `192.168.23.129/24` |
| Windows 10 — `DESKTOP-M8PCMPL` | Domain client | `192.168.23.130/24` |
| Kali Linux — `Nexora-Kali` | Assessment workstation | `192.168.23.131/24` |
| Active Directory | Domain / NetBIOS | `nexora.local` / `NEXORA` |

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

## 🛠️ Tooling Used

The lab uses free and open-source tools where applicable:

- **Enumeration & Mapping:** BloodHound, SharpHound, NetExec (formerly CrackMapExec)
- **Exploitation & protocol testing:** Impacket utilities (`secretsdump`, `psexec`, `GetUserSPNs`, `smbclient`), `rpcclient`
- **Password-audit tools:** John the Ripper, Hashcat
- **Operating systems:** Kali Linux, Windows Server Evaluation, Windows 10

Use offensive tools only in the isolated lab or on systems for which you have explicit authorization. The presence of a tool in this list does not imply that every listed technique was successfully executed in this assessment.


## 🔄 Lab Reset & Reproducibility

Use snapshots to return the lab to a known state before repeating tests:

1. **Prepare a baseline:** Configure the lab and verify the domain, DNS, VM hostnames, IP addresses and host-only network.
2. **Create clean snapshots:** Take a snapshot of each VM after baseline configuration and before assessment activity. Label them clearly, for example `Pre-Assessment`.
3. **Record the run:** For each test, note the snapshot used, date/time, source VM, target, account role, command or procedure, and observed result.
4. **Reset between runs:** Shut down or revert the relevant VMs to the baseline snapshots before repeating an attack path. Confirm the network and system clocks are correct after restoration.
5. **Validate outcomes:** Re-run the same checks and compare the output. Preserve failures and inconsistent results; do not describe a path as reproducible until it has been successfully repeated and documented.
6. **Store safe evidence:** Keep sanitized screenshots and logs in the evidence folders. Never commit passwords, hashes, tickets, private keys, or unredacted credential dumps.

**Current reproducibility status:** Repeatability of all end-to-end attack paths has not yet been established by the current final report. Treat the reset process above as the recommended validation workflow, not as a claim that every path has already been reproduced.

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
