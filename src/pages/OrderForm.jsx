import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchClients } from '../redux/slices/clientsSlice';
import { fetchItems } from '../redux/slices/itemsSlice';
import { createOrder, updateOrder, fetchOrderById, fetchNextInvoiceNo, clearCurrentOrder } from '../redux/slices/ordersSlice';
import api from '../services/api';
import { Save, Printer, ArrowLeft, Plus, Trash2, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const OrderForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = id && id !== 'new';
  const autoPrint = searchParams.get('print') === 'true';

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const { list: clients } = useSelector((state) => state.clients);
  const { list: catalogItems } = useSelector((state) => state.items);
  const { currentOrder, nextInvoiceNo, loading: orderLoading } = useSelector((state) => state.orders);

  // Form states
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNo, setReferenceNo] = useState('');
  const [clientId, setClientId] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [address3, setAddress3] = useState('');
  const [suburb, setSuburb] = useState('');
  const [state, setState] = useState('');
  const [postCode, setPostCode] = useState('');

  // Table items state
  const [orderItems, setOrderItems] = useState([]);
  
  // Validation and UI states
  const [errors, setErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCheckingInvoice, setIsCheckingInvoice] = useState(false);

  // 1. Initial Data Fetch
  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchItems());

    if (isEditMode) {
      dispatch(fetchOrderById(id));
    } else {
      dispatch(clearCurrentOrder());
      dispatch(fetchNextInvoiceNo());
    }
  }, [dispatch, id, isEditMode]);

  // Set default invoice number in Create Mode
  useEffect(() => {
    if (!isEditMode && nextInvoiceNo) {
      setInvoiceNo(nextInvoiceNo);
    }
  }, [nextInvoiceNo, isEditMode]);

  // 2. Load order data in Edit Mode
  useEffect(() => {
    if (isEditMode && currentOrder) {
      setInvoiceNo(currentOrder.invoiceNo);
      setInvoiceDate(new Date(currentOrder.invoiceDate).toISOString().split('T')[0]);
      setReferenceNo(currentOrder.referenceNo || '');
      setClientId(currentOrder.clientId);
      setAddress1(currentOrder.address1 || '');
      setAddress2(currentOrder.address2 || '');
      setAddress3(currentOrder.address3 || '');
      setSuburb(currentOrder.suburb || '');
      setState(currentOrder.state || '');
      setPostCode(currentOrder.postCode || '');
      
      const mappedItems = currentOrder.orderItems.map(item => ({
        id: item.id,
        itemId: item.itemId,
        note: item.note || '',
        quantity: item.quantity,
        price: item.price,
        taxRate: item.taxRate,
        exclAmount: item.exclAmount,
        taxAmount: item.taxAmount,
        inclAmount: item.inclAmount
      }));
      setOrderItems(mappedItems);

      // Trigger automatic printing if requested in URL parameters
      if (autoPrint) {
        setTimeout(() => {
          window.print();
        }, 1000);
      }
    }
  }, [currentOrder, isEditMode, autoPrint]);

  // 3. Client selection handlers
  const handleClientChange = (e) => {
    const selectedId = parseInt(e.target.value);
    setClientId(selectedId);
    
    if (!selectedId) {
      setAddress1('');
      setAddress2('');
      setAddress3('');
      setSuburb('');
      setState('');
      setPostCode('');
      return;
    }

    const client = clients.find(c => c.id === selectedId);
    if (client) {
      setAddress1(client.address1 || '');
      setAddress2(client.address2 || '');
      setAddress3(client.address3 || '');
      setSuburb(client.suburb || '');
      setState(client.state || '');
      setPostCode(client.postCode || '');
    }
  };

  // 4. Order Lines Handlers
  const handleAddLine = () => {
    setOrderItems([
      ...orderItems,
      {
        id: 0, // 0 signifies a new record for backend
        itemId: '',
        note: '',
        quantity: 1,
        price: 0,
        taxRate: 15, // Default 15% tax
        exclAmount: 0,
        taxAmount: 0,
        inclAmount: 0
      }
    ]);
  };

  const handleRemoveLine = (index) => {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  };

  // Cross-linked Dropdowns: Select by ItemId (Code)
  const handleItemSelect = (index, itemIdStr) => {
    const itemId = parseInt(itemIdStr);
    const updated = [...orderItems];
    const line = { ...updated[index] };
    
    line.itemId = itemId;
    const catalogItem = catalogItems.find(i => i.id === itemId);
    if (catalogItem) {
      line.price = catalogItem.price;
      // Re-calculate line values
      calculateLineAmounts(line);
    } else {
      line.price = 0;
      line.exclAmount = 0;
      line.taxAmount = 0;
      line.inclAmount = 0;
    }
    
    updated[index] = line;
    setOrderItems(updated);
  };

  const handleLineFieldChange = (index, field, value) => {
    const updated = [...orderItems];
    const line = { ...updated[index] };
    
    if (field === 'quantity') {
      line.quantity = value === '' ? '' : Math.max(1, parseInt(value) || 1);
    } else if (field === 'price') {
      line.price = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
    } else if (field === 'taxRate') {
      line.taxRate = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
    } else {
      line[field] = value;
    }

    calculateLineAmounts(line);
    updated[index] = line;
    setOrderItems(updated);
  };

  const calculateLineAmounts = (line) => {
    const qty = line.quantity || 0;
    const prc = line.price || 0;
    const tax = line.taxRate || 0;

    line.exclAmount = parseFloat((qty * prc).toFixed(2));
    line.taxAmount = parseFloat((line.exclAmount * tax / 100).toFixed(2));
    line.inclAmount = parseFloat((line.exclAmount + line.taxAmount).toFixed(2));
  };

  // Summary computations
  const totalExcl = orderItems.reduce((sum, item) => sum + (item.exclAmount || 0), 0);
  const totalTax = orderItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  const totalIncl = orderItems.reduce((sum, item) => sum + (item.inclAmount || 0), 0);

  // 5. Save Order Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Form validations
    const formErrors = {};
    if (!invoiceNo.trim()) formErrors.invoiceNo = 'Invoice number is required.';
    if (!clientId) formErrors.clientId = 'Please select a customer.';
    if (orderItems.length === 0) formErrors.items = 'Please add at least one line item to the order.';

    // Validate each order line
    orderItems.forEach((line, index) => {
      if (!line.itemId) {
        formErrors[`line_${index}_item`] = 'Please select an item.';
      }
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsCheckingInvoice(true);
    try {
      // Check invoice number uniqueness on server
      const checkRes = await api.get(`/orders/check-invoice-number?invoiceNo=${encodeURIComponent(invoiceNo.trim())}&excludeId=${isEditMode ? id : 0}`);
      if (checkRes.data.exists) {
        setErrors({ invoiceNo: `Invoice number '${invoiceNo}' is already taken.` });
        setIsCheckingInvoice(false);
        return;
      }
    } catch (err) {
      console.error('Error checking invoice number uniqueness:', err);
    }
    setIsCheckingInvoice(false);

    const payload = {
      id: isEditMode ? parseInt(id) : 0,
      invoiceNo: invoiceNo.trim(),
      invoiceDate: new Date(invoiceDate).toISOString(),
      referenceNo: referenceNo.trim() || null,
      clientId: parseInt(clientId),
      address1: address1.trim() || null,
      address2: address2.trim() || null,
      address3: address3.trim() || null,
      suburb: suburb.trim() || null,
      state: state.trim() || null,
      postCode: postCode.trim() || null,
      orderItems: orderItems.map(item => ({
        id: item.id,
        itemId: parseInt(item.itemId),
        note: item.note.trim() || null,
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0,
        taxRate: parseFloat(item.taxRate) || 0
      }))
    };

    if (isEditMode) {
      dispatch(updateOrder({ id: parseInt(id), orderData: payload }))
        .unwrap()
        .then(() => {
          setSaveSuccess(true);
          setTimeout(() => navigate('/'), 1200);
        })
        .catch((err) => {
          setErrors({ submit: err.message || 'Failed to update sales order.' });
        });
    } else {
      dispatch(createOrder(payload))
        .unwrap()
        .then(() => {
          setSaveSuccess(true);
          setTimeout(() => navigate('/'), 1200);
        })
        .catch((err) => {
          setErrors({ submit: err.message || 'Failed to create sales order.' });
        });
    }
  };

  const handlePrintTrigger = () => {
    window.print();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 print-container">
      {/* Navigation & Header (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 no-print">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 font-semibold transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders List
        </button>
        
        {isEditMode && (
          <button
            onClick={handlePrintTrigger}
            className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-lg shadow-sm transition flex items-center gap-2 text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <Printer className="h-4 w-4" />
            Print Order Invoice
          </button>
        )}
      </div>

      {/* Forms Status Warnings */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center gap-3 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-450 no-print">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <span className="font-semibold text-sm">Sales order saved successfully! Redirecting...</span>
        </div>
      )}

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-800 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400 no-print">
          <AlertTriangle className="h-5 w-5 text-red-650" />
          <span className="font-semibold text-sm">{errors.submit}</span>
        </div>
      )}

      {errors.items && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-450 no-print">
          <AlertTriangle className="h-5 w-5 text-amber-650" />
          <span className="font-semibold text-sm">{errors.items}</span>
        </div>
      )}

      {/* Printable Wrapper */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700 print-card">
        {/* Printable Title Block */}
        <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 flex items-center justify-between dark:border-gray-700 dark:bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? `Edit Sales Order: ${invoiceNo}` : 'New Sales Order'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 no-print">
              Complete the customer details and line items below.
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-400 border border-gray-200 px-2 py-1 rounded dark:border-gray-700 print-only">
            INVOICE DOCUMENT
          </span>
        </div>

        <div className="p-6 space-y-8">
          {/* Header Layout: Customer and Invoice Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Customer Information Block */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider border-b border-gray-100 pb-1.5 dark:border-gray-700">
                Customer Details
              </h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 dark:text-gray-300">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={clientId}
                  onChange={handleClientChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white ${errors.clientId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                >
                  <option value="">Select a Customer</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.Name || c.name}</option>
                  ))}
                </select>
                {errors.clientId && <p className="text-red-500 text-xs mt-1">{errors.clientId}</p>}
              </div>

              {/* Autofilled/Editable Address Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 dark:text-gray-350">Address 1</label>
                  <input
                    type="text"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 dark:text-gray-350">Address 2</label>
                  <input
                    type="text"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 dark:text-gray-350">Address 3</label>
                  <input
                    type="text"
                    value={address3}
                    onChange={(e) => setAddress3(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 dark:text-gray-350">Suburb</label>
                  <input
                    type="text"
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 dark:text-gray-350">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 dark:text-gray-350">Post Code</label>
                    <input
                      type="text"
                      value={postCode}
                      onChange={(e) => setPostCode(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Meta Information Block */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider border-b border-gray-100 pb-1.5 dark:border-gray-700">
                Invoice Details
              </h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 dark:text-gray-350">
                  Invoice No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white ${errors.invoiceNo ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                  placeholder="Generating..."
                />
                {errors.invoiceNo && <p className="text-red-500 text-xs mt-1">{errors.invoiceNo}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 dark:text-gray-350">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 dark:text-gray-350">Reference No</label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
                  placeholder="e.g. Purchase Order #"
                />
              </div>
            </div>
          </div>

          {/* Line Items Table Block */}
          <div className="space-y-4 pt-4 border-t border-gray-150 dark:border-gray-700">
            <div className="flex justify-between items-center no-print">
              <h3 className="text-md font-bold text-gray-900 dark:text-white">Order Lines</h3>
              <button
                type="button"
                onClick={handleAddLine}
                className="px-3 py-1.5 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold rounded-lg transition flex items-center gap-1 text-xs dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950/20"
              >
                <Plus className="h-4 w-4" />
                Add Item Line
              </button>
            </div>

            {/* Grid Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 w-44">
                        Item Code
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 w-64">
                        Description
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Note
                      </th>
                      <th scope="col" className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 w-24">
                        Quantity
                      </th>
                      <th scope="col" className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 w-28">
                        Price
                      </th>
                      <th scope="col" className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 w-24">
                        Tax Rate %
                      </th>
                      <th scope="col" className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 w-28">
                        Excl Amount
                      </th>
                      <th scope="col" className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 w-28">
                        Tax Amount
                      </th>
                      <th scope="col" className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 w-28">
                        Incl Amount
                      </th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 w-12 no-print">
                        
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {orderItems.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-3 py-8 text-center text-sm text-gray-400 dark:text-gray-500 italic">
                          No items added. Click 'Add Item Line' to add products to this order.
                        </td>
                      </tr>
                    ) : (
                      orderItems.map((line, index) => (
                        <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-750">
                          {/* Item Code Dropdown */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <select
                              value={line.itemId}
                              onChange={(e) => handleItemSelect(index, e.target.value)}
                              className={`w-full border rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white ${errors[`line_${index}_item`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                            >
                              <option value="">Code</option>
                              {catalogItems.map(i => (
                                <option key={i.id} value={i.id}>{i.Code || i.code}</option>
                              ))}
                            </select>
                          </td>
                          {/* Item Description Dropdown */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <select
                              value={line.itemId}
                              onChange={(e) => handleItemSelect(index, e.target.value)}
                              className={`w-full border rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white ${errors[`line_${index}_item`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                            >
                              <option value="">Select Item</option>
                              {catalogItems.map(i => (
                                <option key={i.id} value={i.id}>{i.Description || i.description}</option>
                              ))}
                            </select>
                          </td>
                          {/* Note input */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <input
                              type="text"
                              value={line.note}
                              onChange={(e) => handleLineFieldChange(index, 'note', e.target.value)}
                              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
                              placeholder="Line note..."
                            />
                          </td>
                          {/* Quantity */}
                          <td className="px-3 py-3 whitespace-nowrap text-right">
                            <input
                              type="number"
                              value={line.quantity}
                              onChange={(e) => handleLineFieldChange(index, 'quantity', e.target.value)}
                              className="w-20 border border-gray-300 dark:border-gray-700 rounded-lg px-2.5 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
                              min="1"
                            />
                          </td>
                          {/* Price */}
                          <td className="px-3 py-3 whitespace-nowrap text-right text-sm">
                            <input
                              type="number"
                              step="0.01"
                              value={line.price}
                              onChange={(e) => handleLineFieldChange(index, 'price', e.target.value)}
                              className="w-24 border border-gray-300 dark:border-gray-700 rounded-lg px-2.5 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
                              min="0"
                            />
                          </td>
                          {/* Tax Rate */}
                          <td className="px-3 py-3 whitespace-nowrap text-right text-sm">
                            <input
                              type="number"
                              step="0.1"
                              value={line.taxRate}
                              onChange={(e) => handleLineFieldChange(index, 'taxRate', e.target.value)}
                              className="w-16 border border-gray-300 dark:border-gray-700 rounded-lg px-2.5 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
                              min="0"
                            />
                          </td>
                          {/* Calculations */}
                          <td className="px-3 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white font-medium">
                            {formatCurrency(line.exclAmount)}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(line.taxAmount)}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white font-semibold">
                            {formatCurrency(line.inclAmount)}
                          </td>
                          {/* Delete line action */}
                          <td className="px-3 py-3 whitespace-nowrap text-center text-sm no-print">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(index)}
                              className="p-1 text-gray-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition"
                              title="Remove Line"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bottom Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {/* Left side empty space or details */}
            <div className="text-xs text-gray-400 dark:text-gray-500">
              * Rates are automatically computed in real time. Please double check quantities and prices.
            </div>

            {/* Right side summary totals */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-250/60 ml-auto w-full md:w-96 dark:bg-gray-900 dark:border-gray-700 space-y-4 shadow-inner">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider dark:text-white border-b border-gray-200 pb-2 dark:border-gray-700">
                Summary
              </h3>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-450">
                <span>Total Excl:</span>
                <span className="font-medium">{formatCurrency(totalExcl)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-450">
                <span>Total Tax:</span>
                <span className="font-medium">{formatCurrency(totalTax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-950 dark:text-white border-t border-dashed border-gray-300 pt-3 dark:border-gray-700">
                <span>Total Incl:</span>
                <span>{formatCurrency(totalIncl)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer (Hidden on print) */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 no-print dark:bg-gray-900 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-lg transition text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={orderLoading || isCheckingInvoice}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {isCheckingInvoice ? 'Checking...' : orderLoading ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
