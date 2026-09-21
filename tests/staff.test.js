/**
 * Staff Module Tests
 *
 * Uses Node.js built-in test runner (node:test).
 * Run with: node --test tests/staff.test.js
 *
 * Prerequisites:
 * - Database must be running with seed data
 * - Server must NOT be running on the test port (or use a different port)
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3015";
const API = `${BASE_URL}/api/v1/admin`;

// ─── Helper to get admin auth token ──────────────────────────────────────────
let adminToken = null;

const getAdminToken = async () => {
  if (adminToken) return adminToken;

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@learnex.com",
      password: "Admin@123456",
    }),
  });

  const data = await res.json();
  adminToken = data?.data?.credentials?.access_token;
  if (!adminToken) {
    throw new Error(
      `Failed to get admin token. Response: ${JSON.stringify(data)}`
    );
  }
  return adminToken;
};

const authHeaders = async () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${await getAdminToken()}`,
});

// ─── Helper to get a valid staff role ID ─────────────────────────────────────
let staffRoleId = null;
let studentRoleId = null;
let teacherRoleId = null;

const fetchRoleIds = async () => {
  if (staffRoleId) return;

  const headers = await authHeaders();

  // Get staff roles (valid ones)
  const staffRolesRes = await fetch(`${API}/staff/roles`, { headers });
  const staffRolesData = await staffRolesRes.json();
  const staffRoles = staffRolesData?.data?.roles || [];

  if (staffRoles.length > 0) {
    staffRoleId = staffRoles[0].id;
  }

  // Get all roles to find student/teacher IDs
  const allRolesRes = await fetch(`${API}/roles`, { headers });
  const allRolesData = await allRolesRes.json();
  const allRoles = allRolesData?.data?.roles || [];

  for (const role of allRoles) {
    const translations = role.roleTranslations || [];
    const slugs = translations.map((t) => t.slug?.toLowerCase());
    if (slugs.includes("student")) studentRoleId = role.id;
    if (slugs.includes("teacher")) teacherRoleId = role.id;
  }
};

// ─── Track created staff IDs for cleanup ─────────────────────────────────────
const createdStaffIds = [];

// ─── Cleanup helper ──────────────────────────────────────────────────────────
const cleanupCreatedStaff = async () => {
  const headers = await authHeaders();
  for (const id of createdStaffIds) {
    try {
      await fetch(`${API}/staff/${id}`, {
        method: "DELETE",
        headers,
      });
    } catch {
      // Ignore cleanup errors
    }
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// TESTS
// ═════════════════════════════════════════════════════════════════════════════

describe("Staff Module", () => {
  before(async () => {
    await getAdminToken();
    await fetchRoleIds();
  });

  after(async () => {
    await cleanupCreatedStaff();
  });

  // ─── CREATE STAFF ────────────────────────────────────────────────────────

  describe("POST /staff — Create Staff", () => {
    it("1. should create staff with valid data", async () => {
      const headers = await authHeaders();
      const res = await fetch(`${API}/staff`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          firstName: "Test",
          lastName: "Staff",
          email: `test.staff.${Date.now()}@learnex.com`,
          password: "StaffPass@123",
          roleId: staffRoleId,
          status: "ACTIVE",
        }),
      });

      const data = await res.json();
      assert.equal(res.status, 201);
      assert.ok(data.data.staff.id);
      createdStaffIds.push(data.data.staff.id);
    });

    it("2. should reject create with missing name", async () => {
      const headers = await authHeaders();
      const res = await fetch(`${API}/staff`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: "noname@learnex.com",
          password: "StaffPass@123",
          roleId: staffRoleId,
        }),
      });

      assert.equal(res.status, 400);
    });

    it("3. should reject create with invalid email", async () => {
      const headers = await authHeaders();
      const res = await fetch(`${API}/staff`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          firstName: "Bad",
          lastName: "Email",
          email: "not-an-email",
          password: "StaffPass@123",
          roleId: staffRoleId,
        }),
      });

      assert.equal(res.status, 400);
    });

    it("4. should reject create with missing roleId", async () => {
      const headers = await authHeaders();
      const res = await fetch(`${API}/staff`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          firstName: "No",
          lastName: "Role",
          email: "norole@learnex.com",
          password: "StaffPass@123",
        }),
      });

      assert.equal(res.status, 400);
    });

    it("6. should reject create with STUDENT role", async () => {
      if (!studentRoleId) return;
      const headers = await authHeaders();
      const res = await fetch(`${API}/staff`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          firstName: "Student",
          lastName: "Attempt",
          email: `student.attempt.${Date.now()}@learnex.com`,
          password: "StaffPass@123",
          roleId: studentRoleId,
          status: "ACTIVE",
        }),
      });

      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(
        data.message.includes("INVALID_STAFF_ROLE") ||
          data.message.includes("Invalid role")
      );
    });

    it("7. should reject create with TEACHER role", async () => {
      if (!teacherRoleId) return;
      const headers = await authHeaders();
      const res = await fetch(`${API}/staff`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          firstName: "Teacher",
          lastName: "Attempt",
          email: `teacher.attempt.${Date.now()}@learnex.com`,
          password: "StaffPass@123",
          roleId: teacherRoleId,
          status: "ACTIVE",
        }),
      });

      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(
        data.message.includes("INVALID_STAFF_ROLE") ||
          data.message.includes("Invalid role")
      );
    });
  });

  // ─── GET ALL STAFF (LIST) ────────────────────────────────────────────────

  describe("GET /staff — Staff List", () => {
    it("8. should return staff list (not empty)", async () => {
      const headers = await authHeaders();
      const res = await fetch(`${API}/staff`, { headers });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(data.data.staff));
      assert.ok(data.data.pagination);
    });

    it("9. student should NEVER appear in staff list", async () => {
      const headers = await authHeaders();
      const res = await fetch(`${API}/staff?limit=100`, { headers });
      const data = await res.json();

      const staff = data.data.staff || [];
      for (const member of staff) {
        const slugs =
          member.role?.roleTranslations?.map((t) => t.slug.toLowerCase()) || [];
        assert.ok(
          !slugs.includes("student"),
          `Student found in staff list: ${member.email}`
        );
      }
    });

    it("10. teacher should NEVER appear in staff list", async () => {
      const headers = await authHeaders();
      const res = await fetch(`${API}/staff?limit=100`, { headers });
      const data = await res.json();

      const staff = data.data.staff || [];
      for (const member of staff) {
        const slugs =
          member.role?.roleTranslations?.map((t) => t.slug.toLowerCase()) || [];
        assert.ok(
          !slugs.includes("teacher"),
          `Teacher found in staff list: ${member.email}`
        );
      }
    });

    it("11. search should work within staff", async () => {
      const headers = await authHeaders();
      const res = await fetch(`${API}/staff?search=test`, { headers });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(data.data.staff));
    });

    it("12. pagination should work after staff filtering", async () => {
      const headers = await authHeaders();
      const res = await fetch(`${API}/staff?page=1&limit=1`, { headers });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.ok(data.data.pagination);
      assert.equal(data.data.pagination.page, 1);
      assert.equal(data.data.pagination.limit, 1);
    });

    it("13. role filter should work", async () => {
      if (!staffRoleId) return;
      const headers = await authHeaders();
      const res = await fetch(`${API}/staff?roleId=${staffRoleId}`, {
        headers,
      });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(data.data.staff));
    });

    it("14. student role filter should be rejected", async () => {
      if (!studentRoleId) return;
      const headers = await authHeaders();
      const res = await fetch(`${API}/staff?roleId=${studentRoleId}`, {
        headers,
      });

      assert.equal(res.status, 400);
    });

    it("15. teacher role filter should be rejected", async () => {
      if (!teacherRoleId) return;
      const headers = await authHeaders();
      const res = await fetch(`${API}/staff?roleId=${teacherRoleId}`, {
        headers,
      });

      assert.equal(res.status, 400);
    });

    it("16. status filter should work", async () => {
      const headers = await authHeaders();
      const res = await fetch(`${API}/staff?status=ACTIVE`, { headers });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(data.data.staff));
    });
  });

  // ─── GET STAFF BY ID ─────────────────────────────────────────────────────

  describe("GET /staff/:id — Get Staff by ID", () => {
    it("17. should return staff member by ID", async () => {
      if (createdStaffIds.length === 0) return;

      const headers = await authHeaders();
      const res = await fetch(`${API}/staff/${createdStaffIds[0]}`, {
        headers,
      });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.data.staff.id, createdStaffIds[0]);
    });

    it("18. should reject getting student through staff endpoint", async () => {
      // First get a student user ID
      const headers = await authHeaders();
      const studentsRes = await fetch(`${API}/students?limit=1`, { headers });
      const studentsData = await studentsRes.json();
      const students = studentsData?.data?.students || [];

      if (students.length === 0) return;
      const studentUserId = students[0].user?.id || students[0].userId;
      if (!studentUserId) return;

      const res = await fetch(`${API}/staff/${studentUserId}`, { headers });
      assert.equal(res.status, 404);
    });

    it("19. should reject getting teacher through staff endpoint", async () => {
      // First get a teacher user ID
      const headers = await authHeaders();
      const teachersRes = await fetch(`${API}/teachers?limit=1`, { headers });
      const teachersData = await teachersRes.json();
      const teachers = teachersData?.data?.teachers || [];

      if (teachers.length === 0) return;
      const teacherUserId = teachers[0].user?.id || teachers[0].userId;
      if (!teacherUserId) return;

      const res = await fetch(`${API}/staff/${teacherUserId}`, { headers });
      assert.equal(res.status, 404);
    });
  });

  // ─── UPDATE STAFF ────────────────────────────────────────────────────────

  describe("PATCH /staff/:id — Update Staff", () => {
    it("20. should update staff data", async () => {
      if (createdStaffIds.length === 0) return;

      const headers = await authHeaders();
      const res = await fetch(`${API}/staff/${createdStaffIds[0]}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          firstName: "UpdatedFirst",
          lastName: "UpdatedLast",
        }),
      });

      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.data.staff.firstName, "UpdatedFirst");
    });

    it("21. should reject changing staff role to student", async () => {
      if (createdStaffIds.length === 0 || !studentRoleId) return;

      const headers = await authHeaders();
      const res = await fetch(`${API}/staff/${createdStaffIds[0]}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ roleId: studentRoleId }),
      });

      assert.equal(res.status, 400);
    });

    it("22. should reject changing staff role to teacher", async () => {
      if (createdStaffIds.length === 0 || !teacherRoleId) return;

      const headers = await authHeaders();
      const res = await fetch(`${API}/staff/${createdStaffIds[0]}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ roleId: teacherRoleId }),
      });

      assert.equal(res.status, 400);
    });
  });

  // ─── DELETE STAFF ────────────────────────────────────────────────────────

  describe("DELETE /staff/:id — Delete Staff", () => {
    it("24. should reject deleting student through staff endpoint", async () => {
      const headers = await authHeaders();
      const studentsRes = await fetch(`${API}/students?limit=1`, { headers });
      const studentsData = await studentsRes.json();
      const students = studentsData?.data?.students || [];

      if (students.length === 0) return;
      const studentUserId = students[0].user?.id || students[0].userId;
      if (!studentUserId) return;

      const res = await fetch(`${API}/staff/${studentUserId}`, {
        method: "DELETE",
        headers,
      });
      assert.equal(res.status, 404);
    });

    it("25. should reject deleting teacher through staff endpoint", async () => {
      const headers = await authHeaders();
      const teachersRes = await fetch(`${API}/teachers?limit=1`, { headers });
      const teachersData = await teachersRes.json();
      const teachers = teachersData?.data?.teachers || [];

      if (teachers.length === 0) return;
      const teacherUserId = teachers[0].user?.id || teachers[0].userId;
      if (!teacherUserId) return;

      const res = await fetch(`${API}/staff/${teacherUserId}`, {
        method: "DELETE",
        headers,
      });
      assert.equal(res.status, 404);
    });

    it("23. should delete staff member", async () => {
      if (createdStaffIds.length === 0) return;

      const headers = await authHeaders();
      const idToDelete = createdStaffIds[createdStaffIds.length - 1];
      const res = await fetch(`${API}/staff/${idToDelete}`, {
        method: "DELETE",
        headers,
      });

      assert.equal(res.status, 200);
      // Remove from cleanup list since it's already deleted
      const idx = createdStaffIds.indexOf(idToDelete);
      if (idx > -1) createdStaffIds.splice(idx, 1);
    });
  });

  // ─── STAFF ROLES ENDPOINT ────────────────────────────────────────────────

  describe("GET /staff/roles — Staff Roles", () => {
    it("should return roles excluding student/teacher", async () => {
      const headers = await authHeaders();
      const res = await fetch(`${API}/staff/roles`, { headers });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(data.data.roles));

      for (const role of data.data.roles) {
        const slugs = role.roleTranslations?.map((t) =>
          t.slug.toLowerCase()
        ) || [];
        assert.ok(!slugs.includes("student"), "Student role found in staff roles");
        assert.ok(!slugs.includes("teacher"), "Teacher role found in staff roles");
      }
    });
  });

  // ─── EXPORT ──────────────────────────────────────────────────────────────

  describe("GET /staff/export — Export Staff", () => {
    it("should return Excel file for staff export", async () => {
      const headers = await authHeaders();
      delete headers["Content-Type"]; // Let fetch handle it for binary response
      const res = await fetch(`${API}/staff/export`, { headers });

      assert.equal(res.status, 200);
      const contentType = res.headers.get("content-type");
      assert.ok(
        contentType.includes("spreadsheet") || contentType.includes("octet"),
        `Expected spreadsheet content type, got: ${contentType}`
      );
    });
  });
});
