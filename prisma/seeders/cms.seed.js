const appSettingsData = {
  appVersion: "1.0.0",
  logoUrl: "/uploads/logo.png",
  facebookUrl: "https://facebook.com/lms",
  instaUrl: "https://instagram.com/lms",
  websiteUrl: "https://lms.com",
  translations: [
    {
      locale: "ar",
      appName: "LMS Student",
      aboutUs:
        "منصة LMS Student هي وجهتك الأولى للتعلم الذكي عبر الإنترنت، نسعى لتوفير أفضل الدورات التدريبية في مختلف المجالات التقنية والإبداعية على يد نخبة من المحاضرين الخبراء. هدفنا هو تمكين الطلاب من اكتساب المهارات التي يتطلبها سوق العمل بأسلوب تفاعلي ومبسط.",
      copyright: "جميع الحقوق محفوظة © 2024",
    },
    {
      locale: "en",
      appName: "LMS Student",
      aboutUs:
        "LMS Student is your premier destination for smart online learning. We strive to provide top-tier training courses across tech and creative fields with elite expert instructors. Our mission is to empower students to acquire modern job market skills interactively and seamlessly.",
      copyright: "All rights reserved © 2024",
    },
  ],
};

const staticPagesData = [
  {
    slug: "privacy-policy",
    type: "GENERAL",
    translations: [
      {
        locale: "ar",
        title: "الخصوصية والأمان",
        content: `سياسة الخصوصية
نحن نهتم بخصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمعنا واستخدامنا لمعلوماتك.

جمع المعلومات
نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب أو الاشتراك في الدورات، مثل اسمك وبريدك الإلكتروني.

استخدام البيانات
نستخدم بياناتك لتحسين تجربتك التعليمية، وتوفير الدعم الفني، وإرسال تحديثات حول الدورات المشترك بها.

الأمان
نحن نستخدم إجراءات أمنية متقدمة لحماية بياناتك من الوصول غير المصرح به أو التغيير أو الإفصاح.`,
      },
      {
        locale: "en",
        title: "Privacy & Security",
        content: `Privacy Policy
We value your privacy and are committed to protecting your personal data. This policy outlines how we collect and use your information.

Information Collection
We collect information you provide directly to us when creating an account or enrolling in courses, such as your name and email.

Data Usage
We use your data to enhance your educational experience, provide technical support, and send updates regarding your courses.

Security
We employ advanced security measures to protect your data against unauthorized access, alteration, or disclosure.`,
      },
    ],
  },
  {
    slug: "teacher-terms",
    type: "TEACHER",
    translations: [
      {
        locale: "ar",
        title: "شروط الخدمة وسياسة المعلم",
        content: `شروط الخدمة وسياسة المعلم
تحدد هذه الاتفاقية الحقوق والالتزامات الخاصة بالمعلمين المنضمين لمنصة LMS، بما في ذلك معايير جودة المحتوى التعليمي، وحقوق الملكية الفكرية، وتوزيع الأرباح والعمولات، والالتزام بأوقات الجلسات التفاعلية المباشرة والتفاعل الإيجابي مع الطلاب.`,
      },
      {
        locale: "en",
        title: "Teacher Terms of Service & Policy",
        content: `Teacher Terms of Service & Policy
This agreement outlines the rights and obligations of instructors joining the LMS platform, including educational content quality standards, intellectual property rights, revenue share and payouts, and commitments to live interactive session schedules and student engagement.`,
      },
    ],
  },
];

const teacherAcademyData = [
  {
    type: "VIDEO",
    link: "https://www.youtube.com/watch?v=sample-video",
    duration: "12 دقيقة",
    order: 1,
    translations: [
      {
        locale: "ar",
        title: "كيفية إدارة جلسة تفاعلية مباشرة باحتراف",
        description: "دليل شامل لإدارة الجلسات الحية والتفاعل الفعال مع الطلاب.",
      },
      {
        locale: "en",
        title: "How to Professionally Manage a Live Interactive Session",
        description: "A comprehensive guide on managing live sessions and effectively engaging students.",
      },
    ],
  },
  {
    type: "ARTICLE",
    link: null,
    duration: "5 دقائق قراءة",
    order: 2,
    translations: [
      {
        locale: "ar",
        title: "أهم 10 نصائح لتعزيز استيعاب وتفاعل الطلاب",
        description: "نصائح عملية مجربة لزيادة تركيز الطلاب أثناء الشرح.",
      },
      {
        locale: "en",
        title: "Top 10 Tips to Boost Student Comprehension & Engagement",
        description: "Proven practical tips to increase student focus during lectures.",
      },
    ],
  },
];

export async function seedCms(prisma) {
  console.log("🌱 Seeding CMS & App Settings (Multi-language)...");

  // 1. Seed App Settings
  const existingSetting = await prisma.appSetting.findFirst({
    include: { translations: true },
  });

  if (!existingSetting) {
    await prisma.appSetting.create({
      data: {
        appVersion: appSettingsData.appVersion,
        logoUrl: appSettingsData.logoUrl,
        facebookUrl: appSettingsData.facebookUrl,
        instaUrl: appSettingsData.instaUrl,
        websiteUrl: appSettingsData.websiteUrl,
        translations: {
          create: appSettingsData.translations,
        },
      },
    });
    console.log("✅ App settings seeded with translations");
  } else {
    console.log("ℹ️ App settings already exists");
  }

  // 2. Seed Static Pages
  for (const page of staticPagesData) {
    const existing = await prisma.staticPage.findUnique({
      where: { slug: page.slug },
    });

    if (!existing) {
      await prisma.staticPage.create({
        data: {
          slug: page.slug,
          type: page.type,
          translations: {
            create: page.translations,
          },
        },
      });
    }
  }
  console.log(`✅ Seeded ${staticPagesData.length} static pages with translations`);

  // 3. Seed Teacher Academy Items
  for (const item of teacherAcademyData) {
    const existing = await prisma.teacherAcademyItem.findFirst({
      where: {
        translations: {
          some: { title: item.translations[0].title },
        },
      },
    });

    if (!existing) {
      await prisma.teacherAcademyItem.create({
        data: {
          type: item.type,
          link: item.link,
          duration: item.duration,
          order: item.order,
          translations: {
            create: item.translations,
          },
        },
      });
    }
  }
  console.log(`✅ Seeded ${teacherAcademyData.length} teacher academy items with translations`);
}
