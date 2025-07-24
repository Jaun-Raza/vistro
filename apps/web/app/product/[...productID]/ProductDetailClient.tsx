"use client";

import { useState, useEffect, JSX } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from "../../CartContext";
import { ToastContainer } from '@/components/Toast';
import { getSingleProduct } from 'app/services/product';

interface ProductBundle {
    id: string;
    name: string;
    price: string;
    download: string;
    description: string;
    type: string;
    image: string;
    imageSource: string;
}

interface ProductDetails {
    images: string[];
    name: string;
    tagline: string;
    tags: string[];
    category: string;
    caption: string;
    download: string;
    description: string;
}

interface ProductLicenses {
    personal: string;
    commercial: string;
}

interface Product {
    productId: string;
    productDetails: ProductDetails;
    licenses: ProductLicenses;
    bundlesPersonal: ProductBundle[];
    bundlesCommercial: ProductBundle[];
    isVisible: boolean;
    createdAt: {
        $date: string;
    };
    updatedAt: {
        $date: string;
    };
    __v: number;
}

interface CartItem {
    imageUrl: string;
    id: string;
    name: string;
    tagline: string;
    price: number;
    licenseType: string;
    bundles: string[];
}

type LicenseType = "personal" | "commercial";

interface SelectedBundles {
    [bundleId: string]: boolean;
}

interface ExpandedBundles {
    [bundleId: string]: boolean;
}

interface ProductDetailClientProps {
    productId: string;
    initialProduct?: Product | null;
    initialError?: string | null;
}

