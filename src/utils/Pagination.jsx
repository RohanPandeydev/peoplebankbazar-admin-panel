import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { PiCaretLineRightBold } from "react-icons/pi";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "reactstrap";

const Pagination = ({
  pagination,
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract pagination from URL or use default
  const searchParams = new URLSearchParams(location.search);
  const currentPage = parseInt(searchParams.get('page') || '1');

  // Destructure pagination with default values
  const {
    page_count = 1,
    total = 0
  } = pagination || {};

  // Generate an array of page numbers to display
  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (page_count <= maxPagesToShow) {
      return Array.from({ length: page_count }, (_, i) => i + 1);
    }

    const halfMax = Math.floor(maxPagesToShow / 2);
    let start = Math.max(1, currentPage - halfMax);
    let end = Math.min(page_count, start + maxPagesToShow - 1);

    if (end - start + 1 < maxPagesToShow) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    if (start > 1) {
      pageNumbers.push(1);
      if (start > 2) pageNumbers.push('...');
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    if (end < page_count) {
      if (end < page_count - 1) pageNumbers.push('...');
      pageNumbers.push(page_count);
    }

    return pageNumbers;
  };

  // Handle page change by updating URL
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > page_count || newPage === currentPage) return;

    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', newPage.toString());

    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    });
  };

  // Don't render if no pagination or page_count is 1 or less
  // if (!pagination || page_count <= 1) {
  //   return null;
  // }

  return (
    <div className={`pagination-main-box ${className}`}>
      {/* Optional: Page Info */}
      <div className="pagination-info">
        Showing {currentPage} - {page_count} of {total} Pages
      </div>

      <div className="pagination-btns">
        {/* First Page Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="h-8 w-8 first-last-button"
        >
          <FiChevronsLeft className="h-4 w-4" color="#019bbf"/>
        </Button>

        {/* Previous Page Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 next-prev-button"
        >
          <FiChevronLeft className="h-4 w-4" color="#019bbf"/>
        </Button>

        {/* Page Numbers */}
        <div className="pagination-main-btns">
          {generatePageNumbers().map((pageNum, index) => (
            <Button
              key={index}
              variant={pageNum === currentPage ? 'default' : 'outline'}
              size="icon"
              onClick={() => handlePageChange(pageNum)}
              disabled={pageNum === '...'}
              className={pageNum == currentPage ? "h-8 w-8 pagination-active-button active" : "h-8 w-8 "}
            >
              {pageNum}
            </Button>
          ))}
        </div>

        {/* Next Page Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === page_count}
          className="h-8 w-8 next-prev-button"
        >
          <FiChevronRight className="h-4 w-4" color="#019bbf"/>
        </Button>

        {/* Last Page Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(page_count)}
          disabled={currentPage === page_count}
          className="h-8 w-8 first-last-button"
        >
          <FiChevronsRight className="h-4 w-4" color="#019bbf"/>
        </Button>
      </div>
    </div>
  );
};

export default Pagination;