'use client';

import { useState, useEffect } from 'react';
import { Role } from '@/types';
import AccountHierarchy from '@/components/accounts/AccountHierarchy';

export default function AccountsPage() {
  const [currentRole, setCurrentRole] = useState<Role>('MASTER');

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/me');
      const meData = await meRes.json();
      if (meData.user) {
        setCurrentRole(meData.user.role as Role);
      }
    }
    init();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">계정관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          계정의 정보를 확인하고, 추가·수정·삭제 등의 관리 작업을 할 수 있습니다.
        </p>
      </div>

      <AccountHierarchy currentRole={currentRole} />
    </div>
  );
}
