# Backend API Requirements for Job Seeker App

This document outlines the required backend API endpoints and database changes to support the enhanced authentication and profile features.

## 📋 Overview

The frontend now includes:

- ✅ Email verification with codes
- ✅ Forgot password flow
- ✅ Change email functionality
- ✅ Custom profile slugs
- ✅ Enhanced profile management

## 🗄️ Database Schema Updates

### 1. Users Table

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS new_email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_change_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_change_expires TIMESTAMP;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_slug ON users(slug);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_code ON users(email_verification_code);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_code ON users(password_reset_code);
CREATE INDEX IF NOT EXISTS idx_users_email_change_code ON users(email_change_code);
```

### 2. Example User Schema (Prisma)

```prisma
model User {
  id                      String    @id @default(cuid())
  email                   String    @unique
  password                String
  firstName               String
  lastName                String
  role                    Role      @default(JOBSEEKER)
  profileComplete         Boolean   @default(false)
  profilePicture          String?
  phone                   String?
  location                String?
  companyName             String?
  companySize             String?
  industry                String?

  // New fields for enhanced features
  slug                    String?   @unique
  emailVerified           Boolean   @default(false)
  emailVerificationCode   String?
  emailVerificationExpires DateTime?
  passwordResetCode       String?
  passwordResetExpires    DateTime?
  newEmail                String?
  emailChangeCode         String?
  emailChangeExpires      DateTime?

  // Relations
  jobSeekerProfile        JobSeekerProfile?
  hrdProfile              HRDProfile?

  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt

  @@map("users")
}

model JobSeekerProfile {
  id          String  @id @default(cuid())
  userId      String  @unique
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  phone       String?
  location    String?
  bio         String?
  skills      String[]
  experience  String?
  education   String?
  portfolio   String?
  linkedin    String?
  github      String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("job_seeker_profiles")
}

model HRDProfile {
  id                  String  @id @default(cuid())
  userId              String  @unique
  user                User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  bio                 String?
  position            String?
  companyWebsite      String?
  companyDescription  String?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@map("hrd_profiles")
}
```

## 🔐 Authentication Endpoints

### 1. Email Verification

#### POST `/api/auth/verify-email`

```typescript
interface VerifyEmailRequest {
  email: string;
  code: string;
}

interface VerifyEmailResponse {
  success: boolean;
  message?: string;
}
```

**Implementation Logic:**

```typescript
async function verifyEmail(email: string, code: string) {
  // 1. Find user by email and verification code
  // 2. Check if code hasn't expired (15 minutes)
  // 3. Set emailVerified = true
  // 4. Clear verification code and expiry
  // 5. Return success response
}
```

#### POST `/api/auth/resend-verification`

```typescript
interface ResendVerificationRequest {
  email: string;
}

interface ResendVerificationResponse {
  success: boolean;
  message?: string;
}
```

**Implementation Logic:**

```typescript
async function resendVerificationCode(email: string) {
  // 1. Generate new 6-digit code
  // 2. Set expiry to 15 minutes from now
  // 3. Send email with code
  // 4. Update user record
}
```

### 2. Password Reset

#### POST `/api/auth/forgot-password`

```typescript
interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
}
```

**Implementation Logic:**

```typescript
async function forgotPassword(email: string) {
  // 1. Find user by email
  // 2. Generate 6-digit reset code
  // 3. Set expiry to 15 minutes
  // 4. Send email with code
  // 5. Save code to database
}
```

#### POST `/api/auth/reset-password`

```typescript
interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message?: string;
}
```

**Implementation Logic:**

```typescript
async function resetPassword(email: string, code: string, newPassword: string) {
  // 1. Find user by email and reset code
  // 2. Verify code hasn't expired
  // 3. Hash new password
  // 4. Update user password
  // 5. Clear reset code and expiry
}
```

### 3. Email Change

#### POST `/api/auth/change-email`

```typescript
interface ChangeEmailRequest {
  newEmail: string;
  password: string;
}

