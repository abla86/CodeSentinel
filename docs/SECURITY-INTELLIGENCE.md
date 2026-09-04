# Security Intelligence Layer

CodeSentinel can consume external security intelligence without embedding offensive tooling or exploit payloads.

## Sources

- Exploit Database (Exploit-DB): exploit records, affected products/versions, publication date, platform and vulnerability classification.
- CVE/NVD-compatible identifiers where available.
- Vendor security advisories.
- Dependency and container vulnerability findings.

## Normalized finding model

A finding should preserve provenance:

- source
- sourceId (for example an EDB identifier)
- publishedAt
- product
- affectedVersions
- vulnerabilityClass
- severity
- references
- detectedAt
- status
- remediation
- verification

External intelligence is evidence for triage, not proof that a target is vulnerable. Version and configuration must be verified before a finding is treated as applicable.

## War-Room boundary

**My-own-war-room remains private.** CodeSentinel may use sanitized concepts and contracts derived from the private system, such as:

- threat/finding lifecycle
- defensive triage
- asset and technology mapping
- auditability
- remediation workflow
- verification gates
- safe/read-only execution modes

Private War-Room source code, private data, credentials, operational attack logic and sensitive configurations must not be copied into this public repository.

## Exploit-DB presentation

The public UI should present exploit intelligence as defensive metadata and investigation context. It must not ship exploit payloads, credential lists, weaponized scripts or automated attack execution.

Source: https://www.exploit-db.com/