/** Primary teal used across ReNova admin reports */
export const RENOVA_CHART_TEAL = "#0080aa";
export const RENOVA_CHART_TEAL_DARK = "#006d90";

/**
 * @param {object[]} users
 * @param {object[]} requests
 * @returns {Map<string, number>}
 */
export function buildRequestCountByUserId(users, requests) {
  const usersList = Array.isArray(users) ? users : [];
  const reqs = Array.isArray(requests) ? requests : [];
  const emailToId = new Map();

  for (const u of usersList) {
    const id = u._id != null ? String(u._id) : null;
    if (!id) continue;
    const email = (u.email || "").trim().toLowerCase();
    if (email) emailToId.set(email, id);
  }

  const countByUserId = new Map();
  for (const u of usersList) {
    const id = u._id != null ? String(u._id) : null;
    if (id) countByUserId.set(id, 0);
  }

  for (const r of reqs) {
    let id = r.userId != null ? String(r.userId) : null;
    if (!id) {
      const email = (r.email || "").trim().toLowerCase();
      if (email) id = emailToId.get(email) || null;
    }
    if (!id || !countByUserId.has(id)) continue;
    countByUserId.set(id, (countByUserId.get(id) || 0) + 1);
  }

  return countByUserId;
}

/**
 * @param {object[]} users
 * @param {object[]} requests
 * @returns {{ name: string, count: number }[]}
 */
export function requestsPerUser(users, requests) {
  const usersList = Array.isArray(users) ? users : [];
  const countByUserId = buildRequestCountByUserId(usersList, requests);

  return usersList
    .map((u) => {
      const id = u._id != null ? String(u._id) : "";
      return {
        name: (u.uname || "").trim() || "Unknown",
        count: countByUserId.get(id) || 0,
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/**
 * Pick the user with the most pickup + drop-off requests (by userId, else email).
 * @param {object[]} users
 * @param {object[]} requests
 * @returns {{ name: string, count: number }}
 */
export function findMostActiveUser(users, requests) {
  const usersList = Array.isArray(users) ? users : [];
  const reqs = Array.isArray(requests) ? requests : [];
  if (usersList.length === 0 || reqs.length === 0) {
    return { name: "—", count: 0 };
  }

  const countByUserId = buildRequestCountByUserId(usersList, reqs);

  let bestId = null;
  let bestCount = 0;
  for (const [id, count] of countByUserId) {
    if (count > bestCount) {
      bestCount = count;
      bestId = id;
    }
  }

  if (!bestId || bestCount === 0) {
    return { name: "—", count: 0 };
  }

  const user = usersList.find((u) => String(u._id) === bestId);
  const name = (user?.uname || "").trim() || "Unknown";
  return { name, count: bestCount };
}

/**
 * Keep only requests belonging to users in the given list.
 * @param {object[]} users
 * @param {object[]} requests
 */
export function filterRequestsForUsers(users, requests) {
  const usersList = Array.isArray(users) ? users : [];
  const reqs = Array.isArray(requests) ? requests : [];
  if (usersList.length === 0) return [];

  const ids = new Set(
    usersList.map((u) => (u._id != null ? String(u._id) : null)).filter(Boolean)
  );
  const emails = new Set(
    usersList
      .map((u) => (u.email || "").trim().toLowerCase())
      .filter(Boolean)
  );

  return reqs.filter((r) => {
    const id = r.userId != null ? String(r.userId) : null;
    if (id && ids.has(id)) return true;
    const email = (r.email || "").trim().toLowerCase();
    return email && emails.has(email);
  });
}
