import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function GSEExamCard() {
  // Calculate days until exams start
  const examStartDate = new Date('2026-05-07');
  const today = new Date();
  const daysUntilExams = Math.ceil((examStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            GSE Exams 2026
          </CardTitle>
          <CardDescription>Official Ofqual guidance</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/gse-resources" className="flex items-center gap-1">
            View Guide
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Countdown */}
        {daysUntilExams > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-background border">
            <AlertCircle className="h-4 w-4 text-primary" />
            <span className="text-sm">
              <strong>{daysUntilExams}</strong> days until exams begin
            </span>
          </div>
        )}
        
        {/* Key Dates */}
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Exam Window</span>
            <Badge variant="secondary">7 May – 23 Jun</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Contingency Day</span>
            <Badge variant="outline">24 June</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">A Level Results</span>
            <Badge variant="outline">13 August</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">GCSE Results</span>
            <Badge variant="outline">20 August</Badge>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            📱 No phones in exam rooms • 📝 Bring black ink pens • 📋 Know your candidate number
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
