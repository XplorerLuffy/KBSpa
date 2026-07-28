import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  NotificationChannel,
  NotificationChannelName,
  NotificationPayload,
} from "@/lib/notifications/types";

/**
 * SMS and WhatsApp are not wired to a provider yet. Every send is recorded in
 * notification_logs so the admin can see what would have gone out; swapping in
 * Twilio later means replacing the body of send() and nothing else.
 */
class LoggingChannel implements NotificationChannel {
  constructor(readonly name: NotificationChannelName) {}

  async send({ to, template, data }: NotificationPayload) {
    try {
      const supabase = createAdminClient();
      await supabase.from("notification_logs").insert({
        channel: this.name,
        recipient: to,
        template,
        payload: data as never,
        status: "logged",
      });
    } catch (error) {
      console.warn(`[${this.name}] could not record notification`, error);
    }
  }
}

export const smsChannel = new LoggingChannel("sms");
export const whatsappChannel = new LoggingChannel("whatsapp");
