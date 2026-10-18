"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isReduced = mounted ? shouldReduceMotion : false;

  const wordmarkParts = [
    "DENTPLUS",
    "PRECISION",
    "DENTAL CARE",
    "CLINIC",
  ];

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <footer className="relative w-full bg-[#051124] text-white pt-14 md:pt-20 pb-0 overflow-hidden font-sans border-t border-white/5">
      {/* Top Section: Logo/Description + Links Grid */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16">
        
        {/* Left Column (Brand Logo & Paragraph Description) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-2 mb-2 select-none shrink-0 relative">
            <Image
              src="/logo.png"
              alt="Dentplus Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            Dentplus Dental Care & Management System
          </h3>
          <p className="text-[#6B7280] text-sm leading-relaxed max-w-sm font-normal">
            Delivering personalized, high-precision dental treatments with modern technology
            and gentle care to restore healthy, confident smiles for every patient.
          </p>
        </div>

        {/* Right Columns Grid: Spans 8 Columns */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Column 1: Quick Links */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-gray-400 font-semibold uppercase text-[11px] tracking-wider">
              Quick link
            </h4>
            <ul className="flex flex-col space-y-2.5">
              {[
                { name: "Home", action: () => scrollTo("home") },
                { name: "Services", action: () => scrollTo("services") },
                { name: "About Us", action: () => scrollTo("about") },
                { name: "Specialists", action: () => scrollTo("specialists") },
              ].map((link) => (
                <li key={link.name}>
                  <button
                    type="button"
                    onClick={link.action}
                    className="text-gray-300 hover:text-white transition-colors text-sm font-normal text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  href="/patient/login"
                  className="text-gray-300 hover:text-white transition-colors text-sm font-normal"
                >
                  Patient Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="text-gray-300 hover:text-white transition-colors text-sm font-normal"
                >
                  Staff Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Treatments */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-gray-400 font-semibold uppercase text-[11px] tracking-wider">
              Treatments
            </h4>
            <ul className="flex flex-col space-y-2.5">
              {[
                "Dental Checkup",
                "Teeth Cleaning",
                "Tooth Filling",
                "Gum Treatment",
                "Clear Aligners",
                "Dental Implants",
              ].map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => scrollTo("services")}
                    className="text-gray-300 hover:text-white transition-colors text-sm font-normal text-left"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support & Clinic Info */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-gray-400 font-semibold uppercase text-[11px] tracking-wider">
              Support
            </h4>
            <ul className="flex flex-col space-y-2.5">
              <li>
                <a
                  href="mailto:hellodentplus@gmail.com"
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium break-all"
                >
                  hellodentplus@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+15553214567"
                  className="text-gray-300 hover:text-white transition-colors text-sm font-normal"
                >
                  +1 (555) 321-4567
                </a>
              </li>
              <li className="text-[#6B7280] text-xs leading-relaxed space-y-1 font-normal pt-1">
                <p>123 Healthcare Boulevard, Suite 400,</p>
                <p>Medical Arts District.</p>
                <p className="text-slate-400 pt-1">Mon – Sat: 8:00 AM – 7:00 PM</p>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Channels */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-gray-400 font-semibold uppercase text-[11px] tracking-wider">
              Social
            </h4>
            <ul className="flex flex-col space-y-2.5">
              {[
                { name: "Facebook", href: "https://facebook.com" },
                { name: "LinkedIn", href: "https://linkedin.com" },
                { name: "Instagram", href: "https://instagram.com" },
                { name: "Twitter / X", href: "https://twitter.com" },
              ].map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors text-sm font-normal"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Horizontal Divider Line */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 w-full h-[1px] bg-white/10" />

      {/* Middle Row: Copyright & Compliance */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-normal">
        <p>© {new Date().getFullYear()} Dentplus Dental Management System. All rights reserved.</p>
        <div className="flex gap-6 text-xs text-gray-400">
          <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
          <span className="hover:text-white cursor-pointer transition">HIPAA Compliance</span>
        </div>
      </div>

      {/* Massive Faded Background Wordmark at bottom with smooth infinite marquee loop */}
      <div
        aria-hidden="true"
        className="relative w-full overflow-hidden h-[85px] sm:h-[110px] md:h-[140px] lg:h-[180px] xl:h-[220px] 2xl:h-[260px] select-none pointer-events-none flex items-end pb-5 sm:pb-0"
      >
        <motion.div
          className="flex whitespace-nowrap w-max"
          animate={isReduced ? { x: 0 } : { x: ["0%", "-50%"] }}
          transition={
            isReduced
              ? {}
              : {
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 25,
                    ease: "linear",
                  },
                }
          }
        >
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-12 sm:gap-16 md:gap-24 pr-12 sm:pr-16 md:pr-24">
              {wordmarkParts.map((word, idx) => (
                <h1
                  key={idx}
                  className="text-[16vw] sm:text-[18vw] font-black tracking-tighter uppercase leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-white/15 to-white/0 whitespace-nowrap"
                >
                  {word}
                </h1>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </footer>
  );
}
