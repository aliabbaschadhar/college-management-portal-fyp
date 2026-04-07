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
  Question,
  Quiz,
  QuizAttempt,
  Grade,
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
  { id: "c1", courseCode: "CS-301", courseName: "Database Systems", name: "Database Systems", creditHours: 3, department: "Computer Science", assignedFaculty: "Dr. Amina Rashid", enrolledCount: 45, semester: 5 },
  { id: "c2", courseCode: "CS-401", courseName: "Machine Learning", name: "Machine Learning", creditHours: 3, department: "Computer Science", assignedFaculty: "Dr. Khalid Mahmood", enrolledCount: 38, semester: 7 },
  { id: "c3", courseCode: "CS-201", courseName: "Data Structures", name: "Data Structures", creditHours: 4, department: "Computer Science", assignedFaculty: "Dr. Amina Rashid", enrolledCount: 52, semester: 3 },
  { id: "c4", courseCode: "MTH-301", courseName: "Linear Algebra", name: "Linear Algebra", creditHours: 3, department: "Mathematics", assignedFaculty: "Prof. Zahid Iqbal", enrolledCount: 30, semester: 5 },
  { id: "c5", courseCode: "MTH-101", courseName: "Calculus I", name: "Calculus I", creditHours: 3, department: "Mathematics", assignedFaculty: "Dr. Tahira Parveen", enrolledCount: 60, semester: 1 },
  { id: "c6", courseCode: "PHY-201", courseName: "Quantum Mechanics", name: "Quantum Mechanics", creditHours: 3, department: "Physics", assignedFaculty: "Dr. Saima Nasreen", enrolledCount: 25, semester: 3 },
  { id: "c7", courseCode: "ENG-301", courseName: "English Literature", name: "English Literature", creditHours: 3, department: "English", assignedFaculty: "Prof. Asad Ali", enrolledCount: 35, semester: 5 },
  { id: "c8", courseCode: "CHM-101", courseName: "Organic Chemistry", name: "Organic Chemistry", creditHours: 4, department: "Chemistry", assignedFaculty: "Dr. Farhat Jabeen", enrolledCount: 42, semester: 1 },
  { id: "c9", courseCode: "ECO-201", courseName: "Microeconomics", name: "Microeconomics", creditHours: 3, department: "Economics", assignedFaculty: "Prof. Waqar Ahmed", enrolledCount: 28, semester: 3 },
  { id: "c10", courseCode: "CS-101", courseName: "Programming Fundamentals", name: "Programming Fundamentals", creditHours: 4, department: "Computer Science", assignedFaculty: "Dr. Khalid Mahmood", enrolledCount: 65, semester: 1 },
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
  { id: "fee1", studentId: "s1", type: "Semester Fee", feeType: "Semester Fee", amount: 35000, status: "Paid", dueDate: "2026-02-15", semester: 7, paidDate: "2026-02-10" },
  { id: "fee2", studentId: "s2", type: "Semester Fee", feeType: "Semester Fee", amount: 35000, status: "Unpaid", dueDate: "2026-02-15", semester: 5, paidDate: null },
  { id: "fee3", studentId: "s3", type: "Tuition Fee", feeType: "Tuition Fee", amount: 35000, status: "Overdue", dueDate: "2026-02-15", semester: 3, paidDate: null },
  { id: "fee4", studentId: "s4", type: "Semester Fee", feeType: "Semester Fee", amount: 30000, status: "Paid", dueDate: "2026-02-15", semester: 5, paidDate: "2026-02-12" },
  { id: "fee5", studentId: "s5", type: "Tuition Fee", feeType: "Tuition Fee", amount: 30000, status: "Paid", dueDate: "2026-02-15", semester: 1, paidDate: "2026-02-14" },
  { id: "fee6", studentId: "s6", type: "Semester Fee", feeType: "Semester Fee", amount: 28000, status: "Paid", dueDate: "2026-02-15", semester: 3, paidDate: "2026-02-08" },
  { id: "fee7", studentId: "s7", type: "Semester Fee", feeType: "Semester Fee", amount: 28000, status: "Overdue", dueDate: "2026-02-15", semester: 3, paidDate: null },
  { id: "fee8", studentId: "s8", type: "Hostel Dues", feeType: "Hostel Dues", amount: 25000, status: "Paid", dueDate: "2026-02-15", semester: 5, paidDate: "2026-02-11" },
  { id: "fee9", studentId: "s9", type: "Hostel Dues", feeType: "Hostel Dues", amount: 25000, status: "Unpaid", dueDate: "2026-02-15", semester: 1, paidDate: null },
  { id: "fee10", studentId: "s10", type: "Semester Fee", feeType: "Semester Fee", amount: 30000, status: "Paid", dueDate: "2026-02-15", semester: 3, paidDate: "2026-02-13" },
  { id: "fee11", studentId: "s1", type: "Lab Fee", feeType: "Lab Fee", amount: 5000, status: "Unpaid", dueDate: "2026-03-15", semester: 7, paidDate: null },
  { id: "fee12", studentId: "s1", type: "Library Fee", feeType: "Library Fee", amount: 2000, status: "Paid", dueDate: "2026-02-15", semester: 7, paidDate: "2026-02-10" },
];

