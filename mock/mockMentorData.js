// Mock mentor data - Kenyan themed
export const mockMentors = [
  {
    id: "mentor-1",
    userId: "user-001", 
    name: "Grace Wanjiku Mwangi",
    firstName: "Grace",
    lastName: "Mwangi",
    email: "grace.mwangi@email.com",
    phoneNumber: "+254722123456",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b765?w=150&h=150&fit=crop&crop=face",
    profilePhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b765?w=150&h=150&fit=crop&crop=face",
    title: "Senior Software Engineer & Tech Lead",
    company: "Safaricom PLC",
    location: "Nairobi, Kenya",
    timezone: "Africa/Nairobi",
    industry: "Technology",
    industries: ["Technology", "Telecommunications"],
    rating: 4.9,
    averageRating: 4.9,
    reviewCount: 127,
    totalReviews: 127,
    sessionCount: 245,
    hourlyRate: 8500, // KES
    currency: "KES",
    responseTime: 2, // hours
    expertiseAreas: ["Software Engineering", "Mobile Development", "Team Leadership"],
    skills: ["React", "Node.js", "Python", "Kotlin", "Leadership", "Agile"],
    languages: ["English", "Kiswahili", "Kikuyu"],
    sessionTypes: ["video", "phone", "chat"],
    bio: "Grace is a seasoned software engineer with over 8 years of experience in Kenya's leading telecommunications company. She has led multiple digital transformation projects including M-Pesa integrations and mobile banking solutions. Grace is passionate about mentoring young developers and promoting tech diversity in Kenya.",
    isVerified: true,
    isFeatured: true,
    isTrending: false,
    isActive: true,
    isAvailable: true,
    featured: true,
    profileViews: 1250,
    joinedAt: "2020-03-15",
    experience: {
      years: 8,
      currentRole: "Senior Software Engineer",
      company: "Safaricom PLC",
      previousRoles: [
        { role: "Software Developer", company: "KCB Bank" },
        { role: "Junior Developer", company: "iHub Nairobi" }
      ]
    },
    education: [
      {
        degree: "Bachelor of Computer Science",
        institution: "University of Nairobi",
        year: "2016"
      }
    ],
    certifications: ["AWS Solutions Architect", "Scrum Master", "Google Cloud Professional"],
    pricing: {
      hourlyRate: 8500,
      currency: "KES",
      sessionMinimum: 1
    }
  },
  {
    id: "mentor-2", 
    userId: "user-002",
    name: "David Kiprotich Ruto",
    firstName: "David",
    lastName: "Ruto", 
    email: "david.ruto@email.com",
    phoneNumber: "+254733234567",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    profilePhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    title: "Product Manager & Innovation Lead",
    company: "Equity Bank Kenya",
    location: "Nairobi, Kenya", 
    timezone: "Africa/Nairobi",
    industry: "Financial Services",
    industries: ["Financial Services", "Fintech"],
    rating: 4.7,
    averageRating: 4.7,
    reviewCount: 89,
    totalReviews: 89,
    sessionCount: 156,
    hourlyRate: 7200,
    currency: "KES",
    responseTime: 4,
    expertiseAreas: ["Product Management", "Digital Banking", "Financial Innovation"],
    skills: ["Product Strategy", "Data Analysis", "User Research", "Agile", "Fintech"],
    languages: ["English", "Kiswahili", "Kalenjin"],
    sessionTypes: ["video", "phone"],
    bio: "David leads product innovation at Equity Bank, focusing on digital financial services for the unbanked population in Kenya. He has launched several successful mobile banking products and has deep expertise in fintech solutions for emerging markets.",
    isVerified: true,
    isFeatured: false,
    isTrending: true,
    isActive: true,
    isAvailable: true,
    featured: false,
    profileViews: 890,
    joinedAt: "2021-01-20",
    experience: {
      years: 6,
      currentRole: "Product Manager",
      company: "Equity Bank Kenya",
      previousRoles: [
        { role: "Business Analyst", company: "KCB Bank" },
        { role: "Financial Consultant", company: "Deloitte Kenya" }
      ]
    },
    education: [
      {
        degree: "MBA Finance",
        institution: "Strathmore University",
        year: "2019"
      },
      {
        degree: "Bachelor of Economics",
        institution: "Kenyatta University", 
        year: "2017"
      }
    ],
    certifications: ["Product Management Certificate", "Certified Scrum Product Owner"],
    pricing: {
      hourlyRate: 7200,
      currency: "KES",
      sessionMinimum: 1
    }
  },
  {
    id: "mentor-3",
    userId: "user-003", 
    name: "Amina Hassan Mohammed",
    firstName: "Amina",
    lastName: "Mohammed",
    email: "amina.mohammed@email.com",
    phoneNumber: "+254744345678",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    profilePhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    title: "UX Design Lead & Design Systems Expert",
    company: "Twiga Foods",
    location: "Nairobi, Kenya",
    timezone: "Africa/Nairobi", 
    industry: "Agriculture Technology",
    industries: ["Technology", "Agriculture", "E-commerce"],
    rating: 4.8,
    averageRating: 4.8,
    reviewCount: 156,
    totalReviews: 156,
    sessionCount: 203,
    hourlyRate: 6800,
    currency: "KES",
    responseTime: 3,
    expertiseAreas: ["UX Design", "Design Systems", "Product Design"],
    skills: ["Figma", "Design Thinking", "User Research", "Prototyping", "Design Systems"],
    languages: ["English", "Kiswahili", "Arabic"],
    sessionTypes: ["video", "chat"],
    bio: "Amina leads UX design at Twiga Foods, Kenya's largest food distribution platform. She has designed user experiences that serve over 50,000 vendors across Kenya, with a focus on accessibility and mobile-first design for emerging markets.",
    isVerified: true,
    isFeatured: true,
    isTrending: false,
    isActive: true,
    isAvailable: true,
    featured: true,
    profileViews: 1100,
    joinedAt: "2020-08-10",
    experience: {
      years: 5,
      currentRole: "UX Design Lead",
      company: "Twiga Foods",
      previousRoles: [
        { role: "Product Designer", company: "Jumia Kenya" },
        { role: "UI/UX Designer", company: "iHub Nairobi" }
      ]
    },
    education: [
      {
        degree: "Bachelor of Design",
        institution: "Technical University of Kenya",
        year: "2018"
      }
    ],
    certifications: ["Google UX Design Certificate", "Design Thinking Certification"],
    pricing: {
      hourlyRate: 6800,
      currency: "KES",
      sessionMinimum: 1
    }
  },
  {
    id: "mentor-4",
    userId: "user-004",
    name: "James Ochieng Otieno",
    firstName: "James", 
    lastName: "Otieno",
    email: "james.otieno@email.com",
    phoneNumber: "+254755456789",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    title: "Data Science Manager & AI Researcher",
    company: "Kenya Airways",
    location: "Nairobi, Kenya",
    timezone: "Africa/Nairobi",
    industry: "Aviation",
    industries: ["Aviation", "Data Science", "Technology"],
    rating: 4.6,
    averageRating: 4.6,
    reviewCount: 73,
    totalReviews: 73,
    sessionCount: 98,
    hourlyRate: 9200,
    currency: "KES", 
    responseTime: 6,
    expertiseAreas: ["Data Science", "Machine Learning", "Business Intelligence"],
    skills: ["Python", "R", "SQL", "TensorFlow", "PowerBI", "Statistics"],
    languages: ["English", "Kiswahili", "Luo"],
    sessionTypes: ["video", "phone", "chat"],
    bio: "James leads data science initiatives at Kenya Airways, using predictive analytics to optimize flight operations and customer experience. He has a PhD in Applied Mathematics and specializes in machine learning applications for the aviation industry.",
    isVerified: true,
    isFeatured: false,
    isTrending: true,
    isActive: true,
    isAvailable: true,
    featured: false,
    profileViews: 720,
    joinedAt: "2021-05-12",
    experience: {
      years: 7,
      currentRole: "Data Science Manager", 
      company: "Kenya Airways",
      previousRoles: [
        { role: "Senior Data Analyst", company: "Safaricom PLC" },
        { role: "Research Scientist", company: "ICIPE Kenya" }
      ]
    },
    education: [
      {
        degree: "PhD Applied Mathematics",
        institution: "University of Nairobi",
        year: "2019"
      },
      {
        degree: "MSc Statistics",
        institution: "Kenyatta University",
        year: "2016"
      }
    ],
    certifications: ["AWS Machine Learning Specialty", "Google Cloud Data Engineer"],
    pricing: {
      hourlyRate: 9200,
      currency: "KES",
      sessionMinimum: 1
    }
  },
  {
    id: "mentor-5",
    userId: "user-005",
    name: "Sarah Nyambura Kamau",
    firstName: "Sarah",
    lastName: "Kamau",
    email: "sarah.kamau@email.com", 
    phoneNumber: "+254766567890",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    profilePhoto: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    title: "Marketing Director & Brand Strategy Expert",
    company: "EABL (East African Breweries)",
    location: "Nairobi, Kenya",
    timezone: "Africa/Nairobi",
    industry: "Consumer Goods",
    industries: ["Consumer Goods", "Marketing", "Brand Management"],
    rating: 4.5,
    averageRating: 4.5,
    reviewCount: 64,
    totalReviews: 64,
    sessionCount: 87,
    hourlyRate: 7800,
    currency: "KES",
    responseTime: 8,
    expertiseAreas: ["Marketing Strategy", "Brand Management", "Digital Marketing"],
    skills: ["Brand Strategy", "Digital Marketing", "Market Research", "Campaign Management"],
    languages: ["English", "Kiswahili", "Kikuyu"],
    sessionTypes: ["video", "phone"],
    bio: "Sarah is a marketing executive with over 10 years of experience building iconic brands in East Africa. She has led successful campaigns for Tusker, Kenya Cane, and other EABL brands, with expertise in African consumer markets and cultural marketing.",
    isVerified: true,
    isFeatured: true,
    isTrending: false,
    isActive: true,
    isAvailable: true,
    featured: true,
    profileViews: 650,
    joinedAt: "2020-11-05",
    experience: {
      years: 10,
      currentRole: "Marketing Director",
      company: "EABL",
      previousRoles: [
        { role: "Brand Manager", company: "Unilever Kenya" },
        { role: "Marketing Executive", company: "Coca-Cola Kenya" }
      ]
    },
    education: [
      {
        degree: "MBA Marketing",
        institution: "USIU-Africa",
        year: "2018"
      },
      {
        degree: "Bachelor of Commerce",
        institution: "University of Nairobi",
        year: "2014"
      }
    ],
    certifications: ["Google Ads Certified", "Facebook Blueprint Certified"],
    pricing: {
      hourlyRate: 7800,
      currency: "KES",
      sessionMinimum: 1
    }
  }
];

