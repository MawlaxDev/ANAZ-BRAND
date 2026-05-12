/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Expense } from '../types';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      setExpenses(expensesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'expenses');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'expenses');
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const expenseRef = doc(db, 'expenses', id);
      await updateDoc(expenseRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `expenses/${id}`);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `expenses/${id}`);
    }
  };

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense
  };
}
