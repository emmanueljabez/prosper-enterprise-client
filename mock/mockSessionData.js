// Mock Session Data for My Sessions page
export const mockSessions = [
  // Upcoming Sessions
  {
    id: 'session-1',
    mentorId: 'mentor-1',
    menteeId: 'mentee-1',
    title: 'Career Growth Strategy',
    description: 'Discussing career progression paths and skill development opportunities',
    sessionType: 'video_call',
    scheduledStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    scheduledEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour later
    duration: 60,
    platform: 'zoom',
    meetingLink: 'https://zoom.us/j/123456789',
    meetingId: '123-456-789',
    bookedAt: new Date('2024-01-10T10:00:00Z'),
    bookedBy: 'mentee-1',
    bookingNotes: 'Looking forward to discussing my career transition to senior management',
    status: 'confirmed',
    followUpRequired: true,
    paymentStatus: 'paid',
    amount: 150,
    currency: 'USD',
    reminders: [
      { type: 'email', sentAt: null, scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000) },
      { type: 'push', sentAt: null, scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000) }
    ],
    mentor: {
      id: 'mentor-1',
      name: 'Sarah Johnson',
      title: 'Senior Product Manager',
      company: 'Tech Innovations Inc.',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616c4e000a7?w=150',
      rating: 4.9
    },
    createdAt: new Date('2024-01-10T10:00:00Z'),
    updatedAt: new Date('2024-01-10T10:00:00Z')
  },
  {
    id: 'session-2',
    mentorId: 'mentor-2',
    menteeId: 'mentee-1',
    title: 'Technical Interview Preparation',
    description: 'Mock technical interview for software engineering roles',
    sessionType: 'screen_sharing',
    scheduledStart: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    scheduledEnd: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 1.5 hours later
    duration: 90,
    platform: 'google-meet',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    meetingId: 'abc-defg-hij',
    bookedAt: new Date('2024-01-12T14:30:00Z'),
    bookedBy: 'mentee-1',
    bookingNotes: 'Need help with system design questions and coding challenges',
    status: 'scheduled',
    followUpRequired: true,
    paymentStatus: 'paid',
    amount: 200,
    currency: 'USD',
    preparationMaterials: [
      'System Design Interview Guide',
      'Common Coding Patterns Cheat Sheet'
    ],
    reminders: [
      { type: 'email', sentAt: null, scheduledFor: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000) }
    ],
    mentor: {
      id: 'mentor-2',
      name: 'David Chen',
      title: 'Senior Software Engineer',
      company: 'Google',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      rating: 4.8
    },
    createdAt: new Date('2024-01-12T14:30:00Z'),
    updatedAt: new Date('2024-01-12T14:30:00Z')
  },
  {
    id: 'session-3',
    mentorId: 'mentor-3',
    menteeId: 'mentee-1',
    title: 'Leadership Skills Workshop',
    description: 'Group session on developing leadership presence and communication',
    sessionType: 'workshop',
    scheduledStart: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    scheduledEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000), // 2 hours later
    duration: 120,
    platform: 'teams',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/xyz',
    meetingId: 'xyz-workshop-123',
    bookedAt: new Date('2024-01-08T09:15:00Z'),
    bookedBy: 'mentee-1',
    bookingNotes: 'Excited to join this group workshop on leadership development',
    status: 'confirmed',
    followUpRequired: true,
    paymentStatus: 'paid',
    amount: 75, // Group session, lower individual cost
    currency: 'USD',
    preparationMaterials: [
      'Leadership Assessment Questionnaire',
      'Pre-workshop Reading Materials'
    ],
    reminders: [
      { type: 'email', sentAt: null, scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000) }
    ],
    mentor: {
      id: 'mentor-3',
      name: 'Maria Rodriguez',
      title: 'Executive Coach',
      company: 'Leadership Dynamics',
      profilePhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      rating: 4.9
    },
    createdAt: new Date('2024-01-08T09:15:00Z'),
    updatedAt: new Date('2024-01-08T09:15:00Z')
  },

  // Past Sessions
  {
    id: 'session-4',
    mentorId: 'mentor-1',
    menteeId: 'mentee-1',
    title: 'Resume Review & Optimization',
    description: 'Comprehensive review of resume and LinkedIn profile',
    sessionType: 'video_call',
    scheduledStart: new Date('2024-01-15T15:00:00Z'),
    scheduledEnd: new Date('2024-01-15T16:00:00Z'),
    actualStart: new Date('2024-01-15T15:05:00Z'),
    actualEnd: new Date('2024-01-15T16:10:00Z'),
    duration: 60,
    platform: 'zoom',
    meetingLink: 'https://zoom.us/j/987654321',
    meetingId: '987-654-321',
    bookedAt: new Date('2024-01-05T11:20:00Z'),
    bookedBy: 'mentee-1',
    bookingNotes: 'Looking to update my resume for senior product manager roles',
    status: 'completed',
    followUpRequired: false,
    paymentStatus: 'paid',
    amount: 150,
    currency: 'USD',
    sessionNotes: 'Reviewed resume structure, enhanced achievement statements, optimized keywords for ATS systems',
    actionItems: [
      'Update LinkedIn headline with target role keywords',
      'Add quantified achievements to current role',
      'Create industry-specific resume versions'
    ],
    mentorRating: 5,
    menteeRating: 5,
    mentorFeedback: 'Great session! Mentee was well-prepared and asked thoughtful questions.',
    menteeFeedback: 'Excellent feedback on my resume. Very actionable advice and clear next steps.',
    reminders: [],
    mentor: {
      id: 'mentor-1',
      name: 'Sarah Johnson',
      title: 'Senior Product Manager',
      company: 'Tech Innovations Inc.',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616c4e000a7?w=150',
      rating: 4.9
    },
    createdAt: new Date('2024-01-05T11:20:00Z'),
    updatedAt: new Date('2024-01-15T16:15:00Z')
  },
  {
    id: 'session-5',
    mentorId: 'mentor-4',
    menteeId: 'mentee-1',
    title: 'Data Science Career Path',
    description: 'Exploring opportunities in data science and required skills',
    sessionType: 'video_call',
    scheduledStart: new Date('2024-01-10T10:00:00Z'),
    scheduledEnd: new Date('2024-01-10T11:00:00Z'),
    actualStart: new Date('2024-01-10T10:00:00Z'),
    actualEnd: new Date('2024-01-10T10:55:00Z'),
    duration: 60,
    platform: 'google-meet',
    meetingLink: 'https://meet.google.com/def-ghij-klm',
    meetingId: 'def-ghij-klm',
    bookedAt: new Date('2024-01-02T16:45:00Z'),
    bookedBy: 'mentee-1',
    bookingNotes: 'Interested in transitioning from software engineering to data science',
    status: 'completed',
    followUpRequired: true,
    followUpDate: new Date('2024-01-24T10:00:00Z'),
    paymentStatus: 'paid',
    amount: 175,
    currency: 'USD',
    sessionNotes: 'Discussed transition pathway from SWE to DS, recommended courses and portfolio projects',
    actionItems: [
      'Complete Andrew Ng Machine Learning course',
      'Build 2-3 portfolio projects with real datasets',
      'Network with data scientists in target companies'
    ],
    mentorRating: 4,
    menteeRating: 5,
    mentorFeedback: 'Mentee showed strong analytical thinking and genuine interest in the field.',
    menteeFeedback: 'Very insightful discussion about the data science field. Clear roadmap provided.',
    reminders: [],
    mentor: {
      id: 'mentor-4',
      name: 'Alex Thompson',
      title: 'Senior Data Scientist',
      company: 'DataViz Analytics',
      profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      rating: 4.7
    },
    createdAt: new Date('2024-01-02T16:45:00Z'),
    updatedAt: new Date('2024-01-10T11:00:00Z')
  },

  // Cancelled Session
  {
    id: 'session-6',
    mentorId: 'mentor-2',
    menteeId: 'mentee-1',
    title: 'System Architecture Deep Dive',
    description: 'Advanced system design concepts and architectural patterns',
    sessionType: 'screen_sharing',
    scheduledStart: new Date('2024-01-08T14:00:00Z'),
    scheduledEnd: new Date('2024-01-08T15:30:00Z'),
    duration: 90,
    platform: 'zoom',
    meetingLink: 'https://zoom.us/j/555666777',
    meetingId: '555-666-777',
    bookedAt: new Date('2023-12-28T12:00:00Z'),
    bookedBy: 'mentee-1',
    bookingNotes: 'Want to understand microservices architecture and distributed systems',
    status: 'cancelled',
    cancellationReason: 'Mentor had a family emergency',
    followUpRequired: false,
    paymentStatus: 'refunded',
    amount: 200,
    currency: 'USD',
    reminders: [],
    mentor: {
      id: 'mentor-2',
      name: 'David Chen',
      title: 'Senior Software Engineer',
      company: 'Google',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      rating: 4.8
    },
    createdAt: new Date('2023-12-28T12:00:00Z'),
    updatedAt: new Date('2024-01-07T18:30:00Z')
  }
]

// Helper functions for session data
export const getUpcomingSessions = () => {
  const now = new Date()
  return mockSessions.filter(session => 
    new Date(session.scheduledStart) > now && 
    !['cancelled', 'completed'].includes(session.status)
  ).sort((a, b) => new Date(a.scheduledStart) - new Date(b.scheduledStart))
}

export const getPastSessions = () => {
  const now = new Date()
  return mockSessions.filter(session => 
    new Date(session.scheduledStart) < now || 
    ['cancelled', 'completed'].includes(session.status)
  ).sort((a, b) => new Date(b.scheduledStart) - new Date(a.scheduledStart))
}

export const getSessionsByStatus = (status) => {
  return mockSessions.filter(session => session.status === status)
}

export const getSessionById = (sessionId) => {
  return mockSessions.find(session => session.id === sessionId)
}

export const getTodaysSessions = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  return mockSessions.filter(session => {
    const sessionDate = new Date(session.scheduledStart)
    return sessionDate >= today && sessionDate < tomorrow && 
           !['cancelled', 'completed'].includes(session.status)
  })
}

export default mockSessions 