// Mock mentor marketplace stats
export const mockMarketplaceStats = {
  totalMentors: 245,
  activeMentors: 198, // Added missing activeMentors property
  verifiedMentors: 198,
  averageRating: 4.7,
  totalSessions: 8562,
  popularExpertiseAreas: [
    { name: "Software Engineering", count: 89, percentage: 36 },
    { name: "Product Management", count: 52, percentage: 21 },
    { name: "Data Science", count: 43, percentage: 18 },
    { name: "UX Design", count: 31, percentage: 13 },
    { name: "Digital Marketing", count: 30, percentage: 12 }
  ],
  industryDistribution: [
    { name: "Technology", count: 156, percentage: 64 },
    { name: "Financial Services", count: 34, percentage: 14 },
    { name: "Agriculture Technology", count: 28, percentage: 11 },
    { name: "Manufacturing", count: 27, percentage: 11 }
  ],
  priceRangeDistribution: [
    { range: "KES 5,000-7,000", count: 78, percentage: 32 },
    { range: "KES 7,000-9,000", count: 92, percentage: 38 },
    { range: "KES 9,000-12,000", count: 52, percentage: 21 },
    { range: "KES 12,000+", count: 23, percentage: 9 }
  ]
};

// Mock search suggestions
export const mockSearchSuggestions = [
  { id: 1, text: "Software Engineering", type: "expertise", count: 89 },
  { id: 2, text: "Product Management", type: "expertise", count: 52 },
  { id: 3, text: "Data Science", type: "expertise", count: 43 },
  { id: 4, text: "React", type: "skill", count: 67 },
  { id: 5, text: "Python", type: "skill", count: 78 },
  { id: 6, text: "Machine Learning", type: "skill", count: 45 },
  { id: 7, text: "Safaricom", type: "company", count: 12 },
  { id: 8, text: "Equity Bank", type: "company", count: 8 },
  { id: 9, text: "Digital Marketing", type: "expertise", count: 112 }
];

