"use client"
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Section = 'overview' | 'personalInfo' | 'dataProcessing' | 'userRights' | 'security';

export default function PrivacyPolicy() {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    personalInfo: false,
    dataProcessing: false,
    userRights: false,
    security: false
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
          <div className="bg-white px-6 py-10">
            <div className="text-center border-b border-gray pb-8">
              <h2 className="text-5xl font-bold">Privacy Policy</h2>
              <p className="mt-2 text-lg">
                Last Updated: April 21, 2025
              </p>
            </div>
          </div>

          <div className="px-6 pb-8 text-lg">
            <p className="text-gray-700">
              Vistro.shop website is owned by Dylan White, which is a data controller of your personal data.
              We have adopted this Privacy Policy, which determines how we are processing the information collected by Vistro.shop, 
              which also provides the reasons why we must collect certain personal data about you. Therefore, you must read this 
              Privacy Policy before using Vistro.shop website.
            </p>

            <div className="mt-6">
              <p className="text-gray-700">
                We take care of your personal data and undertake to guarantee its confidentiality and security.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200">
            <button
              className="flex justify-between items-center w-full px-6 py-4 text-left"
              onClick={() => toggleSection("personalInfo")}
            >
              <h3 className="text-2xl font-bold text-gray-900">Personal Information We Collect</h3>
              {expandedSections.personalInfo ? (
                <ChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <ChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </button>

            {expandedSections.personalInfo && (
              <div className="px-6 pb-8">
                <p className="text-gray-700">
                  When you visit the Vistro.shop, we automatically collect certain information about your device, including information about:
                </p>

                <ul className="mt-4 list-disc pl-5 space-y-2 text-gray-700">
                  <li>Your web browser</li>
                  <li>IP address</li>
                  <li>Time zone</li>
                  <li>Some of the installed cookies on your device</li>
                </ul>

                <p className="mt-4 text-gray-700">
                  Additionally, as you browse the Site, we collect information about:
                </p>

                <ul className="mt-4 list-disc pl-5 space-y-2 text-gray-700">
                  <li>The individual web pages or products you view</li>
                  <li>What websites or search terms referred you to the Site</li>
                  <li>How you interact with the Site</li>
                </ul>

                <p className="mt-4 text-gray-700">
                  We refer to this automatically-collected information as "Device Information." Moreover, we might collect the personal 
                  data you provide to us (including but not limited to Name, Surname, Address, payment information, etc.) during registration 
                  to be able to fulfill the agreement.
                </p>
              </div>
            )}
          </div>

          {/* Why We Process Your Data */}
          <div className="border-t border-gray-200">
            <button
              className="flex justify-between items-center w-full px-6 py-4 text-left"
              onClick={() => toggleSection("dataProcessing")}
            >
              <h3 className="text-2xl font-bold text-gray-900">Why We Process Your Data</h3>
              {expandedSections.dataProcessing ? (
                <ChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <ChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </button>

            {expandedSections.dataProcessing && (
              <div className="px-6 pb-8">
                <p className="text-gray-700">
                  Our top priority is customer data security, and, as such, we may process only minimal user data, only as much as it is 
                  absolutely necessary to maintain the website. Information collected automatically is used only to identify potential 
                  cases of abuse and establish statistical information regarding website usage. This statistical information is not 
                  otherwise aggregated in such a way that it would identify any particular user of the system.
                </p>

                <p className="mt-4 text-gray-700">
                  You can visit the website without telling us who you are or revealing any information, by which someone could identify 
                  you as a specific, identifiable individual. If, however, you wish to use some of the website's features, or you wish 
                  to receive our newsletter or provide other details by filling a form, you may provide personal data to us, such as 
                  your email, first name, last name, city of residence, organization, telephone number.
                </p>

                <p className="mt-4 text-gray-700">
                  You can choose not to provide us with your personal data, but then you may not be able to take advantage of some of 
                  the website's features. For example, you won't be able to receive our Newsletter or contact us directly from the website. 
                  Users who are uncertain about what information is mandatory are welcome to contact us via contact@vistro.shop.
                </p>
              </div>
            )}
          </div>

          {/* Your Rights */}
          <div className="border-t border-gray-200">
            <button
              className="flex justify-between items-center w-full px-6 py-4 text-left"
              onClick={() => toggleSection("userRights")}
            >
              <h3 className="text-2xl font-bold text-gray-900">Your Rights</h3>
              {expandedSections.userRights ? (
                <ChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <ChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </button>

            {expandedSections.userRights && (
              <div className="px-6 pb-8">
                <p className="text-gray-700">
                  If you are a European resident, you have the following rights related to your personal data:
                </p>

                <ol className="mt-4 list-decimal pl-5 space-y-2 text-gray-700">
                  <li>The right to be informed.</li>
                  <li>The right of access.</li>
                  <li>The right to rectification.</li>
                  <li>The right to erasure.</li>
                  <li>The right to restrict processing.</li>
                  <li>The right to data portability.</li>
                  <li>The right to object.</li>
                  <li>Rights in relation to automated decision-making and profiling.</li>
                </ol>

                <p className="mt-4 text-gray-700">
                  If you would like to exercise this right, please contact us through the contact information below.
                </p>

                <p className="mt-4 text-gray-700">
                  Additionally, if you are a European resident, we note that we are processing your information in order to fulfill contracts 
                  we might have with you (for example, if you make an order through the Site), or otherwise to pursue our legitimate business 
                  interests listed above. Additionally, please note that your information might be transferred outside of Europe, including 
                  Canada and the United States.
                </p>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900">Links to Other Websites:</h4>
                  <p className="mt-2 text-gray-700">
                    Our website may contain links to other websites that are not owned or controlled by us. Please be aware that we are not 
                    responsible for such other websites or third parties' privacy practices. We encourage you to be aware when you leave our 
                    website and read the privacy statements of each website that may collect personal information.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Data Security and Legal Disclosure */}
          <div className="border-t border-gray-200">
            <button
              className="flex justify-between items-center w-full px-6 py-4 text-left"
              onClick={() => toggleSection("security")}
            >
              <h3 className="text-2xl font-bold text-gray-900">Data Security and Legal Disclosure</h3>
              {expandedSections.security ? (
                <ChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <ChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </button>

            {expandedSections.security && (
              <div className="px-6 pb-8">
                <div className="mt-2">
                  <h4 className="text-lg font-semibold text-gray-900">Data Security:</h4>
                  <p className="mt-2 text-gray-700">
                    We secure information you provide on computer servers in a controlled, secure environment, protected from unauthorized 
                    access, use, or disclosure. We keep reasonable administrative, technical, and physical safeguards to protect against 
                    unauthorized access, use, modification, and personal data disclosure in its control and custody. However, no data 
                    transmission over the Internet or wireless network can be guaranteed.
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900">Legal Disclosure:</h4>
                  <p className="mt-2 text-gray-700">
                    We will disclose any information we collect, use or receive if required or permitted by law, such as to comply with a 
                    subpoena or similar legal process, and when we believe in good faith that disclosure is necessary to protect our rights, 
                    protect your safety or the safety of others, investigate fraud, or respond to a government request.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Us */}
        <div className="mt-12 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-white px-6 py-4">
            <h3 className="text-2xl font-bold border-b border-gray pb-4">Contact Information</h3>
          </div>
          <div className="px-6 pb-4 text-lg">
            <p className="text-gray-700">
              If you would like to contact us to understand more about this Policy or wish to contact us concerning any matter relating 
              to individual rights and your Personal Information, you may send an email to:
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