import { asyncHandler } from "../utils/response.js";
import { isAdmin } from "../utils/Permissions/permissions.js";
import { mapMethodToAction } from "../utils/Permissions/mapMethodToAction.js";

/**
 * Helper to ensure the request has the user's permissions cached in req.permissions Set.
 */
const ensurePermissions = (req) => {
  if (!req.permissions) {
    if (!req.user) {
      req.permissions = new Set();
    } else {
      // Get permissions set from user
      if (req.user.role?.rolePermissions) {
        req.permissions = new Set(
          req.user.role.rolePermissions
            .map((rp) => rp.permission?.code)
            .filter(Boolean)
        );
      } else {
        req.permissions = new Set();
      }
    }
  }
};

/**
 * Checks if a user has a specific permission.
 */
export const authorize = (permissionCode) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return next(new Error("UNAUTHORIZED", { cause: 401 }));
    }

    // Bypass check for admin / super_admin
    if (isAdmin(req.user)) {
      return next();
    }

    ensurePermissions(req);

    if (!req.permissions.has(permissionCode)) {
      return next(new Error("FORBIDDEN", { cause: 403 }));
    }

    next();
  });
};

/**
 * Dynamic resource middleware: Maps HTTP method to corresponding CRUD action.
 */
export const authorizeResource = (resourceName) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return next(new Error("UNAUTHORIZED", { cause: 401 }));
    }

    // Bypass check for admin / super_admin
    if (isAdmin(req.user)) {
      return next();
    }

    ensurePermissions(req);

    const action = mapMethodToAction(req.method);
    const permissionCode = `${resourceName}:${action}`;

    if (!req.permissions.has(permissionCode)) {
      return next(new Error("FORBIDDEN", { cause: 403 }));
    }

    next();
  });
};


//authentication  مين ال باعت الريكوست معاك توكن ولا لاء يعم 
// authorization هل مسموح له ينفذ الاكشن دي ولا لاء ع اساس الرول يعني
// authorize هنا بحدد الاكشن ال ممكن يعمله اليوزر وبسكيب الادمن زالسوبر ادمن يعملوا ال هم عايزينه يعدي علطول 
// يعني مثلا عايز شخص يعمل دليت بس اديله الاكشن دا بس
// authorizeResource بديله الCrud كامل
// ويعمل ماب عليهم ويختار الاكشن من خلال الماب دا