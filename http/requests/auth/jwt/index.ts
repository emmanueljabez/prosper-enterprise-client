import  axiosInstance from "../../../axios/index"
import { Constants } from "~/utils/constants"

const authDomain = "https://api.ispbox.io/auth"
const masterDomain = "https://api.ispbox.io/api/v1/master"


export default {
    login(userData: any) {
         axiosInstance.defaults.headers.common["Authorization"] = ""

        return  axiosInstance.post(`${authDomain}/login`, userData)
    },
    
    register(userData: any) {
        console.log('userData', userData)
         axiosInstance.defaults.headers.common["Authorization"] = ""

        return  axiosInstance.post(`${masterDomain}/createTenant`, userData)
    },

    confirmEmail(token: string) {
         axiosInstance.defaults.headers.common["Authorization"] = ""
        
        return  axiosInstance.put(`${masterDomain}/confirmEmail/${token}`)
    },


    
}