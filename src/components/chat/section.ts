// Which section of the single-page site is the visitor looking at?
// Sent with each chat message so answers can be context-aware.
const SECTIONS = ["services", "process", "about", "founders", "faq", "contact"] as const;

export function detectSection(): string {
  if (typeof window === "undefined") return "top";
  const probe = window.innerHeight * 0.4;
  let current = "top";
  for (const id of SECTIONS) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= probe) current = id;
  }
  return current;
}