// Mock filters
export const mockFilters = {
  expertise: [
    { value: "Software Engineering", label: "Software Engineering", count: 89 },
    { value: "Product Management", label: "Product Management", count: 52 },
    { value: "Data Science", label: "Data Science", count: 43 },
    { value: "UX Design", label: "UX Design", count: 31 },
    { value: "Digital Marketing", label: "Digital Marketing", count: 30 },
    { value: "Mobile Development", label: "Mobile Development", count: 28 },
    { value: "Financial Innovation", label: "Financial Innovation", count: 25 }
  ],
  skills: [
    { value: "Python", label: "Python", count: 78 },
    { value: "React", label: "React", count: 67 },
    { value: "Node.js", label: "Node.js", count: 45 },
    { value: "Figma", label: "Figma", count: 38 },
    { value: "SQL", label: "SQL", count: 56 },
    { value: "Leadership", label: "Leadership", count: 89 },
    { value: "Agile", label: "Agile", count: 67 }
  ],
  industries: [
    { value: "Technology", label: "Technology", count: 156 },
    { value: "Financial Services", label: "Financial Services", count: 34 },
    { value: "Agriculture Technology", label: "Agriculture Technology", count: 28 },
    { value: "Manufacturing", label: "Manufacturing", count: 27 },
    { value: "Healthcare", label: "Healthcare", count: 22 },
    { value: "Education", label: "Education", count: 18 }
  ],
  sessionTypes: [
    { value: "video", label: "Video Call", count: 198 },
    { value: "phone", label: "Phone Call", count: 156 },
    { value: "chat", label: "Text Chat", count: 134 }
  ],
  communicationStyles: [
    { value: "direct", label: "Direct", count: 89 },
    { value: "supportive", label: "Supportive", count: 76 },
    { value: "analytical", label: "Analytical", count: 54 },
    { value: "creative", label: "Creative", count: 43 }
  ],
  languages: [
    { value: "English", label: "English", count: 245 },
    { value: "Kiswahili", label: "Kiswahili", count: 198 },
    { value: "Kikuyu", label: "Kikuyu", count: 67 },
    { value: "Kalenjin", label: "Kalenjin", count: 23 },
    { value: "Luo", label: "Luo", count: 19 },
    { value: "Arabic", label: "Arabic", count: 15 }
  ],
  verificationStatus: [
    { value: "verified", label: "Verified", count: 198 },
    { value: "pending", label: "Pending Verification", count: 32 },
    { value: "unverified", label: "Not Verified", count: 15 }
  ]
};

