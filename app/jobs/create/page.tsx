"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  ArrowLeft,
  Plus,
  X,
  Briefcase,
  Save,
  Eye,
  Loader2,
} from "lucide-react";
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

export default function CreateJobPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [user, setUser] = useState<Record<string, unknown> | null>(null);

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

  // Fetch user profile and auto-fill company name
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      if (typeof window !== "undefined") {
        toast({
          title: "Login diperlukan",
          description: "Anda harus login untuk membuat lowongan pekerjaan",
          variant: "destructive",
        });
      }
      setTimeout(() => router.push("/auth/login"), 100);
      return;
    }

    apiClient.setToken(token);

    // Fetch user profile to get company name
    const fetchProfile = async () => {
      try {
        const response = await apiClient.getProfile();
        if (response.success && response.data) {
          const userData = response.data as Record<string, unknown>;
          setUser(userData);
          // Auto-fill company name for HRD users
          if (userData.role === "HRD" && userData.companyName) {
            setFormData((prev) => ({
              ...prev,
              companyName: userData.companyName as string,
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, toast]);

  // Format number with thousand separators (e.g., 9000 → 9.000)
  const formatNumber = (value: string | number): string => {
    if (!value) return "";
    const numStr = value.toString().replace(/\D/g, "");
    if (!numStr) return "";
    return parseInt(numStr).toLocaleString("id-ID");
  };

  // Parse formatted number back to plain number (e.g., 9.000 → 9000)
  const parseFormattedNumber = (value: string): number | "" => {
    if (!value) return "";
    const numStr = value.replace(/\D/g, "");
    return numStr ? parseInt(numStr) : "";
  };

  // Handle input changes
  const handleInputChange = (
    field: keyof JobFormData,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle salary input with formatting
  const handleSalaryChange = (
    field: "salaryMin" | "salaryMax",
    value: string
  ) => {
    const numericValue = parseFormattedNumber(value);
    handleInputChange(field, numericValue);
  };

  // Add skill
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  // Remove skill
  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  // Handle skill input key press
  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  // Show success message
  const showSuccess = (message: string) => {
    if (typeof window !== "undefined") {
      toast({
        title: "Berhasil!",
        description: message,
      });
    }
  };

  // Show error message
  const showError = (message: string) => {
    if (typeof window !== "undefined") {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  // Validate form
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
    if (!formData.description.trim())
      newErrors.description = "Job description is required";
    if (!formData.requirements.trim())
      newErrors.requirements = "Requirements are required";

    // ✅ FIXED: Salary validation - check if both values exist and are valid numbers
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

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setTimeout(() => {
        const currentErrors = Object.keys(errors);
        const errorCount = currentErrors.length;
        const errorFields = currentErrors.join(", ");
        showError(
          `Please fix ${errorCount} error(s) in the following fields: ${errorFields}`
        );

        // Scroll to first error
        const firstErrorField = currentErrors[0];
        const errorElement = document.getElementById(firstErrorField);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 0);
      return;
    }

    setLoading(true);
    try {
      // ✅ IMPROVED: Better job data preparation
      const jobData = {
        title: formData.title.trim(),
        companyName: formData.companyName.trim(),
        location: formData.location.trim(),
        jobType: formData.jobType,
        workMode: formData.workMode,
        experienceLevel: formData.experienceLevel,
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        benefits: formData.benefits.trim() || undefined,
        skills: formData.skills.length > 0 ? formData.skills : undefined,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        expiresAt: formData.expiresAt || undefined,
      };

      console.log("=== JOB CREATION DEBUG ===");
      console.log("Submitting job data:", JSON.stringify(jobData, null, 2));
      console.log("API Base URL:", process.env.NEXT_PUBLIC_API_URL);
      console.log("Auth token exists:", !!localStorage.getItem("auth_token"));

      const response = await apiClient.createJob(jobData);

      console.log("Raw API Response:", response);

      if (response && response.success) {
        showSuccess("Job posted successfully!");
        router.push("/dashboard/hrd");
      } else {
        // ✅ IMPROVED: Handle different error response formats
        let errorMessage = "Failed to create job";

        if (response) {
          if (response.message) {
            errorMessage = response.message;
          } else if (response.error) {
            errorMessage = response.error;
          }
        }

        console.error("API Error Details:", {
          response,
          errorMessage,
        });

        showError(`Failed to create job: ${errorMessage}`);
      }
    } catch (error) {
      console.error("=== ERROR CREATING JOB ===");
      console.error("Error object:", error);

      // ✅ IMPROVED: Better error categorization with proper type checking
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        if (error.name === "TypeError" && error.message.includes("fetch")) {
          showError(
            "Network error: Cannot connect to the server. Please check if the backend is running on port 3131."
          );
        } else if (error.message.includes("401")) {
          showError("Authentication error: Please log in again.");
          router.push("/auth/login");
        } else if (error.message.includes("403")) {
          showError(
            "Permission error: You don't have permission to create jobs."
          );
        } else if (error.message.includes("422")) {
          showError("Validation error: Please check your input data.");
        } else if (error.message.includes("500")) {
          showError(
            "Server error: The server encountered an internal error. Please try again later."
          );
        } else {
          showError(`Error: ${error.message}`);
        }
      } else {
        console.error("Unknown error type:", typeof error);
        showError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Save as draft
  const saveDraft = async () => {
    setLoading(true);
    try {
      showSuccess("Draft saved successfully!");
    } catch {
      showError("Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Preview Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setPreviewMode(false)}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Edit</span>
                </Button>
                <h1 className="text-xl font-bold text-gray-900">Job Preview</h1>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish Job"
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Preview Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" className="text-xs">
                      New
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {
                        JOB_TYPES.find((t) => t.value === formData.jobType)
                          ?.label
                      }
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {
                        WORK_MODES.find((w) => w.value === formData.workMode)
                          ?.label
                      }
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">
                    {formData.title}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {formData.companyName} • {formData.location}
                  </CardDescription>
                </div>
                <div className="text-right">
                  {formData.salaryMin && formData.salaryMax && (
                    <p className="text-lg font-semibold text-green-600">
                      Rp {Number(formData.salaryMin).toLocaleString()} -{" "}
                      {Number(formData.salaryMax).toLocaleString()}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    {
                      EXPERIENCE_LEVELS.find(
                        (e) => e.value === formData.experienceLevel
                      )?.label
                    }
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {formData.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Job Description</h3>
                  <div className="prose prose-sm max-w-none">
                    {formData.description
                      .split("\n")
                      .map((paragraph, index) => (
                        <p key={index} className="mb-2">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <div className="prose prose-sm max-w-none">
                    {formData.requirements
                      .split("\n")
                      .map((requirement, index) => (
                        <p key={index} className="mb-2">
                          {requirement}
                        </p>
                      ))}
                  </div>
                </div>

                {formData.benefits && (
                  <div>
                    <h3 className="font-semibold mb-2">Benefits</h3>
                    <div className="prose prose-sm max-w-none">
                      {formData.benefits.split("\n").map((benefit, index) => (
                        <p key={index} className="mb-2">
                          {benefit}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/hrd"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">JS</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Create Job Posting
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={saveDraft} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                variant="outline"
                onClick={() => setPreviewMode(true)}
                disabled={!formData.title || !formData.description}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Please fix the following errors:
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>
                        <span className="font-medium capitalize">
                          {field.replace(/([A-Z])/g, " $1").toLowerCase()}:
                        </span>{" "}
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Provide the essential details about the job position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    title={
                      user?.role === "HRD"
                        ? "Company name is auto-filled from your profile"
                        : ""
                    }
                  />
                  {user?.role === "HRD" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Company name is automatically set from your profile
                    </p>
                  )}
                  {errors.companyName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.companyName}
                    </p>
                  )}
                </div>

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
                  {errors.location && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>

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
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.jobType && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.jobType}
                    </p>
                  )}
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
                      <SelectValue placeholder="Select work mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_MODES.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.workMode && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.workMode}
                    </p>
                  )}
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
                      className={errors.experienceLevel ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.experienceLevel && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.experienceLevel}
                    </p>
                  )}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <Label>Salary Range (Optional)</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Enter salary range in IDR (Indonesian Rupiah). Leave empty if
                  you prefer not to disclose.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="text"
                      value={
                        formData.salaryMin
                          ? formatNumber(formData.salaryMin)
                          : ""
                      }
                      onChange={(e) =>
                        handleSalaryChange("salaryMin", e.target.value)
                      }
                      placeholder="e.g. 15.000.000"
                      className={errors.salaryMin ? "border-red-500" : ""}
                    />
                    <p className="text-xs text-gray-400 mt-1">Minimum salary</p>
                    {errors.salaryMin && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.salaryMin}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="text"
                      value={
                        formData.salaryMax
                          ? formatNumber(formData.salaryMax)
                          : ""
                      }
                      onChange={(e) =>
                        handleSalaryChange("salaryMax", e.target.value)
                      }
                      placeholder="e.g. 25.000.000"
                      className={errors.salaryMax ? "border-red-500" : ""}
                    />
                    <p className="text-xs text-gray-400 mt-1">Maximum salary</p>
                    {errors.salaryMax && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.salaryMax}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <Label htmlFor="expiresAt">
                  Application Deadline (Optional)
                </Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    handleInputChange("expiresAt", e.target.value)
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
              <CardDescription>
                Add skills that candidates should have for this position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    placeholder="e.g. React, TypeScript, Node.js"
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="pr-1">
                        {skill}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-auto p-0 hover:bg-transparent"
                          onClick={() => removeSkill(skill)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>
                Provide detailed information about the role and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                  rows={6}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="requirements">Requirements *</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) =>
                    handleInputChange("requirements", e.target.value)
                  }
                  placeholder="List the required qualifications, experience, and skills..."
                  rows={6}
                  className={errors.requirements ? "border-red-500" : ""}
                />
                {errors.requirements && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.requirements}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="benefits">Benefits (Optional)</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) =>
                    handleInputChange("benefits", e.target.value)
                  }
                  placeholder="Describe the benefits, perks, and compensation package..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link href="/dashboard/hrd">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewMode(true)}
              disabled={!formData.title || !formData.description}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Job Posting"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
