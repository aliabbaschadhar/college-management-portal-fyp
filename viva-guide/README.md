# College Management Portal - Viva Exam Preparation Guide

Welcome to the Viva (Project Defense) Preparation Guide. This directory has been created to help you understand the architecture, data flow, authentication boundaries, and grading logic of your BS Computer Science Final Year Project (BSCSF2022-2026).

During the viva, the examiner will test your understanding of how the code works under the hood. This guide breaks down these concepts into separate, easy-to-read topics so you can answer questions confidently and locate files/functions immediately.

---

## Guide Index

Click the links below to open each topic directly:

1. **[Directory Structure Guide](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/viva-guide/DIRECTORY_STRUCTURE.md)**
   Understand the layout of your project. Learn the difference between App Router frontend pages, API endpoints, components, and server logic.
   
2. **[Data Flow Explanation](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/viva-guide/DATA_FLOW.md)**
   Follow the journey of a user request (e.g., student submitting a quiz or a teacher marking attendance) from the browser UI down to the PostgreSQL database and back.

3. **[Authentication & RBAC (Security)](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/viva-guide/AUTHENTICATION_RBAC.md)**
   Explain how Clerk guards page routes, how we restrict access based on User Roles (`ADMIN`, `FACULTY`, `STUDENT`), and how we prevent students from accessing teacher functions.

4. **[Grading & Sessional Logic](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/viva-guide/GRADING_SYSTEM.md)**
   Explain the academic rules implemented in the project (the 40-marks sessional system, locking mechanics, and inline CGPA updates).

5. **[Viva Cheat Sheet (Quick Lookup)](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/viva-guide/VIVA_CHEAT_SHEET.md)**
   A quick-reference sheet containing typical questions examiners ask (e.g., *"Show me where the database connection is initialized"* or *"Where is the quiz grading logic?"*) with exact file paths and line numbers.

---

## 💡 Quick Tips for a Successful Viva

* **Keep next.js terminology clear**: Remember that this project uses **Next.js (App Router)**. Dynamic files inside `src/app/` represent routes, and folders containing `route.ts` represent backend API endpoints.
* **Database abstraction**: When asked about the database, state that you are using **PostgreSQL** as the primary relational database, and **Prisma ORM** as the Object-Relational Mapping layer to write type-safe queries.
* **Security & Clerk**: Explain that user identities are handled by **Clerk Auth**, which matches user sessions securely in Next.js middleware and API route guards.
