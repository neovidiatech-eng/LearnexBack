export const requestTabEnum = Object.freeze({
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
  WITHDRAWAL: "WITHDRAWAL",
});


export const requestTypeEnum = Object.freeze({
  // Teacher Requests
  BECOME_INSTRUCTOR: "BECOME_INSTRUCTOR",
  COURSE_APPROVAL: "COURSE_APPROVAL",
  COURSE_UPDATE: "COURSE_UPDATE",
  VERIFICATION: "VERIFICATION",
  PROFILE_UPDATE: "PROFILE_UPDATE",
  SUPPORT: "SUPPORT",

  // Student Requests
  COURSE_ENROLLMENT: "COURSE_ENROLLMENT",
  REFUND_REQUEST: "REFUND_REQUEST",
  CERTIFICATE_REQUEST: "CERTIFICATE_REQUEST",
  SESSION_BOOKING: "SESSION_BOOKING",

  // Withdrawal Requests
  WITHDRAWAL_PAYOUT: "WITHDRAWAL_PAYOUT",
});


export const requestPriorityEnum = Object.freeze({
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
});


export const requestStatusEnum = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  IN_REVIEW: "IN_REVIEW",
  CANCELLED: "CANCELLED",
});


export const requestReferenceModelEnum = Object.freeze({
  TEACHER: "Teacher",
  TEACHER_COURSE: "TeacherCourse",
  TEACHER_CERTIFICATE: "TeacherCertificate",
  COURSE: "Course",
  COURSE_ENROLLMENT: "CourseEnrollment",
  TRANSACTION: "Transaction",
  WALLET: "wallet",
  SESSION_REQUEST: "SessionRequest",
  USER: "User",
});
