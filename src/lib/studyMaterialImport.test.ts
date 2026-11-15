import { describe, expect, it } from "vitest";
import { canImportStudyMaterial, isPublicWebUrl } from "../../supabase/functions/import-study-material/validation";

describe("study material import access", () => {
  it("allows teachers", () => expect(canImportStudyMaterial("teacher")).toBe(true));
  it("allows administrators", () => expect(canImportStudyMaterial("admin")).toBe(true));
  it("rejects students and unknown roles", () => {
    for (const role of ["student", "moderator", null, undefined, ""]) expect(canImportStudyMaterial(role)).toBe(false);
  });
});
describe("study material source URLs", () => {
  it("accepts public educational HTTPS pages", () => expect(isPublicWebUrl("https://www.bbc.co.uk/bitesize")).toBe(true));
  it("rejects local hosts, IPs, credentials, ports and non-HTTPS URLs", () => {
    for (const url of ["http://bbc.co.uk", "https://localhost", "https://127.0.0.1", "https://10.0.0.1", "https://[::1]", "https://school.internal", "https://foo.local", "https://user:pass@bbc.co.uk", "https://bbc.co.uk:8080", "javascript:alert(1)"]) {
      expect(isPublicWebUrl(url)).toBe(false);
    }
  });
});