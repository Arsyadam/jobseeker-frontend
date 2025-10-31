"use client";

import type React from "react";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileText,
  Camera,
  CheckCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function CVUploadPage() {
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "processing" | "completed" | "error"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { updateUser } = useAuth();
  const router = useRouter();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF, DOC, DOCX, JPG, or PNG file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setError("");
    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiClient.uploadCV(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setUploadStatus("processing");

        // Simulate processing time
        setTimeout(() => {
          setUploadStatus("completed");
          updateUser({ profileComplete: true });
        }, 3000);
      } else {
        throw new Error(response.error || "Upload failed");
      }
    } catch (error) {
      setUploadStatus("error");
      setError(error instanceof Error ? error.message : "Upload failed");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard/jobseeker");
  };

  const handleContinue = () => {
    router.push("/dashboard/jobseeker");
  };

  if (uploadStatus === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">
              CV Processed Successfully!
            </CardTitle>
            <CardDescription>
              Your CV has been analyzed and your profile has been updated with
              the extracted information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">
                  What we extracted:
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Work experience and skills</li>
                  <li>• Education background</li>
                  <li>• Professional summary</li>
                  <li>• Contact information</li>
                </ul>
              </div>

              <Button onClick={handleContinue} className="w-full">
                Continue to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Upload Your CV</CardTitle>
          <CardDescription>
            Let our AI analyze your CV and automatically fill your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {uploadStatus === "idle" && (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your CV here
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse files
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Take Photo of CV
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Supported formats: PDF, DOC, DOCX, JPG, PNG (max 5MB)
              </p>
            </div>
          )}

          {(uploadStatus === "uploading" || uploadStatus === "processing") && (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {uploadStatus === "uploading"
                    ? "Uploading CV..."
                    : "Processing CV..."}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {uploadStatus === "uploading"
                    ? "Please wait while we upload your file"
                    : "Our AI is analyzing your CV and extracting information"}
                </p>
              </div>

              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-gray-500">
                  {uploadProgress}% complete
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploadStatus === "idle" && (
            <div className="mt-6 text-center">
              <Button variant="ghost" onClick={handleSkip}>
                Skip for now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
