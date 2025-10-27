"use client";

import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrderContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { addOrder } = useOrders();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    
    setIsCheckingOut(true);
    
    try {
      // Create order in database (using user ID 1 as default for now)
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1, // Default user - will be replaced with actual auth later
          total: totalPrice + 5, // Including delivery fee
          status: 'pending'
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const newOrder = await orderResponse.json();

      // Create order items in database
      for (const item of cart) {
        await fetch('/api/order-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: newOrder.id,
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })
        });
      }

      // Add to local orders context for immediate display
      addOrder(cart, totalPrice + 5);
      clearCart();
      
      toast.success('Order placed successfully!');
      router.push('/orders');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto p-4 pb-24">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Shopping Cart</h2>
        
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.id} className="bg-white border-2 border-gray-300 rounded-lg p-3 flex gap-3">
                  <div className="relative w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                    <p className="text-green-600 font-bold">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold px-3">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Delivery:</span>
                <span className="font-semibold">$5.00</span>
              </div>
              <div className="border-t-2 border-gray-300 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="font-bold text-xl text-green-600">
                    ${(totalPrice + 5).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? 'Processing...' : 'Place Order'}
            </button>
          </>
        )}
      </main>
      <BottomNav />
    </>
  );
}