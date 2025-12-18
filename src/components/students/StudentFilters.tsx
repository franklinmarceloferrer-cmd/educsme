import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface StudentFiltersProps {
  gradeFilter: string;
  sectionFilter: string;
  statusFilter: string;
  onGradeChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
}

const grades = ["1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade", "11th Grade", "12th Grade"];
const sections = ["A", "B", "C", "D", "E"];
const statuses = ["active", "inactive", "graduated"];

export function StudentFilters({
  gradeFilter,
  sectionFilter,
  statusFilter,
  onGradeChange,
  onSectionChange,
  onStatusChange,
  onClearFilters,
}: StudentFiltersProps) {
  const hasFilters = gradeFilter || sectionFilter || statusFilter;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Select value={gradeFilter} onValueChange={onGradeChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Grade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Grades</SelectItem>
          {grades.map((grade) => (
            <SelectItem key={grade} value={grade}>
              {grade}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sectionFilter} onValueChange={onSectionChange}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Section" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sections</SelectItem>
          {sections.map((section) => (
            <SelectItem key={section} value={section}>
              Section {section}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
