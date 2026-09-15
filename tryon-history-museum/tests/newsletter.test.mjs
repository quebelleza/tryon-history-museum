import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewsletterHandlers, hashToken } from '../src/lib/newsletter.mjs';
const valid = { email: ' Visitor@Example.com ', consent: true, turnstileToken: 'test-token' };
const req = (body) => ({ json: async () => body });
function setup(options = {}) {
  const calls = []; const emails = [];
  const handlers = createNewsletterHandlers({
    verify: async () => { if (options.verifyThrows) throw Error(); return options.verified ?? true; },
    rpc: async (name,args) => { calls.push({name,args}); if(options.dbThrows) throw Error(); return options.claimed ?? true; },
    send: async (payload) => { emails.push(payload); if(options.sendThrows) throw Error(); },
  });
  return { ...handlers, calls, emails };
}
for (const [name, body] of [['null',null],['invalid email',{...valid,email:'bad'}],['oversize email',{...valid,email:'x'.repeat(255)+'@example.com'}],['no consent',{...valid,consent:false}],['missing verification',{...valid,turnstileToken:''}]]) {
  test('signup rejects '+name,async()=>{const app=setup();assert.equal((await app.subscribe(req(body))).status,400);assert.equal(app.calls.length,0);assert.equal(app.emails.length,0);});
}
test('invalid JSON is rejected', async()=> {assert.equal((await setup().subscribe({json:async()=>{throw Error();}})).status,400);});
for(const [name,options,status] of [['failed verification',{verified:false},400],['verification outage',{verifyThrows:true},503],['database failure',{dbThrows:true},503]]) {
  test(name,async()=>{const app=setup(options);assert.equal((await app.subscribe(req(valid))).status,status);assert.equal(app.emails.length,0);});
}
test('pending and existing subscriber response stays generic; duplicate claim sends no email',async()=>{
  const app=setup({claimed:false}); const existing=await (await app.subscribe(req(valid))).json();const fresh=await (await setup().subscribe(req(valid))).json();assert.deepEqual(existing,fresh);assert.equal(app.emails.length,0);
});
test('signup normalizes email, stores only token hashes, and sends both links',async()=>{
  const app=setup(); const response=await app.subscribe(req(valid));assert.equal(response.status,200);assert.equal(app.calls[0].args.p_email,'visitor@example.com');assert.equal(app.emails.length,1);
  const email=app.emails[0]; assert.equal(email.to,'visitor@example.com');
  const confirm=email.text.match(/confirm#([a-f0-9]{64})/)[1];const unsubscribe=email.text.match(/unsubscribe#([a-f0-9]{64})/)[1];
  assert.notEqual(confirm,unsubscribe);assert.equal(app.calls[0].args.p_confirmation_hash,hashToken(confirm));assert.equal(app.calls[0].args.p_unsubscribe_hash,hashToken(unsubscribe));
  assert.ok(!JSON.stringify(await response.json()).includes(confirm));assert.match(email.text,/24 hours/);
});
test('email failure does not report success',async()=>{assert.equal((await setup({sendThrows:true}).subscribe(req(valid))).status,503);});
for(const action of ['confirm','unsubscribe']) {
  test(action+' requires a valid bearer token',async()=>{const app=setup();assert.equal((await app.action(req({token:'bad'}),action)).status,400);assert.equal(app.calls.length,0);});
  test(action+' invokes the proper database operation with a hash',async()=>{const app=setup();const token='a'.repeat(64);assert.equal((await app.action(req({token}),action)).status,200);assert.deepEqual(app.calls[0],{name:'newsletter_'+action,args:{p_hash:hashToken(token)}});});
  test(action+' reports invalid or expired link',async()=>{assert.equal((await setup({claimed:false}).action(req({token:'a'.repeat(64)}),action)).status,400);});
  test(action+' database failure is retryable',async()=>{assert.equal((await setup({dbThrows:true}).action(req({token:'a'.repeat(64)}),action)).status,503);});
}
