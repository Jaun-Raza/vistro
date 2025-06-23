"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
import { BlurFade } from './magicui/blur-fade';

const Guide = () => {
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        setIsInView(true);
    }, []);

    return (
        <div className="w-full min-h-screen bg-[#eef0f3] p-6 md:p-12 relative overflow-hidden">
          
            <div className="absolute inset-0 z-0">
                {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                        key={`horizontal-${i}`}
                        className="absolute h-px bg-black/10"
                        style={{
                            width: '100%',
                            top: `${10 + i * 12}%`,
                            left: 0,
                        }}
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={isInView ? { opacity: 0.5, scaleX: 1 } : {}}
                        transition={{ duration: 1.5, delay: 0.2 + i * 0.1 }}
                    />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                        key={`vertical-${i}`}
                        className="absolute w-px bg-black/20"
                        style={{
                            height: '100%',
                            left: `${10 + i * 12}%`,
                            top: 0,
                        }}
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={isInView ? { opacity: 0.5, scaleY: 1 } : {}}
                        transition={{ duration: 1.5, delay: 0.2 + i * 0.1 }}
                    />
                ))}
            </div>

            <div className="relative z-10">
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-indigo-700 mb-4">How To Buy</h1>
                    <p className="text-2xl text-indigo-500 max-w-2xl mx-auto">
                        Your Step-by-Step Guide to Shopping Smart.
                    </p>
                </motion.div>

                <BlurFade duration={0.5} inView>
                    <motion.div
                        className="w-full max-w-4xl mx-auto pb-5"
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <HeroVideoDialog
                            className="block dark:hidden"
                            animationStyle="top-in-bottom-out"
                            videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
                            thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
                            thumbnailAlt="Hero Video"
                        />

                    </motion.div>
                </BlurFade>
            </div>
        </div>
    );
};

export default Guide;