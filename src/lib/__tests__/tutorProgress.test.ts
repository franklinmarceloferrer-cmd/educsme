// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import { loadTutorProgress, summarizeLesson, summarizeTutorSubjects, totalTutorProgress } from "../tutorProgress";

const row = (id: string, progress: Record<string, string>) => ({
    id, subject: "Maths", prompt: "Algebra",
    lesson: { title: "Algebra", questions: [{ question: "A" }, { question: "B" }, { question: "C" }] },
    progress,
});

describe("saved tutor progress", () => {
    it("aggregates completed and missed questions separately for each subject", () => {
        const lessons = [
            summarizeLesson(row("math-one", { 0: "correct", 1: "missed" })),
            summarizeLesson(row("math-two", { 0: "missed", 2: "correct" })),
            summarizeLesson({ ...row("bio", { 0: "correct" }), subject: "Biology" }),
        ];
        expect(summarizeTutorSubjects(lessons)).toEqual([
            { subject: "Maths", total: 6, completed: 4, correct: 2, missed: 2, remaining: 2 },
            { subject: "Biology", total: 3, completed: 1, correct: 1, missed: 0, remaining: 2 },
        ]);
    });

    it("places subjects with the most missed questions first", () => {
        expect(summarizeTutorSubjects([
            summarizeLesson({ ...row("bio", { 0: "missed" }), subject: "Biology" }),
            summarizeLesson(row("math", { 0: "missed", 1: "missed" })),
        ]).map((subject) => subject.subject)).toEqual(["Maths", "Biology"]);
    });

    it("groups unspecified subjects together and normalizes whitespace and casing", () => {
        expect(summarizeTutorSubjects([
            summarizeLesson({ ...row("one", { 0: "missed" }), subject: null }),
            summarizeLesson({ ...row("two", { 0: "correct" }), subject: "  " }),
            summarizeLesson(row("three", { 0: "correct" })),
            summarizeLesson({ ...row("four", { 0: "correct" }), subject: " maths " }),
        ])).toEqual([
            { subject: null, total: 6, completed: 2, correct: 1, missed: 1, remaining: 4 },
            { subject: "Maths", total: 6, completed: 2, correct: 2, missed: 0, remaining: 4 },
        ]);
    });

    it("does not include stale question marks in subject totals", () => {
        expect(summarizeTutorSubjects([summarizeLesson(row("one", { 0: "correct", 9: "missed" }))]))
            .toEqual([{ subject: "Maths", total: 3, completed: 1, correct: 1, missed: 0, remaining: 2 }]);
        expect(summarizeTutorSubjects([])).toEqual([]);
    });

    it("counts both correct and missed questions as completed across all lessons", () => {
        const result = totalTutorProgress([
            summarizeLesson(row("one", { 0: "correct", 1: "missed" })),
            summarizeLesson(row("two", { 0: "missed", 2: "correct" })),
        ]);
        expect(result).toEqual({ total: 6, completed: 4, correct: 2, missed: 2, remaining: 2 });
    });

    it("ignores nonexistent indices and unrecognized marks", () => {
        expect(summarizeLesson(row("one", { 0: "correct", 1: "unknown", 9: "missed", "-1": "correct", "01": "missed" })))
            .toMatchObject({ total: 3, completed: 1, correct: 1, missed: 0, remaining: 2 });
    });

    it("returns zero totals when no lessons are saved", () => {
        expect(totalTutorProgress([])).toEqual({ total: 0, completed: 0, correct: 0, missed: 0, remaining: 0 });
    });

    it("handles lessons without questions or progress", () => {
        expect(summarizeLesson({ id: "empty", subject: null, prompt: "Topic", lesson: null, progress: null }))
            .toMatchObject({ title: "Topic", total: 0, completed: 0, missed: 0, remaining: 0 });
    });

    it("includes every saved lesson beyond one page and scopes reads to the student", async () => {
        const query = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn()
                .mockResolvedValueOnce({ data: Array.from({ length: 500 }, (_, i) => row(String(i), { 0: "correct" })), error: null })
                .mockResolvedValueOnce({ data: [row("last", { 1: "missed" })], error: null }),
        };
        vi.mocked(supabase.from).mockReturnValue(query as never);
        const summaries = await loadTutorProgress("student-one");
        expect(query.eq).toHaveBeenCalledWith("user_id", "student-one");
        expect(query.range.mock.calls).toEqual([[0, 499], [500, 999]]);
        expect(summaries).toHaveLength(501);
        expect(totalTutorProgress(summaries)).toEqual({ total: 1503, completed: 501, correct: 500, missed: 1, remaining: 1002 });
    });

    it("surfaces a failed read rather than reporting empty progress", async () => {
        const failure = new Error("Read failed");
        const query = {
            select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(),
            range: vi.fn().mockResolvedValue({ data: null, error: failure }),
        };
        vi.mocked(supabase.from).mockReturnValue(query as never);
        await expect(loadTutorProgress("student-one")).rejects.toThrow("Read failed");
    });
});