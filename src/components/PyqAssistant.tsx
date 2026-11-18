// Shows the PYQ dashboard + chat (copied into public/pyq/) inside any Next.js page.
// It runs in an iframe on the same site, so its scripts and styles never clash with the app,
// and its log calls reach /api/pyq-log (set in public/pyq/pq-config.js).
//
//   import PyqAssistant from "@/components/PyqAssistant";
//   <PyqAssistant />                       // full dashboard
//   <PyqAssistant height="80vh" />
"use client";

type Props = { src?: string; height?: string; title?: string };

export default function PyqAssistant({ src = "/pyq/index.html?hideFab=1", height = "100vh", title = "UPSC Prelims PYQ analysis and chat" }: Props) {
  return (
    <iframe
      data-pyq-dashboard="true"
      src={src}
      title={title}
      loading="lazy"
      style={{ width: "100%", height, border: 0, display: "block" }}
    />
  );
}
