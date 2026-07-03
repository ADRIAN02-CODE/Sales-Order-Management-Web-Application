import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOrders, deleteOrder } from '../redux/slices/ordersSlice';
import { Plus, Edit, Trash2, Printer, Search, RefreshCw, AlertCircle, FileText } from 'lucide-react';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { list: orders, loading, error } = useSelector((state) => state.orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('invoiceDate');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchOrders());
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); // Prevent row double-click trigger
    if (window.confirm('Are you sure you want to delete this sales order?')) {
      dispatch(deleteOrder(id));
    }
  };

  const handlePrint = (e, id) => {
    e.stopPropagation();
    navigate(`/order/${id}?print=true`);
  };

  const handleRowDoubleClick = (id) => {
    navigate(`/order/${id}`);
  };

  // Filter and sort orders
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.invoiceNo.toLowerCase().includes(term) ||
      (order.clientName && order.clientName.toLowerCase().includes(term)) ||
      (order.referenceNo && order.referenceNo.toLowerCase().includes(term))
    );
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'invoiceDate') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2 dark:text-white">
            <FileText className="h-8 w-8 text-indigo-600" />
            Sales Orders
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create, view, manage, and print sales invoices and orders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition duration-150 shadow-sm flex items-center justify-center dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
            title="Refresh List"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/order/new')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-lg shadow-md transition duration-150 flex items-center gap-2 text-sm"
          >
            <Plus className="h-5 w-5" />
            Add New Order
          </button>
        </div>
      </div>

      {/* Controls: Search and summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between dark:bg-gray-800 dark:border-gray-700">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search by invoice no, client or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm dark:bg-gray-900 dark:text-white dark:border-gray-700"
          />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{sortedOrders.length}</span> of{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{orders.length}</span> orders
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3 text-red-800 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">Failed to load sales orders</h3>
            <p className="mt-1 text-xs text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Grid Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th
                  scope="col"
                  onClick={() => toggleSort('invoiceNo')}
                  className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Invoice No {sortBy === 'invoiceNo' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  scope="col"
                  onClick={() => toggleSort('clientName')}
                  className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Client Name {sortBy === 'clientName' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  scope="col"
                  onClick={() => toggleSort('referenceNo')}
                  className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Reference No {sortBy === 'referenceNo' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  scope="col"
                  onClick={() => toggleSort('invoiceDate')}
                  className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Invoice Date {sortBy === 'invoiceDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  scope="col"
                  onClick={() => toggleSort('totalExcl')}
                  className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Total Excl {sortBy === 'totalExcl' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  scope="col"
                  onClick={() => toggleSort('totalTax')}
                  className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Total Tax {sortBy === 'totalTax' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  scope="col"
                  onClick={() => toggleSort('totalIncl')}
                  className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Total Incl {sortBy === 'totalIncl' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th scope="col" className="relative px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No sales orders found matching your search.
                  </td>
                </tr>
              ) : (
                sortedOrders.map((order) => (
                  <tr
                    key={order.id}
                    onDoubleClick={() => handleRowDoubleClick(order.id)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition cursor-pointer"
                    title="Double-click to edit/view details"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {order.invoiceNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium dark:text-white">
                      {order.clientName || `Client #${order.clientId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.referenceNo || <span className="text-gray-300 dark:text-gray-650">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.invoiceDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatCurrency(order.totalExcl)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                      {formatCurrency(order.totalTax)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-950 dark:text-white">
                      {formatCurrency(order.totalIncl)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => navigate(`/order/${order.id}`)}
                          className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded transition dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
                          title="Edit Order"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={(e) => handlePrint(e, order.id)}
                          className="p-1 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded transition dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-green-400"
                          title="Print Invoice"
                        >
                          <Printer className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, order.id)}
                          className="p-1 text-gray-500 hover:text-red-650 hover:bg-red-50 rounded transition dark:text-gray-400 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                          title="Delete Order"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;
