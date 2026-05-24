import React from 'react';
import MockTestPortal from '@/components/MockTestPortal';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';

export default async function MockTestPage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login?callbackUrl=/prelims/' + id);
  }

  const testPack = await prisma.testPack.findUnique({
    where: { id: id },
    include: {
      questions: {
        select: {
          id: true,
          text: true,
          options: true,
          difficulty: true,
        }
      }
    }
  });

  if (!testPack) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">404</h1>
          <p className="text-slate-400">Mock Test Not Found</p>
        </div>
      </div>
    );
  }

  return (
    <MockTestPortal 
      testPack={JSON.parse(JSON.stringify(testPack))} 
      userId={session.user.id} 
    />
  );
}
