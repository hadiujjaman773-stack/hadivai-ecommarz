"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, BadgePercent, Zap } from "lucide-react";
import type { ProductVariant, ProductWithCategory } from "@/types";
import { formatPrice, formatPriceWithUnit, calcDiscount } from "@/lib/format";
import { getUnitLabel } from "@/lib/product-units";
import { useCart } from "@/lib/cart-context";
import { SITE } from "@/data/seed-data";

const PARENT_CATEGORIES: Record<string, string> = {
  "bedside-tables": "আসবাবপত্র",
  chairs: "আসবাবপত্র",
  "office-desks": "আসবাবপত্র",
  "bookcases-shelving": "আসবাবপত্র",
  "show-rack": "আসবাবপত্র",
  "media-tv-storage": "আসবাবপত্র",
};

function MessengerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Messenger"
      role="img"
      viewBox="0 0 512 512"
      style={{ width: 20 }}
    >
      <rect width="512" height="512" rx="15%" fill="#ffffff" />
      <linearGradient id="messenger-a" x1="256" x2="256" y1="78.2" y2="441.2" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#00B2FF" />
        <stop offset="1" stopColor="#006AFF" />
      </linearGradient>
      <path
        fill="url(#messenger-a)"
        d="M256 78.2c-102.4 0-181.8 75 -181.8 176.4c0 53 21.7 98.8 57 130.4a14.7 14.7 0 015 10.4l1 32.3a14.6 14.6 0 0020.4 12.9l36-16a14.5 14.5 0 019.8-.7a197.8 197.8 0 0052.6 7c102.4 0 181.8-75 181.8 -176.3S358.4 78.2 256 78.2z"
      />
      <path
        fill="#ffffff"
        d="M146.8 306.1l53.4-84.7a27.3 27.3 0 0139.5-7.3l42.5 31.9a11 11 0 0013 0l57.5-43.6c7.6-5.8 17.6 3.4 12.5 11.5l-53.4 84.7a27.3 27.3 0 01-39.4 7.3L229.9 274a11 11 0 00-13.2 0l-57.4 43.6c-7.6 5.8-17.6 -3.4 -12.5 -11.5z"
      />
    </svg>
  );
}

