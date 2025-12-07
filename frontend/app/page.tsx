"use client";

import { useState } from "react";
import Header from "@/components/Header";
import HeroComp from "@/components/HeroComp";
export default function Home() {

  return (
    <div className="min-h-screen bg-off-white">
      <Header />
      <HeroComp/>
      
    </div>
  );
}