interface ChangeEmailResponse {
  success: boolean;
  message?: string;
}
```

**Implementation Logic:**

```typescript
async function changeEmail(userId: string, newEmail: string, password: string) {
  // 1. Verify current password
  // 2. Check if new email is already in use
  // 3. Generate 6-digit verification code
  // 4. Save new email and code (don't update main email yet)
  // 5. Send verification email to new address
}
```

#### POST `/api/auth/verify-email-change`

```typescript
interface VerifyEmailChangeRequest {
  email: string; // new email
  code: string;
}

interface VerifyEmailChangeResponse {
  success: boolean;
  data?: {
    user: User;
  };
}
```

**Implementation Logic:**

```typescript
async function verifyEmailChange(newEmail: string, code: string) {
  // 1. Find user by newEmail and emailChangeCode
  // 2. Verify code hasn't expired
  // 3. Update main email field
  // 4. Clear newEmail, emailChangeCode, emailChangeExpires
  // 5. Return updated user data
}
```

## 👤 Profile Endpoints

### 1. Update Profile (Enhanced)

#### PUT `/api/profile`

```typescript
interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  profilePicture?: string;
  slug?: string; // NEW FIELD
  jobSeekerProfile?: {
    bio?: string;
    skills?: string[];
    experience?: string;
    education?: string;
    portfolio?: string;
    linkedin?: string;
    github?: string;
  };
  // HRD fields
  companyName?: string;
  companySize?: string;
  industry?: string;
  hrdProfile?: {
    bio?: string;
    position?: string;
    companyWebsite?: string;
    companyDescription?: string;
  };
}

interface UpdateProfileResponse {
  success: boolean;
  data?: User;
  message?: string;
}
```

**Implementation Logic:**

```typescript
async function updateProfile(userId: string, data: UpdateProfileRequest) {
  const transaction = await db.transaction(async (tx) => {
    // 1. Get current user with role
    const user = await tx.user.findUnique({
      where: { id: userId },
      include: { jobSeekerProfile: true, hrdProfile: true },
    });

    if (!user) throw new Error("User not found");

    // 2. Validate slug format if provided
    if (data.slug) {
      const slugRegex = /^[a-z0-9-]+$/;
      if (
        !slugRegex.test(data.slug) ||
        data.slug.length < 3 ||
        data.slug.length > 50
      ) {
        throw new Error("Invalid slug format");
      }

      // Check slug uniqueness
      const existingSlug = await tx.user.findFirst({
        where: { slug: data.slug, NOT: { id: userId } },
      });
      if (existingSlug) throw new Error("Slug already taken");
    }

    // 3. Update main user fields
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        location: data.location,
        profilePicture: data.profilePicture,
        slug: data.slug,
        companyName: data.companyName,
        companySize: data.companySize,
        industry: data.industry,
      },
    });

    // 4. Update role-specific profile data
    if (user.role === "JOBSEEKER" && data.jobSeekerProfile) {
      await tx.jobSeekerProfile.upsert({
        where: { userId },
        create: {
          userId,
          ...data.jobSeekerProfile,
        },
        update: data.jobSeekerProfile,
      });
    }

    if (user.role === "HRD" && data.hrdProfile) {
      await tx.hrdProfile.upsert({
        where: { userId },
        create: {
          userId,
          ...data.hrdProfile,
        },
        update: data.hrdProfile,
      });
    }

    // 5. Calculate profile completion score
    const completionScore = calculateProfileCompletion(updatedUser, user.role);
    await tx.user.update({
      where: { id: userId },
      data: { profileComplete: completionScore >= 80 },
    });

    // 6. Return updated user with all relations
    return await tx.user.findUnique({
      where: { id: userId },
      include: {
        jobSeekerProfile: true,
        hrdProfile: true,
      },
    });
  });

  return transaction;
}

