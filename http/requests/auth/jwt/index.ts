import axiosInstance from "../../../axios/index"



export default {
    login(userData: any) {
        return axiosInstance.post(`/master/createAuthenticationToken`, userData)
    },

    register(userData: any) {
        return axiosInstance.post(`/createTenant`, userData)
    },

    confirmEmail(token: string) {
        return axiosInstance.put(`/confirmEmail/${token}`)
    },



}