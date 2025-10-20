"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Brain,
  Users,
  Star,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Briefcase,
  TrendingUp,
  Building,
  Target,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/shared/Navbar";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              Find what's <span className="text-red-600">next</span>
            </h1>
            <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The #1 platform for mobile professionals to find startup jobs.
              Connect directly with founders at top companies.
            </p>

            <div className="flex justify-center space-x-4 mb-12">
              {!user ? (
                <>
                  <Link href="/auth/register">
                    <Button
                      size="lg"
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg rounded-full"
                    >
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/jobs">
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-8 py-4 text-lg rounded-full border-gray-300"
                    >
                      Browse Jobs
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/jobs">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg rounded-full"
                  >
                    Find Your Next Role
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-center space-x-16 mt-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">10K+</div>
                <div className="text-gray-600">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">5K+</div>
                <div className="text-gray-600">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">1M+</div>
                <div className="text-gray-600">Job Seekers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Job Seekers Love Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why job seekers love us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to find your next opportunity, all in one
              place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Direct connections
              </h3>
              <p className="text-gray-600">
                Connect directly with founders at top startups - no third party
                recruiters allowed.
              </p>
            </Card>

            <Card className="p-8 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Full transparency
              </h3>
              <p className="text-gray-600">
                View salary, equity, and benefits before applying. Everything
                you need to know, all upfront.
              </p>
            </Card>

            <Card className="p-8 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                One-click apply
              </h3>
              <p className="text-gray-600">
                Say goodbye to cover letters - your profile is all you need. One
                click to apply and you're done.
              </p>
            </Card>

            <Card className="p-8 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                AI-powered matching
              </h3>
              <p className="text-gray-600">
                Our AI helps match you with roles that fit your skills and
                career goals perfectly.
              </p>
            </Card>

            <Card className="p-8 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Unique opportunities
              </h3>
              <p className="text-gray-600">
                Jobs at startups and tech companies you can't find anywhere
                else.
              </p>
            </Card>

            <Card className="p-8 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Verified companies
              </h3>
              <p className="text-gray-600">
                All companies are verified and vetted to ensure legitimate
                opportunities.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Join professionals at top companies
            </h2>
            <p className="text-xl text-gray-600">
              Thousands of successful placements at leading startups and tech
              companies
            </p>
          </div>

          {/* Company logos would go here */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-60">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center"
              >
                <Building className="w-8 h-8 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to find what's next?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Join over 1 million professionals who have found their dream jobs
          </p>
          {!user ? (
            <div className="flex justify-center space-x-4">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-8 py-4 text-lg rounded-full bg-white text-red-600 hover:bg-gray-100"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/jobs">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg rounded-full border-white text-white hover:bg-white hover:text-red-600"
                >
                  Browse Jobs
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/jobs">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-4 text-lg rounded-full bg-white text-red-600 hover:bg-gray-100"
              >
                Find Your Next Role
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JS</span>
                </div>
                <span className="text-xl font-bold">JobSeeker</span>
              </div>
              <p className="text-gray-400">
                The leading platform for mobile professionals to find startup
                opportunities.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/jobs" className="hover:text-white">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/companies" className="hover:text-white">
                    Companies
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="hover:text-white">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Companies</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/post-job" className="hover:text-white">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/talent" className="hover:text-white">
                    Find Talent
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 JobSeeker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
