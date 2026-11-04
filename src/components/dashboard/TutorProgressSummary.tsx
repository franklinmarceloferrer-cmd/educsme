import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCheck, CircleCheck, RotateCcw, CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { loadTutorProgress, summarizeTutorSubjects, totalTutorProgress } from "@/lib/tutorProgress";

export function TutorProgressSummary() {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const { data: lessons = [], isLoading, isError, refetch } = useQuery({
        queryKey: ["tutor-progress", user?.id],
        queryFn: () => user ? loadTutorProgress(user.id) : Promise.resolve([]),
        enabled: !!user,
        staleTime: 0,
    });
    const totals = totalTutorProgress(lessons);
    const subjects = summarizeTutorSubjects(lessons);
    const subjectLabel = (subject: string | null) => {
        if (!subject) return t("tutorProgress.unspecifiedSubject");
        const key = `tutorProgress.subject.${subject}`;
        const translated = t(key);
        return translated === key ? subject : translated;
    };
    const tutorLink = `/gcse-tutor?lang=${language}`;
    const stats = [
        { key: "saved", value: lessons.length, icon: BookOpen, color: "text-primary" },
        { key: "completed", value: totals.completed, icon: CheckCheck, color: "text-primary" },
        { key: "correct", value: totals.correct, icon: CircleCheck, color: "text-primary" },
        { key: "missed", value: totals.missed, icon: RotateCcw, color: "text-destructive" },
        { key: "remaining", value: totals.remaining, icon: CircleDashed, color: "text-muted-foreground" },
    ];

    return (
        <section aria-labelledby="tutor-progress-title" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="tutor-progress-title" className="text-xl font-semibold">{t("tutorProgress.title")}</h2>
                <Button variant="outline" size="sm" asChild>
                    <Link to={tutorLink}>{t("tutorProgress.start")}<ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
            {isLoading ? (
                <p role="status" className="text-sm text-muted-foreground">{t("tutorProgress.loading")}</p>
            ) : isError ? (
                <div role="alert" className="flex flex-wrap items-center gap-3">
                    <p className="text-sm text-destructive">{t("tutorProgress.error")}</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>{t("tutorProgress.retry")}</Button>
                </div>
            ) : (
                <>
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                        {stats.map(({ key, value, icon: Icon, color }) => (
                            <div key={key} className="border-l-2 border-border pl-4 py-1 min-w-0">
                                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Icon className={`h-4 w-4 shrink-0 ${color}`} />{t(`tutorProgress.${key}`)}
                                </dt>
                                <dd className="text-3xl font-semibold tabular-nums mt-2">{value}</dd>
                            </div>
                        ))}
                    </dl>
                    {lessons.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">{t("tutorProgress.empty")}</p>
                    ) : (
                        <>
                            <section aria-labelledby="tutor-subject-title" className="space-y-3 pt-3">
                                <h3 id="tutor-subject-title" className="text-lg font-semibold">{t("tutorProgress.bySubject")}</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="border-b border-border text-muted-foreground">
                                            <tr>
                                                <th scope="col" className="py-3 pr-4 text-left font-medium">{t("tutorProgress.subject")}</th>
                                                <th scope="col" className="px-3 py-3 text-right font-medium">{t("tutorProgress.completed")}</th>
                                                <th scope="col" className="px-3 py-3 text-right font-medium">{t("tutorProgress.missed")}</th>
                                                <th scope="col" className="py-3 pl-3 text-right font-medium">{t("tutorProgress.remaining")}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {subjects.map((subject) => (
                                                <tr key={subject.subject ?? ""}>
                                                    <th scope="row" className="py-4 pr-4 text-left font-medium">
                                                        <span className="break-words">{subjectLabel(subject.subject)}</span>
                                                        {subject.missed > 0 && <span className="mt-1 flex items-center gap-1 text-xs font-normal text-destructive"><RotateCcw className="h-3 w-3 shrink-0" />{t("tutorProgress.needsReview")}</span>}
                                                    </th>
                                                    <td className="px-3 py-4 text-right tabular-nums">{subject.completed} / {subject.total}</td>
                                                    <td className={`px-3 py-4 text-right tabular-nums ${subject.missed > 0 ? "font-semibold text-destructive" : "text-muted-foreground"}`}>{subject.missed}</td>
                                                    <td className="py-4 pl-3 text-right tabular-nums text-muted-foreground">{subject.remaining}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                            <p className="text-sm text-muted-foreground">{t("tutorProgress.count", totals)}</p>
                            <ul className="divide-y divide-border">
                                {lessons.map((lesson) => (
                                    <li key={lesson.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0">
                                            <h3 className="font-medium break-words">{lesson.title}</h3>
                                            {lesson.subject && <p className="text-xs text-muted-foreground">{lesson.subject}</p>}
                                            <p className="text-sm text-muted-foreground mt-1">{t("tutorProgress.count", { completed: lesson.completed, total: lesson.total })} · {lesson.missed} {t("tutorProgress.missed").toLowerCase()}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 shrink-0">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link to={`${tutorLink}&lesson=${lesson.id}`}>{t("tutorProgress.open")}</Link>
                                            </Button>
                                            {lesson.missed > 0 && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link to={`${tutorLink}&lesson=${lesson.id}&review=missed`}>
                                                        <RotateCcw className="mr-2 h-4 w-4" />{t("tutorProgress.review")}
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </>
            )}
        </section>
    );
}