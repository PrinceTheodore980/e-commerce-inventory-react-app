"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Package } from 'lucide-react';

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  createdAt: string;
}

interface Order {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  items?: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Fetch orders for user ID 1 (default user)
      const ordersResponse = await fetch('/api/orders?userId=1');
      if (!ordersResponse.ok) throw new Error('Failed to fetch orders');
      
      const ordersData = await ordersResponse.json();
      
      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order: Order) => {
          const itemsResponse = await fetch(`/api/order-items?orderId=${order.id}`);
          const items = itemsResponse.ok ? await itemsResponse.json() : [];
          return { ...order, items };
        })
      );
      
      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen pb-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto p-4 pb-24">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">My Orders</h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg mb-4">No orders yet</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`${getStatusColor(order.status)} text-xs px-3 py-1 rounded-full font-semibold capitalize`}>
                    {order.status}
                  </span>
                </div>
                
                {order.items && order.items.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          Product #{item.productId} x {item.quantity}
                        </span>
                        <span className="font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-xl text-green-600">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}