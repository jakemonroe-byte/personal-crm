import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/contacts/:id — get a single contact
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      interactions: { orderBy: { date: "desc" } },
    },
  });

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json(contact);
}

// PUT /api/contacts/:id — update a contact
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const {
    firstName,
    lastName,
    email,
    phone,
    notes,
    linkedinUrl,
    headline,
    company,
    title,
    location,
    industry,
  } = body;

  const contact = await prisma.contact.update({
    where: { id },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(email !== undefined && { email: email || null }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(notes !== undefined && { notes: notes || null }),
      ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl || null }),
      ...(headline !== undefined && { headline: headline || null }),
      ...(company !== undefined && { company: company || null }),
      ...(title !== undefined && { title: title || null }),
      ...(location !== undefined && { location: location || null }),
      ...(industry !== undefined && { industry }),
    },
  });

  return NextResponse.json(contact);
}

// DELETE /api/contacts/:id — delete a contact
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.contact.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
