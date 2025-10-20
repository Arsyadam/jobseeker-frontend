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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface JobFormData {
  title: string;
  companyName: string;
  location: string;
  jobType: string;
  workMode: string;
  experienceLevel: string;
  salaryMin: number | "";
  salaryMax: number | "";
  description: string;
  requirements: string;
  benefits: string;
  skills: string[];
  expiresAt: string;
}

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "FREELANCE", label: "Freelance" },
];

const WORK_MODES = [
  { value: "ONSITE", label: "On-site" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
];

const EXPERIENCE_LEVELS = [
  { value: "ENTRY", label: "Entry Level" },
  { value: "MID", label: "Mid Level" },
  { value: "SENIOR", label: "Senior Level" },
  { value: "LEAD", label: "Lead/Principal" },
  { value: "EXECUTIVE", label: "Executive" },
];

export default function EditJobPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    companyName: "",
    location: "",
    jobType: "",
    workMode: "",
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
    benefits: "",
    skills: [],
    expiresAt: "",
  });

  const [errors, setErrors] = useState<{
    [K in keyof JobFormData]?: string;
  }>({});

  // Format number with thousand separators
  const formatNumber = (value: string | number): string => {
    if (!value) return "";
    const numStr = value.toString().replace(/\D/g, "");
    if (!numStr) return "";
    return parseInt(numStr).toLocaleString("id-ID");
  };

  // Parse formatted number back to plain number
  const parseFormattedNumber = (value: string): number | "" => {
    if (!value) return "";
    const numStr = value.replace(/\D/g, "");
    return numStr ? parseInt(numStr) : "";
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast({
        title: "Login diperlukan",
        description: "Anda harus login untuk mengedit lowongan pekerjaan",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    apiClient.setToken(token);

    const fetchData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await apiClient.getProfile();
        if (profileResponse.success && profileResponse.data) {
          const userData = profileResponse.data as any;
          setUser(userData);
        }

        // Fetch job details
        const jobResponse = await apiClient.getJob(jobId);
        if (jobResponse.success && jobResponse.data) {
          const job = jobResponse.data as any;

          // Check if user is owner
          const userData = profileResponse.data as any;
          if (
            userData.role === "HRD" &&
            userData.companyName !== job.companyName
          ) {
            toast({
              title: "Akses ditolak",
              description:
                "Anda tidak memiliki izin untuk mengedit pekerjaan ini",
              variant: "destructive",
            });
            router.push("/dashboard/hrd");
            return;
          }

          // Populate form with job data
          setFormData({
            title: job.title || "",
            companyName: job.companyName || "",
            location: job.location || "",
            jobType: job.jobType || "",
            workMode: job.workMode || "",
            experienceLevel: job.experienceLevel || "",
            salaryMin: job.salaryMin || "",
            salaryMax: job.salaryMax || "",
            description: job.description || "",
            requirements: job.requirements || "",
            benefits: job.benefits || "",
            skills: job.skills || [],
            expiresAt: job.expiresAt ? job.expiresAt.split("T")[0] : "",
          });
        } else {
          toast({
            title: "Pekerjaan tidak ditemukan",
            description: "Lowongan pekerjaan yang dicari tidak ada",
            variant: "destructive",
          });
          router.push("/dashboard/hrd");
        }
      } catch (err) {
        console.error("Error fetching job:", err);
        toast({
          title: "Gagal memuat data",
          description: "Tidak dapat mengambil detail pekerjaan",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, router]);

  const handleInputChange = (field: keyof JobFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSalaryChange = (
    field: "salaryMin" | "salaryMax",
    value: string
  ) => {
    const numericValue = parseFormattedNumber(value);
    handleInputChange(field, numericValue);
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [K in keyof JobFormData]?: string } = {};

    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.companyName.trim())
      newErrors.companyName = "Company name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.jobType) newErrors.jobType = "Job type is required";
    if (!formData.workMode) newErrors.workMode = "Work mode is required";
    if (!formData.experienceLevel)
      newErrors.experienceLevel = "Experience level is required";
    if (!formData.description || !formData.description.trim())
      newErrors.description = "Job description is required";
    if (
      !formData.requirements ||
      (typeof formData.requirements === "string" &&
        !formData.requirements.trim())
    )
      newErrors.requirements = "Requirements are required";

    if (formData.salaryMin && formData.salaryMax) {
      const minSalary = Number(formData.salaryMin);
      const maxSalary = Number(formData.salaryMax);

      if (isNaN(minSalary) || isNaN(maxSalary)) {
        newErrors.salaryMin = "Please enter valid salary amounts";
      } else if (minSalary >= maxSalary) {
        newErrors.salaryMax =
          "Maximum salary must be greater than minimum salary";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Formulir tidak valid",
        description: "Harap perbaiki kesalahan dalam formulir",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const jobData = {
        title: formData.title.trim(),
        companyName: formData.companyName.trim(),
        location: formData.location.trim(),
        jobType: formData.jobType,
        workMode: formData.workMode,
        experienceLevel: formData.experienceLevel,
        description: formData.description.trim(),
        requirements: formData.requirements ? formData.requirements.trim() : "",
        benefits: formData.benefits
          ? formData.benefits.trim() || undefined
          : undefined,
        skills: formData.skills.length > 0 ? formData.skills : undefined,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        expiresAt: formData.expiresAt || undefined,
      };

      const response = await apiClient.updateJob(jobId, jobData);

      if (response && response.success) {
        toast({
          title: "Berhasil diperbarui!",
          description: "Lowongan pekerjaan telah diperbarui",
        });
        router.push(`/jobs/${jobId}`);
      } else {
        toast({
          title: "Gagal memperbarui",
          description:
            response.message || "Terjadi kesalahan yang tidak diketahui",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating job:", error);
      let errorMessage = "Terjadi kesalahan jaringan";

      if (error.message) {
        if (error.message.includes("404")) {
          errorMessage =
            "Endpoint API tidak ditemukan. Mungkin backend belum diimplementasi.";
        } else if (error.message.includes("500")) {
          errorMessage = "Kesalahan server internal";
        } else if (error.message.includes("401")) {
          errorMessage = "Sesi login telah berakhir. Silakan login ulang.";
        } else if (error.message.includes("403")) {
          errorMessage =
            "Anda tidak memiliki izin untuk mengedit pekerjaan ini";
        } else {
          errorMessage = `Kesalahan: ${error.message}`;
        }
      }

      toast({
        title: "Gagal memperbarui",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Job Posting</CardTitle>
            <CardDescription>
              Update the details of your job posting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) =>
                      handleInputChange("companyName", e.target.value)
                    }
                    placeholder="e.g. TechCorp Indonesia"
                    className={errors.companyName ? "border-red-500" : ""}
                    disabled={user?.role === "HRD"}
                  />
                  {user?.role === "HRD" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Company name cannot be changed
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="e.g. Jakarta, Indonesia"
                      className={errors.location ? "border-red-500" : ""}
                    />
                  </div>

                  <div>
                    <Label htmlFor="expiresAt">Expiration Date</Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) =>
                        handleInputChange("expiresAt", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="jobType">Job Type *</Label>
                    <Select
                      value={formData.jobType}
                      onValueChange={(value) =>
                        handleInputChange("jobType", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.jobType ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="workMode">Work Mode *</Label>
                    <Select
                      value={formData.workMode}
                      onValueChange={(value) =>
                        handleInputChange("workMode", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.workMode ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {WORK_MODES.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="experienceLevel">Experience Level *</Label>
                    <Select
                      value={formData.experienceLevel}
                      onValueChange={(value) =>
                        handleInputChange("experienceLevel", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.experienceLevel ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salaryMin">Minimum Salary (IDR)</Label>
                    <Input
                      id="salaryMin"
                      value={
                        formData.salaryMin
                          ? formatNumber(formData.salaryMin)
                          : ""
                      }
                      onChange={(e) =>
                        handleSalaryChange("salaryMin", e.target.value)
                      }
                      placeholder="e.g. 5.000.000"
                      className={errors.salaryMin ? "border-red-500" : ""}
                    />
                  </div>

                  <div>
                    <Label htmlFor="salaryMax">Maximum Salary (IDR)</Label>
                    <Input
                      id="salaryMax"
                      value={
                        formData.salaryMax
                          ? formatNumber(formData.salaryMax)
                          : ""
                      }
                      onChange={(e) =>
                        handleSalaryChange("salaryMax", e.target.value)
                      }
                      placeholder="e.g. 10.000.000"
                      className={errors.salaryMax ? "border-red-500" : ""}
                    />
                    {errors.salaryMax && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.salaryMax}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Job Details</h3>

                <div>
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={8}
                    placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                    className={errors.description ? "border-red-500" : ""}
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements *</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) =>
                      handleInputChange("requirements", e.target.value)
                    }
                    rows={8}
                    placeholder="List the required skills, qualifications, and experience..."
                    className={errors.requirements ? "border-red-500" : ""}
                  />
                </div>

                <div>
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea
                    id="benefits"
                    value={formData.benefits}
                    onChange={(e) =>
                      handleInputChange("benefits", e.target.value)
                    }
                    rows={6}
                    placeholder="List the benefits and perks offered..."
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Skills</h3>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    placeholder="Add a skill (e.g. React, JavaScript)"
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>

                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Job
                    </>
                  )}
                </Button>
                <Link href={`/jobs/${jobId}`} className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