function calculateProfileCompletion(user: User, role: string): number {
  let score = 0;
  const maxScore = 100;

  // Basic fields (40 points)
  if (user.firstName) score += 10;
  if (user.lastName) score += 10;
  if (user.profilePicture) score += 10;
  if (user.phone) score += 10;

  if (role === "JOBSEEKER") {
    // Professional fields (60 points)
    if (user.jobSeekerProfile?.bio) score += 10;
    if (user.jobSeekerProfile?.skills?.length >= 3) score += 15;
    if (user.jobSeekerProfile?.experience) score += 15;
    if (user.jobSeekerProfile?.education) score += 10;
    if (
      user.jobSeekerProfile?.portfolio ||
      user.jobSeekerProfile?.linkedin ||
      user.jobSeekerProfile?.github
    )
      score += 10;
  } else if (role === "HRD") {
    // Company fields (60 points)
    if (user.companyName) score += 20;
    if (user.companySize) score += 15;
    if (user.industry) score += 15;
    if (user.hrdProfile?.bio) score += 10;
  }

  return Math.min(score, maxScore);
}
```

### 2. Get Talent Profile by Slug

#### GET `/api/talent/{slugOrId}`

```typescript
interface TalentProfileResponse {
  success: boolean;
  data?: User;
  message?: string;
}
```

**Implementation Logic:**

```typescript
async function getTalentProfile(slugOrId: string) {
  // 1. Try to find user by slug first
  // 2. If not found, try by ID
  // 3. Only return JOBSEEKER role users
  // 4. Include jobSeekerProfile relation
  // 5. Return formatted profile data
}
```

## 📧 Email Service Requirements

### Email Templates Needed:

#### 1. Email Verification

```html
Subject: Verify Your Email - Job Seeker App Hi {{firstName}}, Welcome to Job
Seeker App! Please verify your email address by entering this code:
**{{verificationCode}}** This code will expire in 15 minutes. If you didn't
create this account, please ignore this email. Best regards, Job Seeker App Team
```

#### 2. Password Reset

```html
Subject: Reset Your Password - Job Seeker App Hi {{firstName}}, You requested to
reset your password. Use this code to reset it: **{{resetCode}}** This code will
expire in 15 minutes. If you didn't request this, please ignore this email. Best
regards, Job Seeker App Team
```

#### 3. Email Change Verification

```html
Subject: Verify Your New Email - Job Seeker App Hi {{firstName}}, You requested
to change your email address. Please verify your new email by entering this
code: **{{verificationCode}}** This code will expire in 15 minutes. If you
didn't request this change, please contact support immediately. Best regards,
Job Seeker App Team
```

## 🔧 Utility Functions

### 1. Code Generation

```typescript
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isCodeExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

function getCodeExpiry(): Date {
  return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
}
```

### 2. Slug Validation

```typescript
function validateSlug(slug: string): boolean {
  // Only lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
}

function generateSlugFromName(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
```

## 🔒 Security Considerations

1. **Rate Limiting**: Limit verification code requests (max 5 per hour per email)
2. **Code Expiry**: All codes expire in 15 minutes
3. **Password Validation**: Ensure new passwords meet strength requirements
4. **Email Validation**: Validate email format and check for disposable emails
5. **Slug Security**: Prevent XSS by validating slug format strictly

## 🧪 Testing Endpoints

### Example API Test Cases:

```bash
# Test email verification
curl -X POST http://localhost:3131/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","code":"123456"}'

# Test profile update with professional data (JOBSEEKER)
curl -X PUT http://localhost:3131/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Developer",
    "slug": "john-developer",
    "jobSeekerProfile": {
      "bio": "Experienced full-stack developer",
      "skills": ["JavaScript", "React", "Node.js"],
      "experience": "5 years in web development",
      "education": "Bachelor in Computer Science",
      "portfolio": "https://johndeveloper.com",
      "linkedin": "https://linkedin.com/in/johndeveloper",
      "github": "https://github.com/johndeveloper"
    }
  }'

# Test profile update with company data (HRD)
curl -X PUT http://localhost:3131/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "companyName": "Tech Corp",
    "companySize": "50-100",
    "industry": "Technology",
    "hrdProfile": {
      "bio": "HR Director at Tech Corp",
      "position": "HR Director",
      "companyWebsite": "https://techcorp.com",
      "companyDescription": "Leading technology company"
    }
  }'

