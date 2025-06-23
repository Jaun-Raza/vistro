"use client"
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Section = 'personalUse' | 'commercialUse' | 'generalTerms';

export default function TermsOfService() {
  const [expandedSections, setExpandedSections] = useState({
    personalUse: true,
    commercialUse: false,
    generalTerms: false
  });

  const toggleSection = (section: Section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  return (
    <div className="min-h-screen pb-16 pt-25">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Terms Header */}
          <div className="bg-white px-6 py-10">
            <div className="text-center border-b border-gray pb-8">
              <h2 className="text-5xl font-bold">Terms Of Service</h2>
              <p className="mt-2 text-lg">
                Last Updated: April 21, 2025
              </p>
            </div>
          </div>

          {/* Introduction */}
          <div className="px-6 pb-8 text-lg">
            <p className="text-gray-700">
              Welcome to vistro.shop! The following Terms of Service govern the use of our digital products within the game Roblox. 
              By purchasing, downloading, or using our resources, you agree to comply with these terms. Please read them carefully.
            </p>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-900">Definitions:</h3>
              <p className="mt-2 text-gray-700">
                <strong>Resources:</strong> Refers to all digital products, including 3D models, textures, scripts, and other digital assets 
                designed for use within the game Roblox, offered under these licenses.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-900">License Types:</h3>
              <ul className="mt-2 space-y-2 text-gray-700">
                <li>
                  <strong>Personal Use License:</strong> A license permitting the use of resources for non-commercial, 
                  personal projects by an individual within the game Roblox.
                </li>
                <li>
                  <strong>Commercial Use License:</strong> A license permitting the use of resources for commercial 
                  purposes within the game Roblox.
                </li>
              </ul>
            </div>
          </div>

          {/* Personal Use License */}
          <div className="border-t border-gray-200">
            <button
              className="flex justify-between items-center w-full px-6 py-4 text-left"
              onClick={() => toggleSection("personalUse")}
            >
              <h3 className="text-2xl font-bold text-gray-900">Personal Use License</h3>
              {expandedSections.personalUse ? (
                <ChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <ChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </button>

            {expandedSections.personalUse && (
              <div className="px-6 pb-8">
                <p className="text-gray-700">
                  The following terms apply to products marked as "Personal Use Only":
                </p>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900">Permitted Uses:</h4>
                  <ol className="mt-2 list-decimal pl-5 space-y-2 text-gray-700">
                    <li>Use our digital resources in your personal Roblox projects that are not intended for sale or commercial distribution.</li>
                    <li>Modify the resources for use in your personal Roblox game, provided it remains for personal use only.</li>
                    <li>Share your finished Roblox projects that incorporate our resources on personal Roblox profiles or social media accounts.</li>
                  </ol>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900">Prohibited Uses:</h4>
                  <ol className="mt-2 list-decimal pl-5 space-y-2 text-gray-700">
                    <li>Resell, redistribute, or share our digital resources in their original form or in any form where the original resource can be extracted, whether modified or unmodified.</li>
                    <li>Use our resources in any Roblox project intended for sale, commercial distribution.</li>
                    <li>Claim ownership or copyrights of our digital resources. If you encounter any copyright issues related to our resources, please contact us at contact@vistro.shop.</li>
                    <li>Upload our resources to any third-party sites, including but not limited to Roblox Asset Stores, AI-based websites, leak sites, or cloud storage services.</li>
                    <li>Use our resources promotional materials.</li>
                    <li>Include our resources in any free or paid bundles, kits, or other digital collections on or outside the Roblox platform.</li>
                    <li>Offer our resources as downloadable files or share them in any form where the original file can be extracted, copied, or reused by others.</li>
                    <li>Use our resources in any way that would violate Roblox's terms of service or any applicable laws.</li>
                  </ol>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900">License Duration:</h4>
                  <p className="mt-2 text-gray-700">
                    The Personal Use License is valid indefinitely but remains subject to the terms and conditions outlined herein.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Commercial Use License */}
          <div className="border-t border-gray-200">
            <button
              className="flex justify-between items-center w-full px-6 py-4 text-left"
              onClick={() => toggleSection("commercialUse")}
            >
              <h3 className="text-2xl font-bold text-gray-900">Commercial Use License</h3>
              {expandedSections.commercialUse ? (
                <ChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <ChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </button>

            {expandedSections.commercialUse && (
              <div className="px-6 pb-8">
                <p className="text-gray-700">
                  The following terms apply to products marked for commercial use:
                </p>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900">Permitted Uses:</h4>
                  <ol className="mt-2 list-decimal pl-5 space-y-2 text-gray-700">
                    <li>Use our digital resources in your Roblox projects intended for commercial purposes, such as creating and selling in-game items, provided all terms are followed.</li>
                    <li>Sell personal use licenses for our resources.</li>
                    <li>No attribution or credit is required when using or selling our resources under these terms.</li>
                  </ol>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900">Prohibited Uses:</h4>
                  <ol className="mt-2 list-decimal pl-5 space-y-2 text-gray-700">
                    <li>Ban the user mementomorifrog from games/communication platforms you own which the products are listed upon</li>
                    <li>Sell any licenses for our resources, except for personal use-only licenses.</li>
                    <li>Claim ownership or copyrights of our digital resources. If you encounter any copyright issues related to our resources, please contact us at contact@vistro.shop.</li>
                    <li>Upload our resources to any AI-based websites, leak sites, or cloud storage services.</li>
                    <li>Make our resources available for free, trade them, or include them in bundle deals without our explicit written permission.</li>
                    <li>Sell personal use licenses for our resources at a lower price than we offer, including through any alternative currencies or payment methods.</li>
                    <li>Provide any personal use licenses for free without our explicit written permission.</li>
                    <li>Sell or transfer the commercial use license to anyone else, including trading or swapping licenses, without our explicit written permission.</li>
                    <li>Use our graphics or promotional materials without our explicit written permission.</li>
                    <li>You are not allowed to sell/list the products on the following platforms doing so will result in your license(s) being revoked:
                      <ul className="mt-2 pl-5 list-disc">
                        <li>https://clearlydev.com/</li>
                        <li>https://assetworld.pro/</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900">Notification Requirement for Commercial Use:</h4>
                  <p className="mt-2 text-gray-700">
                    If you have purchased a Commercial Use License to sell one of our resources, you must notify us at 
                    contact@vistro.shop with the location (store name, platform, or website URL) where the product will be sold 
                    within 24 hours of purchase. Failure to provide this notification within the specified timeframe will result 
                    in the immediate revocation of your license.
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900">License Duration:</h4>
                  <p className="mt-2 text-gray-700">
                    The Commercial Use License is valid indefinitely but remains subject to the terms and conditions outlined herein.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* General Terms */}
          <div className="border-t border-gray-200">
            <button
              className="flex justify-between items-center w-full px-6 py-4 text-left"
              onClick={() => toggleSection("generalTerms")}
            >
              <h3 className="text-2xl font-bold text-gray-900">General Terms Applicable to All Licenses</h3>
              {expandedSections.generalTerms ? (
                <ChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <ChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </button>

            {expandedSections.generalTerms && (
              <div className="px-6 pb-8">
                <div className="mt-2">
                  <h4 className="text-lg font-semibold text-gray-900">Revocation of Licenses:</h4>
                  <p className="mt-2 text-gray-700">
                    We reserve the right to revoke any Personal Use or Commercial Use License at our sole discretion if any of the 
                    terms outlined in this agreement are violated. In such cases, you must immediately cease all use of the resources, 
                    delete all copies of the resources in your possession, and, if applicable, provide proof of deletion upon request. 
                    No refunds will be issued for revoked licenses.
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900">Blacklist Policy:</h4>
                  <p className="mt-2 text-gray-700">
                    If you are blacklisted by vistro.shop, all your licenses, permissions, and rights to use our resources will be 
                    immediately revoked. You must cease all use of our resources, delete all copies in your possession, and provide 
                    proof of deletion upon request.
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900">Jurisdiction:</h4>
                  <p className="mt-2 text-gray-700">
                    This agreement is governed by the laws of the United Kingdom. Non-compliance with these terms may result in legal action.
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900">Seeking Permission:</h4>
                  <p className="mt-2 text-gray-700">
                    For any activities requiring explicit permission under this license, please contact us at contact@vistro.shop.
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900">Contact Information:</h4>
                  <p className="mt-2 text-gray-700">
                    For any questions regarding these terms, please contact us at contact@vistro.shop.
                  </p>
                </div>

                <div className="mt-6">
                  <p className="text-gray-700 font-medium">
                    Cannot ban the user mementomorifrog from games/communication platforms
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900">Updates and Changes:</h4>
                  <p className="mt-2 text-gray-700">
                    We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page, 
                    and it is your responsibility to review the terms regularly. Continued use of our resources after any 
                    changes indicates your acceptance of the new terms.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Us */}
        <div className="mt-12 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-white px-6 py-4 border-b border-gray pb-4">
            <h3 className="text-xl font-bold">Have Questions?</h3>
          </div>
          <div className="px-6 py-4 text-lg">
            <p className="text-gray-700">
              If you have any questions about our Terms of Service or would like to request permission 
              for special use cases, please contact us at:
            </p>
            <a 
              href="mailto:contact@vistro.shop" 
              className="mt-2 inline-block text-indigo-600 hover:text-indigo-800 font-medium"
            >
              contact@vistro.shop
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}