export async function seedCarts(prisma, students, courses) {
  console.log("🌱 Seeding carts and cart items...");
  try {
    // Each student gets a cart with 2-3 course items
    const cartData = [
      {
        studentIndex: 0,
        items: [
          { type: "COURSE", courseIndex: 1 },
          { type: "COURSE", courseIndex: 2 },
        ],
      },
      {
        studentIndex: 1,
        items: [
          { type: "COURSE", courseIndex: 0 },
          { type: "COURSE", courseIndex: 2 },
        ],
      },
      {
        studentIndex: 2,
        items: [
          { type: "COURSE", courseIndex: 0 },
          { type: "COURSE", courseIndex: 1 },
        ],
      },
      {
        studentIndex: 3,
        items: [
          { type: "COURSE", courseIndex: 1 },
          { type: "COURSE", courseIndex: 2 },
        ],
      },
      {
        studentIndex: 4,
        items: [
          { type: "COURSE", courseIndex: 0 },
          { type: "COURSE", courseIndex: 1 },
          { type: "COURSE", courseIndex: 2 },
        ],
      },
    ];

    let totalCarts = 0;
    let totalItems = 0;

    for (const entry of cartData) {
      const student = students[entry.studentIndex];
      if (!student) continue;

      const existingCart = await prisma.cart.findUnique({
        where: { userId: student.id },
      }).catch(() => null);

      if (existingCart) {
        console.log(`  ⏭️  Cart already exists for ${student.fullName}, skipping`);
        continue;
      }

      const items = entry.items
        .map(({ type, courseIndex }) => {
          const course = courses[courseIndex];
          if (!course) return null;
          return { type, itemId: course.id };
        })
        .filter(Boolean);

      const totalPrice = entry.items.reduce((sum, { courseIndex }) => {
        const course = courses[courseIndex];
        if (!course) return sum;
        const price = course.salePrice ?? course.originalPrice ?? 0;
        return sum + Number(price);
      }, 0);

      const cart = await prisma.cart.create({
        data: {
          userId: student.id,
          totalItems: items.length,
          totalPrice: Math.round(totalPrice),
          cartItems: {
            create: items.map((item) => ({
              type: item.type,
              itemId: item.itemId,
            })),
          },
        },
        include: { cartItems: true },
      });

      totalCarts++;
      totalItems += cart.cartItems.length;
      console.log(`  🛒 Created cart for ${student.fullName} with ${cart.cartItems.length} items`);
    }

    console.log(`✅ Seeded ${totalCarts} carts with ${totalItems} cart items`);
  } catch (err) {
    console.log("⚠️ Skipping cart seed:", err.message);
  }
}