// ─── Announcements ───────────────────────────────────────
export const mockAnnouncements: Announcement[] = [
  { id: "ann1", title: "Mid-Term Examination Schedule", content: "Mid-term examinations will begin from April 15, 2026. Detailed schedule will be shared on the notice board. All students are required to bring their admit cards.", author: "Admin Office", date: "2026-04-01", audience: "All", priority: "High" },
  { id: "ann2", title: "Fee Submission Deadline Extended", content: "The last date for fee submission for the Spring 2026 semester has been extended to April 20, 2026. Late fee charges will apply after this date.", author: "Accounts Department", date: "2026-03-28", audience: "Students", priority: "High" },
  { id: "ann3", title: "Faculty Development Workshop", content: "A workshop on 'Modern Teaching Methodologies' will be held on April 10, 2026 in the seminar hall. All faculty members are encouraged to attend.", author: "HoD Committee", date: "2026-03-25", audience: "Faculty", priority: "Medium" },
  { id: "ann4", title: "Sports Week Announcement", content: "Annual Sports Week will be held from April 25-30, 2026. Interested students can register at the sports office before April 18.", author: "Sports Department", date: "2026-03-20", audience: "Students", priority: "Low" },
  { id: "ann5", title: "Library Hours Extended", content: "The college library will now remain open till 8:00 PM on weekdays during the examination period. Take advantage of the extended hours.", author: "Library Committee", date: "2026-03-15", audience: "All", priority: "Medium" },
];

// ─── Feedback ────────────────────────────────────────────
export const mockFeedback: Feedback[] = [
  { id: "fb1", studentId: "s1", submittedBy: "s1", type: "Faculty", targetId: "f1", rating: 5, comment: "Excellent teaching methodology. Makes complex concepts easy to understand.", date: "2026-03-20" },
  { id: "fb2", studentId: "s2", submittedBy: "s2", type: "Faculty", targetId: "f1", rating: 4, comment: "Very knowledgeable professor. Could improve on time management.", date: "2026-03-18" },
  { id: "fb3", studentId: "s3", submittedBy: "s3", type: "Faculty", targetId: "f1", rating: 5, comment: "Best teacher in CS department. Highly recommend.", date: "2026-03-15" },
  { id: "fb4", studentId: "s4", submittedBy: "s4", type: "Course", targetId: "c1", rating: 4, comment: "Good practical approach to teaching databases.", date: "2026-03-19" },
  { id: "fb5", studentId: "s5", submittedBy: "s5", type: "Course", targetId: "c1", rating: 4, comment: "Assignments are very helpful. Labs could be more structured.", date: "2026-03-17" },
  { id: "fb6", studentId: "s6", submittedBy: "s6", type: "Faculty", targetId: "f3", rating: 3, comment: "Knows the subject well but needs to slow down.", date: "2026-03-16" },
  { id: "fb7", studentId: "s7", submittedBy: "s7", type: "Faculty", targetId: "f3", rating: 4, comment: "Good professor. Could use more real-world examples.", date: "2026-03-14" },
  { id: "fb8", studentId: "s8", submittedBy: "s8", type: "Faculty", targetId: "f4", rating: 5, comment: "Absolutely brilliant teacher. Makes physics fun!", date: "2026-03-20" },
  { id: "fb9", studentId: "s9", submittedBy: "s9", type: "Course", targetId: "c6", rating: 5, comment: "One of the best courses I have ever had.", date: "2026-03-18" },
  { id: "fb10", studentId: "s10", submittedBy: "s10", type: "Faculty", targetId: "f5", rating: 4, comment: "Very engaging lectures. Assignments are thought-provoking.", date: "2026-03-15" },
];

