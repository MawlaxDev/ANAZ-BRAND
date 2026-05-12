/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OrderStatus = 'unpaid' | 'paid' | 'waiting' | 'cancelled';

export interface OrderItem {
  id: string;
  description: string;
  pieces: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  location: string;
  date: string;
  items: OrderItem[];
  price: number;
  deliveryPrice: number;
  profit: number; // manually entered now
  notes: string;
  status: OrderStatus;
  createdAt: string;
  createdBy: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  notes: string;
  createdAt: string;
  createdBy: string;
}

export interface User {
  username: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
