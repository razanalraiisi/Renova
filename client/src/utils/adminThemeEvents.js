/** Sync admin theme between AdminTopbar (moon) and AdminUserPage (select). */
export const ADMIN_THEME_CHANGED = "admin-theme-changed";

export function dispatchAdminThemeChange(value) {
  window.dispatchEvent(new CustomEvent(ADMIN_THEME_CHANGED, { detail: value }));
}
