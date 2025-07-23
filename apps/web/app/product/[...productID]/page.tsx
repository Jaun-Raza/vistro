import { Metadata } from 'next';
import { getSingleProduct } from 'app/services/product';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
    params: Promise<{ productID: string }>;
}

function stripMarkdown(text: string): string {
    return text
        .replace(/[#*`_~\[\]()]/g, '')
        .replace(/\n+/g, ' ')
        .trim()
        .substring(0, 160);
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const { productID } = await params;
        const response = await getSingleProduct(productID);
        
        if (response.success && response.product) {
            const product = response.product;
            
            const title = `${product.productDetails.name} | Vistro.shop`;
            const description = stripMarkdown(product.productDetails.description || product.productDetails.tagline || '');
            const image = product.productDetails.images?.[0] || '/placeholder.jpg';
            const url = `https://vistro.shop/product/${product.productId}`;

            const imageUrl = image.startsWith('http') ? image : `https://vistro.shop${image}`;

            return {
                title: {
                    absolute: title
                },
                description,
                keywords: [
                    ...(product.productDetails.tags || []),
                    product.productDetails.name,
                    product.productDetails.category,
                    'Roblox asset',
                    'buy Roblox',
                    'Vistro.shop'
                ].filter(Boolean),
                openGraph: {
                    title,
                    description,
                    images: [
                        {
                            url: imageUrl,
                            width: 1200,
                            height: 630,
                            alt: product.productDetails.name,
                        }
                    ],
                    url,
                    type: 'website',
                    siteName: 'Vistro.shop',
                    locale: 'en_GB',
                },
                twitter: {
                    card: 'summary_large_image',
                    title,
                    description,
                    images: [imageUrl],
                },
                alternates: {
                    canonical: url,
                },
                robots: {
                    index: true,
                    follow: true,
                    googleBot: {
                        index: true,
                        follow: true,
                        'max-video-preview': -1,
                        'max-image-preview': 'large',
                        'max-snippet': -1,
                    },
                },
            };
        } else {
            return {
                title: {
                    absolute: 'Product Not Found | Vistro.shop'
                },
                description: 'The requested product could not be found.',
                robots: {
                    index: false,
                    follow: false,
                },
            };
        }
    } catch (error) {
        console.error('Error generating metadata:', error);
        
        return {
            title: {
                absolute: 'Error Loading Product | Vistro.shop'
            },
            description: 'There was an error loading this product.',
            robots: {
                index: false,
                follow: false,
            },
        };
    }
}

export default async function ProductPage({ params }: PageProps) {
    const { productID } = await params;
    
    let initialProduct = null;
    let initialError = null;

    try {
        const response = await getSingleProduct(productID);
        if (response.success && response.product) {
            initialProduct = response.product;
        } else {
            initialError = 'Product not found';
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        initialError = 'Failed to load product';
    }

    return (
        <ProductDetailClient 
            productId={productID}
            initialProduct={initialProduct}
            initialError={initialError}
        />
    );
}