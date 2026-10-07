export const EXCLUDED_STAFF_ROLE_SLUGS = ["student", "teacher"];

export const buildStaffScopeFilter = () => ({
  role: {
    slug: {
      notIn: EXCLUDED_STAFF_ROLE_SLUGS,
    },
  },
});

export const isExcludedStaffRole = (slug) => {
  if (!slug) return false;
  return EXCLUDED_STAFF_ROLE_SLUGS.includes(slug.toLowerCase());
};
