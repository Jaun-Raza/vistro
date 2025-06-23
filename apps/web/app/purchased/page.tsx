"use client"

import { useState, useEffect } from 'react';
import { Download, ShoppingBag, Calendar, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchUserOrders } from '../services/product';
import { initiateDownload } from '../services/product';
import Cookies from 'js-cookie'

interface Bundle {
  id: string;
  name: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  licenseType: string;
  bundles: string[];
  imageUrl?: string;
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  email: string;
}

interface DownloadButtonProps {
  label: string;
  onClick: () => void;
  loading?: boolean;
}

interface OrderCardProps {
  order: Order;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ label, onClick, loading = false }) => (
  <Button
    onClick={onClick}
    disabled={loading}
    variant="outline"
    className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors w-full justify-start text-sm cursor-pointer"
  >
    <Download size={16} className="mr-2" />
    {loading ? 'Downloading...' : label}
  </Button>
);

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [downloadingItems, setDownloadingItems] = useState<Set<string>>(new Set());

  const handleDownload = async (itemId: string, bundleName?: string): Promise<void> => {
    const downloadKey = `${itemId}-${bundleName || 'main'}`;
    setDownloadingItems(prev => new Set([...prev, downloadKey]));

    try {
      const token = Cookies.get('tok_UID');

      if (!token) {
        alert('Authentication token not found. Please log in again.');
        return;
      }

      const response = await initiateDownload(order.orderId, itemId, bundleName || '', token);

      const blob = response.data;

      if (blob && typeof blob === 'object' && blob.success === false) {
        alert(`Download failed: ${blob.error || 'Unknown error'}`);
        return;
      }

      if (blob instanceof Blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        let fileName =  `${bundleName || 'product'}.zip`;
        const disposition = response.headers['content-disposition'];

        if (disposition && disposition.includes('filename=')) {
          const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            console.log( match[1].replace(/['"]/g, ''))
            fileName = match[1].replace(/['"]/g, '');
          }
        }

        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        console.log('Download initiated successfully');
      } else {
        console.error('Unexpected response format:', response);
        alert('Download failed: Invalid response format');
      }

    } catch (error: any) {
      console.error('Download error:', error);
      alert(`Download failed: ${error.message || 'Network error'}`);
    } finally {
      setDownloadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(downloadKey);
        return newSet;
      });
    }
  };

  // ... rest of your component remains the same
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Order #{order.orderId.split('_')[1]}</h3>
            <div className="flex items-center text-lg text-gray-500 mt-1">
              <Calendar size={14} className="mr-1" />
              {formatDate(order.createdAt)}
            </div>
          </div>
          <div className="text-right">
            <Badge
              variant={order.status === 'completed' ? 'default' : 'secondary'}
              className="mb-1 text-lg"
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <p className="font-bold text-xl">£{order.total.toFixed(2)}</p>
            <div className="flex items-center text-sm text-gray-500">
              <CreditCard size={25} className="mr-1 " />
              {order.paymentMethod}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {order.items.map((item, index) => (
          <div key={`${item.id}-${index}`} className="mb-6 last:mb-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-2xl font-semibold text-gray-800">{item.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {item.licenseType}
                  </Badge>
                  <span className="text-sm text-gray-600">£{item.price.toFixed(2)}</span>
                </div>
              </div>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg ml-4"
                />
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-lg font-medium text-gray-700 mb-3">Available Downloads</h5>
              <div className="space-y-2">
                <DownloadButton
                  label={`${item.name} - Main Product`}
                  onClick={() => handleDownload(item.id)}
                  loading={downloadingItems.has(`${item.id}-main`)}
                />

                {item.bundles && item.bundles.length > 0 && item.bundles.map((bundle, bundleIndex) => (
                  <DownloadButton
                    key={`${item.id}-${bundle}-${bundleIndex}`}
                    label={`${item.name} - ${bundle} Bundle`}
                    onClick={() => handleDownload(item.id, bundle)}
                    loading={downloadingItems.has(`${item.id}-${bundle}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}> = ({ currentPage, totalPages, onPageChange, loading }) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className="flex items-center"
      >
        <ChevronLeft size={16} className="mr-1" />
        Previous
      </Button>

      <div className="flex space-x-1">
        {getVisiblePages().map((page, index) => (
          <Button
            key={index}
            variant={page === currentPage ? "default" : "outline"}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...' || loading}
            className={`min-w-[40px] ${page === '...' ? 'cursor-default' : ''}`}
          >
            {page}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className="flex items-center"
      >
        Next
        <ChevronRight size={16} className="ml-1" />
      </Button>
    </div>
  );
};

const MyPurchasedProducts: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [ordersPerPage] = useState<number>(10);

  const token = Cookies.get('tok_UID');

  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  useEffect(() => {
    const loadOrders = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchUserOrders(currentPage, token);

        if (data.success) {
          setOrders(data.data.orders);
          setTotalOrders(data.data.fullLength);
        } else {
          setError(data.error || 'Failed to load orders');
          setOrders([]);
          setTotalOrders(0);
        }

      } catch (err) {
        setError('Failed to load your purchased products. Please try again later.');
        setOrders([]);
        setTotalOrders(0);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadOrders();
    }
  }, [currentPage, token]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages && !loading) {
      setCurrentPage(page);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!token) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 min-h-screen">
        <div className="text-center py-12 pt-40">
          <p className="text-2xl text-gray-400">Please log in to view your purchased products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-screen mt-20">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center text-white">
          <ShoppingBag className="mr-2" />
          My Purchased Products
        </h1>
        <p className="text-xl text-gray-300">Download your purchased products and bundles</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">You haven't purchased any products yet.</p>
          <Button className="mt-4">
            Browse Store
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {orders.map(order => (
              <OrderCard
                key={order._id}
                order={order}
              />
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </>
      )}
    </div>
  );
};

export default MyPurchasedProducts;