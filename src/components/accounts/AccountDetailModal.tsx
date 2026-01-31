'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: number | null;
}

interface AccountDetail {
  id: number;
  username: string;
  nickname: string | null;
  memo: string | null;
}

export default function AccountDetailModal({ isOpen, onClose, accountId }: AccountDetailModalProps) {
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && accountId) {
      setLoading(true);
      fetch(`/api/accounts/${accountId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.account) {
            setAccount(data.account);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setAccount(null);
    }
  }, [isOpen, accountId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="계정 상세"
      footer={<Button onClick={onClose}>닫기</Button>}
    >
      {loading ? (
        <div className="text-center py-4 text-gray-500">로딩 중...</div>
      ) : account ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">아이디</label>
            <p className="text-gray-900">{account.username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">닉네임</label>
            <p className="text-gray-900">{account.nickname || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">메모</label>
            <p className="text-gray-900 whitespace-pre-wrap">{account.memo || '-'}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">계정 정보를 불러올 수 없습니다.</div>
      )}
    </Modal>
  );
}
