import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  // MASTER만 다른 총판 목록 조회 가능
  if (session.role !== 'MASTER') {
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  }

  const masters = await prisma.user.findMany({
    where: { role: 'MASTER' },
    select: {
      id: true,
      username: true,
      nickname: true,
      createdAt: true,
      _count: {
        select: { managedOrganizations: true },
      },
    },
    orderBy: { id: 'asc' },
  });

  return NextResponse.json({
    masters: masters.map((m) => ({
      id: m.id,
      username: m.username,
      nickname: m.nickname,
      createdAt: m.createdAt.toISOString(),
      organizationCount: m._count.managedOrganizations,
    })),
  });
}
