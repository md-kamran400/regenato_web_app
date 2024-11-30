import React, { useState, useEffect, useCallback } from "react";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

const PaginatedList = ({ totalPages, currentPage, onPageChange }) => {
  const renderPaginationItems = () => {
    const pages = [];
    const delta = 1; // Number of pages to show around the current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // Always show the first page
        i === totalPages || // Always show the last page
        (i >= currentPage - delta && i <= currentPage + delta) // Show pages around the current page
      ) {
        pages.push(
          <PaginationItem key={i} active={i === currentPage}>
            <PaginationLink onClick={() => onPageChange(i)}>{i}</PaginationLink>
          </PaginationItem>
        );
      } else if (
        (i === currentPage - delta - 1 || i === currentPage + delta + 1) &&
        totalPages > 3 // Show dots around skipped pages
      ) {
        pages.push(
          <PaginationItem key={`dots-${i}`} disabled>
            <PaginationLink>...</PaginationLink>
          </PaginationItem>
        );
      }
    }

    return pages;
  };

  return (
    <Pagination className="d-flex justify-content-end mt-2">
      <PaginationItem disabled={currentPage === 1}>
        <PaginationLink previous onClick={() => onPageChange(currentPage - 1)}>
          Previous
        </PaginationLink>
      </PaginationItem>
      {renderPaginationItems()}
      <PaginationItem disabled={currentPage === totalPages}>
        <PaginationLink next onClick={() => onPageChange(currentPage + 1)}>
          Next
        </PaginationLink>
      </PaginationItem>
    </Pagination>
  );
};

export default PaginatedList;
