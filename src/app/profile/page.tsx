"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { User, Package, Heart, LogOut, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
    createdAt: string;
    product: {
      id: number;
      name: string;
      price: number;
      category: string;
      image: string;
      description: string;
    };
  }>;
}

interface Favorite {
  id: number;
  userId: string;
  productId: number;
  createdAt: string;
  product: {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
    description: string;
  };
}

export default function ProfilePage() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchOrders();
      fetchFavorites();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/favorites?userId=${session?.user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleSignOut = async () => {
    const token = localStorage.getItem("bearer_token");

    const { error } = await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      toast.success("Logged out successfully");
      router.push("/");
    }
  };

  const removeFavorite = async (favoriteId: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/favorites?id=${favoriteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Removed from favorites");
        fetchFavorites();
      }
    } catch (error) {
      toast.error("Failed to remove from favorites");
    }
  };

  if (isPending) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen pb-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  if (!session?.user) return null;

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto p-4 pb-20">
        {/* User Info Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{session.user.name}</h2>
              <p className="text-sm opacity-90">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Package size={20} />
              <span className="text-sm font-medium">Orders</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Heart size={20} />
              <span className="text-sm font-medium">Favorites</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{favorites.length}</p>
          </div>
        </div>

        {/* Past Orders */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Package size={20} />
            Past Orders
          </h3>
          {loadingOrders ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
              <ShoppingBag size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">No orders yet</p>
              <p className="text-sm text-gray-500 mt-1">Start shopping to see your orders here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">Order #{order.id}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">${order.total.toFixed(2)}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Items:</p>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.product?.name || "Product"} x{item.quantity}
                            </span>
                            <span className="text-gray-600">${item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorites */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Heart size={20} />
            Favorite Items
          </h3>
          {loadingFavorites ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
              <Heart size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">No favorites yet</p>
              <p className="text-sm text-gray-500 mt-1">Add products to your favorites to see them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="relative">
                    <img
                      src={favorite.product?.image || "/placeholder.jpg"}
                      alt={favorite.product?.name}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      onClick={() => removeFavorite(favorite.id)}
                      className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm hover:bg-white"
                    >
                      <Heart size={16} className="text-red-500 fill-red-500" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-1">
                      {favorite.product?.name}
                    </h4>
                    <p className="text-blue-600 font-bold">${favorite.product?.price.toFixed(2)}</p>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                      {favorite.product?.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </main>
      <BottomNav />
    </>
  );
}
