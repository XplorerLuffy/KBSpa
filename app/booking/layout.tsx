import { Navbar } from "@/components/shared/Navbar";
import { BookingProvider } from "@/features/booking/context/BookingProvider";
import { getSessionUser } from "@/lib/supabase/server";

export default async function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isAuthenticated={Boolean(user)} />
      <main id="main" className="flex-1 pt-28 pb-24">
        <BookingProvider>{children}</BookingProvider>
      </main>
    </div>
  );
}
