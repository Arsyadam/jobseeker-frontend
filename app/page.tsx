"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Brain,
  Users,
  Star,
  ArrowRight,
  Zap,
  Briefcase as BriefcaseIcon,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/shared/Navbar";

export default function HomePage() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white via-purple-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                W: Find what&apos;s <span className="text-red-500">next</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Where startups and job seekers connect
              </p>

              <div className="space-y-4">
                <Link href="/auth/register">
                  <Button className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-lg rounded-lg font-semibold">
                    Find your next role
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button
                    variant="outline"
                    className="w-full md:w-auto ml-0 md:ml-4 px-8 py-6 text-lg rounded-lg font-semibold"
                  >
                    Post your next job
                  </Button>
                </Link>
              </div>
            </div>

            {/* Search/Browse Cards */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Search Jobs</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Discover thousands of opportunities from top startups
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <BriefcaseIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Browse Companies
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Connect with innovative companies hiring right now
                </p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg border border-pink-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">AI Matching</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Get matched with roles that fit your profile perfectly
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">8M+</div>
              <div className="text-gray-400">Monthly Visits</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">150K+</div>
              <div className="text-gray-400">Tech Jobs</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10M+</div>
              <div className="text-gray-400">Startup Connections</div>
            </div>
          </div>

          {/* Company Logos */}
          <div className="mt-16 pt-16 border-t border-gray-800">
            <p className="text-center text-gray-400 mb-8">
              Trusted by companies like:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center justify-items-center opacity-60">
              {[
                "Cruise",
                "DoorDash",
                "Roblox",
                "Stripe",
                "Figma",
                "Notion",
              ].map((company, i) => (
                <div key={i} className="text-gray-500 font-semibold">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Job Seekers */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Why job seekers love us
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-pink-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Direct connections
                    </h3>
                    <p className="text-gray-600">
                      Connect directly with founders at top startups - no third
                      party recruiters
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <Target className="w-5 h-5 text-pink-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Full transparency
                    </h3>
                    <p className="text-gray-600">
                      View salary, equity, and benefits before applying
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-pink-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      One-click apply
                    </h3>
                    <p className="text-gray-600">
                      Your profile is all you need. One click to apply
                    </p>
                  </div>
                </div>
              </div>
              <Link href="/auth/register">
                <Button
                  variant="outline"
                  className="mt-8 rounded-full border-gray-300"
                >
                  Learn more
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Recruiters */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Why recruiters love us
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Access to top talent
                    </h3>
                    <p className="text-gray-600">
                      Find vetted professionals actively seeking opportunities
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      AI-powered matching
                    </h3>
                    <p className="text-gray-600">
                      Our AI helps match you with the best candidates
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Fast hiring
                    </h3>
                    <p className="text-gray-600">
                      Fill your positions faster with direct connections
                    </p>
                  </div>
                </div>
              </div>
              <Link href="/jobs/create">
                <Button
                  variant="outline"
                  className="mt-8 rounded-full border-gray-300"
                >
                  Post a job
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Autopilot Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-6">
                Meet Autopilot: Wellfound&apos;s AI recruiter
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Experience AI-driven recruitment that learns your preferences
                and matches candidates automatically
              </p>
              <Button className="bg-red-500 hover:bg-red-600 text-white px-8 py-6 rounded-full font-semibold">
                Get started with AI
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
              <div className="bg-gradient-to-br from-pink-500 to-red-500 rounded-lg h-48 flex items-center justify-center">
                <MessageSquare className="w-16 h-16 text-white opacity-30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            From our users
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "I got engaged on the first application. The opportunity was exactly what I was looking for and the process was seamless.",
                author: "Sarah",
                role: "Product Manager",
              },
              {
                quote:
                  "Half of the offers I got were opportunities I hadn't even been explicitly searching for but still matched my skills perfectly.",
                author: "John",
                role: "Software Engineer",
              },
              {
                quote:
                  "I got my next role on dedicated marketplace for the crypto startup culture and values.",
                author: "Emma",
                role: "Blockchain Developer",
              },
            ].map((testimonial, i) => (
              <Card
                key={i}
                className="p-8 bg-white border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Two CTA Boxes */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Yellow Box */}
            <div className="bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-xl p-12 text-gray-900">
              <h3 className="text-3xl font-bold mb-6">Let us show you off</h3>
              <p className="text-lg mb-8 opacity-90">
                Build a profile that showcases your skills and experience. Let
                top companies find you before you even apply.
              </p>
              <Link href="/auth/register">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold">
                  Create profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Purple Box */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-12 text-white">
              <h3 className="text-3xl font-bold mb-6">Know your worth</h3>
              <p className="text-lg mb-8 opacity-90">
                Understand market rates and negotiate with confidence.
                Data-driven salary insights for every role.
              </p>
              <Button className="bg-white hover:bg-gray-100 text-purple-600 px-8 py-3 rounded-lg font-semibold">
                See salary data
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-block bg-white bg-opacity-10 px-4 py-2 rounded-full mb-6">
            <span className="text-sm font-semibold">Our picks for 2025</span>
          </div>
          <h2 className="text-4xl font-bold mb-6">
            Hottest startup jobs for Q1 2025
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Discover the most exciting roles at the fastest-growing startups.
            These opportunities are moving fast, so don&apos;t wait.
          </p>
          <Link href="/jobs">
            <Button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold">
              Browse hot jobs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">From our blog</h2>
            <Link href="/blog">
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-transparent"
              >
                View all
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "30 Questions to Ask Before Joining a Startup",
                date: "Mar 15",
                category: "Job Tips",
              },
              {
                title: "Why Headhunters Thinks Remote Work is Permanent",
                date: "Mar 12",
                category: "Job Market",
              },
              {
                title: "The Truth About Finding Your First Startup Role",
                date: "Mar 10",
                category: "Career",
              },
              {
                title: "59 Hot Crypto Startups Hiring Remotely in 2025",
                date: "Mar 8",
                category: "Job Listings",
              },
              {
                title: "10 Innovative Startups Hiring Now",
                date: "Mar 5",
                category: "Job Listings",
              },
              {
                title: "20 Women-Led Startups Expanding Their Remote Teams",
                date: "Mar 1",
                category: "Job Listings",
              },
            ].map((post, i) => (
              <Link key={i} href="/blog">
                <Card className="p-8 bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <Badge variant="outline" className="mb-4">
                    {post.category}
                  </Badge>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 hover:text-red-500 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500">{post.date}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="text-xl font-bold">Wellfound</span>
              </div>
              <p className="text-gray-400">
                The leading platform for finding startup jobs and connecting
                with founders.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Candidates</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
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
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Startups</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/jobs/create" className="hover:text-white">
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
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="#" className="hover:text-white">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    LinkedIn
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Email
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>
              &copy; 2025 Wellfound. All rights reserved. |{" "}
              <Link href="#" className="hover:text-white">
                Privacy
              </Link>{" "}
              |{" "}
              <Link href="#" className="hover:text-white">
                Terms
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
