// app/product/[productID]/page.tsx (Server Component) - Simple version
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const { productID } = await params;
        const response = await getSingleProduct(productID);
        
        if (response.success && response.product) {
            const product = response.product;
            const title = `${product.productDetails.name} | Vistro.shop`;
            const description = stripMarkdown(product.productDetails.description || product.productDetails.tagline);
            const image = product.productDetails.images[0] || '/placeholder.jpg';
            const url = `https://vistro.shop/product/${product.productId}`;

            return {
                title,
                description,
                openGraph: {
                    title,
                    description,
                    images: [
                        {
                            url: image,
                            width: 1200,
                            height: 630,
                            alt: product.productDetails.name,
                        }
                    ],
                    url,
                    type: 'website',
                    siteName: 'Vistro.shop',
                },
                twitter: {
                    card: 'summary_large_image',
                    title,
                    description,
                    images: [image],
                },
            };
        }
    } catch (error) {
        console.error('Error generating metadata:', error);
    }

    return {
        title: 'Product | Vistro.shop',
        description: 'Explore high-quality Roblox assets at Vistro.shop',
    };
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