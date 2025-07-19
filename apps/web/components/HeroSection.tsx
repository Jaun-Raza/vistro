"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
import { WordRotate } from '@/components/magicui/word-rotate';


const HeroSection = () => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    setIsInView(true);
  }, []);

  return (
    <div className="relative w-full overflow-hidden flex items-center justify-center pt-40">
      <div className="container mx-auto px-4 z-10">
        <div className="flex flex-col items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 flex justify-center">
              <span className="flex flex-col text-[2.5rem] md:flex-row md:text-7xl items-center gap-2 text-white">Affordable Game-Ready <WordRotate
                className="font-bold text-black dark:text-white"
                words={[
                  "Audio", 
                  "Clothing",
                  "Games",
                  "Graphics & UI",
                  "Maps",
                  "Models",
                  "Scripts",
                  "Vehicles"
                ]}
              /></span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              High-quality development assets for Roblox that won't break the bank. Support available anytime.
            </p>
          </motion.div>

          <motion.div
            className="w-full max-w-6xl mx-auto pb-5"
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
        </div>
      </div>

      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"
        initial={{ opacity: 0, filter: 'blur(0px)' }}
        animate={isInView ? { opacity: 0.6, filter: 'blur(120px)' } : {}}
        transition={{ duration: 1.5 }}
        style={{ zIndex: -1 }}
      />

    </div>
  );
};

export default HeroSection;