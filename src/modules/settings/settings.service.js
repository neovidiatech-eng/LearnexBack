import * as dbService from "../../db/db.service.js";

export const changeLanguageService = async (userId, userRole, language) => {
  const isAdmin = ["admin", "super_admin"].includes(
    String(userRole).toLowerCase(),
  );
  const model = isAdmin ? "admin" : "user";

  const updatedAccount = await dbService.updateOne({
    model,
    where: { id: userId },
    data: {
      preferredLanguage: language.toLowerCase().trim(),
    },
    select: {
      id: true,
      email: true,
      preferredLanguage: true,
      updatedAt: true,
    },
  });

  return updatedAccount;
};
