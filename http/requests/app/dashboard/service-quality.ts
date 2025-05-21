import axiosInstance from "~/http/axios";


export default {
    fetchData() {
        return axiosInstance.get('/dashboard/billing-and-revenue')
    }
}