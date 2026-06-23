"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminModal } from "./AdminModal";
import { StatusBadge } from "./StatusBadge";
import { OrderFraudPanel } from "./OrderFraudPanel";
import { OrderFraudButton } from "./OrderFraudButton";
import { formatPrice } from "@/lib/format";

interface OrderItem {
  titleBn: string;
  price: number;
  quantity: number;
  size?: string;
}

interface OrderViewData {
  id: string;
  orderNumber: string;
  fullName: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  district?: string | null;
  note?: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  isCustom: boolean;
  clientIp?: string | null;
  createdAt: string;
}

interface OrderViewModalProps {
  order: OrderViewData;
  onClose: () => void;
}

export function OrderViewModal({ order, onClose }: OrderViewModalProps) {
  const [showFraudPanel, setShowFraudPanel] = useState(false);

  return (
    <>
    <AdminModal title={`অর্ডার ${order.orderNumber}`} onClose={onClose} maxWidth="lg">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} />
          {order.isCustom && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
              কাস্টম
            </span>
          )}
          <span className="text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleString("bn-BD")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">গ্রাহক</p>
            <p className="font-medium">{order.fullName}</p>
          </div>
          <div>
            <p className="text-gray-500">ফোন</p>
            <div className="flex flex-wrap items-center gap-2">
              <p>{order.phone}</p>
              <OrderFraudButton onClick={() => setShowFraudPanel(true)} />
            </div>
          </div>
          {order.email && (
            <div>
              <p className="text-gray-500">ইমেইল</p>
              <p>{order.email}</p>
            </div>
          )}
          {order.clientIp && (
            <div>
              <p className="text-gray-500">IP</p>
              <p className="font-mono text-xs">{order.clientIp}</p>
            </div>
          )}
          <div className="sm:col-span-2">
            <p className="text-gray-500">ঠিকানা</p>
            <p>
              {order.address}, {order.city}
              {order.district ? `, ${order.district}` : ""}
            </p>
          </div>
        </div>

        <div className="border rounded-lg divide-y">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between gap-3 p-3 text-sm">
              <div>
                <p className="font-medium">{item.titleBn}</p>
                <p className="text-gray-500">× {item.quantity}</p>
              </div>
              <p className="font-medium shrink-0">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">সাবটোটাল</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">শিপিং</span>
            <span>{formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>মোট</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {order.note && (
          <div className="text-sm">
            <p className="text-gray-500 mb-1">নোট</p>
            <p className="bg-gray-50 rounded-lg p-3">{order.note}</p>
          </div>
        )}

        <Link
          href={`/admin/orders/${order.id}`}
          className="btn-primary block text-center py-2.5 rounded-md"
          onClick={onClose}
        >
          সম্পূর্ণ বিস্তারিত দেখুন
        </Link>
      </div>
    </AdminModal>

    <OrderFraudPanel
      orderId={order.id}
      phone={order.phone}
      active={showFraudPanel}
      onClose={() => setShowFraudPanel(false)}
    />
    </>
  );
}
