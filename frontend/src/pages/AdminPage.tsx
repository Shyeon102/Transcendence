import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import SectionCard from '../components/ui/SectionCard';
import StatusMessage from '../components/ui/StatusMessage';
import { useI18n } from '../lib/i18n';
import type { RootState } from '../store';
import {
  useBanAdminUserMutation,
  useGetAdminReportsQuery,
  useGetAdminUsersQuery,
  useProcessAdminReportMutation,
} from '../store/api/authApi';
import type { AdminReportStatus, AdminUser } from '../types';

type ReportFilter = AdminReportStatus | 'all';
type AdminTab = 'reports' | 'users';

const reportFilters: ReportFilter[] = ['all', 'pending', 'approved', 'rejected'];

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  if ('message' in error && typeof error.message === 'string') {
    return error.message;
  }

  const queryError = error as FetchBaseQueryError;
  if ('data' in queryError && queryError.data && typeof queryError.data === 'object') {
    const data = queryError.data as { message?: string; detail?: string };
    return data.message ?? data.detail ?? fallback;
  }

  return fallback;
};

const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

export default function AdminPage() {
  const { t } = useI18n();
  const user = useSelector((state: RootState) => state.auth.user);
  const [activeTab, setActiveTab] = useState<AdminTab>('reports');
  const [reportFilter, setReportFilter] = useState<ReportFilter>('pending');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const {
    data: reports = [],
    error: reportsError,
    isLoading: isReportsLoading,
  } = useGetAdminReportsQuery(undefined, { skip: !user?.isStaff });
  const {
    data: users = [],
    error: usersError,
    isLoading: isUsersLoading,
  } = useGetAdminUsersQuery(undefined, { skip: !user?.isStaff });
  const [processReport, { isLoading: isProcessingReport }] = useProcessAdminReportMutation();
  const [banUser, { isLoading: isBanningUser }] = useBanAdminUserMutation();

  const filteredReports = useMemo(() => {
    if (reportFilter === 'all') {
      return reports;
    }
    return reports.filter((report) => report.status === reportFilter);
  }, [reportFilter, reports]);

  const reportCounts = useMemo(
    () => ({
      all: reports.length,
      pending: reports.filter((report) => report.status === 'pending').length,
      approved: reports.filter((report) => report.status === 'approved').length,
      rejected: reports.filter((report) => report.status === 'rejected').length,
    }),
    [reports]
  );

  const activeUsers = users.filter((item) => item.isActive).length;
  const bannedUsers = users.length - activeUsers;

  if (!user?.isStaff) {
    return (
      <section className="min-h-[calc(100vh-85px)] bg-[#0c0c0b] px-6 py-16 text-[#f0ead0]">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            title={t('admin.forbiddenTitle')}
            description={t('admin.forbiddenDescription')}
          />
        </div>
      </section>
    );
  }

  const handleProcessReport = async (
    reportId: number,
    status: Exclude<AdminReportStatus, 'pending'>
  ) => {
    await processReport({ reportId, status });
  };

  const handleConfirmBan = async () => {
    if (!selectedUser) {
      return;
    }

    await banUser(selectedUser.id);
    setSelectedUser(null);
  };

  return (
    <section className="min-h-[calc(100vh-85px)] bg-[#0c0c0b] px-6 py-12 text-[#f0ead0]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#d63e2a]">
              {t('admin.eyebrow')}
            </p>
            <h1 className="mt-2 font-['Bebas_Neue'] text-5xl tracking-[0.04em]">
              {t('admin.title')}
            </h1>
          </div>
          <div className="flex gap-2">
            {(['reports', 'users'] as AdminTab[]).map((tab) => (
              <Button
                key={tab}
                size="sm"
                variant={activeTab === tab ? 'primary' : 'secondary'}
                onClick={() => setActiveTab(tab)}
              >
                {t(`admin.tabs.${tab}`)}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-8 grid gap-3 md:grid-cols-4">
          <SectionCard className="p-5">
            <p className="text-[9px] uppercase tracking-[0.16em] text-[#8a8474]">{t('admin.stats.pending')}</p>
            <p className="mt-3 text-3xl font-bold text-[#f0ead0]">{reportCounts.pending}</p>
          </SectionCard>
          <SectionCard className="p-5">
            <p className="text-[9px] uppercase tracking-[0.16em] text-[#8a8474]">{t('admin.stats.approved')}</p>
            <p className="mt-3 text-3xl font-bold text-[#f0ead0]">{reportCounts.approved}</p>
          </SectionCard>
          <SectionCard className="p-5">
            <p className="text-[9px] uppercase tracking-[0.16em] text-[#8a8474]">{t('admin.stats.activeUsers')}</p>
            <p className="mt-3 text-3xl font-bold text-[#f0ead0]">{activeUsers}</p>
          </SectionCard>
          <SectionCard className="p-5">
            <p className="text-[9px] uppercase tracking-[0.16em] text-[#8a8474]">{t('admin.stats.bannedUsers')}</p>
            <p className="mt-3 text-3xl font-bold text-[#f0ead0]">{bannedUsers}</p>
          </SectionCard>
        </div>

        {activeTab === 'reports' ? (
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-[0.12em]">
                {t('admin.reports.title')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {reportFilters.map((filter) => (
                  <Button
                    key={filter}
                    size="sm"
                    variant={reportFilter === filter ? 'primary' : 'ghost'}
                    onClick={() => setReportFilter(filter)}
                  >
                    {t(`admin.reportStatus.${filter}`)} {reportCounts[filter]}
                  </Button>
                ))}
              </div>
            </div>

            {reportsError ? (
              <StatusMessage className="mb-4">
                {getErrorMessage(reportsError, t('admin.reports.error'))}
              </StatusMessage>
            ) : null}

            {isReportsLoading ? (
              <div className="grid gap-3">
                {[0, 1, 2].map((item) => (
                  <LoadingSkeleton key={item} className="h-32" />
                ))}
              </div>
            ) : filteredReports.length ? (
              <div className="grid gap-3">
                {filteredReports.map((report) => (
                  <article
                    key={report.id}
                    className="border border-[#f0ead0]/10 bg-[#141412] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="border border-[#d4a847]/30 bg-[#d4a847]/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.12em] text-[#e6bf63]">
                            {t(`admin.reportTypes.${report.type}`)}
                          </span>
                          <span className="border border-[#f0ead0]/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.12em] text-[#8a8474]">
                            {t(`admin.targets.${report.targetType}`)} #{report.targetId}
                          </span>
                          <span className="border border-[#f0ead0]/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.12em] text-[#8a8474]">
                            {t(`admin.reportStatus.${report.status}`)}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold tracking-[0.04em]">
                          {report.targetTitle || t('admin.reports.untitledTarget')}
                        </h3>
                        {report.targetPreview ? (
                          <p className="mt-2 max-w-3xl text-xs leading-6 text-[#8a8474]">
                            {report.targetPreview}
                          </p>
                        ) : null}
                        <p className="mt-3 font-['IBM_Plex_Serif'] text-sm italic leading-6 text-[#c8c2a8]">
                          {report.reason || t('admin.reports.noReason')}
                        </p>
                        <p className="mt-3 text-[9px] uppercase tracking-[0.1em] text-[#8a8474]">
                          {t('admin.reports.reporter')}: {report.reporterUsername || report.reporterId} · {formatDate(report.createdAt)}
                        </p>
                      </div>

                      {report.status === 'pending' ? (
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={isProcessingReport}
                            onClick={() => handleProcessReport(report.id, 'approved')}
                          >
                            {t('admin.actions.approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={isProcessingReport}
                            onClick={() => handleProcessReport(report.id, 'rejected')}
                          >
                            {t('admin.actions.reject')}
                          </Button>
                        </div>
                      ) : (
                        <p className="text-[9px] uppercase tracking-[0.1em] text-[#8a8474]">
                          {report.processedBy ? `${t('admin.reports.processedBy')} ${report.processedBy}` : t('admin.reports.processed')}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title={t('admin.reports.empty')}
                description={t('admin.reports.emptyDescription')}
              />
            )}
          </div>
        ) : null}

        {activeTab === 'users' ? (
          <div>
            <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.12em]">
              {t('admin.users.title')}
            </h2>

            {usersError ? (
              <StatusMessage className="mb-4">
                {getErrorMessage(usersError, t('admin.users.error'))}
              </StatusMessage>
            ) : null}

            {isUsersLoading ? (
              <div className="grid gap-3">
                {[0, 1, 2].map((item) => (
                  <LoadingSkeleton key={item} className="h-20" />
                ))}
              </div>
            ) : users.length ? (
              <div className="overflow-x-auto border border-[#f0ead0]/10">
                <div className="min-w-[840px]">
                <div className="grid grid-cols-[72px_1.2fr_1.5fr_120px_120px_140px] bg-[#141412] px-4 py-3 text-[9px] uppercase tracking-[0.12em] text-[#8a8474]">
                  <span>ID</span>
                  <span>{t('admin.users.username')}</span>
                  <span>{t('admin.users.email')}</span>
                  <span>{t('admin.users.status')}</span>
                  <span>{t('admin.users.joined')}</span>
                  <span>{t('admin.users.actions')}</span>
                </div>
                {users.map((adminUser) => (
                  <div
                    key={adminUser.id}
                    className="grid grid-cols-[72px_1.2fr_1.5fr_120px_120px_140px] items-center border-t border-[#f0ead0]/10 px-4 py-3 text-xs text-[#c8c2a8]"
                  >
                    <span className="text-[#8a8474]">#{adminUser.id}</span>
                    <span>{adminUser.username || '-'}</span>
                    <span className="truncate">{adminUser.email || '-'}</span>
                    <span className={adminUser.isActive ? 'text-[#6bbf72]' : 'text-[#d63e2a]'}>
                      {adminUser.isActive ? t('admin.users.active') : t('admin.users.banned')}
                    </span>
                    <span className="text-[#8a8474]">{formatDate(adminUser.dateJoined)}</span>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={!adminUser.isActive || adminUser.isStaff || adminUser.id === user.id}
                      onClick={() => setSelectedUser(adminUser)}
                    >
                      {t('admin.actions.ban')}
                    </Button>
                  </div>
                ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title={t('admin.users.empty')}
                description={t('admin.users.emptyDescription')}
              />
            )}
          </div>
        ) : null}
      </div>

      {selectedUser ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c0b]/80 px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ban-user-title"
        >
          <SectionCard className="w-full max-w-sm p-6 shadow-2xl shadow-black/40">
            <p className="mb-2 text-[9px] uppercase tracking-[0.18em] text-[#d63e2a]">
              {t('admin.actions.ban')}
            </p>
            <h2
              id="ban-user-title"
              className="font-['Bebas_Neue'] text-4xl tracking-[0.04em] text-[#f0ead0]"
            >
              {t('admin.users.banTitle')}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#8a8474]">
              {t('admin.users.banDescription')} {selectedUser.username}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button
                variant="secondary"
                onClick={() => setSelectedUser(null)}
              >
                {t('admin.actions.cancel')}
              </Button>
              <Button
                variant="danger"
                disabled={isBanningUser}
                onClick={handleConfirmBan}
              >
                {t('admin.actions.confirmBan')}
              </Button>
            </div>
          </SectionCard>
        </div>
      ) : null}
    </section>
  );
}
