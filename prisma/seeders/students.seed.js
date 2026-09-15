const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const studentsData = [
  {
    email: "youssef.mahmoud@learnex.com",
    firstName: "Youssef",
    lastName: "Mahmoud",
    phone: "+201334567890",
    country: "EG",
    dateOfBirth: new Date("1998-05-15"),
    notes: "Interested in web development and UI/UX design.",
  },
  {
    email: "nour.khaled@learnex.com",
    firstName: "Nour",
    lastName: "Khaled",
    phone: "+201445678901",
    country: "EG",
    dateOfBirth: new Date("2000-09-22"),
    notes: "Aspiring data scientist passionate about AI and machine learning.",
  },
  {
    email: "karim.mostafa@learnex.com",
    firstName: "Karim",
    lastName: "Mostafa",
    phone: "+201556789012",
    country: "EG",
    dateOfBirth: new Date("1999-03-10"),
    notes: "Mobile app enthusiast looking to build his first app.",
  },
  {
    email: "aya.samy@learnex.com",
    firstName: "Aya",
    lastName: "Samy",
    phone: "+201667890123",
    country: "EG",
    dateOfBirth: new Date("2001-07-18"),
    notes: "Creative student interested in UI/UX and graphic design.",
  },
  {
    email: "hassan.fathy@learnex.com",
    firstName: "Hassan",
    lastName: "Fathy",
    phone: "+201778901234",
    country: "EG",
    dateOfBirth: new Date("1997-11-30"),
    notes: "Cybersecurity enthusiast aiming for ethical hacking certifications.",
  },
];

async function seedStudents(roles) {
  console.log("🌱 Seeding students...");

  const studentRole = roles.find((r) => r.name === "STUDENT");
  const hashedPassword = await bcrypt.hash("Student@123456", 10);

  const students = [];
  for (const s of studentsData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        password: hashedPassword,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        country: s.country,
        status: "ACTIVE",
        confirmEmail: new Date(),
        roleId: studentRole?.id ?? null,
        student: {
          create: {
            dateOfBirth: s.dateOfBirth,
            notes: s.notes,
          },
        },
      },
      include: { student: true },
    });
    students.push(user);
  }

  console.log(`✅ Seeded ${students.length} students`);
  return students;
}

module.exports = { seedStudents };
