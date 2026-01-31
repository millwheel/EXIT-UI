import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role } from '@/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { id } = await params;
  const targetId = parseInt(id, 10);
  const currentRole = session.role as Role;

  const target = await prisma.user.findUnique({
    where: { id: targetId },
  });

  if (!target) {
    return NextResponse.json({ error: '계정을 찾을 수 없습니다.' }, { status: 404 });
  }

  // Permission check
  if (currentRole === 'ADVERTISER' && target.id !== session.id) {
    return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
  }

  if (currentRole === 'AGENCY') {
    if (target.organizationId !== session.organizationId || target.role !== 'ADVERTISER') {
      if (target.id !== session.id) {
        return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
      }
    }
  }

  const body = await request.json();
  const { password, nickname, memo } = body;

  // nickname이 전달되었는데 빈 문자열이면 에러
  if (nickname !== undefined && !nickname.trim()) {
    return NextResponse.json({ error: '닉네임을 입력해주세요.' }, { status: 400 });
  }

  const data: { password?: string; nickname?: string; memo?: string } = {};

  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }
  if (nickname !== undefined) {
    data.nickname = nickname.trim();
  }
  if (memo !== undefined) {
    data.memo = memo;
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data,
    include: { organization: true },
  });

  return NextResponse.json({
    account: {
      id: updated.id,
      username: updated.username,
      nickname: updated.nickname,
      role: updated.role,
      organizationId: updated.organizationId,
      organizationName: updated.organization?.name || null,
      memo: updated.memo,
      createdAt: updated.createdAt.toISOString(),
    },
  });
}
