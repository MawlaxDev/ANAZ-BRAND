/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  PlusCircle, 
  Download, 
  LogOut, 
  Table as TableIcon, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  Menu,
  ChevronLeft,
  Edit2,
  Wallet,
  ArrowDownCircle,
  Trash2
} from 'lucide-react';
import { Order, User, OrderStatus, Expense } from '../types';
import { useOrders } from '../hooks/useOrders';
import { useExpenses } from '../hooks/useExpenses';
import { cn, formatCurrency, exportOrdersToCSV, exportOrdersToJSON } from '../lib/utils';
import OrderModal from './OrderModal';
import ExpenseModal from './ExpenseModal';
import Logo from './Logo';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const { orders, loading: ordersLoading, addOrder, updateOrder, deleteOrder, togglePaid, updateStatus } = useOrders();
  const { expenses, loading: expensesLoading, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [activeTab, setActiveTab] = useState<'orders' | 'waiting' | 'cancelled' | 'expenses'>('orders');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Editing contexts
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  // Deletion contexts
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteExpenseId, setConfirmDeleteExpenseId] = useState<string | null>(null);

  const loading = ordersLoading || expensesLoading;

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const filteredOrders = orders.filter(order => {
    // Tab filter
    if (activeTab === 'orders' && !['unpaid', 'paid'].includes(order.status)) return false;
    if (activeTab === 'waiting' && order.status !== 'waiting') return false;
    if (activeTab === 'cancelled' && order.status !== 'cancelled') return false;

    // Search query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchLower) ||
      order.location.toLowerCase().includes(searchLower) ||
      order.customerPhone.includes(searchQuery) ||
      order.orderNumber.toString().includes(searchQuery);
    if (!matchesSearch) return false;

    // Payment filter - can explicitly filter inside "Orders"
    if (paymentFilter === 'paid' && order.status !== 'paid') return false;
    if (paymentFilter === 'unpaid' && order.status !== 'unpaid') return false;

    // Date range filter
    if (startDate && order.date < startDate) return false;
    if (endDate && order.date > endDate) return false;

    return true;
  });

  const filteredExpenses = expenses.filter(expense => {
    if (activeTab !== 'expenses') return false;

    // Search query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      expense.name.toLowerCase().includes(searchLower) ||
      expense.notes.toLowerCase().includes(searchLower);
    if (!matchesSearch) return false;

    // Date range filter
    if (startDate && expense.date < startDate) return false;
    if (endDate && expense.date > endDate) return false;

    return true;
  });

  const activeOrdersCount = orders.filter(o => ['unpaid', 'paid'].includes(o.status)).length;
  const waitingCount = orders.filter(o => o.status === 'waiting').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;
  const expensesCount = expenses.length;

  const filteredProfit = activeTab === 'expenses' ? 0 : filteredOrders.reduce((sum, o) => sum + o.profit, 0);
  const filteredUnitPriceTotal = activeTab === 'expenses' ? 0 : filteredOrders.reduce((sum, o) => sum + o.price, 0);
  const filteredDeliveryTotal = activeTab === 'expenses' ? 0 : filteredOrders.reduce((sum, o) => sum + o.deliveryPrice, 0);
  const filteredExpensesTotal = activeTab === 'expenses' ? filteredExpenses.reduce((sum, e) => sum + e.amount, 0) : 0;

  const handleAddOrUpdate = (orderData: any) => {
    if (editingOrder) {
      updateOrder(editingOrder.id, orderData).catch(console.error);
    } else {
      addOrder({
        ...orderData,
        createdBy: user.name
      }).catch(console.error);
    }
    setEditingOrder(null);
  };

  const startEdit = (order: Order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleAddOrUpdateExpense = (expenseData: any) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData).catch(console.error);
    } else {
      addExpense({
        ...expenseData,
        createdBy: user.name
      }).catch(console.error);
    }
    setEditingExpense(null);
  };

  const startEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const closePortal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
  };

  const closeExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] flex flex-col md:flex-row text-slate-300 font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "bg-[#14161C] border-r border-slate-800 flex flex-col transition-all duration-300 overflow-hidden shrink-0",
        isSidebarOpen ? "w-full md:w-64" : "w-0 opacity-0"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
            <Logo size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight uppercase tracking-widest whitespace-nowrap">ANAZ BRAND</span>
        </div>

        <nav className="flex-grow p-4 space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all",
              activeTab === 'orders' 
                ? "bg-slate-800/50 text-indigo-400 border-r-2 border-indigo-400" 
                : "hover:bg-slate-800/30 text-slate-400 hover:text-slate-100"
            )}
          >
            <ShoppingBag className="w-5 h-5" />
            Orders
            <span className={cn(
              "ml-auto px-2 py-0.5 rounded text-[10px] font-bold",
              activeTab === 'orders' ? "bg-indigo-600/20 text-indigo-400" : "bg-slate-800 text-slate-500 uppercase"
            )}>
              {activeOrdersCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('waiting')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all",
              activeTab === 'waiting' 
                ? "bg-slate-800/50 text-yellow-500 border-r-2 border-yellow-500" 
                : "hover:bg-slate-800/30 text-slate-400 hover:text-slate-100"
            )}
          >
            <Clock className="w-5 h-5" />
            Waiting List
            <span className={cn(
              "ml-auto px-2 py-0.5 rounded text-[10px] font-bold",
              activeTab === 'waiting' ? "bg-yellow-500/20 text-yellow-500" : "bg-slate-800 text-slate-500 uppercase"
            )}>
              {waitingCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all",
              activeTab === 'cancelled' 
                ? "bg-slate-800/50 text-red-400 border-r-2 border-red-400" 
                : "hover:bg-slate-800/30 text-slate-400 hover:text-slate-100"
            )}
          >
            <XCircle className="w-5 h-5" />
            Cancelled
            <span className={cn(
              "ml-auto px-2 py-0.5 rounded text-[10px] font-bold",
              activeTab === 'cancelled' ? "bg-red-500/20 text-red-500" : "bg-slate-800 text-slate-500 uppercase"
            )}>
              {cancelledCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all",
              activeTab === 'expenses' 
                ? "bg-slate-800/50 text-orange-400 border-r-2 border-orange-400" 
                : "hover:bg-slate-800/30 text-slate-400 hover:text-slate-100"
            )}
          >
            <Wallet className="w-5 h-5" />
            Expenses
            <span className={cn(
              "ml-auto px-2 py-0.5 rounded text-[10px] font-bold",
              activeTab === 'expenses' ? "bg-orange-600/20 text-orange-400" : "bg-slate-800 text-slate-500 uppercase"
            )}>
              {expensesCount}
            </span>
          </button>
          <div className="h-px bg-slate-800/50 my-4 mx-2" />
          {activeTab === 'expenses' ? (
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-white bg-orange-600 hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/20 uppercase tracking-widest"
            >
              <PlusCircle className="w-5 h-5" />
              New Expense
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest"
            >
              <PlusCircle className="w-5 h-5" />
              New Order
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 mb-4 border border-slate-800/50">
            <div className="w-10 h-10 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold italic">
              {user.username.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate tracking-tight">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase truncate tracking-widest">Administrator</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all uppercase tracking-widest"
          >
            <LogOut className="w-5 h-5" />
            Exit Console
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-slate-800 px-8 flex items-center gap-4 bg-[#0F1115]">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-sm md:text-lg font-bold text-white uppercase tracking-[0.2em] flex-grow">
            {activeTab === 'orders' 
              ? 'Order Management' 
              : activeTab === 'waiting' 
                ? 'Waiting List Queue' 
                : activeTab === 'cancelled'
                  ? 'Cancelled / Revoked'
                  : 'Expense Tracking'}
          </h1>
        </header>

        <div className="flex-grow overflow-y-auto p-4 md:p-8 space-y-8 pb-12">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#14161C] border border-slate-800 p-5 rounded-xl flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {activeTab === 'expenses' ? <Wallet className="w-16 h-16 text-orange-500" /> : <ShoppingBag className="w-16 h-16 text-indigo-500" />}
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-1">
                {activeTab === 'expenses' ? 'Disbursements' : 'Unit Count'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-light text-white italic">
                  {activeTab === 'expenses' ? filteredExpenses.length : filteredOrders.length}
                </span>
                <span className="text-[9px] text-indigo-400 font-bold uppercase">
                  {activeTab === 'expenses' ? 'Expenses Logged' : 'Orders Found'}
                </span>
              </div>
            </div>
            
            {activeTab === 'expenses' ? (
              <div className="bg-[#14161C] border border-slate-800 p-5 rounded-xl flex flex-col relative overflow-hidden group border-orange-500/20">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ArrowDownCircle className="w-16 h-16 text-orange-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-1">Total Expenses</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-light text-orange-400 italic">{formatCurrency(filteredExpensesTotal)}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Outbound Funds</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#14161C] border border-slate-800 p-5 rounded-xl flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp className="w-16 h-16 text-red-500" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-1">Total in unit price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-light text-white italic">{formatCurrency(filteredUnitPriceTotal)}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Orders Value</span>
                </div>
              </div>
            )}

            <div className="bg-[#14161C] border border-slate-800 p-5 rounded-xl flex flex-col relative overflow-hidden group border-indigo-500/20">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <DollarSign className="w-16 h-16 text-indigo-400" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-1">Total of Delivery</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-light text-white italic">{formatCurrency(filteredDeliveryTotal)}</span>
                <span className="text-[9px] text-indigo-400 font-bold uppercase">Logistics</span>
              </div>
            </div>
            <div className="bg-[#14161C] border border-slate-800 p-5 rounded-xl flex flex-col shadow-lg shadow-green-500/5 relative overflow-hidden group border-green-500/20">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp className="w-16 h-16 text-green-500" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-1">Profit Analytics</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-light text-white italic">{formatCurrency(filteredProfit)}</span>
                <span className="text-[9px] text-green-500 font-bold uppercase">Net Yield</span>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-[#14161C] border border-slate-800 p-4 rounded-xl shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search by ID, name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-sm text-slate-300 placeholder-slate-600 focus:ring-2 focus:ring-indigo-600 outline-none transition-all shadow-inner"
                />
              </div>
              
              {/* Payment Filter */}
              <div className="w-full lg:w-48">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-xs font-bold text-slate-400 uppercase tracking-widest focus:ring-2 focus:ring-indigo-600 outline-none transition-all cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Not Paid</option>
                </select>
              </div>

              {/* Date Filters */}
              <div className="flex items-center gap-2 bg-[#0F1115] border border-slate-800 rounded-lg p-1">
                <div className="pl-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-bold text-slate-400 focus:ring-0 outline-none w-28 uppercase"
                />
                <span className="text-slate-700 text-xs">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-bold text-slate-400 focus:ring-0 outline-none w-28 uppercase mr-2"
                />
              </div>

              {(searchQuery || startDate || endDate || paymentFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStartDate('');
                    setEndDate('');
                    setPaymentFilter('all');
                  }}
                  className="flex items-center justify-center p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-red-500/20"
                  title="Clear Filters"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Table Area */}
          <div className="bg-[#14161C] border border-slate-800 rounded-xl flex flex-col shadow-xl">
            <div className="overflow-x-auto min-h-[400px]">
              {activeTab === 'expenses' ? (
                <table className="w-full text-left">
                  <thead className="bg-slate-800/30 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Source / Name</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Transaction Date</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Intelligence / Notes</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Syncing with Node...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-2 opacity-30">
                            <AlertCircle className="w-12 h-12" />
                            <p className="text-sm font-medium uppercase tracking-[0.1em]">No disbursements logged</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-slate-800/20 transition-colors group">
                          <td className="px-6 py-5">
                            <p className="text-sm font-bold text-white tracking-wide">{expense.name}</p>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 opacity-50">BY: {expense.createdBy}</p>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <p className="text-sm font-bold text-orange-400">{formatCurrency(expense.amount)}</p>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{expense.date}</p>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm text-slate-300 max-w-xs truncate">{expense.notes || 'No extra intel.'}</p>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEditExpense(expense)}
                                className="p-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded hover:text-white transition-all shadow-sm"
                                title="Modify Record"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteExpenseId(expense.id)}
                                className="p-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded hover:text-red-400 transition-all shadow-sm"
                                title="Delete Persistent Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left">
                <thead className="bg-slate-800/30 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Contact Node</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Package Manifest</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Unit Price</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Delivery</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Profit</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Syncing with Node...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-30">
                          <AlertCircle className="w-12 h-12" />
                          <p className="text-sm font-medium uppercase tracking-[0.1em]">No records matching current filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/20 transition-colors group">
                        <td className="px-6 py-5">
                          <span className="font-mono text-[10px] font-bold text-slate-600 block mb-1 uppercase">Order Code</span>
                          <span className="font-mono text-sm text-slate-400">#{order.orderNumber}</span>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-white tracking-wide">{order.customerName}</p>
                          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter mt-0.5">{order.customerPhone} • {order.location}</p>
                          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 opacity-50">BY: {order.createdBy}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-300 max-w-xs truncate">
                            {order.items.map(i => `${i.description} (${i.pieces})`).join(', ')}
                          </p>
                          <p className="text-[10px] text-slate-600 italic mt-0.5">{order.date}</p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <p className="text-sm font-bold text-slate-300">{formatCurrency(order.price)}</p>
                          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Base Cost</p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <p className="text-sm font-bold text-slate-400">{formatCurrency(order.deliveryPrice)}</p>
                          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Delivery</p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <p className="text-sm font-bold text-indigo-400">{formatCurrency(order.profit)}</p>
                          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Profit</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            {order.status === 'paid' ? (
                              <span className="px-2 py-1 text-[9px] font-bold uppercase rounded bg-green-500/10 text-green-500 border border-green-500/20 tracking-widest shadow-sm shadow-green-500/5">
                                Paid
                              </span>
                            ) : order.status === 'unpaid' ? (
                              <span className="px-2 py-1 text-[9px] font-bold uppercase rounded bg-red-500/10 text-red-500 border border-red-500/20 tracking-widest shadow-sm shadow-red-500/5" title="Not Paid">
                                Not Paid
                              </span>
                            ) : order.status === 'waiting' ? (
                              <span className="px-2 py-1 text-[9px] font-bold uppercase rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 tracking-widest shadow-sm shadow-yellow-500/5">
                                Waiting List
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-[9px] font-bold uppercase rounded bg-slate-500/10 text-slate-500 border border-slate-500/20 tracking-widest shadow-sm shadow-slate-500/5">
                                Cancelled
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(order)}
                              className="p-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded hover:text-white transition-all shadow-sm"
                              title="Modify Record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {order.status !== 'paid' && (
                              <button
                                onClick={() => togglePaid(order.id)}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded text-[9px] font-bold uppercase tracking-wider hover:bg-indigo-500 transition-all border border-indigo-400"
                              >
                                Mark Paid
                              </button>
                            )}
                            {order.status === 'paid' && (
                               <button
                                onClick={() => togglePaid(order.id)}
                                className="p-1.5 bg-slate-800 text-slate-500 rounded border border-slate-700 hover:text-slate-300"
                                title="Revert Payment Status"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                              </button>
                            )}
                            
                            {activeTab === 'cancelled' ? (
                              <button
                                onClick={() => updateStatus(order.id, 'unpaid')}
                                className="p-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded hover:text-indigo-400 transition-all shadow-sm"
                                title="Restore to Unpaid"
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                              </button>
                            ) : activeTab === 'waiting' ? (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => updateStatus(order.id, 'unpaid')}
                                  className="p-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded hover:text-green-400 transition-all shadow-sm"
                                  title="Approve Order"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => updateStatus(order.id, 'cancelled')}
                                  className="p-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded hover:text-red-400 transition-all shadow-sm"
                                  title="Decline/Cancel"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => updateStatus(order.id, 'waiting')}
                                  className="p-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded hover:text-yellow-400 transition-all shadow-sm"
                                  title="Move to Waiting"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => updateStatus(order.id, 'cancelled')}
                                  className="p-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded hover:text-red-400 transition-all shadow-sm"
                                  title="Move to Cancelled"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            <button
                              onClick={() => setConfirmDeleteId(order.id)}
                              className="p-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded hover:text-red-400 transition-all shadow-sm"
                              title="Delete Persistent Record"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

            {/* Pagination / Footer Info */}
            <div className="mt-auto border-t border-slate-800 p-4 flex justify-between items-center bg-[#181A20] rounded-b-xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Viewing Orders</p>
              <div className="flex gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 text-slate-600 cursor-not-allowed text-[10px]">PREV</button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 text-white font-bold text-[10px]">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 text-slate-400 text-[10px] hover:bg-slate-700">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 text-slate-400 text-[10px] hover:bg-slate-700">NEXT</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#14161C] border border-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2 uppercase tracking-wider">Authorize Purge?</h3>
            <p className="text-slate-400 text-center text-sm mb-8">
              This action will permanently erase the record from the persistent cluster. This operation cannot be reversed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
              >
                Abort
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteOrder(confirmDeleteId);
                    setConfirmDeleteId(null);
                  } catch (err) {
                    console.error("Purge failed:", err);
                    setConfirmDeleteId(null);
                  }
                }}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-600/20"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteExpenseId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#14161C] border border-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2 uppercase tracking-wider">Authorize Purge?</h3>
            <p className="text-slate-400 text-center text-sm mb-8">
              This action will permanently erase the expense record from the persistent cluster.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteExpenseId(null)}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
              >
                Abort
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteExpense(confirmDeleteExpenseId);
                    setConfirmDeleteExpenseId(null);
                  } catch (err) {
                    console.error("Purge failed:", err);
                    setConfirmDeleteExpenseId(null);
                  }
                }}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-600/20"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <OrderModal 
        isOpen={isModalOpen} 
        onClose={closePortal} 
        onSubmit={handleAddOrUpdate}
        editingOrder={editingOrder}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={closeExpenseModal}
        onSubmit={handleAddOrUpdateExpense}
        editingExpense={editingExpense}
      />
    </div>
  );
}
