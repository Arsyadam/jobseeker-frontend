# 📸 Profile Photo Upload - Quick Start Guide

## Where to Find It

Navigate to: **`http://localhost:3000/profile`**

The profile photo upload feature is located in the **Profile Page** under the **Personal Info** tab.

## Visual Location

```
┌─────────────────────────────────────────────────────────┐
│  Profile Page                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┬──────────────────┐               │
│  │ Personal Info    │ Professional     │  ← Tabs       │
│  └──────────────────┴──────────────────┘               │
│                                                         │
│  ┌─────────────────────────────────────┐               │
│  │ Basic Information                   │               │
│  │  - First Name, Last Name            │               │
│  │  - Phone, Location, Bio             │               │
│  └─────────────────────────────────────┘               │
│                                                         │
│  ┌─────────────────────────────────────┐               │
│  │ Profile Photo                    ← NEW!             │
│  │  Upload or update your profile picture              │
│  ├─────────────────────────────────────┤               │
│  │                                     │               │
│  │  [Preview Image]                    │               │
│  │                                     │               │
│  │  [Choose File]  [Upload]            │               │
│  │  [Delete Photo]                     │               │
│  │                                     │               │
│  │  Formats: JPEG, PNG, GIF, WebP      │               │
│  │  Max size: 5MB • Optimal: 500x500px │               │
│  └─────────────────────────────────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Usage Flow

### 🎯 Uploading a Photo

1. **Navigate to Profile**

   ```
   Click: Profile → Personal Info tab
   ```

2. **Select Photo**

   ```
   Click: [Choose File] button
   Select: Image file from your computer
   ```

3. **Preview**

   ```
   ✓ Preview appears automatically
   ✓ Shows selected image before upload
   ```

4. **Upload**
   ```
   Click: [Upload] button
   Wait: Progress indicator shows
   Success: Toast notification appears
   Result: Photo updates in profile + sidebar
   ```

### 🗑️ Deleting a Photo

1. **Delete Button**
   ```
   Click: [Delete Photo] button (red)
   Confirm: Photo is removed
   Success: Toast notification appears
   ```

## What Happens Behind the Scenes

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser    │ ──────> │   Backend    │ ──────> │  Cloudinary  │
│  (Frontend)  │         │   API Server │         │   (Cloud)    │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                        │
       │ 1. Select file         │                        │
       │ 2. Validate (5MB)      │                        │
       │ 3. Show preview        │                        │
       │                        │                        │
       │ 4. POST /profile/photo │                        │
       │ ─────────────────────> │                        │
       │                        │ 5. Upload to Cloudinary│
       │                        │ ─────────────────────> │
       │                        │                        │
       │                        │ 6. Optimize & resize   │
       │                        │ <- (500x500, face crop)│
       │                        │                        │
       │                        │ 7. Get secure URL      │
       │                        │ <───────────────────── │
       │                        │                        │
       │ 8. Save URL to DB      │                        │
       │    (Prisma/PostgreSQL) │                        │
       │                        │                        │
       │ 9. Return response     │                        │
       │ <───────────────────── │                        │
       │                        │                        │
       │ 10. Update UI          │                        │
       │     Show toast         │                        │
       │     Refresh avatar     │                        │
```

## Features

### ✅ Validation

- File type: JPEG, PNG, GIF, WebP
- Max size: 5MB
- Client-side + server-side validation

### ✅ Optimization

- Auto-resize to 500x500px
- Face detection for smart cropping
- Thumbnail generation (150x150px)
- CDN delivery for fast loading

### ✅ User Experience

- Real-time preview
- Loading indicators
- Success/error messages
- Profile completion tracking

## Examples

### Before Upload

```
Profile Picture: [Default Avatar with Initials]
Profile Completion: 65%
```

### After Upload

```
Profile Picture: [Your Photo - Optimized 500x500px]
Profile Completion: 75% (+10%)
Toast: "✓ Profile photo uploaded! Profile is now 75% complete."
```

### After Delete

```
Profile Picture: [Back to Default Avatar]
Profile Completion: 65% (-10%)
Toast: "✓ Profile photo deleted. Profile is now 65% complete."
```

## Troubleshooting

### ❌ "Unauthorized" Error

**Solution**: Make sure you're logged in. Check JWT token exists.

```javascript
localStorage.getItem("auth_token"); // Should return a token
```

### ❌ "File too large" Error

**Solution**: Reduce image size to under 5MB

- Use online tools: tinypng.com, compressor.io
- Or use image editor: reduce dimensions or quality

### ❌ "Invalid file type" Error

**Solution**: Convert image to supported format

- Supported: .jpg, .jpeg, .png, .gif, .webp
- Not supported: .bmp, .tiff, .svg, .ico

### ❌ Upload button stays disabled

**Solution**: Make sure a file is selected

- Check if file input has a value
- Try selecting the file again

### ❌ Network error / API not responding

**Solution**: Check backend is running

```bash
# Backend should be running on port 3131
curl http://localhost:3131/api/health
```

## API Testing

Test the API directly with curl:

```bash
# Get your token from localStorage first
TOKEN="your-jwt-token-here"

# Upload photo
curl -X POST http://localhost:3131/api/profile/photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@/path/to/image.jpg"

# Delete photo
curl -X DELETE http://localhost:3131/api/profile/photo \
  -H "Authorization: Bearer $TOKEN"
```

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **UI Components**: shadcn/ui
- **Backend**: Node.js, Express, Prisma
- **Storage**: Cloudinary (cloud-based CDN)
- **Database**: PostgreSQL

## File Locations

```
jobseeker-frontend/
├── components/
│   └── ProfilePhotoUpload.tsx          ← Main component
├── app/
│   └── profile/
│       └── page.tsx                     ← Integration page
├── lib/
│   └── api.ts                           ← API methods
├── .env.local                           ← Configuration
└── CLOUDINARY_INTEGRATION.md            ← Full docs
```

---

**Ready to test?**

1. Start backend: `cd jobseeker-backend && npm run dev`
2. Start frontend: `cd jobseeker-frontend && npm run dev`
3. Navigate to: `http://localhost:3000/profile`
4. Click: Personal Info → Profile Photo section
5. Upload your first photo! 📸
