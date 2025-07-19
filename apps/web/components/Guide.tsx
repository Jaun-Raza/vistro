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
        <div className="w-full min-h-screen p-6 md:p-12 relative overflow-hidden">
          
           

            <div className="relative z-10">
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">How To Buy</h1>
                    <p className="text-2xl text-white max-w-2xl mx-auto">
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