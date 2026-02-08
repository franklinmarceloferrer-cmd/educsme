import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  AlertTriangle, 
  FileText, 
  Users, 
  Accessibility,
  ExternalLink,
  GraduationCap,
  Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GSEResources() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-red">
          GCSE Exam Guide 2026
        </h1>
        <p className="text-brand-blue">
          Official guidance from Ofqual for GCSE, AS and A level exams
        </p>
      </div>

      {/* Important Dates Banner */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Key Exam Dates 2026</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-background border">
              <span className="text-sm text-muted-foreground">Exam Window</span>
              <span className="font-semibold">7 May – 23 June 2026</span>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-background border">
              <span className="text-sm text-muted-foreground">Contingency Day</span>
              <span className="font-semibold">24 June 2026</span>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-background border">
              <span className="text-sm text-muted-foreground">Results Days</span>
              <span className="font-semibold">A level: 13 Aug | GCSE: 20 Aug</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Before Your Exams */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-brand-blue" />
              <CardTitle>Before Your Exams</CardTitle>
            </div>
            <CardDescription>Essential preparation information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Know Your Details</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Full exam timetable with dates, times and locations</li>
                <li>Your candidate number and exam centre number</li>
                <li>What you can and cannot bring into exams</li>
                <li>Rules about mobile phones and electronic devices</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium">Required Equipment</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Black ink pens (essential for all written exams)</li>
                <li>Pencils, ruler, eraser for diagrams</li>
                <li>Calculator (if allowed for your exam)</li>
                <li>Clear pencil case or transparent bag</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Tiered Exams */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-brand-red" />
              <CardTitle>Tiered Exams</CardTitle>
            </div>
            <CardDescription>Understanding Foundation and Higher tiers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Foundation Tier</span>
                  <Badge variant="secondary">Grades 1-5</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Maximum grade 5 available. Designed for students aiming for grades 1-5.
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Higher Tier</span>
                  <Badge variant="secondary">Grades 4-9</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Grades 4-9 available. If you don't reach grade 4, you'll receive "ungraded".
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Your school decides your tier. Check with your teachers if unsure.
            </p>
          </CardContent>
        </Card>

        {/* Access Arrangements */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-primary" />
              <CardTitle>Access Arrangements</CardTitle>
            </div>
            <CardDescription>Support available for eligible students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you have a disability, learning difficulty or temporary condition, you may be entitled to:
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span><strong>Extra time</strong> – additional time to complete exams</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span><strong>Reader or scribe</strong> – someone to read questions or write answers</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span><strong>Modified papers</strong> – larger print, Braille, or other formats</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              Speak to your school's exams officer or SENCo about access arrangements.
            </p>
          </CardContent>
        </Card>

        {/* Formula Sheets */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-brand-blue" />
              <CardTitle>Formula Sheets</CardTitle>
            </div>
            <CardDescription>Support materials provided in exams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              From 2026, formula sheets are provided for GCSE Maths and Science exams:
            </p>
            <div className="grid gap-2">
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <Badge>GCSE Maths</Badge>
                <span className="text-sm">Key mathematical formulas provided</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <Badge>GCSE Physics</Badge>
                <span className="text-sm">Physics equations sheet included</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <Badge>GCSE Combined Science</Badge>
                <span className="text-sm">Relevant formulas for science papers</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Practice using formula sheets before your exams – they're included in past papers.
            </p>
          </CardContent>
        </Card>

        {/* Exam Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Important Rules</CardTitle>
            </div>
            <CardDescription>Avoid penalties and disqualification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <h4 className="font-medium text-destructive mb-2">Strictly Prohibited</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Mobile phones in the exam room (even switched off)</li>
                <li>Smart watches or any electronic devices</li>
                <li>Notes, books or unauthorized materials</li>
                <li>Communicating with other candidates</li>
                <li>Copying or sharing answers</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Consequences:</strong> Breaking exam rules can result in losing marks, having your paper cancelled, or being disqualified from all exams.
            </p>
          </CardContent>
        </Card>

        {/* Private Candidates */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Private Candidates</CardTitle>
            </div>
            <CardDescription>Taking exams without a school</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you're entering exams independently (not through a school):
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Find an exam centre that accepts private candidates</li>
              <li>Register early – centres fill up quickly</li>
              <li>Understand which components require coursework</li>
              <li>Check if practical assessments are required</li>
            </ul>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <a 
                href="https://www.jcq.org.uk/examination-entries/private-candidates" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                JCQ Private Candidates Info
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Official Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Official Resources</CardTitle>
          <CardDescription>Links to authoritative information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="justify-start h-auto p-4" asChild>
              <a 
                href="https://www.gov.uk/government/publications/ofqual-student-guide-to-exams-and-assessments-in-2026" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span className="font-medium">Ofqual Student Guide</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Official government guidance</span>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4" asChild>
              <a 
                href="https://www.jcq.org.uk/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span className="font-medium">JCQ Website</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Joint Council for Qualifications</span>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4" asChild>
              <a 
                href="https://www.gov.uk/what-different-qualification-levels-mean" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span className="font-medium">Qualification Levels</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Understanding qualifications</span>
                </div>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <p className="text-xs text-muted-foreground text-center">
        Content based on official Ofqual guidance. Last updated: February 2026.
      </p>
    </div>
  );
}
