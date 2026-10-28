import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import {
  CertificateType,
  CertificateStatus,
} from "../../src/utils/Enums/teacherCertificate.enum.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

export async function seedCertificates(prisma, teachers = []) {
  console.log("🌱 Seeding teacher certificates...");

  let teacherList = teachers;
  if (!teacherList || teacherList.length === 0) {
    teacherList = await prisma.teacher.findMany({
      include: {
        user: {
          select: { email: true, fullName: true },
        },
      },
    });
  }

  const resolveTeacher = (t) => {
    if (t.teacher) {
      return {
        id: t.teacher.id,
        email: t.email,
        name: t.fullName,
      };
    }
    return {
      id: t.id,
      email: t.user?.email,
      name: t.user?.fullName,
    };
  };

  const resolvedTeachers = teacherList.map(resolveTeacher);

  const ahmed = resolvedTeachers.find((t) => t.email === "ahmed.hassan@learnex.com");
  const sara = resolvedTeachers.find((t) => t.email === "sara.ibrahim@learnex.com");
  const omar = resolvedTeachers.find((t) => t.email === "omar.ali@learnex.com");
  const sayed = resolvedTeachers.find((t) => t.email === "elsayedatef469@gmail.com");

  const certificatesData = [];

  // Ahmed Hassan (Web Development)
  if (ahmed) {
    certificatesData.push(
      {
        teacherId: ahmed.id,
        type: CertificateType.ACADEMIC,
        title: "B.Sc. in Computer Science",
        issuer: "Cairo University - Faculty of Computers & AI",
        issueYear: 2018,
        fileUrl: "/uploads/certificates/seed-ahmed-degree.pdf",
        fileType: "application/pdf",
        fileSize: "2.4 MB",
        status: CertificateStatus.VERIFIED,
        rejectionReason: null,
      },
      {
        teacherId: ahmed.id,
        type: CertificateType.COURSE,
        title: "Full-Stack Web Developer Nanodegree",
        issuer: "Udacity",
        issueYear: 2020,
        fileUrl: "/uploads/certificates/seed-ahmed-fullstack.pdf",
        fileType: "application/pdf",
        fileSize: "1.1 MB",
        status: CertificateStatus.VERIFIED,
        rejectionReason: null,
      },
      {
        teacherId: ahmed.id,
        type: CertificateType.EXPERIENCE,
        title: "Senior React & Node.js Developer Certificate",
        issuer: "Meta Staff Engineering Portal",
        issueYear: 2022,
        fileUrl: "/uploads/certificates/seed-ahmed-meta.pdf",
        fileType: "application/pdf",
        fileSize: "850 KB",
        status: CertificateStatus.PENDING,
        rejectionReason: null,
      }
    );
  }

  // Sara Ibrahim (Data Science & ML)
  if (sara) {
    certificatesData.push(
      {
        teacherId: sara.id,
        type: CertificateType.ACADEMIC,
        title: "M.Sc. in Data Science & Machine Learning",
        issuer: "Alexandria University",
        issueYear: 2021,
        fileUrl: "/uploads/certificates/seed-sara-msc.pdf",
        fileType: "application/pdf",
        fileSize: "3.2 MB",
        status: CertificateStatus.VERIFIED,
        rejectionReason: null,
      },
      {
        teacherId: sara.id,
        type: CertificateType.COURSE,
        title: "Deep Learning Specialization",
        issuer: "DeepLearning.AI / Coursera",
        issueYear: 2022,
        fileUrl: "/uploads/certificates/seed-sara-deeplearning.pdf",
        fileType: "application/pdf",
        fileSize: "1.5 MB",
        status: CertificateStatus.PENDING,
        rejectionReason: null,
      },
      {
        teacherId: sara.id,
        type: CertificateType.OTHER,
        title: "TensorFlow Developer Certificate",
        issuer: "Google Developers Certification",
        issueYear: 2023,
        fileUrl: "/uploads/certificates/seed-sara-tensorflow.pdf",
        fileType: "application/pdf",
        fileSize: "920 KB",
        status: CertificateStatus.VERIFIED,
        rejectionReason: null,
      }
    );
  }

  // Omar Ali (Mobile Development)
  if (omar) {
    certificatesData.push(
      {
        teacherId: omar.id,
        type: CertificateType.ACADEMIC,
        title: "B.Sc. in Software Engineering",
        issuer: "Ain Shams University",
        issueYear: 2019,
        fileUrl: "/uploads/certificates/seed-omar-degree.pdf",
        fileType: "application/pdf",
        fileSize: "2.1 MB",
        status: CertificateStatus.VERIFIED,
        rejectionReason: null,
      },
      {
        teacherId: omar.id,
        type: CertificateType.COURSE,
        title: "Advanced Flutter & Dart Masterclass",
        issuer: "Udemy Academy",
        issueYear: 2021,
        fileUrl: "/uploads/certificates/seed-omar-flutter.pdf",
        fileType: "application/pdf",
        fileSize: "1.3 MB",
        status: CertificateStatus.REJECTED,
        rejectionReason: "Credential verification link expired or issuer unverified. Please upload updated copy.",
      },
      {
        teacherId: omar.id,
        type: CertificateType.EXPERIENCE,
        title: "Senior Mobile Engineer Professional Credential",
        issuer: "Vodafone Digital Services",
        issueYear: 2023,
        fileUrl: "/uploads/certificates/seed-omar-vodafone.pdf",
        fileType: "application/pdf",
        fileSize: "750 KB",
        status: CertificateStatus.PENDING,
        rejectionReason: null,
      }
    );
  }

  // MR Sayed (Computer Science & Software Engineering)
  if (sayed) {
    certificatesData.push(
      {
        teacherId: sayed.id,
        type: CertificateType.ACADEMIC,
        title: "Master of Science in Software Architecture",
        issuer: "Cairo University - Faculty of Engineering",
        issueYear: 2017,
        fileUrl: "/uploads/certificates/seed-sayed-masters.pdf",
        fileType: "application/pdf",
        fileSize: "4.1 MB",
        status: CertificateStatus.VERIFIED,
        rejectionReason: null,
      },
      {
        teacherId: sayed.id,
        type: CertificateType.OTHER,
        title: "AWS Certified Solutions Architect - Professional",
        issuer: "Amazon Web Services (AWS)",
        issueYear: 2021,
        fileUrl: "/uploads/certificates/seed-sayed-aws.pdf",
        fileType: "application/pdf",
        fileSize: "1.8 MB",
        status: CertificateStatus.VERIFIED,
        rejectionReason: null,
      },
      {
        teacherId: sayed.id,
        type: CertificateType.EXPERIENCE,
        title: "Lead Software Architect & Engineering Consultant",
        issuer: "IEEE Computer Society",
        issueYear: 2023,
        fileUrl: "/uploads/certificates/seed-sayed-ieee.pdf",
        fileType: "application/pdf",
        fileSize: "1.4 MB",
        status: CertificateStatus.VERIFIED,
        rejectionReason: null,
      }
    );
  }

  const seededCertificates = [];
  for (const certData of certificatesData) {
    const existing = await prisma.teacherCertificate.findFirst({
      where: {
        teacherId: certData.teacherId,
        title: certData.title,
        issuer: certData.issuer,
      },
    });

    if (existing) {
      const updated = await prisma.teacherCertificate.update({
        where: { id: existing.id },
        data: certData,
      });
      seededCertificates.push(updated);
    } else {
      const created = await prisma.teacherCertificate.create({
        data: certData,
      });
      seededCertificates.push(created);
    }
  }

  console.log(`✅ Seeded ${seededCertificates.length} teacher certificates across ${resolvedTeachers.length} teachers!`);
  return seededCertificates;
}

async function standalone() {
  const { PrismaClient } = await import("@prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { default: pg } = await import("pg");

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("🚀 Starting standalone certificates seeder...\n");
    await seedCertificates(prisma);
    console.log("\n🎉 Certificates seeding completed successfully!");
  } catch (err) {
    console.error("❌ Certificates seeding failed:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

if (process.argv[1]?.includes("certificates.seed.js")) {
  standalone();
}
