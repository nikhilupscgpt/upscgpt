import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import BrandingSettingsClient from './BrandingSettingsClient';
import { DEFAULT_BRANDING } from '@/app/api/admin/studio/branding/route';

export const dynamic = 'force-dynamic';

export default async function BrandingSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/admin/studio');
  }

  const row = await prisma.brandingSettings.findUnique({ where: { id: 'default' } }).catch(() => null);
  const initialBranding = row
    ? {
        ...DEFAULT_BRANDING,
        ...row,
        updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
      }
    : DEFAULT_BRANDING;

  return <BrandingSettingsClient initialBranding={initialBranding} />;
}
