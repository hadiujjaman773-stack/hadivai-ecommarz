export default function ShopLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 py-16">
      <div
        className="h-10 w-10 rounded-full border-2 border-[var(--brand-green)] border-t-transparent animate-spin"
        aria-hidden
      />
      <p className="text-sm text-gray-500">লোড হচ্ছে...</p>
    </div>
  );
}
