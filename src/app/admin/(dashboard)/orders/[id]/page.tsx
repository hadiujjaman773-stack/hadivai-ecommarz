import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderDetail } from "@/components/admin/OrderDetail";

export const metadata = { title: "অর্ডার বিস্তারিত" };

type Params = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Params) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) notFound();

  const ipBlocked = order.clientIp
    ? !!(await prisma.blockedIp.findUnique({
        where: { ip: order.clientIp },
      }))
    : false;

  return (
    <OrderDetail
      ipBlocked={ipBlocked}
      order={{
        ...order,
        email: order.email,
        clientIp: order.clientIp,
        isCustom: order.isCustom,
        steadfastConsignmentId: order.steadfastConsignmentId,
        steadfastTrackingCode: order.steadfastTrackingCode,
        steadfastDeliveryStatus: order.steadfastDeliveryStatus,
        steadfastLastError: order.steadfastLastError,
        steadfastCreatedAt: order.steadfastCreatedAt,
        steadfastSyncedAt: order.steadfastSyncedAt,
        items: order.items as {
          titleBn: string;
          price: number;
          quantity: number;
          size?: string;
        }[],
      }}
    />
  );
}