// Mock review data
export const mockReviews = [
  {
    id: "review-001",
    mentorId: "mentor-001",
    reviewerId: "user-101",
    sessionId: "session-001",
    rating: 5,
    title: "Exceptional guidance on system design",
    content: "Sarah provided incredibly detailed feedback on my system design approach. Her experience at Google really shows, and she helped me understand distributed systems concepts that I'd been struggling with for months. The session was well-structured and she provided actionable next steps.",
    categoryRatings: {
      communication: 5,
      expertise: 5,
      helpfulness: 5,
      availability: 4,
      valueForMoney: 5
    },
    isVerified: true,
    isAnonymous: false,
    createdAt: new Date("2024-01-10T15:30:00Z"),
    status: "approved",
    helpfulCount: 12,
    notHelpfulCount: 0,
    replyCount: 1,
    reviewer: {
      id: "user-101",
      name: "Alex Kumar",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      isVerifiedPurchaser: true,
      totalReviews: 8
    },
    mentorResponse: {
      content: "Thank you Alex! I'm so glad the system design concepts clicked for you. Keep practicing with those distributed system patterns we discussed, and feel free to reach out if you have questions as you implement them.",
      createdAt: new Date("2024-01-12T09:15:00Z"),
      isEdited: false
    },
    sessionDetails: {
      duration: 60,
      sessionType: "one-on-one",
      topics: ["System Design", "Distributed Systems", "Career Growth"],
      completionDate: new Date("2024-01-08T18:00:00Z")
    }
  },
  {
    id: "review-002",
    mentorId: "mentor-001",
    reviewerId: "user-102",
    sessionId: "session-002",
    rating: 4,
    title: "Great technical depth, could improve on career advice",
    content: "Sarah's technical expertise is outstanding. She helped me debug a complex React performance issue and taught me optimization techniques I hadn't considered. However, I was hoping for more career guidance during our session.",
    categoryRatings: {
      communication: 4,
      expertise: 5,
      helpfulness: 4,
      availability: 4,
      valueForMoney: 4
    },
    isVerified: true,
    isAnonymous: false,
    createdAt: new Date("2024-01-05T11:20:00Z"),
    status: "approved",
    helpfulCount: 7,
    notHelpfulCount: 1,
    replyCount: 1,
    reviewer: {
      id: "user-102",
      name: "Maria Santos",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face",
      isVerifiedPurchaser: true,
      totalReviews: 3
    },
    mentorResponse: {
      content: "Thanks for the feedback, Maria! You're right that we focused heavily on the technical solution. I'd love to schedule a follow-up session specifically focused on career planning if you're interested.",
      createdAt: new Date("2024-01-06T14:30:00Z"),
      isEdited: false
    },
    sessionDetails: {
      duration: 45,
      sessionType: "one-on-one",
      topics: ["React", "Performance Optimization", "Debugging"],
      completionDate: new Date("2024-01-03T16:30:00Z")
    }
  },
  {
    id: "review-003",
    mentorId: "mentor-002",
    reviewerId: "user-103",
    sessionId: "session-003",
    rating: 5,
    title: "Perfect introduction to product management",
    content: "Marcus gave me exactly what I needed to understand the PM role. Coming from engineering, I had many misconceptions about what PMs actually do. He walked me through real examples from Microsoft and helped me create a transition plan.",
    categoryRatings: {
      communication: 5,
      expertise: 5,
      helpfulness: 5,
      availability: 5,
      valueForMoney: 5
    },
    isVerified: true,
    isAnonymous: false,
    createdAt: new Date("2024-01-12T14:45:00Z"),
    status: "approved",
    helpfulCount: 15,
    notHelpfulCount: 0,
    replyCount: 1,
    reviewer: {
      id: "user-103",
      name: "David Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
      isVerifiedPurchaser: true,
      totalReviews: 2
    },
    mentorResponse: {
      content: "So happy to help with your transition, David! The engineering background will actually be a huge asset in PM. Remember to focus on those stakeholder communication skills we discussed. Rooting for you!",
      createdAt: new Date("2024-01-13T10:20:00Z"),
      isEdited: false
    },
    sessionDetails: {
      duration: 90,
      sessionType: "one-on-one",
      topics: ["Career Transition", "Product Management", "Stakeholder Management"],
      completionDate: new Date("2024-01-10T19:30:00Z")
    }
  },
  {
    id: "review-004",
    mentorId: "mentor-003",
    reviewerId: "user-104",
    sessionId: "session-004",
    rating: 5,
    title: "Machine learning expertise beyond expectations",
    content: "Priya's depth of ML knowledge is incredible. She not only helped me with my recommendation system architecture but also shared insights about building ML teams that I wouldn't get anywhere else. Her Netflix experience really shows.",
    categoryRatings: {
      communication: 4,
      expertise: 5,
      helpfulness: 5,
      availability: 3,
      valueForMoney: 5
    },
    isVerified: true,
    isAnonymous: false,
    createdAt: new Date("2024-01-08T16:00:00Z"),
    status: "approved",
    helpfulCount: 9,
    notHelpfulCount: 0,
    replyCount: 0,
    reviewer: {
      id: "user-104",
      name: "Jessica Wong",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50&h=50&fit=crop&crop=face",
      isVerifiedPurchaser: true,
      totalReviews: 12
    },
    sessionDetails: {
      duration: 75,
      sessionType: "one-on-one",
      topics: ["Machine Learning", "Recommendation Systems", "Team Building"],
      completionDate: new Date("2024-01-06T20:00:00Z")
    }
  },
  {
    id: "review-005",
    mentorId: "mentor-004",
    reviewerId: "user-105",
    sessionId: "session-005",
    rating: 3,
    title: "Good insights but session felt rushed",
    content: "James knows his stuff about UX design and gave some helpful feedback on my portfolio. However, the session felt a bit rushed and I didn't get as much detailed critique as I was hoping for.",
    categoryRatings: {
      communication: 3,
      expertise: 4,
      helpfulness: 3,
      availability: 4,
      valueForMoney: 3
    },
    isVerified: true,
    isAnonymous: false,
    createdAt: new Date("2024-01-04T13:20:00Z"),
    status: "approved",
    helpfulCount: 4,
    notHelpfulCount: 2,
    replyCount: 1,
    reviewer: {
      id: "user-105",
      name: "Sarah Kim",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      isVerifiedPurchaser: true,
      totalReviews: 5
    },
    mentorResponse: {
      content: "Hi Sarah, I apologize that our session felt rushed. I'd be happy to schedule a follow-up session to give your portfolio the detailed review it deserves. Please reach out!",
      createdAt: new Date("2024-01-05T09:45:00Z"),
      isEdited: false
    },
    sessionDetails: {
      duration: 45,
      sessionType: "portfolio-review",
      topics: ["UX Design", "Portfolio Review", "Career Advice"],
      completionDate: new Date("2024-01-02T17:00:00Z")
    }
  },
  {
    id: "review-006",
    mentorId: "mentor-005",
    reviewerId: "user-106",
    sessionId: "session-006",
    rating: 5,
    title: "Executive perspective on engineering leadership",
    content: "Emily provided invaluable insights on transitioning from senior engineer to engineering manager. Her experience scaling teams at Stripe was exactly what I needed to hear. The session was worth every penny.",
    categoryRatings: {
      communication: 5,
      expertise: 5,
      helpfulness: 5,
      availability: 3,
      valueForMoney: 4
    },
    isVerified: true,
    isAnonymous: false,
    createdAt: new Date("2024-01-15T10:30:00Z"),
    status: "approved",
    helpfulCount: 18,
    notHelpfulCount: 0,
    replyCount: 1,
    reviewer: {
      id: "user-106",
      name: "Michael Rodriguez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      isVerifiedPurchaser: true,
      totalReviews: 6
    },
    mentorResponse: {
      content: "Thank you Michael! Leadership transitions are challenging but rewarding. Remember that your technical background is an asset - use it to build credibility while developing your people skills. You've got this!",
      createdAt: new Date("2024-01-16T08:15:00Z"),
      isEdited: false
    },
    sessionDetails: {
      duration: 90,
      sessionType: "leadership-coaching",
      topics: ["Engineering Leadership", "Career Transition", "Team Scaling"],
      completionDate: new Date("2024-01-13T15:00:00Z")
    }
  }
];

