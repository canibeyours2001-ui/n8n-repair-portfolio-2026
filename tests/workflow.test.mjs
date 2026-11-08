import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const broken = JSON.parse(fs.readFileSync(new URL('../workflows/broken-webhook.json', import.meta.url)));
const fixed = JSON.parse(fs.readFileSync(new URL('../workflows/repaired-webhook.json', import.meta.url)));
const getNode = (wf, type) => wf.nodes.find((node) => node.type === type);
const code = getNode(fixed, 'n8n-nodes-base.code').parameters.jsCode;
const execute = new Function('$input', code);
const run = (payload) => execute({ first: () => ({ json: payload }) })[0].json;

test('original Webhook is misconfigured, repair switches to responseNode', () => {
  assert.equal(getNode(broken, 'n8n-nodes-base.webhook').parameters.responseMode, 'onReceived');
  assert.equal(getNode(fixed, 'n8n-nodes-base.webhook').parameters.responseMode, 'responseNode');
  assert.equal(getNode(fixed, 'n8n-nodes-base.respondToWebhook').parameters.options.responseCode, '={{ $json.statusCode }}');
});
test('workflow remains inactive by default and has all required nodes', () => {
  assert.equal(fixed.active, false);
  for (const kind of ['n8n-nodes-base.webhook','n8n-nodes-base.code','n8n-nodes-base.respondToWebhook']) {
    assert.ok(getNode(fixed, kind));
  }
});
test('valid wrapped webhook payload returns normalized successful response', () => {
  assert.deepEqual(run({body:{orderId:' A-001 ', customerEmail:' buyer@example.org ',quantity:2}}),{
    ok:true,statusCode:200,order:{orderId:'A-001',customerEmail:'buyer@example.org',quantity:2}
  });
});
test('valid direct JSON request is supported', () => {
  assert.equal(run({orderId:'B-002',customerEmail:'buyer@example.org',quantity:3}).statusCode,200);
});
test('missing order ID returns 400', () => {
  const result=run({body:{customerEmail:'buyer@example.org',quantity:2}});
  assert.equal(result.statusCode,400);
  assert.match(result.errors.join(','),/orderId/);
});
test('invalid email returns 400', () => {
  const result=run({body:{orderId:'A-002',customerEmail:'bad',quantity:2}});
  assert.equal(result.statusCode,400);
  assert.match(result.errors.join(','),/customerEmail/);
});
test('invalid quantities return 400', () => {
  for(const quantity of [0,-1,1.5,100001,'2',null]){
    assert.equal(run({body:{orderId:'A-003',customerEmail:'buyer@example.org',quantity}}).statusCode,400);
  }
});
test('null and unexpected input fail without throwing', () => {
  assert.equal(run({body:null}).statusCode,400);
  assert.equal(run({body:[1,2]}).statusCode,400);
});
