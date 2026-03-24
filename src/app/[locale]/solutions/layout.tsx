import SolutionsNav from "@/components/SolutionsNav";

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SolutionsNav />
      {children}
    </>
  );
}
