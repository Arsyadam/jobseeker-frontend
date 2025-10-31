# 🧪 Cloudinary Profile Photo - Testing Checklist

## Pre-Testing Setup

### ✅ Environment Check

- [ ] Backend is running on `http://localhost:3131`
- [ ] Frontend is running on `http://localhost:3000`
- [ ] PostgreSQL database is connected
- [ ] You have a valid user account (logged in)
- [ ] JWT token exists in localStorage

### ✅ Configuration Check

```bash
# Frontend .env.local should have:
NEXT_PUBLIC_API_URL=http://localhost:3131/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dpu1ceueb
```

---

## 🎯 Functional Testing

### Test 1: Navigation

- [ ] Navigate to `/profile`
- [ ] See profile page loads
- [ ] Click "Personal Info" tab
- [ ] Scroll down to "Profile Photo" section
- [ ] Section is visible and rendered

### Test 2: File Selection

- [ ] Click "Choose File" button
- [ ] File picker opens
- [ ] Select a `.jpg` file (< 5MB)
- [ ] Preview appears in the UI
- [ ] Preview shows correct image

### Test 3: File Validation - Valid Files

- [ ] Upload `.jpg` file → ✅ Should work
- [ ] Upload `.png` file → ✅ Should work
- [ ] Upload `.gif` file → ✅ Should work
- [ ] Upload `.webp` file → ✅ Should work

### Test 4: File Validation - Invalid Files

- [ ] Try `.bmp` file → ❌ Should show error "Only JPEG, PNG, GIF, and WebP formats are allowed"
- [ ] Try `.pdf` file → ❌ Should show error
- [ ] Try 10MB file → ❌ Should show error "File must be less than 5MB"

### Test 5: Upload Process

- [ ] Select valid image
- [ ] Click "Upload" button
- [ ] Button shows "Uploading..." with spinner
- [ ] Button is disabled during upload
- [ ] Upload completes successfully
- [ ] Success toast appears: "Profile photo uploaded successfully"
- [ ] Image updates in profile sidebar (avatar)
- [ ] Image updates in preview
- [ ] Profile completion percentage increases

### Test 6: Photo Display

- [ ] Uploaded photo shows in sidebar avatar
- [ ] Photo is properly cropped (500x500px)
- [ ] Photo loads from Cloudinary CDN
- [ ] URL starts with `https://res.cloudinary.com/dpu1ceueb/`
- [ ] Thumbnail version loads in smaller views

### Test 7: Delete Functionality

- [ ] "Delete Photo" button is visible after upload
- [ ] Click "Delete Photo" button
- [ ] Button shows "Deleting..." with spinner
- [ ] Delete completes successfully
- [ ] Success toast appears: "Profile photo deleted successfully"
- [ ] Avatar reverts to default (initials)
- [ ] Profile completion percentage decreases
- [ ] "Delete Photo" button disappears

### Test 8: Error Handling

- [ ] Stop backend server
- [ ] Try to upload photo
- [ ] Error message appears
- [ ] Error toast shows clear message
- [ ] UI remains functional
- [ ] Restart backend
- [ ] Upload works again

### Test 9: State Management

- [ ] Upload photo
- [ ] Refresh page
- [ ] Photo persists (loaded from database)
- [ ] Navigate away from profile
- [ ] Navigate back
- [ ] Photo still shows correctly

### Test 10: Multiple Uploads

- [ ] Upload photo #1
- [ ] Wait for success
- [ ] Upload photo #2 (different image)
- [ ] Old photo is replaced
- [ ] Only newest photo shows
- [ ] No duplicate photos in Cloudinary

---

## 🔒 Security Testing

### Test 11: Authentication

- [ ] Logout
- [ ] Try to access `/profile`
- [ ] Should redirect to login
- [ ] Cannot upload without token

### Test 12: Token Expiry

- [ ] Clear localStorage token
- [ ] Try to upload
- [ ] Should fail with "Unauthorized"
- [ ] Re-login
- [ ] Upload works again

---

## 🎨 UI/UX Testing

### Test 13: Loading States

- [ ] Upload shows loading spinner
- [ ] Delete shows loading spinner
- [ ] Buttons disabled during operations
- [ ] File input disabled during operations

### Test 14: Error Messages

- [ ] Error messages are user-friendly
- [ ] Errors show in red color
- [ ] Errors have proper border/background
- [ ] Technical details hidden from user

### Test 15: Toast Notifications

- [ ] Success toasts are green/positive
- [ ] Error toasts are red/destructive
- [ ] Toasts auto-dismiss after ~3-5 seconds
- [ ] Multiple toasts stack properly

### Test 16: Responsive Design

- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768px width)
- [ ] Test on mobile (375px width)
- [ ] Component adapts to screen size
- [ ] Preview image scales properly

---

