import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContactForm from "@/components/ContactForm";

export const dynamic = "force-dynamic";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
  });

  if (!contact) notFound();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/contacts/${contact.id}`}
          className="text-muted hover:text-foreground transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">
            Edit {contact.firstName} {contact.lastName}
          </h2>
          <p className="text-muted mt-1">Update contact details</p>
        </div>
      </div>
      <ContactForm initialData={contact} />
    </div>
  );
}
