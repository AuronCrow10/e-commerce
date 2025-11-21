import React from 'react';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);
  return (
    <div>
      {pages.map(page => (
        <button key={page} disabled={page === currentPage} onClick={() => onPageChange(page)}>
          {page}
        </button>
      ))}
    </div>
  );
}

export default Pagination;
