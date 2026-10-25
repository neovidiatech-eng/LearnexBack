export async function seedEnrollments(prisma, students, courses, teacherCourses = []) {
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

  // Teacher course enrollments
  let tCourses = teacherCourses;
  if (!tCourses || tCourses.length === 0) {
    tCourses = await prisma.teacherCourse.findMany({ take: 5 }).catch(() => []);
  }

  if (tCourses.length > 0 && students.length > 0) {
    const teacherEnrollmentsData = [
      {
        studentId: students[0].id,
        courseId: tCourses[0].id,
        paidAmount: Number(tCourses[0].price || 0),
        progressPercent: 35.0,
        status: "ACTIVE",
      },
      ...(tCourses[1] && students[1]
        ? [
            {
              studentId: students[1].id,
              courseId: tCourses[1].id,
              paidAmount: Number(tCourses[1].price || 0),
              progressPercent: 70.0,
              status: "ACTIVE",
            },
          ]
        : []),
      ...(tCourses[2] && students[2]
        ? [
            {
              studentId: students[2].id,
              courseId: tCourses[2].id,
              paidAmount: Number(tCourses[2].price || 0),
              progressPercent: 100.0,
              status: "COMPLETED",
              completedAt: new Date(),
            },
          ]
        : []),
    ];

    for (const te of teacherEnrollmentsData) {
      await prisma.teacherCourseEnrollment.upsert({
        where: {
          studentId_courseId: {
            studentId: te.studentId,
            courseId: te.courseId,
          },
        },
        update: {},
        create: {
          studentId: te.studentId,
          courseId: te.courseId,
          status: te.status,
          paidAmount: te.paidAmount,
          progressPercent: te.progressPercent,
          completedAt: te.completedAt ?? null,
        },
      }).catch(() => {});
    }
  }

  console.log(`✅ Seeded ${enrollments.length} platform course enrollments and teacher course enrollments`);
  return enrollments;
}