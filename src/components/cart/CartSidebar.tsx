"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, X, Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice, formatPriceWithUnit } from "@/lib/format";

export function CartSidebar() {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalItems,
    subtotal,
  } = useCart();

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  if (!portalRoot || !isOpen) return null;

  return createPortal(
    <>
      <button
        type="button"
        className="cart-overlay"
        aria-label="কার্ট বন্ধ করুন"
        onClick={closeCart}
      />

      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="কার্ট">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-700" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-900">
              আপনার কার্ট
            </h2>
            <span className="text-sm text-gray-500">
              ({totalItems}টি আইটেম)
            </span>
          </div>
          <button
            type="button"
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="কার্ট বন্ধ করুন"
            onClick={closeCart}
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              আপনার কার্ট খালি
            </p>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId ?? item.size ?? ""}`}
                className="flex items-center gap-3"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0 relative">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.titleBn}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.titleBn}
                      </p>
                      {item.variantName && (
                        <p className="text-xs text-gray-500 truncate">
                          ভ্যারিয়েন্ট: {item.variantName}
                        </p>
                      )}
                      <p className="text-xs text-gray-600">
                        {formatPriceWithUnit(item.price, item.unit)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="p-2 rounded-md hover:bg-gray-100 flex-shrink-0"
                      aria-label="আইটেম মুছুন"
                      onClick={() =>
                        removeItem(item.productId, item.variantId ?? item.size)
                      }
                    >
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center border border-gray-200 rounded-md">
                      <button
                        type="button"
                        className="px-2 py-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        aria-label="পরিমাণ কমান"
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity - 1,
                            item.variantId ?? item.size
                          )
                        }
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        readOnly
                        inputMode="decimal"
                        className="w-16 px-1 py-1 text-sm text-center border-none focus:ring-0 focus:outline-none bg-transparent"
                        type="text"
                        value={item.quantity}
                      />
                      <button
                        type="button"
                        className="px-2 py-1.5 text-gray-700 hover:bg-gray-100"
                        aria-label="পরিমাণ বাড়ান"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity + 1,
                            item.variantId ?? item.size
                          )
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">সাবটোটাল</span>
              <span className="text-base font-semibold text-gray-900">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Link
              href="/checkout"
              className="btn-primary w-full text-center block py-2"
              onClick={closeCart}
            >
              চেকআউট
            </Link>
          </div>
        )}
      </aside>
    </>,
    portalRoot
  );
}
