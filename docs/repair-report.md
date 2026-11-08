# Repair report — illustrative n8n workflow

## Defect symptoms
- Webhook is configured to return an immediate 200 before processing completes.
- Code node reads `$input.first().json.orderId`, but Webhook data normally appears at `$input.first().json.body.orderId`.
- Invalid requests can be treated as success.

## Root causes
- Trigger responseMode does not match downstream Respond to Webhook design.
- Incorrect assumptions about incoming Webhook data shape.
- No input validation or appropriate HTTP status on failure.

## Fix
- Set Webhook responseMode to `responseNode`.
- Correct JSON extraction and trim string fields.
- Return HTTP 400 on invalid input, 200 on accepted input.
- Add unit tests for valid and invalid payloads.

## Regression check
Seven inline validation scenarios passed before repository commit, plus the `npm test` suite is supplied for repeatable verification.

## Limitations
The embedded Code-node logic and JSON configuration were tested in a JavaScript harness. A full isolated n8n end-to-end HTTP test remains to be performed. No live client data, API credentials or customer environments were accessed.

## Client repair checklist
1. Capture exact failing workflow export, n8n version, execution error and expected output.
2. Redact secrets and use authorized test credentials.
3. Reproduce issue with nonproduction sample data.
4. Apply a scoped change and regression test.
5. Document the change, rollback path and limitations.
6. Obtain client acceptance before activating in production.