# Test photo upload
curl -X POST http://localhost:3131/api/profile/photo \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@profile-picture.jpg"

# Test talent profile by slug
curl -X GET http://localhost:3131/api/talent/john-developer
```

## 🐛 Common Issues & Debugging

### 1. Profile Update Issues

**Problem**: Professional fields not saving
**Debug Steps**:

```bash
# Check if user exists and has correct role
SELECT id, role, firstName, lastName FROM users WHERE id = 'user_id';

# Check if jobSeekerProfile exists
SELECT * FROM job_seeker_profiles WHERE userId = 'user_id';

# Check if hrdProfile exists
SELECT * FROM hrd_profiles WHERE userId = 'user_id';

# Check profile completion calculation
SELECT id, firstName, lastName, profileComplete FROM users WHERE id = 'user_id';
```

**Solutions**:

- Ensure proper transaction handling in profile updates
- Verify jobSeekerProfile/hrdProfile are created via upsert
- Check that all required fields are included in update request

### 2. Photo Upload Issues

**Problem**: Photo upload fails or doesn't save properly
**Debug Steps**:

```bash
# Check upload directory permissions (for local storage)
ls -la uploads/profile-photos/

# Check S3 bucket permissions (for AWS)
aws s3 ls s3://your-bucket-name/profile-photos/

# Verify environment variables
echo $AWS_ACCESS_KEY_ID
echo $S3_BUCKET_NAME
```

**Solutions**:

- Verify storage configuration (S3 credentials, local directory permissions)
- Check file size and type validation
- Ensure proper error handling and rollback on failure
- Verify database update after successful upload

### 3. API Response Format Issues

**Problem**: Frontend not receiving expected data structure
**Expected Response Format**:

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Developer",
    "profilePicture": "https://storage.url/photo.jpg",
    "role": "JOBSEEKER",
    "jobSeekerProfile": {
      "bio": "Developer bio",
      "skills": ["JavaScript", "React"],
      "experience": "5 years",
      "education": "CS Degree",
      "portfolio": "https://portfolio.com",
      "linkedin": "https://linkedin.com/in/user",
      "github": "https://github.com/user"
    },
    "hrdProfile": null
  },
  "message": "Profile updated successfully"
}
```

### 4. Database Migration Issues

**Check if migrations ran correctly**:

```sql
-- Verify profile tables exist
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('job_seeker_profiles', 'hrd_profiles');

-- Check column existence
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('slug', 'profilePicture');

-- Verify foreign key constraints
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE referenced_table_name = 'users';
```

## 📝 Migration Script

```sql
-- Run this migration to add new fields
BEGIN;

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS new_email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_change_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_change_expires TIMESTAMP;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_slug ON users(slug);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_code ON users(email_verification_code);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_code ON users(password_reset_code);
CREATE INDEX IF NOT EXISTS idx_users_email_change_code ON users(email_change_code);

-- Set existing users as email verified (optional)
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL;

COMMIT;
```

## � **URGENT: Fix Current Profile Issues**

### Issue 1: Professional Fields Not Saving

**Root Cause**: Backend may not be properly handling nested profile data

**Required Fix**:

