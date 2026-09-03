export type AuthState = { phone: string; token: string | null; patientName: string | null };

export const authStore: AuthState = { phone: "", token: null, patientName: null };
