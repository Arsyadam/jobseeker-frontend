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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/shared/Navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Calendar,
  Users,
  Building2,
  Monitor,
  Edit2,
  Trash2,
  Share2,
  Bookmark,
  Loader2,
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
  description?: string;
  requirements?: string;
  benefits?: string;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
  isActive?: boolean;
  applicationCount?: number;
}

export default function JobDetailsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      apiClient.setToken(token);
    }

    const fetchData = async () => {
      try {
        // Try to fetch user profile
        let userData = null;
        try {
          const profileResponse = await apiClient.getProfile();
          if (profileResponse.success && profileResponse.data) {
            userData = profileResponse.data as any;
            setUser(userData);
          }
        } catch (err) {
          console.log("Profile API not available");
          // Continue without user data
        }

        // Try to fetch job details
        try {
          const jobResponse = await apiClient.getJob(jobId);
          if (jobResponse.success && jobResponse.data) {
            const jobData = jobResponse.data as Job;
            setJob(jobData);

            // Check if user is the owner of this job
            if (
              userData &&
              userData.role === "HRD" &&
              userData.companyName === jobData.companyName
            ) {
              setIsOwner(true);
            } else if (userData && userData.role === "JOBSEEKER") {
              // Check if user has already applied to this job
              try {
                const applicationsResponse = await apiClient.getApplications({
                  jobId,
                });
                if (applicationsResponse.success && applicationsResponse.data) {
                  const applications = applicationsResponse.data as any;
                  // Check if there's any application for this job
                  const hasAppliedToJob = applications.items?.some(
                    (app: any) => app.jobId === jobId
                  );
                  setHasApplied(hasAppliedToJob || false);
                }
              } catch (err) {
                console.log(
                  "Could not check application status (endpoint may not exist):",
                  err
                );
              }
            }
          } else {
            console.log("Job API returned error");
            setError("Failed to load job details");
          }
        } catch (err) {
          console.log("Job API not available:", err);
          setError("Unable to connect to server");
        }
      } catch (err) {
        console.error("Error in fetchData:", err);
        setError("Failed to load job data");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchData();
    }
  }, [jobId]);

  const handleToggleStatus = async () => {
    if (!job) return;

    try {
      const newStatus = !job.isActive;
      console.log("Attempting to toggle job status:", {
        jobId,
        currentStatus: job.isActive,
        newStatus,
      });

      const response = await apiClient.toggleJobStatus(jobId, newStatus);
      console.log("Toggle response:", response);

      if (response.success) {
        setJob({ ...job, isActive: newStatus });
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

  const handleDelete = async () => {
    try {
      const response = await apiClient.deleteJob(jobId);
      if (response.success) {
        toast({
          title: "Berhasil dihapus!",
          description: "Lowongan pekerjaan telah dihapus",
        });
        router.push("/dashboard/hrd");
      } else {
        toast({
          title: "Gagal menghapus",
          description:
            response.message || "Terjadi kesalahan yang tidak diketahui",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      toast({
        title: "Gagal menghapus",
        description: "Terjadi kesalahan jaringan",
        variant: "destructive",
      });
    }
    setShowDeleteDialog(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out this job opportunity: ${job?.title} at ${job?.companyName}`;

    try {
      if (navigator.share) {
        // Use native share API if available
        await navigator.share({
          title: `${job?.title} - ${job?.companyName}`,
          text: text,
          url: url,
        });
        toast({
          title: "Berhasil dibagikan!",
          description: "Link pekerjaan telah dibagikan",
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link disalin!",
          description: "Link pekerjaan telah disalin ke clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link disalin!",
          description: "Link pekerjaan telah disalin ke clipboard",
        });
      } catch (copyError) {
        toast({
          title: "Gagal membagikan",
          description: "Tidak dapat membagikan atau menyalin link",
          variant: "destructive",
        });
      }
    }
  };

  const handleApply = async () => {
    if (!user || !job) return;

    if (user.role !== "JOBSEEKER") {
      toast({
        title: "Tidak diizinkan",
        description: "Hanya pencari kerja yang dapat melamar pekerjaan",
        variant: "destructive",
      });
      return;
    }

    if (hasApplied) {
      toast({
        title: "Sudah melamar",
        description: "Anda sudah melamar pekerjaan ini sebelumnya",
        variant: "destructive",
      });
      return;
    }

    try {
      setApplying(true);
      console.log("Applying to job:", jobId);

      const response = await apiClient.applyToJob({
        jobId: jobId,
        coverLetter: "", // Could add a modal for cover letter later
      });

      console.log("Apply response:", response);

      if (response.success) {
        setHasApplied(true);
        toast({
          title: "Berhasil melamar!",
          description: `Lamaran Anda untuk posisi ${job.title} telah dikirim`,
        });
      } else {
        throw new Error(response.message || "Failed to apply");
      }
    } catch (error: any) {
      console.error("Error applying to job:", error);

      let errorMessage = "Terjadi kesalahan saat melamar pekerjaan";

      if (error.message) {
        if (error.message.includes("404")) {
          errorMessage =
            "Endpoint aplikasi tidak ditemukan. Fitur ini mungkin belum diimplementasi di backend.";
        } else if (error.message.includes("400")) {
          errorMessage = "Anda sudah melamar pekerjaan ini sebelumnya";
        } else if (error.message.includes("401")) {
          errorMessage = "Sesi login telah berakhir. Silakan login ulang.";
        } else if (error.message.includes("403")) {
          errorMessage = "Anda tidak memiliki izin untuk melamar pekerjaan ini";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Gagal melamar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  const formatJobType = (type: string) => {
    const types: { [key: string]: string } = {
      FULL_TIME: "Full Time",
      PART_TIME: "Part Time",
      CONTRACT: "Contract",
      INTERNSHIP: "Internship",
      FREELANCE: "Freelance",
    };
    return types[type] || type;
  };

  const formatWorkMode = (mode: string) => {
    const modes: { [key: string]: string } = {
      ONSITE: "On-site",
      REMOTE: "Remote",
      HYBRID: "Hybrid",
    };
    return modes[mode] || mode;
  };

  const formatExperienceLevel = (level: string) => {
    const levels: { [key: string]: string } = {
      ENTRY: "Entry Level",
      MID: "Mid Level",
      SENIOR: "Senior Level",
      LEAD: "Lead/Principal",
      EXECUTIVE: "Executive",
    };
    return levels[level] || level;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          <span>Loading job details...</span>
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
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-1" />
                        {job.companyName}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </div>
                    </div>
                  </div>
                  {!isOwner && user?.role === "JOBSEEKER" && (
                    <Button
                      className="bg-red-600 hover:bg-red-700"
                      onClick={handleApply}
                      disabled={hasApplied || applying}
                    >
                      {applying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Melamar...
                        </>
                      ) : hasApplied ? (
                        "Sudah Melamar"
                      ) : (
                        "Lamar Sekarang"
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {formatJobType(job.jobType)}
                  </Badge>
                  {job.workMode && (
                    <Badge variant="secondary">
                      <Monitor className="w-3 h-3 mr-1" />
                      {formatWorkMode(job.workMode)}
                    </Badge>
                  )}
                  {job.experienceLevel && (
                    <Badge variant="secondary">
                      <Users className="w-3 h-3 mr-1" />
                      {formatExperienceLevel(job.experienceLevel)}
                    </Badge>
                  )}
                  {job.salaryMin && job.salaryMax && (
                    <Badge variant="secondary">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {job.salaryMin.toLocaleString("id-ID")} -{" "}
                      {job.salaryMax.toLocaleString("id-ID")}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {job.description || "No description provided"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {job.requirements}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {job.benefits}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Info */}
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Posted Date
                  </div>
                  <p className="text-sm font-medium">
                    {new Date(job.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {job.expiresAt && (
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Clock className="w-4 h-4 mr-2" />
                      Expires On
                    </div>
                    <p className="text-sm font-medium">
                      {new Date(job.expiresAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}

                <Separator />

                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Job Type
                  </div>
                  <p className="text-sm font-medium">
                    {formatJobType(job.jobType)}
                  </p>
                </div>

                {job.workMode && (
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Monitor className="w-4 h-4 mr-2" />
                      Work Mode
                    </div>
                    <p className="text-sm font-medium">
                      {formatWorkMode(job.workMode)}
                    </p>
                  </div>
                )}

                {job.experienceLevel && (
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Users className="w-4 h-4 mr-2" />
                      Experience Level
                    </div>
                    <p className="text-sm font-medium">
                      {formatExperienceLevel(job.experienceLevel)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About {job.companyName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="w-4 h-4 mr-2" />
                    <span>{job.companyName}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{job.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Card */}
            {!isOwner && (
              <Card className="bg-red-50 border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-800">
                    Interested in this role?
                  </CardTitle>
                  <CardDescription>
                    Submit your application and get noticed by the hiring team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Apply for this Job
                  </Button>
                </CardContent>
              </Card>
            )}

            {isOwner && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">
                    Manage Posting
                  </CardTitle>
                  <CardDescription>
                    You are the owner of this job posting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href={`/jobs/${job.id}/edit`} className="block">
                    <Button variant="outline" className="w-full">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Job
                    </Button>
                  </Link>
                  <Link href={`/jobs/${job.id}/manage`} className="block">
                    <Button variant="outline" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      View Applications
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