// ─── Timetable ───────────────────────────────────────────
export const mockTimetable: Timetable[] = [
  { id: "tt1", courseId: "c2", courseCode: "CS-401", courseName: "Machine Learning", facultyName: "Dr. Khalid Mahmood", room: "CS Lab 1", day: "Monday", startTime: "09:00", endTime: "10:00", department: "Computer Science", semester: 7 },
  { id: "tt2", courseId: "c1", courseCode: "CS-301", courseName: "Database Systems", facultyName: "Dr. Amina Rashid", room: "Room 201", day: "Monday", startTime: "10:00", endTime: "11:00", department: "Computer Science", semester: 5 },
  { id: "tt3", courseId: "c4", courseCode: "MTH-301", courseName: "Linear Algebra", facultyName: "Prof. Zahid Iqbal", room: "Room 105", day: "Monday", startTime: "11:00", endTime: "12:00", department: "Mathematics", semester: 5 },
  { id: "tt4", courseId: "c6", courseCode: "PHY-201", courseName: "Quantum Mechanics", facultyName: "Dr. Saima Nasreen", room: "Physics Lab", day: "Monday", startTime: "14:00", endTime: "15:00", department: "Physics", semester: 3 },
  { id: "tt5", courseId: "c3", courseCode: "CS-201", courseName: "Data Structures", facultyName: "Dr. Amina Rashid", room: "CS Lab 2", day: "Tuesday", startTime: "09:00", endTime: "11:00", department: "Computer Science", semester: 3 },
  { id: "tt6", courseId: "c7", courseCode: "ENG-301", courseName: "English Literature", facultyName: "Prof. Asad Ali", room: "Room 302", day: "Tuesday", startTime: "11:00", endTime: "12:00", department: "English", semester: 5 },
  { id: "tt7", courseId: "c8", courseCode: "CHM-101", courseName: "Organic Chemistry", facultyName: "Dr. Farhat Jabeen", room: "Chem Lab", day: "Tuesday", startTime: "14:00", endTime: "16:00", department: "Chemistry", semester: 1 },
  { id: "tt8", courseId: "c9", courseCode: "ECO-201", courseName: "Microeconomics", facultyName: "Prof. Waqar Ahmed", room: "Room 401", day: "Tuesday", startTime: "12:00", endTime: "13:00", department: "Economics", semester: 3 },
  { id: "tt9", courseId: "c2", courseCode: "CS-401", courseName: "Machine Learning", facultyName: "Dr. Khalid Mahmood", room: "CS Lab 1", day: "Wednesday", startTime: "09:00", endTime: "10:00", department: "Computer Science", semester: 7 },
  { id: "tt10", courseId: "c5", courseCode: "MTH-101", courseName: "Calculus I", facultyName: "Dr. Tahira Parveen", room: "Room 102", day: "Wednesday", startTime: "10:00", endTime: "11:00", department: "Mathematics", semester: 1 },
  { id: "tt11", courseId: "c1", courseCode: "CS-301", courseName: "Database Systems", facultyName: "Dr. Amina Rashid", room: "Room 201", day: "Wednesday", startTime: "11:00", endTime: "12:00", department: "Computer Science", semester: 5 },
  { id: "tt12", courseId: "c10", courseCode: "CS-101", courseName: "Programming Fundamentals", facultyName: "Dr. Khalid Mahmood", room: "CS Lab 2", day: "Thursday", startTime: "09:00", endTime: "11:00", department: "Computer Science", semester: 1 },
  { id: "tt13", courseId: "c6", courseCode: "PHY-201", courseName: "Quantum Mechanics", facultyName: "Dr. Saima Nasreen", room: "Physics Lab", day: "Thursday", startTime: "10:00", endTime: "11:00", department: "Physics", semester: 3 },
  { id: "tt14", courseId: "c4", courseCode: "MTH-301", courseName: "Linear Algebra", facultyName: "Prof. Zahid Iqbal", room: "Room 105", day: "Thursday", startTime: "11:00", endTime: "12:00", department: "Mathematics", semester: 5 },
  { id: "tt15", courseId: "c7", courseCode: "ENG-301", courseName: "English Literature", facultyName: "Prof. Asad Ali", room: "Room 302", day: "Friday", startTime: "09:00", endTime: "10:00", department: "English", semester: 5 },
  { id: "tt16", courseId: "c3", courseCode: "CS-201", courseName: "Data Structures", facultyName: "Dr. Amina Rashid", room: "CS Lab 2", day: "Friday", startTime: "10:00", endTime: "12:00", department: "Computer Science", semester: 3 },
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

// ─── Questions Bank ──────────────────────────────────────
export const mockQuestions: Question[] = [
  { id: "q1", text: "What is a primary key in a database?", options: ["A unique identifier for a record", "A foreign key reference", "An index on a table", "A stored procedure"], correctOption: 0, courseId: "c1", createdBy: "f2" },
  { id: "q2", text: "Which SQL command is used to retrieve data?", options: ["INSERT", "UPDATE", "SELECT", "DELETE"], correctOption: 2, courseId: "c1", createdBy: "f2" },
  { id: "q3", text: "What does ACID stand for in databases?", options: ["Atomicity, Consistency, Isolation, Durability", "Application, Control, Integration, Data", "Access, Create, Insert, Delete", "None of the above"], correctOption: 0, courseId: "c1", createdBy: "f2" },
  { id: "q4", text: "What is normalization?", options: ["Adding redundancy", "Removing redundancy", "Creating indexes", "Deleting tables"], correctOption: 1, courseId: "c1", createdBy: "f2" },
  { id: "q5", text: "What is supervised learning?", options: ["Learning without labels", "Learning with labeled data", "Reinforcement learning", "Unsupervised clustering"], correctOption: 1, courseId: "c2", createdBy: "f1" },
  { id: "q6", text: "Which algorithm is used for classification?", options: ["Linear Regression", "K-Means", "Decision Tree", "PCA"], correctOption: 2, courseId: "c2", createdBy: "f1" },
  { id: "q7", text: "What is overfitting?", options: ["Model performs well on training data but poorly on test data", "Model performs poorly on all data", "Model is too simple", "None of these"], correctOption: 0, courseId: "c2", createdBy: "f1" },
  { id: "q8", text: "What is a linked list?", options: ["An array of elements", "A linear data structure with pointers", "A tree structure", "A hash map"], correctOption: 1, courseId: "c3", createdBy: "f2" },
  { id: "q9", text: "What is the time complexity of binary search?", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], correctOption: 2, courseId: "c3", createdBy: "f2" },
  { id: "q10", text: "What is a stack?", options: ["FIFO structure", "LIFO structure", "Random access", "Graph structure"], correctOption: 1, courseId: "c3", createdBy: "f2" },
];

