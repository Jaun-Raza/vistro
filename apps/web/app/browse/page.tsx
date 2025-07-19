"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationLink } from "@/components/ui/pagination";
import Product from "@/components/Product";
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getProducts, searchProduct } from '../services/product';

import Maps from '../assets/category_tabs/maps.png';
import Games from '../assets/category_tabs/games.png';
import UI from '../assets/category_tabs/UI.png';
import Script from '../assets/category_tabs/script.jpg';
import Vehicles from '../assets/category_tabs/vehicles.png';
import Audio from '../assets/category_tabs/audio.png';
import Models from '../assets/category_tabs/models.png';

interface ProductProps {
  productId: string;
  productDetails: {
    caption: string;
    images: string[];
    name: string;
    tagline: string;
    tags: string[];
  };
  licenses: {
    personal: string; 
  };
}

// Split categories into two rows
const topRowCategories = [
  { name: "AUDIO", imageUrl: Audio },
  { name: "CLOTHING", imageUrl: Models },
  { name: "GAMES", imageUrl: Games },
  { name: "GRAPHICS & UI", imageUrl: UI },
];

const bottomRowCategories = [
  { name: "MAPS", imageUrl: Maps },
  { name: "MODELS", imageUrl: Models },
  { name: "SCRIPTS", imageUrl: Script },
  { name: "VEHICLES", imageUrl: Vehicles },
];

const PRODUCTS_PER_PAGE = 8;

export default function Page() {
  const [isInView, setIsInView] = useState(false);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("lowest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    setIsInView(true);
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortOrder, selectedCategory, selectedFilter, selectedTag]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (search.trim()) {
        handleSearch();
      } else {
        fetchProducts();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts({
        page: currentPage,
        sortBy: sortOrder,
        category: selectedCategory,
        filter: selectedFilter,
        tags: selectedTag
      });
      if (response.success) {
        setProducts(response.data.products);
        setTotalProducts(response.data.fullLength);

        setAvailableTags(response.data.availableFetchedtags);
      } else {
        console.error('Failed to fetch products:', response.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;

    setLoading(true);
    try {
      const response = await searchProduct(search, {
        page: currentPage,
        sortBy: sortOrder,
        category: selectedCategory,
        filter: selectedFilter,
      });
      if (response.success) {
        setProducts(response.products);
        setTotalProducts(response.products.length);
        setCurrentPage(1);
      } else {
        console.error('Search failed:', response.error);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setSortOrder("lowest");
    setSelectedCategory("All");
    setSelectedFilter("all");
    setSelectedTag("all");
    setCurrentPage(1);
  };

  const formatProductForComponent = (product: ProductProps) => ({
    id: product.productId,
    title: product.productDetails.name,
    subtitle: product.productDetails.tagline,
    price: product.licenses.personal,
    images: product.productDetails.images,
    tags: product.productDetails.tags,
    badgeText: product.productDetails.caption,
    category: product.productDetails.tags[0] || "Other"
  });

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  return (
    <div className="min-h-screen ">
      {/* Background grid */}

      <div className="relative z-10 pt-4 pb-4 container mx-auto pt-23">
        <div className="grid grid-cols-4 gap-2 pt-4 mb-2 px-5">
          {topRowCategories.map((category, index) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`relative h-32 overflow-hidden rounded-md transition-all duration-200 ${selectedCategory === category.name ? "ring-4 ring-blue-600" : ""
                } ${index > 3 ? "col-span-2" : ""}`}
            >
              <div className="absolute inset-0">
                <Image
                  src={category.imageUrl}
                  alt={`${category.name} category`}
                  fill
                  className="object-cover z-1"
                  priority
                />
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl md:text-4xl font-bold text-white z-2">{category.name}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2 px-5">
          {bottomRowCategories.map((category, index) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`relative h-32 overflow-hidden rounded-md transition-all duration-200 ${selectedCategory === category.name ? "ring-4 ring-blue-600" : ""
                } ${index > 3 ? "col-span-2" : ""}`}
            >
              <div className="absolute inset-0">
                <Image
                  src={category.imageUrl}
                  alt={`${category.name} category`}
                  fill
                  className="object-cover z-1"
                  priority
                />
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl md:text-4xl font-bold text-white z-2">{category.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2 text-3xl px-10 m-10 relative z-10">
        <a href="/" className="text-gray-500 hover:text-gray-700 font-medium">HOME</a>
        <span className="text-gray-400">/</span>
        <a href="/browse" className="text-white font-medium">BROWSE</a>
      </div>

      <div className="flex flex-col gap-4 md:flex-row-reverse relative z-10 container mx-auto">
        <aside className="w-[90%] md:w-1/4 border border-black p-4 rounded-sm space-y-4 ml-4 h-fit">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                />
              </svg>
            </span>

            <Input
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-white placeholder-gray-400 bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <h2 className="font-semibold mb-2 text-xl text-white">Sort By</h2>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full text-base border-gray-300 text-white">
                {
                  sortOrder === "lowest" ? "Price: Low to High" :
                    sortOrder === "highest" ? "Price: High to Low" :
                      sortOrder === "bestSellers" ? "Best Sellers" :
                        sortOrder === "recentlyUpdated" ? "Recently Updated" :
                          "Recently Uploaded"
                }
              </SelectTrigger>
              <SelectContent className="text-black">
                <SelectItem value="lowest" className="text-base">Price: Low to High</SelectItem>
                <SelectItem value="highest" className="text-base">Price: High to Low</SelectItem>
                <SelectItem value="bestSellers" className="text-base">Best Sellers</SelectItem>
                <SelectItem value="recentlyUpdated" className="text-base">Recently Updated</SelectItem>
                <SelectItem value="recentlyUploaded" className="text-base">Recently Uploaded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <h2 className="font-semibold mb-2 text-xl text-white">Filter</h2>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full text-base border-gray-300 text-white">
                {selectedFilter === "all" ? "All Products" :
                  selectedFilter === "new" ? "New Products" :
                    selectedFilter === "sale" ? "On Sale" : "Featured"}
              </SelectTrigger>
              <SelectContent className="text-black">
                <SelectItem value="all" className="text-base">All Products</SelectItem>
                <SelectItem value="new" className="text-base">New Products</SelectItem>
                <SelectItem value="sale" className="text-base">On Sale</SelectItem>
                <SelectItem value="featured" className="text-base">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <h2 className="font-semibold mb-2 text-xl text-white">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {availableTags.slice(0, 6).map((tag) => (
                <Button
                  key={tag}
                  size="sm"
                  variant="outline"
                  className="text-black text-base border-gray-300"
                  onClick={() => {
                    setSelectedTag(tag);
                  }}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <Button
              size="lg"
              className="text-xl p-4 w-full bg-white hover:bg-gray-200 text-black cursor-pointer"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </div>
        </aside>

        {/* Main product area */}
        <main className="w-full p-5">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-600">Loading products...</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Product key={product.productId} {...formatProductForComponent(product)} />
                ))}
              </div>

              {products.length === 0 && loading && (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600">No products found</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="my-8 mb-50 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                          className="text-lg text-white"
                          aria-disabled={currentPage === 1}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <PaginationItem key={idx}>
                          <PaginationLink
                            isActive={currentPage === idx + 1}
                            onClick={() => setCurrentPage(idx + 1)}
                            className={currentPage === idx + 1 ? "font-bold text-lg text-white" : "text-lg"}
                          >
                            {idx + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                          className="text-lg text-white"
                          aria-disabled={currentPage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}