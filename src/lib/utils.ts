/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order } from "../types";

export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function exportOrdersToCSV(orders: Order[]) {
  const headers = ['Order #', 'Customer', 'Phone', 'Location', 'Date', 'Items', 'Total Price', 'Delivery', 'Profit', 'Status', 'Created By'];
  const rows = orders.map(order => [
    order.orderNumber,
    order.customerName,
    order.customerPhone,
    order.location,
    order.date,
    order.items.map(i => `${i.description} (${i.pieces})`).join('; '),
    order.price + order.deliveryPrice,
    order.deliveryPrice,
    order.profit,
    order.status,
    order.createdBy
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportOrdersToJSON(orders: Order[]) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orders, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
