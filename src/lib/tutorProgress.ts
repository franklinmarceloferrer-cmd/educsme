import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface TutorLessonSummary {
    id: string;
    title: string;
    subject: string | null;
    total: number;
    completed: number;
    correct: number;
    missed: number;
    remaining: number;
}

interface LessonRow {
    id: string;
    subject: string | null;
    prompt: string;
    lesson: Json;
    progress: Json;
}

function isObject(value: Json): value is { [key: string]: Json | undefined } {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function summarizeLesson(row: LessonRow): TutorLessonSummary {
    const lesson = isObject(row.lesson) ? row.lesson : {};
    const questions = Array.isArray(lesson.questions) ? lesson.questions : [];
    const progress = isObject(row.progress) ? row.progress : {};
    let correct = 0;
    let missed = 0;
    questions.forEach((_, index) => {
        if (progress[String(index)] === "correct") correct += 1;
        if (progress[String(index)] === "missed") missed += 1;
    });
    const completed = correct + missed;
    return {
        id: row.id,
        subject: row.subject,
        title: typeof lesson.title === "string" ? lesson.title : row.prompt,
        total: questions.length,
        completed,
        correct,
        missed,
        remaining: questions.length - completed,
    };
}

export function totalTutorProgress(lessons: TutorLessonSummary[]) {
    return lessons.reduce((total, lesson) => ({
        total: total.total + lesson.total,
        completed: total.completed + lesson.completed,
        correct: total.correct + lesson.correct,
        missed: total.missed + lesson.missed,
        remaining: total.remaining + lesson.remaining,
    }), { total: 0, completed: 0, correct: 0, missed: 0, remaining: 0 });
}

export async function loadTutorProgress(userId: string): Promise<TutorLessonSummary[]> {
    const summaries: TutorLessonSummary[] = [];
    const PAGE_SIZE = 500;
    for (let offset = 0; ; offset += PAGE_SIZE) {
        const { data, error } = await supabase.from("saved_tutor_lessons")
            .select("id, subject, prompt, lesson, progress")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .order("id")
            .range(offset, offset + PAGE_SIZE - 1);
        if (error) throw error;
        const rows = data ?? [];
        summaries.push(...rows.map(summarizeLesson));
        if (rows.length < PAGE_SIZE) return summaries;
    }
}