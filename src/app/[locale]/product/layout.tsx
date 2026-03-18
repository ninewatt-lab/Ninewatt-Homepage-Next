import ProductNav from "@/components/ProductNav";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="pt-16">
        <ProductNav />
      </div>
      {children}
    </>
  );
}
