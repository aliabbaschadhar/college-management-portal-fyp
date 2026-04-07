import {
  Student,
  Faculty,
  Course,
  Admission,
  Attendance,
  Fee,
  Announcement,
  Feedback,
  Timetable,
} from "@/types";

// ─── Departments ─────────────────────────────────────────
export const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "English",
  "Chemistry",
  "Economics",
  "Urdu",
  "Islamic Studies",
] as const;

// ─── Students ────────────────────────────────────────────
export const mockStudents: Student[] = [
  { id: "s1", name: "Ali Abbas", rollNo: "CS-2022-001", email: "ali.abbas@gc.edu.pk", phone: "0301-1234567", department: "Computer Science", semester: 7, enrollmentDate: "2022-09-01" },
  { id: "s2", name: "Fatima Zahra", rollNo: "CS-2022-002", email: "fatima.zahra@gc.edu.pk", phone: "0302-2345678", department: "Computer Science", semester: 7, enrollmentDate: "2022-09-01" },
  { id: "s3", name: "Muhammad Usman", rollNo: "CS-2022-003", email: "m.usman@gc.edu.pk", phone: "0303-3456789", department: "Computer Science", semester: 7, enrollmentDate: "2022-09-01" },
  { id: "s4", name: "Ayesha Siddiqui", rollNo: "MTH-2023-001", email: "ayesha.s@gc.edu.pk", phone: "0304-4567890", department: "Mathematics", semester: 5, enrollmentDate: "2023-09-01" },
  { id: "s5", name: "Hassan Raza", rollNo: "MTH-2023-002", email: "hassan.r@gc.edu.pk", phone: "0305-5678901", department: "Mathematics", semester: 5, enrollmentDate: "2023-09-01" },
  { id: "s6", name: "Sana Malik", rollNo: "PHY-2024-001", email: "sana.malik@gc.edu.pk", phone: "0306-6789012", department: "Physics", semester: 3, enrollmentDate: "2024-09-01" },
  { id: "s7", name: "Ahmed Khan", rollNo: "PHY-2024-002", email: "ahmed.khan@gc.edu.pk", phone: "0307-7890123", department: "Physics", semester: 3, enrollmentDate: "2024-09-01" },
  { id: "s8", name: "Zainab Noor", rollNo: "ENG-2022-001", email: "zainab.noor@gc.edu.pk", phone: "0308-8901234", department: "English", semester: 7, enrollmentDate: "2022-09-01" },
  { id: "s9", name: "Bilal Hussain", rollNo: "ENG-2023-001", email: "bilal.h@gc.edu.pk", phone: "0309-9012345", department: "English", semester: 5, enrollmentDate: "2023-09-01" },
  { id: "s10", name: "Maria Tariq", rollNo: "CHM-2024-001", email: "maria.t@gc.edu.pk", phone: "0310-0123456", department: "Chemistry", semester: 3, enrollmentDate: "2024-09-01" },
  { id: "s11", name: "Umer Farooq", rollNo: "CS-2023-001", email: "umer.f@gc.edu.pk", phone: "0311-1234567", department: "Computer Science", semester: 5, enrollmentDate: "2023-09-01" },
  { id: "s12", name: "Hira Shah", rollNo: "CS-2024-001", email: "hira.shah@gc.edu.pk", phone: "0312-2345678", department: "Computer Science", semester: 3, enrollmentDate: "2024-09-01" },
  { id: "s13", name: "Talha Ahmed", rollNo: "ECO-2022-001", email: "talha.a@gc.edu.pk", phone: "0313-3456789", department: "Economics", semester: 7, enrollmentDate: "2022-09-01" },
  { id: "s14", name: "Nadia Perveen", rollNo: "URD-2023-001", email: "nadia.p@gc.edu.pk", phone: "0314-4567890", department: "Urdu", semester: 5, enrollmentDate: "2023-09-01" },
  { id: "s15", name: "Kamran Ali", rollNo: "ISL-2024-001", email: "kamran.ali@gc.edu.pk", phone: "0315-5678901", department: "Islamic Studies", semester: 3, enrollmentDate: "2024-09-01" },
  { id: "s16", name: "Rabia Aslam", rollNo: "CS-2022-004", email: "rabia.a@gc.edu.pk", phone: "0316-6789012", department: "Computer Science", semester: 7, enrollmentDate: "2022-09-01" },
  { id: "s17", name: "Imran Ashraf", rollNo: "MTH-2024-001", email: "imran.a@gc.edu.pk", phone: "0317-7890123", department: "Mathematics", semester: 3, enrollmentDate: "2024-09-01" },
  { id: "s18", name: "Sadaf Khan", rollNo: "PHY-2022-001", email: "sadaf.k@gc.edu.pk", phone: "0318-8901234", department: "Physics", semester: 7, enrollmentDate: "2022-09-01" },
];

