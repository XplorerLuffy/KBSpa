import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { AdminForm } from "@/features/admin/components/AdminForm";
import { Field, TextareaField } from "@/features/admin/components/Field";
import { saveSettings } from "@/features/admin/actions";
import { getSettings } from "@/services/content.service";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-medium">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Everything here is used across the public site — nothing is hardcoded.
        </p>
      </div>

      <Card className="max-w-3xl p-7">
        <AdminForm
          action={saveSettings}
          submitLabel="Save settings"
          successMessage="Settings saved"
        >
          <h2 className="font-serif text-lg font-medium">Business</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              name="setting_business_name"
              label="Business name"
              defaultValue={settings.business_name}
            />
            <Field
              name="setting_tagline"
              label="Tagline"
              defaultValue={settings.tagline}
            />
          </div>
          <Field
            name="setting_logo_url"
            label="Logo URL"
            defaultValue={settings.logo_url}
            hint="Paste a URL to your own logo (any host, or upload to Storage). Leave blank to use the bundled artwork."
          />

          <h2 className="mt-4 font-serif text-lg font-medium">Contact</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="setting_phone" label="Phone" defaultValue={settings.phone} />
            <Field
              name="setting_email"
              label="Email"
              type="email"
              defaultValue={settings.email}
            />
            <Field
              name="setting_whatsapp"
              label="WhatsApp number"
              defaultValue={settings.whatsapp}
              hint="Digits only, including country code."
            />
            <Field
              name="setting_address"
              label="Address"
              defaultValue={settings.address}
            />
          </div>
          <Field
            name="setting_map_embed_url"
            label="Google Maps embed URL"
            defaultValue={settings.map_embed_url}
          />

          <h2 className="mt-4 font-serif text-lg font-medium">Social</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              name="setting_facebook_url"
              label="Facebook URL"
              defaultValue={settings.facebook_url}
            />
            <Field
              name="setting_instagram_url"
              label="Instagram URL"
              defaultValue={settings.instagram_url}
            />
          </div>

          <h2 className="mt-4 font-serif text-lg font-medium">Homepage & about</h2>
          <Field
            name="setting_hero_image_url"
            label="Hero background image URL"
            defaultValue={settings.hero_image_url}
            hint="Leave blank to use the bundled artwork."
          />
          <Field
            name="setting_hero_video_url"
            label="Hero background video URL"
            defaultValue={settings.hero_video_url}
            hint="Optional. MP4, looping, no audio. Leave blank to use the bundled animation. Ignored when a visitor has reduced-motion enabled."
          />
          <Field
            name="setting_hero_subtitle"
            label="Hero subtitle"
            defaultValue={settings.hero_subtitle}
          />
          <TextareaField
            name="setting_about_story"
            label="Our story"
            rows={4}
            defaultValue={settings.about_story}
          />
          <TextareaField
            name="setting_about_mission"
            label="Mission"
            rows={3}
            defaultValue={settings.about_mission}
          />
          <TextareaField
            name="setting_about_vision"
            label="Vision"
            rows={3}
            defaultValue={settings.about_vision}
          />

          <h2 className="mt-4 font-serif text-lg font-medium">Booking</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              name="setting_booking_slot_interval_minutes"
              label="Slot interval (minutes)"
              type="number"
              min={5}
              step={5}
              defaultValue={settings.booking_slot_interval_minutes}
            />
            <Field
              name="setting_timezone"
              label="Timezone"
              defaultValue={settings.timezone}
              hint="IANA name, e.g. Asia/Thimphu."
            />
          </div>
        </AdminForm>
      </Card>
    </div>
  );
}
