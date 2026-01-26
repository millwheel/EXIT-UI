'use client';

import { useState } from 'react';
import { AdStatsGroup } from '@/types';

interface AdStatusCardsProps {
  stats: AdStatsGroup;
  selectedFilter: { kind: string | null; status: string | null } | null;
  onFilterChange: (filter: { kind: string | null; status: string | null } | null) => void;
}

interface StatItem {
  label: string;
  value: number;
  kind: string | null;
  status: string | null;
}

type TabType = 'all' | 'paid' | 'test';

const TABS: { key: TabType; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'paid', label: '광고' },
  { key: 'test', label: '테스트' },
];

export default function AdStatusCards({ stats, selectedFilter, onFilterChange }: AdStatusCardsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  function handleSelect(item: StatItem) {
    if (
      selectedFilter &&
      selectedFilter.kind === item.kind &&
      selectedFilter.status === item.status
    ) {
      onFilterChange(null);
      return;
    }
    onFilterChange({ kind: item.kind, status: item.status });
  }

  function handleTabChange(tab: TabType) {
    setActiveTab(tab);
    // 탭 전환 시 해당 탭의 "전체" 자동 선택
    const kind = tab === 'all' ? null : tab === 'paid' ? 'PAID' : 'TEST';
    onFilterChange({ kind, status: null });
  }

  function getItemsForTab(tab: TabType): StatItem[] {
    const statData = stats[tab];
    const kind = tab === 'all' ? null : tab === 'paid' ? 'PAID' : 'TEST';

    return [
      { label: '전체', value: statData.total, kind, status: null },
      { label: '정상', value: statData.active, kind, status: 'ACTIVE' },
      { label: '오류', value: statData.error, kind, status: 'ERROR' },
      { label: '대기', value: statData.waiting, kind, status: 'WAITING' },
      { label: '종료예정', value: statData.endingSoon, kind, status: 'ENDING_SOON' },
      { label: '종료', value: statData.ended, kind, status: 'ENDED' },
    ];
  }

  const currentItems = getItemsForTab(activeTab);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* 탭 헤더 */}
      <div className="flex border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.key
                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-gray-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 상태 항목들 */}
      <div className="flex divide-x divide-gray-100">
        {currentItems.map((item) => {
          const isSelected =
            selectedFilter !== null &&
            selectedFilter.kind === item.kind &&
            selectedFilter.status === item.status;
          return (
            <button
              key={`${item.kind}-${item.status}-${item.label}`}
              onClick={() => handleSelect(item)}
              className="flex-1 py-5 flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <span
                className={`text-2xl font-bold ${
                  isSelected ? 'text-[var(--primary-light)]' : 'text-gray-900'
                }`}
              >
                {item.value}
              </span>
              <span
                className={`text-xs ${
                  isSelected ? 'text-[var(--primary-light)]' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
