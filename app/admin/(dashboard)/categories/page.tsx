import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminForm, DeleteButton } from "@/features/admin/components/AdminForm";
import { CheckboxField, Field } from "@/features/admin/components/Field";
import { deleteCategory, saveCategory } from "@/features/admin/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Categories", robots: { index: false } };

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-medium">Categories</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Group treatments however you like — there is no limit.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-6">
          <h2 className="mb-5 font-serif text-lg font-medium">Add a category</h2>
          <AdminForm
            action={saveCategory}
            submitLabel="Add category"
            successMessage="Category added"
          >
            <Field name="name" label="Name" required />
            <Field name="slug" label="URL slug" required />
            <Field name="description" label="Description" />
            <Field name="sort_order" label="Sort order" type="number" defaultValue={0} />
            <CheckboxField name="is_active" label="Visible on the site" defaultChecked />
          </AdminForm>
        </Card>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(categories ?? []).map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.slug}
                  </TableCell>
                  <TableCell>{category.sort_order}</TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? "olive" : "neutral"}>
                      {category.is_active ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteButton
                      action={async () => {
                        "use server";
                        return deleteCategory(category.id);
                      }}
                      confirmMessage={`Delete "${category.name}"? Services in it will become uncategorised.`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
