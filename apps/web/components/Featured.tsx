"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Product from './Product';
import { BlurFade } from './magicui/blur-fade';
import { getFeaturedProducts } from '../app/services/product';

interface ProductData {
  id: string;
  title: string;
  subtitle: string;
  licenses: {
    personal: string
  }
  images: string[];
  tags: string[];
  badgeText: string;
}

interface ApiProduct {
  productId: string;
  productDetails: {
    name: string;
    tagline: string;
    images: string[];
    tags: string[];
    caption: string;
  };
  licenses: {
    personal: string;
  }
}

interface ApiResponse {
  success: boolean;
  data?: {
    products: ApiProduct[];
  };
  error?: string;
}

const Featured: React.FC = () => {
  const [isInView, setIsInView] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsInView(true);
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const response: ApiResponse = await getFeaturedProducts();

      if (response.success && response.data) {
        const transformedProducts: ProductData[] = response.data.products.map((product: ApiProduct) => ({
          id: product.productId,
          title: product.productDetails.name,
          subtitle: product.productDetails.tagline,
          licenses: {
            personal: product.licenses.personal
          },
          images: product.productDetails.images || [],
          tags: product.productDetails.tags || [],
          badgeText: product.productDetails.caption
        }));

        setProducts(transformedProducts);
      } else {
        setError(response.error || 'Failed to fetch featured products');
      }
    } catch (err) {
      console.error('Error fetching featured products:', err);
      setError('Failed to load featured products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-6 md:p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Featured Products</h1>
            <p className="text-2xl text-white/80 max-w-2xl mx-auto">
              Loading our elite picks...
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className=" rounded-lg shadow-md p-4 animate-pulse">
                <div className="h-48 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 md:p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Featured Products</h1>
            <p className="text-2xl text-gray-500 max-w-2xl mx-auto">
              {error}
            </p>
            <button
              onClick={fetchFeaturedProducts}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-12 relative overflow-hidden">
   
      <div className="relative z-10">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Featured Products</h1>
          <p className="text-2xl text-white max-w-2xl mx-auto">
            Vistro's Elite Picks Crafted for the Boldest Gamers.
          </p>
        </motion.div>

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
        >
          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => (
                <BlurFade key={`${product.id}-${index}`} delay={0.25 + index} inView>
                  <Product
                    id={product.id}
                    title={product.title}
                    subtitle={product.subtitle}
                    price={product?.licenses?.personal}
                    images={product.images || [""]}
                    tags={product.tags}
                    badgeText={product.badgeText}
                  />
                </BlurFade>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-lg">No featured products available at the moment.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Featured;