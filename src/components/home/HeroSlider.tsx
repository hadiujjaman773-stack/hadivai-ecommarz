"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import type { BannerItem } from "@/types";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export function HeroSlider({ banners }: { banners: BannerItem[] }) {
  if (banners.length === 0) return null;

  return (
    <section className="relative overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="hero-swiper swiper-horizontal h-[480px] md:h-[560px] lg:h-[600px]"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative h-full">
              <div className="absolute inset-0">
                <Image
                  src={banner.image}
                  alt={banner.titleBn}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </div>
              <div className="relative z-10 flex items-center justify-center h-full p-8 lg:p-12 container mx-auto">
                <div className="max-w-3xl text-center">
                  {banner.eyebrow && (
                    <div className="flex items-center mb-4 justify-center">
                      <div className="w-12 h-px bg-white/60 mr-4" />
                      <span
                        className="text-sm uppercase tracking-wider opacity-90"
                        style={{ color: "rgb(255, 255, 255)" }}
                      >
                        {banner.eyebrow}
                      </span>
                    </div>
                  )}
                  <h1
                    className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
                    style={{ color: "rgb(252, 137, 52)" }}
                  >
                    {banner.heading ?? banner.titleBn}
                  </h1>
                  <p
                    className="text-xl mb-8 opacity-90 max-w-2xl mx-auto"
                    style={{ color: "rgb(255, 255, 255)" }}
                  >
                    {banner.subtitleBn}
                  </p>
                  {banner.link && (
                    <Link
                      href={banner.link}
                      className="inline-block px-8 py-4 font-semibold transition-all duration-300 shadow-lg rounded-sm"
                      style={{
                        color: "rgb(255, 255, 255)",
                        backgroundColor: "rgb(252, 137, 52)",
                      }}
                    >
                      অর্ডার করুন
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
