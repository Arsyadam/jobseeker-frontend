"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import { apiClient } from "@/lib/api";
import {
  MapPin,
  Star,
  Loader2,
  CheckCircle,
  Search,
  Eye,
  ArrowRight,
} from "lucide-react";

interface JobSeeker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  jobTitle: string;
  rating: number;
  experienceYears: number;
  expectedSalary: { min: number; max: number };
  availability: "Available" | "Busy" | "Open to Offers";
  slug: string;
  profilePicture?: string;
}

export default function TalentPage() {
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>([]);
  const [filteredJobSeekers, setFilteredJobSeekers] = useState<JobSeeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch talent data from API
  useEffect(() => {
    const loadJobSeekers = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getTalent({
          limit: 50, // Get up to 50 talent profiles
        });

        if (response.success && response.data) {
          // Handle both direct array and paginated response structures
          const talentData = Array.isArray(response.data)
            ? response.data
            : (response.data as any)?.items || response.data || [];

          // Transform API data to match JobSeeker interface
          const transformedData = talentData.map((item: any) => ({
            id: item.id,
            firstName: item.firstName || "",
            lastName: item.lastName || "",
            email: item.email || "",
            phone: item.phone || item.jobSeekerProfile?.phone || "",
            location: item.location || item.jobSeekerProfile?.location || "",
            bio: item.jobSeekerProfile?.bio || "",
            skills: item.jobSeekerProfile?.skills || [],
            jobTitle:
              item.jobSeekerProfile?.experience?.split("\n")[0] || "Developer", // Use first line of experience as job title
            rating: 4.5, // Default rating since not in API
            experienceYears: item.jobSeekerProfile?.experience
              ? parseInt(
                  item.jobSeekerProfile.experience.match(/(\d+)/)?.[0] || "2"
                )
              : 2,
            expectedSalary: { min: 15000000, max: 25000000 }, // Default salary range
            availability: "Available" as const,
            slug:
              item.slug ||
              `${item.firstName}-${item.lastName}`
                .toLowerCase()
                .replace(/\s+/g, "-"),
            profilePicture: item.profilePicture || "",
          }));

          setJobSeekers(transformedData);
          setFilteredJobSeekers(transformedData);
        } else {
          // No data available from API
          console.log("API failed, no data available");
          setJobSeekers([]);
          setFilteredJobSeekers([]);
        }
      } catch (error) {
        console.error("Error loading talent data:", error);
        // No fallback data - show empty state
        setJobSeekers([]);
        setFilteredJobSeekers([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobSeekers();
  }, []); // Re-run when component mounts

  // Add a function to refresh data (can be called when profiles are updated)
  const refreshTalentData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getTalent({ limit: 50 });
      if (response.success && response.data) {
        // Handle both direct array and paginated response structures
        const talentData = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.items || response.data || [];

        const transformedData = talentData.map((item: any) => ({
          id: item.id,
          firstName: item.firstName || "",
          lastName: item.lastName || "",
          email: item.email || "",
          phone: item.phone || item.jobSeekerProfile?.phone || "",
          location: item.location || item.jobSeekerProfile?.location || "",
          bio: item.jobSeekerProfile?.bio || "",
          skills: item.jobSeekerProfile?.skills || [],
          jobTitle:
            item.jobSeekerProfile?.experience?.split("\n")[0] || "Developer",
          rating: 4.5,
          experienceYears: item.jobSeekerProfile?.experience
            ? parseInt(
                item.jobSeekerProfile.experience.match(/(\d+)/)?.[0] || "2"
              )
            : 2,
          expectedSalary: { min: 15000000, max: 25000000 },
          availability: "Available" as const,
          slug:
            item.slug ||
            `${item.firstName}-${item.lastName}`
              .toLowerCase()
              .replace(/\s+/g, "-"),
          profilePicture: item.profilePicture || "",
        }));
        setJobSeekers(transformedData);
        setFilteredJobSeekers(transformedData);
      }
    } catch (error) {
      console.error("Error refreshing talent data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh function globally for other components to call
  useEffect(() => {
    (window as any).refreshTalentData = refreshTalentData;
    return () => {
      delete (window as any).refreshTalentData;
    };
  }, []);

  useEffect(() => {
    let filtered = jobSeekers;
    if (searchTerm) {
      filtered = filtered.filter(
        (js) =>
          js.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          js.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          js.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          js.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          js.skills?.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }
    setFilteredJobSeekers(filtered);
  }, [searchTerm, jobSeekers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-red-600" />
            <span>Loading all job seekers...</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-green-50 border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center text-sm text-green-800">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>Showing ALL {jobSeekers.length} job seekers in database</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Available Talent
          </h1>
          <p className="text-gray-600 mb-4">
            Complete directory of {jobSeekers.length} job seekers - Find the
            perfect match for your team
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-red-600">
                {jobSeekers.length}
              </div>
              <div className="text-sm text-gray-500">Total Talents</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {
                  jobSeekers.filter((js) => js.availability === "Available")
                    .length
                }
              </div>
              <div className="text-sm text-gray-500">Available Now</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {
                  Array.from(
                    new Set(
                      jobSeekers.flatMap((js: JobSeeker) => js.skills || [])
                    )
                  ).length
                }
              </div>
              <div className="text-sm text-gray-500">Skills Total</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  (jobSeekers.reduce((acc, js) => acc + js.rating, 0) /
                    jobSeekers.length) *
                    10
                ) / 10}
              </div>
              <div className="text-sm text-gray-500">Avg Rating</div>
            </div>
          </div>
        </div>

        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, job title, location, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {filteredJobSeekers.length} of {jobSeekers.length} job
                seekers
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobSeekers.map((jobSeeker) => (
            <Card
              key={jobSeeker.id}
              className="hover:shadow-xl transition-all duration-300 border-0 shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage
                      src={jobSeeker.profilePicture || "/placeholder.svg"}
                      alt={`${jobSeeker.firstName} ${jobSeeker.lastName}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-red-600 text-white text-lg">
                      {jobSeeker.firstName[0]}
                      {jobSeeker.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      {jobSeeker.firstName} {jobSeeker.lastName}
                    </h3>
                    <p className="text-sm font-medium text-red-600 mb-1">
                      {jobSeeker.jobTitle}
                    </p>
                    {jobSeeker.location && (
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{jobSeeker.location}</span>
                      </div>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      jobSeeker.availability === "Available"
                        ? "bg-green-100 text-green-800"
                        : jobSeeker.availability === "Busy"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {jobSeeker.availability}
                  </Badge>
                </div>

                {/* Short Bio - Overview only */}
                {jobSeeker.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {jobSeeker.bio.substring(0, 100)}...
                  </p>
                )}

                {/* Top Skills - Overview only */}
                {jobSeeker.skills && jobSeeker.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {jobSeeker.skills.slice(0, 3).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {jobSeeker.skills.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs text-gray-500"
                        >
                          +{jobSeeker.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                  <div className="text-xs">
                    <div className="font-bold text-gray-900">
                      {jobSeeker.experienceYears}+ years
                    </div>
                    <div className="text-gray-500">Experience</div>
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-gray-900 flex items-center justify-center">
                      <Star className="w-3 h-3 text-yellow-400 mr-1" />
                      {jobSeeker.rating.toFixed(1)}
                    </div>
                    <div className="text-gray-500">Rating</div>
                  </div>
                </div>

                {/* Salary Range - Overview */}
                <div className="p-3 bg-gray-50 rounded text-xs mb-4">
                  <div className="text-gray-600 mb-1">Expected Salary</div>
                  <div className="font-bold text-gray-900">
                    Rp {(jobSeeker.expectedSalary.min / 1000000).toFixed(0)}M -
                    Rp {(jobSeeker.expectedSalary.max / 1000000).toFixed(0)}M
                  </div>
                </div>

                {/* View Profile Button */}
                <Link href={`/u/${jobSeeker.slug}`}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobSeekers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No job seekers found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria
            </p>
            <Button onClick={() => setSearchTerm("")}>
              Show All Job Seekers
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
