import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listStudentsTool from "./tools/list-students";
import listAnnouncementsTool from "./tools/list-announcements";
import createAnnouncementTool from "./tools/create-announcement";
import listStudyMaterialsTool from "./tools/list-study-materials";
import listDocumentsTool from "./tools/list-documents";

// The OAuth issuer must be the direct Supabase host, built from the project ref
// that Vite inlines at build time (never from SUPABASE_URL).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "educsme",
  title: "educsme",
  version: "0.1.0",
  instructions:
    "Tools for the educsme educational CMS. Read students, announcements, documents and GCSE study materials, and create announcements. All calls act as the signed-in user and respect their permissions.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listStudentsTool,
    listAnnouncementsTool,
    createAnnouncementTool,
    listStudyMaterialsTool,
    listDocumentsTool,
  ],
});
