"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getReviews } from 'app/services/reviewsAndContact';

interface Review {
    image?: string;
    review: string;
    author: string;
    rating: number; 
}

const Reviews = () => {
    const [current, setCurrent] = useState<number>(0);
    const [isInView, setIsInView] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);

    const fetchReviews = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getReviews();
            if (!response.success) {
                setError(response.error || 'Unknown error');
            } else {
                setReviews(response.reviews);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setIsInView(true);
        fetchReviews();
    }, []);

    useEffect(() => {
        if (reviews.length === 0) return;

        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % reviews.length);
        }, 25000);

        return () => clearInterval(interval);
    }, [reviews]);

    return (
        <div className="w-full min-h-screen p-6 md:p-12 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-t  z-10 pointer-events-none" />

            


            <div className="relative z-10">
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">See What People Say About Us</h1>
                    <p className="text-2xl text-white/80 max-w-2xl mx-auto">
                        Rated by the Community, Loved by All
                    </p>
                </motion.div>

                {!loading ? !error && reviews.length > 0 ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col md:flex-row mx-auto gap-6 items-center bg-[#2b2b2b] p-6 rounded-lg max-w-6xl w-full shadow-xl"
                        >
                            <div className="w-full md:w-1/2">
                                <img
                                    src={reviews[current]?.image || 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=612,h=464,fit=crop/mePvEyQ3R1fn93BY/untitled-3-mp8vLyR79JCPZ7lX.png'}
                                    alt="Review visual"
                                    width={600}
                                    height={400}
                                    className="rounded-lg w-full h-auto"
                                />
                            </div>
                            <div className="w-full md:w-1/2 text-white text-center md:text-left">
                                <div className="text-2xl mb-2">
                                    {Array(reviews[current]?.rating).fill(null).map((_, i) => (
                                        <span key={i}>★</span>
                                    ))}
                                </div>
                                <p className="text-2xl mb-4">{reviews[current]?.review}</p>
                                <p className="font-semibold text-lg text-gray-400">{reviews[current]?.author}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <h3 className="text-red-400 text-center mt-10 text-3xl">{error}</h3>
                ) : (
                    <h3 className="text-white text-center mt-10 text-3xl">Loading Reviews...</h3>
                )}
            </div>
        </div>
    );
};

export default Reviews;
