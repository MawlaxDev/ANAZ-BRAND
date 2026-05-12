/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Wallet } from 'lucide-react';
import { Expense } from '../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  editingExpense: Expense | null;
}

export default function ExpenseModal({ isOpen, onClose, onSubmit, editingExpense }: ExpenseModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setName('');
    setAmount(0);
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  useEffect(() => {
    if (editingExpense) {
      setName(editingExpense.name);
      setAmount(editingExpense.amount);
      setDate(editingExpense.date);
      setNotes(editingExpense.notes);
    } else {
      resetForm();
    }
  }, [editingExpense]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || amount <= 0) {
      alert('Please fill in name and valid amount');
      return;
    }
    onSubmit({ name, amount, date, notes, createdBy: editingExpense?.createdBy || '' });
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
        
        <div className="relative w-full max-w-lg bg-[#14161C] rounded-2xl shadow-2xl overflow-hidden border border-slate-800 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#0F1115]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-widest uppercase">
                  {editingExpense ? 'Modify Expense' : 'Add New Expense'}
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">
                  Financial Disbursement Record
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5 bg-[#14161C]">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expense Name / Vendor</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-slate-300 placeholder-slate-700 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Office Supplies, Rent, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transaction Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Additional Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-slate-300 placeholder-slate-700 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none transition-all"
                  placeholder="Disbursement details..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-[#0F1115] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all border border-indigo-400"
              >
                {editingExpense ? 'Update Record' : 'Log Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
