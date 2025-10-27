"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from './CartContext';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (items: CartItem[], total: number) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('orders');
    if (saved) {
      setOrders(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (items: CartItem[], total: number) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      items,
      total,
      date: new Date().toLocaleDateString(),
      status: 'Processing'
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
}
