# auth.md

IZODIAMANT is a public, read-only informational website for a Czech masonry
remediation company (sanace vlhkého zdiva). It exposes **no protected resources**
and requires **no authentication and no agent registration**. All content and
discovery endpoints are freely accessible to agents and crawlers over HTTPS.

## Agent audience

Any autonomous agent, assistant, or crawler may access this site. There is no
audience restriction, allow-list, or approval step.

## Registration / provisioning

**None required — there is no registration or provisioning endpoint.** Agents do
not register, request credentials, or exchange tokens to read anything here.
Every request is served anonymously. Do not attempt to POST to a registration
URL; none is published because none exists.

## Supported methods

- Anonymous HTTPS `GET` on all public paths.
- Content negotiation: send `Accept: text/markdown` on any HTML page to receive a
  Markdown representation of the site (see also [`/llms.txt`](https://izodiamant.cz/llms.txt)).

## Credentials

**None.** Do not send `Authorization` headers, API keys, or bearer tokens — they
are neither required nor processed, and this site issues no credential of any kind.

## Discovery endpoints

- [`/llms.txt`](https://izodiamant.cz/llms.txt) — site summary and service catalog for LLMs
- [`/.well-known/agent-card.json`](https://izodiamant.cz/.well-known/agent-card.json) — agent card
- [`/.well-known/mcp/server-card.json`](https://izodiamant.cz/.well-known/mcp/server-card.json) — MCP server card
- [`/.well-known/oauth-protected-resource`](https://izodiamant.cz/.well-known/oauth-protected-resource) — resource metadata (open access, no auth)

## Contact

Human inquiries: info@izodiamant.cz · +420 737 017 012
