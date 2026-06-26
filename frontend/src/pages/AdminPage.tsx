import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useI18n } from "../lib/i18n";
import type { RootState } from "../store";
import {
  useBanAdminUserMutation,
  useGetAdminReportsQuery,
  useGetAdminUsersQuery,
  useProcessAdminReportMutation,
  useUnbanAdminUserMutation,
  type AdminAccountStatus,
  type AdminReportStatus,
} from "../store/api/adminApi";

type TabKey = "reports" | "users";

const reportTypeColor: Record<string, string> = {
  Spam: "border-[#f2b84b]/30 bg-[#f2b84b]/10 text-[#f2b84b]",
  spam: "border-[#f2b84b]/30 bg-[#f2b84b]/10 text-[#f2b84b]",
  Abuse: "border-[#ff4f38]/30 bg-[#ff4f38]/10 text-[#ff9c8e]",
  abuse: "border-[#ff4f38]/30 bg-[#ff4f38]/10 text-[#ff9c8e]",
  Copyright: "border-[#d4a847]/30 bg-[#d4a847]/10 text-[#e6bf63]",
  copyright: "border-[#d4a847]/30 bg-[#d4a847]/10 text-[#e6bf63]",
  nsfw: "border-[#d63e2a]/30 bg-[#d63e2a]/10 text-[#ff9c8e]",
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "border-[#f2b84b]/40 bg-[#f2b84b]/10 text-[#f2d496]",
    approved: "border-[#6bbf72]/40 bg-[#6bbf72]/10 text-[#9edba2]",
    rejected: "border-[#f0ead0]/15 bg-[#f0ead0]/5 text-[#8a8474]",
    active: "border-[#6bbf72]/40 bg-[#6bbf72]/10 text-[#9edba2]",
    banned: "border-[#ff4f38]/40 bg-[#ff4f38]/10 text-[#ff9c8e]",
  };
  const { t } = useI18n();
  return (
    <span className={`inline-block border px-2.5 py-1 text-[8px] uppercase tracking-[0.14em] ${colors[status] ?? "text-[#8a8474]"}`}>
      {t(`admin.status.${status}`)}
    </span>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="border border-[#f0ead0]/10 bg-[#141412] px-5 py-4">
      <p className="text-[9px] uppercase tracking-[0.14em] text-[#8a8474]">{label}</p>
      <p className={`mt-1 font-['Bebas_Neue'] text-3xl tracking-[0.04em] ${accent ?? "text-[#f0ead0]"}`}>{value}</p>
    </div>
  );
}

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
  const [banUser, { isLoading: isBanningUser }] = useBanAdminUserMutation();
  const [unbanUser, { isLoading: isUnbanningUser }] = useUnbanAdminUserMutation();

  if (!user?.isStaff) {
    return <Navigate to="/home" replace />;
  }

  const reports = reportsQuery.data ?? [];
  const users = usersQuery.data ?? [];

  const handleReportStatus = async (id: number, status: AdminReportStatus) => {
    if (status === "pending") {
      return;
    }

    await processReport({ id, status });
  };

  const handleUserStatus = async (id: number, status: AdminAccountStatus) => {
    if (status === "banned") {
      await banUser(id);
      return;
    }

    await unbanUser(id);
  };

  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const bannedCount = users.filter((u) => u.status === "banned").length;

  const filteredReports = reportFilter === "all" ? reports : reports.filter((r) => r.status === reportFilter);
  const filteredUsers = userFilter === "all" ? users : users.filter((u) => u.status === userFilter);

  const reportFilterOptions: (AdminReportStatus | "all")[] = ["all", "pending", "approved", "rejected"];
  const userFilterOptions: (AdminAccountStatus | "all")[] = ["all", "active", "banned"];
  const isUpdatingUser = isBanningUser || isUnbanningUser;

  return (
    <section className="min-h-[calc(100vh-85px)] bg-[#0c0c0b] px-6 py-14 text-[#f0ead0]">
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
          <StatCard label={t("admin.status.banned")} value={bannedCount} accent={bannedCount > 0 ? "text-[#ff9c8e]" : "text-[#f0ead0]"} />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-[#f0ead0]/10">
          {([
            ["reports", t("admin.reportsTitle"), String(reports.length)],
            ["users", t("admin.usersTitle"), String(users.length)],
          ] as const).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`relative -bottom-px shrink-0 border-b-2 px-5 py-3 text-[10px] uppercase tracking-[0.12em] transition ${
                activeTab === key ? "border-[#d63e2a] text-[#f0ead0]" : "border-transparent text-[#8a8474] hover:text-[#c8c2a8]"
              }`}
            >
              {label} <span className={activeTab === key ? "text-[#d63e2a]" : "text-[#8a8474]"}>{count}</span>
            </button>
          ))}
        </div>

        {/* Reports tab */}
        {activeTab === "reports" ? (
          <div>
            {/* Report filters */}
            <div className="mb-5 flex flex-wrap gap-2">
              {reportFilterOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setReportFilter(option)}
                  className={`border px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] transition ${
                    reportFilter === option
                      ? "border-[#d63e2a]/60 bg-[#d63e2a]/10 text-[#f0ead0]"
                      : "border-[#f0ead0]/10 text-[#8a8474] hover:border-[#f0ead0]/25 hover:text-[#c8c2a8]"
                  }`}
                >
                  {option === "all" ? "All" : t(`admin.status.${option}`)}
                </button>
              ))}
            </div>

            {reportsQuery.isLoading ? (
              <p className="border border-[#f0ead0]/10 bg-[#141412] px-5 py-5 text-sm italic text-[#8a8474]">
                {t("admin.loading")}
              </p>
            ) : null}

            {reportsQuery.isError ? (
              <p className="mb-3 border border-[#ff4f38]/30 bg-[#ff4f38]/10 px-5 py-4 text-sm text-[#ff9c8e]">
                {t("admin.reportsLoadError")}
              </p>
            ) : null}

            <div className="space-y-3">
              {reportsQuery.isLoading ? null : filteredReports.length ? (
                filteredReports.map((report) => (
                  <article key={report.id} className="border border-[#f0ead0]/10 bg-[#141412] px-5 py-[18px] transition hover:border-[#f0ead0]/20">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-block border px-2 py-0.5 text-[8px] uppercase tracking-[0.14em] ${reportTypeColor[report.type] ?? "border-[#f0ead0]/10 text-[#8a8474]"}`}>
                            {report.type}
                          </span>
                          <StatusBadge status={report.status} />
                        </div>
                        <h3 className="mt-2.5 text-[13px] font-bold leading-6 tracking-[0.04em] text-[#f0ead0]">
                          {report.target}
                        </h3>
                        <p className="mt-0.5 text-[9px] uppercase tracking-[0.1em] text-[#8a8474]">
                          #{report.id} · {report.createdAt} · {t("admin.reportedBy")} {report.reporter}
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
                    </div>
                  </article>
                ))
              ) : (
                <p className="border border-[#f0ead0]/10 bg-[#141412] px-5 py-5 text-sm italic text-[#8a8474]">
                  {t("admin.emptyReports")}
                </p>
              )}
            </div>
          </div>
        ) : null}

        {/* Users tab */}
        {activeTab === "users" ? (
          <div>
            {/* User filters */}
            <div className="mb-5 flex flex-wrap gap-2">
              {userFilterOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setUserFilter(option)}
                  className={`border px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] transition ${
                    userFilter === option
                      ? "border-[#d63e2a]/60 bg-[#d63e2a]/10 text-[#f0ead0]"
                      : "border-[#f0ead0]/10 text-[#8a8474] hover:border-[#f0ead0]/25 hover:text-[#c8c2a8]"
                  }`}
                >
                  {option === "all" ? "All" : t(`admin.status.${option}`)}
                </button>
              ))}
            </div>

            {usersQuery.isLoading ? (
              <p className="border border-[#f0ead0]/10 bg-[#141412] px-5 py-5 text-sm italic text-[#8a8474]">
                {t("admin.loading")}
              </p>
            ) : null}

            {usersQuery.isError ? (
              <p className="mb-3 border border-[#ff4f38]/30 bg-[#ff4f38]/10 px-5 py-4 text-sm text-[#ff9c8e]">
                {t("admin.usersLoadError")}
              </p>
            ) : null}

            <div className="space-y-3">
              {usersQuery.isLoading ? null : filteredUsers.length ? (
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
                      {managedUser.status !== "banned" ? (
                        <button
                          type="button"
                          onClick={() => void handleUserStatus(managedUser.id, "banned")}
                          disabled={isUpdatingUser || managedUser.isStaff || managedUser.id === user.id}
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
                  {t("admin.emptyUsers")}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
