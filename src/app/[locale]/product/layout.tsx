import ProductNav from "@/components/ProductNav";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProductNav />
      {children}
    </>
  );
}
