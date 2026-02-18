"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";

export default function LoginSection() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error | reset_sent
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus("error");
      setErrorMsg(
        "We couldn't find an account with those details. Please try again."
      );
    } else {
      setStatus("idle");
      router.push("/member/dashboard");
      router.refresh();
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    if (!email) {
      setStatus("error");
      setErrorMsg("Please enter your email address above, then click Forgot your password.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/member/dashboard`,
    });

    if (error) {
      setStatus("error");
      setErrorMsg("Something went wrong sending the reset email. Please try again.");
    } else {
      setStatus("reset_sent");
    }
  }

  return (
    <section
      className="pt-40 pb-20 md:pt-48 md:pb-28 min-h-[80vh]"
      style={{ background: "#FAF7F4" }}
    >
      <div className="max-w-[440px] mx-auto px-5 md:px-8">
        <FadeIn>
          <div className="text-center mb-10">
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Members
            </div>
            <h1
              className="font-display text-4xl md:text-5xl font-light mb-4"
              style={{ color: WARM_BLACK }}
            >
              Member <span className="italic font-semibold">Login</span>
            </h1>
            <p
              className="font-body text-[15px] leading-[1.7] m-0"
              style={{ color: "rgba(26,19,17,0.6)" }}
            >
              Access your member benefits, exclusive event details, and more.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          {status === "reset_sent" ? (
            <div
              className="p-8 text-center"
              style={{
                background: "#FFFDF9",
                border: "1px solid rgba(123,45,38,0.08)",
              }}
            >
              <div
                className="font-display text-xl font-semibold mb-3"
                style={{ color: WARM_BLACK }}
              >
                Check your email.
              </div>
              <p
                className="font-body text-[15px] m-0"
                style={{ color: "rgba(26,19,17,0.6)" }}
              >
                We&apos;ve sent a password reset link to <strong>{email}</strong>.
                Follow the link to reset your password.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleLogin}
              className="space-y-5"
              aria-label="Member login"
            >
              <div>
                <label
                  htmlFor="login-email"
                  className="block font-body text-[12px] uppercase mb-2 font-semibold"
                  style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                >
                  Email Address
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                  style={{
                    background: "#FFFDF9",
                    border: "1px solid rgba(123,45,38,0.12)",
                    color: WARM_BLACK,
                  }}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block font-body text-[12px] uppercase mb-2 font-semibold"
                  style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                >
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                  style={{
                    background: "#FFFDF9",
                    border: "1px solid rgba(123,45,38,0.12)",
                    color: WARM_BLACK,
                  }}
                  placeholder="Your password"
                />
              </div>

              {status === "error" && errorMsg && (
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
                {status === "loading" ? "Signing In…" : "Sign In"}
              </button>

              <div className="text-center space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-body text-[13px] bg-transparent border-none cursor-pointer underline transition-colors hover:opacity-70"
                  style={{ color: MUTED_RED }}
                >
                  Forgot your password?
                </button>
                <p
                  className="font-body text-[14px] m-0"
                  style={{ color: "rgba(26,19,17,0.5)" }}
                >
                  Not a member yet?{" "}
                  <Link
                    href="/membership"
                    className="no-underline font-semibold transition-colors hover:opacity-70"
                    style={{ color: DEEP_RED }}
                  >
                    Learn more →
                  </Link>
                </p>
              </div>
            </form>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