## 🚀 Performance Testing

### Test 17: Upload Speed

- [ ] Upload small image (< 100KB)
- [ ] Upload medium image (1-2MB)
- [ ] Upload large image (4-5MB)
- [ ] All complete in reasonable time (< 10s)

### Test 18: Image Optimization

- [ ] Upload 4000x3000px image
- [ ] Check delivered image dimensions
- [ ] Should be resized to 500x500px
- [ ] File size should be optimized

### Test 19: CDN Performance

- [ ] First load: image fetches from Cloudinary
- [ ] Subsequent loads: image loads from cache
- [ ] Image loads fast (< 1s on good connection)

---

## 🔗 Integration Testing

### Test 20: Profile Completion

- [ ] Check initial completion percentage
- [ ] Upload photo
- [ ] Completion increases by 10%
- [ ] Delete photo
- [ ] Completion decreases by 10%
- [ ] Percentage matches calculation

### Test 21: Multi-Tab Sync

- [ ] Open profile in two browser tabs
- [ ] Upload photo in tab 1
- [ ] Refresh tab 2
- [ ] Photo appears in tab 2

### Test 22: User Context Update

- [ ] Check Navbar avatar before upload
- [ ] Upload photo
- [ ] Navbar avatar updates automatically
- [ ] Context is synchronized

---

## 🐛 Edge Cases

### Test 23: Network Issues

- [ ] Slow down network (throttle to 3G)
- [ ] Upload still completes
- [ ] Loading indicator shows throughout
- [ ] Timeout handled gracefully

### Test 24: Rapid Clicks

- [ ] Select file
- [ ] Click "Upload" rapidly 5 times
- [ ] Only one upload happens
- [ ] No duplicate requests

### Test 25: File Input Reset

- [ ] Upload photo
- [ ] Click "Choose File" again
- [ ] Previous file is cleared
- [ ] Can select new file

### Test 26: Special Characters

- [ ] Upload file named: `photo (1).jpg`
- [ ] Upload file named: `my photo.png`
- [ ] Upload file named: `фото.jpg` (cyrillic)
- [ ] All upload successfully
- [ ] Cloudinary handles names correctly

---

## 📊 API Testing

### Test 27: Direct API Call

```bash
TOKEN="your-jwt-token"

# Upload
curl -X POST http://localhost:3131/api/profile/photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@test-image.jpg"

# Expected Response:
# {
#   "success": true,
#   "message": "Profile photo uploaded successfully",
#   "data": {
#     "url": "https://res.cloudinary.com/...",
#     "thumbnailUrl": "https://res.cloudinary.com/.../w_150,h_150/...",
#     "publicId": "jobseeker/profiles/...",
#     "profileCompletion": 75
#   }
# }
```

- [ ] Response has `success: true`
- [ ] Response includes `url`
- [ ] Response includes `thumbnailUrl`
- [ ] Response includes `publicId`
- [ ] Response includes `profileCompletion`

### Test 28: Delete API Call

```bash
curl -X DELETE http://localhost:3131/api/profile/photo \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "success": true,
#   "message": "Photo deleted successfully",
#   "data": {
#     "profileCompletion": 65
#   }
# }
```

- [ ] Response has `success: true`
- [ ] Response includes updated `profileCompletion`
- [ ] Photo removed from database
- [ ] Photo removed from Cloudinary

---

## ✅ Acceptance Criteria

### Must Have (P0)

- [x] Users can upload profile photos
- [x] Photos stored in Cloudinary
- [x] Photos optimized automatically
- [x] Users can delete photos
- [x] Profile completion tracked
- [x] Authentication required
- [x] Error handling works

### Should Have (P1)

- [x] Real-time preview
- [x] File validation
- [x] Loading indicators
- [x] Toast notifications
- [x] Responsive design

### Nice to Have (P2)

- [ ] Drag & drop upload
- [ ] Image cropping tool
- [ ] Upload progress bar
- [ ] Photo gallery (multiple photos)

---

## 🎉 Final Verification

### Before Deployment

- [ ] All P0 tests passing
- [ ] All P1 tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No lint warnings
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Environment variables documented

### Production Readiness

- [ ] Cloudinary credentials secure
- [ ] API rate limits configured
- [ ] Error logging setup
- [ ] Monitoring in place
- [ ] Backup strategy defined
- [ ] Rollback plan ready

---

## 📝 Test Results

**Tester Name**: ********\_********  
**Date**: ********\_********  
**Environment**: ********\_********  
**Browser**: ********\_********

**Overall Result**:

- [ ] ✅ PASS - Ready for production
- [ ] ⚠️ PASS WITH ISSUES - Document issues
- [ ] ❌ FAIL - Requires fixes

**Issues Found**:

1. ***
2. ***
3. ***

**Notes**:

---

---

---
