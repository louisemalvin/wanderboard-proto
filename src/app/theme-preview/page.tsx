import Link from "next/link";

const palette = [
  { name: "Forest action", value: "#2E6F40", text: "text-white" },
  { name: "Forest hover", value: "#245A34", text: "text-white" },
  { name: "Clay surface", value: "#F0DAD5", text: "text-[#1F2A22]" },
  { name: "Mist background", value: "#F7F4EF", text: "text-[#1F2A22]" },
  { name: "Panel surface", value: "#FFFDFC", text: "text-[#1F2A22]" },
  { name: "Ink", value: "#1F2A22", text: "text-white" },
  { name: "Muted", value: "#667066", text: "text-white" },
  { name: "Trail amber", value: "#C47A3D", text: "text-white" },
];

const places = [
  {
    name: "Forest ridge overlook",
    type: "Nature",
    note: "Best light before lunch, 35 min from the station.",
    tag: "Day 2",
  },
  {
    name: "Old market lane",
    type: "Food",
    note: "Keep flexible: several cafes nearby if it rains.",
    tag: "Maybe",
  },
  {
    name: "Riverside bathhouse",
    type: "Rest",
    note: "Reserve ahead, then leave the evening unscheduled.",
    tag: "Saved",
  },
];

export default function ThemePreviewPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF] text-[#1F2A22]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#667066]">
              Wanderboard theme preview
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#1F2A22]">
              Field-note calm, planner precision
            </h1>
          </div>
          <Link
            href="/planner"
            className="rounded-lg border border-[#D8CEC3] bg-[#FFFDFC] px-3 py-2 text-sm font-medium text-[#245A34] transition-colors hover:border-[#2E6F40] hover:bg-[#E7F1E8]"
          >
            Back to planner
          </Link>
        </div>

        <div className="grid flex-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-[#D8CEC3] bg-[#FFFDFC] p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Palette roles</p>
                <p className="text-xs text-[#667066]">Natural, not brochure-like.</p>
              </div>
              <span className="rounded-full bg-[#E7F1E8] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#2E6F40]">
                Draft
              </span>
            </div>
            <div className="grid gap-2">
              {palette.map((color) => (
                <div
                  key={color.value}
                  className="flex items-center gap-3 rounded-xl border border-[#E5DDD3] bg-[#F7F4EF] p-2"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-end rounded-lg p-1 text-[9px] font-semibold ${color.text}`}
                    style={{ backgroundColor: color.value }}
                  >
                    Aa
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{color.name}</p>
                    <p className="font-mono text-xs text-[#667066]">{color.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="overflow-hidden rounded-2xl border border-[#D8CEC3] bg-[#FFFDFC] shadow-sm">
            <header className="flex h-13 items-center justify-between border-b border-[#D8CEC3] bg-[#1F2A22] px-4 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2E6F40] text-sm font-semibold">
                  W
                </span>
                <div>
                  <p className="text-sm font-semibold">Kyoto slow wander</p>
                  <p className="text-xs text-[#D8CEC3]">5 days · balanced pace</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-md px-2.5 py-1 text-xs font-medium text-[#DDE8DA] hover:bg-white/10">
                  View mode
                </button>
                <button className="rounded-md bg-[#2E6F40] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#245A34]">
                  Share
                </button>
              </div>
            </header>

            <nav className="flex gap-1 overflow-x-auto border-b border-[#D8CEC3] bg-[#F7F4EF] px-3">
              {['Places', 'Day 1', 'Day 2', 'Day 3', 'All'].map((tab, index) => (
                <button
                  key={tab}
                  className={`relative px-3 py-2.5 text-sm font-medium ${
                    index === 1
                      ? "text-[#2E6F40] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#2E6F40]"
                      : "text-[#667066] hover:text-[#1F2A22]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <div className="grid min-h-[560px] lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="border-r border-[#D8CEC3] bg-[#F7F4EF] p-4">
                <label className="mb-2 block text-xs font-medium text-[#667066]">
                  Search places
                </label>
                <input
                  value="quiet gardens"
                  readOnly
                  className="w-full rounded-lg border border-[#D8CEC3] bg-[#FFFDFC] px-3 py-2 text-sm text-[#1F2A22] outline-none ring-[#2E6F40]/20 focus:border-[#2E6F40] focus:ring-2"
                />

                <div className="mt-4 space-y-2">
                  {places.map((place, index) => (
                    <article
                      key={place.name}
                      className={`rounded-xl border p-3 transition-colors ${
                        index === 0
                          ? "border-[#2E6F40]/45 bg-[#E7F1E8]"
                          : "border-[#E0D7CC] bg-[#FFFDFC]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="text-sm font-semibold">{place.name}</h2>
                          <p className="mt-1 text-xs leading-5 text-[#667066]">
                            {place.note}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#F0DAD5] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#6F493B]">
                          {place.type}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-[#667066]">
                          {place.tag}
                        </span>
                        <button className="rounded-md bg-[#2E6F40] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#245A34]">
                          Assign
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="relative isolate overflow-hidden bg-[#DDE8DA]">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(46,111,64,0.09)_1px,transparent_1px),linear-gradient(0deg,rgba(46,111,64,0.08)_1px,transparent_1px)] bg-[size:42px_42px]" />
                <div className="absolute left-[18%] top-[18%] h-36 w-56 rounded-full border border-[#2E6F40]/20 bg-[#F7F4EF]/60" />
                <div className="absolute bottom-[20%] right-[18%] h-48 w-72 rounded-full border border-[#C47A3D]/25 bg-[#F0DAD5]/45" />
                <div className="absolute left-[34%] top-[31%] h-3 w-3 rounded-full border-2 border-white bg-[#2E6F40] shadow-md shadow-[#1F2A22]/20" />
                <div className="absolute right-[34%] top-[48%] h-4 w-4 rounded-full border-2 border-white bg-[#C47A3D] shadow-md shadow-[#1F2A22]/20" />
                <div className="absolute bottom-[30%] left-[44%] h-3 w-3 rounded-full border-2 border-white bg-[#2E6F40] shadow-md shadow-[#1F2A22]/20" />

                <div className="absolute left-5 top-5 max-w-xs rounded-xl border border-[#D8CEC3] bg-[#FFFDFC]/95 p-3 shadow-sm">
                  <p className="text-xs font-semibold text-[#2E6F40]">Map surface</p>
                  <p className="mt-1 text-sm font-medium">Natural tint, low noise</p>
                  <p className="mt-1 text-xs leading-5 text-[#667066]">
                    Map color supports planning context without turning the UI into a destination poster.
                  </p>
                </div>

                <div className="absolute bottom-5 right-5 rounded-full bg-[#2E6F40] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1F2A22]/20">
                  Ask Wanderboard
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