```typescript
// In your profile update endpoint, ensure this logic:
app.put("/api/profile", async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const updateData = req.body;

    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Update main user fields
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          phone: updateData.phone,
          location: updateData.location,
          profilePicture: updateData.profilePicture,
          slug: updateData.slug,
          // HRD fields
          companyName: updateData.companyName,
          companySize: updateData.companySize,
          industry: updateData.industry,
        },
      });

      // Handle JobSeeker profile
      if (user.role === "JOBSEEKER" && updateData.jobSeekerProfile) {
        await tx.jobSeekerProfile.upsert({
          where: { userId },
          create: {
            userId,
            bio: updateData.jobSeekerProfile.bio,
            skills: updateData.jobSeekerProfile.skills || [],
            experience: updateData.jobSeekerProfile.experience,
            education: updateData.jobSeekerProfile.education,
            portfolio: updateData.jobSeekerProfile.portfolio,
            linkedin: updateData.jobSeekerProfile.linkedin,
            github: updateData.jobSeekerProfile.github,
          },
          update: {
            bio: updateData.jobSeekerProfile.bio,
            skills: updateData.jobSeekerProfile.skills,
            experience: updateData.jobSeekerProfile.experience,
            education: updateData.jobSeekerProfile.education,
            portfolio: updateData.jobSeekerProfile.portfolio,
            linkedin: updateData.jobSeekerProfile.linkedin,
            github: updateData.jobSeekerProfile.github,
          },
        });
      }

      // Handle HRD profile
      if (user.role === "HRD" && updateData.hrdProfile) {
        await tx.hrdProfile.upsert({
          where: { userId },
          create: {
            userId,
            bio: updateData.hrdProfile.bio,
            position: updateData.hrdProfile.position,
            companyWebsite: updateData.hrdProfile.companyWebsite,
            companyDescription: updateData.hrdProfile.companyDescription,
          },
          update: {
            bio: updateData.hrdProfile.bio,
            position: updateData.hrdProfile.position,
            companyWebsite: updateData.hrdProfile.companyWebsite,
            companyDescription: updateData.hrdProfile.companyDescription,
          },
        });
      }

      // Return user with all relations
      return await tx.user.findUnique({
        where: { id: userId },
        include: {
          jobSeekerProfile: true,
          hrdProfile: true,
        },
      });
    });

    res.json({
      success: true,
      data: result,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to update profile",
    });
  }
});
```

### Issue 2: Photo Upload Not Working

**Root Cause**: Missing storage configuration or improper file handling

**Quick Fix for Local Storage**:

```typescript
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "profile-photos");
    await fs.ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user.id;
    const fileExt = path.extname(file.originalname);
    const fileName = `profile_${userId}_${Date.now()}${fileExt}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
});

