import React from 'react';
import { Shield, Users, Lock, AlertCircle } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-green-200" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms and Conditions</h1>
          <p className="text-green-100">Greater Jigawa Business Council – Community Platform</p>
          <p className="text-sm text-green-200 mt-4">Last Updated: December 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using the GJBC platform (“Service”), you agree to be bound by these Terms. 
                If you do not agree, you may not use the Service. These terms apply to all members, businesses, 
                and visitors of the Greater Jigawa Business Council community.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                2. Eligibility
              </h2>
              <p className="text-gray-600 leading-relaxed">
                You must be at least 18 years old to use the Service. By agreeing to these Terms, you represent 
                that you are of legal age and have the authority to bind any business entity you represent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                3. User Accounts
              </h2>
              <p className="text-gray-600 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials. All activities 
                under your account are your responsibility. Notify us immediately of any unauthorized use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                4. Community Guidelines
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <Users className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <p className="text-gray-700">Respect other members – no harassment, hate speech, or bullying.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <p className="text-gray-700">Do not post illegal, fraudulent, or misleading content.</p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <p className="text-gray-700">Respect intellectual property – only share content you own or have permission to use.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                5. Content Ownership
              </h2>
              <p className="text-gray-600 leading-relaxed">
                You retain ownership of content you post. By posting, you grant GJBC a non‑exclusive, royalty‑free 
                license to display, distribute, and promote your content within the Service. We may remove any 
                content that violates these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                6. Prohibited Activities
              </h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Impersonating another person or entity.</li>
                <li>Attempting to gain unauthorized access to other accounts.</li>
                <li>Using the Service for spam, phishing, or commercial solicitation without consent.</li>
                <li>Interfering with the proper functioning of the platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                7. Termination
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We may suspend or terminate your account at any time for violations of these Terms or for any 
                other reason at our discretion. You may delete your account at any time through your settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                8. Disclaimer of Warranties
              </h2>
              <p className="text-gray-600 leading-relaxed">
                The Service is provided “as is” without warranties of any kind. We do not guarantee that the 
                platform will be error‑free or uninterrupted. Your use is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                9. Limitation of Liability
              </h2>
              <p className="text-gray-600 leading-relaxed">
                To the fullest extent permitted by law, GJBC shall not be liable for any indirect, incidental, 
                or consequential damages arising from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                10. Changes to Terms
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We may update these Terms from time to time. Continued use of the Service after changes 
                constitutes acceptance. We will notify you of significant changes via email or platform notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                11. Contact Us
              </h2>
              <p className="text-gray-600 leading-relaxed">
                For questions about these Terms, please contact us at <a href="mailto:support@gjbc.com" className="text-green-600 hover:underline">support@GJBC.com</a>.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-green-100">
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} Greater Jigawa Business Council. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;