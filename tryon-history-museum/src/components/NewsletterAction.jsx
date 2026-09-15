"use client";
import { useEffect, useRef, useState } from 'react';

export default function NewsletterAction({ action }) {
  const [token, setToken] = useState('');
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const busy = useRef(false);
  const confirming = action === 'confirm';
  useEffect(() => {
    const value = window.location.hash.slice(1);
    if (/^[a-f0-9]{64}$/.test(value)) setToken(value);
    setReady(true);
    window.history.replaceState(null, '', window.location.pathname);
  }, []);
  async function submit() {
    if (!token || busy.current) return;
    busy.current = true;
    setStatus('sending');
    setError('');
    try {
      const response = await fetch(`/api/newsletter/${action}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok || data.success !== true) throw new Error(data.error || 'Please try again.');
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setError(error.message || 'We could not save your choice. Please try again.');
    } finally { busy.current = false; }
  }
  return <main id="main-content" className="min-h-screen bg-tryon-cream px-5 py-16 text-tryon-black">
    <div className="max-w-xl mx-auto bg-white border border-stone-200 p-6 sm:p-10">
      <a href="/" className="font-body text-sm underline">Tryon History Museum &amp; Visitor Center</a>
      <h1 className="font-display text-3xl mt-8 mb-5">{status === 'success' ? (confirming ? 'You’re subscribed!' : 'You’re unsubscribed') : (confirming ? 'Confirm your newsletter signup' : 'Unsubscribe from museum news')}</h1>
      {status === 'success' ? <p role="status" className="font-body text-base leading-relaxed">{confirming ? 'Thank you. You are now signed up for museum news, events, and history stories. You can unsubscribe using the link in your email.' : 'Your newsletter subscription or pending signup has been canceled. This does not change your museum membership or essential account emails.'}</p> : <>
        <p className="font-body text-base leading-relaxed mb-6">{confirming ? 'Choose Confirm below to receive museum news, event announcements, and stories from Tryon’s past.' : 'Choose Unsubscribe below to stop newsletter emails. No login is needed.'}</p>
        {ready && !token ? <p role="alert">This link is incomplete. Open the full link from your email.{confirming && <> You can also <a className="underline" href="/#newsletter">request a new confirmation email</a>.</>}</p> : <button type="button" onClick={submit} disabled={!ready || status === 'sending'} className="bg-[#7B2D26] text-white font-body text-base px-6 py-3 disabled:opacity-60">{status === 'sending' ? 'Saving…' : confirming ? 'Confirm my subscription' : 'Unsubscribe'}</button>}
        {error && <p role="alert" className="font-body mt-5 text-red-800">{error}</p>}
      </>}
      <p className="font-body text-sm mt-8">Need help? <a className="underline break-all" href="mailto:info@tryonhistorymuseum.org">Email the museum</a>.</p>
      <a href="/" className="font-body inline-block mt-5 underline">Return to the museum website</a>
    </div>
  </main>;
}
