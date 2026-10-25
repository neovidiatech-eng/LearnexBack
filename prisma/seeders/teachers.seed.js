import bcrypt from "bcryptjs";

const teachersData = [
  {
    email: "elsayedatef469@gmail.com",
    fullName: "MR Sayed",
    password: "01023888997Aa@",
    phone: "+201023888997",
    country: "EG",
    subject: "Computer Science & Software Engineering",
    experienceYears: 8,
    sessionPrice50Min: 150.0,
    bio: "خبير تعليمي واستشاري هندسة البرمجيات وتطوير النظم وتطبيقات الموبايل. شغوف بتمكين الطلاب ونقل الخبرة العملية وبناء الكفاءات البرمجية المتقدمة.",
    linkedinUrl: "https://linkedin.com/in/elsayed-atef",
  },
  {
    email: "ahmed.hassan@learnex.com",
    fullName: "Ahmed Hassan",
    password: "Teacher@123456",
    phone: "+201001234567",
    country: "EG",
    subject: "Web Development",
    experienceYears: 7,
    sessionPrice50Min: 60.0,
    bio: "Senior full-stack developer with 7 years of experience in React and Node.js. Passionate about teaching modern web technologies.",
    linkedinUrl: "https://linkedin.com/in/ahmed-hassan",
  },
  {
    email: "sara.ibrahim@learnex.com",
    fullName: "Sara Ibrahim",
    password: "Teacher@123456",
    phone: "+201112345678",
    country: "EG",
    subject: "Data Science",
    experienceYears: 5,
    sessionPrice50Min: 75.0,
    bio: "Data scientist and ML engineer with expertise in Python and TensorFlow. Loves turning data into insights.",
    linkedinUrl: "https://linkedin.com/in/sara-ibrahim",
  },
  {
    email: "omar.ali@learnex.com",
    fullName: "Omar Ali",
    password: "Teacher@123456",
    phone: "+201223456789",
    country: "EG",
    subject: "Mobile Development",
    experienceYears: 6,
    sessionPrice50Min: 50.0,
    bio: "Mobile developer specializing in React Native and Flutter. Built over 20 production apps.",
    linkedinUrl: "https://linkedin.com/in/omar-ali",
  },
];

export async function seedTeachers(prisma, roles) {
  console.log("🌱 Seeding teachers...");

  const teacherRole = roles.find((r) => r.name === "TEACHER");

  const teachers = [];
  for (const t of teachersData) {
    const passwordToHash = t.password || "Teacher@123456";
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    const teacherProfileData = {
      subject: t.subject,
      headline: `${t.subject} Instructor`,
      bio: t.bio,
      experienceYears: t.experienceYears,
      sessionPrice50Min: t.sessionPrice50Min,
      currency: "EGP",
      linkedinUrl: t.linkedinUrl,
    };

    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {
        fullName: t.fullName,
        password: hashedPassword,
        phone: t.phone,
        status: "ACTIVE",
        confirmEmail: true,
        roleId: teacherRole?.id ?? null,
        teacher: {
          upsert: {
            create: teacherProfileData,
            update: teacherProfileData,
          },
        },
      },
      create: {
        email: t.email,
        password: hashedPassword,
        fullName: t.fullName,
        phone: t.phone,
        country: t.country,
        status: "ACTIVE",
        confirmEmail: true,
        roleId: teacherRole?.id ?? null,
        teacher: {
          create: teacherProfileData,
        },
      },
      include: { teacher: true },
    });
    teachers.push(user);
  }

  console.log(`✅ Seeded ${teachers.length} teachers`);
  return teachers;
}
