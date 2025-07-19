"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Archive, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Support from '../app/assets/support.jpg'
import RobScr from '../app/assets/rob-scr.jpg'
import Assets from '../app/assets/game-2.jpg'
import Image from 'next/image';
import { BlurFade } from './magicui/blur-fade';

const GameProductsSection = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    setIsInView(true);
  }, []);

  return (
    <div className="w-full min-h-screen  p-6 md:p-12 relative overflow-hidden">
      

      <div className="relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Game Products</h1>
          <p className="text-2xl text-white/80 max-w-2xl mx-auto">
            Explore our diverse range of game-ready products designed to be easily installed.
          </p>
        </motion.div>

        <BlurFade delay={0.5} inView>
          <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
            <motion.div
              className="w-full md:w-2/3 relative rounded-xl shadow-lg overflow-hidden h-96 md:h-[500px]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onMouseEnter={() => setHoveredCard('affordable')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
              <div className="absolute inset-0 bg-indigo-900/40 z-10" />
              <div className="w-full h-full bg-indigo-100 overflow-hidden">
                <Image
                  src={RobScr}
                  fill
                  alt="Company Logo"
                />
              </div>

              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="max-w-xl w-full px-6">
                  <BlurFade delay={0.5} inView>
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-white mb-2">Affordable Products</h2>
                      <p className="text-white/90 text-xl mb-4">High-quality development assets for your game.</p>
                      <div className="relative mt-4">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Search className="w-4 h-4 text-indigo-200" />
                        </div>
                        <Input
                          type="search"
                          placeholder="Search products"
                          className="pl-10 pr-4 py-2 bg-white/20 border-white/20 text-white placeholder:text-indigo-100 focus:ring-indigo-400 focus:border-indigo-400 w-full"
                          onChange={() => {
                            window.location.href = '/browse'
                          }}
                        />
                      </div>
                    </div>
                  </BlurFade>
                </div>
              </div>

              <motion.div
                className="absolute inset-0 bg-indigo-600/10 z-10"
                animate={{ opacity: hoveredCard === 'affordable' ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            <div className="w-full md:w-1/3 flex flex-col gap-6">
              <motion.div
                className="relative rounded-xl shadow-lg overflow-hidden h-48 md:h-[242px]"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onMouseEnter={() => setHoveredCard('ready-assets')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                <div className="absolute inset-0 bg-emerald-900/30 z-10" />
                <div className="w-full h-full bg-emerald-100 overflow-hidden">
                  <Image
                    src={Assets}
                    fill
                    alt="Company Logo"
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                  <BlurFade delay={0.5} inView>
                    <h2 className="text-3xl font-bold text-white mb-1">Ready Assets</h2>
                    <p className="text-white/90 text-xl mb-2">Game-ready products at great prices.</p>
                    <Button className="mt-1 bg-white/20 hover:bg-white/30 text-white border-none text-lg py-1" onClick={() => {
                      window.location.href = '/browse'
                    }}>
                      Browse Products
                    </Button>
                  </BlurFade>
                </div>

                <motion.div
                  className="absolute inset-0 bg-emerald-600/10 z-10"
                  animate={{ opacity: hoveredCard === 'ready-assets' ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>

              <motion.div
                className="relative rounded-xl shadow-lg overflow-hidden h-48 md:h-[242px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onMouseEnter={() => setHoveredCard('support')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                <div className="absolute inset-0 bg-purple-900/30 z-10" />
                <div className="w-full h-full bg-purple-100 overflow-hidden">
                  <Image
                    src={Support}
                    fill
                    alt="Company Logo"
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                  <BlurFade delay={0.5} inView>
                    <h2 className="text-2xl font-bold text-white mb-1">Support Tickets</h2>
                    <p className="text-white/90 text-xl mb-2">Get assistance for your gaming needs.</p>
                    <Button className="mt-1 bg-white/20 hover:bg-white/30 text-white border-none text-lg py-1" onClick={() => {
                      window.location.href = '/support'
                    }}>
                      Contact Us
                    </Button>
                  </ BlurFade>
                </div>

                <motion.div
                  className="absolute inset-0 bg-purple-600/10 z-10"
                  animate={{ opacity: hoveredCard === 'support' ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </div>
          </div>
        </BlurFade>
      </div>
    </div>
  );
};

export default GameProductsSection;