// ─── Faculty ─────────────────────────────────────────────
export const mockFaculty: Faculty[] = [
  { id: "f1", name: "Dr. Khalid Mahmood", email: "khalid.mahmood@gc.edu.pk", phone: "0321-1111111", department: "Computer Science", specialization: "Machine Learning", joinDate: "2015-03-01" },
  { id: "f2", name: "Dr. Amina Rashid", email: "amina.rashid@gc.edu.pk", phone: "0321-2222222", department: "Computer Science", specialization: "Database Systems", joinDate: "2017-08-15" },
  { id: "f3", name: "Prof. Zahid Iqbal", email: "zahid.iqbal@gc.edu.pk", phone: "0321-3333333", department: "Mathematics", specialization: "Linear Algebra", joinDate: "2010-01-10" },
  { id: "f4", name: "Dr. Saima Nasreen", email: "saima.n@gc.edu.pk", phone: "0321-4444444", department: "Physics", specialization: "Quantum Mechanics", joinDate: "2016-06-20" },
  { id: "f5", name: "Prof. Asad Ali", email: "asad.ali@gc.edu.pk", phone: "0321-5555555", department: "English", specialization: "English Literature", joinDate: "2012-09-01" },
  { id: "f6", name: "Dr. Farhat Jabeen", email: "farhat.j@gc.edu.pk", phone: "0321-6666666", department: "Chemistry", specialization: "Organic Chemistry", joinDate: "2018-02-15" },
  { id: "f7", name: "Prof. Waqar Ahmed", email: "waqar.a@gc.edu.pk", phone: "0321-7777777", department: "Economics", specialization: "Microeconomics", joinDate: "2014-07-01" },
  { id: "f8", name: "Dr. Rashida Bibi", email: "rashida.b@gc.edu.pk", phone: "0321-8888888", department: "Urdu", specialization: "Urdu Poetry", joinDate: "2013-05-10" },
  { id: "f9", name: "Prof. Naveed Hassan", email: "naveed.h@gc.edu.pk", phone: "0321-9999999", department: "Islamic Studies", specialization: "Islamic History", joinDate: "2011-11-20" },
  { id: "f10", name: "Dr. Tahira Parveen", email: "tahira.p@gc.edu.pk", phone: "0322-1111111", department: "Mathematics", specialization: "Calculus", joinDate: "2019-01-15" },
];

// ─── Courses ─────────────────────────────────────────────
export const mockCourses: Course[] = [
  { id: "c1", courseCode: "CS-301", courseName: "Database Systems", creditHours: 3, department: "Computer Science", assignedFaculty: "Dr. Amina Rashid", enrolledCount: 45, semester: 5 },
  { id: "c2", courseCode: "CS-401", courseName: "Machine Learning", creditHours: 3, department: "Computer Science", assignedFaculty: "Dr. Khalid Mahmood", enrolledCount: 38, semester: 7 },
  { id: "c3", courseCode: "CS-201", courseName: "Data Structures", creditHours: 4, department: "Computer Science", assignedFaculty: "Dr. Amina Rashid", enrolledCount: 52, semester: 3 },
  { id: "c4", courseCode: "MTH-301", courseName: "Linear Algebra", creditHours: 3, department: "Mathematics", assignedFaculty: "Prof. Zahid Iqbal", enrolledCount: 30, semester: 5 },
  { id: "c5", courseCode: "MTH-101", courseName: "Calculus I", creditHours: 3, department: "Mathematics", assignedFaculty: "Dr. Tahira Parveen", enrolledCount: 60, semester: 1 },
  { id: "c6", courseCode: "PHY-201", courseName: "Quantum Mechanics", creditHours: 3, department: "Physics", assignedFaculty: "Dr. Saima Nasreen", enrolledCount: 25, semester: 3 },
  { id: "c7", courseCode: "ENG-301", courseName: "English Literature", creditHours: 3, department: "English", assignedFaculty: "Prof. Asad Ali", enrolledCount: 35, semester: 5 },
  { id: "c8", courseCode: "CHM-101", courseName: "Organic Chemistry", creditHours: 4, department: "Chemistry", assignedFaculty: "Dr. Farhat Jabeen", enrolledCount: 42, semester: 1 },
  { id: "c9", courseCode: "ECO-201", courseName: "Microeconomics", creditHours: 3, department: "Economics", assignedFaculty: "Prof. Waqar Ahmed", enrolledCount: 28, semester: 3 },
  { id: "c10", courseCode: "CS-101", courseName: "Programming Fundamentals", creditHours: 4, department: "Computer Science", assignedFaculty: "Dr. Khalid Mahmood", enrolledCount: 65, semester: 1 },
];

