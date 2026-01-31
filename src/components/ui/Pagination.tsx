'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  // 최대 5개 페이지 번호 표시
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // endPage가 totalPages에 도달하면 startPage 조정
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      {/* 첫 페이지 */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={`w-8 h-8 flex items-center justify-center cursor-pointer ${
          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        &laquo;
      </button>

      {/* 이전 페이지 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-8 h-8 flex items-center justify-center cursor-pointer ${
          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        &lsaquo;
      </button>

      {/* 페이지 번호 */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium cursor-pointer ${
            page === currentPage
              ? 'bg-[var(--primary)] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}

      {/* 다음 페이지 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-8 h-8 flex items-center justify-center cursor-pointer ${
          currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        &rsaquo;
      </button>

      {/* 마지막 페이지 */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={`w-8 h-8 flex items-center justify-center cursor-pointer ${
          currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        &raquo;
      </button>
    </div>
  );
}