// Mock review summaries for each mentor
export const mockReviewSummaries = {
  "mentor-001": {
    totalReviews: 127,
    averageRating: 4.8,
    ratingDistribution: {
      1: 1,
      2: 1,
      3: 5,
      4: 22,
      5: 98
    },
    categoryAverages: {
      communication: 4.7,
      expertise: 4.9,
      helpfulness: 4.8,
      availability: 4.6,
      valueForMoney: 4.8
    },
    verifiedReviewsCount: 118,
    verifiedPercentage: 93,
    responseRate: 87,
    averageResponseTime: 8,
    recommendationPercentage: 96
  },
  "mentor-002": {
    totalReviews: 89,
    averageRating: 4.7,
    ratingDistribution: {
      1: 0,
      2: 1,
      3: 2,
      4: 18,
      5: 68
    },
    categoryAverages: {
      communication: 4.8,
      expertise: 4.6,
      helpfulness: 4.7,
      availability: 4.7,
      valueForMoney: 4.6
    },
    verifiedReviewsCount: 84,
    verifiedPercentage: 94,
    responseRate: 91,
    averageResponseTime: 6,
    recommendationPercentage: 94
  },
  "mentor-003": {
    totalReviews: 156,
    averageRating: 4.9,
    ratingDistribution: {
      1: 0,
      2: 0,
      3: 2,
      4: 12,
      5: 142
    },
    categoryAverages: {
      communication: 4.8,
      expertise: 4.9,
      helpfulness: 4.9,
      availability: 4.5,
      valueForMoney: 4.8
    },
    verifiedReviewsCount: 148,
    verifiedPercentage: 95,
    responseRate: 76,
    averageResponseTime: 12,
    recommendationPercentage: 98
  },
  "mentor-004": {
    totalReviews: 74,
    averageRating: 4.6,
    ratingDistribution: {
      1: 0,
      2: 1,
      3: 3,
      4: 18,
      5: 52
    },
    categoryAverages: {
      communication: 4.5,
      expertise: 4.7,
      helpfulness: 4.6,
      availability: 4.6,
      valueForMoney: 4.5
    },
    verifiedReviewsCount: 69,
    verifiedPercentage: 93,
    responseRate: 89,
    averageResponseTime: 10,
    recommendationPercentage: 92
  },
  "mentor-005": {
    totalReviews: 203,
    averageRating: 4.8,
    ratingDistribution: {
      1: 0,
      2: 1,
      3: 3,
      4: 24,
      5: 175
    },
    categoryAverages: {
      communication: 4.9,
      expertise: 4.9,
      helpfulness: 4.8,
      availability: 4.2,
      valueForMoney: 4.6
    },
    verifiedReviewsCount: 195,
    verifiedPercentage: 96,
    responseRate: 82,
    averageResponseTime: 18,
    recommendationPercentage: 97
  }
};

