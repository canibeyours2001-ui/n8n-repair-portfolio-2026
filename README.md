# n8n Webhook Repair Lab — Reproducible Demonstration

A **self-contained demonstration**, not a claim of paid client work. It models a common n8n failure where a Webhook trigger responds immediately, while the workflow expects a dedicated **Respond to Webhook** node. The broken version also reads fields from the wrong JSON level.

**Before:** Webhook configured with `responseMode: onReceived`; code reads `orderId` directly even though a normal webhook wraps it under `body`; failures are returned as apparent success.

**After:** Webhook uses `responseMode: responseNode`; Code node validates and normalizes payload fields; Respond to Webhook returns an explicit status (200 or 400).

## Files

- `workflows/broken-webhook.json` — intentionally broken, inactive n8n workflow.
- `workflows/repaired-webhook.json` — repaired, inactive n8n workflow.
- `tests/workflow.test.mjs` — automated regression tests of JSON configuration and embedded Code-node logic.
- `docs/repair-report.md` — before/after diagnosis, scope and test limitations.

## Local test

Node.js 20+:

```bash
npm test
```

No API keys, external services, or paid services required. Tests execute the Code node’s JavaScript in an isolated Node.js harness and inspect workflow JSON. **They do not constitute a full n8n runtime integration test.**

## Optional isolated n8n integration test

1. Import the repaired workflow JSON into a **separate test n8n instance**.
2. Keep it inactive until the webhook test is ready. Click **Listen for test event** in the Webhook node.
3. In a separate terminal, POST to the test webhook URL shown by that instance, replacing `<TEST_WEBHOOK_URL>`:

```bash
curl -i -X POST '<TEST_WEBHOOK_URL>' \
  -H 'Content-Type: application/json' \
  -d '{"orderId":"A-001","customerEmail":"buyer@example.org","quantity":2}'
```

4. Expect status 200 and `ok: true` on valid input. Repeat with `quantity: 0` and expect HTTP 400.
5. Do not expose a no-auth demo webhook publicly for real customer data. Add authentication, rate limits, and privacy controls before production use.

## Honest scope

This is a sample defect-repair case built for a freelance portfolio. It does **not** demonstrate having fixed a real customer’s n8n workflow, nor prove compatibility with every n8n version or third-party integration.

The recommended service is a narrowly scoped, one-workflow repair on a **client-owned** n8n installation, subject to authorized access, safe test data, and a written acceptance test. Customer credentials must never be committed here.

n8n reference: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/
