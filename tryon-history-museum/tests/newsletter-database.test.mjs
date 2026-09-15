import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('newsletter database lifecycle, limits, permissions, and replay protection', async () => {
  const db = new PGlite();
  try {
    await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
    await db.exec(await readFile('supabase/migrations/015_newsletter.sql','utf8'));
    const call = async (name,params) => (await db.query(`select public.${name}(${params.map((_,i)=>'$'+(i+1)).join(',')}) as result`,params)).rows[0].result;
    const request = (email,c,u) => call('newsletter_request',[email,c,u]);
    const status = async (email) => (await db.query('select status from public.newsletter_subscribers where email=$1',[email])).rows[0].status;
    assert.equal(await request('test@example.com','confirm-1','unsubscribe-1'),true);
    assert.equal(await status('test@example.com'),'pending');
    assert.equal(await request('test@example.com','discarded','discarded-u'),false);
    assert.equal(await call('newsletter_confirm',['unknown']),false);
    assert.equal(await call('newsletter_confirm',['confirm-1']),true);
    assert.equal(await call('newsletter_confirm',['confirm-1']),true);
    assert.equal(await status('test@example.com'),'subscribed');
    assert.equal(await request('test@example.com','discarded','discarded-u'),false);
    assert.equal(await call('newsletter_unsubscribe',['unsubscribe-1']),true);
    assert.equal(await call('newsletter_unsubscribe',['unsubscribe-1']),true);
    assert.equal(await status('test@example.com'),'unsubscribed');
    assert.equal(await call('newsletter_confirm',['confirm-1']),false);
    await db.exec("update public.newsletter_subscribers set requested_at=now()-interval '11 minutes'");
    assert.equal(await request('test@example.com','confirm-2','unsubscribe-2'),true);
    assert.equal(await status('test@example.com'),'pending');
    assert.equal(await call('newsletter_unsubscribe',['unsubscribe-1']),false);
    assert.equal(await call('newsletter_confirm',['confirm-1']),false);
    await db.exec("update public.newsletter_subscribers set confirmation_expires_at=now()-interval '1 second'");
    assert.equal(await call('newsletter_confirm',['confirm-2']),false);
    await db.exec("update public.newsletter_subscribers set requested_at=now()-interval '11 minutes'");
    assert.equal(await request('test@example.com','confirm-3','unsubscribe-3'),true);
    await db.exec("update public.newsletter_subscribers set requested_at=now()-interval '11 minutes'");
    assert.equal(await request('test@example.com','confirm-4','unsubscribe-4'),false);
    assert.equal(await call('newsletter_unsubscribe',['unsubscribe-3']),true);
    assert.equal(await call('newsletter_confirm',['confirm-3']),false);
    await db.exec("update public.newsletter_subscribers set request_window_start=now()-interval '25 hours'");
    assert.equal(await request('test@example.com','confirm-4','unsubscribe-4'),true);
    assert.equal(await call('newsletter_confirm',['confirm-4']),true);
    for (const role of ['anon','authenticated']) {
      await db.exec(`set role ${role}`);
      await assert.rejects(db.query('select * from public.newsletter_subscribers'));
      await assert.rejects(call('newsletter_request',['bad@example.com','bad','bad-u']));
      await assert.rejects(call('newsletter_confirm',['confirm-4']));
      await assert.rejects(call('newsletter_unsubscribe',['unsubscribe-4']));
      await db.exec('reset role');
    }
    await db.exec('set role service_role');
    assert.equal(await call('newsletter_unsubscribe',['unsubscribe-4']),true);
    assert.equal(await status('test@example.com'),'unsubscribed');
  } finally { await db.close(); }
});
