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
  doc, 
  getDocs, 
  limit 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Order, OrderStatus } from '../types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => {
    try {
      const lastOrderQuery = query(collection(db, 'orders'), orderBy('orderNumber', 'desc'), limit(1));
      const lastOrderSnapshot = await getDocs(lastOrderQuery);
      let nextOrderNumber = 1001;
      if (!lastOrderSnapshot.empty) {
        nextOrderNumber = (lastOrderSnapshot.docs[0].data().orderNumber || 1000) + 1;
      }

      await addDoc(collection(db, 'orders'), {
        ...orderData,
        orderNumber: nextOrderNumber,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    }
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    try {
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `orders/${id}`);
    }
  };

  const togglePaid = async (id: string) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const newStatus: OrderStatus = order.status === 'paid' ? 'unpaid' : 'paid';
    await updateOrder(id, { status: newStatus });
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    await updateOrder(id, { status });
  };

  return {
    orders,
    loading,
    addOrder,
    updateOrder,
    deleteOrder,
    togglePaid,
    updateStatus: updateOrderStatus
  };
}
