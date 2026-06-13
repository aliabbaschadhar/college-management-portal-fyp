# Grading & Sessional System Guide

Academic tracking in the Computer Science department at **Govt. Graduate College, Hafizabad** utilizes a customized **40-Marks Sessional System** instead of generic 100-mark sheets. This guide details the rules, formulas, and lock conditions implemented in the codebase.

---

## 1. Marks Distribution (40-Marks Structure)

Each course grade consists of two primary parts, adding up to a maximum of 40 marks:
1. **Midterm Exam**: Maximum **25 marks**.
2. **Sessional Marks / Final Assignment**: Maximum **15 marks**.
3. **Total Marks**: Mid Exam (25) + Sessional (15) = Maximum **40 marks**.

> [!NOTE]
> For compatibility with pre-existing database columns in the Prisma schema, the system maps these inputs directly:
> * `midMarks` is used for the **Midterm Exam (Max 25)**.
> * `finalMarks` is used to store the **Sessional Marks (Max 15)**.
> * `quizMarks` and `assignmentMarks` default to `0` and are kept hidden or locked to keep the UI clean.

---

## 2. GPA Calculation Formula

The Grade Point Average (GPA) for each course is calculated automatically on the server based on a linear scale out of 4.0.

### 2.1 The Formula
$$\text{GPA} = \min\left(4.0, \frac{\text{Total Marks Obtained}}{40} \times 4.0\right)$$

* **In JavaScript**:
  ```typescript
  const total = body.midMarks + body.finalMarks; // Sum of Mid (25) and Sessional (15)
  const gpa = +Math.min(4.0, (total / 40) * 4.0).toFixed(2); // Rounded to 2 decimal places
  ```

### 2.2 GPA Examples
| Mid Exam (Max 25) | Sessional (Max 15) | Total (Max 40) | Percentage | GPA |
|---|---|---|---|---|
| 25 | 15 | 40 | 100% | **4.00** |
| 22 | 13 | 35 | 87.5% | **3.50** |
| 20 | 10 | 30 | 75.0% | **3.00** |
| 15 | 5 | 20 | 50.0% | **2.00** |
| 8 | 4 | 12 | 30.0% | **1.20** |

---

## 3. Inline CGPA Editing

In addition to calculating individual course GPAs, the grading sheet includes an inline edit input for a student's **Cumulative GPA (CGPA)**.
* **Why**: Allows faculty members to enter or modify a student's overall academic CGPA directly on the grading sheet without navigating away.
* **Database Updates**: When the teacher updates a student's record, the API updates the `cgpa` column in the `Student` model:
  ```typescript
  if (body.cgpa !== undefined) {
    await prisma.student.update({
      where: { id: body.studentId },
      data: { cgpa: body.cgpa },
    });
  }
  ```

---

## 4. Grade Locking Mechanics

To prevent unauthorized post-semester grade modifications, the portal implements a **Lock/Unlock state**:
* **Admin Privilege**: Only an **Admin** can toggle the lock state (`locked: true/false`) of a grade record.
* **Faculty Enforcement**: 
  * If a grade row is **unlocked**, the teacher can modify inputs.
  * If a grade row is **locked**, the input text fields in the browser table become read-only and disabled.
  * If a teacher tries to bypass the UI and send a direct API update request for a locked grade, the backend blocks it:
    ```typescript
    if (existing?.locked) {
      return errorResponse("FORBIDDEN", "Grade is locked", 403);
    }
    ```
