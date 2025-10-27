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

export default function CategoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'groceries', label: 'Groceries' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'dress', label: 'Dress' },
  ];

  useEffect(() => {
    const url = selectedCategory === 'all' 
      ? '/api/products' 
      : `/api/products?category=${selectedCategory}`;
    
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  }, [selectedCategory]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'price-low') {
      return a.price - b.price;
    } else if (sortBy === 'price-high') {
      return b.price - a.price;
    }
    return 0;
  });

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto p-4 pb-24">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Categories</h2>
        
        <div className="mb-4 space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Filter by Category:
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-full border-2 transition ${
                    selectedCategory === cat.value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Showing {sortedProducts.length} products
            </p>
            <div className="grid grid-cols-2 gap-4">
              {sortedProducts.map(product => (
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
          </>
        )}
      </main>
      <BottomNav />
    </>
  );
}
