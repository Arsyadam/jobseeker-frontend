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
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/shared/Navbar";
import {
  Search,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  Users,
  BookmarkPlus,
  Loader2,
  Filter,
  Star,
  TrendingUp,
  Building,
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

const experienceLevels = ["All", "Entry", "Mid", "Senior", "Lead", "Executive"];
const jobTypes = [
  "All",
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
];
const workModes = ["All", "Remote", "Hybrid", "On-site"];

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

const formatSalary = (min?: number, max?: number) => {
  if (!min && !max) return "Competitive";
  if (min && max)
    return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
  if (min) return `$${(min / 1000).toFixed(0)}k+`;
  if (max) return `Up to $${(max / 1000).toFixed(0)}k`;
  return "Competitive";
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

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.getJobs({ limit: 100 });
        if (response.success) {
          // Handle both direct array and paginated response
          const jobsData = Array.isArray(response.data)
            ? response.data
            : (response.data as any)?.items || response.data || [];
          setJobs(jobsData);
        } else {
          setError(response.message || "Failed to fetch jobs");
        }
      } catch (err: any) {
        setError(err.message || "Network error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter and search jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills?.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "All" ||
      job.title.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesExperience =
      selectedExperience === "All" ||
      formatExperienceLevel(job.experienceLevel || "").includes(
        selectedExperience
      );

    const matchesJobType =
      selectedJobType === "All" ||
      formatJobType(job.jobType).includes(selectedJobType);

    const matchesWorkMode =
      selectedWorkMode === "All" ||
      formatWorkMode(job.workMode || "").includes(selectedWorkMode);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesExperience &&
      matchesJobType &&
      matchesWorkMode
    );
  });

  const handleApply = async (jobId: string) => {
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    try {
      const response = await apiClient.applyToJob({ jobId });
      if (response.success) {
        // Handle success
      }
    } catch (error) {
      console.error("Failed to apply:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <span className="text-lg text-gray-600">Finding amazing jobs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-lg">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700"
          >
            Try Again
          </Button>
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
            Find what's <span className="text-red-600">next</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover startup jobs at companies you'll love. Connect directly
            with founders and hiring managers.
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
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
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
                {jobs.length}+
              </div>
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

                <div className="space-y-6">
                  {/* Experience Level */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Experience Level
                    </label>
                    <Select
                      value={selectedExperience}
                      onValueChange={setSelectedExperience}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
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

                  {/* Job Type */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Job Type
                    </label>
                    <Select
                      value={selectedJobType}
                      onValueChange={setSelectedJobType}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Work Mode */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Work Mode
                    </label>
                    <Select
                      value={selectedWorkMode}
                      onValueChange={setSelectedWorkMode}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {workModes.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Job Listings */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredJobs.length} Jobs
              </h2>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="p-6 hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1 hover:text-red-600 cursor-pointer">
                            <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                          </h3>
                          <div className="flex items-center space-x-4 text-gray-600 mb-2">
                            <div className="flex items-center">
                              <Building className="w-4 h-4 mr-1" />
                              <span className="font-medium">
                                {job.companyName}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>
                                {new Date(job.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <BookmarkPlus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Job Details */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge
                          variant="secondary"
                          className="bg-red-50 text-red-700"
                        >
                          {formatJobType(job.jobType)}
                        </Badge>
                        {job.workMode && (
                          <Badge variant="outline">
                            {formatWorkMode(job.workMode)}
                          </Badge>
                        )}
                        {job.experienceLevel && (
                          <Badge variant="outline">
                            {formatExperienceLevel(job.experienceLevel)}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-green-700 border-green-200"
                        >
                          <DollarSign className="w-3 h-3 mr-1" />
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </Badge>
                      </div>

                      {/* Skills */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {job.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              +{job.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Description Preview */}
                      {job.description && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                          {job.description.substring(0, 150)}...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{job._count?.applications || 0} applicants</span>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleApply(job.id)}
                      >
                        Quick Apply
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters to find more jobs.
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
            Ready to find your next opportunity?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of professionals who have found their dream jobs
            through our platform.
          </p>
          {!user && (
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full"
              >
                Get Started Today
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
