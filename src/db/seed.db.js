import * as DBService from "./db.service.js";
import { generateHash } from "../utils/security/hash.security.js";

export const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || "admin@learnx.com";
    const password = process.env.ADMIN_PASSWORD || "Password@123!";
    const fullName = process.env.ADMIN_NAME || "Super Admin";

    const hashPassword = await generateHash({ plainText: password });

    const existingAdmin = await DBService.findFirst({
      model: "admin",
      where: { email },
    });

    if (!existingAdmin) {
      await DBService.create({
        model: "admin",
        data: {
          email,
          fullName,
          password: hashPassword,
        },
      });
      console.log(` Default Admin created successfully: ${email}`);
    } else {
      // Sync password with .env so it always matches Password@123!
      await DBService.updateOne({
        model: "admin",
        where: { email },
        data: {
          password: hashPassword,
          fullName,
        },
      });
      console.log(` Default Admin credentials synced with .env: ${email}`);
    }
  } catch (error) {
    console.error(" Failed to seed/sync default admin:", error.message);
  }
};
