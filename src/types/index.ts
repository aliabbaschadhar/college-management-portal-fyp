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
  amount: number;
  status: "Paid" | "Unpaid" | "Overdue";
  dueDate: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  audience: "Students" | "Faculty" | "All";
}

export interface Feedback {
  id: string;
  studentId: string;
  type: "Faculty" | "Course";
  targetId: string; // The ID of the faculty or course
  rating: number;
  comment: string;
  date: string;
}

export interface Timetable {
  id: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  room: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | string;
  startTime: string;
  department: string;
  semester: number;
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
