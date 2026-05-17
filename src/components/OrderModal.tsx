/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Order, OrderItem, OrderStatus } from '../types';
import { formatCurrency } from '../lib/utils';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: any) => void;
  editingOrder?: Order | null;
  allOrders?: Order[];
}

export default function OrderModal({ isOpen, onClose, onSubmit, editingOrder, allOrders = [] }: OrderModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<OrderItem[]>([{ id: crypto.randomUUID(), description: '', pieces: 1 }]);
  const [price, setPrice] = useState(0);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [profit, setProfit] = useState(0);
  const [notes, setNotes] = useState('');

  const customerHistory = allOrders
    .filter(o => o.customerPhone === customerPhone && o.id !== editingOrder?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setLocation('');
    setDate(new Date().toISOString().split('T')[0]);
    setItems([{ id: crypto.randomUUID(), description: '', pieces: 1 }]);
    setPrice(0);
    setDeliveryPrice(0);
    setProfit(0);
    setNotes('');
  };

  // Effect to load editing order data
  React.useEffect(() => {
    if (editingOrder) {
      setCustomerName(editingOrder.customerName);
      setCustomerPhone(editingOrder.customerPhone);
      setLocation(editingOrder.location);
      setDate(editingOrder.date);
      setItems(editingOrder.items);
      setPrice(editingOrder.price);
      setDeliveryPrice(editingOrder.deliveryPrice);
      setProfit(editingOrder.profit);
      setNotes(editingOrder.notes);
    } else {
      resetForm();
    }
  }, [editingOrder]);

  if (!isOpen) return null;

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), description: '', pieces: 1 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handlePriceChange = (val: number) => {
    setPrice(val);
    setProfit(val - deliveryPrice);
  };

  const handleDeliveryChange = (val: number) => {
    setDeliveryPrice(val);
    setProfit(price - val);
  };

  const handleConfirm = (status: OrderStatus) => {
    if (!customerName || !customerPhone) {
      alert('Please fill in customer details');
      return;
    }
    onSubmit({
      customerName,
      customerPhone,
      location,
      date,
      items,
      price,
      deliveryPrice,
      profit,
      notes,
      status: editingOrder ? editingOrder.status : status
    });
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
        
        <div className="relative w-full max-w-2xl bg-[#14161C] rounded-2xl shadow-2xl overflow-hidden border border-slate-800 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#0F1115]">
            <div>
              <h2 className="text-xl font-bold text-white tracking-widest uppercase">
                {editingOrder ? `Edit Order: #${editingOrder.orderNumber}` : 'Add Order'}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">
                {editingOrder ? 'Modification Status' : 'Order Status'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto bg-[#14161C]">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-slate-300 placeholder-slate-700 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                  placeholder="Name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-slate-300 placeholder-slate-700 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                  placeholder="76 123 456"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-slate-300 placeholder-slate-700 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                  placeholder="Location"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Entry Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Package Manifest</label>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-start animate-in slide-in-from-right-4 duration-300">
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-slate-300 placeholder-slate-700 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                      placeholder="Item Analysis"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      value={item.pieces}
                      onChange={(e) => updateItem(item.id, 'pieces', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                      min="1"
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Financials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unit Price ($)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Delivery ($)</label>
                <input
                  type="number"
                  value={deliveryPrice}
                  onChange={(e) => handleDeliveryChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Profit ($)</label>
                <input
                  type="number"
                  value={profit}
                  onChange={(e) => setProfit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-[#0F1115] border border-indigo-600/30 rounded-lg text-indigo-400 font-bold focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-slate-300 placeholder-slate-700 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none transition-all"
                placeholder="Additional Notes"
              />
            </div>

            {/* Customer History Section */}
            {customerHistory.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Customer Order History</h3>
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest bg-slate-800/50 px-2 py-0.5 rounded">
                    {customerHistory.length} Previous Records Found
                  </span>
                </div>
                <div className="space-y-2">
                  {customerHistory.slice(0, 5).map((prevOrder) => (
                    <div 
                      key={prevOrder.id} 
                      className="flex items-center justify-between p-3 bg-[#0F1115] border border-slate-800/50 rounded-xl hover:border-indigo-500/30 transition-all group"
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors uppercase tracking-widest">
                          #{prevOrder.orderNumber} — {prevOrder.date}
                        </span>
                        <span className="text-[9px] text-slate-600 font-bold uppercase truncate max-w-[200px]">
                          {prevOrder.items.map(i => i.description).join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400">{formatCurrency(prevOrder.price + prevOrder.deliveryPrice)}</span>
                        {prevOrder.status === 'paid' ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                        )}
                      </div>
                    </div>
                  ))}
                  {customerHistory.length > 5 && (
                    <p className="text-[9px] text-slate-600 font-bold uppercase text-center italic mt-2">
                      + {customerHistory.length - 5} more historical records exist in database
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-800 bg-[#0F1115] flex flex-wrap gap-3 items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
            >
              Abort
            </button>
            <button
              onClick={() => handleConfirm('waiting')}
              className="px-5 py-2.5 text-[10px] font-bold text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg border border-yellow-500/20 transition-all uppercase tracking-widest shadow-lg shadow-yellow-500/5"
            >
              Archive to Waiting
            </button>
            <button
              onClick={() => handleConfirm('cancelled')}
              className="px-5 py-2.5 text-[10px] font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-all uppercase tracking-widest shadow-lg shadow-red-500/5"
            >
              Mark Cancelled
            </button>
            <button
              onClick={() => handleConfirm('unpaid')}
              className="px-5 py-2.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg border border-indigo-400 transition-all uppercase tracking-widest shadow-lg shadow-indigo-600/20"
            >
              {editingOrder ? 'Update Record' : 'Commit Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
