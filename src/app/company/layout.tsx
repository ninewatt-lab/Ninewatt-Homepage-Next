import CompanyNav from "@/components/CompanyNav";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="pt-16">
        <CompanyNav />
      </div>
      {children}
    </>
  );
}
