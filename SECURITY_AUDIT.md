# Security Audit & Vulnerability Assessment Report

**Project:** College Management Portal (FYP)  
**Date:** October 18, 2026  
**Auditor:** Antigravity AI Security Pair Programmer  
**Status:** Remediated & Hardened  

---

## 1. Executive Vulnerability Threat Matrix

| Risk Level | Vulnerability Description | Affected Component | Threat & Exploit Potential | Status |
| :--- | :--- | :--- | :--- | :--- |
| **CRITICAL** | **Quiz Answer Key Leak to Students** | [`src/app/api/quizzes/[id]/route.ts`](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/api/quizzes/[id]/route.ts) | Students receive exact `correctOption` in JSON response prior to answering. Inspecting Network DevTools allows reading full answer keys. | **Remediated** |
| **CRITICAL** | **Client-Specified Quiz Score Tampering** | [`src/app/api/quizzes/[id]/submit/route.ts`](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/api/quizzes/[id]/submit/route.ts) | Client could pass `{ "score": 100 }` directly in body to bypass question grading and award themselves 100% score. | **Remediated** |
| **HIGH** | **Unauthorized Quiz Attempt Deletion (IDOR)** | [`src/app/api/quizzes/[id]/submit/route.ts`](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/api/quizzes/[id]/submit/route.ts) | Any student could send `DELETE /api/quizzes/[id]/submit?studentId=...` to erase another student's test attempt or delete their own bad score to retake. | **Remediated** |
| **HIGH** | **Unprotected Audit Log Cleanup Endpoint** | [`src/app/api/audit-logs/cleanup/route.ts`](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/api/audit-logs/cleanup/route.ts) | When `CRON_SECRET` was unset in `.env`, the endpoint allowed unauthenticated public requests to redact audit trail logs. | **Remediated** |
| **MEDIUM** | **Admission Email Identity Spoofing / DoS** | [`src/app/api/admissions/route.ts`](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/api/admissions/route.ts) | Untrusted `body.email` allowed an authenticated user to submit applications under someone else's email address, locking out legitimate applicants. | **Remediated** |
| **MEDIUM** | **Absence of Rate Limiting on Sensitive Routes** | [`src/proxy.ts`](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/proxy.ts) | Vulnerable to brute-force attacks against `admin_onboarding_secret` and automated scraping of public verification endpoints. | **Remediated** |
| **LOW** | **Over-Exposure of Alumni Academic Data (CGPA)** | [`src/app/api/alumni/route.ts`](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/api/alumni/route.ts) | Graduated students' exact CGPA and personal emails were publicly returned to all logged-in students. | **Remediated** |
| **LOW** | **Webhook Payload Re-Stringification** | [`src/app/api/webhooks/clerk/route.ts`](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/api/webhooks/clerk/route.ts) | Calling `JSON.stringify(await req.json())` can alter whitespace or key order, leading to intermittent Svix signature verification failures. | **Remediated** |

---

## 2. Technical Vulnerability Details & Mechanics

### 2.1. Quiz Answer Key Leak (`GET /api/quizzes/[id]`)
* **Vulnerability Type:** Sensitive Data Exposure (OWASP API3:2023 Broken Object Property Level Authorization).
* **Root Cause:** The database query in `GET /api/quizzes/[id]` included `correctOption: true` in the select projection for questions.
* **Exploit Vector:** Any student attempting a quiz could inspect the network response in their browser's developer tools and obtain the correct index for every question before answering.
* **Remediation:** Added role-aware filtering. When `user.role === "STUDENT"`, `correctOption` is stripped from every question in the response.

### 2.2. Arbitrary Score Injection (`POST /api/quizzes/[id]/submit`)
* **Vulnerability Type:** Improper Input Validation & Business Logic Bypass (OWASP A04:2021 Insecure Design).
* **Root Cause:** The endpoint initialized `let calculatedScore = body.score ?? 0;`. If `body.answers` was omitted or null, the evaluation loop was bypassed, writing the user-supplied score directly into `prisma.quizAttempt.create`.
* **Exploit Vector:** A malicious HTTP POST request with `{"score": 100}` would record a perfect 100% score for the student without checking any answers.
* **Remediation:** Enforced that for student submissions, `body.score` is strictly ignored and `calculatedScore` is computed server-side from `body.answers` against `q.correctOption`.

### 2.3. Unauthorized Attempt Deletion (`DELETE /api/quizzes/[id]/submit`)
* **Vulnerability Type:** Broken Object Level Authorization (IDOR) & Missing Role Guard.
* **Root Cause:** `DELETE /api/quizzes/[id]/submit` parsed `searchParams.get("studentId")` and deleted attempts without verifying whether the caller was an Admin, Faculty, or authorized instructor.
* **Exploit Vector:** Any logged-in user could delete attempts belonging to any other student, causing denial of academic records.
* **Remediation:** Enforced `requireRole(["ADMIN", "FACULTY"])` to ensure students cannot delete quiz attempts.

### 2.4. Unauthenticated Audit Log Cleanup (`GET /api/audit-logs/cleanup`)
* **Vulnerability Type:** Broken Authentication (OWASP API2:2023).
* **Root Cause:** The condition `if (process.env.CRON_SECRET && authHeader !== expectedAuth)` passed unconditionally when `process.env.CRON_SECRET` was undefined.
* **Exploit Vector:** Anyone sending an unauthenticated GET request could trigger redaction of expired audit logs.
* **Remediation:** Enforced that if `process.env.CRON_SECRET` is configured, it must match; otherwise, the caller must be an authenticated `ADMIN`.

### 2.5. Admission Email Identity Spoofing (`POST /api/admissions`)
* **Vulnerability Type:** Insecure Direct Object Reference / Identity Spoofing.
* **Root Cause:** `POST /api/admissions` trusted `body.email` supplied by the client rather than binding to the authenticated user's verified Clerk email.
* **Exploit Vector:** An attacker could submit duplicate or invalid applications under another person's email address, causing their account to be blocked after 2 rejections or preventing them from submitting legitimate applications.
* **Remediation:** Automatically bind the application's email address to the verified email of the authenticated Clerk session (unless the caller is an ADMIN).

### 2.6. Rate Limiting on Sensitive Endpoints
* **Vulnerability Type:** Unrestricted Resource Consumption (OWASP API4:2023).
* **Root Cause:** Absence of rate limiting across sensitive endpoints like `/api/onboarding`, `/api/verify`, and `/api/admissions`.
* **Remediation:** Implemented an in-memory sliding-window rate limiter in [`src/proxy.ts`](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/proxy.ts) allowing reasonable thresholds (e.g., 20 requests/minute on onboarding and verification).

### 2.7. Over-Exposure of Alumni Academic Details (`GET /api/alumni`)
* **Vulnerability Type:** Excessive Data Exposure.
* **Root Cause:** The alumni directory returned `cgpa` and personal `email` to any authenticated student.
* **Remediation:** Redact `cgpa` and personal emails for regular student requesters while preserving them for Admins/Faculty.

### 2.8. Webhook Raw Payload Verification (`POST /api/webhooks/clerk`)
* **Vulnerability Type:** Cryptographic Signature Verification Fragility.
* **Root Cause:** Parsing `await req.json()` and re-serializing with `JSON.stringify(payload)` can alter whitespace or key ordering.
* **Remediation:** Pass `await req.text()` directly to `wh.verify(...)`.
