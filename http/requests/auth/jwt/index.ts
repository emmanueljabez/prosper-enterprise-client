import axiosInstance from "../../../axios/index"
import type { SSOLoginData, MFAData } from "@/types/auth"

export default {
    login(userData: any) {
        return axiosInstance.post(`/auth/login`, userData)
    },

    register(userData: any) {
        return axiosInstance.post(`/auth/signup`, userData)
    },

    forgotPassword(data: {
        email: string;
        redirectTo?: string;
    }) {
        return axiosInstance.post(`/auth/forgot-password`, data)
    },

    resetPassword(data: {
        accessToken: string;
        password: string;
    }) {
        return axiosInstance.post(`/auth/reset-password`, data)
    },

    completeInvitationSignup(data: {
        email: string;
        password: string;
        invitationToken: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        dateOfBirth?: string;
    }) {
        return axiosInstance.post(`/auth/complete-invitation-signup`, data)
    },

    completeCompanyRegistration(data: {
        email: string;
        password: string;
        registrationToken: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        dateOfBirth?: string;
    }) {
        return axiosInstance.post(`/auth/complete-company-registration`, data)
    },

    confirmEmail(token: string) {
        return axiosInstance.put(`/confirmEmail/${token}`)
    },

    ssoLogin(ssoData: SSOLoginData) {
        return axiosInstance.post(`/auth/sso/login`, ssoData)
    },

    verifyMFA(mfaData: MFAData) {
        return axiosInstance.post(`/auth/mfa/verify`, mfaData)
    },

    refreshToken(refreshToken: string) {
        return axiosInstance.post(`/auth/refresh`, { refreshToken })
    },

    // MFA Setup Endpoints
    setupMFA(userId: string, email: string) {
        return axiosInstance.post(`/auth/mfa/setup`, { userId, email })
    },

    verifyMFASetup(userId: string, secret: string, code: string) {
        return axiosInstance.post(`/auth/mfa/verify-setup`, { userId, secret, code })
    },

    completeMFASetup(userId: string, secret: string) {
        return axiosInstance.post(`/auth/mfa/complete-setup`, { userId, secret })
    },

    // MFA Management Endpoints
    disableMFA(userId: string, password: string) {
        return axiosInstance.post(`/auth/mfa/disable`, { userId, password })
    },

    regenerateRecoveryCodes(userId: string) {
        return axiosInstance.post(`/auth/mfa/regenerate-recovery`, { userId })
    },

    getMFAStatus(userId: string) {
        return axiosInstance.get(`/auth/mfa/status/${userId}`)
    }
}
