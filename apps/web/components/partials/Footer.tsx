"use client";
import Youtube from "../../app/assets/icons/youtube.png"
import Discord from "../../app/assets/icons/discord.png"
import Instagram from "../../app/assets/icons/instagram.png"
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="text-white py-5 pt-10 px-6 md:px-20 relative z-10">

            <div className="flex flex-col md:flex-row justify-between gap-10">
                {/* Left Side */}
                <div>
                    <h2 className="text-4xl font-bold">Affordable High-Quality Products</h2>
                    <p className="text-xl mt-2">High-quality game-ready products for Roblox developers.</p>
                    <div className="flex gap-4 mt-4">
                        <a
                            href="https://www.youtube.com/@MementoMoriFrog"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-black transition"
                        >
                            <Image
                                src={Youtube}
                                alt="Company Logo"
                                width={20}
                            />
                        </a>

                        <a
                            href="https://discord.com/invite/vistro"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-black transition"
                        >
                            <Image
                                src={Discord}
                                alt="Company Logo"
                                width={20}
                            />
                        </a>
                        <a
                            href="https://www.instagram.com/vistro.shop"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-black transition"
                        >
                            <Image
                                src={Instagram}
                                alt="Company Logo"
                                width={20}
                            />
                        </a>
                    </div>
                </div>

                {/* Right Side */}
                <div>
                    <h2 className="text-3xl font-bold">Support</h2>
                    <a className="text-gray-600 mt-2" href="mailto:contact@vistro.shop">contact@vistro.shop</a>
                </div>
                <div>
                    <h2 className="text-3xl font-bold">Legal</h2>
                    <a className="text-gray-600 mt-2" href="/terms-of-service">Terms Of Service</a><br />
                    <a className="text-gray-600 mt-2" href="/privacy-policy">Privacy Policy</a>
                </div>
            </div>

            {/* Bottom Line */}
            <div className="mt-10 text-center text-xl">
                © 2025 Dylan White. All rights reserved.
            </div>
        </footer>
    );
}
