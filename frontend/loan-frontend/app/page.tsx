import Link from "next/link";
import { Card } from "../components/ui/card";

const highlights = [
  {
    title: "Reliable Scoring",
    body: "Generate borrower default probability quickly using a production-ready ML pipeline.",
  },
  {
    title: "Decision Clarity",
    body: "Review low, medium, and high risk bands with straightforward interpretation.",
  },
  {
    title: "Operationally Ready",
    body: "Designed for lending operations with structured inputs and concise result summaries.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <Card className="px-6 py-14 text-center sm:px-10 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="page-title font-semibold tracking-tight text-[var(--foreground)]">
            Loan Risk Intelligence
          </h1>
          <p className="body-text mx-auto mt-4 max-w-2xl text-[var(--muted-foreground)]">
            Assess loan applications with data-driven default risk scoring to support faster, safer lending decisions.
          </p>
          <div className="mt-8">
            <Link
              href="/predict"
              className="text-button inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-6 py-2.5 font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)]"
            >
              Start Prediction
            </Link>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title} className="p-5 transition-shadow hover:shadow-md">
            <h2 className="card-title font-semibold text-[var(--foreground)]">{item.title}</h2>
            <p className="body-text mt-2 leading-relaxed text-[var(--muted-foreground)]">{item.body}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
