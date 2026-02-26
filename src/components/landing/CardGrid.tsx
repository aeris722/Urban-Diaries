import { motion } from "motion/react";
import { CloudUpload, FileText, Image as ImageIcon, NotebookPen, StickyNote } from "lucide-react";
import { Heart, Sun, MapPin } from "lucide-react";

const DASHBOARD_IMAGE =
  "https://images.unsplash.com/photo-1669702902242-8143cf653dec?q=80&w=459&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export function CardGrid() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--bg)" }} aria-label="Journal dashboard showcase">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
            style={{
              color: "var(--accent-coffee)",
              background: "rgba(181,138,96,0.1)",
              border: "1px solid rgba(181,138,96,0.2)",
            }}
          >
            Dashboard
          </span>
          <h2 className="text-4xl md:text-5xl leading-tight" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
            One quiet space for your 
            <em style={{ color: "var(--accent-mocha)", fontStyle: "italic" }}> thoughts to unfold.</em>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65 }}
          className="group relative overflow-hidden rounded-[28px]"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.8) 0%, rgba(248,240,232,0.7) 100%)",
            border: "1px solid rgba(181,138,96,0.25)",
            boxShadow: "0 22px 56px rgba(43,38,35,0.13)",
          }}
        >
          <div
            className="h-11 px-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(181,138,96,0.18)", background: "rgba(255,255,255,0.56)" }}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
            </div>
            <span className="text-xs md:text-sm" style={{ color: "var(--landing-muted)" }}>
              urban-diaries.app / dashboard
            </span>
            <span className="text-xs hidden md:inline" style={{ color: "var(--landing-muted)" }}>
              22 July
            </span>
          </div>

          <div className="grid lg:grid-cols-[220px_1fr] min-h-[460px]">
            <aside
              className="p-4 lg:p-5"
              style={{
                borderRight: "1px solid rgba(181,138,96,0.16)",
                background: "linear-gradient(180deg, rgba(248,241,233,0.9), rgba(245,236,228,0.62))",
              }}
            >
              <p className="text-xs uppercase tracking-wide mb-4" style={{ color: "var(--landing-muted)" }}>
                Workspace
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(181,138,96,0.16)", color: "var(--text)" }}>
                  <NotebookPen size={15} />
                  Diary entries
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ color: "var(--landing-muted)" }}>
                  <FileText size={15} />
                  Weekly review
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ color: "var(--landing-muted)" }}>
                  <ImageIcon size={15} />
                  Memory wall
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ color: "var(--landing-muted)" }}>
                  <StickyNote size={15} />
                  Quick notes
                </div>
              </div>
            </aside>

            <main className="p-5 md:p-7 lg:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--landing-muted)" }}>
                    Preview
                  </p>
                  <h3 className="text-xl md:text-2xl" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>
                    Thursday, 11:14 PM
                  </h3>
                </div>
                <div
                  className="px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(110,198,198,0.2)", color: "#1f6a6a" }}
                >
                  Synced 12s ago
                </div>
              </div>

              <div
                className="rounded-2xl p-5 md:p-6"
                style={{
                  background: "rgba(255,255,255,0.78)",
                  border: "1px solid rgba(181,138,96,0.16)",
                }}
              >
                <p className="text-sm mb-2" style={{ color: "var(--landing-muted)" }}>
                  Dear Diary,
                </p>
                <p className="text-base md:text-lg leading-relaxed mb-5" style={{ color: "var(--text)" }}>
                Therapy days always leave my mind louder than before. I keep replaying conversations, wondering if people notice how uncomfortable I feel in groups. Somehow, talking feels harder than silence. Still, today didn’t feel entirely heavy — maybe progress isn’t obvious, just quietly happening somewhere inside me.
                </p>

                <div className="grid md:grid-cols-[180px_1fr] gap-4 items-start">
                  <img
                    src={DASHBOARD_IMAGE}
                    alt="Warm desk setup with notebook and coffee"
                    className="w-full h-36 md:h-40 object-cover rounded-xl"
                    loading="lazy"
                  />
                  <div
                    className="rounded-xl p-4"
                    style={{ background: "rgba(248,241,233,0.9)", border: "1px solid rgba(181,138,96,0.14)" }}
                  >
                  <p
                    className="text-sm font-semibold mb-2"
                    style={{ color: "var(--text)" }}
                  >
                    Today’s Snapshot
                  </p>

                  <ul
                    className="text-sm space-y-1.5"
                    style={{ color: "var(--landing-muted)" }}
                  >
                    <li className="flex items-center gap-2">
                      <Heart size={16} /> Mood: Nervous but curious
                    </li>

                    <li className="flex items-center gap-2">
                      <Sun size={16} /> Weather: Humid Mumbai evening, golden sunset
                    </li>

                    <li className="flex items-center gap-2">
                      <MapPin size={16} /> Location: College campus, Mumbai
                    </li>
                  </ul>
                  </div>
                </div>
              </div>
            </main>
          </div>

          <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-5">
            <div
              className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md"
              style={{
                background: "linear-gradient(120deg, rgba(110,198,198,0.26), rgba(110,198,198,0.12))",
                color: "#1d6060",
                border: "1px solid rgba(110,198,198,0.38)",
              }}
            >
              <CloudUpload size={14} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
