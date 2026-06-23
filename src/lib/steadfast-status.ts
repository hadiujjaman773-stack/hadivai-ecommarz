export const STEADFAST_STATUS_LABELS_BN: Record<string, string> = {
  in_review: "Steadfast রিভিউতে",
  pending: "ডেলিভারি/বাতিল বাকি",
  delivered_approval_pending: "ডেলিভার — অনুমোদন বাকি",
  partial_delivered_approval_pending: "আংশিক ডেলিভার — অনুমোদন বাকি",
  cancelled_approval_pending: "বাতিল — অনুমোদন বাকি",
  unknown_approval_pending: "অজানা — সাপোর্টে যোগাযোগ",
  delivered: "ডেলিভারি সম্পন্ন",
  partial_delivered: "আংশিক ডেলিভারি",
  cancelled: "বাতিল",
  hold: "হোল্ডে",
  unknown: "অজানা",
};

export function steadfastStatusLabelBn(status?: string | null): string {
  if (!status) return "—";
  return STEADFAST_STATUS_LABELS_BN[status] ?? status;
}

/** @deprecated use steadfastStatusLabelBn */
export const getSteadfastDeliveryLabel = steadfastStatusLabelBn;
