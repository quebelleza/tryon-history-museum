const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('src/app/api/contact/route.js', 'utf8').replace(/^import .*;$/gm, '').replace('export async function POST', 'async function POST');
const valid = { name: ' Visitor ', email: 'visitor@example.com', subject: ' Visit ', message: 'Hello museum', turnstileToken: 'token' };
function setup(options = {}) {
  const sent = [];
  const context = { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) },
    process: { env: options.env || { TURNSTILE_SECRET_KEY: 'test', RESEND_API_KEY: 'test' } }, AbortSignal,
    fetch: async () => { if(options.networkError) throw Error(); return { ok: true, json: async () => options.verification || { success: true, action: 'contact', hostname: 'www.tryonhistorymuseum.org' } }; },
    Resend: class { emails = { send: async payload => { sent.push(payload); if(options.sendThrows) throw Error(); return options.sendResult || { data: { id: 'email-id' } }; } }; }
  };
  vm.createContext(context); vm.runInContext(source, context);
  return { sent, post: (body) => context.POST({ json: async () => body }) };
}
for (const [name, body, options, status] of [
  ['null body', null, {}, 400], ['wrong field type', {...valid, name: 12}, {}, 400],
  ['empty message', {...valid, message: ' '}, {}, 400], ['oversize message', {...valid, message: 'x'.repeat(10001)}, {}, 400],
  ['invalid email', {...valid, email:'invalid'}, {}, 400], ['subject newline', {...valid, subject:'Hi\nInjected'}, {}, 400],
  ['missing token', {...valid, turnstileToken:''}, {}, 400],
  ['failed challenge', valid, {verification:{success:false}}, 400],
  ['wrong action', valid, {verification:{success:true,action:'board_application',hostname:'www.tryonhistorymuseum.org'}}, 400],
  ['wrong hostname', valid, {verification:{success:true,action:'contact',hostname:'other.example'}}, 400],
  ['missing config', valid, {env:{}}, 503], ['verification outage', valid, {networkError:true}, 503],
]) test(name, async () => { const app=setup(options); assert.equal((await app.post(body)).status,status); assert.equal(app.sent.length,0); });
for (const options of [{sendResult:{error:{message:'failed'}}}, {sendResult:{data:null}}, {sendThrows:true}])
  test('delivery failure never reports success '+JSON.stringify(options),async()=>{const app=setup(options); assert.equal((await app.post(valid)).status,502);});
test('accepted message goes to museum with visitor reply-to',async()=>{
  const app=setup(); const response=await app.post(valid); assert.equal(response.status,200); assert.equal(response.body.success,true);
  assert.equal(app.sent.length,1); assert.equal(app.sent[0].to,'info@tryonhistorymuseum.org'); assert.equal(app.sent[0].replyTo,valid.email);
  assert.equal(app.sent[0].subject,'[Website Contact] Visit'); assert.ok(app.sent[0].text.includes('Name: Visitor\n')); assert.ok(app.sent[0].text.endsWith(valid.message));
});
