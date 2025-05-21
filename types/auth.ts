export interface JwtPayload {
    sub: string
    exp?: number
    iat?: number
}


export interface RegistrationData {
    firstName: string | null
    lastName: string | null
    password: string | null
    companyName: string | null
    phoneNumber: string | null
    emailAddress: string | null
    noOfEmployees: string | null
}

export interface AuthState {
    loggedInUser: string | null
    loading: boolean
    error: string | null
    registrationData: RegistrationData
    currentStep: number
    networkType: string | null
}

export interface LoginData {
    username: string
    password: string
}