/**
 * Authentication and authorization constants.
 */

export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || "vipulrameshkanaujiya@gmail.com").trim().toLowerCase();
}

export const DEFAULT_ADMIN_EMAIL = "vipulrameshkanaujiya@gmail.com";
