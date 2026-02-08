import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/contacts — list all contacts with optional filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const industry = searchParams.get("industry") || "";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
      { company: { contains: search } },
      { title: { contains: search } },
    ];
  }

  if (industry) {
    where.industry = industry;
  }

  const contacts = await prisma.contact.findMany({
    where,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      _count: { select: { interactions: true } },
    },
  });

  return NextResponse.json(contacts);
}

// POST /api/contacts — create a new contact
export async function POST(request: NextRequest) {
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

  if (!firstName || !lastName) {
    return NextResponse.json(
      { error: "firstName and lastName are required" },
      { status: 400 }
    );
  }

  const contact = await prisma.contact.create({
    data: {
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      notes: notes || null,
      linkedinUrl: linkedinUrl || null,
      headline: headline || null,
      company: company || null,
      title: title || null,
      location: location || null,
      industry: industry || "Other",
    },
  });

  return NextResponse.json(contact, { status: 201 });
}
