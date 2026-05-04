import { redirect } from 'next/navigation';

export default async function ContentPortalPage({ searchParams }) {
  const { q, subject } = await searchParams;
  
  // Construct the new URL for the consolidated issues dashboard
  let targetUrl = '/issues';
  const params = new URLSearchParams();
  if (q) params.set('search', q);
  if (subject) params.set('domain', subject); // Assuming domain is roughly subject in the new hub
  
  const queryString = params.toString();
  if (queryString) targetUrl += `?${queryString}`;

  redirect(targetUrl);
}
