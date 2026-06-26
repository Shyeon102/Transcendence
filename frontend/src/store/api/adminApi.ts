import { apiSlice } from "../slices/apiSlice";

export type AdminReportStatus = "pending" | "approved" | "rejected";
export type AdminAccountStatus = "active" | "suspended" | "banned";

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

  return response.results ?? [];
};

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminReports: builder.query<AdminReport[], void>({
      query: () => "/admin/reports/",
      transformResponse: (response: ListResponse<AdminReport>) => toList(response),
      providesTags: ["AdminReports"],
    }),
    processAdminReport: builder.mutation<
      AdminReport,
      { id: number; status: AdminReportStatus; hidden?: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/reports/${id}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminReports"],
    }),
    getAdminUsers: builder.query<AdminUser[], void>({
      query: () => "/admin/users/",
      transformResponse: (response: ListResponse<AdminUser>) => toList(response),
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
