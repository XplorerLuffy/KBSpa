import { Navbar } from "@/components/shared/Navbar";
import { BookingProvider } from "@/features/booking/context/BookingProvider";

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main" className="flex-1 pt-28 pb-24">
        <BookingProvider>{children}</BookingProvider>
      </main>
    </div>
  );
}
