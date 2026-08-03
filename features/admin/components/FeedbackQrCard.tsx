import QRCode from "qrcode";
import { Card } from "@/components/ui/card";
import { absoluteUrl } from "@/lib/utils";

/**
 * Printable QR code pointing at the unlisted /feedback page. Customers scan
 * it (table tent, receipt, etc.) to leave a review — the page itself is
 * never linked from the site's own navigation.
 */
export async function FeedbackQrCard() {
  const feedbackUrl = absoluteUrl("/feedback");
  const qrDataUrl = await QRCode.toDataURL(feedbackUrl, {
    width: 480,
    margin: 1,
    color: { dark: "#3F3A2E", light: "#FBF9F4" },
  });

  return (
    <Card className="flex flex-col items-center gap-4 p-6 text-center">
      <div>
        <h2 className="font-serif text-lg font-medium">Collect feedback via QR</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Print this and place it in the salon. Scanning it opens the feedback
          form directly — it&apos;s not linked anywhere on the website.
        </p>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- a data: URI can't go through next/image's optimizer */}
      <img
        src={qrDataUrl}
        alt="QR code linking to the customer feedback form"
        width={200}
        height={200}
        className="rounded-xl border"
      />
      <a
        href={qrDataUrl}
        download="kuenphen-feedback-qr.png"
        className="text-gold-700 hover:text-gold-800 text-sm font-medium underline underline-offset-4"
      >
        Download QR code
      </a>
      <p className="text-muted-foreground text-xs break-all">{feedbackUrl}</p>
    </Card>
  );
}
