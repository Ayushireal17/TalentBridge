"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/layout/HeroSection";
import FeaturesSection from "../components/layout/FeaturesSection";
import ChatbotPreview from "../components/chatbot/ChatbotPreview";
import ResumeParserPreview from "../components/resume/ResumeParserPreview";
import RoleSelector from "../components/layout/RoleSelector";
import PricingSection from "../components/layout/PricingSection";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <RoleSelector />
      <ChatbotPreview />
      <ResumeParserPreview />
      <PricingSection />
      <Footer />
    </main>
  );
}
