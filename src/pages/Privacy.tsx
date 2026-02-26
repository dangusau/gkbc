import React from 'react';
import { Eye, Database, Mail, Cookie, Trash2, ShieldCheck } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-green-200" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-green-100">How we protect and handle your data</p>
          <p className="text-sm text-green-200 mt-4">Effective: December 2025</p>
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
                Our Commitment
              </h2>
              <p className="text-gray-600 leading-relaxed">
                At Greater Jigawa Business Council (GJBC), we respect your privacy. This Privacy Policy explains 
                how we collect, use, and safeguard your information when you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                Information We Collect
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="text-green-600" size={24} />
                    <h3 className="font-semibold text-gray-800">Personal Data</h3>
                  </div>
                  <p className="text-sm text-gray-600">Name, email, phone, business details, profile information.</p>
                </div>
                <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Database className="text-green-600" size={24} />
                    <h3 className="font-semibold text-gray-800">Usage Data</h3>
                  </div>
                  <p className="text-sm text-gray-600">Interactions, posts, messages, device info, IP address.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                How We Use Your Information
              </h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Provide and maintain the Service.</li>
                <li>Personalize your experience and connect you with relevant businesses.</li>
                <li>Send notifications, updates, and support messages.</li>
                <li>Improve our platform through analytics and research.</li>
                <li>Ensure security and prevent fraud.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                Sharing Your Information
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We do not sell your personal data. We may share information with:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Other members (as part of your public profile and activities).</li>
                <li>Service providers who assist in operating the platform.</li>
                <li>Legal authorities when required by law.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                Cookies & Tracking
              </h2>
              <div className="flex items-start gap-4 bg-blue-50 p-4 rounded-xl">
                <Cookie className="text-green-600 flex-shrink-0" size={24} />
                <p className="text-gray-700">
                  We use cookies to enhance your experience. You can control cookies through your browser settings. 
                  By continuing to use GJBC, you consent to our use of cookies.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                Data Retention
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We retain your information as long as your account is active. After account deletion, we may retain 
                anonymized data for analytics and legal purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                Your Rights
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 border border-green-200 rounded-lg">
                  <Eye className="text-green-600" size={18} />
                  <span className="text-sm text-gray-700">Access your data</span>
                </div>
                <div className="flex items-center gap-2 p-3 border border-green-200 rounded-lg">
                  <Database className="text-green-600" size={18} />
                  <span className="text-sm text-gray-700">Correct inaccuracies</span>
                </div>
                <div className="flex items-center gap-2 p-3 border border-green-200 rounded-lg">
                  <Trash2 className="text-green-600" size={18} />
                  <span className="text-sm text-gray-700">Request deletion</span>
                </div>
                <div className="flex items-center gap-2 p-3 border border-green-200 rounded-lg">
                  <Mail className="text-green-600" size={18} />
                  <span className="text-sm text-gray-700">Opt out of marketing</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                Security
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We implement industry‑standard measures to protect your data. However, no method of transmission 
                over the internet is 100% secure. You use our Service at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                Children’s Privacy
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Our Service is not intended for individuals under 18. We do not knowingly collect data from minors.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                Changes to This Policy
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of material changes via email 
                or a prominent notice on the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                Contact Us
              </h2>
              <p className="text-gray-600 leading-relaxed">
                If you have questions about this Privacy Policy, please contact our Data Protection Officer at <a href="mailto:support@GJBC.com" className="text-green-600 hover:underline">support@GJBC.com</a>.
              </p>
            </section>
          </div>

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

export default Privacy;