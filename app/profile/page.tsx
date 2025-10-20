"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/shared/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Edit2,
  Save,
  X,
  Loader2,
  Camera,
  Building2,
  GraduationCap,
  Award,
  Globe,
  Linkedin,
  Github,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

// Helper function to calculate profile completion score
function calculateProfileScore(user: UserProfile | null): number {
  if (!user) return 0;

  if (user.role === "JOBSEEKER") {
    const profile = user.jobSeekerProfile || {};
    let score = 0;

    // Basic Info (30 points)
    if (user.firstName) score += 5;
    if (user.lastName) score += 5;
    if (user.profilePicture) score += 10;
    if (profile.location || user.location) score += 5;
    if (profile.bio) score += 5;

    // Professional Info (40 points)
    if (profile.skills && profile.skills.length >= 3) score += 10;
    if (profile.experience) score += 10;
    if (profile.education) score += 10;
    if (profile.portfolio) score += 10;

    // Additional Info (30 points)
    if (profile.phone || user.phone) score += 10;
    if (profile.linkedin) score += 10;
    if (profile.github || profile.portfolio) score += 10;

    return score;
  } else if (user.role === "HRD") {
    let score = 0;

    // Basic Info (40 points)
    if (user.firstName) score += 5;
    if (user.lastName) score += 5;
    if (user.profilePicture) score += 15;
    if (user.phone) score += 15;

    // Company Info (60 points)
    if (user.companyName) score += 20;
    if (user.companySize) score += 15;
    if (user.industry) score += 15;
    if (user.location) score += 10;

    return score;
  }

  return 0;
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "JOBSEEKER" | "HRD";
  profileComplete: boolean;
  profilePicture?: string;
  phone?: string;
  location?: string;
  slug?: string;
  createdAt: string;
  updatedAt?: string;
  // For HRD users - fields are on root level
  companyName?: string;
  companySize?: string;
  industry?: string;
  // For Jobseeker users - nested profile
  jobSeekerProfile?: {
    phone?: string;
    location?: string;
    bio?: string;
    skills?: string[];
    experience?: string;
    education?: string;
    portfolio?: string;
    linkedin?: string;
    github?: string;
  };
  // Related data
  skills?: any[];
  workExperiences?: any[];
  educations?: any[];
  certifications?: any[];
  languages?: any[];
}

