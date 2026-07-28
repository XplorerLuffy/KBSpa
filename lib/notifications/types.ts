export type NotificationChannelName = "email" | "sms" | "whatsapp";

export type NotificationPayload = {
  to: string;
  template: string;
  data: Record<string, unknown>;
};

export interface NotificationChannel {
  readonly name: NotificationChannelName;
  send(payload: NotificationPayload): Promise<void>;
}
