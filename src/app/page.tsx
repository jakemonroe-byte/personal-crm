import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const totalContacts = await prisma.contact.count();

  const recentContacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const industryCounts = await prisma.contact.groupBy({
    by: ["industry"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  const contactsWithLinkedin = await prisma.contact.count({
    where: { linkedinUrl: { not: null } },
  });

  const contactsWithEmail = await prisma.contact.count({
    where: { email: { not: null } },
  });

  const contactsWithPhone = await prisma.contact.count({
    where: { phone: { not: null } },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted mt-1">Overview of your personal network</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card-bg rounded-xl border border-border p-6">
          <p className="text-sm font-medium text-muted">Total Contacts</p>
          <p className="text-3xl font-bold mt-2">{totalContacts}</p>
        </div>
        <div className="bg-card-bg rounded-xl border border-border p-6">
          <p className="text-sm font-medium text-muted">With Email</p>
          <p className="text-3xl font-bold mt-2">{contactsWithEmail}</p>
        </div>
        <div className="bg-card-bg rounded-xl border border-border p-6">
          <p className="text-sm font-medium text-muted">With Phone</p>
          <p className="text-3xl font-bold mt-2">{contactsWithPhone}</p>
        </div>
        <div className="bg-card-bg rounded-xl border border-border p-6">
          <p className="text-sm font-medium text-muted">LinkedIn Connected</p>
          <p className="text-3xl font-bold mt-2">{contactsWithLinkedin}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Contacts */}
        <div className="bg-card-bg rounded-xl border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Recently Added</h3>
            <Link href="/contacts" className="text-sm text-primary hover:text-primary-hover">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentContacts.length === 0 ? (
              <div className="p-6 text-center text-muted">
                <p>No contacts yet.</p>
                <Link href="/contacts/new" className="text-primary hover:text-primary-hover text-sm mt-1 inline-block">
                  Add your first contact
                </Link>
              </div>
            ) : (
              recentContacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/contacts/${contact.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-background transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {contact.firstName[0]}{contact.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-sm text-muted truncate">
                      {contact.title && contact.company
                        ? `${contact.title} at ${contact.company}`
                        : contact.company || contact.title || contact.email || "No details"}
                    </p>
                  </div>
                  <span className="text-xs text-muted bg-background px-2 py-1 rounded-full">
                    {contact.industry}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Industry Breakdown */}
        <div className="bg-card-bg rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold">Contacts by Industry</h3>
          </div>
          <div className="p-6">
            {industryCounts.length === 0 ? (
              <p className="text-center text-muted">No data yet</p>
            ) : (
              <div className="space-y-3">
                {industryCounts.map((item) => {
                  const percentage = totalContacts > 0 ? (item._count.id / totalContacts) * 100 : 0;
                  return (
                    <div key={item.industry}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <Link
                          href={`/contacts?industry=${encodeURIComponent(item.industry)}`}
                          className="hover:text-primary transition-colors"
                        >
                          {item.industry}
                        </Link>
                        <span className="text-muted">{item._count.id}</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
