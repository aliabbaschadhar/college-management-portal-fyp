// ─── User Roles ──────────────────────────────────────────
export type UserRole = "admin" | "faculty" | "student";

// ─── Core Entities ───────────────────────────────────────

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  department: string;
  semester: number;
  enrollmentDate: string;
  avatar?: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  joinDate: string;
  avatar?: string;
}

export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  name: string; // alias for courseName, used in UI
  creditHours: number;
  department: string;
  assignedFaculty: string | null;
  enrolledCount: number;
  semester: number;
}

export interface Admission {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  appliedDepartment: string;
  applicationDate: string;
  status: "Pending" | "Approved" | "Rejected";
  fatherName: string;
  cnic: string;
  previousInstitution: string;
  marksObtained: number;
  totalMarks: number;
}

export interface Attendance {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: "Present" | "Absent" | "Late";
  markedBy: string;
}

export interface Fee {
  id: string;
  studentId: string;
  type: string;
  feeType: string; // alias for type, used in UI
  amount: number;
  status: "Paid" | "Unpaid" | "Overdue";
  dueDate: string;
  semester: number;
  paidDate: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  audience: "Students" | "Faculty" | "All";
  priority: "High" | "Medium" | "Low";
}

export interface Feedback {
  id: string;
  studentId: string;
  submittedBy: string; // alias for studentId, used in UI
  type: "Faculty" | "Course";
  targetId: string; // The ID of the faculty or course
  rating: number;
  comment: string;
  date: string;
}

export interface Timetable {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  room: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | string;
  startTime: string;
  endTime: string;
  department: string;
  semester: number;
}

export type TimetableDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday";

export interface TimetableCourseSummary {
  courseCode: string;
  courseName: string;
  department: string;
  semester: number;
  faculty: { user: { name: string | null } } | null;
}

export interface TimetableApiEntry {
  id: string;
  courseId: string;
  room: string;
  day: TimetableDay;
  startTime: string;
  endTime: string;
  course: TimetableCourseSummary;
}

export interface TimetableMutationInput {
  courseId: string;
  room: string;
  day: TimetableDay;
  startTime: string;
  endTime: string;
}

// ─── Quiz & Question Bank ────────────────────────────────

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  courseId: string;
  createdBy: string;
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  createdBy: string;
  duration: number;
  totalMarks: number;
  questions: string[];
  status: "Draft" | "Published" | "Closed";
  dueDate: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  totalMarks: number;
  submittedAt: string;
  answers: number[];
}

// ─── Grade Breakdown ─────────────────────────────────────

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  quizMarks: number;
  assignmentMarks: number;
  midMarks: number;
  finalMarks: number;
  total: number;
  gpa: number;
  locked: boolean;
}

// ─── Analytics / Dashboard Stats ─────────────────────────

export interface DashboardStat {
  title: string;
  value: string | number;
  trend: string;
  trendDirection: "up" | "down";
  icon: string;
  color: string;
}

// ─── Sidebar Navigation ─────────────────────────────────

export interface SidebarItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
}

// ─── Data Table ──────────────────────────────────────────

export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}
