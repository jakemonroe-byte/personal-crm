import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchLinkedInProfile, normalizeLinkedInUrl } from "@/lib/linkedin";

// POST /api/contacts/:id/linkedin — sync LinkedIn data for a contact
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({ where: { id } });

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  if (!contact.linkedinUrl) {
    return NextResponse.json(
      { error: "Contact has no LinkedIn URL configured" },
      { status: 400 }
    );
  }

  const normalizedUrl = normalizeLinkedInUrl(contact.linkedinUrl);
  if (!normalizedUrl) {
    return NextResponse.json(
      { error: "Invalid LinkedIn URL" },
      { status: 400 }
    );
  }

  const profileData = await fetchLinkedInProfile(normalizedUrl);

  if (!profileData) {
    return NextResponse.json(
      {
        error:
          "Could not fetch LinkedIn profile. Ensure LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET are set in your .env file.",
      },
      { status: 422 }
    );
  }

  const updated = await prisma.contact.update({
    where: { id },
    data: {
      linkedinUrl: normalizedUrl,
      headline: profileData.headline ?? contact.headline,
      company: profileData.company ?? contact.company,
      title: profileData.title ?? contact.title,
      location: profileData.location ?? contact.location,
      linkedinSyncedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