export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user: authUser, loading: authLoading, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Form data for editing
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    bio: "",
    skills: [] as string[],
    experience: "",
    education: "",
    portfolio: "",
    linkedin: "",
    github: "",
    companyName: "",
    companySize: "",
    industry: "",
    position: "",
    companyWebsite: "",
    companyDescription: "",
    slug: "",
    profilePicture: "",
  });

  const [skillInput, setSkillInput] = useState("");

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

  // Handle photo upload
  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showError("Harap pilih file gambar yang valid");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("Ukuran file terlalu besar. Maksimal 5MB");
      return;
    }

    try {
      setSaving(true);
      console.log("Uploading photo:", file.name, file.size, file.type);

      let imageUrl = "";

      // Try to upload via API first
      try {
        const response = await apiClient.uploadProfilePhoto(file);
        if (response.success && response.data && (response.data as any).url) {
          imageUrl = (response.data as any).url;
          showSuccess("Foto profil berhasil diupload ke server");
        } else {
          throw new Error("API upload failed");
        }
      } catch (apiError) {
        console.log("API upload failed, using local URL:", apiError);
        // Fallback: Create a local URL for the uploaded image
        imageUrl = URL.createObjectURL(file);
        showSuccess("Foto profil berhasil diperbarui (disimpan lokal)");
      }

      // Update user state with new profile picture
      setUser((prev) => (prev ? { ...prev, profilePicture: imageUrl } : prev));

      // Update form data as well
      setFormData((prev) => ({
        ...prev,
        profilePicture: imageUrl,
      }));

      // Auto-save the profile with the new photo
      if (user) {
        try {
          const updateData = {
            profilePicture: imageUrl,
          };

          const saveResponse = await apiClient.updateProfile(updateData);
          if (saveResponse.success) {
            // Update auth context with new profile picture
            updateUser({ profilePicture: imageUrl });

            showSuccess("Foto profil berhasil disimpan");

            // Refresh talent page data if function exists
            if (
              typeof window !== "undefined" &&
              (window as any).refreshTalentData
            ) {
              (window as any).refreshTalentData();
            }
          } else {
            // Even if save fails, keep the local update
            console.log("Profile save failed, but photo updated locally");
          }
        } catch (saveError) {
          console.log("Profile auto-save failed:", saveError);
          showSuccess(
            "Foto berhasil diupload, silakan klik Save untuk menyimpan profil"
          );
        }
      }
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      showError("Gagal mengupload foto profil");
    } finally {
      setSaving(false);
      // Reset the file input
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  // Trigger file input
  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  // Convert User to UserProfile format
  const convertUserToProfile = (user: any): UserProfile => {
    return {
      ...user,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString(),
      phone: user.phone || "",
      location: user.location || "",
      slug: user.slug || "",
    };
  };

  // Fetch user profile
  useEffect(() => {
    setIsClient(true);

    if (typeof window === "undefined") return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Check if user is authenticated
        if (!authUser) {
          router.push("/auth/login");
          return;
        }

        // Try to get full profile data from API
        try {
          const response = await apiClient.getProfile();
          if (response.success && response.data) {
            const userData = response.data as UserProfile;
            setUser(userData);
            initializeFormData(userData);
          } else {
            // Fallback to auth user data if API call fails
            const userProfile = convertUserToProfile(authUser);
            setUser(userProfile);
            initializeFormData(userProfile);
          }
        } catch (apiError) {
          console.log("API call failed, using auth user data:", apiError);
          // Use authenticated user data as fallback
          const userProfile = convertUserToProfile(authUser);
          setUser(userProfile);
          initializeFormData(userProfile);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if auth is not loading and we have user data or no user (to redirect)
    if (!authLoading) {
      fetchProfile();
    }
  }, [authUser, authLoading, router]);

  // Helper function to save slug to localStorage as fallback
  const saveSlugLocally = (userId: string, slug: string) => {
    if (typeof window !== "undefined") {
      const slugData = {
        userId,
        slug,
        timestamp: Date.now(),
      };
      localStorage.setItem(`user_slug_${userId}`, JSON.stringify(slugData));
    }
  };

  // Helper function to get slug from localStorage
  const getSlugLocally = (userId: string): string | null => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem(`user_slug_${userId}`);
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          return parsedData.slug;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  // Helper function to initialize form data
  const initializeFormData = (userData: UserProfile) => {
    // Check for locally stored slug first
    const localSlug = getSlugLocally(userData.id);
    const effectiveSlug = localSlug || userData.slug || "";

    if (userData.role === "HRD") {
      // For HRD users, bio should be stored at root level or in hrdProfile
      const hrdProfile = (userData as any).hrdProfile || {};
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
        location: userData.location || "",
        bio: hrdProfile.bio || (userData as any).bio || "",
        skills: [],
        experience: "",
        education: "",
        portfolio: "",
        linkedin: "",
        github: "",
        companyName: userData.companyName || "",
        companySize: userData.companySize || "",
        industry: userData.industry || "",
        position: "",
        companyWebsite: "",
        companyDescription: "",
        slug: effectiveSlug,
        profilePicture: userData.profilePicture || "",
      });
    } else {
      const profile = userData.jobSeekerProfile || {};
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: profile.phone || userData.phone || "",
        location: profile.location || userData.location || "",
        bio: profile.bio || "",
        skills: profile.skills || [],
        experience: profile.experience || "",
        education: profile.education || "",
        portfolio: profile.portfolio || "",
        linkedin: profile.linkedin || "",
        github: profile.github || "",
        companyName: "",
        companySize: "",
        industry: "",
        position: "",
        companyWebsite: "",
        companyDescription: "",
        slug: effectiveSlug,
        profilePicture: userData.profilePicture || "",
      });
    }
  };

  // Handle input change
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  // Save profile
  const handleSave = async () => {
    setSaving(true);
    try {
      console.log("=== SAVE PROFILE DEBUG ===");
      console.log("Current user:", user);
      console.log("Current formData:", formData);
      console.log("Current formData.slug:", formData.slug);

      // Create update payload
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        location: formData.location,
        profilePicture: formData.profilePicture,
        slug: formData.slug, // Add slug to update data
      };

      console.log("Update payload before role-specific data:", updateData);

      // Add role-specific data
      if (user?.role === "JOBSEEKER") {
        (updateData as any).jobSeekerProfile = {
          bio: formData.bio,
          skills: formData.skills,
          experience: formData.experience,
          education: formData.education,
          portfolio: formData.portfolio,
          linkedin: formData.linkedin,
          github: formData.github,
        };
      } else if (user?.role === "HRD") {
        (updateData as any).companyName = formData.companyName;
        (updateData as any).companySize = formData.companySize;
        (updateData as any).industry = formData.industry;
        // Add HRD profile data including bio
        (updateData as any).hrdProfile = {
          bio: formData.bio,
        };
      }

      // Try to update via API
      try {
        console.log("Sending update data:", updateData); // Debug log
        const response = await apiClient.updateProfile(updateData);
        console.log("Update response:", response); // Debug log
        if (response.success && response.data) {
          const updatedUser = response.data as UserProfile;
          console.log("Updated user from server:", updatedUser);
          setUser(updatedUser);

          // Re-initialize form data with updated user data
          initializeFormData(updatedUser);

          // Update the auth context with the new user data
          updateUser({
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            profilePicture: updatedUser.profilePicture,
            email: updatedUser.email,
            // Add other fields that might have changed
          });

          showSuccess(
            `Profil berhasil diperbarui! Semua perubahan telah disimpan.${
              formData.slug
                ? ` URL publik Anda: jobseeker.com/u/${formData.slug}`
                : ""
            }`
          );

          // Check if slug was actually saved
          if (formData.slug && updatedUser.slug !== formData.slug) {
            console.warn(
              "Slug was not saved by the backend. Expected:",
              formData.slug,
              "Got:",
              updatedUser.slug
            );
            // Save slug locally as fallback
            if (user?.id) {
              saveSlugLocally(user.id, formData.slug);
            }
            showError(
              "Slug disimpan secara lokal. Backend belum mendukung URL kustom."
            );
          } else if (formData.slug) {
            // Slug was saved successfully, remove any local backup
            if (typeof window !== "undefined" && user?.id) {
              localStorage.removeItem(`user_slug_${user.id}`);
            }
          }

          setEditing(false);

          // Refresh talent page data if function exists
          if (
            typeof window !== "undefined" &&
            (window as any).refreshTalentData
          ) {
            (window as any).refreshTalentData();
          }
        } else {
          throw new Error("API update failed");
        }
      } catch (apiError) {
        console.error("API update failed:", apiError);

        // Check if it's an authentication error
        if (
          (apiError as any)?.message?.includes("401") ||
          (apiError as any)?.message?.includes("Unauthorized")
        ) {
          showError("Sesi login telah berakhir. Silakan login kembali.");
          router.push("/auth/login");
          return;
        }

        // Check if it's a network error
        if (
          (apiError as any)?.name === "TypeError" &&
          (apiError as any)?.message?.includes("Failed to fetch")
        ) {
          showError(
            "Tidak dapat terhubung ke server. Perubahan disimpan secara lokal."
          );
        } else {
          console.log("API update failed, updating locally:", apiError);
        }

        // Fallback: Update user state directly (local behavior)
        const updatedUser: UserProfile = {
          ...user!,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          location: formData.location,
          profilePicture: formData.profilePicture || user?.profilePicture,
          slug: formData.slug, // Add slug to fallback update
        };

        if (user?.role === "JOBSEEKER") {
          updatedUser.jobSeekerProfile = {
            ...user.jobSeekerProfile,
            phone: formData.phone,
            location: formData.location,
            bio: formData.bio,
            skills: formData.skills,
            experience: formData.experience,
            education: formData.education,
            portfolio: formData.portfolio,
            linkedin: formData.linkedin,
            github: formData.github,
          };
        } else {
          updatedUser.phone = formData.phone;
          updatedUser.location = formData.location;
          updatedUser.companyName = formData.companyName;
          updatedUser.companySize = formData.companySize;
          updatedUser.industry = formData.industry;
          // Add HRD profile data
          (updatedUser as any).hrdProfile = {
            ...(updatedUser as any).hrdProfile,
            bio: formData.bio,
          };
        }

        setUser(updatedUser);

        // Re-initialize form data
        initializeFormData(updatedUser);

        // Save slug locally as fallback
        if (formData.slug) {
          saveSlugLocally(user!.id, formData.slug);
        }

        // Update auth context even in fallback mode
        updateUser({
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          profilePicture: updatedUser.profilePicture,
        });

        showSuccess(
          `Profil berhasil diperbarui! ${
            formData.slug
              ? `URL slug "${formData.slug}" disimpan secara lokal. Backend akan diperbarui untuk mendukung URL kustom.`
              : "(Disimpan secara lokal karena API tidak tersedia)"
          }`
        );
        setEditing(false);

        // Refresh talent page data if function exists
        if (
          typeof window !== "undefined" &&
          (window as any).refreshTalentData
        ) {
          (window as any).refreshTalentData();
        }
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      showError("Gagal memperbarui profil. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditing(false);
    // Reset form data to current user data using the helper function
    if (user) {
      initializeFormData(user);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Profile not found"}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const isJobseeker = user.role === "JOBSEEKER";
  const jobseekerProfile = isJobseeker ? user.jobSeekerProfile : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page Header with Edit Controls */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            </div>
            <div className="flex items-center space-x-2">
              {!editing ? (
                <Button
                  variant="outline"
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  {/* Profile Picture */}
                  <div className="relative">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={user.profilePicture} />
                      <AvatarFallback className="bg-red-600 text-white text-3xl">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {editing && (
                      <Button
                        size="sm"
                        className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                        variant="secondary"
                        onClick={triggerPhotoUpload}
                        disabled={saving}
                        title={saving ? "Uploading..." : "Ubah foto profil"}
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Name and Role */}
                  <div className="mt-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h2>
                    <Badge
                      variant={isJobseeker ? "default" : "secondary"}
                      className="mt-2"
                    >
                      {isJobseeker ? "Job Seeker" : "HR Recruiter"}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="w-full mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <Link href="/auth/change-email">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs p-1 h-auto"
                        >
                          Change
                        </Button>
                      </Link>
                    </div>

                    {((isJobseeker && jobseekerProfile?.phone) ||
                      (!isJobseeker && user.phone)) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          {isJobseeker ? jobseekerProfile?.phone : user.phone}
                        </span>
                      </div>
                    )}

                    {(jobseekerProfile?.location ||
                      (!isJobseeker && user.location)) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          {jobseekerProfile?.location || user.location}
                        </span>
                      </div>
                    )}

                    {!isJobseeker && user.companyName && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{user.companyName}</span>
                      </div>
                    )}

                    {!isJobseeker && user.industry && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{user.industry}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Social Links */}
                  {isJobseeker &&
                    (jobseekerProfile?.linkedin ||
                      jobseekerProfile?.github ||
                      jobseekerProfile?.portfolio) && (
                      <div className="w-full mt-6 pt-6 border-t">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Social Links
                        </h3>
                        <div className="space-y-2">
                          {jobseekerProfile?.linkedin && (
                            <a
                              href={jobseekerProfile.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                            >
                              <Linkedin className="w-4 h-4 mr-2" />
                              LinkedIn
                            </a>
                          )}
                          {jobseekerProfile?.github && (
                            <a
                              href={jobseekerProfile.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-gray-700 hover:text-gray-900"
                            >
                              <Github className="w-4 h-4 mr-2" />
                              GitHub
                            </a>
                          )}
                          {jobseekerProfile?.portfolio && (
                            <a
                              href={jobseekerProfile.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-red-600 hover:text-red-700"
                            >
                              <Globe className="w-4 h-4 mr-2" />
                              Portfolio
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Completeness Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Profile Completeness</CardTitle>
                <CardDescription>
                  Complete your profile to improve your visibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {calculateProfileScore(user)}% Complete
                    </span>
                    <span className="text-gray-500">
                      {calculateProfileScore(user) === 100
                        ? "Perfect! 🎉"
                        : "Keep going!"}
                    </span>
                  </div>
                  <Progress
                    value={calculateProfileScore(user)}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Profile Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="professional">
                  {isJobseeker ? "Professional" : "Company"}
                </TabsTrigger>
              </TabsList>

              {/* Personal Info Tab */}
              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Update your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          disabled={!editing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          disabled={!editing}
                        />
                      </div>
                    </div>

                    {isJobseeker ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) =>
                                handleInputChange("phone", e.target.value)
                              }
                              disabled={!editing}
                              placeholder="+62 xxx xxxx xxxx"
                            />
                          </div>
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={formData.location}
                              onChange={(e) =>
                                handleInputChange("location", e.target.value)
                              }
                              disabled={!editing}
                              placeholder="Jakarta, Indonesia"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) =>
                              handleInputChange("bio", e.target.value)
                            }
                            disabled={!editing}
                            rows={4}
                            placeholder="Tell us about yourself..."
                          />
                        </div>

                        <div>
                          <Label htmlFor="profileSlug">
                            Custom Profile URL
                          </Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              jobseeker.com/u/
                            </span>
                            <Input
                              id="profileSlug"
                              value={formData.slug || ""}
                              onChange={(e) => {
                                // Only allow lowercase letters, numbers, and hyphens
                                const slug = e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-]/g, "");
                                handleInputChange("slug", slug);
                              }}
                              disabled={!editing}
                              placeholder="your-custom-url"
                              maxLength={50}
                            />
                            {editing && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Auto-generate slug from name
                                  const autoSlug =
                                    `${formData.firstName}-${formData.lastName}`
                                      .toLowerCase()
                                      .replace(/[^a-z0-9-]/g, "-")
                                      .replace(/-+/g, "-")
                                      .replace(/^-|-$/g, "");
                                  handleInputChange("slug", autoSlug);
                                }}
                              >
                                Auto
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Your public profile will be accessible at this URL.
                            Use only lowercase letters, numbers, and hyphens.
                            {formData.slug && (
                              <span className="block mt-1">
                                <span className="text-blue-600">
                                  Preview: jobseeker.com/u/{formData.slug}
                                </span>
                                {!editing && user?.slug && (
                                  <Link
                                    href={`/u/${user.slug}`}
                                    className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                                    target="_blank"
                                  >
                                    View Public Profile
                                  </Link>
                                )}
                              </span>
                            )}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) =>
                                handleInputChange("phone", e.target.value)
                              }
                              disabled={!editing}
                              placeholder="+62 xxx xxxx xxxx"
                            />
                          </div>
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={formData.location}
                              onChange={(e) =>
                                handleInputChange("location", e.target.value)
                              }
                              disabled={!editing}
                              placeholder="Jakarta, Indonesia"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Professional/Company Info Tab */}
              <TabsContent value="professional" className="space-y-6">
                {isJobseeker ? (
                  <>
                    {/* Skills */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Skills</CardTitle>
                        <CardDescription>
                          Add your technical and professional skills
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {editing && (
                          <div className="flex gap-2">
                            <Input
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyPress={handleSkillKeyPress}
                              placeholder="e.g. React, JavaScript, Design"
                            />
                            <Button type="button" onClick={addSkill}>
                              Add
                            </Button>
                          </div>
                        )}

                        {formData.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {formData.skills.map((skill, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-sm"
                              >
                                {skill}
                                {editing && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="ml-1 h-auto p-0 hover:bg-transparent"
                                    onClick={() => removeSkill(skill)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                )}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No skills added yet
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Experience */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Experience</CardTitle>
                        <CardDescription>
                          Describe your work experience
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={formData.experience}
                          onChange={(e) =>
                            handleInputChange("experience", e.target.value)
                          }
                          disabled={!editing}
                          rows={6}
                          placeholder="List your work experience, roles, and achievements..."
                        />
                      </CardContent>
                    </Card>

                    {/* Education */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Education</CardTitle>
                        <CardDescription>
                          Your educational background
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={formData.education}
                          onChange={(e) =>
                            handleInputChange("education", e.target.value)
                          }
                          disabled={!editing}
                          rows={4}
                          placeholder="Your degrees, certifications, and education..."
                        />
                      </CardContent>
                    </Card>

                    {/* Links */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Professional Links</CardTitle>
                        <CardDescription>
                          Add your online presence
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="portfolio">Portfolio Website</Label>
                          <Input
                            id="portfolio"
                            value={formData.portfolio}
                            onChange={(e) =>
                              handleInputChange("portfolio", e.target.value)
                            }
                            disabled={!editing}
                            placeholder="https://yourportfolio.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="linkedin">LinkedIn Profile</Label>
                          <Input
                            id="linkedin"
                            value={formData.linkedin}
                            onChange={(e) =>
                              handleInputChange("linkedin", e.target.value)
                            }
                            disabled={!editing}
                            placeholder="https://linkedin.com/in/username"
                          />
                        </div>
                        <div>
                          <Label htmlFor="github">GitHub Profile</Label>
                          <Input
                            id="github"
                            value={formData.github}
                            onChange={(e) =>
                              handleInputChange("github", e.target.value)
                            }
                            disabled={!editing}
                            placeholder="https://github.com/username"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <>
                    {/* Company Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                        <CardDescription>
                          Details about your company
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input
                            id="companyName"
                            value={formData.companyName}
                            onChange={(e) =>
                              handleInputChange("companyName", e.target.value)
                            }
                            disabled={!editing}
                            placeholder="Your Company Name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="companySize">Company Size</Label>
                          <Input
                            id="companySize"
                            value={formData.companySize}
                            onChange={(e) =>
                              handleInputChange("companySize", e.target.value)
                            }
                            disabled={!editing}
                            placeholder="e.g. 100-500, 500-1000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="industry">Industry</Label>
                          <Input
                            id="industry"
                            value={formData.industry}
                            onChange={(e) =>
                              handleInputChange("industry", e.target.value)
                            }
                            disabled={!editing}
                            placeholder="e.g. Technology, Healthcare, Finance"
                          />
                        </div>
                        <div>
                          <Label htmlFor="position">Your Position</Label>
                          <Input
                            id="position"
                            value={formData.position}
                            onChange={(e) =>
                              handleInputChange("position", e.target.value)
                            }
                            disabled={!editing}
                            placeholder="e.g. HR Manager, Recruiter"
                          />
                        </div>
                        <div>
                          <Label htmlFor="companyWebsite">
                            Company Website
                          </Label>
                          <Input
                            id="companyWebsite"
                            value={formData.companyWebsite}
                            onChange={(e) =>
                              handleInputChange(
                                "companyWebsite",
                                e.target.value
                              )
                            }
                            disabled={!editing}
                            placeholder="https://yourcompany.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="companyDescription">
                            Company Description
                          </Label>
                          <Textarea
                            id="companyDescription"
                            value={formData.companyDescription}
                            onChange={(e) =>
                              handleInputChange(
                                "companyDescription",
                                e.target.value
                              )
                            }
                            disabled={!editing}
                            rows={6}
                            placeholder="Describe your company, industry, and culture..."
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Additional Information - Display from API */}
                    {(user.skills?.length ||
                      user.workExperiences?.length ||
                      user.educations?.length ||
                      user.certifications?.length ||
                      user.languages?.length) && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Additional Details</CardTitle>
                          <CardDescription>
                            Information from your profile
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {user.skills && user.skills.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">
                                Skills
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {user.skills.map((skill: any, idx: number) => (
                                  <Badge key={idx} variant="secondary">
                                    {skill.name || skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {user.workExperiences &&
                            user.workExperiences.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2 text-sm">
                                  Work Experience
                                </h4>
                                <div className="space-y-2">
                                  {user.workExperiences.map(
                                    (exp: any, idx: number) => (
                                      <div key={idx} className="text-sm">
                                        <p className="font-medium">
                                          {exp.title || exp.position}
                                        </p>
                                        <p className="text-gray-600">
                                          {exp.company}
                                        </p>
                                        {exp.startDate && (
                                          <p className="text-xs text-gray-500">
                                            {new Date(
                                              exp.startDate
                                            ).toLocaleDateString()}{" "}
                                            -{" "}
                                            {exp.endDate
                                              ? new Date(
                                                  exp.endDate
                                                ).toLocaleDateString()
                                              : "Present"}
                                          </p>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {user.educations && user.educations.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">
                                Education
                              </h4>
                              <div className="space-y-2">
                                {user.educations.map(
                                  (edu: any, idx: number) => (
                                    <div key={idx} className="text-sm">
                                      <p className="font-medium">
                                        {edu.degree}
                                      </p>
                                      <p className="text-gray-600">
                                        {edu.institution}
                                      </p>
                                      {edu.year && (
                                        <p className="text-xs text-gray-500">
                                          {edu.year}
                                        </p>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {user.certifications &&
                            user.certifications.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2 text-sm">
                                  Certifications
                                </h4>
                                <div className="space-y-2">
                                  {user.certifications.map(
                                    (cert: any, idx: number) => (
                                      <div key={idx} className="text-sm">
                                        <p className="font-medium">
                                          {cert.name}
                                        </p>
                                        <p className="text-gray-600">
                                          {cert.issuer}
                                        </p>
                                        {cert.issueDate && (
                                          <p className="text-xs text-gray-500">
                                            Issued:{" "}
                                            {new Date(
                                              cert.issueDate
                                            ).toLocaleDateString()}
                                          </p>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {user.languages && user.languages.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">
                                Languages
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {user.languages.map(
                                  (lang: any, idx: number) => (
                                    <Badge key={idx} variant="outline">
                                      {lang.name || lang}{" "}
                                      {lang.proficiency &&
                                        `(${lang.proficiency})`}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