// ─── Admissions ──────────────────────────────────────────
export const mockAdmissions: Admission[] = [
  { id: "a1", studentName: "Hamza Tariq", email: "hamza.t@gmail.com", phone: "0331-1234567", appliedDepartment: "Computer Science", applicationDate: "2026-03-15", status: "Pending", fatherName: "Tariq Mehmood", cnic: "34201-1234567-1", previousInstitution: "Govt. High School Hafizabad", marksObtained: 920, totalMarks: 1100 },
  { id: "a2", studentName: "Rimsha Akram", email: "rimsha.a@gmail.com", phone: "0332-2345678", appliedDepartment: "English", applicationDate: "2026-03-14", status: "Approved", fatherName: "Akram Hussain", cnic: "34201-2345678-2", previousInstitution: "Divisional Public School", marksObtained: 850, totalMarks: 1100 },
  { id: "a3", studentName: "Faisal Nawaz", email: "faisal.n@gmail.com", phone: "0333-3456789", appliedDepartment: "Mathematics", applicationDate: "2026-03-16", status: "Pending", fatherName: "Nawaz Sharif", cnic: "34201-3456789-3", previousInstitution: "Govt. College Pindi Bhattian", marksObtained: 780, totalMarks: 1100 },
  { id: "a4", studentName: "Iqra Batool", email: "iqra.b@gmail.com", phone: "0334-4567890", appliedDepartment: "Computer Science", applicationDate: "2026-03-12", status: "Rejected", fatherName: "Muhammad Aslam", cnic: "34201-4567890-4", previousInstitution: "Punjab College", marksObtained: 600, totalMarks: 1100 },
  { id: "a5", studentName: "Usama Ghani", email: "usama.g@gmail.com", phone: "0335-5678901", appliedDepartment: "Physics", applicationDate: "2026-03-17", status: "Pending", fatherName: "Abdul Ghani", cnic: "34201-5678901-5", previousInstitution: "Superior College", marksObtained: 870, totalMarks: 1100 },
  { id: "a6", studentName: "Mehwish Khalid", email: "mehwish.k@gmail.com", phone: "0336-6789012", appliedDepartment: "Chemistry", applicationDate: "2026-03-10", status: "Approved", fatherName: "Khalid Mehmood", cnic: "34201-6789012-6", previousInstitution: "Govt. Girls College", marksObtained: 910, totalMarks: 1100 },
  { id: "a7", studentName: "Shahbaz Akhtar", email: "shahbaz.a@gmail.com", phone: "0337-7890123", appliedDepartment: "Economics", applicationDate: "2026-03-18", status: "Pending", fatherName: "Akhtar Ali", cnic: "34201-7890123-7", previousInstitution: "Army Public School", marksObtained: 750, totalMarks: 1100 },
  { id: "a8", studentName: "Muneeba Tahir", email: "muneeba.t@gmail.com", phone: "0338-8901234", appliedDepartment: "Urdu", applicationDate: "2026-03-11", status: "Approved", fatherName: "Tahir Abbas", cnic: "34201-8901234-8", previousInstitution: "Beacon House School", marksObtained: 820, totalMarks: 1100 },
];

