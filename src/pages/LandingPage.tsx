import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheckIcon,
  BriefcaseIcon,
  UsersIcon,
  LinkIcon,
  ShoppingCartIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import {
  EnvelopeIcon,
  PhoneIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  return (
    <div className="bg-white text-slate-900">
      <HeroSection />
      <WhyGJBC />
      <PioneersSection />
      <FeaturesSection />
      <CallToAction />
    </div>
  );
}

/* ---------------- HERO ---------------- */
function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* IMAGE FIRST with subtle floating animation */}
        <div className="flex justify-center md:justify-start animate-float">
          <div className="bg-white rounded-xl p-4 w-48 sm:w-56 md:w-64 shadow-2xl border border-green-200">
            <img
              src="/GJBCLOGO.png"
              alt="GJBC Logo"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* TEXT COLUMN with fade-in */}
        <div className="animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Greater Jigawa Business Council
          </h1>
          <p className="mt-6 text-lg font-bold">Driving Economic Growth.</p>
          <p className="mt-4 text-lg text-green-100">
            Greater Jigawa connects entrepreneurs, professionals, and
            organizations into one trusted business ecosystem.
          </p>
          <div className="mt-8 flex gap-4 flex-wrap">
            <Link to="/signup">
              <button className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-100 transition transform hover:scale-105 duration-200">
                Join GJBC
              </button>
            </Link>
            <Link to="/login">
              <button className="border border-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-white/20 transition transform hover:scale-105 duration-200">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- WHY ---------------- */
function WhyGJBC() {
  const features = [
    {
      title: "Visibility & Credibility",
      description:
        "GJBC positions you where serious business conversations, partnerships, and growth happen.",
      icon: <ShieldCheckIcon className="h-8 w-8 text-green-600" />,
    },
    {
      title: "Trusted Business Network",
      description:
        "Connect with verified entrepreneurs, professionals, and organizations to grow your network.",
      icon: <UsersIcon className="h-8 w-8 text-green-600" />,
    },
    {
      title: "Real Opportunities",
      description:
        "Access jobs, marketplaces, and announcements to discover tangible business opportunities.",
      icon: <BriefcaseIcon className="h-8 w-8 text-green-600" />,
    },
  ];

  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-green-700">Why Join GJBC?</h2>
        <p className="mt-6 text-lg text-slate-600">
          Business grows faster when the right people are connected
          in the right environment.
        </p>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="h-16 w-16 mb-4 flex items-center justify-center bg-green-100 rounded-lg mx-auto">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="mt-2 text-slate-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PIONEERS ---------------- */
const pioneers = [
  { image: "/pioneers/pioneer3.png" },
  { image: "/pioneers/pioneer12.jpg" },
  { image: "/pioneers/pioneer6.png" },
  { image: "/pioneers/pioneer4.jpg" },
  { image: "/pioneers/pioneer1.png" },
  { image: "/pioneers/pioneer8.jpg" },
  { image: "/pioneers/pioneer2.png" },
  { image: "/pioneers/pioneer11.jpg" },
];

function PioneersSection() {
  return (
    <section className="bg-green-700 py-10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 text-center mb-10">
        <h2 className="text-4xl font-bold text-white">GJBC Pioneers</h2>
        <p className="mt-6 text-lg md:text-xl text-green-100 max-w-3xl mx-auto">
          Visionaries who laid the foundation of the Greater Jigawa Business Council.
        </p>
      </div>

      {/* Infinite scroll slider with smooth animation */}
      <div className="overflow-hidden">
        <div className="flex pioneers-track whitespace-nowrap gap-6 animate-infinite-scroll">
          {[...pioneers, ...pioneers].map((pioneer, index) => (
            <div
              key={index}
              className="flex-none w-[255px] sm:w-[320px] bg-white rounded-xl p-1 shadow-md border border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-48 w-full rounded-lg overflow-hidden">
                <img
                  src={pioneer.image}
                  className="h-full w-full object-cover"
                  alt="GJBC Pioneer"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FEATURES ---------------- */
function FeaturesSection() {
  const features = [
    {
      title: "Business Social Network",
      desc: "Share insights, updates, and ideas in a focused business environment.",
      icon: <UsersIcon className="h-10 w-10 text-green-600" />,
    },
    {
      title: "Professional Connectivity",
      desc: "Connect directly with entrepreneurs, professionals, and decision-makers.",
      icon: <LinkIcon className="h-10 w-10 text-green-600" />,
    },
    {
      title: "Marketplace",
      desc: "Buy, sell, and offer services within a trusted local business ecosystem.",
      icon: <ShoppingCartIcon className="h-10 w-10 text-green-600" />,
    },
    {
      title: "Business Directory",
      desc: "Get your business listed in the verified GJBC business directory.",
      icon: <BuildingLibraryIcon className="h-10 w-10 text-green-600" />,
    },
    {
      title: "Jobs & Opportunities",
      desc: "Post and discover jobs, gigs, and professional opportunities.",
      icon: <BriefcaseIcon className="h-10 w-10 text-green-600" />,
    },
    {
      title: "Events",
      desc: "Find seminars, workshops, and programs to boost your knowledge.",
      icon: <CalendarDaysIcon className="h-10 w-10 text-green-600" />,
    },
  ];

  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-green-700">What You Can Do on GJBC</h2>
        <div className="mt-14 grid md:grid-cols-3 gap-10">
          {features.map((f) => (
            <div
              key={f.title}
              className="border border-green-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white"
            >
              <div className="h-16 w-16 bg-green-100 rounded-lg mb-4 flex items-center justify-center mx-auto">
                {f.icon}
              </div>
              <h3 className="font-semibold text-lg mt-2">{f.title}</h3>
              <p className="mt-2 text-slate-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function CallToAction() {
  return (
    <footer className="bg-gradient-to-r from-green-700 to-green-800 text-white py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold">
          Join the Future of Business in Greater Jigawa
        </h2>

        <Link to="/signup">
          <button className="mt-8 bg-white text-green-700 px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-green-50 transition transform hover:scale-105 duration-200">
            Join GJBC Now
          </button>
        </Link>

        {/* CONTACT US with enhanced cards */}
        <div className="mt-14">
          <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
          <div className="flex flex-wrap justify-center gap-6 text-green-100">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-green-400/30 shadow-lg">
              <PhoneIcon className="h-6 w-6 text-white" />
              <span className="font-medium">08023104333</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-green-400/30 shadow-lg">
              <EnvelopeIcon className="h-6 w-6 text-white" />
              <span className="font-medium">GJBC.1000@hotmail.com</span>
            </div>
          </div>
        </div>

        {/* APP AVAILABILITY */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Available On</h3>
          <div className="flex flex-wrap justify-center gap-6 text-green-100">
            <a
              href="#"
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-green-400/30 shadow-lg hover:bg-white/20 transition"
            >
              <DevicePhoneMobileIcon className="h-6 w-6 text-white" />
              <span className="font-medium">Google Play Store</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-green-400/30 shadow-lg hover:bg-white/20 transition"
            >
              <ArrowDownTrayIcon className="h-6 w-6 text-white" />
              <span className="font-medium">Apple App Store</span>
            </a>
          </div>
        </div>

        <div className="mt-10 text-green-200">Est. 2025</div>
      </div>

      <div className="mt-16 text-center text-[11px] text-green-400">Sizes ©</div>
    </footer>
  );
}