import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/contacts/search — deep search across all contact fields
// Accepts a free-form query and splits it into tokens, matching each token
// against every searchable field. Contacts matching more tokens rank higher.
export async function POST(request: NextRequest) {
  const { query } = await request.json();

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return NextResponse.json([]);
  }

  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((t: string) => t.length > 0);

  // Fetch all contacts and score them in-memory for flexible multi-token matching.
  // For large datasets this could be replaced with full-text search.
  const allContacts = await prisma.contact.findMany({
    include: {
      _count: { select: { interactions: true } },
    },
  });

  const searchableFields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "company",
    "title",
    "headline",
    "location",
    "industry",
    "notes",
    "linkedinUrl",
  ] as const;

  type ContactRecord = (typeof allContacts)[number];

  const scored = allContacts
    .map((contact: ContactRecord) => {
      let score = 0;
      const matchedFields = new Set<string>();

      for (const token of tokens) {
        let tokenMatched = false;
        for (const field of searchableFields) {
          const value = contact[field];
          if (value && value.toLowerCase().includes(token)) {
            // Boost name/email matches more than other fields
            const boost =
              field === "firstName" || field === "lastName" || field === "email"
                ? 3
                : field === "company" || field === "title"
                  ? 2
                  : 1;
            score += boost;
            matchedFields.add(field);
            tokenMatched = true;
          }
        }

        // Also check full name as combined string
        const fullName =
          `${contact.firstName} ${contact.lastName}`.toLowerCase();
        if (fullName.includes(token)) {
          score += 3;
          matchedFields.add("fullName");
          tokenMatched = true;
        }

        // Penalize if a token didn't match anything
        if (!tokenMatched) {
          score -= 2;
        }
      }

      return {
        contact,
        score,
        matchedFields: Array.from(matchedFields),
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return NextResponse.json(
    scored.map((r) => ({
      ...r.contact,
      _searchScore: r.score,
      _matchedFields: r.matchedFields,
    }))
  );
}
