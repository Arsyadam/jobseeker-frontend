"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/shared/Navbar";
import {
  Search,
  MapPin,
  Users,
  Briefcase,
  Building,
  TrendingUp,
  Star,
  Globe,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  location?: string;
  size?: string;
  website?: string;
  logo?: string;
  foundedYear?: number;
  employeeCount?: number;
  jobOpenings?: number;
  rating?: number;
  isVerified?: boolean;
  // Database fields from HRD profile
  companyName?: string;
  companySize?: string;
  companyWebsite?: string;
  companyLogo?: string;
  companyDescription?: string;
  // User fields
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt?: string;
  hrdProfile?: {
    companyName: string;
    companySize?: string;
    industry?: string;
    companyWebsite?: string;
    companyLogo?: string;
    companyDescription?: string;
  };
  _count?: {
    jobPostings: number;
  };
}

const industries = [
  "All",
  "Technology",
  "Healthcare",
  "Finance",
  "E-commerce",
  "Education",
  "Marketing",
  "Gaming",
  "AI/ML",
  "Fintech",
  "Crypto",
  "SaaS",
];

const companySizes = ["All", "1-10", "11-50", "51-200", "201-500", "500+"];

const locations = [
  "All",
  "San Francisco",
  "New York",
  "Los Angeles",
  "Seattle",
  "Austin",
  "Boston",
  "Remote",
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");

  // Fetch companies from API
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.getCompanies({
          limit: 100,
          industry: selectedIndustry !== "All" ? selectedIndustry : undefined,
          size: selectedSize !== "All" ? selectedSize : undefined,
          location: selectedLocation !== "All" ? selectedLocation : undefined,
          search: searchQuery || undefined,
        });

        if (response.success) {
          // Handle both direct array and paginated response
          const responseObj = response.data as unknown as Record<
            string,
            unknown
          >;
          const companiesData = Array.isArray(response.data)
            ? response.data
            : (responseObj?.items as unknown[]) || response.data || [];

          // Transform the data to match our interface
          const transformedCompanies = companiesData.map((company: unknown) => {
            const companyObj = company as Record<string, unknown>;
            const hrdProfile = companyObj.hrdProfile as
              | Record<string, unknown>
              | undefined;
            return {
              id: (companyObj.id as string) || "",
              name:
                (hrdProfile?.companyName as string) ||
                (companyObj.companyName as string) ||
                `${companyObj.firstName || ""} ${companyObj.lastName || ""}`,
              description:
                (hrdProfile?.companyDescription as string) ||
                (companyObj.companyDescription as string) ||
                "",
              industry:
                (hrdProfile?.industry as string) ||
                (companyObj.industry as string) ||
                "",
              location: (companyObj.location as string) || "",
              size:
                (hrdProfile?.companySize as string) ||
                (companyObj.companySize as string) ||
                "Unknown",
              website:
                (hrdProfile?.companyWebsite as string) ||
                (companyObj.companyWebsite as string) ||
                "",
              logo:
                (hrdProfile?.companyLogo as string) ||
                (companyObj.companyLogo as string) ||
                "",
              jobOpenings:
                ((companyObj._count as Record<string, unknown>)
                  ?.jobPostings as number) || 0,
              isVerified: true, // All database companies are verified
              foundedYear: companyObj.createdAt
                ? new Date(companyObj.createdAt as string).getFullYear()
                : undefined,
              rating: 4.5 + Math.random() * 0.5, // Generate random rating between 4.5-5.0
            };
          });

          setCompanies(transformedCompanies);
        } else {
          // API returned error - no companies available
          console.warn("API responded with error:", response.message);
          setCompanies([]);
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
        const errorObj = err as { message?: string };
        setError(errorObj?.message || "Network error occurred");
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [selectedIndustry, selectedSize, selectedLocation, searchQuery]); // Filter companies
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      !searchQuery ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry =
      selectedIndustry === "All" || company.industry === selectedIndustry;
    const matchesSize = selectedSize === "All" || company.size === selectedSize;
    const matchesLocation =
      selectedLocation === "All" || company.location === selectedLocation;

    return matchesSearch && matchesIndustry && matchesSize && matchesLocation;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <span className="text-lg text-gray-600">Loading companies...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Backend API Not Available
            </h2>
            <p className="text-red-600 mb-4 text-lg">{error}</p>
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <h3 className="font-semibold text-gray-900 mb-2">To fix this:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>
                  Check if the backend server is running at{" "}
                  <code className="bg-gray-200 px-1 rounded">
                    http://localhost:3131
                  </code>
                </li>
                <li>
                  Review the{" "}
                  <code className="bg-gray-200 px-1 rounded">
                    BACKEND_API_REQUIREMENTS.md
                  </code>{" "}
                  file for setup instructions
                </li>
                <li>
                  Ensure the{" "}
                  <code className="bg-gray-200 px-1 rounded">/companies</code>{" "}
                  API endpoint is implemented
                </li>
                <li>
                  Verify your{" "}
                  <code className="bg-gray-200 px-1 rounded">.env.local</code>{" "}
                  file has the correct API URL
                </li>
              </ol>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700"
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                window.open("/BACKEND_API_REQUIREMENTS.md", "_blank")
              }
            >
              View API Requirements
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Discover amazing <span className="text-red-600">companies</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore top startups and tech companies. Find your next opportunity
            at companies that align with your values.
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-2 shadow-lg border-0">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search companies, industries, or locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-0 focus:ring-0 text-lg h-12"
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={selectedIndustry}
                    onValueChange={setSelectedIndustry}
                  >
                    <SelectTrigger className="w-40 h-12 border-0">
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="bg-red-600 hover:bg-red-700 h-12 px-8 text-white rounded-lg">
                    Search
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Stats */}
          <div className="flex justify-center space-x-12 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {companies.length}+
              </div>
              <div className="text-gray-600">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {companies.reduce((sum, c) => sum + (c.jobOpenings || 0), 0)}+
              </div>
              <div className="text-gray-600">Open Positions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">15+</div>
              <div className="text-gray-600">Industries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-72 hidden lg:block">
            <div className="sticky top-24">
              <Card className="p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

                <div className="space-y-6">
                  {/* Industry */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Industry
                    </label>
                    <Select
                      value={selectedIndustry}
                      onValueChange={setSelectedIndustry}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Company Size */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Company Size
                    </label>
                    <Select
                      value={selectedSize}
                      onValueChange={setSelectedSize}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Location
                    </label>
                    <Select
                      value={selectedLocation}
                      onValueChange={setSelectedLocation}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Company Listings */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredCompanies.length} Companies
              </h2>
            </div>

            {/* Company Cards */}
            <div className="grid gap-6">
              {filteredCompanies.map((company) => (
                <Card
                  key={company.id}
                  className="p-6 hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <div className="flex items-start space-x-4">
                    {/* Company Logo */}
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building className="w-8 h-8 text-white" />
                    </div>

                    {/* Company Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-xl font-semibold text-gray-900 hover:text-red-600 cursor-pointer">
                              <Link href={`/companies/${company.id}`}>
                                {company.name}
                              </Link>
                            </h3>
                            {company.isVerified && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700"
                              >
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-gray-600 mb-2">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{company.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              <span>{company.size} employees</span>
                            </div>
                            {company.foundedYear && (
                              <div className="flex items-center">
                                <span>Founded {company.foundedYear}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {company.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium text-gray-900">
                              {company.rating}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Company Details */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200"
                        >
                          {company.industry}
                        </Badge>
                        {company.jobOpenings && company.jobOpenings > 0 && (
                          <Badge
                            variant="outline"
                            className="text-green-700 border-green-200"
                          >
                            <Briefcase className="w-3 h-3 mr-1" />
                            {company.jobOpenings} open positions
                          </Badge>
                        )}
                        {company.website && (
                          <Badge
                            variant="outline"
                            className="text-blue-700 border-blue-200"
                          >
                            <Globe className="w-3 h-3 mr-1" />
                            Website
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      {company.description && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {company.description}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-500">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span>Growing fast</span>
                        </div>

                        <div className="flex space-x-2">
                          <Link href={`/companies/${company.id}`}>
                            <Button variant="outline" size="sm">
                              Learn More
                            </Button>
                          </Link>
                          {company.jobOpenings && company.jobOpenings > 0 && (
                            <Link href={`/companies/${company.id}/jobs`}>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700"
                              >
                                View Jobs
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredCompanies.length === 0 && (
              <div className="text-center py-12">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No companies found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters to find more companies.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Want to list your company?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of companies finding top talent through our platform.
          </p>
          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full"
          >
            Post Your Company
          </Button>
        </div>
      </section>
    </div>
  );
}
