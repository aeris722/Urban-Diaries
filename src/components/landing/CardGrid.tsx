import { motion } from "motion/react";
import { CloudUpload, FileText, Image as ImageIcon, NotebookPen, StickyNote } from "lucide-react";
import { Heart, CloudRain, MapPin } from "lucide-react";

const DASHBOARD_IMAGE =
  "https://images.unsplash.com/photo-1669702902242-8143cf653dec?q=80&w=459&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export function CardGrid() {
  return (
    <section className="py-16 md:py-24 px-6 relative overflow-hidden" style={{ background: "var(--bg)", contentVisibility: "auto", containIntrinsicSize: "1px 820px" }} aria-label="Journal dashboard showcase">
      <div className="ui-ambient-orb w-[260px] h-[260px] top-12 -left-14" style={{ background: "rgba(208,170,118,0.16)" }} />
      <div className="ui-ambient-orb w-[220px] h-[220px] bottom-16 -right-10" style={{ background: "rgba(181,138,96,0.2)", animationDelay: "0.8s" }} />
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
          className="group relative overflow-hidden rounded-[28px] transition-transform duration-300 hover:-translate-y-1 glass-pop ui-pop ui-soft-light"
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
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
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
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg ui-pop" style={{ background: "rgba(181,138,96,0.16)", color: "var(--text)" }}>
                  <NotebookPen size={15} style={{ color: "var(--accent-coffee)" }} />
                  Diary entries
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg ui-pop" style={{ color: "var(--landing-muted)" }}>
                  <FileText size={15} style={{ color: "#c29a69" }} />
                  Weekly review
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg ui-pop" style={{ color: "var(--landing-muted)" }}>
                  <ImageIcon size={15} style={{ color: "#b07d53" }} />
                  Memory wall
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg ui-pop" style={{ color: "var(--landing-muted)" }}>
                  <StickyNote size={15} style={{ color: "#8f6242" }} />
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
                <div className="px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-2" style={{ background: "rgba(208,170,118,0.2)", color: "#7a5a3a" }}>
                  <span className="sync-dot" />
                  Syncing
                </div>
              </div>

              <div
                className="rounded-2xl p-5 md:p-6"
                style={{
                  background: "rgba(255,255,255,0.78)",
                  border: "1px solid rgba(181,138,96,0.16)",
                }}
              >
                <p
                  className="text-lg md:text-xl leading-relaxed mb-5"
                  style={{ color: "var(--text)", fontFamily: "var(--font-display)", fontWeight: 400 }}
                >
                  Therapy today made me notice how much I overthink even small conversations. Group presentations still terrify me, but Aman waited after class and somehow made everything feel lighter. Maybe progress is not loud, maybe it is just walking through Mumbai feeling a little less alone than yesterday...
                </p>

                <div className="grid md:grid-cols-[1fr_180px] gap-4 items-start">
                  <div className="rounded-xl p-4" style={{ background: "rgba(248,241,233,0.9)", border: "1px solid rgba(181,138,96,0.14)" }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>
                      Overview
                    </p>

                    <ul className="text-sm space-y-1.5" style={{ color: "var(--landing-muted)" }}>
                      <li className="flex items-center gap-2">
                        <Heart size={16} style={{ color: "#bb6d6f" }} /> Quietly Healing
                      </li>

                      <li className="flex items-center gap-2">
                        <CloudRain size={16} style={{ color: "#b99667" }} /> Calm rainy evening
                      </li>

                      <li className="flex items-center gap-2">
                        <MapPin size={16} style={{ color: "#8f6242" }} /> College campus, Mumbai
                      </li>
                    </ul>
                  </div>
                  <img
                    src={DASHBOARD_IMAGE}
                    alt="Warm desk setup with notebook and coffee"
                    className="w-full h-32 md:h-36 object-cover rounded-xl opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
              </div>
            </main>
          </div>

          <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-5">
            <div
              className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md"
              style={{
                background: "linear-gradient(120deg, rgba(208,170,118,0.24), rgba(208,170,118,0.1))",
                color: "#6f4f31",
                border: "1px solid rgba(208,170,118,0.34)",
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
