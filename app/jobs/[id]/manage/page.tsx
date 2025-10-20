"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Loader2,
  FileText,
  Download,
} from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  coverLetter?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePicture?: string;
  };
}

export default function ManageJobPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;

  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast({
        title: "Login diperlukan",
        description: "Anda harus login untuk mengelola aplikasi pekerjaan",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    apiClient.setToken(token);

    const fetchData = async () => {
      try {
        // Fetch job details
        const jobResponse = await apiClient.getJob(jobId);
        if (jobResponse.success && jobResponse.data) {
          setJob(jobResponse.data);
        }

        // Fetch applications for this job
        const appsResponse = await apiClient.getApplications({
          jobId,
          limit: 100,
        });
        if (appsResponse.success) {
          const appsData = (appsResponse.data as any)?.items || [];
          setApplications(appsData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, router]);

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      // This would need an API endpoint to update application status
      toast({
        title: "Fitur dalam pengembangan",
        description: `Update status ke "${newStatus}" akan diimplementasikan`,
      });
      // For now, just update locally
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Gagal memperbarui",
        description: "Tidak dapat memperbarui status aplikasi",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; variant: any } } = {
      PENDING: { label: "Pending", variant: "outline" },
      REVIEWED: { label: "Reviewed", variant: "secondary" },
      SHORTLISTED: { label: "Shortlisted", variant: "default" },
      INTERVIEW: { label: "Interview", variant: "default" },
      ACCEPTED: { label: "Accepted", variant: "default" },
      REJECTED: { label: "Rejected", variant: "destructive" },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status.toLowerCase() === filter.toLowerCase();
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "PENDING").length,
    reviewed: applications.filter((a) => a.status === "REVIEWED").length,
    shortlisted: applications.filter((a) => a.status === "SHORTLISTED").length,
    accepted: applications.filter((a) => a.status === "ACCEPTED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          <span>Loading applications...</span>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Job not found"}</p>
          <Button onClick={() => router.push("/dashboard/hrd")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href={`/jobs/${jobId}`}
              className="flex items-center text-red-600 hover:text-red-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Job Details
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Info Header */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{job.title}</CardTitle>
            <CardDescription>
              Manage applications for this job posting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-700">
                  {stats.pending}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">
                  {stats.reviewed}
                </p>
                <p className="text-sm text-gray-600">Reviewed</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-700">
                  {stats.shortlisted}
                </p>
                <p className="text-sm text-gray-600">Shortlisted</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">
                  {stats.accepted}
                </p>
                <p className="text-sm text-gray-600">Accepted</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-700">
                  {stats.rejected}
                </p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                size="sm"
              >
                All ({stats.total})
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                onClick={() => setFilter("pending")}
                size="sm"
              >
                <Clock className="w-4 h-4 mr-1" />
                Pending ({stats.pending})
              </Button>
              <Button
                variant={filter === "reviewed" ? "default" : "outline"}
                onClick={() => setFilter("reviewed")}
                size="sm"
              >
                <Eye className="w-4 h-4 mr-1" />
                Reviewed ({stats.reviewed})
              </Button>
              <Button
                variant={filter === "shortlisted" ? "default" : "outline"}
                onClick={() => setFilter("shortlisted")}
                size="sm"
              >
                <Users className="w-4 h-4 mr-1" />
                Shortlisted ({stats.shortlisted})
              </Button>
              <Button
                variant={filter === "accepted" ? "default" : "outline"}
                onClick={() => setFilter("accepted")}
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Accepted ({stats.accepted})
              </Button>
              <Button
                variant={filter === "rejected" ? "default" : "outline"}
                onClick={() => setFilter("rejected")}
                size="sm"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rejected ({stats.rejected})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {filter === "all"
                  ? "No applications yet"
                  : `No ${filter} applications`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card
                key={application.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={
                            application.user.profilePicture ||
                            "/placeholder.svg"
                          }
                        />
                        <AvatarFallback>
                          {application.user.firstName[0]}
                          {application.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-lg">
                            {application.user.firstName}{" "}
                            {application.user.lastName}
                          </h4>
                          {getStatusBadge(application.status)}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {application.user.email}
                          </div>
                          {application.user.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {application.user.phone}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Applied{" "}
                            {new Date(
                              application.appliedAt
                            ).toLocaleDateString()}
                          </div>
                        </div>

                        {application.coverLetter && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <p className="text-sm text-gray-600 font-medium mb-1">
                              Cover Letter:
                            </p>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {application.coverLetter}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View Profile
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Download CV
                          </Button>
                          {application.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusUpdate(application.id, "REVIEWED")
                                }
                              >
                                Mark as Reviewed
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() =>
                                  handleStatusUpdate(
                                    application.id,
                                    "SHORTLISTED"
                                  )
                                }
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Shortlist
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleStatusUpdate(application.id, "REJECTED")
                                }
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {application.status === "SHORTLISTED" && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() =>
                                handleStatusUpdate(application.id, "INTERVIEW")
                              }
                            >
                              Schedule Interview
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
