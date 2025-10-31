"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/shared/Navbar";

type RegistrationStep =
  | "email"
  | "verify"
  | "password"
  | "personal"
  | "skills"
  | "experience"
  | "education"
  | "links"
  | "complete";

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const router = useRouter();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    setCurrentStep("verify");
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setError("Verification code is required");
      return;
    }
    setCurrentStep("password");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setCurrentStep("personal");
  };

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      setError("Name is required");
      return;
    }
    setCurrentStep("skills");
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        phone: "",
        role: "JOBSEEKER",
      });
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen p-4 py-20">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Create Your Profile</CardTitle>
            <CardDescription className="text-purple-100">
              Beautiful Multi-Step Registration
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {currentStep === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">Welcome!</h3>
                  <p className="text-gray-600">Enter your email</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-center text-sm">
                  <Link href="/auth/login" className="text-purple-600">
                    Sign in
                  </Link>
                </p>
              </form>
            )}

            {currentStep === "verify" && (
              <form onSubmit={handleVerifySubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">Verify Email</h3>
                  <p className="text-gray-600">We sent a code to {email}</p>
                </div>
                <div>
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep("email")}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 bg-purple-600">
                    Verify
                  </Button>
                </div>
              </form>
            )}

            {currentStep === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">Create Password</h3>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep("verify")}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 bg-purple-600">
                    Continue
                  </Button>
                </div>
              </form>
            )}

            {currentStep === "personal" && (
              <form onSubmit={handlePersonalSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">Personal Info</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep("password")}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 bg-purple-600">
                    Continue
                  </Button>
                </div>
              </form>
            )}

            {currentStep === "skills" && (
              <form onSubmit={handleComplete} className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">All Set!</h3>
                  <p>Ready to complete registration?</p>
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep("personal")}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    {loading ? "Creating..." : "Complete"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
