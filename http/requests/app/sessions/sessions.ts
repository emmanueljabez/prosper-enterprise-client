import axiosInstance from "../../../axios/index"

export default {
    createSession(session: any) {
        return axiosInstance.post('/v1/sessions/book', session)
    }
}