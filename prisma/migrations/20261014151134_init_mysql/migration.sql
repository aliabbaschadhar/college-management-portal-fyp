-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `clerkId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `role` ENUM('STUDENT', 'FACULTY', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    `avatar` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_clerkId_key`(`clerkId`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Student` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rollNo` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `department` VARCHAR(191) NOT NULL,
    `semester` INTEGER NOT NULL DEFAULT 1,
    `programLevel` ENUM('BS', 'INTERMEDIATE') NOT NULL DEFAULT 'BS',
    `discipline` VARCHAR(191) NULL,
    `part` INTEGER NULL,
    `subjectSet` VARCHAR(191) NULL,
    `enrollmentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `avatar` TEXT NULL,
    `shift` VARCHAR(191) NOT NULL DEFAULT 'Morning',
    `approvedBy` VARCHAR(191) NULL,
    `cgpa` DOUBLE NOT NULL DEFAULT 0.0,
    `blocked` BOOLEAN NOT NULL DEFAULT false,
    `readmitRequested` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    `gradesheetUrl` TEXT NULL,
    `graduationDate` DATETIME(3) NULL,
    `totalMarks` INTEGER NULL,
    `obtainedMarks` INTEGER NULL,
    `part1Marks` INTEGER NULL,
    `percentage` DOUBLE NULL,
    `grade` VARCHAR(191) NULL,
    `leftReason` VARCHAR(191) NULL,
    `leftDate` DATETIME(3) NULL,

    UNIQUE INDEX `Student_userId_key`(`userId`),
    UNIQUE INDEX `Student_rollNo_key`(`rollNo`),
    INDEX `Student_programLevel_idx`(`programLevel`),
    INDEX `Student_discipline_idx`(`discipline`),
    INDEX `Student_subjectSet_idx`(`subjectSet`),
    INDEX `Student_programLevel_status_idx`(`programLevel`, `status`),
    INDEX `Student_department_semester_idx`(`department`, `semester`),
    INDEX `Student_status_idx`(`status`),
    INDEX `Student_department_idx`(`department`),
    INDEX `Student_semester_idx`(`semester`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Faculty` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `department` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(191) NOT NULL,
    `joinDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `avatar` TEXT NULL,

    UNIQUE INDEX `Faculty_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Admin_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Course` (
    `id` VARCHAR(191) NOT NULL,
    `courseCode` VARCHAR(191) NOT NULL,
    `courseName` VARCHAR(191) NOT NULL,
    `creditHours` INTEGER NOT NULL,
    `totalMarks` INTEGER NULL DEFAULT 100,
    `department` VARCHAR(191) NOT NULL,
    `semester` INTEGER NOT NULL DEFAULT 1,
    `programLevel` ENUM('BS', 'INTERMEDIATE') NOT NULL DEFAULT 'BS',
    `discipline` VARCHAR(191) NULL,
    `part` INTEGER NULL,
    `subjectSet` VARCHAR(191) NULL,
    `assignedFaculty` VARCHAR(191) NULL,
    `assignedFacultyMorning` VARCHAR(191) NULL,
    `assignedFacultyEvening` VARCHAR(191) NULL,
    `shift` VARCHAR(191) NOT NULL DEFAULT 'Morning',

    INDEX `Course_programLevel_idx`(`programLevel`),
    INDEX `Course_discipline_idx`(`discipline`),
    INDEX `Course_subjectSet_idx`(`subjectSet`),
    INDEX `Course_assignedFaculty_idx`(`assignedFaculty`),
    INDEX `Course_assignedFacultyMorning_idx`(`assignedFacultyMorning`),
    INDEX `Course_assignedFacultyEvening_idx`(`assignedFacultyEvening`),
    INDEX `Course_department_semester_idx`(`department`, `semester`),
    INDEX `Course_programLevel_semester_idx`(`programLevel`, `semester`),
    UNIQUE INDEX `Course_courseCode_department_key`(`courseCode`, `department`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Enrollment` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `semester` INTEGER NOT NULL,
    `blocked` BOOLEAN NOT NULL DEFAULT false,
    `readmitRequested` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Enrollment_courseId_idx`(`courseId`),
    INDEX `Enrollment_studentId_idx`(`studentId`),
    INDEX `Enrollment_studentId_semester_idx`(`studentId`, `semester`),
    UNIQUE INDEX `Enrollment_studentId_courseId_key`(`studentId`, `courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attendance` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `status` ENUM('Present', 'Absent', 'Late') NOT NULL,
    `markedBy` VARCHAR(191) NOT NULL,

    INDEX `Attendance_courseId_idx`(`courseId`),
    INDEX `Attendance_studentId_idx`(`studentId`),
    INDEX `Attendance_date_idx`(`date`),
    INDEX `Attendance_status_idx`(`status`),
    INDEX `Attendance_studentId_status_idx`(`studentId`, `status`),
    INDEX `Attendance_courseId_date_idx`(`courseId`, `date`),
    UNIQUE INDEX `Attendance_studentId_courseId_date_key`(`studentId`, `courseId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fee` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` ENUM('Paid', 'Unpaid', 'Overdue') NOT NULL DEFAULT 'Unpaid',
    `dueDate` DATETIME(3) NOT NULL,
    `semester` INTEGER NOT NULL,
    `paidDate` DATETIME(3) NULL,

    INDEX `Fee_studentId_idx`(`studentId`),
    INDEX `Fee_status_idx`(`status`),
    INDEX `Fee_dueDate_idx`(`dueDate`),
    INDEX `Fee_studentId_semester_idx`(`studentId`, `semester`),
    INDEX `Fee_studentId_status_idx`(`studentId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Announcement` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `audience` ENUM('Students', 'Faculty', 'All') NOT NULL,
    `priority` ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Medium',
    `targetDepartment` VARCHAR(191) NULL,
    `targetSemester` INTEGER NULL,
    `programLevel` ENUM('BS', 'INTERMEDIATE') NOT NULL DEFAULT 'BS',

    INDEX `Announcement_programLevel_idx`(`programLevel`),
    INDEX `Announcement_date_idx`(`date`),
    INDEX `Announcement_audience_idx`(`audience`),
    INDEX `Announcement_targetDepartment_targetSemester_idx`(`targetDepartment`, `targetSemester`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feedback` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `type` ENUM('Faculty', 'Course') NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Feedback_studentId_idx`(`studentId`),
    INDEX `Feedback_targetId_type_idx`(`targetId`, `type`),
    UNIQUE INDEX `Feedback_studentId_targetId_type_key`(`studentId`, `targetId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Timetable` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `room` VARCHAR(191) NOT NULL,
    `day` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `shift` VARCHAR(191) NOT NULL DEFAULT 'Morning',

    INDEX `Timetable_courseId_idx`(`courseId`),
    INDEX `Timetable_shift_idx`(`shift`),
    INDEX `Timetable_day_idx`(`day`),
    INDEX `Timetable_courseId_shift_idx`(`courseId`, `shift`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quiz` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `duration` INTEGER NOT NULL,
    `totalMarks` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,

    INDEX `Quiz_courseId_idx`(`courseId`),
    INDEX `Quiz_courseId_status_idx`(`courseId`, `status`),
    INDEX `Quiz_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'MCQ',
    `text` TEXT NOT NULL,
    `options` JSON NOT NULL,
    `correctOption` INTEGER NULL,
    `sampleAnswer` TEXT NULL,
    `marks` INTEGER NOT NULL DEFAULT 1,
    `quizId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Question_courseId_idx`(`courseId`),
    INDEX `Question_quizId_idx`(`quizId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuizAttempt` (
    `id` VARCHAR(191) NOT NULL,
    `quizId` VARCHAR(191) NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `totalMarks` INTEGER NOT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `answers` JSON NOT NULL,
    `quizTitle` VARCHAR(191) NULL,
    `courseCode` VARCHAR(191) NULL,

    INDEX `QuizAttempt_quizId_idx`(`quizId`),
    INDEX `QuizAttempt_studentId_idx`(`studentId`),
    INDEX `QuizAttempt_studentId_quizId_idx`(`studentId`, `quizId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Grade` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `quizMarks` DOUBLE NOT NULL,
    `assignmentMarks` DOUBLE NOT NULL,
    `midMarks` DOUBLE NOT NULL,
    `finalMarks` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `gpa` DOUBLE NOT NULL,
    `locked` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Grade_studentId_idx`(`studentId`),
    INDEX `Grade_courseId_idx`(`courseId`),
    INDEX `Grade_studentId_courseId_idx`(`studentId`, `courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admission` (
    `id` VARCHAR(191) NOT NULL,
    `studentName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `appliedDepartment` VARCHAR(191) NOT NULL,
    `applicationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `fatherName` VARCHAR(191) NOT NULL,
    `cnic` VARCHAR(191) NOT NULL,
    `previousInstitution` VARCHAR(191) NOT NULL,
    `marksObtained` DOUBLE NOT NULL,
    `totalMarks` DOUBLE NOT NULL,
    `shift` VARCHAR(191) NOT NULL DEFAULT 'Morning',
    `semester` INTEGER NOT NULL DEFAULT 1,
    `programLevel` ENUM('BS', 'INTERMEDIATE') NOT NULL DEFAULT 'BS',
    `discipline` VARCHAR(191) NULL,
    `part` INTEGER NULL,
    `subjectSet` VARCHAR(191) NULL,
    `selectedCourses` JSON NOT NULL,
    `blocked` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Admission_programLevel_idx`(`programLevel`),
    INDEX `Admission_status_programLevel_idx`(`status`, `programLevel`),
    INDEX `Admission_email_idx`(`email`),
    INDEX `Admission_applicationDate_idx`(`applicationDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `adminId` VARCHAR(191) NULL,
    `adminName` VARCHAR(191) NULL,
    `programLevel` ENUM('BS', 'INTERMEDIATE') NOT NULL DEFAULT 'BS',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,

    INDEX `AuditLog_entity_entityId_idx`(`entity`, `entityId`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    INDEX `AuditLog_programLevel_idx`(`programLevel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OnboardingRequest` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('STUDENT', 'FACULTY', 'ADMIN') NOT NULL,
    `phone` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `specialization` VARCHAR(191) NULL,
    `programLevel` ENUM('BS', 'INTERMEDIATE') NOT NULL DEFAULT 'BS',
    `discipline` VARCHAR(191) NULL,
    `part` INTEGER NULL,
    `subjectSet` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OnboardingRequest_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TimetableSettings` (
    `id` VARCHAR(191) NOT NULL,
    `shift` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL DEFAULT '07:45',
    `duration` INTEGER NOT NULL DEFAULT 45,
    `slots` INTEGER NOT NULL DEFAULT 7,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TimetableSettings_shift_key`(`shift`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemSettings` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SystemSettings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FacultyAttendance` (
    `id` VARCHAR(191) NOT NULL,
    `facultyId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `status` ENUM('Present', 'Absent', 'Late') NOT NULL,
    `checkInTime` DATETIME(3) NULL,
    `checkOutTime` DATETIME(3) NULL,
    `markedBy` VARCHAR(191) NOT NULL DEFAULT 'SELF',
    `notes` TEXT NULL,

    INDEX `FacultyAttendance_date_idx`(`date`),
    UNIQUE INDEX `FacultyAttendance_facultyId_date_key`(`facultyId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Faculty` ADD CONSTRAINT `Faculty_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_assignedFaculty_fkey` FOREIGN KEY (`assignedFaculty`) REFERENCES `Faculty`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_assignedFacultyMorning_fkey` FOREIGN KEY (`assignedFacultyMorning`) REFERENCES `Faculty`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_assignedFacultyEvening_fkey` FOREIGN KEY (`assignedFacultyEvening`) REFERENCES `Faculty`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fee` ADD CONSTRAINT `Fee_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Timetable` ADD CONSTRAINT `Timetable_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quiz` ADD CONSTRAINT `Quiz_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `Quiz`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizAttempt` ADD CONSTRAINT `QuizAttempt_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `Quiz`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizAttempt` ADD CONSTRAINT `QuizAttempt_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grade` ADD CONSTRAINT `Grade_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grade` ADD CONSTRAINT `Grade_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`clerkId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacultyAttendance` ADD CONSTRAINT `FacultyAttendance_facultyId_fkey` FOREIGN KEY (`facultyId`) REFERENCES `Faculty`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
