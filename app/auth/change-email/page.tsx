"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Loader2, ArrowLeft, Shield, CheckCircle } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";

export default function ChangeEmailPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1); // 1: new email + password, 2: verification code
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail.trim()) {
      setError("Please enter your new email address");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your current password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiClient.changeEmail(newEmail, password);
      if (response.success) {
        setStep(2);
        toast({
          title: "Verification Code Sent",
          description: `A verification code has been sent to ${newEmail}`,
        });
      } else {
        setError(response.message || "Failed to send verification code");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiClient.verifyEmailChange(newEmail, code);
      if (response.success) {
        // Update the user's email in the auth context
        updateUser({ email: newEmail });

        toast({
          title: "Email Changed Successfully",
          description: "Your email address has been updated.",
        });
        router.push("/profile");
      } else {
        setError(response.message || "Invalid verification code");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const response = await apiClient.changeEmail(newEmail, password);
      if (response.success) {
        toast({
          title: "Code Resent",
          description: "A new verification code has been sent to your email.",
        });
      }
    } catch (err) {
      console.error("Failed to resend code:", err);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not logged in
  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {step === 1 ? (
                <Mail className="w-8 h-8 text-blue-600" />
              ) : (
                <Shield className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <CardTitle>
              {step === 1 ? "Change Email Address" : "Verify New Email"}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? `Current email: ${user.email}`
                : `Enter the verification code sent to ${newEmail}`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 1 ? (
              <form onSubmit={handleSendVerification} className="space-y-4">
                <div>
                  <Label htmlFor="newEmail">New Email Address</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="new@email.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Current Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your current password"
                    required
                  />
                </div>

                {error && <div className="text-red-600 text-sm">{error}</div>}

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailChange} className="space-y-4">
                <div>
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setCode(value);
                      setError("");
                    }}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="text-center font-mono text-2xl tracking-widest"
                  />
                </div>

                {error && <div className="text-red-600 text-sm">{error}</div>}

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={loading || code.length !== 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email Change"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendCode}
                  className="w-full"
                  disabled={loading}
                >
                  Resend Code
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link href="/profile">
                <Button variant="ghost" className="text-sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
