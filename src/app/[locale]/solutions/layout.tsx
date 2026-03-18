import SolutionsNav from "@/components/SolutionsNav";

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="pt-16">
        <SolutionsNav />
      </div>
      {children}
    </>
  );
}
