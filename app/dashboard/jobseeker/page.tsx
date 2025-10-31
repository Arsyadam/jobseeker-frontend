"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/shared/Navbar";
import {
  Search,
  Briefcase,
  BookmarkIcon,
  User,
  TrendingUp,
  Eye,
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
  Plus,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// Types based on actual API responses
interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  createdAt: string;
}

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  job: {
    title: string;
    companyName: string;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  profileComplete?: boolean;
}

interface DashboardStats {
  totalApplications: number;
  profileViews: number;
  savedJobs: number;
  profileCompleteness: number;
}

export default function JobSeekerDashboard() {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    profileViews: 0,
    savedJobs: 0,
    profileCompleteness: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No auth token");

      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      setUser(data.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // Fetch recent jobs
  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs?limit=5");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      const data = await response.json();
      setJobs(data.data?.items || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  // Fetch user applications
  const fetchApplications = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch("/api/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch applications");
      const data = await response.json();
      setApplications(data.data || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats({
        totalApplications: data.data.totalApplications || 0,
        profileViews: data.data.profileViews || 0,
        savedJobs: data.data.savedJobs || 0,
        profileCompleteness: data.data.profileCompleteness || 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchProfile(),
          fetchJobs(),
          fetchApplications(),
          fetchNotifications(),
          fetchStats(),
        ]);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate unread notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || "Job Seeker"}! 👋
          </h2>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening with your job search today.
          </p>
        </div>

        {/* Profile Completeness */}
        {stats.profileCompleteness < 100 && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-2">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-orange-700 mb-3">
                    A complete profile gets 3x more job matches
                  </p>
                  <Progress
                    value={stats.profileCompleteness}
                    className="w-full mb-2"
                  />
                  <p className="text-xs text-orange-600">
                    {stats.profileCompleteness}% complete
                  </p>
                </div>
                <Link href="/profile">
                  <Button size="sm" className="ml-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Profile Views
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.profileViews}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Saved Jobs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.savedJobs}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookmarkIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Profile Score
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.profileCompleteness}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Jobs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Jobs</CardTitle>
                  <CardDescription>Latest job opportunities</CardDescription>
                </div>
                <Link href="/jobs">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {job.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {job.companyName}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {job.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {job.jobType}
                              </div>
                              {job.salaryMax && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {job.salaryMin?.toLocaleString()} -{" "}
                                  {job.salaryMax?.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {job.skills?.slice(0, 3).map((skill) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <Link href={`/jobs/${job.id}`}>
                            <Button size="sm" variant="outline">
                              View Job
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No jobs available
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Check back later for new opportunities
                    </p>
                    <Link href="/jobs">
                      <Button>
                        <Search className="mr-2 h-4 w-4" />
                        Browse Jobs
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>
                    Track your job application status
                  </CardDescription>
                </div>
                <Link href="/applications">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.slice(0, 3).map((application) => (
                      <div
                        key={application.id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {application.job?.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {application.job?.companyName}
                            </p>
                          </div>
                          <Badge
                            variant={
                              application.status === "PENDING"
                                ? "secondary"
                                : application.status === "REVIEWED"
                                ? "default"
                                : application.status === "SHORTLISTED"
                                ? "default"
                                : application.status === "REJECTED"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {application.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            Applied{" "}
                            {new Date(
                              application.appliedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No applications yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start applying to jobs that match your skills
                    </p>
                    <Link href="/jobs">
                      <Button>
                        <Search className="mr-2 h-4 w-4" />
                        Browse Jobs
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/jobs" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search Jobs
                  </Button>
                </Link>
                <Link href="/profile" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/saved-jobs" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <BookmarkIcon className="mr-2 h-4 w-4" />
                    Saved Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Notifications</CardTitle>
                <Badge variant="secondary">{unreadCount}</Badge>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="text-sm">
                        <p className="font-medium text-gray-900 mb-1">
                          {notification.title}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {notification.message}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No new notifications</p>
                )}
              </CardContent>
            </Card>

            {/* Profile Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Add work experience
                      </p>
                      <p className="text-gray-600 text-xs">
                        Showcase your professional background
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Update your skills
                      </p>
                      <p className="text-gray-600 text-xs">
                        Add relevant skills to get more matches
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Write a compelling summary
                      </p>
                      <p className="text-gray-600 text-xs">
                        Tell your professional story
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden">
        <div className="grid grid-cols-4 gap-1">
          <Link
            href="/dashboard/jobseeker"
            className="flex flex-col items-center py-2 px-1"
          >
            <div className="p-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-medium">Dashboard</span>
          </Link>
          <Link href="/jobs" className="flex flex-col items-center py-2 px-1">
            <div className="p-2">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400">Jobs</span>
          </Link>
          <Link
            href="/applications"
            className="flex flex-col items-center py-2 px-1"
          >
            <div className="p-2">
              <Briefcase className="h-5 w-5 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400">Applications</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center py-2 px-1"
          >
            <div className="p-2">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
