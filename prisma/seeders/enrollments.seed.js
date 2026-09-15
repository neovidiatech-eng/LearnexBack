export async function seedEnrollments(prisma, students, courses) {
  console.log("🌱 Seeding enrollments...");

  // Each student enrolls in specific courses
  const enrollmentsData = [
    // Youssef - Web Dev & Mobile
    { studentId: students[0].id, courseId: courses[0].id, paidAmount: 149.99, progressPercent: 45.0 },
    { studentId: students[0].id, courseId: courses[2].id, paidAmount: 0, progressPercent: 20.0 },

    // Nour - Data Science & Web Dev
    { studentId: students[1].id, courseId: courses[1].id, paidAmount: 199.99, progressPercent: 80.0 },
    { studentId: students[1].id, courseId: courses[0].id, paidAmount: 149.99, progressPercent: 60.0 },

    // Karim - Mobile & Web Dev
    { studentId: students[2].id, courseId: courses[2].id, paidAmount: 0, progressPercent: 100.0, status: "COMPLETED", completedAt: new Date() },
    { studentId: students[2].id, courseId: courses[0].id, paidAmount: 149.99, progressPercent: 30.0 },

    // Aya - Web Dev
    { studentId: students[3].id, courseId: courses[0].id, paidAmount: 149.99, progressPercent: 15.0 },

    // Hassan - Data Science
    { studentId: students[4].id, courseId: courses[1].id, paidAmount: 199.99, progressPercent: 55.0 },
  ];

  const enrollments = [];
  for (const enrollment of enrollmentsData) {
    const created = await prisma.courseEnrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
        },
      },
      update: {},
      create: {
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        status: enrollment.status ?? "ACTIVE",
        paidAmount: enrollment.paidAmount,
        progressPercent: enrollment.progressPercent,
        completedAt: enrollment.completedAt ?? null,
      },
    });
    enrollments.push(created);
  }

  console.log(`✅ Seeded ${enrollments.length} enrollments`);
  return enrollments;
}