export default function ProductDetailClient({ 
    productId, 
    initialProduct, 
    initialError 
}: ProductDetailClientProps): JSX.Element {
    const [product, setProduct] = useState<Product | null>(initialProduct || null);
    const [loading, setLoading] = useState<boolean>(!initialProduct);
    const [error, setError] = useState<string | null>(initialError || null);
    const [selectedImage, setSelectedImage] = useState<number>(0);
    const [licenseType, setLicenseType] = useState<LicenseType>("personal");
    const [selectedBundles, setSelectedBundles] = useState<SelectedBundles>({});
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [expandedBundles, setExpandedBundles] = useState<ExpandedBundles>({});
    const [showAllImages, setShowAllImages] = useState<boolean>(false);
    const [thumbnailStartIndex, setThumbnailStartIndex] = useState<number>(0);
    const { state, addItem, removeItem } = useCart();

    const VISIBLE_THUMBNAILS = 5;

    useEffect(() => {
        if (!initialProduct && !initialError && productId) {
            async function fetchProduct(productId: string): Promise<void> {
                try {
                    setLoading(true);
                    setError(null);
                    const response = await getSingleProduct(productId);

                    if (response.success && response.product) {
                        const productData = response.product;
                        setProduct(productData);

                        const hasPersonalLicense = Boolean(productData.licenses.personal && parseFloat(productData.licenses.personal) > 0);
                        const hasCommercialLicense = Boolean(productData.licenses.commercial && parseFloat(productData.licenses.commercial) > 0);

                        if (hasPersonalLicense) {
                            setLicenseType("personal");
                        } else if (hasCommercialLicense) {
                            setLicenseType("commercial");
                        }
                    } else {
                        setError('Product not found');
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching product:', error);
                    setError('Failed to load product');
                    setLoading(false);
                }
            }

            fetchProduct(productId);
        } else if (initialProduct) {
            const hasPersonalLicense = Boolean(initialProduct.licenses.personal && parseFloat(initialProduct.licenses.personal) > 0);
            const hasCommercialLicense = Boolean(initialProduct.licenses.commercial && parseFloat(initialProduct.licenses.commercial) > 0);

            if (hasPersonalLicense) {
                setLicenseType("personal");
            } else if (hasCommercialLicense) {
                setLicenseType("commercial");
            }
            setLoading(false);
        }
    }, [productId, initialProduct, initialError]);

    useEffect(() => {
        if (!product) return;

        let price = 0;

        const licensePrice = parseFloat(product.licenses[licenseType]) || 0;
        price = licensePrice;

        Object.keys(selectedBundles).forEach((bundleId: string) => {
            if (selectedBundles[bundleId]) {
                const bundles = licenseType === "personal"
                    ? product.bundlesPersonal
                    : product.bundlesCommercial;

                const bundle = bundles.find((b: ProductBundle) => b.id === bundleId);
                if (bundle) {
                    const bundlePrice = parseFloat(bundle.price) || 0;
                    price += bundlePrice;
                }
            }
        });

        setTotalPrice(price);
    }, [licenseType, selectedBundles, product]);

    const handleBundleToggle = (bundleId: string): void => {
        setSelectedBundles(prev => ({
            ...prev,
            [bundleId]: !prev[bundleId]
        }));
    };

    const handleLicenseChange = (type: LicenseType): void => {
        setLicenseType(type);
        setSelectedBundles({});
    };

    const toggleBundleDescription = (bundleId: string): void => {
        setExpandedBundles(prev => ({
            ...prev,
            [bundleId]: !prev[bundleId]
        }));
    };

    const handleThumbnailPrev = (): void => {
        setThumbnailStartIndex(prev => Math.max(0, prev - 1));
    };

    const handleThumbnailNext = (): void => {
        if (!product) return;
        setThumbnailStartIndex(prev => 
            Math.min(product.productDetails.images.length - VISIBLE_THUMBNAILS, prev + 1)
        );
    };

    const handleAddToCart = async (): Promise<void> => {
        if (!product) return;

        const bundles = licenseType === "personal"
            ? product.bundlesPersonal
            : product.bundlesCommercial;

        const selectedBundlesList = Object.keys(selectedBundles)
            .filter((id: string) => selectedBundles[id])
            .map((id: string) => bundles.find((b: ProductBundle) => b.id === id)?.name)
            .filter((name): name is string => Boolean(name));

        const cartItem: CartItem = {
            imageUrl: product.productDetails.images[0] || '/placeholder.jpg',
            id: product.productId,
            name: product.productDetails.name,
            tagline: product.productDetails.tagline,
            price: totalPrice,
            licenseType: licenseType,
            bundles: selectedBundlesList
        };

        await addItem(cartItem);
    };

    if (loading) {
        return (
            <div className="container min-h-screen pt-30 mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <div className="flex flex-row gap-4">
                            <div className="flex flex-col gap-2">
                                {[...Array(4)].map((_, index) => (
                                    <div key={index} className="w-16 h-16 bg-gray-700 animate-pulse rounded"></div>
                                ))}
                            </div>
                            <div className="flex-1 h-96 bg-gray-700 animate-pulse rounded-lg"></div>
                        </div>

                        <div className="space-y-4">
                            <div className="h-8 bg-gray-700 animate-pulse rounded w-1/2"></div>
                            <div className="grid grid-cols-1 gap-4">
                                {[...Array(3)].map((_, index) => (
                                    <div key={index} className="bg-gray-800 rounded-lg p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 bg-gray-700 animate-pulse rounded"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-6 bg-gray-700 animate-pulse rounded w-3/4"></div>
                                                <div className="h-4 bg-gray-700 animate-pulse rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="h-12 bg-gray-700 animate-pulse rounded w-4/5"></div>
                            <div className="h-6 bg-gray-700 animate-pulse rounded w-3/5"></div>
                            <div className="h-6 bg-gray-700 animate-pulse rounded w-24"></div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="h-6 bg-gray-700 animate-pulse rounded w-2/3"></div>
                                <div className="h-6 bg-gray-700 animate-pulse rounded w-2/3"></div>
                            </div>
                            <div className="h-8 bg-gray-700 animate-pulse rounded w-1/3"></div>
                        </div>

                        <div className="h-14 bg-gray-700 animate-pulse rounded w-full"></div>

                        <div className="space-y-2">
                            <div className="h-4 bg-gray-700 animate-pulse rounded w-full"></div>
                            <div className="h-4 bg-gray-700 animate-pulse rounded w-5/6"></div>
                            <div className="h-4 bg-gray-700 animate-pulse rounded w-4/5"></div>
                            <div className="h-4 bg-gray-700 animate-pulse rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container mx-auto py-16 flex items-center justify-center">
                <p className="text-lg text-red-500">{error || 'Product not found'}</p>
            </div>
        );
    }

    const activeBundles: ProductBundle[] = licenseType === "personal"
        ? product.bundlesPersonal || []
        : product.bundlesCommercial || [];

    const hasPersonalLicense: boolean = Boolean(product.licenses.personal && parseFloat(product.licenses.personal) > 0);
    const hasCommercialLicense: boolean = Boolean(product.licenses.commercial && parseFloat(product.licenses.commercial) > 0);

    const totalImages = product.productDetails.images.length;
    const visibleThumbnails = showAllImages 
        ? product.productDetails.images.slice(thumbnailStartIndex, thumbnailStartIndex + VISIBLE_THUMBNAILS)
        : product.productDetails.images.slice(0, VISIBLE_THUMBNAILS);

    return (
        <div className="container min-h-screen pt-30 mx-auto py-8 px-4">
            <div className="flex items-center space-x-2 text-3xl px-10 m-10 relative z-10">
                <p onClick={() => {
                    window.location.href = '/browse'
                }} className="text-white cursor-pointer font-medium">BROWSE</p>
                <span className="text-gray-400">/</span>
                <p onClick={() => {
                    window.location.href = `/product/${product?.productId}`
                }} className="text-white cursor-pointer uppercase font-medium">{product?.productDetails?.name}</p>
            </div>
            <ToastContainer position="top-right" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <div className="flex flex-row gap-4">
                        <div className="flex flex-col gap-2 relative">
                            {showAllImages && thumbnailStartIndex > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleThumbnailPrev}
                                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10 h-6 w-6 p-0 text-white hover:bg-gray-700 hover:text-white cursor-pointer"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </Button>
                            )}
                            
                            {visibleThumbnails.map((img: string, index: number) => {
                                const actualIndex = showAllImages ? thumbnailStartIndex + index : index;
                                return (
                                    <div
                                        key={actualIndex}
                                        className={`w-16 h-16 cursor-pointer border-2 transition-all duration-200 ${selectedImage === actualIndex ? 'border-blue-500' : 'border-gray-200'}`}
                                        onClick={() => setSelectedImage(actualIndex)}
                                    >
                                        <img
                                            src={img}
                                            alt={`Product thumbnail ${actualIndex + 1}`}
                                            className="w-full h-full object-cover"
                                            width={64}
                                            height={64}
                                        />
                                    </div>
                                );
                            })}

                            {!showAllImages && totalImages > VISIBLE_THUMBNAILS && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAllImages(true)}
                                    className="bg-transparent w-16 h-16 text-xs text-white border-gray-400 hover:bg-transparent flex flex-col items-center justify-center p-1 cursor-pointer"
                                >
                                    <span className="text-[15px] leading-tight text-white">More</span>
                                    <span className="text-[10px] text-gray-300">+{totalImages - VISIBLE_THUMBNAILS}</span>
                                </Button>
                            )}

                            {showAllImages && thumbnailStartIndex + VISIBLE_THUMBNAILS < totalImages && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleThumbnailNext}
                                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-10 h-6 w-6 p-0 text-white hover:bg-gray-700 hover:text-white cursor-pointer"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            )}

                            {showAllImages && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowAllImages(false);
                                        setThumbnailStartIndex(0);
                                    }}
                                    className="bg-transparent w-16 h-8 text-xs text-white border-gray-400 hover:bg-transparent hover:text-white cursor-pointer mt-2"
                                >
                                    Show Less
                                </Button>
                            )}
                        </div>

                        <div className="flex-1">
                            <img
                                src={product.productDetails.images[selectedImage] || '/placeholder.jpg'}
                                alt={product.productDetails.name}
                                className="w-full h-full rounded-lg object-cover"
                                width={600}
                                height={400}
                            />
                        </div>
                    </div>

                    {activeBundles.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-3xl font-bold text-white">
                                Available Bundles
                                <span className="ml-2 text-xl font-normal text-gray-300">
                                    ({licenseType === "personal" ? "Personal" : "Commercial"})
                                </span>
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {activeBundles.map((bundle: ProductBundle) => (
                                    <Card key={bundle.id} className="overflow-hidden">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-start gap-4">
                                                    {bundle.image && (
                                                        <img
                                                            src={bundle.image}
                                                            alt={bundle.name}
                                                            className="w-16 h-16 object-cover rounded"
                                                            width={64}
                                                            height={64}
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Checkbox
                                                                    id={`bundle-${bundle.id}`}
                                                                    checked={selectedBundles[bundle.id] || false}
                                                                    onCheckedChange={() => handleBundleToggle(bundle.id)}
                                                                />
                                                                <label htmlFor={`bundle-${bundle.id}`} className="font-semibold cursor-pointer text-xl">
                                                                    {bundle.name}
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="text-sm font-medium text-xl">
                                                                    {parseFloat(bundle.price) === 0 ? 'Included' : `+£${parseFloat(bundle.price).toFixed(2)}`}
                                                                </div>
                                                                {bundle.description && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => toggleBundleDescription(bundle.id)}
                                                                        className="p-1"
                                                                    >
                                                                        {expandedBundles[bundle.id] ?
                                                                            <ChevronUp className="h-5 w-5" /> :
                                                                            <ChevronDown className="h-5 w-5" />
                                                                        }
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {expandedBundles[bundle.id] && bundle.description && (
                                                    <div className="mt-4 pl-20">
                                                        <div className="prose prose-invert max-w-none">
                                                            <ReactMarkdown>{bundle.description}</ReactMarkdown>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div>
                        <h1 className="text-6xl font-bold text-white">{product.productDetails.name}</h1>
                        <p className="text-xl text-gray-300 mt-1">{product.productDetails.tagline}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            {hasPersonalLicense && (
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="license-personal"
                                        checked={licenseType === "personal"}
                                        onCheckedChange={() => handleLicenseChange("personal")}
                                    />
                                    <label htmlFor="license-personal" className="cursor-pointer text-white text-lg">
                                        Personal License - £{parseFloat(product.licenses.personal).toFixed(2)}
                                    </label>
                                </div>
                            )}
                            {hasCommercialLicense && (
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="license-commercial"
                                        checked={licenseType === "commercial"}
                                        onCheckedChange={() => handleLicenseChange("commercial")}
                                    />
                                    <label htmlFor="license-commercial" className="cursor-pointer text-white text-lg">
                                        Commercial License - £{parseFloat(product.licenses.commercial).toFixed(2)}
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="text-2xl font-bold mt-2 text-white">Total: £{totalPrice.toFixed(2)}</div>
                    </div>

                    <Button
                        onClick={handleAddToCart}
                        disabled={!hasPersonalLicense && !hasCommercialLicense}
                        className="w-full py-6 text-xl hover:cursor-pointer hover:text-white text-black bg-white"
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                    </Button>

                    <div>
                        <div className="prose prose-invert max-w-none text-gray-100 rounded-lg p-4 text-center whitespace-pre-line text-2xl">
                            <ReactMarkdown>{product.productDetails.description}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}