"use client";

import Link from "next/link";
import { useState } from "react";
import { INDUSTRIES } from "@/lib/industries";

interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  headline: string | null;
  location: string | null;
  industry: string;
  linkedinUrl: string | null;
  linkedinSyncedAt: string | null;
  _count: { interactions: number };
  _searchScore: number;
  _matchedFields: string[];
}

interface QuickAddForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  headline: string;
  location: string;
  linkedinUrl: string;
  industry: string;
  notes: string;
}

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState<QuickAddForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    headline: "",
    location: "",
    linkedinUrl: "",
    industry: "Other",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setSearched(false);
    setSaveMessage("");

    try {
      const res = await fetch("/api/contacts/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResults(data);
      setSearched(true);

      // Pre-fill the quick-add form with whatever the user typed
      if (data.length === 0) {
        prefillFromQuery(query);
      }
    } catch {
      setResults([]);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const prefillFromQuery = (q: string) => {
    const parts = q.trim().split(/\s+/);
    const emailMatch = q.match(/[\w.+-]+@[\w.-]+\.\w+/);
    const linkedinMatch = q.match(
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/
    );

    const form: QuickAddForm = {
      firstName: "",
      lastName: "",
      email: emailMatch ? emailMatch[0] : "",
      phone: "",
      company: "",
      title: "",
      headline: "",
      location: "",
      linkedinUrl: linkedinMatch ? linkedinMatch[0] : "",
      industry: "Other",
      notes: `Discovered via search: "${q}"`,
    };

    // Try to extract name — filter out email-like and URL-like tokens
    const nameTokens = parts.filter(
      (p) => !p.includes("@") && !p.includes("linkedin.com") && !p.includes("/")
    );

    if (nameTokens.length >= 2) {
      form.firstName = nameTokens[0];
      form.lastName = nameTokens.slice(1).join(" ");
    } else if (nameTokens.length === 1) {
      // Could be a first name, company, or anything
      // Check if it looks like a company (capitalized multi-word or known patterns)
      form.firstName = nameTokens[0];
    }

    setQuickAddForm(form);
    setShowQuickAdd(true);
  };

  const handleQuickAddChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setQuickAddForm({ ...quickAddForm, [e.target.name]: e.target.value });
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddForm.firstName || !quickAddForm.lastName) {
      setSaveMessage("First name and last name are required.");
      return;
    }

    setSaving(true);
    setSaveMessage("");

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickAddForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      const contact = await res.json();
      setSaveMessage(`Added ${contact.firstName} ${contact.lastName}!`);
      setShowQuickAdd(false);
      setQuickAddForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        title: "",
        headline: "",
        location: "",
        linkedinUrl: "",
        industry: "Other",
        notes: "",
      });

      // Re-run search to show the new contact
      if (query.trim()) {
        const res2 = await fetch("/api/contacts/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        setResults(await res2.json());
      }
    } catch (err) {
      setSaveMessage(
        err instanceof Error ? err.message : "Failed to save contact"
      );
    } finally {
      setSaving(false);
    }
  };

  const fieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      firstName: "First Name",
      lastName: "Last Name",
      fullName: "Name",
      email: "Email",
      phone: "Phone",
      company: "Company",
      title: "Title",
      headline: "Headline",
      location: "Location",
      industry: "Industry",
      notes: "Notes",
      linkedinUrl: "LinkedIn",
    };
    return labels[field] || field;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Discover People</h2>
        <p className="text-muted mt-1">
          Search your network by entering anything you know — a name, email,
          company, job title, or any combination.
        </p>
      </div>

      {/* Search Box */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='e.g. "Jane Smith Tesla" or "john@acme.com" or "solar engineer San Francisco"'
              className="w-full pl-12 pr-4 py-3.5 border border-border rounded-xl bg-card-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
        <p className="text-xs text-muted mt-2">
          Enter multiple keywords to narrow results. Each term is matched across
          names, emails, companies, titles, locations, and more.
        </p>
      </form>

      {/* Save message */}
      {saveMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {saveMessage}
        </div>
      )}

      {/* Results */}
      {searched && (
        <div>
          {results.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  Found {results.length} match
                  {results.length !== 1 ? "es" : ""} in your network
                </h3>
                <button
                  onClick={() => {
                    prefillFromQuery(query);
                  }}
                  className="text-sm text-primary hover:text-primary-hover font-medium"
                >
                  + Add someone new instead
                </button>
              </div>
              <div className="space-y-4">
                {results.map((contact) => (
                  <div
                    key={contact.id}
                    className="bg-card-bg rounded-xl border border-border p-5 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {contact.firstName[0]}
                        {contact.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link
                              href={`/contacts/${contact.id}`}
                              className="text-lg font-semibold hover:text-primary transition-colors"
                            >
                              {contact.firstName} {contact.lastName}
                            </Link>
                            {contact.headline && (
                              <p className="text-sm text-muted mt-0.5">
                                {contact.headline}
                              </p>
                            )}
                          </div>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex-shrink-0">
                            {contact.industry}
                          </span>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 mt-3">
                          {contact.title && contact.company && (
                            <div>
                              <span className="text-xs text-muted uppercase tracking-wider">
                                Role
                              </span>
                              <p className="text-sm">
                                {contact.title} at {contact.company}
                              </p>
                            </div>
                          )}
                          {!contact.title && contact.company && (
                            <div>
                              <span className="text-xs text-muted uppercase tracking-wider">
                                Company
                              </span>
                              <p className="text-sm">{contact.company}</p>
                            </div>
                          )}
                          {contact.email && (
                            <div>
                              <span className="text-xs text-muted uppercase tracking-wider">
                                Email
                              </span>
                              <p className="text-sm">
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="text-primary hover:text-primary-hover"
                                >
                                  {contact.email}
                                </a>
                              </p>
                            </div>
                          )}
                          {contact.phone && (
                            <div>
                              <span className="text-xs text-muted uppercase tracking-wider">
                                Phone
                              </span>
                              <p className="text-sm">{contact.phone}</p>
                            </div>
                          )}
                          {contact.location && (
                            <div>
                              <span className="text-xs text-muted uppercase tracking-wider">
                                Location
                              </span>
                              <p className="text-sm">{contact.location}</p>
                            </div>
                          )}
                          {contact.linkedinUrl && (
                            <div>
                              <span className="text-xs text-muted uppercase tracking-wider">
                                LinkedIn
                              </span>
                              <p className="text-sm">
                                <a
                                  href={contact.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary-hover"
                                >
                                  View Profile
                                </a>
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Match info */}
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                          <span className="text-xs text-muted">
                            Matched on:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {contact._matchedFields.map((field) => (
                              <span
                                key={field}
                                className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
                              >
                                {fieldLabel(field)}
                              </span>
                            ))}
                          </div>
                          <Link
                            href={`/contacts/${contact.id}`}
                            className="ml-auto text-sm text-primary hover:text-primary-hover font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-card-bg rounded-xl border border-border p-8 text-center">
              <svg
                className="w-12 h-12 text-muted mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
              <p className="text-lg font-medium mb-1">
                No matches in your network
              </p>
              <p className="text-sm text-muted mb-4">
                Nobody in your contacts matched &ldquo;{query}&rdquo;. Would you
                like to add this person?
              </p>
              {!showQuickAdd && (
                <button
                  onClick={() => prefillFromQuery(query)}
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  + Add to My Network
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Add Form */}
      {showQuickAdd && (
        <div className="mt-6 bg-card-bg rounded-xl border border-primary/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Add to Your Network</h3>
            <button
              onClick={() => setShowQuickAdd(false)}
              className="text-muted hover:text-foreground text-sm"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleQuickAddSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="firstName"
                  type="text"
                  required
                  value={quickAddForm.firstName}
                  onChange={handleQuickAddChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="lastName"
                  type="text"
                  required
                  value={quickAddForm.lastName}
                  onChange={handleQuickAddChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={quickAddForm.email}
                  onChange={handleQuickAddChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">
                  Phone
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={quickAddForm.phone}
                  onChange={handleQuickAddChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">
                  Company
                </label>
                <input
                  name="company"
                  type="text"
                  value={quickAddForm.company}
                  onChange={handleQuickAddChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">
                  Job Title
                </label>
                <input
                  name="title"
                  type="text"
                  value={quickAddForm.title}
                  onChange={handleQuickAddChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">
                  Headline
                </label>
                <input
                  name="headline"
                  type="text"
                  value={quickAddForm.headline}
                  onChange={handleQuickAddChange}
                  placeholder="e.g. VP of Engineering"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">
                  Location
                </label>
                <input
                  name="location"
                  type="text"
                  value={quickAddForm.location}
                  onChange={handleQuickAddChange}
                  placeholder="e.g. New York, NY"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">
                  Industry
                </label>
                <select
                  name="industry"
                  value={quickAddForm.industry}
                  onChange={handleQuickAddChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  name="linkedinUrl"
                  type="url"
                  value={quickAddForm.linkedinUrl}
                  onChange={handleQuickAddChange}
                  placeholder="https://www.linkedin.com/in/username"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={quickAddForm.notes}
                  onChange={handleQuickAddChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add to My Network"}
              </button>
              <button
                type="button"
                onClick={() => setShowQuickAdd(false)}
                className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-background transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
