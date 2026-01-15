export const ENDPOINTS = {
  ADMIN: {
    OVERVIEW: '/admin/overview',
    STATISTICS: '/admin/statistics',
    COMMUNITIES: '/admin/communities',
    COMMUNITIES_PENDING: '/admin/communities',
    COMMUNITIES_APPROVE: (id: string) => `/admin/communities/${id}/approve`,
    COMMUNITIES_REJECT: (id: string) => `/admin/communities/${id}/reject`,
    REPORTS: '/admin/reports',
    REPORT_ACTION: (id: string) => `/admin/reports/${id}/action`,
    SUBSCRIPTIONS: '/admin/subscriptions',
    PAYMENTS: '/admin/payments',
    AUDIT: '/admin/audit',
    AUDIT_LOG: '/admin/audit/log',
  },
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  }
};
