import React from 'react';
import DataTable from '../../components/admin/DataTable';

const OrderManagement: React.FC = () => {
  const columns = [
    { key: 'orderId', header: 'Order ID' },
    { key: 'customer', header: 'Customer' },
    { key: 'date', header: 'Date' },
    { key: 'total', header: 'Total Amount' },
    { key: 'payment', header: 'Payment Status', render: (row: any) => (
      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
        {row.payment}
      </span>
    ) },
    { key: 'status', header: 'Order Status', render: (row: any) => (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
        {row.status}
      </span>
    ) }
  ];

  const data = [
    { orderId: 'ORD-5001', customer: 'John Doe', date: '2026-07-08', total: '₹12,499', payment: 'Paid', status: 'Processing' },
    { orderId: 'ORD-5002', customer: 'Jane Smith', date: '2026-07-07', total: '₹4,999', payment: 'Paid', status: 'Shipped' },
    { orderId: 'ORD-5003', customer: 'Alice Brown', date: '2026-07-06', total: '₹2,150', payment: 'Pending', status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Order Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage all customer orders.</p>
        </div>
      </div>

      <DataTable 
        title="Recent Orders" 
        columns={columns} 
        data={data} 
        searchPlaceholder="Search by order ID or customer..."
      />
    </div>
  );
};

export default OrderManagement;
