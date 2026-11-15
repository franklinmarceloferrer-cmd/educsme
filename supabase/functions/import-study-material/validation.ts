export function isPublicWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) return false;
    // Accept DNS names only; do not proxy requests to local or literal IP addresses.
    return host.includes(".") && !host.includes(":") && !/^[\d.]+$/.test(host)
      && !/(^|\.)(localhost|local|internal|test|invalid|example)$/.test(host)
      && !host.endsWith(".localhost") && !host.endsWith(".local") && !host.endsWith(".internal");
  } catch {
    return false;
  }
}

export function canImportStudyMaterial(role: unknown): boolean {
  return role === "teacher" || role === "admin";
}