// ─── Quizzes ─────────────────────────────────────────────
export const mockQuizzes: Quiz[] = [
  { id: "qz1", title: "Database Fundamentals Quiz", courseId: "c1", createdBy: "f2", duration: 15, totalMarks: 20, questions: ["q1", "q2", "q3", "q4"], status: "Published", dueDate: "2026-04-20" },
  { id: "qz2", title: "ML Basics Quiz", courseId: "c2", createdBy: "f1", duration: 20, totalMarks: 30, questions: ["q5", "q6", "q7"], status: "Published", dueDate: "2026-04-18" },
  { id: "qz3", title: "Data Structures Mid Quiz", courseId: "c3", createdBy: "f2", duration: 25, totalMarks: 25, questions: ["q8", "q9", "q10"], status: "Draft", dueDate: "2026-04-25" },
  { id: "qz4", title: "Advanced SQL Quiz", courseId: "c1", createdBy: "f2", duration: 10, totalMarks: 15, questions: ["q1", "q3"], status: "Closed", dueDate: "2026-03-15" },
];

// ─── Quiz Attempts ───────────────────────────────────────
export const mockQuizAttempts: QuizAttempt[] = [
  { id: "qa1", quizId: "qz4", studentId: "s1", score: 13, totalMarks: 15, submittedAt: "2026-03-14T10:30:00", answers: [0, 0] },
  { id: "qa2", quizId: "qz4", studentId: "s2", score: 10, totalMarks: 15, submittedAt: "2026-03-14T10:45:00", answers: [0, 1] },
  { id: "qa3", quizId: "qz4", studentId: "s3", score: 15, totalMarks: 15, submittedAt: "2026-03-14T10:28:00", answers: [0, 0] },
];

