# Nexora Active Directory Lab — Assessment Screenshots & Evidence Gallery

This directory contains technical screenshots and visual evidence captures from the **Nexora Active Directory Lab — Penetration Testing & Security Configuration Review** (Controlled Lab Assessment Report).

Full report reference: [Nexora_AD_Lab_Assessment_Report.pdf](../Nexora_AD_Lab_Assessment_Report.pdf)

---

### Screenshot A-1: DNS Resolution & Domain Controller Reachability
![Screenshot A-1](screenshot_a1_dns_nslookup.jpeg)

- **Source Capture:** `IMG_3CCA7AD7-5762-4F16-8707-54586DF837A1.jpeg`
- **Scope Item:** Network Reachability & Active Directory DNS resolution (Evidence `E-06`).
- **Command Executed:**
  ```powershell
  nslookup nexora.local 192.168.23.129
  ```
- **Observed Result:** Validated that Domain Controller `NEXORA-DC` (`192.168.23.129`) responds to DNS queries for `nexora.local` and resolves to address `192.168.23.129`.

---

### Screenshot A-2: Windows Client TCP/IP Configuration
![Screenshot A-2](screenshot_a2_client_ipconfig.jpeg)

- **Source Capture:** `IMG_D72F33A9-311C-4F3A-A078-D93D2B949758.jpeg`
- **Scope Item:** Client Workstation Network Configuration (`DESKTOP-M8PCMPL`).
- **Command Executed:**
  ```cmd
  ipconfig /all
  ```
- **Observed Result:** Confirmed Windows Client joined to domain `nexora.local` on the isolated VMware subnet (`192.168.23.130/24`) pointing to DNS server `192.168.23.129`.

---

### Screenshot A-3: Domain Controller Interface Configuration
![Screenshot A-3](screenshot_a3_dc_ipconfig.jpeg)

- **Source Capture:** `IMG_C1D5805B-26F2-4E3A-BE89-EA2D6B36361A.jpeg`
- **Scope Item:** Domain Controller Network Adapter Settings (`NEXORA-DC`).
- **Command Executed:**
  ```cmd
  ipconfig /all
  ```
- **Observed Result:** Windows Server 2022 Datacenter interface `Ethernet0` configured with static IP `192.168.23.129`, subnet mask `255.255.255.0`, and primary DNS pointing to local loopback / `127.0.0.1`.

---

### Screenshot A-4: Windows 10 Client Network Adapter Properties
![Screenshot A-4](screenshot_a4_adapter_ipv4_config.jpeg)

- **Source Capture:** `IMG_E3B92702-DC46-439F-958D-E26AF666F5C4.jpeg`
- **Scope Item:** IPv4 Properties & Static IP Assignment on Client Workstation.
- **Observed Result:** Graphic User Interface (GUI) verification of Internet Protocol Version 4 (TCP/IPv4) properties on `DESKTOP-M8PCMPL`, showing manual configuration for host-only private networking without external gateway routing.

---

### Screenshot A-5: Advanced TCP/IP DNS Configuration & Suffix Settings
![Screenshot A-5](screenshot_a5_advanced_dns_settings.jpeg)

- **Source Capture:** `IMG_0E4A481A-D9DC-4F60-A83E-4BA40A2DB6EA.jpeg`
- **Scope Item:** DNS Suffix Search List & Dynamic Registration.
- **Observed Result:** Advanced TCP/IP Settings window verifying primary DNS server list (`192.168.23.129`), DNS suffix append list (`nexora.local`), and domain registration controls.

---

### Summary of Assessment Findings Supported by Evidence

| Finding ID | Title | Rating | Evidence / Impact Summary |
| :--- | :--- | :--- | :--- |
| **F-01** | No account-lockout threshold reported | **Medium / Hardening** | Effective password-policy query reported threshold: `None`. Default Domain Policy: `LockoutBadCount=0`. |
| **F-02** | Anonymous SMB session accepted; data denied | **Informational** | Null Auth accepted, but `IPC$` and `SYSVOL` connections returned `NT_STATUS_ACCESS_DENIED`. |
| **F-03** | SMB signing required; SMBv1 disabled | **Positive Control** | `EnableSMB1Protocol=False`, `RequireSecuritySignature=True`, signing required. |
| **F-04** | Authenticated user reads standard SYSVOL | **Expected / Review** | Standard policy folders accessible; scripts directories verified empty of hardcoded secrets. |
| **F-05** | DC policy template specifies LDAP signing | **Positive Indication** | Default Domain Controllers Policy contains `LDAPServerIntegrity=4,1`. |
