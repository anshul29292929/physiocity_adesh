import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-12">Last Updated: March 2026</p>
        
        <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Information Collection</h2>
            <p>
              At Physiocity Academy, we collect information you provide directly to us when you register for courses, subscribe to newsletters, or participate in our forums. This information may include your name, email, professional license details, and payment information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Use of Information</h2>
            <p>
              Your data is used solely to provide educational services, process course certifications, and provide clinical updates. We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Data Security</h2>
            <p>
              We implement industry-standard encryption and security measures to protect your sensitive information from unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Cookies</h2>
            <p>
              We use cookies to enhance your browsing experience and analyze site traffic for educational improvements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">5. Contact Us</h2>
            <p>
              For any privacy-related queries, please contact us at support@physiocity.com.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