app.post("/api/profile/photo", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    const userId = req.user.id;
    const baseUrl = process.env.BASE_URL || "http://localhost:3131";
    const photoUrl = `${baseUrl}/uploads/profile-photos/${req.file.filename}`;

    // Update user profile picture in database
    const user = await db.user.update({
      where: { id: userId },
      data: { profilePicture: photoUrl },
      select: { profilePicture: true },
    });

    res.json({
      success: true,
      data: {
        url: photoUrl,
        fileName: req.file.filename,
      },
      message: "Profile photo uploaded successfully",
    });
  } catch (error) {
    console.error("Photo upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to upload photo",
    });
  }
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
```

### Issue 3: Missing Database Tables

**Run this migration immediately**:

```sql
-- Create JobSeekerProfile table if not exists
CREATE TABLE IF NOT EXISTS job_seeker_profiles (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  location VARCHAR(255),
  bio TEXT,
  skills JSON,
  experience TEXT,
  education TEXT,
  portfolio VARCHAR(500),
  linkedin VARCHAR(500),
  github VARCHAR(500),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create HRDProfile table if not exists
CREATE TABLE IF NOT EXISTS hrd_profiles (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) UNIQUE NOT NULL,
  bio TEXT,
  position VARCHAR(255),
  companyWebsite VARCHAR(500),
  companyDescription TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profilePicture VARCHAR(500);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_slug ON users(slug);
CREATE INDEX IF NOT EXISTS idx_job_seeker_profiles_userId ON job_seeker_profiles(userId);
CREATE INDEX IF NOT EXISTS idx_hrd_profiles_userId ON hrd_profiles(userId);
```

## �🚀 Implementation Priority

1. **High Priority** (Core functionality):

   - Profile update with slug support
   - Talent profile by slug endpoint
   - Email verification endpoints

2. **Medium Priority** (Security features):

   - Password reset flow
   - Email change functionality

3. **Low Priority** (Nice to have):
   - Rate limiting
   - Advanced email templates
   - Slug auto-generation

## 📞 Frontend Integration Notes

The frontend is already implemented and expects these exact endpoint paths and response formats. Once you implement these backend endpoints, the following features will work immediately:

- ✅ Custom profile slugs (`/u/your-slug`)
- ✅ Email verification during registration
- ✅ Forgot password flow
- ✅ Change email functionality
- ✅ Enhanced profile management

All frontend code includes proper error handling and fallback mechanisms, so partial backend implementation is supported.

#### GET /api/applications/check/:jobId

**Purpose**: Check if user has already applied to a specific job

**Response**:

```json
{
  "success": true,
  "data": {
    "hasApplied": true,
    "applicationId": "string",
    "appliedAt": "ISO8601 date",
    "status": "PENDING"
  }
}
```

---

### 2. Profile Photo Upload

#### POST /api/profile/photo

**Purpose**: Upload and update user profile photo

**Request**: `multipart/form-data`

- `photo`: File (image/jpeg, image/png, image/gif)
- Max size: 5MB

**Response**:

```json
{
  "success": true,
  "data": {
    "url": "https://storage.example.com/profiles/user123.jpg",
    "thumbnailUrl": "https://storage.example.com/profiles/user123_thumb.jpg"
  },
  "message": "Profile photo updated successfully"
}
```

**Error Responses**:

- 400: Invalid file type or size too large
- 401: Unauthorized
- 413: File too large (>5MB)

**Implementation Logic:**

```typescript
async function uploadProfilePhoto(userId: string, file: File) {
  // 1. Validate file
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
    );
  }

  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 5MB.");
  }

  // 2. Generate unique filename
  const fileExtension = file.name.split(".").pop();
  const fileName = `profile_${userId}_${Date.now()}.${fileExtension}`;
  const thumbnailName = `profile_${userId}_${Date.now()}_thumb.${fileExtension}`;

  try {
    // 3. Upload to storage (choose your storage solution)
    const uploadResults = await Promise.all([
      // Option A: AWS S3
      uploadToS3(file, fileName),
      // Option B: Local storage
      // saveToLocal(file, fileName),
      // Option C: Cloudinary
      // uploadToCloudinary(file, fileName)
    ]);

    // 4. Create thumbnail
    const thumbnail = await createThumbnail(file, 150, 150);
    const thumbnailUrl = await uploadToS3(thumbnail, thumbnailName);

    const imageUrl = uploadResults[0].url;

    // 5. Get current user and old photo URL
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true },
    });

    // 6. Update user profile picture in database
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        profilePicture: imageUrl,
        updatedAt: new Date(),
      },
    });

    // 7. Delete old photo from storage (async, don't wait)
    if (user?.profilePicture && user.profilePicture !== imageUrl) {
      deleteFromStorage(user.profilePicture).catch(console.error);
    }

    // 8. Return response
    return {
      success: true,
      data: {
        url: imageUrl,
        thumbnailUrl: thumbnailUrl,
        fileName: fileName,
      },
      message: "Profile photo updated successfully",
    };
  } catch (error) {
    console.error("Photo upload failed:", error);
    throw new Error("Failed to upload photo. Please try again.");
  }
}

// Helper function for S3 upload
async function uploadToS3(file: File, fileName: string) {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `profile-photos/${fileName}`,
    Body: file,
    ContentType: file.type,
    ACL: "public-read",
  };

  const result = await s3.upload(params).promise();
  return { url: result.Location };
}

// Helper function for local storage
async function saveToLocal(file: File, fileName: string) {
  const uploadsDir = path.join(process.cwd(), "uploads", "profile-photos");
  await fs.ensureDir(uploadsDir);

  const filePath = path.join(uploadsDir, fileName);
  await fs.writeFile(filePath, file);

  const baseUrl = process.env.BASE_URL || "http://localhost:3131";
  return { url: `${baseUrl}/uploads/profile-photos/${fileName}` };
}

