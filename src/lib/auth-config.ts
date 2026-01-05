export const TRUSTED_DOMAINS = ["nu.edu.pk"];

export const ADMIN_EMAILS =
  process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim()) || [];

export function isEmailAllowed(email: string | null | undefined): boolean {
  if (!email) return false;

  // Check Admin
  if (ADMIN_EMAILS.includes(email)) return true;

  // Check Domain
  const domain = email.split("@")[1];
  if (!domain) return false;

  // Exact match or sub-domain match for flexibility
  // "student@nu.edu.pk" -> nu.edu.pk (Allowed)
  // "student@lhr.nu.edu.pk" -> lhr.nu.edu.pk (Allowed if we match suffix or list)

  // Strict check against list or suffix check?
  // User said: "only emails containing '@nu.edu.pk' domain"
  // This implies ending with nu.edu.pk

  return domain.endsWith("nu.edu.pk");
}