// ─── Attendance ──────────────────────────────────────────
export const mockAttendance: Attendance[] = [
  { id: "at1", studentId: "s1", courseId: "c2", date: "2026-04-01", status: "Present", markedBy: "f1" },
  { id: "at2", studentId: "s2", courseId: "c2", date: "2026-04-01", status: "Present", markedBy: "f1" },
  { id: "at3", studentId: "s3", courseId: "c2", date: "2026-04-01", status: "Absent", markedBy: "f1" },
  { id: "at4", studentId: "s16", courseId: "c2", date: "2026-04-01", status: "Late", markedBy: "f1" },
  { id: "at5", studentId: "s1", courseId: "c1", date: "2026-04-01", status: "Present", markedBy: "f2" },
  { id: "at6", studentId: "s4", courseId: "c4", date: "2026-04-01", status: "Present", markedBy: "f3" },
  { id: "at7", studentId: "s5", courseId: "c4", date: "2026-04-01", status: "Absent", markedBy: "f3" },
  { id: "at8", studentId: "s6", courseId: "c6", date: "2026-04-02", status: "Present", markedBy: "f4" },
  { id: "at9", studentId: "s7", courseId: "c6", date: "2026-04-02", status: "Late", markedBy: "f4" },
  { id: "at10", studentId: "s8", courseId: "c7", date: "2026-04-02", status: "Present", markedBy: "f5" },
  { id: "at11", studentId: "s1", courseId: "c2", date: "2026-04-03", status: "Present", markedBy: "f1" },
  { id: "at12", studentId: "s2", courseId: "c2", date: "2026-04-03", status: "Absent", markedBy: "f1" },
];

// ─── Fee Records ─────────────────────────────────────────
export const mockFees: Fee[] = [
  { id: "fee1", studentId: "s1", type: "Semester Fee", amount: 35000, status: "Paid", dueDate: "2026-02-15" },
  { id: "fee2", studentId: "s2", type: "Semester Fee", amount: 35000, status: "Unpaid", dueDate: "2026-02-15" },
  { id: "fee3", studentId: "s3", type: "Tuition Fee", amount: 35000, status: "Overdue", dueDate: "2026-02-15" },
  { id: "fee4", studentId: "s4", type: "Semester Fee", amount: 30000, status: "Paid", dueDate: "2026-02-15" },
  { id: "fee5", studentId: "s5", type: "Tuition Fee", amount: 30000, status: "Paid", dueDate: "2026-02-15" },
  { id: "fee6", studentId: "s6", type: "Semester Fee", amount: 28000, status: "Paid", dueDate: "2026-02-15" },
  { id: "fee7", studentId: "s7", type: "Semester Fee", amount: 28000, status: "Overdue", dueDate: "2026-02-15" },
  { id: "fee8", studentId: "s8", type: "Hostel Dues", amount: 25000, status: "Paid", dueDate: "2026-02-15" },
  { id: "fee9", studentId: "s9", type: "Hostel Dues", amount: 25000, status: "Unpaid", dueDate: "2026-02-15" },
  { id: "fee10", studentId: "s10", type: "Semester Fee", amount: 30000, status: "Paid", dueDate: "2026-02-15" },
];

// ─── Announcements ───────────────────────────────────────
export const mockAnnouncements: Announcement[] = [
  { id: "ann1", title: "Mid-Term Examination Schedule", content: "Mid-term examinations will begin from April 15, 2026. Detailed schedule will be shared on the notice board. All students are required to bring their admit cards.", author: "Admin Office", date: "2026-04-01", audience: "All" },
  { id: "ann2", title: "Fee Submission Deadline Extended", content: "The last date for fee submission for the Spring 2026 semester has been extended to April 20, 2026. Late fee charges will apply after this date.", author: "Accounts Department", date: "2026-03-28", audience: "Students" },
  { id: "ann3", title: "Faculty Development Workshop", content: "A workshop on 'Modern Teaching Methodologies' will be held on April 10, 2026 in the seminar hall. All faculty members are encouraged to attend.", author: "HoD Committee", date: "2026-03-25", audience: "Faculty" },
  { id: "ann4", title: "Sports Week Announcement", content: "Annual Sports Week will be held from April 25-30, 2026. Interested students can register at the sports office before April 18.", author: "Sports Department", date: "2026-03-20", audience: "Students" },
  { id: "ann5", title: "Library Hours Extended", content: "The college library will now remain open till 8:00 PM on weekdays during the examination period. Take advantage of the extended hours.", author: "Library Committee", date: "2026-03-15", audience: "All" },
];