export function ProductDetail({ product }: { product: ProductWithCategory }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants[0] ?? null
  );
  const { addItem } = useCart();
  const router = useRouter();

  const activePrice = selectedVariant?.price ?? product.price;
  const activeCompare = selectedVariant?.comparePrice ?? product.comparePrice;
  const discount =
    product.discount ?? calcDiscount(activePrice, activeCompare);

  const displayImages = useMemo(() => {
    const base = product.images.length ? product.images : [];
    if (selectedVariant?.image) {
      return [selectedVariant.image, ...base.filter((i) => i !== selectedVariant.image)];
    }
    return base;
  }, [product.images, selectedVariant]);

  const availableStock = selectedVariant
    ? (selectedVariant.stock ?? 0)
    : (product.stock ?? 0);

  const inStock = availableStock > 0;

  useEffect(() => {
    setQuantity((q) => Math.min(Math.max(1, q), Math.max(1, availableStock)));
  }, [selectedVariant, availableStock]);

  const handleOrder = () => {
    if (quantity > availableStock) {
      return;
    }
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        categorySlug: product.category.slug,
        titleBn: selectedVariant
          ? `${product.titleBn} (${selectedVariant.nameBn})`
          : product.titleBn,
        price: activePrice,
        comparePrice: activeCompare ?? undefined,
        image: selectedVariant?.image || product.images[0] || "",
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.nameBn,
        shippingFree: product.shippingFree ?? false,
        unit: product.unit,
      },
      quantity
    );
    router.push("/checkout");
  };

  const parentCategory =
    PARENT_CATEGORIES[product.category.slug] ?? product.category.nameBn;
  const categoryLabel =
    parentCategory !== product.category.nameBn
      ? `${parentCategory}, ${product.category.nameBn}`
      : product.category.nameBn;

  const summaryHtml =
    product.descriptionBn &&
    `<p>${product.descriptionBn.replace(/\n/g, "<br/>")}</p>`;

  const detailsHtml = product.descriptionBn
    ? `<p><strong>পণ্যের বিবরণ</strong></p><p>${product.descriptionBn}</p>`
    : "";

  return (
    <>
      <section className="pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div>
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <div
                    className="flex h-full transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${selectedImage * 100}%)` }}
                  >
                    {displayImages.map((img, idx) => (
                      <div
                        key={`${img}-${idx}`}
                        className="relative h-full w-full shrink-0 basis-full"
                      >
                        <Image
                          src={img}
                          alt={`${product.titleBn} ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                          priority={idx === 0}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {displayImages.length > 1 && (
                  <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 gap-2">
                    {displayImages.map((img, idx) => (
                      <button
                        key={`thumb-${img}-${idx}`}
                        type="button"
                        className={`relative aspect-square rounded-lg overflow-hidden border ${
                          selectedImage === idx
                            ? "border-violet-600"
                            : "border-gray-200"
                        }`}
                        aria-label={`View image ${idx + 1}`}
                        onClick={() => setSelectedImage(idx)}
                      >
                        <Image
                          src={img}
                          alt={`${product.titleBn} ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 16vw, (max-width: 1024px) 10vw, 10vw"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.titleBn}
                </h1>
              </div>

              <div className="mt-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPriceWithUnit(activePrice, product.unit)}
                  </span>
                  {activeCompare && activeCompare > activePrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(activeCompare)}
                      </span>
                    )}
                  {discount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <BadgePercent className="w-3 h-3" aria-hidden="true" />
                      ছাড় {discount}%
                    </span>
                  )}
                </div>

                <div className="space-y-6">
                  {product.variants.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-800 mb-2">
                        ভ্যারিয়েন্ট নির্বাচন করুন
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((variant) => (
                          <button
                            key={variant.id}
                            type="button"
                            disabled={!variant.inStock}
                            onClick={() => {
                              setSelectedVariant(variant);
                              setSelectedImage(0);
                            }}
                            className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                              selectedVariant?.id === variant.id
                                ? "border-[var(--accent-color)] bg-[var(--brand-green-muted)] text-[var(--brand-green)]"
                                : "border-gray-300 hover:border-gray-400"
                            } disabled:opacity-40`}
                          >
                            {variant.nameBn} — {formatPrice(variant.price)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      {inStock ? (
                        <>
                          স্টকে আছে:{" "}
                          <span className="font-medium text-gray-900">
                            {availableStock} {getUnitLabel(product.unit)}
                          </span>
                        </>
                      ) : (
                        <span className="text-red-600 font-medium">স্টক শেষ</span>
                      )}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center border border-gray-300 rounded-md">
                        <button
                          type="button"
                          className="px-2 py-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Decrease quantity"
                          disabled={quantity <= 1}
                          onClick={() =>
                            setQuantity((q) => Math.max(1, q - 1))
                          }
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          readOnly
                          inputMode="decimal"
                          className="w-16 px-1 py-1 text-sm text-center border-none focus:ring-0 focus:outline-none bg-transparent"
                          type="text"
                          value={quantity}
                        />
                        <button
                          type="button"
                          className="px-2 py-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Increase quantity"
                          disabled={quantity >= availableStock}
                          onClick={() =>
                            setQuantity((q) => Math.min(availableStock, q + 1))
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleOrder}
                        disabled={!inStock}
                        className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Zap className="w-4 h-4" aria-hidden="true" />
                        এখনই অর্ডার করুন
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleOrder}
                      disabled={!inStock}
                      className="inline-flex sm:hidden items-center gap-2 px-4 py-2 rounded-lg btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
                    >
                      <Zap className="w-4 h-4" aria-hidden="true" />
                      এখনই অর্ডার করুন
                    </button>

                    <a
                      href={SITE.messenger}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0084ff] text-white hover:bg-[#0073e6] w-[150px] justify-center"
                    >
                      <MessengerIcon />
                      মেসেজ করুন
                    </a>
                  </div>
                </div>

                <div className="mt-4 space-y-1 text-sm text-gray-700">
                  <div>ক্যাটাগরি: {categoryLabel}</div>
                  <div>ইউনিট: {getUnitLabel(product.unit)}</div>
                </div>
              </div>

              {summaryHtml && (
                <div
                  className="rich-content mb-3 mt-4"
                  dangerouslySetInnerHTML={{ __html: summaryHtml }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {detailsHtml && (
        <section className="pt-0 pb-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                বিবরণ
              </h2>
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: detailsHtml }}
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