// Helper function to create thumbnail
async function createThumbnail(file: File, width: number, height: number) {
  const sharp = require("sharp");
  const buffer = await file.arrayBuffer();

  const thumbnailBuffer = await sharp(Buffer.from(buffer))
    .resize(width, height, {
      fit: "cover",
      position: "center",
    })
    .jpeg({ quality: 85 })
    .toBuffer();

  return new File([thumbnailBuffer], "thumbnail.jpg", { type: "image/jpeg" });
}
```

**Required Environment Variables:**

```env
# For AWS S3 storage
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# For local storage
BASE_URL=http://localhost:3131

# For Cloudinary (alternative)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Required Dependencies:**

```json
{
  "dependencies": {
    "aws-sdk": "^2.1.x",
    "sharp": "^0.32.x",
    "fs-extra": "^11.x",
    "path": "^0.12.x"
  }
}
```

---

### 3. Profile Updates

#### PUT /api/profile

**Purpose**: Update user profile information (including professional details)

**Request Body**:

```json
{
  // Personal Info
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "location": "string",
  "bio": "string",

  // Professional Info (for Jobseekers)
  "skills": ["string"],
  "experience": "string",
  "education": "string",
  "portfolioLinks": ["string"],
  "github": "string",
  "linkedin": "string",
  "website": "string",

  // Company Info (for HRD)
  "companyName": "string",
  "companySize": "string",
  "industry": "string"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    // Updated user object with all fields
  },
  "message": "Profile updated successfully"
}
```

**Error Responses**:

- 400: Validation errors
- 401: Unauthorized

**Implementation Notes**:

- Validate all fields before saving
- Skills should be stored as JSON array
- Calculate and update profile completion percentage
- Update `updatedAt` timestamp

---

### 4. Job Management

#### PUT /api/jobs/:id

**Purpose**: Update existing job posting

**Request Body**:

```json
{
  "title": "string (required)",
  "location": "string (required)",
  "jobType": "FULL_TIME|PART_TIME|CONTRACT|INTERNSHIP|FREELANCE (required)",
  "workMode": "ONSITE|REMOTE|HYBRID (required)",
  "experienceLevel": "ENTRY|MID|SENIOR|LEAD|EXECUTIVE (required)",
  "description": "string (required)",
  "requirements": "string (required)",
  "benefits": "string (optional)",
  "skills": ["string"] (optional),
  "salaryMin": number (optional),
  "salaryMax": number (optional),
  "expiresAt": "ISO8601 date (optional)"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    // Updated job object
  },
  "message": "Job updated successfully"
}
```

**Authorization**:

- Only job owner (matching companyName) can update
- Return 403 if not authorized

---

#### PATCH /api/jobs/:id/status

**Purpose**: Toggle job active/inactive status

**Request Body**:

```json
{
  "isActive": true
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "string",
    "isActive": true
  },
  "message": "Job status updated successfully"
}
```

---

### 5. Profile Slug System

#### POST /api/profile/slug

**Purpose**: Create/update custom profile slug

**Request Body**:

```json
{
  "slug": "john-doe-developer"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "slug": "john-doe-developer",
    "profileUrl": "https://jobseeker.com/u/john-doe-developer"
  },
  "message": "Profile slug updated successfully"
}
```

**Validation**:

- Slug must be unique
- 3-50 characters
- Only lowercase letters, numbers, hyphens
- Cannot start/end with hyphen
- Reserved slugs: admin, api, dashboard, jobs, etc.

**Error Responses**:

- 400: Invalid slug format
- 409: Slug already taken

---

#### GET /api/profile/u/:slug

