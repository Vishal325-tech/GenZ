import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import { useAdminAuth } from '../../context/AdminAuthContext';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
};

const CustomerManagement: React.FC = () => {
  const { adminToken } = useAdminAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/dashboard/customers', {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          // Map data to match table expected format
          const formattedData = data.map((c: any) => ({
            ...c,
            totalSpending: formatCurrency(c.totalSpending)
          }));
          setCustomers(formattedData);
        }
      } catch (err) {
        console.error('Failed to fetch customers', err);
      } finally {
        setLoading(false);
      }
    };
    if (adminToken) {
      fetchCustomers();
    }
  }, [adminToken]);

  const columns = [
    { key: 'id', header: 'Customer ID' },
    { key: 'name', header: 'Full Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone Number' },
    { key: 'recentPurchases', header: 'Recent Purchases' },
    { key: 'totalOrders', header: 'Total Orders' },
    { key: 'totalSpending', header: 'Total Spending' },
    { key: 'status', header: 'Status', render: (row: any) => (
      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
        {row.status}
      </span>
    ) }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Customer Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your customer base, view profiles, and handle support.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-luxury-gold border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <DataTable 
          title="All Customers" 
          columns={columns} 
          data={customers} 
          searchPlaceholder="Search by name, email, or ID..."
        />
      )}
    </div>
  );
};

export default CustomerManagement;