// ─── Grade Records ───────────────────────────────────────
export const mockGrades: Grade[] = [
  { id: "g1", studentId: "s1", courseId: "c2", quizMarks: 18, assignmentMarks: 22, midMarks: 35, finalMarks: 42, total: 117, gpa: 3.7, locked: false },
  { id: "g2", studentId: "s1", courseId: "c1", quizMarks: 15, assignmentMarks: 20, midMarks: 30, finalMarks: 38, total: 103, gpa: 3.3, locked: true },
  { id: "g3", studentId: "s2", courseId: "c2", quizMarks: 20, assignmentMarks: 24, midMarks: 40, finalMarks: 45, total: 129, gpa: 3.9, locked: false },
  { id: "g4", studentId: "s2", courseId: "c1", quizMarks: 12, assignmentMarks: 18, midMarks: 28, finalMarks: 35, total: 93, gpa: 3.0, locked: true },
  { id: "g5", studentId: "s3", courseId: "c2", quizMarks: 16, assignmentMarks: 19, midMarks: 32, finalMarks: 40, total: 107, gpa: 3.4, locked: false },
  { id: "g6", studentId: "s4", courseId: "c4", quizMarks: 14, assignmentMarks: 20, midMarks: 33, finalMarks: 41, total: 108, gpa: 3.5, locked: false },
  { id: "g7", studentId: "s5", courseId: "c4", quizMarks: 17, assignmentMarks: 22, midMarks: 36, finalMarks: 44, total: 119, gpa: 3.8, locked: false },
  { id: "g8", studentId: "s6", courseId: "c6", quizMarks: 19, assignmentMarks: 23, midMarks: 38, finalMarks: 46, total: 126, gpa: 3.9, locked: false },
  { id: "g9", studentId: "s11", courseId: "c1", quizMarks: 13, assignmentMarks: 17, midMarks: 29, finalMarks: 36, total: 95, gpa: 3.1, locked: true },
  { id: "g10", studentId: "s16", courseId: "c2", quizMarks: 15, assignmentMarks: 21, midMarks: 34, finalMarks: 43, total: 113, gpa: 3.6, locked: false },
];

// ─── Enrollment Map (which students are in which courses) ─
export const mockEnrollments: { studentId: string; courseId: string }[] = [
  { studentId: "s1", courseId: "c2" }, { studentId: "s1", courseId: "c1" },
  { studentId: "s2", courseId: "c2" }, { studentId: "s2", courseId: "c1" },
  { studentId: "s3", courseId: "c2" }, { studentId: "s3", courseId: "c1" },
  { studentId: "s4", courseId: "c4" }, { studentId: "s5", courseId: "c4" },
  { studentId: "s6", courseId: "c6" }, { studentId: "s7", courseId: "c6" },
  { studentId: "s8", courseId: "c7" }, { studentId: "s9", courseId: "c7" },
  { studentId: "s10", courseId: "c8" },
  { studentId: "s11", courseId: "c1" }, { studentId: "s11", courseId: "c3" },
  { studentId: "s12", courseId: "c3" },
  { studentId: "s13", courseId: "c9" },
  { studentId: "s16", courseId: "c2" }, { studentId: "s16", courseId: "c1" },
];

// ─── Faculty-Course Assignment ───────────────────────────
export const mockTeaches: { facultyId: string; courseId: string }[] = [
  { facultyId: "f1", courseId: "c2" }, { facultyId: "f1", courseId: "c10" },
  { facultyId: "f2", courseId: "c1" }, { facultyId: "f2", courseId: "c3" },
  { facultyId: "f3", courseId: "c4" },
  { facultyId: "f4", courseId: "c6" },
  { facultyId: "f5", courseId: "c7" },
  { facultyId: "f6", courseId: "c8" },
  { facultyId: "f7", courseId: "c9" },
  { facultyId: "f10", courseId: "c5" },
];

// ─── Helper Functions ────────────────────────────────────

/** Get courses a student is enrolled in */
export function getStudentCourses(studentId: string) {
  const courseIds = mockEnrollments
    .filter((e) => e.studentId === studentId)
    .map((e) => e.courseId);
  return mockCourses.filter((c) => courseIds.includes(c.id));
}

/** Get courses a faculty teaches */
export function getFacultyClasses(facultyId: string) {
  const courseIds = mockTeaches
    .filter((t) => t.facultyId === facultyId)
    .map((t) => t.courseId);
  return mockCourses.filter((c) => courseIds.includes(c.id));
}

