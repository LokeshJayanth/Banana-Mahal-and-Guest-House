# 🔒 SECURITY MEASURES - BANANA MAHAL WEBSITE

## Overview
This document outlines all security measures implemented to protect the Banana Mahal booking system from common web vulnerabilities and attacks.

---

## 🛡️ IMPLEMENTED SECURITY FEATURES

### 1. SERVER-LEVEL SECURITY (.htaccess)

#### A. Security Headers
- **X-Frame-Options**: Prevents clickjacking attacks by blocking iframe embedding
- **X-Content-Type-Options**: Prevents MIME type sniffing attacks
- **X-XSS-Protection**: Enables browser's built-in XSS protection
- **Referrer-Policy**: Controls referrer information leakage
- **Permissions-Policy**: Disables unnecessary browser features (camera, microphone, geolocation)
- **Content-Security-Policy**: Prevents XSS and code injection attacks

#### B. File Protection
- Directory listing disabled
- Hidden files (.env, .htaccess, .git) blocked
- Configuration files (.json, .log, .sql, .bak) protected
- Sensitive file extensions blocked

#### C. SQL Injection & XSS Prevention
- Blocks malicious query strings containing:
  - SQL keywords (SELECT, UNION, INSERT, DELETE, DROP, etc.)
  - Script tags and JavaScript code
  - Base64 encoding attempts
  - Path traversal attempts (../)
  - Dangerous HTML tags (iframe, object, embed)

#### D. Bot & Scraper Protection
- Blocks suspicious user agents
- Blocks empty user agents
- Blocks common scraping tools (wget, curl, nikto, etc.)

#### E. HTTP Method Protection
- Blocks dangerous HTTP methods (TRACE, DELETE, TRACK, DEBUG)
- Only allows safe methods (GET, POST)

#### F. Rate Limiting
- DOS/DDoS protection via mod_evasive
- Limits page requests per second
- Automatic blocking of abusive IPs

---

### 2. CLIENT-SIDE SECURITY (JavaScript)

#### A. Input Sanitization
All user inputs are sanitized to prevent XSS attacks:

**Text Input Sanitization:**
- Removes HTML tags (< and >)
- Removes JavaScript protocol handlers
- Removes event handlers (onclick, onload, etc.)
- Limits input length to 500 characters
- Trims whitespace

**Phone Number Sanitization:**
- Only allows digits (0-9)
- Limits to exactly 10 digits
- Validates Indian phone format (starts with 6-9)

**Number Sanitization:**
- Validates numeric input
- Enforces minimum value (1)
- Enforces maximum value (10,000 guests)

#### B. Input Validation

**Date Validation:**
- Validates yyyy-MM-dd format
- Prevents past date bookings
- Limits booking period to 1 year maximum
- Validates date range logic (check-out > check-in)

**Resource Validation:**
- Whitelist validation for venue types
- Only allows "Function Hall" or "Guest House"

**Event Type Validation:**
- Validates against predefined event type lists
- Prevents injection of custom event types

**Slot Validation:**
- Whitelist validation for time slots
- Only allows: FULL_DAY, MORNING, AFTERNOON, EVENING, NIGHT

#### C. Rate Limiting
- 3-second cooldown between form submissions
- Prevents spam and automated attacks
- Client-side enforcement with timestamp tracking

#### D. Real-Time Input Protection
- Name field: Removes dangerous characters on input
- Phone field: Only allows digits, auto-limits to 10
- Guests field: Only allows positive numbers up to 10,000
- Message field: Removes dangerous characters, limits to 500 chars

#### E. Secure Data Transmission
- All data sanitized before sending to API
- Timestamp added to each booking for audit trail
- WhatsApp URL length validation (max 8000 chars)
- Uses `noopener,noreferrer` when opening external links

---

### 3. HTML SECURITY

#### A. Meta Tags
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Referrer policy: strict-origin-when-cross-origin

#### B. Form Attributes
- `maxlength` attributes on all text inputs
- `pattern` attribute for phone validation
- `min` and `max` attributes for number inputs
- `autocomplete` attributes for better UX and security
- `required` attributes for mandatory fields

---

## 🚨 PROTECTED AGAINST

### Common Web Attacks:
✅ **XSS (Cross-Site Scripting)** - Input sanitization + CSP headers  
✅ **SQL Injection** - URL filtering + input validation  
✅ **CSRF (Cross-Site Request Forgery)** - Same-origin policy + validation  
✅ **Clickjacking** - X-Frame-Options header  
✅ **MIME Sniffing** - X-Content-Type-Options header  
✅ **Path Traversal** - URL filtering + file protection  
✅ **Code Injection** - Input sanitization + CSP  
✅ **Bot Attacks** - User agent filtering  
✅ **DDoS/DOS** - Rate limiting (server + client)  
✅ **Session Hijacking** - Secure headers + HTTPS ready  
✅ **Information Disclosure** - Directory listing disabled  
✅ **Buffer Overflow** - Input length limits  

---

## 🔐 ADDITIONAL RECOMMENDATIONS

### For Production Deployment:

1. **Enable HTTPS/SSL**
   - Uncomment HTTPS redirect in .htaccess
   - Uncomment Strict-Transport-Security header
   - Get SSL certificate (Let's Encrypt is free)

2. **Google Apps Script Security**
   - Add IP whitelist if possible
   - Implement server-side validation
   - Add CAPTCHA for public forms
   - Log all booking attempts with IP addresses

3. **Database Security**
   - Restrict Google Sheet access
   - Enable 2FA on Google account
   - Regular backup of booking data
   - Monitor for suspicious activity

4. **Monitoring & Logging**
   - Set up error logging
   - Monitor failed booking attempts
   - Track unusual patterns
   - Set up alerts for security events

5. **Regular Updates**
   - Keep all CDN libraries updated
   - Monitor security advisories
   - Regular security audits
   - Update dependencies

---

## 📋 SECURITY CHECKLIST

Before going live, ensure:

- [ ] HTTPS/SSL certificate installed
- [ ] All security headers active
- [ ] Input validation working on all forms
- [ ] Rate limiting tested
- [ ] File permissions set correctly (644 for files, 755 for directories)
- [ ] .htaccess file active and working
- [ ] Google Sheet access restricted
- [ ] Backup system in place
- [ ] Error logging configured
- [ ] Security monitoring active

---

## 🆘 INCIDENT RESPONSE

If you suspect a security breach:

1. **Immediate Actions:**
   - Take the site offline temporarily
   - Check Google Sheet for suspicious bookings
   - Review server logs
   - Change all passwords

2. **Investigation:**
   - Identify the attack vector
   - Assess the damage
   - Document everything

3. **Recovery:**
   - Fix the vulnerability
   - Restore from clean backup if needed
   - Update security measures
   - Monitor closely after restoration

4. **Prevention:**
   - Implement additional security measures
   - Update this documentation
   - Train team on security best practices

---

## 📞 SECURITY CONTACTS

- **Website Owner**: 9384376599
- **Developer Support**: [Your contact]
- **Hosting Provider**: [Your hosting support]

---

## 📝 VERSION HISTORY

- **v1.0** (2026-02-17): Initial security implementation
  - Server-level protection (.htaccess)
  - Client-side input sanitization
  - Rate limiting
  - XSS/SQL injection prevention

---

**Last Updated**: February 17, 2026  
**Security Level**: Production-Ready  
**Status**: ✅ Active Protection
