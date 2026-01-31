import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@/types';
import Sidebar from '@/components/layout/Sidebar';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { nickname: true },
  });

  const displayName = user?.nickname || '';

  return (
    <div className="min-h-screen">
      <Sidebar
        role={session.role as Role}
        displayName={displayName}
      />
      <main className="ml-[240px] mt-0 p-6">
        {children}
      </main>
    </div>
  );
}
