import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function buildQuery(sp) {
  if (!sp) return "";
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (Array.isArray(v)) v.forEach((item) => qs.append(k, item));
    else if (v !== undefined && v !== null) qs.set(k, String(v));
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export default async function RecordingStudioPyqRedirect({ searchParams }) {
  const sp = await searchParams;
  redirect(`/admin/studio/pyq${buildQuery(sp)}`);
}
