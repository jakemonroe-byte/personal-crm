"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { INDUSTRIES } from "@/lib/industries";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  location: string | null;
  industry: string;
  linkedinUrl: string | null;
  _count: { interactions: number };
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const industryParam = params.get("industry");
    if (industryParam) setIndustry(industryParam);
  }, []);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (industry) params.set("industry", industry);

      const res = await fetch(`/api/contacts?${params.toString()}`);
      const data = await res.json();
      setContacts(data);
      setLoading(false);
    };

    const timer = setTimeout(fetchContacts, 300);
    return () => clearTimeout(timer);
  }, [search, industry]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Contacts</h2>
          <p className="text-muted mt-1">{contacts.length} contacts</p>
        </div>
        <Link
          href="/contacts/new"
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Contact
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search contacts by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-card-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="px-4 py-2.5 border border-border rounded-lg bg-card-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        >
          <option value="">All Industries</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      {/* Contacts Table */}
      <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted">Loading...</div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <p className="text-lg mb-2">No contacts found</p>
            <p className="text-sm">
              {search || industry
                ? "Try adjusting your search or filter."
                : "Get started by adding your first contact."}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">
                  Name
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">
                  Company
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">
                  Industry
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">
                  Email
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">
                  Location
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">
                  LinkedIn
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-background transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs flex-shrink-0">
                        {contact.firstName[0]}
                        {contact.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm hover:text-primary transition-colors">
                          {contact.firstName} {contact.lastName}
                        </p>
                        {contact.title && (
                          <p className="text-xs text-muted">{contact.title}</p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">{contact.company || "—"}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {contact.industry}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {contact.email || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {contact.location || "—"}
                  </td>
                  <td className="px-6 py-4">
                    {contact.linkedinUrl ? (
                      <a
                        href={contact.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover text-sm"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-muted text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
