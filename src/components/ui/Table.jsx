// src/components/ui/Table.jsx
import React, { useState } from 'react';
import './Table.css';

/**
 * Table Component (Fully Responsive)
 * @param {Array} columns - Array of column config: { key, header, render (optional) }
 * @param {Array|Object} data - Array of row objects OR API response object
 * @param {string} emptyMessage - Message when no data (default: "No records found")
 * @param {boolean} loading - Show loading state
 * @param {string} className - Additional classes
 * @param {string} dataKey - Key to extract array from response object (default: 'data')
 * @param {string} variant - 'default' | 'striped' | 'bordered' | 'compact'
 * @param {boolean} sortable - Enable column sorting
 * @param {function} onSort - Called when column is sorted
 * @param {string} sortColumn - Currently sorted column
 * @param {string} sortDirection - 'asc' | 'desc'
 * @param {boolean} selectable - Enable row selection
 * @param {Array} selectedRows - Array of selected row IDs
 * @param {function} onRowSelect - Called when row is selected
 * @param {function} onRowClick - Called when row is clicked
 * @param {boolean} pagination - Show pagination
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @param {number} pageSize - Items per page
 * @param {function} onPageChange - Called when page changes
 * @param {React.ReactNode} footer - Custom footer content
 */
const Table = ({ 
  columns, 
  data, 
  emptyMessage = "No records found", 
  loading = false,
  className = '',
  dataKey = 'data',
  variant = 'default',
  sortable = false,
  onSort,
  sortColumn,
  sortDirection,
  selectable = false,
  selectedRows = [],
  onRowSelect,
  onRowClick,
  pagination = false,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  onPageChange,
  footer
}) => {
  const [selectedRowsInternal, setSelectedRowsInternal] = useState([]);
  
  const tableData = React.useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && data[dataKey]) {
      return Array.isArray(data[dataKey]) ? data[dataKey] : [];
    }
    console.warn('⚠️ Table component: data is not an array. Expected array or object with data property.', data);
    return [];
  }, [data, dataKey]);

  const handleSort = (columnKey) => {
    if (!sortable || !onSort) return;
    onSort(columnKey);
  };

  const handleRowSelect = (rowId) => {
    const newSelected = [...(selectedRows || selectedRowsInternal)];
    const index = newSelected.indexOf(rowId);
    
    if (index > -1) {
      newSelected.splice(index, 1);
    } else {
      newSelected.push(rowId);
    }
    
    if (onRowSelect) {
      onRowSelect(newSelected);
    } else {
      setSelectedRowsInternal(newSelected);
    }
  };

  const handleSelectAll = () => {
    const allIds = tableData.map(row => row.id || row._id);
    const newSelected = (selectedRows || selectedRowsInternal).length === allIds.length ? [] : allIds;
    
    if (onRowSelect) {
      onRowSelect(newSelected);
    } else {
      setSelectedRowsInternal(newSelected);
    }
  };

  const handleRowClick = (row) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const getRowId = (row, index) => {
    return row.id || row._id || `row-${index}`;
  };

  const isRowSelected = (rowId) => {
    return (selectedRows || selectedRowsInternal).includes(rowId);
  };

  // 🕓 Loading state
  if (loading) {
    return (
      <div className={`table-container ${className}`}>
        <table className={`data-table ${variant}`}>
          <tbody>
            <tr>
              <td colSpan={columns?.length || 1} className="table-loading">
                <div className="loading-spinner"></div>
                Loading data...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // 📭 Empty state
  if (!tableData || tableData.length === 0) {
    return (
      <div className={`table-container ${className}`}>
        <table className={`data-table ${variant}`}>
          <tbody>
            <tr>
              <td colSpan={columns?.length || 1} className="table-empty">
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // ❌ No columns defined
  if (!columns || !Array.isArray(columns) || columns.length === 0) {
    return (
      <div className={`table-container ${className}`}>
        <table className={`data-table ${variant}`}>
          <tbody>
            <tr>
              <td className="table-error">
                No columns defined for table
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`}>
      <table className={`data-table ${variant}`}>
        <thead>
          <tr>
            {selectable && (
              <th className="table-header">
                <input
                  type="checkbox"
                  className="selection-checkbox"
                  checked={tableData.length > 0 && 
                    (selectedRows || selectedRowsInternal).length === tableData.length}
                  onChange={handleSelectAll}
                />
              </th>
            )}
            
            {columns.map((col) => (
              <th 
                key={col.key} 
                className={`table-header ${sortable ? 'sortable' : ''} ${
                  sortColumn === col.key ? `sort-${sortDirection || 'asc'}` : ''
                }`}
                onClick={() => sortable && handleSort(col.key)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {tableData.map((row, index) => {
            const rowId = getRowId(row, index);
            return (
              <tr 
                key={rowId} 
                className={`table-row ${selectable ? 'selectable' : ''} ${
                  isRowSelected(rowId) ? 'selected' : ''
                }`}
                onClick={() => handleRowClick(row)}
              >
                {selectable && (
                  <td className="table-cell">
                    <input
                      type="checkbox"
                      className="selection-checkbox"
                      checked={isRowSelected(rowId)}
                      onChange={() => handleRowSelect(rowId)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="table-cell"
                    data-label={col.header}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {pagination && (
        <div className="table-footer">
          <div className="table-footer-info">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, tableData.length)} of {tableData.length} entries
          </div>
          
          <div className="table-pagination">
            <button
              className="pagination-btn"
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => onPageChange && onPageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            
            <button
              className="pagination-btn"
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {footer && <div className="table-footer">{footer}</div>}
    </div>
  );
};

export default Table;