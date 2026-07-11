"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Eye, EyeOff, Mail, Key, Lock, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Step 1: Request OTP code
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${apiUrl}/api/patient/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Verification code sent to your email!");
        setStep(2);
      } else {
        setError(data.message || "Failed to initiate password reset.");
      }
    } catch (err) {
      console.error(err);
      setError("Server unreachable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${apiUrl}/api/patient/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP code verified! You can now create your new password.");
        setStep(3);
      } else {
        setError(data.message || "Invalid or expired OTP code.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password & Login
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/api/patient/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("patientToken", data.token);
        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("patient", JSON.stringify(data.user));
        }

        alert("Password reset successfully! Logging you in...");
        router.push("/patient/dashboard");
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Side Info Panel */}
      <div className="hidden lg:flex w-1/2 bg-blue-900 text-white flex-col items-center justify-center p-12">
        <Image
          src="/logo.png"
          alt="Dental Management System"
          width={180}
          height={180}
          className="mb-8"
          style={{ width: "auto", height: "auto" }}
        />
        <h1 className="text-5xl font-bold text-center leading-tight">
          Reset Your
          <br />
          Password
        </h1>
        <p className="mt-6 text-lg text-blue-100 text-center max-w-md leading-relaxed">
          Verify your identity with a secure OTP code to regain access to your dental patient records, bills, and bookings.
        </p>
      </div>

      {/* Right Side Card Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          
          {/* Back to Login Button */}
          <button
            onClick={() => {
              if (step > 1) {
                setStep(step - 1);
                setError("");
                setMessage("");
              } else {
                router.push("/");
              }
            }}
            className="flex items-center gap-2 text-blue-700 font-semibold mb-6 hover:underline"
          >
            <ArrowLeft size={18} />
            {step > 1 ? "Previous Step" : "Back to Login"}
          </button>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Recover your Dentplus patient portal account in three easy steps.
          </p>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center mb-8 gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <div className={`flex-1 h-0.5 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
          </div>

          {/* Errors / Success Alerts */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-4 bg-teal-50 border border-teal-200 text-teal-800 text-sm rounded-lg flex items-start gap-2">
              <CheckCircle2 size={18} className="text-teal-600 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {/* Step 1 Form */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 py-3 text-gray-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-700 py-3 text-white font-semibold transition duration-300 hover:bg-blue-800 hover:shadow-lg disabled:opacity-50"
              >
                {loading ? "Sending..." : "Request Verification Code"}
              </button>
            </form>
          )}

          {/* Step 2 Form */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-Digit OTP Code
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Type the security code sent to <strong className="text-gray-700">{email}</strong>.
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400">
                    <Key size={18} />
                  </span>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="Enter OTP code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 py-3 text-gray-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200 font-medium text-center tracking-widest font-mono text-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-700 py-3 text-white font-semibold transition duration-300 hover:bg-blue-800 hover:shadow-lg disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </form>
          )}

          {/* Step 3 Form */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white pl-11 pr-12 py-3 text-gray-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 py-3 text-gray-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-700 py-3 text-white font-semibold transition duration-300 hover:bg-blue-800 hover:shadow-lg disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset & Log In"}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Dentplus Dental Management System
          </p>
        </div>
      </div>
    </div>
  );
}
