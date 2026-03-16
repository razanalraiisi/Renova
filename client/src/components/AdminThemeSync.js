import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const USER_ROUTES = [
  "/UserDash", "/start", "/dispose", "/recycle", "/upcycle", "/decideForMe",
  "/NewRecycleRequest", "/PickupRequest", "/DropOff",
  "/CollectorRequestsHistory", "/UserRequestHistory",
  "/EWasteLibrary", "/omanmap", "/library",
  "/AboutUs", "/FAQ", "/support", "/terms", "/privacy",
];
const COLLECTOR_ROUTES = ["/CollectorDash", "/CollectorProfile"];

/**
 * Applies theme from localStorage to document. Returns cleanup for System listener if needed.
 */
function applyThemeToDocument(themeKey, dataAttr) {
  const root = document.documentElement;
  const theme = localStorage.getItem(themeKey) || "Light";

  const apply = (value) => {
    root.setAttribute(dataAttr, value);
  };

  if (theme === "System") {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystem = () => apply(media.matches ? "dark" : "light");
    applySystem();
    media.addEventListener("change", applySystem);
    return () => media.removeEventListener("change", applySystem);
  }
  apply(theme.toLowerCase());
  return undefined;
}

/**
 * Applies saved theme (Light/Dark/System) per role:
 * - Admin routes: data-admin-theme (adminTheme)
 * - User routes: data-theme (userTheme)
 * - Collector routes: data-theme (collectorTheme)
 */
export default function AdminThemeSync() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const isUserRoute = USER_ROUTES.includes(pathname);
  const isCollectorRoute = COLLECTOR_ROUTES.includes(pathname);

  useEffect(() => {
    const root = document.documentElement;
    let cleanup;

    if (isAdmin) {
      root.removeAttribute("data-theme");
      cleanup = applyThemeToDocument("adminTheme", "data-admin-theme");
      return () => { if (cleanup) cleanup(); };
    }

    root.removeAttribute("data-admin-theme");

    if (isCollectorRoute) {
      cleanup = applyThemeToDocument("collectorTheme", "data-theme");
      return () => { if (cleanup) cleanup(); };
    }

    if (isUserRoute) {
      cleanup = applyThemeToDocument("userTheme", "data-theme");
      return () => { if (cleanup) cleanup(); };
    }

    root.removeAttribute("data-theme");
  }, [pathname, isAdmin, isUserRoute, isCollectorRoute]);

  return null;
}
