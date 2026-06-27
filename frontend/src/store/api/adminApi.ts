import { apiSlice } from "../slices/apiSlice";

export type AdminReportStatus = "pending" | "approved" | "rejected";
export type AdminAccountStatus = "active" | "banned";

export type AdminReport = {
  id: number;
  reporter: string;
  target: string;
  type: string;
  reason: string;
  createdAt: string;
  status: AdminReportStatus;
  hidden: boolean;
};

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  status: AdminAccountStatus;
  reportCount: number;
};

type ListResponse<T> = T[] | { results?: T[] };

const toList = <T>(response: ListResponse<T>): T[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  if (Array.isArray(response.reports)) {
    return response.reports;
  }

  if (Array.isArray(response.users)) {
    return response.users;
  }

  return [];
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

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminReports: builder.query<AdminReport[], void>({
      query: () => "/admin/reports/",
      transformResponse: (response: ListResponse<RawAdminReport>) =>
        toList(response).map(normalizeReport),
      providesTags: ["AdminReports"],
    }),
    processAdminReport: builder.mutation<
      AdminReport,
      { id: number; status: AdminReportStatus; hidden?: boolean }
    >({
      query: ({ id, status }) => ({
        url: `/admin/reports/${id}/`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AdminReports"],
    }),
    getAdminUsers: builder.query<AdminUser[], void>({
      query: () => "/admin/users/",
      transformResponse: (response: ListResponse<RawAdminUser>) =>
        toList(response).map(normalizeUser),
      providesTags: ["AdminUsers"],
    }),
    updateAdminUserStatus: builder.mutation<
      AdminUser,
      { id: number; status: AdminAccountStatus }
    >({
      query: ({ id, status }) => ({
        url: `/admin/users/${id}/ban/`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AdminUsers"],
    }),
  }),
});

export const {
  useGetAdminReportsQuery,
  useProcessAdminReportMutation,
  useGetAdminUsersQuery,
  useUpdateAdminUserStatusMutation,
} = adminApi;
