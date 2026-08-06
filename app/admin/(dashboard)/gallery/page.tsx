import type { Metadata } from "next";
import Image from "next/image";
import { Images } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { AdminForm, DeleteButton } from "@/features/admin/components/AdminForm";
import { CheckboxField, Field } from "@/features/admin/components/Field";
import { deleteGalleryItem, saveGalleryItem } from "@/features/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { MediaField } from "@/features/admin/components/MediaField";

export const metadata: Metadata = { title: "Gallery", robots: { index: false } };

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-medium">Gallery</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Images shown on the public gallery page.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Card className="p-6">
          <h2 className="mb-5 font-serif text-lg font-medium">Add an image</h2>
          <AdminForm
            action={saveGalleryItem}
            submitLabel="Add image"
            successMessage="Image added"
          >
            <MediaField name="image_url" label="Image" folder="gallery" />
            <Field name="caption" label="Caption" />
            <Field
              name="category"
              label="Category"
              hint="For example: massage, facial, spa, salon"
            />
            <Field name="sort_order" label="Sort order" type="number" defaultValue={0} />
            <CheckboxField name="is_featured" label="Featured" />
          </AdminForm>
        </Card>

        <div>
          {(items ?? []).length === 0 ? (
            <EmptyState icon={Images} title="No images yet" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {(items ?? []).map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="bg-muted relative aspect-[4/3]">
                    <Image
                      src={item.image_url}
                      alt={item.caption ?? ""}
                      fill
                      sizes="300px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.caption ?? "Untitled"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {item.category ?? "Uncategorised"}
                      </p>
                    </div>
                    <DeleteButton
                      action={async () => {
                        "use server";
                        return deleteGalleryItem(item.id);
                      }}
                      confirmMessage="Delete this image?"
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