// ─── Feedback ────────────────────────────────────────────
export const mockFeedback: Feedback[] = [
  { id: "fb1", studentId: "s1", type: "Faculty", targetId: "f1", rating: 5, comment: "Excellent teaching methodology. Makes complex concepts easy to understand.", date: "2026-03-20" },
  { id: "fb2", studentId: "s2", type: "Faculty", targetId: "f1", rating: 4, comment: "Very knowledgeable professor. Could improve on time management.", date: "2026-03-18" },
  { id: "fb3", studentId: "s3", type: "Faculty", targetId: "f1", rating: 5, comment: "Best teacher in CS department. Highly recommend.", date: "2026-03-15" },
  { id: "fb4", studentId: "s4", type: "Course", targetId: "c1", rating: 4, comment: "Good practical approach to teaching databases.", date: "2026-03-19" },
  { id: "fb5", studentId: "s5", type: "Course", targetId: "c1", rating: 4, comment: "Assignments are very helpful. Labs could be more structured.", date: "2026-03-17" },
  { id: "fb6", studentId: "s6", type: "Faculty", targetId: "f3", rating: 3, comment: "Knows the subject well but needs to slow down.", date: "2026-03-16" },
  { id: "fb7", studentId: "s7", type: "Faculty", targetId: "f3", rating: 4, comment: "Good professor. Could use more real-world examples.", date: "2026-03-14" },
  { id: "fb8", studentId: "s8", type: "Faculty", targetId: "f4", rating: 5, comment: "Absolutely brilliant teacher. Makes physics fun!", date: "2026-03-20" },
  { id: "fb9", studentId: "s9", type: "Course", targetId: "c6", rating: 5, comment: "One of the best courses I have ever had.", date: "2026-03-18" },
  { id: "fb10", studentId: "s10", type: "Faculty", targetId: "f5", rating: 4, comment: "Very engaging lectures. Assignments are thought-provoking.", date: "2026-03-15" },
];

