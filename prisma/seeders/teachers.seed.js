const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const teachersData = [
  {
    email: "ahmed.hassan@learnex.com",
    firstName: "Ahmed",
    lastName: "Hassan",
    phone: "+201001234567",
    country: "EG",
    subject: "Web Development",
    experienceYears: 7,
    bio: "Senior full-stack developer with 7 years of experience in React and Node.js. Passionate about teaching modern web technologies.",
    linkedinUrl: "https://linkedin.com/in/ahmed-hassan",
  },
  {
    email: "sara.ibrahim@learnex.com",
    firstName: "Sara",
    lastName: "Ibrahim",
    phone: "+201112345678",
    country: "EG",
    subject: "Data Science",
    experienceYears: 5,
    bio: "Data scientist and ML engineer with expertise in Python and TensorFlow. Loves turning data into insights.",
    linkedinUrl: "https://linkedin.com/in/sara-ibrahim",
  },
  {
    email: "omar.ali@learnex.com",
    firstName: "Omar",
    lastName: "Ali",
    phone: "+201223456789",
    country: "EG",
    subject: "Mobile Development",
    experienceYears: 6,
    bio: "Mobile developer specializing in React Native and Flutter. Built over 20 production apps.",
    linkedinUrl: "https://linkedin.com/in/omar-ali",
  },
];

async function seedTeachers(roles) {
  console.log("🌱 Seeding teachers...");

  const teacherRole = roles.find((r) => r.name === "TEACHER");
  const hashedPassword = await bcrypt.hash("Teacher@123456", 10);

  const teachers = [];
  for (const t of teachersData) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        email: t.email,
        password: hashedPassword,
        firstName: t.firstName,
        lastName: t.lastName,
        phone: t.phone,
        country: t.country,
        status: "ACTIVE",
        confirmEmail: new Date(),
        roleId: teacherRole?.id ?? null,
        teacher: {
          create: {
            subject: t.subject,
            experienceYears: t.experienceYears,
            bio: t.bio,
            linkedinUrl: t.linkedinUrl,
          },
        },
      },
      include: { teacher: true },
    });
    teachers.push(user);
  }

  console.log(`✅ Seeded ${teachers.length} teachers`);
  return teachers;
}

module.exports = { seedTeachers };
