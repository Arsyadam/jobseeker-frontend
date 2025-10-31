"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/shared/Navbar";
import {
  Plus,
  Search,
  Briefcase,
  Eye,
  Settings,
  Calendar,
  TrendingUp,
  FileText,
  Clock,
  Loader2,
  MapPin,
  DollarSign,
  Edit2,
  Shield,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  jobType: string;
  workMode?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  createdAt: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  expiresAt?: string;
  isActive?: boolean;
  applicationCount?: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  profilePicture?: string;
  companyName?: string;
  location?: string;
  phone?: string;
  industry?: string;
  companySize?: string;
}

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  coverLetter?: string;
  user: User;
  job: {
    title: string;
    companyName: string;
  };
}

export default function HRDDashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  };

  // Set token in API client on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      apiClient.setToken(token);
    }
  }, []);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const response = await apiClient.getProfile();
      console.log("=== FETCH PROFILE DEBUG ===");
      console.log("Profile response:", response);

      if (response.success) {
        console.log("Profile data:", response.data);
        const userData = response.data as User;

        // Check if user has HRD role
        if (userData.role !== "HRD") {
          setError(
            "Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini khusus untuk HRD."
          );
          return;
        }

        setUser(userData);
      } else {
        console.error("Failed to fetch profile:", response.message);
        setError("Failed to load profile data");
        return;
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to connect to server");
      return;
    }
  };

  // Fetch all jobs (HRD can see all jobs in the system)
  const fetchJobs = async () => {
    try {
      const response = await apiClient.getJobs({ limit: 100 });
      console.log("=== FETCH JOBS DEBUG ===");
      console.log("Response:", response);
      console.log("Response.data:", response.data);

      if (response.success && response.data && "items" in response.data) {
        // Handle the paginated response structure
        const jobsData = response.data.items as Job[];
        console.log("Jobs data:", jobsData);
        console.log("Number of jobs:", jobsData.length);
        setJobs(jobsData);
      } else {
        console.error("Failed to fetch jobs:", response.message);
        setJobs([]);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
    }
  };

  // Fetch all applications (this would need to be filtered by company in a real scenario)
  const fetchApplications = async () => {
    try {
      const response = await apiClient.getApplications();
      if (response.success && response.data && "items" in response.data) {
        // Handle the paginated response structure
        setApplications(response.data.items as Application[]);
      } else if (response.success && Array.isArray(response.data)) {
        setApplications(response.data as Application[]);
      } else {
        console.error("Failed to fetch applications:", response.message);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProfile(), fetchJobs(), fetchApplications()]);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Toggle job active status
  const handleToggleJobStatus = async (
    jobId: string,
    currentStatus: boolean
  ) => {
    try {
      const newStatus = !currentStatus;
      console.log("Attempting to toggle job status:", {
        jobId,
        currentStatus,
        newStatus,
      });

      const response = await apiClient.toggleJobStatus(jobId, newStatus);
      console.log("Toggle response:", response);

      if (response.success) {
        // Update local state
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === jobId ? { ...job, isActive: newStatus } : job
          )
        );
        toast({
          title: "Berhasil diperbarui!",
          description: `Pekerjaan telah ${
            newStatus ? "diaktifkan" : "dinonaktifkan"
          }`,
        });
      } else {
        console.error("Failed to toggle job status:", response);
        toast({
          title: "Gagal memperbarui",
          description:
            response.message || "Terjadi kesalahan yang tidak diketahui",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error toggling job status:", err);
      toast({
        title: "Gagal memperbarui",
        description: "Terjadi kesalahan jaringan atau endpoint tidak tersedia",
        variant: "destructive",
      });
    }
  };

  // Filter jobs based on search (only for jobs from the current user's company)
  // Since the API doesn't filter by company yet, we filter client-side
  // In production, this should be done on the backend
  console.log("=== FILTER JOBS DEBUG ===");
  console.log("User:", user);
  console.log("Company Name:", user?.companyName);
  console.log("Total jobs:", jobs.length);

  // Filter by company name (for HRD users, companyName is on root level)
  const companyJobs = user?.companyName
    ? jobs.filter((job) => {
        console.log(
          `Comparing: "${job.companyName}" === "${user.companyName}"`
        );
        return job.companyName === user.companyName;
      })
    : jobs; // Show all if company name is not available

  console.log("Filtered company jobs:", companyJobs.length);

  const filteredJobs = companyJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate basic stats from available data
  const stats = {
    activeJobs: companyJobs.length,
    totalApplications: applications.length,
    // These would need specific endpoints to get accurate data
    scheduledInterviews: 0,
    hiredThisMonth: 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            {error.includes("izin") ? (
              <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            ) : (
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error.includes("izin") ? "Akses Ditolak" : "Terjadi Kesalahan"}
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            {error.includes("login") ? (
              <Button onClick={() => (window.location.href = "/auth/login")}>
                Login Ulang
              </Button>
            ) : error.includes("izin") ? (
              <Button onClick={() => (window.location.href = "/")}>
                Kembali ke Beranda
              </Button>
            ) : (
              <Button onClick={() => window.location.reload()}>
                Coba Lagi
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              HRD Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.firstName || "HRD"}! Manage your job postings
              and applications.
            </p>
          </div>
          <Link href="/jobs/create">
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Jobs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeJobs}
                  </p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Applications
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalApplications}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">All Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {jobs.length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Company</p>
                  <p className="text-lg font-bold text-gray-900">
                    {user?.companyName || "Your Company"}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="jobs" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="jobs">Job Postings</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search your job postings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Link href="/jobs/create">
                    <Button variant="outline">Create Job</Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {filteredJobs.length === 0 ? (
                    <div className="text-center py-8">
                      <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        No job postings found
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        {companyJobs.length === 0
                          ? "Start by creating your first job posting"
                          : "Try adjusting your search terms"}
                      </p>
                      <Link href="/jobs/create">
                        <Button className="bg-red-600 hover:bg-red-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Job
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    filteredJobs.map((job) => (
                      <Card
                        key={job.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant={
                                    job.isActive !== false
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {job.isActive !== false
                                    ? "Active"
                                    : "Inactive"}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {job.jobType}
                                </Badge>
                                {job.workMode && (
                                  <Badge variant="outline" className="text-xs">
                                    {job.workMode}
                                  </Badge>
                                )}
                                <span className="text-sm text-gray-500">
                                  {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <CardTitle className="text-xl">
                                {job.title}
                              </CardTitle>
                              <CardDescription className="font-medium text-gray-700">
                                {job.companyName} • {job.location}
                              </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Label
                                htmlFor={`job-status-${job.id}`}
                                className="text-sm text-gray-600"
                              >
                                {job.isActive !== false ? "Active" : "Inactive"}
                              </Label>
                              <Switch
                                id={`job-status-${job.id}`}
                                checked={job.isActive !== false}
                                onCheckedChange={() =>
                                  handleToggleJobStatus(
                                    job.id,
                                    job.isActive !== false
                                  )
                                }
                              />
                            </div>
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
                                  {job.salaryMin.toLocaleString()} -{" "}
                                  {job.salaryMax.toLocaleString()}
                                </div>
                              )}
                              {job.experienceLevel && (
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {job.experienceLevel}
                                </div>
                              )}
                            </div>

                            {job.skills && job.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {job.skills.slice(0, 5).map((skill) => (
                                  <Badge
                                    key={skill}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                                {job.skills.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{job.skills.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <Link href={`/jobs/${job.id}`} className="flex-1">
                                <Button
                                  variant="outline"
                                  className="w-full bg-transparent"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Details
                                </Button>
                              </Link>
                              <Link href={`/jobs/${job.id}/edit`}>
                                <Button variant="outline">
                                  <Edit2 className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              <Link href={`/jobs/${job.id}/manage`}>
                                <Button className="bg-red-600 hover:bg-red-700">
                                  <Settings className="w-4 h-4 mr-1" />
                                  Manage
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="applications" className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No applications found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Applications will appear here once candidates apply to
                      your jobs
                    </p>
                  </div>
                ) : (
                  applications.map((app) => (
                    <Card
                      key={app.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage
                                src={
                                  app.user?.profilePicture || "/placeholder.svg"
                                }
                              />
                              <AvatarFallback>
                                {app.user?.firstName?.[0]}
                                {app.user?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">
                                {app.user?.firstName} {app.user?.lastName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {app.job?.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                Applied{" "}
                                {new Date(app.appliedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge
                              variant={
                                app.status === "PENDING"
                                  ? "secondary"
                                  : app.status === "REVIEWED"
                                  ? "default"
                                  : app.status === "SHORTLISTED"
                                  ? "default"
                                  : app.status === "REJECTED"
                                  ? "destructive"
                                  : "default"
                              }
                              className="text-xs"
                            >
                              {app.status}
                            </Badge>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                View Profile
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Review
                              </Button>
                            </div>
                          </div>
                        </div>
                        {app.coverLetter && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 font-medium mb-1">
                              Cover Letter:
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {app.coverLetter}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/jobs/create" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job Posting
                  </Button>
                </Link>
                <Link href="/jobs" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Browse All Jobs
                  </Button>
                </Link>
                <Link href="/profile" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Company Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Company Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="/placeholder.svg?height=48&width=48" />
                      <AvatarFallback>
                        {user?.companyName?.[0] || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">
                        {user?.companyName || "Your Company"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {user?.firstName} {user?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>📍 {user?.location || "Location not set"}</p>
                    <p>📧 {user?.email}</p>
                    <p>📱 {user?.phone || "Phone not set"}</p>
                    {user?.industry && <p>🏢 {user.industry}</p>}
                    {user?.companySize && (
                      <p>👥 {user.companySize} employees</p>
                    )}
                  </div>
                  <Link href="/profile">
                    <Button variant="outline" className="w-full bg-transparent">
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Usage Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips for HRD</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Create detailed job descriptions
                      </p>
                      <p className="text-gray-600 text-xs">
                        Include specific requirements and benefits
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Set competitive salaries
                      </p>
                      <p className="text-gray-600 text-xs">
                        Research market rates for better applications
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Review applications promptly
                      </p>
                      <p className="text-gray-600 text-xs">
                        Quick responses improve candidate experience
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
