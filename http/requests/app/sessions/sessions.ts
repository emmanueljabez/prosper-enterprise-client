import axiosInstance from "../../../axios/index"

interface ConfirmSessionPayload {
    mentorResponse?: string
    scheduledStart?: string
}

interface CreateSessionPayload {
    mentorId: string
    menteeId: string
    skillId: string
    scheduledStart: string
    scheduledEnd?: string | null
    meetingPlatform?: string
    menteeMessage?: string | null
    questionnaireResponses?: Record<string, unknown> | null
    companyProgramId?: string | null
    companyProgramParticipantId?: string | null
    journeyInstanceStepId?: string | null
}

interface OutcomeActionItemPayload {
    description: string
    ownerType?: 'MENTEE' | 'MENTOR' | 'SHARED'
    dueAt?: string | null
}

interface CompleteSessionPayload {
    outcomeSummary?: string | null
    reflectionPrompt?: string | null
    mentorPrivateNotes?: string | null
    actionItems?: OutcomeActionItemPayload[]
}

interface ProposedSessionSlotPayload {
    scheduledStart: string
    scheduledEnd?: string | null
}

interface ProposeSessionAlternativePayload {
    mentorMessage?: string | null
    slots: ProposedSessionSlotPayload[]
}

interface RespondToSessionProposalPayload {
    slotId?: string | null
    response?: string | null
}

interface ContactSessionSupportPayload {
    requesterType: 'MENTOR' | 'MENTEE'
    message?: string | null
}

const normalizeMeetingPlatform = (value: unknown): 'GOOGLE_MEET' | 'ZOOM' => {
    const raw = String(value || '').trim()
    if (!raw) {
        return 'GOOGLE_MEET'
    }

    const normalized = raw.toUpperCase().replace(/[\s-]+/g, '_')
    if (normalized === 'ZOOM') {
        return 'ZOOM'
    }
    if (normalized === 'GOOGLE_MEET' || normalized === 'GOOGLEMEET') {
        return 'GOOGLE_MEET'
    }

    return 'GOOGLE_MEET'
}

export default {
    createSession(session: CreateSessionPayload) {
        const payload = {
            ...session,
            meetingPlatform: normalizeMeetingPlatform(session?.meetingPlatform)
        }
        return axiosInstance.post('/v1/sessions/book', payload)
    },

    getMenteeSessions(params: {
        menteeId: string
        filter: 'all' | 'today' | 'upcoming' | 'past'
        page: number
        size: number
    }) {
        return axiosInstance.get('/v1/subscriptions/mentee/sessions', {
            params
        })
    },

    getSessionById(sessionId: string) {
        return axiosInstance.get(`/v1/sessions/${sessionId}`)
    },

    confirmSession(sessionId: string, payload: ConfirmSessionPayload = {}) {
        const requestBody: ConfirmSessionPayload = {
            mentorResponse: payload.mentorResponse || ''
        }

        if (payload.scheduledStart) {
            requestBody.scheduledStart = payload.scheduledStart
        }

        return axiosInstance.post(`/v1/sessions/${sessionId}/confirm`, requestBody)
    },

    declineSession(sessionId: string, reason?: string) {
        return axiosInstance.post(`/v1/sessions/${sessionId}/decline`, {
            reason: reason || 'Mentor declined the session request'
        })
    },

    proposeAlternative(sessionId: string, payload: ProposeSessionAlternativePayload) {
        return axiosInstance.post(`/v1/sessions/${sessionId}/proposals`, payload)
    },

    getActiveProposal(sessionId: string) {
        return axiosInstance.get(`/v1/sessions/${sessionId}/proposals/active`)
    },

    acceptProposal(sessionId: string, proposalId: string, payload: RespondToSessionProposalPayload = {}) {
        return axiosInstance.post(`/v1/sessions/${sessionId}/proposals/${proposalId}/accept`, payload)
    },

    declineProposal(sessionId: string, proposalId: string, payload: RespondToSessionProposalPayload = {}) {
        return axiosInstance.post(`/v1/sessions/${sessionId}/proposals/${proposalId}/decline`, payload)
    },

    contactSupport(sessionId: string, payload: ContactSessionSupportPayload) {
        return axiosInstance.post(`/v1/sessions/${sessionId}/support-contact`, payload)
    },

    completeSession(sessionId: string, payload: CompleteSessionPayload = {}) {
        return axiosInstance.post(`/v1/sessions/${sessionId}/complete`, payload)
    }
}
