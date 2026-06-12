# Security Guidelines

## 🚨 Critical Security Issues Fixed

### Issue 1: Exposed EmailJS API Keys
**Status:** ✅ FIXED
- **Previously:** Hardcoded API key in `signin.html`
- **Now:** Loaded from environment variables
- **Action Required:** Rotate your EmailJS keys at https://dashboard.emailjs.com

### Issue 2: Plain Text Passwords
**Status:** ⚠️ REQUIRES BACKEND IMPLEMENTATION
- **Issue:** Passwords stored in browser localStorage in plain text
- **Risk:** Anyone with browser access can see all passwords
- **Solution:** Move authentication to backend with proper hashing (bcrypt, Argon2)

### Issue 3: Sensitive Data in Browser Storage
**Status:** ⚠️ REQUIRES BACKEND IMPLEMENTATION
- **Issue:** Child emails, parent emails stored in localStorage
- **Risk:** PII exposed if device is compromised
- **Solution:** Store session tokens only, keep user data on server

### Issue 4: No HTTPS Requirement
**Status:** ⚠️ REQUIRES DEPLOYMENT CONFIGURATION
- **Issue:** Data transmitted in plain text over HTTP
- **Solution:** Deploy only over HTTPS with security headers

---

## 🔐 Environment Variables Setup

### 1. Copy the Template
```bash
cp .env.example .env
```

### 2. Get Your Credentials

#### EmailJS Credentials:
1. Go to https://dashboard.emailjs.com
2. Select your Service ID
3. Go to Service Settings
4. Copy the Service ID
5. Go to Email Templates
6. Copy Template IDs
7. Go to Account > API Keys
8. Copy Public Key

#### OpenAI API Key:
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Copy the key

### 3. Update .env File
```env
VITE_EMAILJS_PUBLIC_KEY=your_key_here
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_VERIFY_ID=template_xxxxx
VITE_EMAILJS_TEMPLATE_RESET_ID=template_xxxxx
VITE_OPENAI_API_KEY=sk-xxxxx
```

### 4. Never Commit .env
The `.gitignore` file prevents `.env` from being committed.

---

## 📋 Security Checklist

### Before Deploying to Production:

- [ ] **Rotate all API keys** that were exposed in public repository
- [ ] **Implement backend authentication** (don't store credentials in browser)
- [ ] **Use HTTPS only** (enforce with HSTS headers)
- [ ] **Hash passwords** with bcrypt/Argon2 on server
- [ ] **Use secure cookies** for sessions (HTTPOnly, Secure, SameSite)
- [ ] **Implement CORS** properly
- [ ] **Add rate limiting** on authentication endpoints
- [ ] **Enable 2FA** for sensitive accounts
- [ ] **Use secrets management** (GitHub Secrets, AWS Secrets Manager, etc.)
- [ ] **Scan for secrets** before each commit (use pre-commit hooks)
- [ ] **Review dependencies** for vulnerabilities (`npm audit`)
- [ ] **Set security headers** (CSP, X-Frame-Options, X-Content-Type-Options)

---

## 🛠️ Development Workflow

### 1. For Local Development:
```bash
# Create .env file with test credentials
cp .env.example .env
# Edit .env with your test API keys
```

### 2. For CI/CD Pipeline:
Use GitHub Secrets to store environment variables:
- Go to Settings > Secrets and variables > Actions
- Add each variable as a repository secret
- Reference in workflow: `${{ secrets.VITE_EMAILJS_PUBLIC_KEY }}`

### 3. For Production Deployment:
Use your hosting platform's secrets management:
- **Vercel:** Environment variables in project settings
- **Netlify:** Build environment variables in deploy settings
- **AWS:** Secrets Manager or Parameter Store
- **Docker:** Use secrets in compose or orchestration

---

## 🔍 Pre-commit Security Checks

### Install Pre-commit Hook:
```bash
# Create .git/hooks/pre-commit
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Prevent secrets from being committed

# Check for common patterns
if git diff --cached | grep -E 'API_KEY|apiKey|secret|password|token' | grep -v '.env.example'; then
  echo "❌ Potential secret detected in staged files!"
  echo "Please remove secrets and use environment variables."
  exit 1
fi

exit 0
EOF

chmod +x .git/hooks/pre-commit
```

---

## 🚨 If a Secret is Accidentally Committed:

### Immediate Actions:
1. **Rotate the exposed secret** immediately
2. **Create emergency branch** to remove the secret
3. **Force push** (only if repo is private or not yet public)
4. **Use BFG Repo Cleaner** to remove from history:
   ```bash
   bfg --delete-files .env repo.git
   ```

### Notify:
- [ ] Services that use the credential
- [ ] Any affected users

---

## 📚 Additional Resources

- [OWASP Top 10 - Security Risks](https://owasp.org/www-project-top-ten/)
- [OWASP - Storage Security](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
- [GitHub - Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MDN - Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

---

## 🤝 Reporting Security Issues

If you discover a security vulnerability:

### Primary Contact:
- **Email:** ryanroy056@gmail.com
- **GitHub Issues:** For non-sensitive issues only

### Responsible Disclosure Guidelines:
1. **Do NOT** create a public issue for security vulnerabilities
2. Email security details to the contact above
3. Include affected version and proof of concept
4. Allow 90 days for remediation before public disclosure
5. We will acknowledge receipt within 48 hours

### Backup Plans:
- If email fails, create a **private security advisory** in GitHub (Settings > Security > Advisory database)
- Alternatively, reach out via GitHub profile or check repository for additional contact info

---

**Last Updated:** 2026-06-12
