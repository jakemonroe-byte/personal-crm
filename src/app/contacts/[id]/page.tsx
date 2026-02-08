import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DeleteContactButton } from "@/components/DeleteContactButton";
import { LinkedInSyncButton } from "@/components/LinkedInSyncButton";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      interactions: { orderBy: { date: "desc" } },
    },
  });

  if (!contact) notFound();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/contacts"
            className="text-muted hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            {contact.firstName[0]}{contact.lastName[0]}
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {contact.firstName} {contact.lastName}
            </h2>
            {contact.title && contact.company && (
              <p className="text-muted">
                {contact.title} at {contact.company}
              </p>
            )}
            <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {contact.industry}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/contacts/${contact.id}/edit`}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Edit
          </Link>
          <DeleteContactButton contactId={contact.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card-bg rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-4">Contact Information</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs font-medium text-muted uppercase tracking-wider">Email</dt>
                <dd className="mt-1 text-sm">
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`} className="text-primary hover:text-primary-hover">
                      {contact.email}
                    </a>
                  ) : (
                    <span className="text-muted">Not provided</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted uppercase tracking-wider">Phone</dt>
                <dd className="mt-1 text-sm">
                  {contact.phone ? (
                    <a href={`tel:${contact.phone}`} className="text-primary hover:text-primary-hover">
                      {contact.phone}
                    </a>
                  ) : (
                    <span className="text-muted">Not provided</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted uppercase tracking-wider">Company</dt>
                <dd className="mt-1 text-sm">{contact.company || <span className="text-muted">Not provided</span>}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted uppercase tracking-wider">Title</dt>
                <dd className="mt-1 text-sm">{contact.title || <span className="text-muted">Not provided</span>}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted uppercase tracking-wider">Location</dt>
                <dd className="mt-1 text-sm">{contact.location || <span className="text-muted">Not provided</span>}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted uppercase tracking-wider">Industry</dt>
                <dd className="mt-1 text-sm">{contact.industry}</dd>
              </div>
            </dl>
          </div>

          {/* Notes */}
          {contact.notes && (
            <div className="bg-card-bg rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-3">Notes</h3>
              <p className="text-sm text-muted whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}

          {/* Interactions */}
          <div className="bg-card-bg rounded-xl border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold">Interaction History</h3>
            </div>
            {contact.interactions.length === 0 ? (
              <div className="p-6 text-center text-muted text-sm">
                No interactions recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {contact.interactions.map((interaction) => (
                  <div key={interaction.id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {interaction.type}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(interaction.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm mt-2">{interaction.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LinkedIn Sidebar */}
        <div className="space-y-6">
          <div className="bg-card-bg rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">LinkedIn</h3>
              {contact.linkedinUrl && (
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:text-primary-hover"
                >
                  Open Profile
                </a>
              )}
            </div>
            {contact.linkedinUrl ? (
              <div className="space-y-3">
                {contact.headline && (
                  <div>
                    <dt className="text-xs font-medium text-muted uppercase tracking-wider">Headline</dt>
                    <dd className="mt-1 text-sm">{contact.headline}</dd>
                  </div>
                )}
                {contact.company && (
                  <div>
                    <dt className="text-xs font-medium text-muted uppercase tracking-wider">Company</dt>
                    <dd className="mt-1 text-sm">{contact.company}</dd>
                  </div>
                )}
                {contact.title && (
                  <div>
                    <dt className="text-xs font-medium text-muted uppercase tracking-wider">Title</dt>
                    <dd className="mt-1 text-sm">{contact.title}</dd>
                  </div>
                )}
                {contact.location && (
                  <div>
                    <dt className="text-xs font-medium text-muted uppercase tracking-wider">Location</dt>
                    <dd className="mt-1 text-sm">{contact.location}</dd>
                  </div>
                )}
                {contact.linkedinSyncedAt && (
                  <p className="text-xs text-muted pt-2 border-t border-border">
                    Last synced: {new Date(contact.linkedinSyncedAt).toLocaleDateString()}
                  </p>
                )}
                <LinkedInSyncButton contactId={contact.id} />
              </div>
            ) : (
              <p className="text-sm text-muted">
                No LinkedIn profile linked.
                <Link href={`/contacts/${contact.id}/edit`} className="text-primary hover:text-primary-hover ml-1">
                  Add one
                </Link>
              </p>
            )}
          </div>

          {/* Quick Info */}
          <div className="bg-card-bg rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-3">Record Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Created</dt>
                <dd>{new Date(contact.createdAt).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Updated</dt>
                <dd>{new Date(contact.updatedAt).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Interactions</dt>
                <dd>{contact.interactions.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
