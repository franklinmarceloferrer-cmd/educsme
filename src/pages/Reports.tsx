import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, BarChart3, Users, Megaphone, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { studentsApi, announcementsApi, documentsApi, dashboardApi } from "@/lib/supabaseApi";
import { toast } from "sonner";

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<string>("");

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: studentsApi.getAll,
  });

  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn: announcementsApi.getAll,
  });

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: documentsApi.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  });

  const reportTypes = [
    {
      id: "students",
      title: "Student Directory Report",
      description: "Complete list of all enrolled students with their details",
      icon: Users,
      data: students,
    },
    {
      id: "announcements",
      title: "Announcements Report",
      description: "All published announcements with statistics",
      icon: Megaphone,
      data: announcements,
    },
    {
      id: "documents",
      title: "Document Library Report",
      description: "Inventory of all uploaded documents and resources",
      icon: FileText,
      data: documents,
    },
    {
      id: "summary",
      title: "System Summary Report",
      description: "Overview of all system statistics and metrics",
      icon: BarChart3,
      data: stats,
    },
  ];

  const generateCSVReport = (reportType: string) => {
    let csvContent = "";
    let filename = "";

    switch (reportType) {
      case "students":
        if (!students) return;
        csvContent = [
          ["Name", "Email", "Grade", "Enrollment Date", "Status"],
          ...students.map(student => [
            student.name,
            student.email,
            student.grade,
            student.enrollmentDate,
            student.status
          ])
        ].map(row => row.join(",")).join("\n");
        filename = "students-report.csv";
        break;

      case "announcements":
        if (!announcements) return;
        csvContent = [
          ["Title", "Author", "Category", "Published", "Created Date", "Content Length"],
          ...announcements.map(announcement => [
            announcement.title,
            announcement.author,
            announcement.category,
            announcement.isPublished ? "Yes" : "No",
            new Date(announcement.createdAt).toLocaleDateString(),
            announcement.content.length.toString()
          ])
        ].map(row => row.join(",")).join("\n");
        filename = "announcements-report.csv";
        break;

      case "documents":
        if (!documents) return;
        csvContent = [
          ["Name", "Type", "Size", "Category", "Uploaded By", "Upload Date"],
          ...documents.map(doc => [
            doc.name,
            doc.type,
            doc.size.toString(),
            doc.category,
            doc.uploadedBy,
            new Date(doc.uploadedAt).toLocaleDateString()
          ])
        ].map(row => row.join(",")).join("\n");
        filename = "documents-report.csv";
        break;

      case "summary":
        if (!stats) return;
        csvContent = [
          ["Metric", "Value"],
          ["Total Students", stats.totalStudents.toString()],
          ["Total Announcements", stats.totalAnnouncements.toString()],
          ["Active Announcements", stats.activeAnnouncements.toString()],
          ["Total Documents", stats.totalDocuments.toString()],
          ["Report Generated", new Date().toLocaleDateString()]
        ].map(row => row.join(",")).join("\n");
        filename = "system-summary-report.csv";
        break;

      default:
        return;
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  const printReport = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and export detailed reports about your educational system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={printReport}>
            <FileText className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            onClick={() => selectedReport && generateCSVReport(selectedReport)}
            disabled={!selectedReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Report Type</CardTitle>
          <CardDescription>
            Choose the type of report you want to generate and export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a report type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((report) => (
                <SelectItem key={report.id} value={report.id}>
                  {report.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <div className="grid gap-4 md:grid-cols-2">
        {reportTypes.map((report) => (
          <Card 
            key={report.id}
            className={`cursor-pointer transition-all ${
              selectedReport === report.id ? "ring-2 ring-primary" : "hover:shadow-md"
            }`}
            onClick={() => setSelectedReport(report.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <report.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {report.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Generated: {new Date().toLocaleDateString()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    generateCSVReport(report.id);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Print-friendly summary */}
      <div className="print:block hidden">
        <Card>
          <CardHeader>
            <CardTitle>System Summary Report</CardTitle>
            <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Statistics</h3>
                <ul className="space-y-1 text-sm">
                  <li>Total Students: {stats?.totalStudents || 0}</li>
                  <li>Total Announcements: {stats?.totalAnnouncements || 0}</li>
                  <li>Active Announcements: {stats?.activeAnnouncements || 0}</li>
                  <li>Total Documents: {stats?.totalDocuments || 0}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Quick Facts</h3>
                <ul className="space-y-1 text-sm">
                  <li>System is operational</li>
                  <li>All modules functioning</li>
                  <li>Data integrity maintained</li>
                  <li>Regular backups enabled</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}