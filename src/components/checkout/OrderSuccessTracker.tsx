"use client";

import { useEffect, useRef } from "react";
import { pushToDataLayer } from "@/lib/gtm";

type OrderItem = {
  productId: string;
  variantId?: string;
  titleBn: string;
  variantName?: string;
  price: number;
  categorySlug: string;
  quantity: number;
};

type OrderProp = {
  orderNumber: string;
  total: number;
  shipping: number;
  fullName: string;
  email: string | null;
  phone: string;
  address: string;
  city: string;
  items: unknown;
};

export function OrderSuccessTracker({ order }: { order: OrderProp }) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (!order) return;

    const storageKey = `tracked_order_${order.orderNumber}`;
    const alreadyTracked = localStorage.getItem(storageKey);

    if (!hasFired.current && !alreadyTracked) {
      localStorage.setItem(storageKey, "true");

      // Parse items from JSON if it's a string, otherwise use directly
      const parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

      pushToDataLayer("purchase", {
        transaction_id: order.orderNumber,
        currency: "BDT",
        value: order.total,
        shipping: order.shipping,
        user_data: {
          email_address: order.email || undefined,
          phone_number: order.phone || undefined,
          address: {
            first_name: order.fullName || undefined,
            street: order.address || undefined,
            city: order.city || undefined,
          },
        },
        items: Array.isArray(parsedItems) ? parsedItems.map((item: OrderItem) => ({
          item_id: item.variantId ?? item.productId,
          item_name: item.titleBn,
          item_variant: item.variantName,
          price: item.price,
          item_category: item.categorySlug,
          quantity: item.quantity,
        })) : [],
      });
      hasFired.current = true;
    }
  }, [order]);

  return null;
}
