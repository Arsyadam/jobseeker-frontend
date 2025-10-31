"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, Trash2 } from "lucide-react";

interface ProfilePhotoUploadProps {
  authToken: string;
  onUploadSuccess?: (data: {
    url: string;
    thumbnailUrl: string;
    publicId: string;
    profileCompletion: number;
  }) => void;
  onDeleteSuccess?: (data: { profileCompletion: number }) => void;
  currentPhotoUrl?: string;
}

export function ProfilePhotoUpload({
  authToken,
  onUploadSuccess,
  onDeleteSuccess,
  currentPhotoUrl,
}: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(
    currentPhotoUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const ACCEPTED_FORMATS = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      setError("Only JPEG, PNG, GIF, and WebP formats are allowed");
      toast({
        title: "Invalid File Type",
        description: "Only JPEG, PNG, GIF, and WebP formats are allowed",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File must be less than 5MB");
      toast({
        title: "File Too Large",
        description: "File must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please select a photo");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/photo`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      toast({
        title: "Success",
        description: "Profile photo uploaded successfully",
      });

      setPreview(data.data.url);
      onUploadSuccess?.(data.data);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Upload failed";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentPhotoUrl) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/photo`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      toast({
        title: "Success",
        description: "Profile photo deleted successfully",
      });

      setPreview(null);
      onDeleteSuccess?.(data.data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Delete failed";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      {preview && (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
          <Image
            src={preview}
            alt="Profile preview"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* File Input */}
      <div className="flex gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FORMATS.join(",")}
          onChange={handleFileSelect}
          disabled={uploading || deleting}
          className="flex-1"
        />
        <Button
          onClick={handleUpload}
          disabled={
            uploading || deleting || !fileInputRef.current?.files?.length
          }
          className="bg-red-600 hover:bg-red-700"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </>
          )}
        </Button>
      </div>

      {/* Delete Button */}
      {currentPhotoUrl && (
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={uploading || deleting}
          className="w-full"
        >
          {deleting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Photo
            </>
          )}
        </Button>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500">
        Formats: JPEG, PNG, GIF, WebP • Max size: 5MB • Optimal: 500x500px
      </p>
    </div>
  );
}
