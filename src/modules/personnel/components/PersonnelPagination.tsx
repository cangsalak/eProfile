import React from 'react';
import TablePagination from '@/components/common/TablePagination';

interface PersonnelPaginationProps {
  isLoading: boolean;
  totalItems: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  setPageSize?: (size: number) => void;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}

export default function PersonnelPagination(props: PersonnelPaginationProps) {
  return <TablePagination {...props} unitName="นาย" />;
}

