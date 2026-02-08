import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export default function NewContactPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/contacts"
          className="text-muted hover:text-foreground transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Add New Contact</h2>
          <p className="text-muted mt-1">Enter the details for your new contact</p>
        </div>
      </div>
      <ContactForm />
    </div>
  );
}
