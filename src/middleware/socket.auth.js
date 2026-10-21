
import { baseRoleEnum } from "../utils/Enums/role.enum.js";
import { tokenTypeEnum } from "../utils/Enums/token.enum.js";
import { decodedToken } from "../utils/security/token.security.js";

export const chatSocketAuthentication = async (socket, next) => {
  try {
    const rawToken =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization;

    if (typeof rawToken !== "string" || !rawToken.trim()) {
      return next(new Error("UNAUTHORIZED_ACCOUNT"));
    }

    const authorization = /^Bearer\s/i.test(rawToken)
      ? rawToken
      : `Bearer ${rawToken}`;

    const result = await decodedToken({
      authorization,
      tokenType: tokenTypeEnum.ACCESS,
      next: (error) => {
        throw error;
      },
    });

    if (!result?.user) {
      return next(new Error("UNAUTHORIZED_ACCOUNT"));
    }

    const { user, decoded } = result;

    const role = String(
      user.role?.slug || decoded.role || ""
    ).toLowerCase();

    const isAdmin = [
      String(baseRoleEnum.ADMIN).toLowerCase(),
      String(baseRoleEnum.SUPER_ADMIN).toLowerCase(),
      "admin",
      "super_admin",
    ].includes(role);

    if (isAdmin) {
      return next(new Error("UNAUTHORIZED_ACCOUNT"));
    }

    // Accept only real Student or Teacher accounts.
    const accountType = user.student
      ? "student"
      : user.teacher
        ? "teacher"
        : null;

    if (!accountType) {
      return next(new Error("UNAUTHORIZED_ACCOUNT"));
    }

    socket.data.user = user;
    socket.data.decoded = decoded;
    socket.data.accountType = accountType;

    if (accountType === "student") {
      socket.data.student = user.student;
    } else {
      socket.data.teacher = user.teacher;
    }

    return next();
  } catch (error) {
    const code =
      error.message === "TOKEN_EXPIRED" ||
        error.name === "TokenExpiredError"
        ? "TOKEN_EXPIRED"
        : "UNAUTHORIZED_ACCOUNT";

    return next(new Error(code));
  }

  
};