**Purpose**: Get public profile by slug

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "profilePicture": "string",
    "bio": "string",
    "location": "string",
    "skills": ["string"],
    "experience": "string",
    "education": "string",
    "portfolioLinks": ["string"],
    "github": "string",
    "linkedin": "string",
    "website": "string",
    "slug": "string"
    // Hide sensitive data: email, phone, etc.
  }
}
```

---

## 🟡 Profile Completion Score

### Calculation Logic

The profile completion score should be calculated based on filled fields:

**For Jobseekers** (100 points total):

- Basic Info (30 points):

  - First Name (5 points)
  - Last Name (5 points)
  - Profile Picture (10 points)
  - Location (5 points)
  - Bio (5 points)

- Professional Info (40 points):

  - Skills (at least 3) (10 points)
  - Experience (10 points)
  - Education (10 points)
  - Portfolio Links (at least 1) (10 points)

- Additional Info (30 points):
  - Phone (10 points)
  - LinkedIn (10 points)
  - GitHub or Website (10 points)

**For HRD Users** (100 points total):

- Basic Info (40 points):

  - First Name (5 points)
  - Last Name (5 points)
  - Profile Picture (15 points)
  - Phone (15 points)

- Company Info (60 points):
  - Company Name (20 points)
  - Company Size (15 points)
  - Industry (15 points)
  - Location (10 points)

### Database Schema Updates

Add to User table:

```prisma
model User {
  // ... existing fields

  profileCompletion  Int      @default(0)  // 0-100 percentage
  slug               String?  @unique      // Custom profile URL slug

  // Professional fields for jobseekers
  skills            String[] @default([])
  experience        String?
  education         String?
  portfolioLinks    String[] @default([])
  github            String?
  linkedin          String?
  website           String?

  // Company fields for HRD
  companySize       String?
  industry          String?

  updatedAt         DateTime @updatedAt
}
```

Add Application table if not exists:

```prisma
model Application {
  id              String   @id @default(uuid())
  jobId           String
  userId          String
  status          String   @default("PENDING") // PENDING, REVIEWED, SHORTLISTED, ACCEPTED, REJECTED
  coverLetter     String?
  portfolioLinks  String[] @default([])
  customAnswers   Json?
  appliedAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  job             Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([jobId, userId]) // Prevent duplicate applications
  @@map("applications")
}
```

---

## 🔧 Implementation Priority

### High Priority (Required for core functionality):

1. ✅ POST /api/applications - Apply to jobs
2. ✅ GET /api/applications/check/:jobId - Check application status
3. ✅ PUT /api/profile - Save professional info
4. ✅ POST /api/profile/photo - Upload profile photo
5. ✅ PUT /api/jobs/:id - Update job posting

### Medium Priority (Important for UX):

6. ✅ PATCH /api/jobs/:id/status - Toggle job status
7. ✅ Profile completion score calculation
8. ✅ POST /api/profile/slug - Custom profile URL

### Low Priority (Nice to have):

9. GET /api/profile/u/:slug - Public profile viewing
10. Profile analytics and insights

---

## 📝 Additional Notes

### Authentication

- All protected endpoints should verify JWT token
- Token should be sent in `Authorization: Bearer <token>` header
- Return 401 for missing/invalid tokens

### Error Handling

All error responses should follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "User-friendly error message",
  "code": "ERROR_CODE"
}
```

### File Upload Configuration

- Max file size: 5MB for images
- Allowed types: image/jpeg, image/png, image/gif
- Generate thumbnails: 150x150px for avatars
- Store file metadata in database

### Rate Limiting

- Application submissions: 10 per hour per user
- Profile updates: 100 per hour per user
- Photo uploads: 5 per hour per user

---

## 🚀 Testing Endpoints

Use these test scenarios to verify endpoints work correctly:

### Job Application

```bash
# Apply to job
curl -X POST http://localhost:3131/api/applications \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job-uuid",
    "coverLetter": "I am interested in this position..."
  }'

# Check if already applied
curl -X GET http://localhost:3131/api/applications/check/job-uuid \
  -H "Authorization: Bearer <token>"
```

### Profile Photo

```bash
# Upload photo
curl -X POST http://localhost:3131/api/profile/photo \
  -H "Authorization: Bearer <token>" \
  -F "photo=@profile.jpg"
```

### Profile Update

```bash
# Update profile
curl -X PUT http://localhost:3131/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": "5 years",
    "education": "Bachelor of Computer Science"
  }'
```

---

## 📞 Support

If you need clarification on any endpoint, please contact the frontend team.

**Last Updated**: October 11, 2025
