import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useI18n } from "../lib/i18n";
import type { RootState } from "../store";
import {
  useGetAdminReportsQuery,
  useGetAdminUsersQuery,
  useProcessAdminReportMutation,
  useUpdateAdminUserStatusMutation,
  type AdminAccountStatus,
  type AdminReportStatus,
} from "../store/api/adminApi";

type TabKey = "reports" | "users";

const reportTypeColor: Record<string, string> = {
  Spam: "border-[#f2b84b]/30 bg-[#f2b84b]/10 text-[#f2b84b]",
  Abuse: "border-[#ff4f38]/30 bg-[#ff4f38]/10 text-[#ff9c8e]",
  Copyright: "border-[#d4a847]/30 bg-[#d4a847]/10 text-[#e6bf63]",
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
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [activeTab, setActiveTab] = useState<TabKey>("reports");
  const [reportFilter, setReportFilter] = useState<AdminReportStatus | "all">("all");
  const [userFilter, setUserFilter] = useState<AdminAccountStatus | "all">("all");
  const shouldFetchAdminData = Boolean(user?.isStaff && accessToken);
  const reportsQuery = useGetAdminReportsQuery(undefined, { skip: !shouldFetchAdminData });
  const usersQuery = useGetAdminUsersQuery(undefined, { skip: !shouldFetchAdminData });
  const [processReport, { isLoading: isProcessingReport }] = useProcessAdminReportMutation();
  const [updateAccountStatus, { isLoading: isUpdatingUser }] = useUpdateAdminUserStatusMutation();

  const filteredReports = useMemo(() => {
    if (reportFilter === 'all') {
      return reports;
    }
    return reports.filter((report) => report.status === reportFilter);
  }, [reportFilter, reports]);

  const reports = reportsQuery.data ?? [];
  const users = usersQuery.data ?? [];

  const handleReportStatus = async (id: number, status: AdminReportStatus) => {
    await processReport({ id, status });
  };

  const handleContentVisibility = async (report: NonNullable<typeof reports[number]>) => {
    const hidden = !report.hidden;
    await processReport({ id: report.id, status: report.status, hidden });
  };

  const handleUserStatus = async (id: number, status: AdminAccountStatus) => {
    await updateAccountStatus({ id, status });
  };

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

  const reportFilterOptions: (AdminReportStatus | "all")[] = ["all", "pending", "approved", "rejected"];
  const userFilterOptions: (AdminAccountStatus | "all")[] = ["all", "active", "suspended", "banned"];

  return (
    <section className="min-h-[calc(100vh-85px)] bg-[#0c0c0b] px-6 py-12 text-[#f0ead0]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#d63e2a]">
            {t("admin.eyebrow")}
          </p>
          <h1 className="font-['Bebas_Neue'] text-[clamp(36px,6vw,64px)] leading-[0.92] tracking-[0.03em]">
            {t("admin.title")}
          </h1>
          <p className="mt-4 max-w-2xl font-['IBM_Plex_Serif'] text-sm italic leading-7 text-[#8a8474]">
            {t("admin.description")}
          </p>
          <p className="mt-4 border-l-2 border-[#d4a847]/60 pl-3 text-[10px] leading-5 text-[#c8c2a8]">
            {t("admin.connectedNotice")}
          </p>
        </div>

        {/* Stats overview */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label={t("admin.reportsTitle")} value={reports.length} />
          <StatCard label={t("admin.status.pending")} value={pendingCount} accent={pendingCount > 0 ? "text-[#f2b84b]" : "text-[#f0ead0]"} />
          <StatCard label={t("admin.usersTitle")} value={users.length} />
          <StatCard label={`${t("admin.status.suspended")} / ${t("admin.status.banned")}`} value={`${suspendedCount} / ${bannedCount}`} accent={suspendedCount + bannedCount > 0 ? "text-[#ff9c8e]" : "text-[#f0ead0]"} />
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
                    </div>
                    <p className="mt-3 font-['IBM_Plex_Serif'] text-sm italic leading-6 text-[#c8c2a8]">
                      {report.reason}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void handleReportStatus(report.id, "approved")}
                        disabled={report.status === "approved" || isProcessingReport}
                        className="border border-[#6bbf72]/40 px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-[#9edba2] transition hover:bg-[#6bbf72]/10 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        {t("admin.approve")}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleReportStatus(report.id, "rejected")}
                        disabled={report.status === "rejected" || isProcessingReport}
                        className="border border-[#f0ead0]/15 px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-[#c8c2a8] transition hover:border-[#f0ead0]/30 disabled:opacity-30 disabled:hover:border-[#f0ead0]/15"
                      >
                        {t("admin.reject")}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleContentVisibility(report)}
                        disabled={isProcessingReport}
                        className="border border-[#ff4f38]/40 px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-[#ff9c8e] transition hover:bg-[#ff4f38]/10"
                      >
                        {report.hidden ? t("admin.unhide") : t("admin.hide")}
                      </button>
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

            <div className="space-y-3">
              {filteredUsers.length ? (
                filteredUsers.map((managedUser) => (
                  <article key={managedUser.id} className="border border-[#f0ead0]/10 bg-[#141412] px-5 py-[18px] transition hover:border-[#f0ead0]/20">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar initials */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#f0ead0]/10 bg-[#1c1c19] text-[11px] uppercase tracking-[0.08em] text-[#8a8474]">
                          {managedUser.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[13px] font-bold tracking-[0.04em] text-[#f0ead0]">
                              {managedUser.username}
                            </h3>
                            <StatusBadge status={managedUser.status} />
                          </div>
                          <p className="mt-0.5 text-[10px] text-[#8a8474]">{managedUser.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-[9px] uppercase tracking-[0.12em] ${managedUser.reportCount > 5 ? "text-[#ff9c8e]" : "text-[#8a8474]"}`}>
                          {t("admin.reportCount").replace("{{count}}", String(managedUser.reportCount))}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {managedUser.status !== "suspended" ? (
                        <button
                          type="button"
                          onClick={() => void handleUserStatus(managedUser.id, "suspended")}
                          disabled={isUpdatingUser}
                          className="border border-[#f2b84b]/40 px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-[#f2d496] transition hover:bg-[#f2b84b]/10"
                        >
                          {t("admin.suspend")}
                        </button>
                      ) : null}
                      {managedUser.status !== "banned" ? (
                        <button
                          type="button"
                          onClick={() => void handleUserStatus(managedUser.id, "banned")}
                          disabled={isUpdatingUser}
                          className="border border-[#ff4f38]/40 px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-[#ff9c8e] transition hover:bg-[#ff4f38]/10"
                        >
                          {t("admin.ban")}
                        </button>
                      ) : null}
                      {managedUser.status !== "active" ? (
                        <button
                          type="button"
                          onClick={() => void handleUserStatus(managedUser.id, "active")}
                          disabled={isUpdatingUser}
                          className="border border-[#6bbf72]/40 px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-[#9edba2] transition hover:bg-[#6bbf72]/10"
                        >
                          {t("admin.reactivate")}
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))
              ) : (
                <p className="border border-[#f0ead0]/10 bg-[#141412] px-5 py-5 text-sm italic text-[#8a8474]">
                  No users match this filter.
                </p>
              )}
            </div>
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
}