// Mock scheduling data
export const mockMentorSchedules = {
  "mentor-001": {
    id: "schedule-001",
    mentorId: "mentor-001",
    weeklySchedule: {
      monday: { isAvailable: true, slots: [{ start: "18:00", end: "21:00" }] },
      tuesday: { isAvailable: true, slots: [{ start: "18:00", end: "21:00" }] },
      wednesday: { isAvailable: false, slots: [] },
      thursday: { isAvailable: true, slots: [{ start: "18:00", end: "21:00" }] },
      friday: { isAvailable: false, slots: [] },
      saturday: { isAvailable: true, slots: [{ start: "10:00", end: "16:00" }] },
      sunday: { isAvailable: true, slots: [{ start: "10:00", end: "14:00" }] }
    },
    timezone: "America/Los_Angeles",
    timezoneOffset: -480,
    bookingSettings: {
      advanceBookingDays: 30,
      minAdvanceHours: 24,
      maxSessionsPerDay: 6,
      maxSessionsPerWeek: 25,
      bufferBetweenSessions: 15,
      allowBackToBackSessions: false,
      autoAcceptBookings: true,
      requireApproval: false
    },
    breakSettings: {
      lunchBreak: {
        startTime: "12:00",
        endTime: "13:00",
        enabled: true
      },
      shortBreaks: {
        duration: 10,
        frequency: 2,
        enabled: true
      }
    },
    exceptions: [
      {
        id: "exception-001",
        date: new Date("2024-02-14"),
        type: "unavailable",
        reason: "Valentine's Day - Personal time",
        isRecurring: false
      }
    ],
    preferences: {
      preferredSessionLengths: [60, 90],
      allowedSessionTypes: ["one-on-one", "group-mentoring", "workshops"],
      maxConsecutiveSessions: 3,
      preferredMeetingPlatforms: ["zoom", "google-meet"]
    },
    calendarSync: {
      enabled: true,
      provider: "google",
      calendarId: "sarah.chen@gmail.com",
      syncBusyTimes: true,
      createEventsAutomatically: true,
      lastSyncAt: new Date("2024-01-15T10:00:00Z")
    },
    isActive: true,
    createdAt: new Date("2023-01-10T00:00:00Z"),
    updatedAt: new Date("2024-01-15T10:00:00Z")
  },
  "mentor-002": {
    id: "schedule-002",
    mentorId: "mentor-002",
    weeklySchedule: {
      monday: { isAvailable: true, slots: [{ start: "17:00", end: "20:00" }] },
      tuesday: { isAvailable: true, slots: [{ start: "17:00", end: "20:00" }] },
      wednesday: { isAvailable: true, slots: [{ start: "17:00", end: "20:00" }] },
      thursday: { isAvailable: false, slots: [] },
      friday: { isAvailable: false, slots: [] },
      saturday: { isAvailable: true, slots: [{ start: "09:00", end: "15:00" }] },
      sunday: { isAvailable: false, slots: [] }
    },
    timezone: "America/Los_Angeles",
    timezoneOffset: -480,
    bookingSettings: {
      advanceBookingDays: 21,
      minAdvanceHours: 48,
      maxSessionsPerDay: 4,
      maxSessionsPerWeek: 15,
      bufferBetweenSessions: 30,
      allowBackToBackSessions: false,
      autoAcceptBookings: false,
      requireApproval: true
    },
    breakSettings: {
      lunchBreak: {
        startTime: "12:00",
        endTime: "13:00",
        enabled: true
      }
    },
    exceptions: [],
    preferences: {
      preferredSessionLengths: [45, 60],
      allowedSessionTypes: ["one-on-one", "group-mentoring"],
      maxConsecutiveSessions: 2,
      preferredMeetingPlatforms: ["teams", "zoom"]
    },
    calendarSync: {
      enabled: true,
      provider: "outlook",
      calendarId: "marcus.johnson@microsoft.com",
      syncBusyTimes: true,
      createEventsAutomatically: true,
      lastSyncAt: new Date("2024-01-15T09:30:00Z")
    },
    isActive: true,
    createdAt: new Date("2023-02-15T00:00:00Z"),
    updatedAt: new Date("2024-01-15T09:30:00Z")
  }
};

