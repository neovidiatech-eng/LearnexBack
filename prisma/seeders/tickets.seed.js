
import bcrypt from "bcryptjs";
import {
  SupportTicketPriority,
  SupportTicketStatus,
} from "../../src/utils/Enums/tickets.enum.js";

const SUPPORT_EMAIL = "support.agent@learnex.com";
const SUPPORT_PASSWORD = "Support@123456";

const hoursAgo = (hours) =>
  new Date(Date.now() - hours * 60 * 60 * 1000);

const daysAgo = (days) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const makeAttachment = (fileName, mimeType, size, storageKey) => ({
  fileName,
  mimeType,
  size,
  storageKey: `seed-support/${storageKey}`,
});

const getEnumValue = (enumObject, candidates, fallback) => {
  for (const candidate of candidates) {
    if (enumObject?.[candidate] !== undefined) {
      return enumObject[candidate];
    }
  }

  return fallback;
};

export async function seedTickets(prisma, teachers = [], staffUser = null) {
  console.log("🌱 Seeding support tickets...");

  const status = {
    OPEN: getEnumValue(SupportTicketStatus, ["OPEN"], "OPEN"),
    IN_PROGRESS: getEnumValue(
      SupportTicketStatus,
      ["IN_PROGRESS"],
      "IN_PROGRESS",
    ),
    WAITING: getEnumValue(
      SupportTicketStatus,
      ["WAITING_FOR_TEACHER", "WAITING_FOR_USER", "WAITING"],
      "OPEN",
    ),
    RESOLVED: getEnumValue(
      SupportTicketStatus,
      ["RESOLVED"],
      "RESOLVED",
    ),
    CLOSED: getEnumValue(
      SupportTicketStatus,
      ["CLOSED"],
      "CLOSED",
    ),
  };

  const priority = {
    LOW: getEnumValue(SupportTicketPriority, ["LOW"], "LOW"),
    NORMAL: getEnumValue(
      SupportTicketPriority,
      ["NORMAL", "MEDIUM"],
      "NORMAL",
    ),
    HIGH: getEnumValue(SupportTicketPriority, ["HIGH"], "HIGH"),
    URGENT: getEnumValue(
      SupportTicketPriority,
      ["URGENT", "CRITICAL"],
      "HIGH",
    ),
  };

  // 1. Fetch teachers. A ticket owner is always a User.
  const teacherRecords =
    teachers.length > 0
      ? teachers
      : await prisma.teacher.findMany({
          include: { user: true },
        });

  const teacherList = teacherRecords
    .map((teacher) => {
      if (teacher.userId) {
        return {
          userId: teacher.userId,
          user: teacher.user,
          name: teacher.user?.fullName || "Teacher",
        };
      }
      return {
        userId: teacher.id,
        user: teacher,
        name: teacher.fullName || "Teacher",
      };
    })
    .filter((teacher) => teacher.userId);

  // 2. Fetch students.
  const studentList = await prisma.user.findMany({
    where: {
      role: {
        roleTranslations: {
          some: {
            name: "STUDENT",
          },
        },
      },
    },
  });

  if (!teacherList.length && !studentList.length) {
    console.warn("⚠️ No teachers or students found.");
    return [];
  }

  // 3. Resolve or create the support staff account.
  let staff = staffUser;

  if (!staff) {
    let adminRole = await prisma.role.findFirst({
      where: {
        roleTranslations: {
          some: {
            name: "ADMIN",
            lang: "en",
          },
        },
      },
    });

    if (!adminRole) {
      adminRole = await prisma.role.findFirst({
        where: { slug: "admin" },
      });
    }

    if (!adminRole) {
      throw new Error(
        "Cannot seed tickets: ADMIN role was not found. Seed roles first.",
      );
    }

    const hashedPassword = await bcrypt.hash(SUPPORT_PASSWORD, 10);

    staff = await prisma.user.upsert({
      where: { email: SUPPORT_EMAIL },
      update: {},
      create: {
        email: SUPPORT_EMAIL,
        fullName: "Support Agent",
        password: hashedPassword,
        status: "ACTIVE",
        roleId: adminRole.id,
      },
    });
  }

  if (!staff?.id) {
    throw new Error("Support staff user was not resolved.");
  }

  const teacher1 = teacherList[0];
  const teacher2 = teacherList[1] || teacher1;
  const teacher3 = teacherList[2] || teacher1;

  const student1 = studentList[0];
  const student2 = studentList[1] || student1;

  const presets = [];

  const addTicket = ({
    userId,
    subject,
    status: ticketStatus,
    priority: ticketPriority,
    assignedStaffId = staff.id,
    createdAt,
    resolvedAt = null,
    closedAt = null,
    messages,
  }) => {
    if (!userId || !subject || !messages?.length) {
      return;
    }

    const lastMessage = messages[messages.length - 1];

    presets.push({
      userId,
      subject,
      status: ticketStatus,
      priority: ticketPriority,
      assignedStaffId,
      createdAt,
      lastMessageAt: lastMessage.createdAt,
      resolvedAt,
      closedAt,
      messages,
    });
  };

  // 4. Teacher tickets.
  if (teacher1) {
    addTicket({
      userId: teacher1.userId,
      subject: "Payout inquiry for completed sessions",
      status: status.IN_PROGRESS,
      priority: priority.HIGH,
      createdAt: daysAgo(3),
      messages: [
        {
          senderId: teacher1.userId,
          body: "My payout statement has not been updated. Could you check the transaction status?",
          createdAt: daysAgo(3),
          attachments: [
            makeAttachment(
              "payout-summary.pdf",
              "application/pdf",
              245000,
              "teacher-payout-summary.pdf",
            ),
          ],
        },
        {
          senderId: staff.id,
          body: "Our team is verifying the transfer. We will update you after confirmation.",
          createdAt: hoursAgo(4),
          attachments: [],
        },
      ],
    });

    addTicket({
      userId: teacher1.userId,
      subject: "Audio and video latency during live sessions",
      status: status.OPEN,
      priority: priority.URGENT,
      assignedStaffId: null,
      createdAt: hoursAgo(2),
      messages: [
        {
          senderId: teacher1.userId,
          body: "Students reported audio delay and frozen video during my live session.",
          createdAt: hoursAgo(2),
          attachments: [
            makeAttachment(
              "network-diagnostics.txt",
              "text/plain",
              42100,
              "teacher-network-diagnostics.txt",
            ),
          ],
        },
      ],
    });

    addTicket({
      userId: teacher1.userId,
      subject: "Request to add a new course module",
      status: status.RESOLVED,
      priority: priority.NORMAL,
      createdAt: daysAgo(7),
      resolvedAt: daysAgo(1),
      messages: [
        {
          senderId: teacher1.userId,
          body: "I would like to add a Docker and Microservices module to my course.",
          createdAt: daysAgo(7),
          attachments: [
            makeAttachment(
              "module-syllabus.pdf",
              "application/pdf",
              104500,
              "teacher-module-syllabus.pdf",
            ),
          ],
        },
        {
          senderId: staff.id,
          body: "The module proposal has been reviewed and approved.",
          createdAt: daysAgo(1),
          attachments: [],
        },
      ],
    });
  }

  if (teacher2) {
    addTicket({
      userId: teacher2.userId,
      subject: "Student attendance dispute",
      status: status.WAITING,
      priority: priority.HIGH,
      createdAt: daysAgo(2),
      messages: [
        {
          senderId: teacher2.userId,
          body: "A student requested a refund, but our attendance records show they attended the session.",
          createdAt: daysAgo(2),
          attachments: [
            makeAttachment(
              "attendance-log.csv",
              "text/csv",
              15400,
              "teacher-attendance-log.csv",
            ),
          ],
        },
        {
          senderId: staff.id,
          body: "We are reviewing the attendance records. Please provide any additional evidence if available.",
          createdAt: hoursAgo(6),
          attachments: [],
        },
      ],
    });
  }

  if (teacher3) {
    addTicket({
      userId: teacher3.userId,
      subject: "Course asset upload error",
      status: status.IN_PROGRESS,
      priority: priority.HIGH,
      createdAt: daysAgo(2),
      messages: [
        {
          senderId: teacher3.userId,
          body: "Uploading course assets fails with a Payload Too Large error.",
          createdAt: daysAgo(2),
          attachments: [
            makeAttachment(
              "upload-error.png",
              "image/png",
              278000,
              "teacher-upload-error.png",
            ),
          ],
        },
        {
          senderId: staff.id,
          body: "We are investigating the upload limit and will provide an update.",
          createdAt: hoursAgo(3),
          attachments: [],
        },
      ],
    });
  }

  // 5. Student tickets.
  if (student1) {
    addTicket({
      userId: student1.id,
      subject: "Refund request for incomplete course",
      status: status.IN_PROGRESS,
      priority: priority.HIGH,
      createdAt: daysAgo(3),
      messages: [
        {
          senderId: student1.id,
          body: "The course content appears incomplete. I would like the support team to review my refund request.",
          createdAt: daysAgo(3),
          attachments: [
            makeAttachment(
              "course-receipt.pdf",
              "application/pdf",
              215000,
              "student-course-receipt.pdf",
            ),
          ],
        },
        {
          senderId: staff.id,
          body: "We will investigate the course status and review your request.",
          createdAt: daysAgo(2),
          attachments: [],
        },
        {
          senderId: student1.id,
          body: "Thank you. I will wait for your update.",
          createdAt: hoursAgo(4),
          attachments: [],
        },
      ],
    });

    addTicket({
      userId: student1.id,
      subject: "Unable to access a purchased course",
      status: status.OPEN,
      priority: priority.NORMAL,
      assignedStaffId: null,
      createdAt: hoursAgo(1),
      messages: [
        {
          senderId: student1.id,
          body: "I purchased a course, but it does not appear in my learning dashboard.",
          createdAt: hoursAgo(1),
          attachments: [],
        },
      ],
    });
  }

  if (student2) {
    addTicket({
      userId: student2.id,
      subject: "Certificate download issue",
      status: status.RESOLVED,
      priority: priority.LOW,
      createdAt: daysAgo(5),
      resolvedAt: daysAgo(2),
      messages: [
        {
          senderId: student2.id,
          body: "I completed my course, but I cannot download the certificate.",
          createdAt: daysAgo(5),
          attachments: [],
        },
        {
          senderId: staff.id,
          body: "The certificate is now available on your course completion page.",
          createdAt: daysAgo(2),
          attachments: [],
        },
      ],
    });
  }

  // 6. Create tickets without deleting existing support data.
  const createdTickets = [];
  let skippedTickets = 0;

  for (const preset of presets) {
    const existingTicket = await prisma.supportTicket.findFirst({
      where: {
        userId: preset.userId,
        subject: preset.subject,
      },
      select: { id: true },
    });

    if (existingTicket) {
      skippedTickets++;
      continue;
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: preset.userId,
        subject: preset.subject,
        status: preset.status,
        priority: preset.priority,
        assignedStaffId: preset.assignedStaffId,
        createdAt: preset.createdAt,
        lastMessageAt: preset.lastMessageAt,
        resolvedAt: preset.resolvedAt,
        closedAt: preset.closedAt,

        supportMessages: {
          create: preset.messages.map((message) => ({
            senderId: message.senderId,
            body: message.body,
            createdAt: message.createdAt,

            attachments: {
              create: (message.attachments || []).map((attachment) => ({
                fileName: attachment.fileName,
                storageKey: `${attachment.storageKey}-${Math.random().toString(36).substring(2, 7)}`,
                mimeType: attachment.mimeType,
                size: attachment.size,
                createdAt: message.createdAt,
              })),
            },
          })),
        },
      },
      include: {
        supportMessages: {
          include: {
            attachments: true,
          },
        },
      },
    });

    createdTickets.push(ticket);
  }

  console.log(`✅ Created ${createdTickets.length} support tickets.`);
  console.log(`⏭️ Skipped ${skippedTickets} existing tickets.`);

  return createdTickets;
}

// Standalone execution.
async function standalone() {
  await import("dotenv/config");

  const { PrismaClient } = await import("@prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const pgModule = await import("pg");
  const Pool = pgModule.Pool || pgModule.default?.Pool;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: true,
      },
    });

    await seedTickets(prisma, teachers);
  } catch (error) {
    console.error("❌ Tickets seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

if (process.argv[1]?.includes("tickets.seed.js")) {
  standalone();
}
