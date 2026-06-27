import { apiSlice } from "../slices/apiSlice";

export type AdminReportStatus = "pending" | "approved" | "rejected";
export type AdminReportAction = "approve" | "reject";
export type AdminAccountStatus = "active" | "banned";

export type AdminReport = {
  id: number;
  reporter: string;
  target: string;
  type: string;
  reason: string;
  createdAt: string;
  status: AdminReportStatus;
};

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  status: AdminAccountStatus;
  reportCount: number;
  isStaff: boolean;
};

type ListResponse<T> = T[] | { results?: T[]; reports?: T[]; users?: T[] };

type RawAdminReport = {
  id: number;
  reporter?: string;
  reporter_username?: string;
  reporterUsername?: string;
  reporter_id?: number;
  user_id?: number;
  target?: string;
  target_title?: string;
  targetTitle?: string;
  target_type?: string;
  targetType?: string;
  target_id?: number;
  targetId?: number;
  report_type?: string;
  type?: string;
  reason?: string;
  created_at?: string;
  createdAt?: string;
  status?: AdminReportStatus;
};

type RawAdminUser = {
  id?: number;
  username?: string;
  email?: string;
  status?: AdminAccountStatus;
  report_count?: number;
  reportCount?: number;
  is_banned?: boolean;
  isBanned?: boolean;
  is_active?: boolean;
  isActive?: boolean;
  is_staff?: boolean;
  isStaff?: boolean;
};

const toList = <T>(response: ListResponse<T>): T[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return response.results ?? response.reports ?? response.users ?? [];
};

const normalizeReport = (report: RawAdminReport): AdminReport => {
  const targetType = report.targetType ?? report.target_type;
  const targetId = report.targetId ?? report.target_id;
  const targetFallback = targetType && targetId ? `${targetType} #${targetId}` : `Report #${report.id}`;

  return {
    id: report.id,
    reporter:
      report.reporter ??
      report.reporterUsername ??
      report.reporter_username ??
      String(report.reporter_id ?? report.user_id ?? "-"),
    target: report.target ?? report.targetTitle ?? report.target_title ?? targetFallback,
    type: report.type ?? report.report_type ?? "report",
    reason: report.reason ?? "",
    createdAt: report.createdAt ?? report.created_at ?? "",
    status: report.status ?? "pending",
  };
};

const normalizeUser = (user: RawAdminUser): AdminUser => {
  const isBanned =
    user.isBanned ??
    user.is_banned ??
    (user.isActive !== undefined
      ? user.isActive === false
      : user.is_active === false);
  const status = user.status ?? (isBanned ? "banned" : "active");

  return {
    id: user.id ?? 0,
    username: user.username ?? "-",
    email: user.email ?? "-",
    status,
    reportCount: user.reportCount ?? user.report_count ?? 0,
    isStaff: user.isStaff ?? user.is_staff ?? false,
  };
};

const actionByStatus: Record<Exclude<AdminReportStatus, "pending">, AdminReportAction> = {
  approved: "approve",
  rejected: "reject",
};

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminReports: builder.query<AdminReport[], void>({
      query: () => "/community/reports/",
      transformResponse: (response: ListResponse<RawAdminReport>) =>
        toList(response).map(normalizeReport),
      providesTags: ["AdminReports"],
    }),
    processAdminReport: builder.mutation<
      AdminReport,
      { id: number; status: Exclude<AdminReportStatus, "pending"> }
    >({
      query: ({ id, status }) => ({
        url: `/community/reports/${id}/`,
        method: "PATCH",
        body: { action: actionByStatus[status] },
      }),
      transformResponse: (response: RawAdminReport) => normalizeReport(response),
      invalidatesTags: ["AdminReports"],
    }),
    getAdminUsers: builder.query<AdminUser[], void>({
      query: () => "/users/",
      transformResponse: (response: ListResponse<RawAdminUser>) =>
        toList(response).map(normalizeUser),
      providesTags: ["AdminUsers"],
    }),
    banAdminUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}/ban/`,
        method: "PUT",
      }),
      invalidatesTags: ["AdminUsers"],
    }),
    unbanAdminUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}/ban/`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminUsers"],
    }),
  }),
});

export const {
  useBanAdminUserMutation,
  useGetAdminReportsQuery,
  useGetAdminUsersQuery,
  useProcessAdminReportMutation,
  useUnbanAdminUserMutation,
} = adminApi;
