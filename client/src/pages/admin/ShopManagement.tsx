import React from 'react';
import DataTable from '../../components/admin/DataTable';

const ShopManagement: React.FC = () => {
  const columns = [
    { key: 'image', header: 'Image', render: () => (
      <div className="w-10 h-10 bg-gray-200 dark:bg-neutral-800 rounded-lg"></div>
    ) },
    { key: 'name', header: 'Product Name' },
    { key: 'category', header: 'Category' },
    { key: 'price', header: 'Price' },
    { key: 'stock', header: 'Stock' },
    { key: 'status', header: 'Status', render: (row: any) => (
      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
        {row.status}
      </span>
    ) }
  ];

  const data = [
    { name: 'Luxury Birthday Hamper', category: 'Hampers', price: '₹4,999', stock: 24, status: 'Active' },
    { name: 'Premium Red Roses Bouquet', category: 'Flowers', price: '₹1,299', stock: 50, status: 'Active' },
    { name: 'Belgian Chocolate Box', category: 'Chocolates', price: '₹2,499', stock: 12, status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Shop Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage products, categories, inventory, and pricing.</p>
        </div>
      </div>

      <DataTable 
        title="All Products" 
        columns={columns} 
        data={data} 
        searchPlaceholder="Search products..."
        onAddClick={() => alert('Add Product clicked')}
        addButtonLabel="Add Product"
      />
    </div>
  );
};

export default ShopManagement;