// Mock mentor sessions
export const mockMentorSessions = [
  {
    id: "session-001",
    mentorId: "mentor-001",
    menteeId: "user-101",
    title: "System Design Deep Dive",
    description: "Reviewing distributed systems architecture for Alex's current project",
    sessionType: "one-on-one",
    scheduledStart: new Date("2024-01-25T19:00:00Z"),
    scheduledEnd: new Date("2024-01-25T20:00:00Z"),
    actualStart: new Date("2024-01-25T19:02:00Z"),
    actualEnd: new Date("2024-01-25T20:15:00Z"),
    duration: 60,
    platform: "zoom",
    meetingLink: "https://zoom.us/j/1234567890",
    meetingId: "123-456-7890",
    bookedAt: new Date("2024-01-20T10:30:00Z"),
    bookedBy: "user-101",
    bookingNotes: "Looking forward to discussing microservices patterns",
    status: "completed",
    preparationMaterials: [
      "System design document",
      "Current architecture diagram"
    ],
    sessionNotes: "Covered distributed caching strategies and database partitioning. Alex showed good understanding of concepts.",
    actionItems: [
      "Implement Redis caching layer",
      "Create database sharding strategy",
      "Schedule follow-up in 2 weeks"
    ],
    followUpRequired: true,
    followUpDate: new Date("2024-02-08T19:00:00Z"),
    paymentStatus: "paid",
    amount: 150,
    currency: "USD",
    paymentMethod: "credit_card",
    transactionId: "txn_1234567890",
    mentorRating: 5,
    menteeRating: 5,
    mentorFeedback: "Alex came well-prepared and asked great questions. Pleasure to work with!",
    menteeFeedback: "Incredibly helpful session. Sarah's explanations were clear and actionable.",
    reminders: [
      {
        id: "reminder-001",
        sessionId: "session-001",
        recipientId: "user-101",
        type: "email",
        scheduledFor: new Date("2024-01-24T19:00:00Z"),
        sentAt: new Date("2024-01-24T19:00:00Z"),
        status: "sent",
        template: "session-reminder-24h"
      }
    ],
    createdAt: new Date("2024-01-20T10:30:00Z"),
    updatedAt: new Date("2024-01-25T20:15:00Z")
  },
  {
    id: "session-002",
    mentorId: "mentor-002",
    menteeId: "user-103",
    title: "Product Management Career Transition",
    description: "Discussing transition from engineering to product management",
    sessionType: "one-on-one",
    scheduledStart: new Date("2024-01-28T18:00:00Z"),
    scheduledEnd: new Date("2024-01-28T19:30:00Z"),
    duration: 90,
    platform: "teams",
    meetingLink: "https://teams.microsoft.com/l/meetup-join/xyz",
    bookedAt: new Date("2024-01-22T14:20:00Z"),
    bookedBy: "user-103",
    bookingNotes: "Need guidance on PM interview preparation and portfolio",
    status: "scheduled",
    preparationMaterials: [
      "Current resume",
      "Product ideas document"
    ],
    paymentStatus: "pending",
    amount: 120,
    currency: "USD",
    followUpRequired: false,
    reminders: [
      {
        id: "reminder-002",
        sessionId: "session-002",
        recipientId: "user-103",
        type: "email",
        scheduledFor: new Date("2024-01-27T18:00:00Z"),
        status: "pending",
        template: "session-reminder-24h"
      }
    ],
    createdAt: new Date("2024-01-22T14:20:00Z"),
    updatedAt: new Date("2024-01-22T14:20:00Z")
  },
  {
    id: "session-003",
    mentorId: "mentor-003",
    menteeId: "user-104",
    title: "Machine Learning Career Workshop",
    description: "Group workshop on ML career paths and skill development",
    sessionType: "workshops",
    scheduledStart: new Date("2024-02-01T20:00:00Z"),
    scheduledEnd: new Date("2024-02-01T21:30:00Z"),
    duration: 90,
    platform: "zoom",
    meetingLink: "https://zoom.us/j/9876543210",
    meetingId: "987-654-3210",
    bookedAt: new Date("2024-01-25T11:00:00Z"),
    bookedBy: "user-104",
    status: "confirmed",
    paymentStatus: "paid",
    amount: 180,
    currency: "USD",
    paymentMethod: "paypal",
    transactionId: "pp_9876543210",
    followUpRequired: true,
    followUpDate: new Date("2024-02-15T20:00:00Z"),
    reminders: [
      {
        id: "reminder-003",
        sessionId: "session-003",
        recipientId: "user-104",
        type: "email",
        scheduledFor: new Date("2024-01-31T20:00:00Z"),
        status: "pending",
        template: "session-reminder-24h"
      }
    ],
    createdAt: new Date("2024-01-25T11:00:00Z"),
    updatedAt: new Date("2024-01-26T15:30:00Z")
  }
];

// Mock booking requests
export const mockBookingRequests = [
  {
    id: "booking-001",
    mentorId: "mentor-001",
    menteeId: "user-105",
    requestedStart: new Date("2024-02-05T19:00:00Z"),
    requestedEnd: new Date("2024-02-05T20:00:00Z"),
    sessionType: "one-on-one",
    platform: "zoom",
    message: "I'd like to discuss React performance optimization strategies for my e-commerce app.",
    urgentRequest: false,
    status: "pending",
    expiresAt: new Date("2024-02-02T19:00:00Z"),
    estimatedCost: 150,
    currency: "USD",
    createdAt: new Date("2024-01-30T14:30:00Z"),
    updatedAt: new Date("2024-01-30T14:30:00Z")
  },
  {
    id: "booking-002",
    mentorId: "mentor-002",
    menteeId: "user-106",
    requestedStart: new Date("2024-02-03T17:30:00Z"),
    requestedEnd: new Date("2024-02-03T18:30:00Z"),
    sessionType: "one-on-one",
    platform: "teams",
    message: "Need help with product roadmap planning and stakeholder management",
    urgentRequest: true,
    status: "approved",
    response: "Sounds great! Looking forward to helping you with roadmap planning.",
    respondedAt: new Date("2024-01-29T10:15:00Z"),
    expiresAt: new Date("2024-02-01T17:30:00Z"),
    estimatedCost: 120,
    currency: "USD",
    createdAt: new Date("2024-01-28T16:45:00Z"),
    updatedAt: new Date("2024-01-29T10:15:00Z")
  },
  {
    id: "booking-003",
    mentorId: "mentor-004",
    menteeId: "user-107",
    requestedStart: new Date("2024-02-10T15:00:00Z"),
    requestedEnd: new Date("2024-02-10T16:00:00Z"),
    sessionType: "portfolio-review",
    platform: "zoom",
    message: "Portfolio review for my UX design job applications",
    urgentRequest: false,
    status: "declined",
    response: "Thanks for reaching out! Unfortunately, I'm not available at that time. Here are some alternatives:",
    respondedAt: new Date("2024-01-31T09:00:00Z"),
    suggestedTimes: [
      {
        start: new Date("2024-02-11T15:00:00Z"),
        end: new Date("2024-02-11T16:00:00Z"),
        note: "Same time, next day"
      },
      {
        start: new Date("2024-02-10T18:00:00Z"),
        end: new Date("2024-02-10T19:00:00Z"),
        note: "Later that evening"
      }
    ],
    expiresAt: new Date("2024-02-07T15:00:00Z"),
    estimatedCost: 140,
    currency: "USD",
    createdAt: new Date("2024-01-30T12:00:00Z"),
    updatedAt: new Date("2024-01-31T09:00:00Z")
  }
];

