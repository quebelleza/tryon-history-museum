"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  // checking | ready | loading | success | error | expired
  const [status, setStatus] = useState("checking");
  const [errorMsg, setErrorMsg] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setRequestEmail(user.email ?? "");
        setStatus("ready");
      } else {
        setStatus("expired");
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setErrorMsg("Could not set your password. The link may have expired — request a new one below.");
    } else {
      setStatus("success");
      setTimeout(() => router.push("/member/dashboard"), 1500);
    }
  }

  async function handleRequestNew() {
    if (!requestEmail) return;
    try {
      await fetch("/api/auth/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: requestEmail }),
      });
    } catch {
      // ignore
    }
    setRequestSent(true);
  }

  return (
    <main id="main-content">
      <Nav />
      <section
        className="pt-40 pb-20 md:pt-48 md:pb-28 min-h-[80vh]"
        style={{ background: "#FAF7F4" }}
      >
        <div className="max-w-[440px] mx-auto px-5 md:px-8">
          <FadeIn>
            {/* ── Checking session ── */}
            {status === "checking" && (
              <p className="font-body text-[14px]" style={{ color: "rgba(26,19,17,0.45)" }}>
                Loading…
              </p>
            )}

            {/* ── Expired / no session ── */}
            {(status === "expired" || status === "error") && (
              <div>
                <div
                  className="font-body text-[11px] uppercase mb-4"
                  style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
                >
                  Account Setup
                </div>
                <h1
                  className="font-display text-3xl font-light mb-3"
                  style={{ color: WARM_BLACK }}
                >
                  This link has{" "}
                  <span className="italic font-semibold">expired.</span>
                </h1>
                <p
                  className="font-body text-[15px] leading-[1.7] mb-8"
                  style={{ color: "rgba(26,19,17,0.6)" }}
                >
                  Setup links are valid for 24 hours and can only be used once.
                  Enter your email to receive a new one.
                </p>
                {requestSent ? (
                  <p
                    className="font-body text-[15px] leading-[1.7]"
                    style={{ color: DEEP_RED }}
                  >
                    Check your inbox — we sent a new setup link to the email on
                    file.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full font-body text-sm px-4 py-3 outline-none"
                      style={{
                        background: "#FFFDF9",
                        border: "1px solid rgba(123,45,38,0.12)",
                        color: WARM_BLACK,
                      }}
                    />
                    <button
                      onClick={handleRequestNew}
                      className="w-full font-body text-[13px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110"
                      style={{
                        letterSpacing: "0.12em",
                        color: WARM_BLACK,
                        background: GOLD_ACCENT,
                        padding: "14px 36px",
                        border: "none",
                      }}
                    >
                      Send a New Link
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Password form ── */}
            {(status === "ready" || status === "loading") && (
              <div>
                <div
                  className="font-body text-[11px] uppercase mb-4"
                  style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
                >
                  Account Setup
                </div>
                <h1
                  className="font-display text-3xl md:text-4xl font-light mb-2"
                  style={{ color: WARM_BLACK }}
                >
                  Create a{" "}
                  <span className="italic font-semibold">Password</span>
                </h1>
                <p
                  className="font-body text-[15px] leading-[1.7] mb-7"
                  style={{ color: "rgba(26,19,17,0.6)" }}
                >
                  Set a password to sign in to your member account anytime.
                </p>
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div>
                    <label
                      htmlFor="sp-password"
                      className="block font-body text-[12px] uppercase mb-2 font-semibold"
                      style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                    >
                      Password
                    </label>
                    <input
                      id="sp-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="w-full font-body text-sm px-4 py-3 outline-none"
                      style={{
                        background: "#FFFDF9",
                        border: "1px solid rgba(123,45,38,0.12)",
                        color: WARM_BLACK,
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sp-confirm"
                      className="block font-body text-[12px] uppercase mb-2 font-semibold"
                      style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                    >
                      Confirm Password
                    </label>
                    <input
                      id="sp-confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="w-full font-body text-sm px-4 py-3 outline-none"
                      style={{
                        background: "#FFFDF9",
                        border: "1px solid rgba(123,45,38,0.12)",
                        color: WARM_BLACK,
                      }}
                    />
                  </div>
                  {errorMsg && (
                    <p
                      className="font-body text-sm m-0"
                      style={{ color: DEEP_RED }}
                    >
                      {errorMsg}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full font-body text-[13px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-60"
                    style={{
                      letterSpacing: "0.12em",
                      color: WARM_BLACK,
                      background: GOLD_ACCENT,
                      padding: "16px 36px",
                      border: "none",
                    }}
                  >
                    {status === "loading" ? "Saving…" : "Set Password"}
                  </button>
                </form>
              </div>
            )}

            {/* ── Success ── */}
            {status === "success" && (
              <p
                className="font-body text-[15px] leading-[1.7]"
                style={{ color: DEEP_RED }}
              >
                Password set! Taking you to your dashboard…
              </p>
            )}
          </FadeIn>
        </div>
      </section>
      <Footer />
    </main>
  );
}