/** Get students enrolled in a specific course */
export function getCourseStudents(courseId: string) {
  const studentIds = mockEnrollments
    .filter((e) => e.courseId === courseId)
    .map((e) => e.studentId);
  return mockStudents.filter((s) => studentIds.includes(s.id));
}

/** Get attendance records for a student */
export function getStudentAttendance(studentId: string) {
  return mockAttendance.filter((a) => a.studentId === studentId);
}

/** Get attendance for a faculty's course on a date */
export function getCourseAttendance(courseId: string, date?: string) {
  return mockAttendance.filter(
    (a) => a.courseId === courseId && (!date || a.date === date)
  );
}

/** Get grades for a student */
export function getStudentGrades(studentId: string) {
  return mockGrades.filter((g) => g.studentId === studentId);
}

/** Get fees for a student */
export function getStudentFees(studentId: string) {
  return mockFees.filter((f) => f.studentId === studentId);
}

/** Get timetable for a student (by department + semester) */
export function getStudentTimetable(studentId: string) {
  const student = mockStudents.find((s) => s.id === studentId);
  if (!student) return [];
  const enrolledCourseIds = mockEnrollments
    .filter((e) => e.studentId === studentId)
    .map((e) => e.courseId);
  const enrolledCourseCodes = mockCourses
    .filter((c) => enrolledCourseIds.includes(c.id))
    .map((c) => c.courseCode);
  return mockTimetable.filter((t) => enrolledCourseCodes.includes(t.courseCode));
}

/** Get timetable for a faculty member */
export function getFacultyTimetable(facultyId: string) {
  const faculty = mockFaculty.find((f) => f.id === facultyId);
  if (!faculty) return [];
  return mockTimetable.filter((t) => t.facultyName === faculty.name);
}

/** Get quizzes available for a student (based on enrolled courses) */
export function getStudentQuizzes(studentId: string) {
  const courseIds = mockEnrollments
    .filter((e) => e.studentId === studentId)
    .map((e) => e.courseId);
  return mockQuizzes.filter((q) => courseIds.includes(q.courseId));
}

/** Get feedback for a faculty member */
export function getFacultyFeedback(facultyId: string) {
  const courseIds = mockTeaches
    .filter((t) => t.facultyId === facultyId)
    .map((t) => t.courseId);
  return mockFeedback.filter(
    (f) =>
      (f.type === "Faculty" && f.targetId === facultyId) ||
      (f.type === "Course" && courseIds.includes(f.targetId))
  );
}

/** Student dashboard stats */
export function getStudentDashboardStats(studentId: string) {
  const grades = getStudentGrades(studentId);
  const attendance = getStudentAttendance(studentId);
  const fees = getStudentFees(studentId);
  const courses = getStudentCourses(studentId);

  const avgGpa = grades.length > 0
    ? +(grades.reduce((sum, g) => sum + g.gpa, 0) / grades.length).toFixed(2)
    : 0;

  const presentCount = attendance.filter((a) => a.status === "Present" || a.status === "Late").length;
  const attendancePercent = attendance.length > 0
    ? Math.round((presentCount / attendance.length) * 100)
    : 100;

  const pendingDues = fees.filter((f) => f.status !== "Paid").reduce((sum, f) => sum + f.amount, 0);

  return {
    currentGPA: avgGpa,
    attendancePercent,
    pendingDues,
    enrolledCourses: courses.length,
    totalPaid: fees.filter((f) => f.status === "Paid").reduce((sum, f) => sum + f.amount, 0),
  };
}

/** Faculty dashboard stats */
export function getFacultyDashboardStats(facultyId: string) {
  const courses = getFacultyClasses(facultyId);
  const courseIds = courses.map((c) => c.id);
  const totalStudents = new Set(
    mockEnrollments.filter((e) => courseIds.includes(e.courseId)).map((e) => e.studentId)
  ).size;

  const feedback = getFacultyFeedback(facultyId);
  const avgRating = feedback.length > 0
    ? +(feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : 0;

  const pendingQuizReviews = mockQuizzes.filter(
    (q) => q.createdBy === facultyId && q.status === "Published"
  ).length;

  return {
    totalCourses: courses.length,
    totalStudents,
    avgRating,
    pendingQuizReviews,
  };
}

