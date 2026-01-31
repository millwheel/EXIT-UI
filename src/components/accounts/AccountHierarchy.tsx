'use client';

import { useState, useEffect } from 'react';
import { Role } from '@/types';
import Button from '@/components/ui/Button';
import AccountCreateModal from './AccountCreateModal';
import AccountEditModal from './AccountEditModal';

interface Master {
  id: number;
  username: string;
  nickname: string | null;
  organizationCount: number;
}

interface UserInfo {
  id: number;
  nickname: string | null;
  username: string;
  memo: string | null;
  role: string;
}

interface Organization {
  id: number;
  name: string;
  agencies: UserInfo[];
  advertisers: UserInfo[];
}

interface HierarchyData {
  masters?: Master[];
  organizations?: Organization[];
  organization?: Organization & { master?: { id: number; nickname: string | null } };
}

interface AccountHierarchyProps {
  currentRole: Role;
}

// 톱니바퀴 아이콘 컴포넌트
function GearIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function AccountHierarchy({ currentRole }: AccountHierarchyProps) {
  const [data, setData] = useState<HierarchyData>({});
  const [selectedMasterId, setSelectedMasterId] = useState<number | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editAccountId, setEditAccountId] = useState<number | null>(null);

  async function fetchHierarchy(masterId?: number, orgId?: number) {
    setLoading(true);
    const params = new URLSearchParams();
    if (masterId) params.set('masterId', masterId.toString());
    if (orgId) params.set('organizationId', orgId.toString());

    const res = await fetch(`/api/accounts/hierarchy?${params.toString()}`);
    if (res.ok) {
      const newData = await res.json();
      setData(newData);

      // MASTER가 처음 로드 시 첫 번째 총판 자동 선택
      if (currentRole === 'MASTER' && !masterId && newData.masters?.length > 0) {
        const firstMaster = newData.masters[0];
        setSelectedMasterId(firstMaster.id);
        fetchHierarchy(firstMaster.id);
        return;
      }
    }
    setLoading(false);
  }

  // 초기 데이터 로드
  useEffect(() => {
    fetchHierarchy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMasterSelect(masterId: number) {
    setSelectedMasterId(masterId);
    setSelectedOrgId(null);
    fetchHierarchy(masterId);
  }

  function handleOrgSelect(orgId: number) {
    setSelectedOrgId(orgId);
  }

  function handleCreateSuccess() {
    // 데이터 새로고침
    if (currentRole === 'MASTER') {
      fetchHierarchy(selectedMasterId || undefined);
    } else {
      fetchHierarchy();
    }
  }

  function handleEditSuccess() {
    // 데이터 새로고침
    if (currentRole === 'MASTER') {
      fetchHierarchy(selectedMasterId || undefined);
    } else {
      fetchHierarchy();
    }
  }

  // 선택된 조직 정보
  const selectedOrg = data.organizations?.find((o) => o.id === selectedOrgId) || data.organization;

  // 등록 버튼 표시 여부 (광고주는 숨김)
  const canCreate = currentRole !== 'ADVERTISER';

  // 역할 표시 컴포넌트
  function RoleBadge({ role }: { role: string }) {
    if (role === 'AGENCY') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
          대행사
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
        광고주
      </span>
    );
  }

  // 계정 테이블 컴포넌트
  function AccountTable({ accounts, showActions }: { accounts: UserInfo[]; showActions: boolean }) {
    if (accounts.length === 0) {
      return (
        <tr>
          <td colSpan={showActions ? 5 : 4} className="px-3 py-8 text-center text-gray-400">
            등록된 계정이 없습니다.
          </td>
        </tr>
      );
    }

    return (
      <>
        {accounts.map((account) => (
          <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="px-3 py-3">
              <RoleBadge role={account.role} />
            </td>
            <td className="px-3 py-3 text-gray-900">{account.nickname || '-'}</td>
            <td className="px-3 py-3 text-gray-600">{account.username}</td>
            <td className="px-3 py-3 text-gray-500">{account.memo || '-'}</td>
            {showActions && (
              <td className="px-3 py-3 text-center">
                <button
                  onClick={() => setEditAccountId(account.id)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <GearIcon />
                </button>
              </td>
            )}
          </tr>
        ))}
      </>
    );
  }

  // AGENCY/ADVERTISER는 바로 organization 데이터 표시
  if (currentRole !== 'MASTER') {
    // AGENCY는 수정 가능, ADVERTISER는 수정 불가
    const showActions = currentRole === 'AGENCY';

    return (
      <>
        {/* 등록 버튼 */}
        {canCreate && (
          <div className="flex justify-end mb-3">
            <Button onClick={() => setIsCreateModalOpen(true)}>등록</Button>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* 탭 헤더 */}
          <div className="flex border-b border-gray-200">
            {/* 총판 탭 */}
            <div className="w-48 py-3 px-4 text-sm font-medium text-center border-r border-gray-200 bg-gray-50 text-gray-500">
              총판
            </div>
            {/* 조직 탭 */}
            <div className="w-56 py-3 px-4 text-sm font-medium text-center border-r border-gray-200 bg-gray-50 text-gray-500">
              대행사 조직
            </div>
            {/* 계정 목록 탭 */}
            <div className="flex-1 py-3 px-4 text-sm font-medium text-center bg-gray-50 text-gray-500">
              계정 목록
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="flex min-h-[500px]">
            {/* 총판 */}
            <div className="w-48 border-r border-gray-200">
              {loading ? (
                <div className="p-4 text-center text-gray-400 text-sm">로딩 중...</div>
              ) : data.organization?.master ? (
                <div className="px-3 py-3 min-h-[52px] text-sm text-[var(--primary)] font-medium border-b-2 border-[var(--primary)]">
                  <div>{data.organization.master.nickname || '총판'}</div>
                  {/* AGENCY, ADVERTISER 모두 조직 개수 숨김 - 높이 유지용 빈 공간 */}
                  <div className="text-xs mt-0.5 invisible">-</div>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-400 text-sm">총판 정보 없음</div>
              )}
            </div>

            {/* 조직 */}
            <div className="w-56 border-r border-gray-200">
              {loading ? (
                <div className="p-4 text-center text-gray-400 text-sm">로딩 중...</div>
              ) : data.organization ? (
                <div className="px-3 py-3 min-h-[52px] text-sm text-[var(--primary)] font-medium border-b-2 border-[var(--primary)]">
                  <div>{data.organization.name}</div>
                  {/* ADVERTISER는 대행사/광고주 개수 숨김 */}
                  {currentRole === 'AGENCY' ? (
                    <div className="text-xs text-gray-400 mt-0.5 font-normal">
                      대행사 {data.organization.agencies.length} · 광고주 {data.organization.advertisers.length}
                    </div>
                  ) : (
                    <div className="text-xs mt-0.5 invisible">-</div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-400 text-sm">소속 조직 없음</div>
              )}
            </div>

            {/* 계정 테이블 */}
            <div className="flex-1 overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  로딩 중...
                </div>
              ) : data.organization ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-3 py-3 text-left font-medium text-gray-600">역할</th>
                      <th className="px-3 py-3 text-left font-medium text-gray-600">닉네임</th>
                      <th className="px-3 py-3 text-left font-medium text-gray-600">아이디</th>
                      <th className="px-3 py-3 text-left font-medium text-gray-600">메모</th>
                      {showActions && (
                        <th className="w-14 px-3 py-3 text-center font-medium text-gray-600">관리</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    <AccountTable
                      accounts={[...data.organization.agencies, ...data.organization.advertisers]}
                      showActions={showActions}
                    />
                  </tbody>
                </table>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  소속 조직이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 모달들 */}
        <AccountCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
          currentRole={currentRole}
        />
        <AccountEditModal
          isOpen={editAccountId !== null}
          onClose={() => setEditAccountId(null)}
          onSuccess={handleEditSuccess}
          accountId={editAccountId}
          currentRole={currentRole}
        />
      </>
    );
  }

  // MASTER용 UI
  return (
    <>
      {/* 등록 버튼 */}
      <div className="flex justify-end mb-3">
        <Button onClick={() => setIsCreateModalOpen(true)}>등록</Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* 탭 헤더 */}
        <div className="flex border-b border-gray-200">
          {/* 총판 탭 */}
          <div className="w-48 py-3 px-4 text-sm font-medium text-center border-r border-gray-200 bg-gray-50 text-gray-500">
            총판
          </div>
          {/* 조직 탭 */}
          <div className="w-56 py-3 px-4 text-sm font-medium text-center border-r border-gray-200 bg-gray-50 text-gray-500">
            대행사 조직
          </div>
          {/* 계정 목록 탭 */}
          <div className="flex-1 py-3 px-4 text-sm font-medium text-center bg-gray-50 text-gray-500">
            계정 목록
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex min-h-[500px]">
          {/* 총판 목록 */}
          <div className="w-48 border-r border-gray-200 overflow-y-auto">
            {loading && !data.masters ? (
              <div className="p-4 text-center text-gray-400 text-sm">로딩 중...</div>
            ) : (
              data.masters?.map((master) => (
                <div
                  key={master.id}
                  className={`flex items-center justify-between px-3 py-3 transition-colors ${
                    selectedMasterId === master.id
                      ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                      : 'text-gray-600 hover:bg-gray-50 border-b border-gray-100'
                  }`}
                >
                  <button
                    onClick={() => handleMasterSelect(master.id)}
                    className="flex-1 text-left cursor-pointer"
                  >
                    <div className={`text-sm ${selectedMasterId === master.id ? 'font-medium' : ''}`}>
                      {master.nickname || master.username}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      조직 {master.organizationCount}
                    </div>
                  </button>
                  <button
                    onClick={() => setEditAccountId(master.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <GearIcon />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* 조직 목록 */}
          <div className="w-56 border-r border-gray-200 overflow-y-auto">
            {!selectedMasterId ? (
              <div className="p-4 text-center text-gray-400 text-sm">총판을 선택하세요.</div>
            ) : loading ? (
              <div className="p-4 text-center text-gray-400 text-sm">로딩 중...</div>
            ) : data.organizations?.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">등록된 대행사 조직이 없습니다.</div>
            ) : (
              data.organizations?.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleOrgSelect(org.id)}
                  className={`w-full px-3 py-3 text-left transition-colors cursor-pointer ${
                    selectedOrgId === org.id
                      ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                      : 'text-gray-600 hover:bg-gray-50 border-b border-gray-100'
                  }`}
                >
                  <div className={`text-sm ${selectedOrgId === org.id ? 'font-medium' : ''}`}>{org.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    대행사 {org.agencies.length} · 광고주 {org.advertisers.length}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* 계정 테이블 */}
          <div className="flex-1 overflow-x-auto">
            {!selectedOrgId ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                조직을 선택하세요.
              </div>
            ) : !selectedOrg ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                로딩 중...
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-3 py-3 text-left font-medium text-gray-600">역할</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-600">닉네임</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-600">아이디</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-600">메모</th>
                    <th className="w-14 px-3 py-3 text-center font-medium text-gray-600">관리</th>
                  </tr>
                </thead>
                <tbody>
                  <AccountTable
                    accounts={[...selectedOrg.agencies, ...selectedOrg.advertisers]}
                    showActions={true}
                  />
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <AccountCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        currentRole={currentRole}
      />
      <AccountEditModal
        isOpen={editAccountId !== null}
        onClose={() => setEditAccountId(null)}
        onSuccess={handleEditSuccess}
        accountId={editAccountId}
        currentRole={currentRole}
      />
    </>
  );
}
