"use client";

import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function ProductCard({ id, name, price, image, category }: ProductCardProps) {
  const { addToCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  useEffect(() => {
    if (session?.user) {
      checkIfFavorite();
    }
  }, [session, id]);

  const checkIfFavorite = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/favorites?userId=${session?.user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const favorites = await response.json();
        const favorite = favorites.find((fav: any) => fav.productId === id);
        if (favorite) {
          setIsFavorite(true);
          setFavoriteId(favorite.id);
        }
      }
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const handleAddToCart = () => {
    addToCart({ id, name, price, image });
    toast.success(`${name} added to cart!`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!session?.user) {
      toast.error('Please login to add favorites');
      router.push('/login');
      return;
    }

    setIsLoadingFavorite(true);

    try {
      const token = localStorage.getItem('bearer_token');

      if (isFavorite && favoriteId) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?id=${favoriteId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsFavorite(false);
          setFavoriteId(null);
          toast.success('Removed from favorites');
        } else {
          toast.error('Failed to remove from favorites');
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: session.user.id,
            productId: id,
          }),
        });

        if (response.ok) {
          const newFavorite = await response.json();
          setIsFavorite(true);
          setFavoriteId(newFavorite.id);
          toast.success('Added to favorites');
        } else {
          const errorData = await response.json();
          if (errorData.code === 'DUPLICATE_FAVORITE') {
            toast.info('Already in favorites');
          } else {
            toast.error('Failed to add to favorites');
          }
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-3 shadow-sm hover:shadow-md transition">
      <div className="relative h-40 mb-3 bg-gray-100 rounded overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
        <button
          onClick={handleToggleFavorite}
          disabled={isLoadingFavorite}
          className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm hover:bg-white transition-colors disabled:opacity-50"
        >
          <Heart 
            size={18} 
            className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'} 
          />
        </button>
      </div>
      <div className="space-y-2">
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          {category}
        </span>
        <h3 className="font-semibold text-sm line-clamp-2">{name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-green-600">${price.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}