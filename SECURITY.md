# Security policy

## Reporting a vulnerability

Report SDK, build-pipeline, or published-package vulnerabilities through a private
GitHub security advisory for `Molten-Bot/mypos-connect-sdk`. Do not open a public
issue containing exploit details, credentials, bearer tokens, customer data, or
real order information.

Include the affected package/version, runtime, a minimal synthetic reproduction,
and the expected impact. Maintainers will acknowledge a valid report privately
and coordinate remediation and disclosure.

## Upstream service issues

This project generates a client for a third-party service; it does not operate
`api.myposconnect.com`. API-account compromise, production availability,
authorization errors, or server-side vulnerabilities must also be reported to the
MyPOS Connect service owner through their established private support channel.

## Supported versions

No public SDK version is supported until the contract-validation gate is complete.
After the first stable release, security fixes will target the latest major
version. Older prerelease versions may be deprecated rather than patched.

## Credential handling

- Configure secrets only in downstream server or worker environments.
- Never expose SDK credentials through browser-prefixed environment variables.
- Prefer short-lived bearer tokens over retaining API usernames and passwords.
- Ensure logs, error telemetry, fixtures, and support reports redact Authorization
  headers and token bodies.
