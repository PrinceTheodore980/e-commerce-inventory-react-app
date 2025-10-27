"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Package, Grid3x3, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Category', path: '/category', icon: Grid3x3 },
    { name: 'Cart', path: '/cart', icon: ShoppingCart, badge: totalItems },
    { name: 'Orders', path: '/orders', icon: Package },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full relative ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon size={24} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}