"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  MapPin,
  DollarSign,
  Users,
  BookmarkPlus,
  ArrowLeft,
  SlidersHorizontal,
  Loader2,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: string;
  workMode?: string;
  experienceLevel?: string;
  createdAt: string;
  skills?: string[];
  description?: string;
  requirements?: string;
  benefits?: string;
  _count?: {
    applications: number;
  };
}

const jobCategories = [
  "All",
  "Engineering",
  "Design",
  "Data Science",
  "Product",
  "Marketing",
  "Sales",
];
const experienceLevels = ["All", "ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"];
const jobTypes = [
  "All",
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "FREELANCE",
  "INTERNSHIP",
];
const workModes = ["All", "ONSITE", "REMOTE", "HYBRID"];

const formatJobType = (type: string) => {
  const map: Record<string, string> = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    CONTRACT: "Contract",
    FREELANCE: "Freelance",
    INTERNSHIP: "Internship",
  };
  return map[type] || type;
};

const formatExperienceLevel = (level: string) => {
  const map: Record<string, string> = {
    ENTRY: "Entry Level",
    MID: "Mid Level",
    SENIOR: "Senior Level",
    LEAD: "Lead/Principal",
    EXECUTIVE: "Executive",
  };
  return map[level] || level;
};

const formatWorkMode = (mode: string) => {
  const map: Record<string, string> = {
    ONSITE: "On-site",
    REMOTE: "Remote",
    HYBRID: "Hybrid",
  };
  return map[mode] || mode;
};

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  if (diffInDays < 7)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  if (diffInDays < 30)
    return `${Math.floor(diffInDays / 7)} week${
      Math.floor(diffInDays / 7) > 1 ? "s" : ""
    } ago`;
  return `${Math.floor(diffInDays / 30)} month${
    Math.floor(diffInDays / 30) > 1 ? "s" : ""
  } ago`;
};

export default function JobsPage() {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("All");
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [selectedWorkMode, setSelectedWorkMode] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.getJobs({ limit: 100 });
        if (response.success) {
          // Handle paginated response - extract the items array
          // Response structure: { success: true, data: { items: [...], pagination: {...} } }
          const jobsData = (response.data as any)?.items || [];
          setJobs(jobsData);
        } else {
          setError(response.message || "Failed to fetch jobs");
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.skills &&
        job.skills.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    const matchesExperience =
      selectedExperience === "All" ||
      job.experienceLevel === selectedExperience;
    const matchesJobType =
      selectedJobType === "All" || job.jobType === selectedJobType;
    const matchesWorkMode =
      selectedWorkMode === "All" || job.workMode === selectedWorkMode;
    const matchesRemote = !remoteOnly || job.workMode === "REMOTE";

    return (
      matchesSearch &&
      matchesExperience &&
      matchesJobType &&
      matchesWorkMode &&
      matchesRemote
    );
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "salary":
        const aSalary = a.salaryMax || 0;
        const bSalary = b.salaryMax || 0;
        return bSalary - aSalary;
      case "applicants":
        return (a._count?.applications || 0) - (b._count?.applications || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          <span>Loading jobs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JS</span>
                </div>
                <span className="text-xl font-bold text-gray-900">JobSeeker</span>
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link href="/jobs" className="text-gray-900 font-medium border-b-2 border-red-500 pb-4">
                  Jobs
                </Link>
                <Link href="/companies" className="text-gray-600 hover:text-gray-900 pb-4">
                  Companies
                </Link>
                <Link href="/talent" className="text-gray-600 hover:text-gray-900 pb-4">
                  Talent
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                      Profile
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={logout}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full"
                    >
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find what's <span className="text-red-600">next</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover startup jobs at companies you'll love. Connect directly with founders and hiring managers.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-2 shadow-lg border-0">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search for jobs, companies, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-0 focus:ring-0 text-lg h-12"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40 h-12 border-0">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    className="bg-red-600 hover:bg-red-700 h-12 px-8 text-white rounded-lg"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Stats */}
          <div className="flex justify-center space-x-12 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{sortedJobs.length}+</div>
              <div className="text-gray-600">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10K+</div>
              <div className="text-gray-600">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">1M+</div>
              <div className="text-gray-600">Job Seekers</div>
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

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search jobs, companies, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {jobCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedJobType}
                onValueChange={setSelectedJobType}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Experience Level
                  </label>
                  <Select
                    value={selectedExperience}
                    onValueChange={setSelectedExperience}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Experience" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Sort By
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="salary">Highest Salary</SelectItem>
                      <SelectItem value="applicants">
                        Fewest Applicants
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remote"
                      checked={remoteOnly}
                      onCheckedChange={(checked) =>
                        setRemoteOnly(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="remote"
                      className="text-sm font-medium text-gray-700"
                    >
                      Remote jobs only
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {sortedJobs.length} of {jobs.length} jobs
          </p>
          <div className="text-sm text-gray-500">Updated recently</div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {sortedJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No jobs found matching your criteria
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedExperience("All");
                  setSelectedJobType("All");
                  setSelectedWorkMode("All");
                  setRemoteOnly(false);
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            sortedJobs.map((job) => (
              <Card
                key={job.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {formatJobType(job.jobType)}
                          </Badge>
                          {job.workMode && (
                            <Badge variant="outline" className="text-xs">
                              {formatWorkMode(job.workMode)}
                            </Badge>
                          )}
                          {job.experienceLevel && (
                            <Badge variant="outline" className="text-xs">
                              {formatExperienceLevel(job.experienceLevel)}
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">
                            {getTimeAgo(job.createdAt)}
                          </span>
                        </div>
                        <CardTitle className="text-xl mb-1">
                          {job.title}
                        </CardTitle>
                        <CardDescription className="font-medium text-gray-700 mb-2">
                          {job.companyName}
                        </CardDescription>
                        {job.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {job.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <BookmarkPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </div>
                      {job.salaryMin && job.salaryMax && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Rp {job.salaryMin.toLocaleString("id-ID")} -{" "}
                          {job.salaryMax.toLocaleString("id-ID")}
                        </div>
                      )}
                      {job._count?.applications !== undefined && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {job._count.applications} applicant
                          {job._count.applications !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Link href={`/jobs/${job.id}`} className="flex-1">
                        <Button className="bg-red-600 hover:bg-red-700 w-full">
                          View Details
                        </Button>
                      </Link>
                      <Button variant="outline">Save</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {sortedJobs.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Jobs
            </Button>
          </div>
        )}

        {/* No Results */}
        {sortedJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedExperience("All");
                setSelectedJobType("All");
                setRemoteOnly(false);
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
