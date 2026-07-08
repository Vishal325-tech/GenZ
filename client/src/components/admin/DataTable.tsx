import React from 'react';
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';

interface Column {
  key: string;
  header: string;
  render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  searchPlaceholder?: string;
  onAddClick?: () => void;
  addButtonLabel?: string;
}

const DataTable: React.FC<DataTableProps> = ({ 
  title, 
  columns, 
  data, 
  searchPlaceholder = "Search...",
  onAddClick,
  addButtonLabel = "Add New"
}) => {
  return (
    <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-neutral-800/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header Area */}
      <div className="p-5 border-b border-gray-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 ring-luxury-gold/50 dark:text-white w-full sm:w-64 transition-all"
            />
          </div>
          
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors">
            <Filter size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>
          
          {onAddClick && (
            <button 
              onClick={onAddClick}
              className="flex items-center gap-2 px-4 py-2 bg-luxury-gold hover:bg-luxury-gold-hover text-white rounded-lg text-sm font-bold shadow-md shadow-luxury-gold/20 transition-all active:scale-95"
            >
              <span className="text-lg leading-none">+</span>
              {addButtonLabel}
            </button>
          )}
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-neutral-800/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-800">
              <th className="p-4 font-semibold w-12 text-center">
                <input type="checkbox" className="rounded border-gray-300 text-luxury-gold focus:ring-luxury-gold bg-transparent" />
              </th>
              {columns.map((col, i) => (
                <th key={col.key || i} className="p-4 font-semibold">{col.header}</th>
              ))}
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
            {data.length > 0 ? (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors group">
                  <td className="p-4 text-center">
                    <input type="checkbox" className="rounded border-gray-300 text-luxury-gold focus:ring-luxury-gold bg-transparent" />
                  </td>
                  {columns.map((col, j) => (
                    <td key={`${i}-${j}`} className="p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  <td className="p-4 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 2} className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="text-4xl mb-3">📂</div>
                    <p>No records found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Area */}
      <div className="p-4 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-neutral-800/30">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select className="bg-transparent border border-gray-200 dark:border-neutral-700 rounded p-1 text-xs focus:outline-none focus:border-luxury-gold">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <span>entries</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 rounded bg-luxury-gold text-white font-medium flex items-center justify-center">
            1
          </button>
          <button className="w-8 h-8 rounded border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 font-medium flex items-center justify-center transition-colors">
            2
          </button>
          <button className="w-8 h-8 rounded border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 font-medium flex items-center justify-center transition-colors">
            3
          </button>
          <button className="p-1.5 rounded border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
