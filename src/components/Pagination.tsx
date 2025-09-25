interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const maxPageNumbersToShow = 5;
  const pageNumbers = [];

  let startPage = Math.max(
    1,
    currentPage - Math.floor(maxPageNumbersToShow / 2)
  );
  let endPage = startPage + maxPageNumbersToShow - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPageNumbersToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav
      className="flex flex-wrap justify-center items-center space-x-2 mt-4 max-w-full"
      aria-label="Pagination for todo list"
    >
      <button
        className="btn btn-sm btn-outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        Previous
      </button>

      {pageNumbers.map((number) => (
        <button
          key={number}
          className={`btn btn-sm ${
            currentPage === number ? "btn-active btn-primary" : "btn-ghost"
          }`}
          onClick={() => onPageChange(number)}
          aria-current={currentPage === number ? "page" : undefined}
          aria-label={`Go to page ${number}`}
        >
          {number}
        </button>
      ))}

      <button
        className="btn btn-sm btn-outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
