import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStudentsStateProps {
  hasFilters: boolean;
  canManage: boolean;
  onAddStudent: () => void;
  onClearFilters: () => void;
}

export function EmptyStudentsState({
  hasFilters,
  canManage,
  onAddStudent,
  onClearFilters,
}: EmptyStudentsStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No students found</h3>
        <p className="text-muted-foreground mb-4">
          No students match your current filters. Try adjusting your search criteria.
        </p>
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Users className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No students yet</h3>
      <p className="text-muted-foreground mb-4">
        Get started by adding your first student to the system.
      </p>
      {canManage && (
        <Button variant="brand-red" onClick={onAddStudent}>
          <Plus className="h-4 w-4 mr-2" />
          Add First Student
        </Button>
      )}
    </div>
  );
}
