import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen } from "lucide-react";

interface StudyTopic {
  topic: string;
  hours: string;
  priority: "high" | "medium" | "low";
}

interface Subject {
  name: string;
  icon: string;
  color: string;
  topics: StudyTopic[];
}

const subjects: Subject[] = [
  {
    name: "Mathematics",
    icon: "📐",
    color: "bg-blue-500/10 border-blue-500/30",
    topics: [
      { topic: "Number & Algebra", hours: "3h/week", priority: "high" },
      { topic: "Geometry & Measures", hours: "2h/week", priority: "high" },
      { topic: "Statistics & Probability", hours: "2h/week", priority: "medium" },
      { topic: "Ratio & Proportion", hours: "1.5h/week", priority: "medium" },
    ],
  },
  {
    name: "English Language",
    icon: "📝",
    color: "bg-red-500/10 border-red-500/30",
    topics: [
      { topic: "Reading Comprehension", hours: "2h/week", priority: "high" },
      { topic: "Creative Writing", hours: "2h/week", priority: "high" },
      { topic: "Transactional Writing", hours: "1.5h/week", priority: "medium" },
      { topic: "Spoken Language", hours: "1h/week", priority: "low" },
    ],
  },
  {
    name: "English Literature",
    icon: "📚",
    color: "bg-purple-500/10 border-purple-500/30",
    topics: [
      { topic: "Shakespeare", hours: "2h/week", priority: "high" },
      { topic: "19th Century Novel", hours: "2h/week", priority: "high" },
      { topic: "Modern Text / Drama", hours: "1.5h/week", priority: "medium" },
      { topic: "Poetry Anthology", hours: "1.5h/week", priority: "medium" },
    ],
  },
  {
    name: "Combined Science",
    icon: "🔬",
    color: "bg-green-500/10 border-green-500/30",
    topics: [
      { topic: "Biology – Cell Biology & Organisation", hours: "2h/week", priority: "high" },
      { topic: "Chemistry – Atomic Structure & Bonding", hours: "2h/week", priority: "high" },
      { topic: "Physics – Energy & Forces", hours: "2h/week", priority: "high" },
      { topic: "Required Practicals Review", hours: "1h/week", priority: "medium" },
    ],
  },
  {
    name: "History",
    icon: "🏛️",
    color: "bg-amber-500/10 border-amber-500/30",
    topics: [
      { topic: "Medicine Through Time", hours: "2h/week", priority: "high" },
      { topic: "Elizabethan England", hours: "1.5h/week", priority: "medium" },
      { topic: "Weimar & Nazi Germany", hours: "2h/week", priority: "high" },
      { topic: "Source Analysis Practice", hours: "1h/week", priority: "medium" },
    ],
  },
  {
    name: "Geography",
    icon: "🌍",
    color: "bg-teal-500/10 border-teal-500/30",
    topics: [
      { topic: "Physical Geography (Coasts, Rivers)", hours: "2h/week", priority: "high" },
      { topic: "Human Geography (Urban, Development)", hours: "2h/week", priority: "high" },
      { topic: "Fieldwork & Skills", hours: "1h/week", priority: "medium" },
      { topic: "Case Studies Review", hours: "1h/week", priority: "low" },
    ],
  },
];

const priorityVariant: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-primary/10 text-primary border-primary/30",
  low: "bg-muted text-muted-foreground border-muted",
};

const priorityLabel: Record<string, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

export function StudyGrid() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand-red" />
            <CardTitle>Grade de Estudos GCSE 2026</CardTitle>
          </div>
          <CardDescription>
            Plano semanal recomendado com as matérias principais e tópicos prioritários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Distribua seus estudos ao longo da semana. Priorize os tópicos marcados como <Badge variant="outline" className={`text-xs ${priorityVariant.high}`}>Alta</Badge> e revise regularmente.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => {
          const totalHours = subject.topics.reduce((sum, t) => {
            return sum + parseFloat(t.hours);
          }, 0);

          return (
            <Card key={subject.name} className={`border ${subject.color}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="text-xl">{subject.icon}</span>
                    {subject.name}
                  </span>
                  <Badge variant="outline" className="text-xs font-normal">
                    {totalHours}h/sem
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs h-8">Tópico</TableHead>
                      <TableHead className="text-xs h-8 w-20 text-center">Tempo</TableHead>
                      <TableHead className="text-xs h-8 w-20 text-center">Prioridade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subject.topics.map((topic) => (
                      <TableRow key={topic.topic}>
                        <TableCell className="text-xs py-2">{topic.topic}</TableCell>
                        <TableCell className="text-xs py-2 text-center">{topic.hours}</TableCell>
                        <TableCell className="text-xs py-2 text-center">
                          <Badge variant="outline" className={`text-[10px] ${priorityVariant[topic.priority]}`}>
                            {priorityLabel[topic.priority]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
