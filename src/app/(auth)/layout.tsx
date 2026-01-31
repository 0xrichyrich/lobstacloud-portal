import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <Nav email={session.email} />
      <main className="pt-20 pb-12 px-4 sm:px-6 max-w-6xl mx-auto">
        {children}
      </main>
    </>
  );
}
