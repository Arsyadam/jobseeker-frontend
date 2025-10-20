"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/shared/Navbar";
import {
  MapPin,
  Briefcase,
  Linkedin,
  Github,
  Globe,
  Award,
  GraduationCap,
  ArrowLeft,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface PublicProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  phone?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;
  slug: string;
  profileComplete?: boolean;
}

export default function PublicProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Helper function to transform user data to PublicProfile format
  const transformUserData = (userData: any, slug: string): PublicProfile => {
    return {
      id: userData.id,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      profilePicture: userData.profilePicture || "",
      bio: userData.jobSeekerProfile?.bio || userData.bio || "",
      skills: userData.jobSeekerProfile?.skills || userData.skills || [],
      experience:
        userData.jobSeekerProfile?.experience || userData.experience || "",
      education:
        userData.jobSeekerProfile?.education || userData.education || "",
      location: userData.jobSeekerProfile?.location || userData.location || "",
      phone: userData.jobSeekerProfile?.phone || userData.phone || "",
      linkedin: userData.jobSeekerProfile?.linkedin || userData.linkedin || "",
      github: userData.jobSeekerProfile?.github || userData.github || "",
      portfolio:
        userData.jobSeekerProfile?.portfolio || userData.portfolio || "",
      slug: userData.slug || slug,
      profileComplete: userData.profileComplete || false,
    };
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch real profile data from API
        try {
          console.log(`Attempting to fetch profile for slug: ${slug}`);

          // First, try the direct profile endpoint
          try {
            const response = await apiClient.getTalentProfile(slug);
            console.log("Direct API response:", response);

            if (response.success && response.data) {
              const userData = response.data as any;
              setProfile(transformUserData(userData, slug));
              return; // Success, exit early
            }
          } catch (directError) {
            console.log("Direct profile endpoint failed, trying fallback...");
          }

          // Fallback: Get all talents and find the matching one
          console.log("Trying fallback: fetching all talents...");
          const allTalentsResponse = await apiClient.getTalent();
          console.log("All talents response:", allTalentsResponse);

          if (allTalentsResponse.success && allTalentsResponse.data) {
            const talents = Array.isArray(allTalentsResponse.data)
              ? allTalentsResponse.data
              : (allTalentsResponse.data as any).items || [];

            // Find profile by slug, ID, or name, or locally stored slug
            const matchingProfile = talents.find((talent: any) => {
              // Check direct slug match
              if (talent.slug === slug) return true;

              // Check ID match
              if (talent.id === slug) return true;

              // Check auto-generated name slug
              const autoSlug =
                `${talent.firstName?.toLowerCase()}-${talent.lastName?.toLowerCase()}`.replace(
                  /\s+/g,
                  "-"
                );
              if (autoSlug === slug.toLowerCase()) return true;

              // Check locally stored slug
              if (typeof window !== "undefined") {
                const localSlugData = localStorage.getItem(
                  `user_slug_${talent.id}`
                );
                if (localSlugData) {
                  try {
                    const parsedData = JSON.parse(localSlugData);
                    if (parsedData.slug === slug) return true;
                  } catch (e) {
                    // Ignore parsing errors
                  }
                }
              }

              return false;
            });

            if (matchingProfile) {
              console.log("Found matching profile:", matchingProfile);
              setProfile(transformUserData(matchingProfile, slug));
              return;
            }
          }

          // If we get here, profile wasn't found
          setError(
            `Profile "${slug}" not found. This profile may not exist or may be private.`
          );
        } catch (apiError: any) {
          console.error("API call failed:", apiError);

          // More specific error handling
          if (
            apiError?.name === "TypeError" &&
            apiError?.message?.includes("Failed to fetch")
          ) {
            setError(
              "Backend server is not running. Please start your API server at http://localhost:3131 or check your network connection."
            );
          } else if (apiError?.message?.includes("404")) {
            setError(
              `Profile "${slug}" does not exist. Please check the URL or create a profile first.`
            );
          } else if (apiError?.message?.includes("ECONNREFUSED")) {
            setError(
              "Cannot connect to the backend server. Please ensure your API server is running at http://localhost:3131"
            );
          } else {
            setError(
              `Unable to load profile. Error: ${
                apiError?.message || "Unknown error"
              }. Please try again or check if the backend server is running.`
            );
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProfile();
    }
  }, [slug, retryCount]);

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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Profile Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "The requested profile could not be found."}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
              <h3 className="font-medium text-blue-900 mb-2">
                Need a public profile?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Register as a job seeker</li>
                <li>• Complete your profile</li>
                <li>• Set a custom profile URL slug</li>
                <li>• Share your public profile link</li>
              </ul>
            </div>
            {error?.includes("server") && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-yellow-900 mb-2">
                  Backend Server Required
                </h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Start your backend API server</li>
                  <li>• Default URL: http://localhost:3131</li>
                  <li>• Check server logs for errors</li>
                  <li>• Verify database connection</li>
                </ul>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => {
                  setRetryCount((prev) => prev + 1);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Link href="/talent">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Browse Talent
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile.profilePicture} />
                <AvatarFallback className="bg-red-600 text-white text-3xl">
                  {profile.firstName?.[0]}
                  {profile.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.firstName} {profile.lastName}
                </h1>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                  {profile.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {profile.location}
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-gray-600 mb-4">{profile.bio}</p>
                )}

                {/* Social Links */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </a>
                  )}
                  {profile.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </a>
                  )}
                  {profile.portfolio && (
                    <a
                      href={profile.portfolio}
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
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience */}
        {profile.experience && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">
                {profile.experience}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {profile.education && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">
                {profile.education}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Link */}
        {profile.portfolio && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Portfolio & Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={profile.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-red-600 hover:text-red-700 hover:underline"
              >
                {profile.portfolio}
              </a>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">
            Powered by <span className="font-bold text-red-600">JobSeeker</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
