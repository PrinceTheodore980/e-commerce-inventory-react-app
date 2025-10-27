"use client";

import { User } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';

export default function Header() {
  const { data: session, isPending } = useSession();

  return (
    <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 sticky top-0 z-40">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">ShopEasy</h1>
          <p className="text-xs opacity-90">Your One-Stop Shop</p>
        </div>
        {isPending ? (
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : session?.user ? (
          <Link href="/profile" className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-2 hover:bg-white/30 transition-colors">
            <User size={20} />
            <div className="text-sm">
              <div className="font-semibold">{session.user.name}</div>
            </div>
          </Link>
        ) : (
          <Link href="/login" className="bg-white/20 rounded-full px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}