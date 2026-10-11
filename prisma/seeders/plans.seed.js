export async function seedPlans(prisma, teachers) {
  console.log("🌱 Seeding session plans...");

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

  // Helper to extract teacher entity and user email
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

  const plansData = [];

  if (ahmed) {
    plansData.push(
      {
        teacherId: ahmed.id,
        title: "خطة البداية السريعة (3 جلسات)",
        description: "جلسات فردية مركزة لأساسيات تطوير الويب ومراجعة مشاريع HTML/CSS/JavaScript وحل المشكلات البرمجية.",
        sessionsCount: 3,
        price: 75.0,
        discountType: null,
        discountValue: null,
        color: "#2563EB",
        isActive: true,
      },
      {
        teacherId: ahmed.id,
        title: "خطة الإتقان الشاملة (6 جلسات)",
        description: "خطة متكاملة للتدريب على تقنيات React و Node.js وبناء مشروع عملي متكامل مع كود ريفيو مباشر.",
        sessionsCount: 6,
        price: 140.0,
        discountType: "PERCENTAGE",
        discountValue: 10.0,
        color: "#7C3AED",
        isActive: true,
      },
      {
        teacherId: ahmed.id,
        title: "حزمة الاحتراف والتوجيه المهني (10 جلسات)",
        description: "توجيه شامل يشمل معمارية البرمجيات المتقدمة، تحضير لمقابلات العمل التقنية، وإشراف على بناء بورتفوليو احترافي.",
        sessionsCount: 10,
        price: 220.0,
        discountType: "FIXED",
        discountValue: 30.0,
        color: "#b36c14ff",
        isActive: true,
      }
    );
  }

  if (sara) {
    plansData.push(
      {
        teacherId: sara.id,
        title: "خطة تحليل البيانات السريعة (4 جلسات)",
        description: "جلسات متخصصة لتحليل وتنظيف البيانات الكبيرة باستخدام مكتبات Python، Pandas، و NumPy مع أمثلة واقعية.",
        sessionsCount: 4,
        price: 100.0,
        discountType: null,
        discountValue: null,
        color: "#059669",
        isActive: true,
      },
      {
        teacherId: sara.id,
        title: "مسار تعلم الآلة المتقدم (8 جلسات)",
        description: "بناء وتدريب وتقييم نماذج تعلم الآلة وتطبيق الخوارزميات وتحسين دقة النماذج في بيئة إنتاجية.",
        sessionsCount: 8,
        price: 190.0,
        discountType: "PERCENTAGE",
        discountValue: 15.0,
        color: "#DC2626",
        isActive: true,
      },
      {
        teacherId: sara.id,
        title: "خطة الذكاء الاصطناعي الشاملة (12 جلسة)",
        description: "تغطية متقدمة لشبكات التعلم العميق Deep Learning ومشاريع الرؤية الحاسوبية وتطبيقات NLP باستخدام PyTorch.",
        sessionsCount: 12,
        price: 280.0,
        discountType: "FIXED",
        discountValue: 40.0,
        color: "#D97706",
        isActive: true,
      }
    );
  }

  if (omar) {
    plansData.push(
      {
        teacherId: omar.id,
        title: "خطة استشارات ومراجعة التطبيقات (3 جلسات)",
        description: "جلسات مكثفة لمراجعة كود التطبيقات وتصحيح الأخطاء وتحسين تجربة المستخدم وأداء تطبيقات الموبايل.",
        sessionsCount: 3,
        price: 85.0,
        discountType: null,
        discountValue: null,
        color: "#0284C7",
        isActive: true,
      },
      {
        teacherId: omar.id,
        title: "خطة تطوير تطبيقات Flutter المتكاملة (6 جلسات)",
        description: "بناء تطبيق موبايل متكامل بتقنية Flutter مع إدارة الحالة State Management وربط REST APIs والتعامل مع الكاش.",
        sessionsCount: 6,
        price: 160.0,
        discountType: "PERCENTAGE",
        discountValue: 10.0,
        color: "#0D9488",
        isActive: true,
      },
      {
        teacherId: omar.id,
        title: "خطة هندسة ونشر التطبيقات (10 جلسات)",
        description: "معمارية برمجية متطورة، كتابة Unit & Widget Tests، والتحضير لنشر التطبيق على متجري Google Play و Apple App Store.",
        sessionsCount: 10,
        price: 250.0,
        discountType: "FIXED",
        discountValue: 35.0,
        color: "#831843",
        isActive: true,
      },
      {
        teacherId: omar.id,
        title: "خطة الإعداد لمقابلات عمل الموبايل (2 جلسات)",
        description: "جلسات محاكاة لمقابلات العمل التقنية لمطوري الموبايل ومراجعة الخوارزميات وأسئلة النظام الشائعة.",
        sessionsCount: 2,
        price: 60.0,
        discountType: null,
        discountValue: null,
        color: "#475569",
        isActive: false,
      }
    );
  }

  // For any other teacher not explicitly listed above, seed default plans
  for (const teacher of resolvedTeachers) {
    if (
      teacher.id !== ahmed?.id &&
      teacher.id !== sara?.id &&
      teacher.id !== omar?.id
    ) {
      plansData.push(
        {
          teacherId: teacher.id,
          title: "خطة التدريب الأساسية (4 جلسات)",
          description: "جلسات فردية لمراجعة الأساسيات والتدريب العملي.",
          sessionsCount: 4,
          price: 90.0,
          discountType: null,
          discountValue: null,
          color: "#b36c14ff",
          isActive: true,
        },
        {
          teacherId: teacher.id,
          title: "خطة التطوير المتقدمة (8 جلسات)",
          description: "برنامج تدريبي متقدم مع متابعة مستمرة ومشاريع تطبيقية.",
          sessionsCount: 8,
          price: 170.0,
          discountType: "PERCENTAGE",
          discountValue: 10.0,
          color: "#4F46E5",
          isActive: true,
        }
      );
    }
  }

  const seededPlans = [];
  for (const plan of plansData) {
    const existing = await prisma.sessionPlan.findFirst({
      where: {
        teacherId: plan.teacherId,
        title: plan.title,
      },
    });

    if (existing) {
      const updated = await prisma.sessionPlan.update({
        where: { id: existing.id },
        data: plan,
      });
      seededPlans.push(updated);
    } else {
      const created = await prisma.sessionPlan.create({
        data: plan,
      });
      seededPlans.push(created);
    }
  }

  console.log(`✅ Seeded ${seededPlans.length} session plans across ${resolvedTeachers.length} teachers!`);
  return seededPlans;
}
