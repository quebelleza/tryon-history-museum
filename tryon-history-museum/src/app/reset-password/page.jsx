"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import FadeIn from "@/components/FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

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
      setErrorMsg(
        "Could not update your password. Please try again or request a new reset link."
      );
    } else {
      setStatus("success");
      setTimeout(() => router.push("/member/status"), 1500);
    }
  }

  return (
    <section className="min-h-screen py-32" style={{ background: "#FAF7F4" }}>
      <div className="max-w-[420px] mx-auto px-5 md:px-8">
        <FadeIn>
          <div
            className="p-8 md:p-10"
            style={{
              background: "#FFFDF9",
              border: "1px solid rgba(123,45,38,0.08)",
            }}
          >
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}
            >
              Password Reset
            </div>
            <h1
              className="font-display text-2xl font-light mb-2"
              style={{ color: WARM_BLACK }}
            >
              Set a New <span className="italic font-semibold">Password</span>
            </h1>
            <p
              className="font-body text-[14px] leading-[1.7] mb-7"
              style={{ color: "rgba(26,19,17,0.55)" }}
            >
              Choose a new password for your account.
            </p>

            {status === "success" ? (
              <p
                className="font-body text-[14px] leading-[1.7]"
                style={{ color: DEEP_RED }}
              >
                Password updated! Redirecting you…
              </p>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label
                    htmlFor="rp-password"
                    className="block font-body text-[10px] uppercase mb-1.5"
                    style={{ letterSpacing: "0.15em", color: "rgba(26,19,17,0.45)" }}
                  >
                    New Password
                  </label>
                  <input
                    id="rp-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full font-body text-[14px] outline-none"
                    style={{
                      border: "1px solid rgba(26,19,17,0.15)",
                      padding: "10px 12px",
                      background: "#FAF7F4",
                      color: WARM_BLACK,
                    }}
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="rp-confirm"
                    className="block font-body text-[10px] uppercase mb-1.5"
                    style={{ letterSpacing: "0.15em", color: "rgba(26,19,17,0.45)" }}
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="rp-confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full font-body text-[14px] outline-none"
                    style={{
                      border: "1px solid rgba(26,19,17,0.15)",
                      padding: "10px 12px",
                      background: "#FAF7F4",
                      color: WARM_BLACK,
                    }}
                  />
                </div>

                {errorMsg && (
                  <p
                    className="font-body text-[13px] mb-4"
                    style={{ color: DEEP_RED }}
                  >
                    {errorMsg}{" "}
                    {status === "error" && (
                      <Link
                        href="/login"
                        className="no-underline font-semibold hover:underline"
                        style={{ color: DEEP_RED }}
                      >
                        Request a new link →
                      </Link>
                    )}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full font-body text-[13px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    letterSpacing: "0.12em",
                    color: WARM_BLACK,
                    background: GOLD_ACCENT,
                    padding: "14px 36px",
                    border: "none",
                  }}
                >
                  {status === "loading" ? "Saving…" : "Set New Password"}
                </button>
              </form>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
