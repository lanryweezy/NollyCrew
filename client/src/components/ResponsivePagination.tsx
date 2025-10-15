import { Button } from "@/components/ui/button";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import ResponsiveButton from "@/components/ResponsiveButton";

interface ResponsivePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function ResponsivePagination({ 
  currentPage,
  totalPages,
  onPageChange,
  className = ""
}: ResponsivePaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <ResponsiveButton
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="text-xs sm:text-sm"
          >
            Previous
          </ResponsiveButton>
        </PaginationItem>
        
        {pageNumbers.map((page) => (
          <PaginationItem key={page}>
            <ResponsiveButton
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="text-xs sm:text-sm"
            >
              {page}
            </ResponsiveButton>
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <ResponsiveButton
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="text-xs sm:text-sm"
          >
            Next
          </ResponsiveButton>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}