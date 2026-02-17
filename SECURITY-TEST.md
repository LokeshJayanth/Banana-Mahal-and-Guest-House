# 🧪 SECURITY TESTING CHECKLIST

Use this checklist to verify all security measures are working correctly.

---

## ✅ PRE-DEPLOYMENT TESTS

### 1. Input Sanitization Tests

**Test XSS Prevention:**
```
Try entering these in the Name field:
❌ <script>alert('XSS')</script>
❌ <img src=x onerror=alert('XSS')>
❌ javascript:alert('XSS')
❌ <iframe src="evil.com"></iframe>

✅ Expected: Characters removed automatically
```

**Test Phone Validation:**
```
Try entering these in Phone field:
❌ 1234567890 (should fail - doesn't start with 6-9)
❌ 12345 (should fail - less than 10 digits)
❌ abcd123456 (should auto-remove letters)
❌ 98765432109 (should auto-truncate to 10 digits)

✅ Expected: Only 10 digits starting with 6-9 accepted
```

**Test Guest Number Validation:**
```
Try entering these in Guests field:
❌ -5 (should fail - negative)
❌ 0 (should fail - zero)
❌ 99999 (should auto-limit to 10000)
❌ abc (should be rejected)

✅ Expected: Only numbers 1-10000 accepted
```

**Test Message Length:**
```
Try entering 600 characters in Message field
✅ Expected: Auto-truncated to 500 characters
```

---

### 2. Rate Limiting Tests

**Test Submission Cooldown:**
```
1. Fill form and submit
2. Immediately try to submit again
✅ Expected: "Please wait a few seconds" message
```

---

### 3. Date Validation Tests

**Test Past Date Prevention:**
```
Try selecting yesterday's date
✅ Expected: Date should be disabled in calendar
```

**Test Date Range Logic:**
```
For Guest House:
- Select check-in: 2026-03-15
- Select check-out: 2026-03-14 (before check-in)
✅ Expected: Error message "Check-out must be after check-in"
```

**Test Maximum Booking Period:**
```
For Guest House:
- Select check-in: 2026-03-15
- Select check-out: 2027-03-20 (over 1 year)
✅ Expected: Error message about 1 year limit
```

---

### 4. Availability Check Tests

**Test Double Booking Prevention:**
```
1. Create a CONFIRMED booking for 2026-03-15
2. Try to book same date again
✅ Expected: Date disabled in calendar + error message
```

**Test Status Filtering:**
```
Create bookings with different statuses:
- PENDING: Should NOT block dates
- REJECTED: Should NOT block dates
- CONFIRMED: Should block dates
- BLOCKED: Should block dates
- CANCELLED: Should block dates

✅ Expected: Only CONFIRMED/BLOCKED/CANCELLED block dates
```

---

### 5. Form Validation Tests

**Test Required Fields:**
```
Try submitting form with empty fields
✅ Expected: Browser validation prevents submission
```

**Test Invalid Event Type:**
```
Using browser console, try:
document.getElementById('eventType').value = 'HackedEvent';

✅ Expected: Validation error on submit
```

**Test Invalid Resource:**
```
Using browser console, try:
document.getElementById('resource').value = 'HackedVenue';

✅ Expected: Validation error on submit
```

---

## 🌐 SERVER-LEVEL TESTS

### 6. Security Headers Test

**Check Headers (use browser DevTools Network tab):**
```
✅ X-Frame-Options: SAMEORIGIN
✅ X-Content-Type-Options: nosniff
✅ X-XSS-Protection: 1; mode=block
✅ Referrer-Policy: strict-origin-when-cross-origin
✅ Content-Security-Policy: (should be present)
```

**Online Tools:**
- https://securityheaders.com/
- https://observatory.mozilla.org/

---

### 7. File Access Tests

**Try accessing protected files:**
```
❌ https://yoursite.com/.htaccess
❌ https://yoursite.com/.env
❌ https://yoursite.com/SECURITY.md
❌ https://yoursite.com/.git/

✅ Expected: 403 Forbidden or 404 Not Found
```

**Try directory listing:**
```
❌ https://yoursite.com/assets/
❌ https://yoursite.com/img/

✅ Expected: 403 Forbidden (not file list)
```

---

### 8. SQL Injection Tests

**Try malicious URLs:**
```
❌ https://yoursite.com/?id=1' OR '1'='1
❌ https://yoursite.com/?search=<script>alert(1)</script>
❌ https://yoursite.com/?q=UNION SELECT * FROM users

✅ Expected: 403 Forbidden or request blocked
```

---

### 9. Bot Protection Tests

**Try with curl (should be blocked):**
```bash
curl https://yoursite.com/
✅ Expected: 403 Forbidden
```

**Try with normal browser:**
```
✅ Expected: Page loads normally
```

---

## 🔐 GOOGLE SHEETS SECURITY

### 10. API Security Tests

**Test API Endpoint:**
```
1. Try accessing API URL directly in browser
2. Check if it returns data
✅ Expected: Should return JSON with bookings (read-only)
```

**Test POST without CORS:**
```
Try posting from different domain
✅ Expected: CORS policy should block or no-cors mode used
```

---

## 📱 MOBILE SECURITY TESTS

### 11. Mobile Input Tests

**Test on actual mobile device:**
```
✅ Touch targets are at least 48px
✅ Input fields don't zoom on focus
✅ Dark mode toggle works
✅ Form validation works
✅ Rate limiting works
```

---

## 🚨 PENETRATION TESTING

### 12. Advanced Tests (Optional)

**Use automated tools:**
```
- OWASP ZAP: https://www.zaproxy.org/
- Burp Suite Community: https://portswigger.net/burp
- Nikto: https://github.com/sullo/nikto
```

**Manual tests:**
```
✅ Try modifying form data in browser console
✅ Try intercepting and modifying requests
✅ Try session hijacking
✅ Try CSRF attacks
✅ Try clickjacking with iframe
```

---

## 📊 SECURITY SCORE TARGETS

**Aim for these scores:**
- SecurityHeaders.com: A+ rating
- Mozilla Observatory: A+ rating
- SSL Labs: A+ rating (when HTTPS enabled)
- GTmetrix Security: 100%

---

## 🐛 COMMON ISSUES & FIXES

### Issue: Security headers not working
**Fix:** Check if .htaccess is enabled on server

### Issue: Input sanitization not working
**Fix:** Clear browser cache and test in incognito mode

### Issue: Rate limiting not working
**Fix:** Check browser console for errors

### Issue: Date validation failing
**Fix:** Verify date format is yyyy-MM-dd

---

## ✅ FINAL CHECKLIST

Before going live:

- [ ] All XSS tests passed
- [ ] All SQL injection tests passed
- [ ] Rate limiting working
- [ ] Input validation working
- [ ] Security headers active
- [ ] File protection working
- [ ] Bot protection working
- [ ] HTTPS/SSL enabled
- [ ] Google Sheet access restricted
- [ ] Backup system in place
- [ ] Error logging configured
- [ ] Security monitoring active

---

## 📞 REPORT SECURITY ISSUES

If you find a security vulnerability:

1. **DO NOT** post publicly
2. Contact: 9384376599
3. Provide detailed steps to reproduce
4. Wait for confirmation before disclosure

---

**Last Updated**: February 17, 2026  
**Test Status**: Ready for Production  
**Security Level**: ✅ Enterprise-Grade
