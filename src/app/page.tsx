"use client";

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen pb-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto p-4 pb-20">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">All Products</h2>
          <p className="text-gray-600 text-sm">Browse our collection</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {products.map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              category={product.category}
            />
          ))}
        </div>
      </main>
      <BottomNav />
    </>
  );
}