// Mock availability slots for the next few days
export const mockAvailabilitySlots = [
  {
    id: "slot-001",
    mentorId: "mentor-001",
    startTime: new Date("2024-02-01T19:00:00Z"),
    endTime: new Date("2024-02-01T20:00:00Z"),
    duration: 60,
    isAvailable: true,
    isRecurring: false,
    maxBookings: 1,
    currentBookings: 0,
    allowedSessionTypes: ["one-on-one", "workshops"],
    isException: false,
    createdAt: new Date("2024-01-15T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  },
  {
    id: "slot-002",
    mentorId: "mentor-001",
    startTime: new Date("2024-02-01T20:00:00Z"),
    endTime: new Date("2024-02-01T21:00:00Z"),
    duration: 60,
    isAvailable: true,
    isRecurring: false,
    maxBookings: 1,
    currentBookings: 0,
    allowedSessionTypes: ["one-on-one"],
    isException: false,
    createdAt: new Date("2024-01-15T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  },
  {
    id: "slot-003",
    mentorId: "mentor-002",
    startTime: new Date("2024-02-02T17:00:00Z"),
    endTime: new Date("2024-02-02T18:00:00Z"),
    duration: 60,
    isAvailable: false,
    isRecurring: false,
    maxBookings: 1,
    currentBookings: 1,
    allowedSessionTypes: ["one-on-one"],
    isException: false,
    createdAt: new Date("2024-01-15T00:00:00Z"),
    updatedAt: new Date("2024-01-29T10:15:00Z")
  },
  {
    id: "slot-004",
    mentorId: "mentor-003",
    startTime: new Date("2024-02-03T11:00:00Z"),
    endTime: new Date("2024-02-03T12:00:00Z"),
    duration: 60,
    isAvailable: true,
    isRecurring: false,
    maxBookings: 1,
    currentBookings: 0,
    allowedSessionTypes: ["one-on-one", "career-coaching"],
    specialPricing: {
      rate: 200,
      currency: "USD",
      reason: "Weekend premium"
    },
    isException: false,
    createdAt: new Date("2024-01-15T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  }
];

// Mock calendar events
export const mockCalendarEvents = [
  {
    id: "event-001",
    title: "System Design Session with Alex",
    description: "One-on-one mentoring session",
    startTime: new Date("2024-01-25T19:00:00Z"),
    endTime: new Date("2024-01-25T20:00:00Z"),
    allDay: false,
    type: "session",
    sessionId: "session-001",
    mentorId: "mentor-001",
    menteeId: "user-101",
    meetingLink: "https://zoom.us/j/1234567890",
    attendees: ["sarah.chen@example.com", "alex.kumar@example.com"],
    externalId: "google_event_123",
    provider: "google",
    lastSyncAt: new Date("2024-01-24T10:00:00Z"),
    status: "confirmed",
    reminders: [
      { type: "email", minutesBefore: 1440 },
      { type: "popup", minutesBefore: 15 }
    ],
    createdAt: new Date("2024-01-20T10:30:00Z"),
    updatedAt: new Date("2024-01-24T10:00:00Z")
  },
  {
    id: "event-002",
    title: "Lunch Break",
    description: "Personal time - not available for sessions",
    startTime: new Date("2024-02-01T20:00:00Z"),
    endTime: new Date("2024-02-01T21:00:00Z"),
    allDay: false,
    type: "break",
    mentorId: "mentor-001",
    attendees: [],
    status: "confirmed",
    reminders: [],
    createdAt: new Date("2024-01-15T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  },
  {
    id: "event-003",
    title: "Product Strategy Workshop",
    description: "Internal team workshop",
    startTime: new Date("2024-02-02T15:00:00Z"),
    endTime: new Date("2024-02-02T17:00:00Z"),
    allDay: false,
    type: "blocked",
    mentorId: "mentor-002",
    attendees: ["marcus.johnson@example.com"],
    externalId: "outlook_event_456",
    provider: "outlook",
    lastSyncAt: new Date("2024-01-30T09:00:00Z"),
    status: "confirmed",
    reminders: [
      { type: "email", minutesBefore: 60 }
    ],
    createdAt: new Date("2024-01-25T00:00:00Z"),
    updatedAt: new Date("2024-01-30T09:00:00Z")
  }
]; 