// ─── Timetable ───────────────────────────────────────────
export const mockTimetable: Timetable[] = [
  { id: "tt1", courseCode: "CS-401", courseName: "Machine Learning", facultyName: "Dr. Khalid Mahmood", room: "CS Lab 1", day: "Monday", startTime: "09:00 AM", department: "Computer Science", semester: 7 },
  { id: "tt2", courseCode: "CS-301", courseName: "Database Systems", facultyName: "Dr. Amina Rashid", room: "Room 201", day: "Monday", startTime: "10:00 AM", department: "Computer Science", semester: 5 },
  { id: "tt3", courseCode: "MTH-301", courseName: "Linear Algebra", facultyName: "Prof. Zahid Iqbal", room: "Room 105", day: "Monday", startTime: "11:00 AM", department: "Mathematics", semester: 5 },
  { id: "tt4", courseCode: "PHY-201", courseName: "Quantum Mechanics", facultyName: "Dr. Saima Nasreen", room: "Physics Lab", day: "Monday", startTime: "12:00 PM", department: "Physics", semester: 3 },
  { id: "tt5", courseCode: "CS-201", courseName: "Data Structures", facultyName: "Dr. Amina Rashid", room: "CS Lab 2", day: "Tuesday", startTime: "09:00 AM", department: "Computer Science", semester: 3 },
  { id: "tt6", courseCode: "ENG-301", courseName: "English Literature", facultyName: "Prof. Asad Ali", room: "Room 302", day: "Tuesday", startTime: "10:00 AM", department: "English", semester: 5 },
  { id: "tt7", courseCode: "CHM-101", courseName: "Organic Chemistry", facultyName: "Dr. Farhat Jabeen", room: "Chem Lab", day: "Tuesday", startTime: "11:00 AM", department: "Chemistry", semester: 1 },
  { id: "tt8", courseCode: "ECO-201", courseName: "Microeconomics", facultyName: "Prof. Waqar Ahmed", room: "Room 401", day: "Tuesday", startTime: "12:00 PM", department: "Economics", semester: 3 },
  { id: "tt9", courseCode: "CS-401", courseName: "Machine Learning", facultyName: "Dr. Khalid Mahmood", room: "CS Lab 1", day: "Wednesday", startTime: "09:00 AM", department: "Computer Science", semester: 7 },
  { id: "tt10", courseCode: "MTH-101", courseName: "Calculus I", facultyName: "Dr. Tahira Parveen", room: "Room 102", day: "Wednesday", startTime: "10:00 AM", department: "Mathematics", semester: 1 },
  { id: "tt11", courseCode: "CS-301", courseName: "Database Systems", facultyName: "Dr. Amina Rashid", room: "Room 201", day: "Wednesday", startTime: "11:00 AM", department: "Computer Science", semester: 5 },
  { id: "tt12", courseCode: "CS-101", courseName: "Programming Fundamentals", facultyName: "Dr. Khalid Mahmood", room: "CS Lab 2", day: "Thursday", startTime: "09:00 AM", department: "Computer Science", semester: 1 },
  { id: "tt13", courseCode: "PHY-201", courseName: "Quantum Mechanics", facultyName: "Dr. Saima Nasreen", room: "Physics Lab", day: "Thursday", startTime: "10:00 AM", department: "Physics", semester: 3 },
  { id: "tt14", courseCode: "MTH-301", courseName: "Linear Algebra", facultyName: "Prof. Zahid Iqbal", room: "Room 105", day: "Thursday", startTime: "11:00 AM", department: "Mathematics", semester: 5 },
  { id: "tt15", courseCode: "ENG-301", courseName: "English Literature", facultyName: "Prof. Asad Ali", room: "Room 302", day: "Friday", startTime: "09:00 AM", department: "English", semester: 5 },
  { id: "tt16", courseCode: "CS-201", courseName: "Data Structures", facultyName: "Dr. Amina Rashid", room: "CS Lab 2", day: "Friday", startTime: "10:00 AM", department: "Computer Science", semester: 3 },
];

export const adminDashboardStats = {
  totalStudents: mockStudents.length,
  totalFaculty: mockFaculty.length,
  activeCourses: mockCourses.length,
  pendingAdmissions: mockAdmissions.filter((a) => a.status === "Pending").length,
  attendanceRate: 85, // Updated mock value
  totalFeeCollected: mockFees.filter(f => f.status === "Paid").reduce((sum, f) => sum + f.amount, 0),
  totalFeePending: mockFees.filter(f => f.status !== "Paid").reduce((sum, f) => sum + f.amount, 0),
};

// ─── Chart Data ──────────────────────────────────────────
export const studentsPerDepartment = {
  labels: ["Computer Science", "Mathematics", "Physics", "English", "Chemistry", "Economics", "Urdu", "Islamic Studies"],
  data: [6, 3, 3, 2, 1, 1, 1, 1],
};

export const attendanceOverview = {
  labels: ["Present", "Absent", "Late"],
  data: [72, 18, 10],
};

// ─── Recent Activity ─────────────────────────────────────
export const recentActivity = [
  { id: "ra1", action: "New admission application received", user: "Hamza Tariq", timestamp: "2 minutes ago", type: "admission" as const },
  { id: "ra2", action: "Attendance marked for CS-401", user: "Dr. Khalid Mahmood", timestamp: "15 minutes ago", type: "attendance" as const },
  { id: "ra3", action: "Fee payment received", user: "Fatima Zahra — PKR 20,000", timestamp: "1 hour ago", type: "fee" as const },
  { id: "ra4", action: "New announcement posted", user: "Admin Office", timestamp: "3 hours ago", type: "announcement" as const },
  { id: "ra5", action: "Course assigned to faculty", user: "CS-101 → Dr. Khalid Mahmood", timestamp: "5 hours ago", type: "course" as const },
  { id: "ra6", action: "Student enrolled", user: "Hira Shah — CS-2024-001", timestamp: "1 day ago", type: "student" as const },
];
