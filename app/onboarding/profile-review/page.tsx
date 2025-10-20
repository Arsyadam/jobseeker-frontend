"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Edit, CheckCircle, X, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

const generatedProfile = {
  personalInfo: {
    fullName: "John Doe",
    email: "john.doe@email.com",
    phone: "+62 812 3456 7890",
    location: "Jakarta, Indonesia",
    title: "Senior Frontend Developer",
  },
  summary:
    "Experienced Frontend Developer with 5+ years of expertise in React, TypeScript, and modern web technologies. Proven track record of building scalable web applications and leading development teams. Passionate about creating exceptional user experiences and staying current with emerging technologies.",
  experience: [
    {
      company: "TechCorp Indonesia",
      position: "Senior Frontend Developer",
      duration: "2022 - Present",
      description:
        "Led development of customer-facing web applications using React and TypeScript. Improved application performance by 40% and mentored junior developers.",
    },
    {
      company: "StartupXYZ",
      position: "Frontend Developer",
      duration: "2020 - 2022",
      description:
        "Developed responsive web applications and collaborated with design team to implement pixel-perfect UI components.",
    },
  ],
  skills: {
    technical: ["React", "TypeScript", "Next.js", "JavaScript", "HTML/CSS", "Node.js", "Git"],
    soft: ["Team Leadership", "Problem Solving", "Communication", "Project Management"],
  },
  education: [
    {
      degree: "Bachelor of Computer Science",
      institution: "University of Indonesia",
      year: "2019",
    },
  ],
}

export default function ProfileReviewPage() {
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [profile, setProfile] = useState(generatedProfile)
  const [newSkill, setNewSkill] = useState("")
  const router = useRouter()

  const handleSave = (section: string, data: any) => {
    setProfile((prev) => ({
      ...prev,
      [section]: data,
    }))
    setIsEditing(null)
  }

  const addSkill = (type: "technical" | "soft") => {
    if (newSkill.trim()) {
      setProfile((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          [type]: [...prev.skills[type], newSkill.trim()],
        },
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (type: "technical" | "soft", skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [type]: prev.skills[type].filter((s) => s !== skill),
      },
    }))
  }

  const handleComplete = () => {
    router.push("/dashboard/jobseeker")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Your AI-Generated Profile</h1>
          <p className="text-gray-600">Review and edit the information extracted from your CV</p>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic contact details</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(isEditing === "personal" ? null : "personal")}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              {isEditing === "personal" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" defaultValue={profile.personalInfo.fullName} />
                    </div>
                    <div>
                      <Label htmlFor="title">Professional Title</Label>
                      <Input id="title" defaultValue={profile.personalInfo.title} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={profile.personalInfo.email} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" defaultValue={profile.personalInfo.phone} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" defaultValue={profile.personalInfo.location} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(null)} className="bg-red-600 hover:bg-red-700">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{profile.personalInfo.fullName}</h3>
                  <p className="text-gray-600">{profile.personalInfo.title}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <p>📧 {profile.personalInfo.email}</p>
                    <p>📱 {profile.personalInfo.phone}</p>
                    <p>📍 {profile.personalInfo.location}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Professional Summary</CardTitle>
                <CardDescription>AI-generated summary of your experience</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(isEditing === "summary" ? null : "summary")}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              {isEditing === "summary" ? (
                <div className="space-y-4">
                  <Textarea defaultValue={profile.summary} rows={4} placeholder="Write your professional summary..." />
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(null)} className="bg-red-600 hover:bg-red-700">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed">{profile.summary}</p>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Skills</CardTitle>
                <CardDescription>Technical and soft skills identified from your CV</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(isEditing === "skills" ? null : "skills")}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Technical Skills</h4>
                  {isEditing === "skills" && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="w-32"
                      />
                      <Button size="sm" onClick={() => addSkill("technical")}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.technical.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="relative group">
                      {skill}
                      {isEditing === "skills" && (
                        <button
                          onClick={() => removeSkill("technical", skill)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Soft Skills</h4>
                  {isEditing === "skills" && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="w-32"
                      />
                      <Button size="sm" onClick={() => addSkill("soft")}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.soft.map((skill, index) => (
                    <Badge key={index} variant="outline" className="relative group">
                      {skill}
                      {isEditing === "skills" && (
                        <button
                          onClick={() => removeSkill("soft", skill)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {isEditing === "skills" && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => setIsEditing(null)} className="bg-red-600 hover:bg-red-700">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(null)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription>Your professional experience history</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(isEditing === "experience" ? null : "experience")}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-red-200 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{exp.position}</h4>
                        <p className="text-red-600 font-medium">{exp.company}</p>
                        <p className="text-sm text-gray-500">{exp.duration}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{exp.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => router.push("/onboarding/cv-upload")}
            >
              Back to Upload
            </Button>
            <Button onClick={handleComplete} className="flex-1 bg-red-600 hover:bg-red-700">
              Complete Profile Setup
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
