# Security and Documentation Review

## Changes proposed in this branch

- Reframe the project status to avoid unsupported claims of a complete compromise.
- Align the README with the cautious conclusions in the final report.
- Clarify that Kerberos ticket retrieval does not prove password cracking or credential recovery.
- Record the unresolved `krbtgt` account state and hostname discrepancy.
- Add ignore patterns for common credential exports, packet captures and local secret artefacts.
- Label the browser-based dashboard as simulated rather than live telemetry.
- Replace screenshot documentation that exposed a plaintext password in a command with redaction guidance.

## Manual actions still required before merging

1. **Redact or remove sensitive binary screenshots.** Text-file edits cannot redact pixels in PNG/JPEG files. In particular, inspect SMB screenshots, hash dumps, Kerberos ticket output, credential screenshots, and any images claiming domain compromise. Do not merge until every retained image is safe for public viewing.
2. **Rotate secrets** if any displayed credential was real or reused. A public-history rewrite or file deletion cannot invalidate a credential.
3. **Resolve host identity.** The evidence associates `192.168.23.129` with `NEXORA-DC`, `dc01.nexora.local`, and `SVR-APP01`. Check the actual VM hostname, DNS forward/reverse records, and capture context.
4. **Validate strong attack claims.** The final report does not establish password cracking, DCSync, hash recovery, Golden Ticket use, or successful domain compromise. Only reinstate such claims if reproducible, sanitized evidence directly supports each stage.
5. **Check repository history and GitHub alerts.** Search current files and all reachable history for secrets. Remove leaked historical objects where feasible, check forks/caches, and rotate affected credentials.
6. **Verify dashboard wording.** Any hard-coded counters, animated terminal lines, and generated graph nodes must be labelled as a demo/simulation.

## Scope of this review

These changes improve consistency and safe publication. They do not execute the lab, independently validate VM state, redact binary screenshots, or prove that all historical secrets have been removed. Review each remaining file and image before merging.
