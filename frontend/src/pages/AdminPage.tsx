import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useI18n } from "../lib/i18n";
import type { RootState } from "../store";

type ReportStatus = "pending" | "approved" | "rejected";
type AccountStatus = "active" | "suspended" | "banned";

type AdminReport = {
  id: number;
  reporter: string;
  target: string;
  type: string;
  reason: string;
  createdAt: string;
  status: ReportStatus;
  hidden: boolean;
};

type ManagedUser = {
  id: number;
  username: string;
  email: string;
  status: AccountStatus;
  reportCount: number;
};

const initialReports: AdminReport[] = [
  {
    id: 104,
    reporter: "cinephile42",
    target: "Post #88 · Weekend recommendations",
    type: "Spam",
    reason: "Repeated promotional links.",
    createdAt: "2026-06-23",
    status: "pending",
    hidden: false,
  },
  {
    id: 103,
    reporter: "minji",
    target: "Comment #314 · Dune review",
    type: "Abuse",
    reason: "Contains personal attacks.",
    createdAt: "2026-06-22",
    status: "pending",
    hidden: false,
  },
  {
    id: 102,
    reporter: "alex",
    target: "Post #74 · Film still collection",
    type: "Copyright",
    reason: "Uncredited copyrighted images.",
    createdAt: "2026-06-21",
    status: "rejected",
    hidden: false,
  },
];

const initialUsers: ManagedUser[] = [
  { id: 17, username: "cinephile42", email: "cinephile42@example.com", status: "active", reportCount: 3 },
  { id: 28, username: "screenwriter", email: "screenwriter@example.com", status: "suspended", reportCount: 2 },
  { id: 35, username: "posterbot", email: "posterbot@example.com", status: "banned", reportCount: 8 },
];

export default function AdminPage() {
  const { t } = useI18n();
  const user = useSelector((state: RootState) => state.auth.user);
  const [reports, setReports] = useState(initialReports);
  const [users, setUsers] = useState(initialUsers);

  if (!user?.isStaff && !import.meta.env.DEV) {
    return <Navigate to="/home" replace />;
  }

  const updateReport = (id: number, updates: Partial<AdminReport>) => {
    setReports((current) =>
      current.map((report) => (report.id === id ? { ...report, ...updates } : report)),
    );
  };

  const updateUserStatus = (id: number, status: AccountStatus) => {
    setUsers((current) =>
      current.map((managedUser) =>
        managedUser.id === id ? { ...managedUser, status } : managedUser,
      ),
    );
  };

  const statusClass = (status: string) => {
    if (status === "approved" || status === "active") return "text-[#6bbf72]";
    if (status === "rejected") return "text-[#c8c2a8]";
    if (status === "suspended") return "text-[#f2b84b]";
    if (status === "banned") return "text-[#ff4f38]";
    return "text-[#f2b84b]";
  };

  return (
    <section className="min-h-[calc(100vh-85px)] bg-[#0c0c0b] px-6 py-14 text-[#f0ead0]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#d63e2a]">
            {t("admin.eyebrow")}
          </p>
          <h1 className="font-['Bebas_Neue'] text-[clamp(28px,4vw,40px)] leading-[0.95] tracking-[0.03em]">
            {t("admin.title")}
          </h1>
          <p className="mt-4 max-w-2xl font-['IBM_Plex_Serif'] text-sm italic leading-7 text-[#8a8474]">
            {t("admin.description")}
          </p>
          <p className="mt-4 border-l border-[#d4a847] pl-3 text-xs text-[#c8c2a8]">
            {t("admin.previewNotice")}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="border border-[#f0ead0]/10 bg-[#141412] p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-['Bebas_Neue'] text-xl tracking-[0.04em]">{t("admin.reportsTitle")}</h2>
              <span className="text-[9px] uppercase tracking-[0.14em] text-[#8a8474]">{reports.length} entries</span>
            </div>

            <div className="mt-5 space-y-4">
              {reports.map((report) => (
                <article key={report.id} className="border border-[#f0ead0]/10 bg-[#1c1c19] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.08em] text-[#f0ead0]">{report.target}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-[#8a8474]">
                        #{report.id} · {report.type} · {report.createdAt} · {t("admin.reportedBy")} {report.reporter}
                      </p>
                    </div>
                    <span className={`text-[9px] uppercase tracking-[0.1em] ${statusClass(report.status)}`}>
                      {t(`admin.status.${report.status}`)}
                    </span>
                  </div>
                  <p className="mt-3 font-['IBM_Plex_Serif'] text-sm italic leading-6 text-[#c8c2a8]">{report.reason}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => updateReport(report.id, { status: "approved" })} className="border border-[#6bbf72]/50 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#9edba2] transition hover:bg-[#6bbf72]/10">
                      {t("admin.approve")}
                    </button>
                    <button type="button" onClick={() => updateReport(report.id, { status: "rejected" })} className="border border-[#f0ead0]/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#c8c2a8] transition hover:border-[#f0ead0]/40">
                      {t("admin.reject")}
                    </button>
                    <button type="button" onClick={() => updateReport(report.id, { hidden: !report.hidden })} className="border border-[#ff4f38]/50 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#ff9c8e] transition hover:bg-[#ff4f38]/10">
                      {report.hidden ? t("admin.unhide") : t("admin.hide")}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="border border-[#f0ead0]/10 bg-[#141412] p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-['Bebas_Neue'] text-xl tracking-[0.04em]">{t("admin.usersTitle")}</h2>
              <span className="text-[9px] uppercase tracking-[0.14em] text-[#8a8474]">{users.length} entries</span>
            </div>

            <div className="mt-5 space-y-4">
              {users.map((managedUser) => (
                <article key={managedUser.id} className="border border-[#f0ead0]/10 bg-[#1c1c19] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.08em] text-[#f0ead0]">{managedUser.username}</p>
                      <p className="mt-1 text-[10px] text-[#8a8474]">{managedUser.email}</p>
                    </div>
                    <span className={`text-[9px] uppercase tracking-[0.1em] ${statusClass(managedUser.status)}`}>
                      {t(`admin.status.${managedUser.status}`)}
                    </span>
                  </div>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-[#8a8474]">
                    {t("admin.reportCount").replace("{{count}}", String(managedUser.reportCount))}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => updateUserStatus(managedUser.id, "suspended")} className="border border-[#f2b84b]/50 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#f2d496] transition hover:bg-[#f2b84b]/10">
                      {t("admin.suspend")}
                    </button>
                    <button type="button" onClick={() => updateUserStatus(managedUser.id, "banned")} className="border border-[#ff4f38]/50 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#ff9c8e] transition hover:bg-[#ff4f38]/10">
                      {t("admin.ban")}
                    </button>
                    {managedUser.status !== "active" ? (
                      <button type="button" onClick={() => updateUserStatus(managedUser.id, "active")} className="border border-[#6bbf72]/50 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#9edba2] transition hover:bg-[#6bbf72]/10">
                        {t("admin.reactivate")}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
