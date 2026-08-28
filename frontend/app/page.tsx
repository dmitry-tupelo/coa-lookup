import { SearchForm } from "@/components/SearchForm";

const trustPoints = [
  {
    icon: "🛡️",
    title: "Trusted Third-Party Testing",
    description: "Over 40,000 public COAs available for verification",
  },
  {
    icon: "⏱️",
    title: "Quick Turnaround Times",
    description: "Fast, reliable results with detailed analysis reports",
  },
  {
    icon: "📄",
    title: "HPLC & MS Testing",
    description: "State-of-the-art equipment for identity and purity confirmation",
  },
];

const steps = [
  {
    number: 1,
    title: "Submit Sample",
    description: "Send your sample with the provided submission form",
  },
  {
    number: 2,
    title: "Lab Analysis",
    description: "HPLC and mass spectrometry testing performed",
  },
  {
    number: 3,
    title: "Review Results",
    description: "Expert review and quality verification",
  },
  {
    number: 4,
    title: "Get Your COA",
    description: "COAs will be emailed out to you directly",
  },
];

const compliance = [
  {
    icon: "🛡️",
    title: "Compliant with ISO 9001",
    description: "Quality Management Principles",
  },
  {
    icon: "✅",
    title: "Good Laboratory Practice (GLP)",
    description: "Quality Standard Principles",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#152238] text-sm font-bold text-white">
              CL
            </div>
            <span className="text-lg font-semibold text-[#152238]">
              COA Lookup
            </span>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-slate-600">
            <a href="#">Contact Us</a>
            <a href="#">About Us</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-5xl font-bold tracking-tight text-[#152238]">
          Certificate of Analysis Lookup
        </h1>
        <p className="mt-3 text-slate-600">
          Enter the LOT number printed on your product to find its
          Certificate of Analysis.
        </p>

        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-6">
          <p className="text-xs font-semibold tracking-wide text-slate-500">
            HOW TO FIND YOUR LOT NUMBER
          </p>
          <ol className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#152238] text-xs font-semibold text-white">
                1
              </span>
              Locate your product bottle or packaging.
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#152238] text-xs font-semibold text-white">
                2
              </span>
              Find the LOT code printed on the label.
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#152238] text-xs font-semibold text-white">
                3
              </span>
              Enter it below and click Look up.
            </li>
          </ol>
        </div>

        <div className="mt-8">
          <SearchForm />
        </div>
        <p className="mt-3 text-sm text-slate-500">
          LOT numbers are not case-sensitive. Remove any spaces.
        </p>
      </main>

      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold text-[#152238]">
            Why Trust COA Lookup?
          </h2>
          <p className="mt-2 text-center text-slate-600">
            Industry-leading testing standards for accurate, reliable
            results.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {trustPoints.map((point) => (
              <div
                key={point.title}
                className="rounded-lg border border-slate-200 p-6 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-2xl">
                  {point.icon}
                </div>
                <h3 className="mt-4 font-semibold text-[#152238]">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold text-[#152238]">
            How It Works
          </h2>
          <p className="mt-2 text-center text-slate-600">
            Simple, transparent testing process from submission to results
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-600 font-semibold text-white">
                  {step.number}
                </div>
                <h3 className="mt-4 font-semibold text-[#152238]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#152238] py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 sm:flex-row sm:justify-center sm:gap-16">
          {compliance.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/10 text-xl">
                {item.icon}
              </div>
              <div>
                <p className="font-semibold text-white">{item.title}</p>
                <p className="text-sm text-slate-300">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-white py-8">
        <div className="mx-auto max-w-5xl px-6 text-center text-sm text-slate-500">
          <p>
            Results are for research purposes only. Questions? Contact our
            support team.
          </p>
          <p className="mt-2">
            Copyright © 2026 COA Lookup Testing | Powered by Science
          </p>
        </div>
      </footer>
    </div>
  );
}
