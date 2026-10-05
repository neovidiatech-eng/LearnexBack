export async function seedSaved(prisma, students, courses) {
  console.log("🌱 Seeding saved items...");

  const savedData = [
    {
      // Youssef → Web Dev course
      studentIndex: 0,
      items: [
        { itemType: "COURSE", courseIndex: 0 },
      ],
    },
    {
      // Nour → Data Science course
      studentIndex: 1,
      items: [
        { itemType: "COURSE", courseIndex: 1 },
      ],
    },
    {
      // Karim → Mobile Dev course
      studentIndex: 2,
      items: [
        { itemType: "COURSE", courseIndex: 2 },
      ],
    },
    {
      // Aya → Web Dev & Mobile Dev courses
      studentIndex: 3,
      items: [
        { itemType: "COURSE", courseIndex: 0 },
        { itemType: "COURSE", courseIndex: 2 },
      ],
    },
    {
      // Hassan → Data Science course
      studentIndex: 4,
      items: [
        { itemType: "COURSE", courseIndex: 1 },
      ],
    },
  ];

  let totalSaved = 0;

  for (const entry of savedData) {
    const student = students[entry.studentIndex];
    if (!student) continue;

    for (const item of entry.items) {
      const course = courses[item.courseIndex];
      if (!course) continue;

      const existing = await prisma.saved.findFirst({
        where: {
          studentId: student.id,
          itemId: course.id,
        },
      });

      if (existing) {
        continue;
      }

      await prisma.saved.create({
        data: {
          studentId: student.id,
          itemId: course.id,
          itemType: item.itemType,
        },
      });

      totalSaved++;
      console.log(`  🔖 Saved course "${course.slug || course.id}" for ${student.fullName}`);
    }
  }

  console.log(`✅ Seeded ${totalSaved} saved items`);
}
