# Troubleshooting Guide

This guide covers common issues and their solutions for VidFlow.

## Table of Contents

1. [General Issues](#general-issues)
2. [Web App Issues](#web-app-issues)
3. [Chrome Extension Issues](#chrome-extension-issues)
4. [Mobile App Issues](#mobile-app-issues)
5. [API/Backend Issues](#apibackend-issues)
6. [Download Issues](#download-issues)

---

## General Issues

### "Something went wrong" Error

**Symptoms:**

- Generic error message displayed
- Operation fails without specific details

**Solutions:**

1. **Clear browser cache**

   ```
   Chrome: Settings → Privacy → Clear browsing data
   Firefox: Options → Privacy → Clear Data
   ```

2. **Check service status**
   - Visit status.vidflow.app
   - Check for ongoing incidents

3. **Try different browser**
   - Switch to another browser
   - Try incognito/private mode

4. **Contact support**
   - Email: support@vidflow.app
   - Include error screenshot and browser info

---

## Web App Issues

### Page Not Loading

**Symptoms:**

- Blank page or loading spinner
- Console errors

**Solutions:**

1. **Check network connection**

   ```bash
   ping vidflow.app
   ```

2. **Clear cookies and cache**

   ```
   Chrome DevTools → Application → Clear Storage
   ```

3. **Check JavaScript errors**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Report any errors to support

4. **Verify Node.js version**
   ```bash
   node --version  # Should be 18+
   npm --version
   ```

### Video Not Playing

**Symptoms:**

- Video player shows error
- Black screen in player

**Solutions:**

1. **Check browser support**
   - Chrome 90+
   - Firefox 88+
   - Safari 14+
   - Edge 90+

2. **Enable media autoplay**

   ```
   Browser settings → Privacy → Media autoplay
   ```

3. **Check browser extensions**
   - Disable all extensions
   - Try again

4. **Clear media cache**
   ```
   Chrome: settings → Privacy → Clear browsing data → Cached images and files
   ```

### Authentication Errors

**Symptoms:**

- Can't log in
- Session expired errors
- 401/403 responses

**Solutions:**

1. **Clear session data**
   - Log out completely
   - Clear cookies
   - Log in again

2. **Check token expiration**
   - Tokens expire after 24 hours
   - Re-authenticate if needed

3. **Check account status**
   - Verify email verified
   - Check subscription status

---

## Chrome Extension Issues

### Extension Not Detecting Videos

**Symptoms:**

- Badge doesn't show on video pages
- Popup shows "No video found"

**Solutions:**

1. **Check extension permissions**
   - Right-click extension icon
   - Click "This can read and change..."
   - Verify permissions granted

2. **Reload extension**
   - Go to chrome://extensions
   - Click "Reload" on VidFlow
   - Refresh video page

3. **Check platform support**
   - Verify platform is supported
   - Check supported platforms list

4. **Check content script**
   - Open DevTools on video page
   - Check console for errors
   - Verify content script loaded

### Popup Not Opening

**Symptoms:**

- Clicking icon does nothing
- Popup is blank

**Solutions:**

1. **Check for conflicts**

   ```bash
   # Disable other extensions
   # Try again
   ```

2. **Reinstall extension**
   - Uninstall VidFlow
   - Download latest version
   - Install fresh

3. **Check Chrome version**
   - Chrome 90+ required
   - Update Chrome if needed

### Download Button Not Working

**Symptoms:**

- Button is disabled
- Click does nothing

**Solutions:**

1. **Check API connection**
   - Open DevTools
   - Check Network tab
   - Verify API calls succeed

2. **Check quota limits**
   - Daily download limit may be reached
   - Wait until reset or upgrade

3. **Check job queue**
   - Too many active downloads
   - Wait for completion

---

## Mobile App Issues

### App Not Starting

**Symptoms:**

- Black screen on launch
- Crash on startup

**Solutions:**

1. **Check iOS/Android version**
   - iOS 14+ required
   - Android 10+ required

2. **Clear app data**
   - iOS: Settings → VidFlow → Clear Data
   - Android: Apps → VidFlow → Clear Data

3. **Reinstall app**
   - Delete app
   - Download from App Store/Play Store
   - Install fresh

### Download Not Starting

**Symptoms:**

- Progress stays at 0%
- Shows "Waiting for network"

**Solutions:**

1. **Check network**
   - WiFi or cellular data required
   - Check airplane mode off

2. **Check storage space**
   - Free up space on device
   - Minimum 500MB recommended

3. **Check permissions**
   - iOS: Settings → VidFlow → Permissions
   - Android: Settings → Apps → VidFlow → Permissions

4. **Check background app refresh**
   - iOS: Settings → General → Background App Refresh

---

## API/Backend Issues

### API Returns 500 Error

**Symptoms:**

- Server error response
- "Internal server error" message

**Solutions:**

1. **Check service health**

   ```bash
   curl https://api.vidflow.app/health
   ```

2. **Retry request**
   - Transient errors common
   - Try again after 30 seconds

3. **Check rate limits**
   - Too many requests
   - Wait and retry

4. **Contact support**
   - If persistent
   - Include request details

### API Timeout

**Symptoms:**

- Request hangs
- "Request timed out" error

**Solutions:**

1. **Check network latency**

   ```bash
   ping api.vidflow.app
   ```

2. **Increase timeout**
   - Default: 30 seconds
   - May need more for large videos

3. **Try different network**
   - Switch from WiFi to cellular
   - Or vice versa

### Rate Limit Exceeded

**Symptoms:**

- 429 response code
- "Too many requests" message

**Solutions:**

1. **Wait for reset**
   - Limits reset every hour
   - Track usage

2. **Implement backoff**

   ```javascript
   // Exponential backoff
   async function fetchWithRetry(url, retries = 3) {
     for (let i = 0; i < retries; i++) {
       try {
         return await fetch(url);
       } catch (e) {
         if (i === retries - 1) throw e;
         await sleep(Math.pow(2, i) * 1000);
       }
     }
   }
   ```

3. **Upgrade plan**
   - Higher limits available
   - Contact sales

---

## Download Issues

### Download Stuck at 0%

**Symptoms:**

- Progress never starts
- Job shows "queued"

**Solutions:**

1. **Check worker queue**
   - Many downloads ahead
   - Wait your turn

2. **Check video availability**
   - Video may be private
   - Video may be removed

3. **Retry download**
   - Cancel current job
   - Start new download

### Download Very Slow

**Symptoms:**

- Progress moves slowly
- Hours to complete

**Solutions:**

1. **Check internet speed**
   - Run speed test
   - 10+ Mbps recommended

2. **Check server load**
   - Peak hours slower
   - Try off-peak

3. **Choose lower quality**
   - Smaller files faster
   - 720p typically faster

4. **Use wired connection**
   - WiFi can be slower
   - Ethernet more stable

### Download Failed

**Symptoms:**

- Error message shown
- Job shows "failed"

**Solutions:**

1. **Check error message**
   - May indicate cause
   - Common errors below

2. **Common causes:**
   - Video unavailable
   - Region blocked
   - Copyright claim
   - Account restrictions

3. **Retry later**
   - May be temporary
   - Try after some time

4. **Try different video**
   - Issue may be specific
   - Try another video

### "Video Unavailable" Error

**Symptoms:**

- Platform returns error
- "Video unavailable"

**Solutions:**

1. **Verify video exists**
   - Open in browser
   - Check if accessible

2. **Check privacy settings**
   - Video may be private
   - Needs to be public

3. **Check region restrictions**
   - Some videos geo-blocked
   - VPN may help (if legal)

4. **Platform issues**
   - YouTube/API changes
   - Wait for update

### "Insufficient Storage" Error

**Symptoms:**

- Can't start download
- Storage error shown

**Solutions:**

1. **Free up space**
   - Delete old downloads
   - Clear app cache

2. **Use SD card (Android)**
   - Change download location
   - Use external storage

3. **Check device storage**
   - iOS: Settings → General → iPhone Storage
   - Android: Settings → Storage

---

## Getting Help

### Before Contacting Support

1. Try all solutions in this guide
2. Clear caches and retry
3. Note exact error messages
4. Note browser/device info

### Contact Information

- **Email**: support@vidflow.app
- **Twitter**: @VidFlowApp
- **Community**: community.vidflow.app

### Include in Report

- Error message (exact text)
- Browser/device type
- Operating system
- URL of video being downloaded
- Screenshot of error
- Steps to reproduce
