import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role } from '@/types';
import { validatePassword } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { id } = await params;
  const targetId = parseInt(id, 10);

  const user = await prisma.user.findUnique({
    where: { id: targetId },
    select: {
      id: true,
      username: true,
      nickname: true,
      memo: true,
      role: true,
      organizationId: true,
      _count: {
        select: { managedOrganizations: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: '계정을 찾을 수 없습니다.' }, { status: 404 });
  }

  // 권한 체크: 같은 조직이거나 MASTER만 조회 가능
  const currentRole = session.role as Role;
  if (currentRole === 'ADVERTISER') {
    // ADVERTISER는 같은 조직의 AGENCY 또는 자기 자신만 조회 가능
    if (user.id !== session.id &&
        !(user.organizationId === session.organizationId && user.role === 'AGENCY')) {
      return NextResponse.json({ error: '조회 권한이 없습니다.' }, { status: 403 });
    }
  } else if (currentRole === 'AGENCY') {
    // AGENCY는 같은 조직의 계정만 조회 가능
    if (user.organizationId !== session.organizationId) {
      return NextResponse.json({ error: '조회 권한이 없습니다.' }, { status: 403 });
    }
  }
  // MASTER는 모든 계정 조회 가능

  return NextResponse.json({
    account: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      memo: user.memo,
      role: user.role,
      organizationCount: user._count.managedOrganizations,
    },
  });
}

export async function PUT(
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

  // 권한 체크
  if (currentRole === 'ADVERTISER') {
    return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
  }

  if (currentRole === 'AGENCY') {
    // AGENCY는 같은 조직의 ADVERTISER만 수정 가능
    if (target.organizationId !== session.organizationId || target.role !== 'ADVERTISER') {
      return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
    }
  }
  // MASTER는 모든 계정 수정 가능

  const body = await request.json();
  const { password, nickname, memo } = body;

  const data: { password?: string; nickname?: string; memo?: string | null } = {};

  if (password) {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
    }
    data.password = await bcrypt.hash(password, 10);
  }
  if (nickname !== undefined) {
    data.nickname = nickname.trim() || null;
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // PUT과 동일하게 처리
  return PUT(request, { params });
}

export async function DELETE(
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
    include: {
      _count: {
        select: { managedOrganizations: true },
      },
    },
  });

  if (!target) {
    return NextResponse.json({ error: '계정을 찾을 수 없습니다.' }, { status: 404 });
  }

  // 권한 체크
  if (currentRole === 'ADVERTISER') {
    return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
  }

  if (currentRole === 'AGENCY') {
    // AGENCY는 같은 조직의 ADVERTISER만 삭제 가능
    if (target.organizationId !== session.organizationId || target.role !== 'ADVERTISER') {
      return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
    }
  }

  // 총판 삭제 로직
  if (target.role === 'MASTER') {
    // 관리하는 조직이 있으면 삭제 불가
    if (target._count.managedOrganizations > 0) {
      return NextResponse.json(
        { error: '관리하고 있는 조직이 있는 총판은 삭제할 수 없습니다.' },
        { status: 409 }
      );
    }

    // 조직이 없으면 바로 삭제
    await prisma.user.delete({ where: { id: targetId } });
    return NextResponse.json({ success: true });
  }

  // 광고주 삭제 로직
  if (target.role === 'ADVERTISER') {
    // 연결된 광고 모두 삭제
    await prisma.ad.deleteMany({ where: { advertiserId: targetId } });
    // 사용자 삭제
    await prisma.user.delete({ where: { id: targetId } });
    return NextResponse.json({ success: true });
  }

  // 대행사 삭제 로직
  if (target.role === 'AGENCY') {
    const organizationId = target.organizationId;

    if (!organizationId) {
      // 조직 없는 대행사는 바로 삭제
      await prisma.user.delete({ where: { id: targetId } });
      return NextResponse.json({ success: true });
    }

    // 조직 내 남은 대행사 수 확인
    const remainingAgencies = await prisma.user.count({
      where: {
        organizationId,
        role: 'AGENCY',
        id: { not: targetId },
      },
    });

    if (remainingAgencies === 0) {
      // 남은 대행사가 없으면 조직 전체 삭제
      // 1. 조직의 모든 광고 삭제
      await prisma.ad.deleteMany({ where: { organizationId } });
      // 2. 조직의 모든 광고주 삭제
      await prisma.user.deleteMany({
        where: { organizationId, role: 'ADVERTISER' },
      });
      // 3. 대행사 삭제
      await prisma.user.delete({ where: { id: targetId } });
      // 4. 조직 삭제
      await prisma.organization.delete({ where: { id: organizationId } });
    } else {
      // 남은 대행사가 있으면 해당 대행사만 삭제
      await prisma.user.delete({ where: { id: targetId } });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: '알 수 없는 역할입니다.' }, { status: 400 });
}
