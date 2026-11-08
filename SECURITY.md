# Security Policy

## Supported Versions

Only the latest version is supported, unless a maintained branch exists for an
older major (e.g. `2.x.x`).

That said, if an unsupported version still has significant download numbers and
you believe a vulnerability could have real impact, please report it anyway —
it will be considered.

## Threat model

postcss-selector-parser parses CSS selectors written by developers. It is not
designed to process untrusted input of unbounded size, and parsing time is not
guaranteed to be linear in the input length.

If your application parses selectors coming from untrusted sources (user
input, third-party stylesheets, network requests), you are responsible for
bounding that input before it reaches the parser, for example with the
`maxInputLength` option or a request size limit.

Reports of excessive CPU or memory consumption caused by large or crafted
input, including algorithmic complexity, regular expression backtracking and
stack exhaustion, are handled as regular bugs: they are fixed in the next
release of the latest major version, without a security advisory, a CVE or a
backport. Please open a regular issue for those.

This exclusion does not apply when `maxInputLength` is set to 65536 or lower
and a selector within that limit keeps the parser busy for more than one second
on current hardware. We treat that as a security vulnerability.

## Reporting a Vulnerability

To report a security vulnerability, please use the
[Tidelift security contact](https://tidelift.com/security).
Tidelift will coordinate the fix and disclosure.

When reporting, please include as much detail as possible:

- A description of the vulnerability and its impact
- Steps to reproduce (a minimal reproduction is ideal)
- Affected version(s)
- Any suggested fix or mitigation, if you have one

## What to Expect

- Acknowledgement of your report within a reasonable delay.
- Confirmation of the issue and an assessment of its severity.
- A fix released as soon as reasonably possible, with credit to the reporter
  (unless you'd rather stay anonymous).

This is an open source project maintained on a best-effort basis, so timelines
may vary — thanks for your understanding, and for helping keep the ecosystem
safe.
