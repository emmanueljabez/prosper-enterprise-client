// Mock data for Corporate Admin Dashboard
// Kenyan-themed data for demonstration purposes

export const mockCorporateAdminData = {
  organization: {
    name: "Safaricom PLC",
    totalEmployees: 1247,
    activeMentorships: 324,
    completedPrograms: 89,
    totalSpent: 2450000, // KES
    currency: "KES",
    established: "2000-04-03",
    headquarters: "Nairobi, Kenya",
    industry: "Telecommunications",
    website: "https://safaricom.co.ke"
  },
  
  overview: {
    stats: [
      {
        title: "Total Employees",
        value: "1,247",
        change: "+12%",
        trend: "up",
        icon: "Users",
        color: "blue",
        previousValue: 1113
      },
      {
        title: "Active Mentorships",
        value: "324",
        change: "+8%", 
        trend: "up",
        icon: "UserCheck",
        color: "green",
        previousValue: 300
      },
      {
        title: "Program Budget Used",
        value: "68%",
        change: "+5%",
        trend: "up",
        icon: "DollarSign",
        color: "orange",
        previousValue: 63
      },
      {
        title: "Completion Rate",
        value: "87%",
        change: "+3%",
        trend: "up",
        icon: "Target",
        color: "purple",
        previousValue: 84
      }
    ],
    
    mentorshipMetrics: {
      totalSessions: 1456,
      averageRating: 4.7,
      successRate: 87,
      retentionRate: 92,
      averageSessionDuration: "52 minutes",
      totalHoursCompleted: 1260,
      noShowRate: 3.2
    },
    
    departmentBreakdown: [
      { 
        department: "Engineering", 
        employees: 342, 
        activeMentorships: 89, 
        budget: 680000,
        budgetUsed: 458000,
        completedSessions: 245,
        averageRating: 4.8
      },
      { 
        department: "Sales", 
        employees: 186, 
        activeMentorships: 67, 
        budget: 420000,
        budgetUsed: 315000,
        completedSessions: 178,
        averageRating: 4.6
      },
      { 
        department: "Marketing", 
        employees: 124, 
        activeMentorships: 45, 
        budget: 310000,
        budgetUsed: 186000,
        completedSessions: 123,
        averageRating: 4.7
      },
      { 
        department: "Operations", 
        employees: 298, 
        activeMentorships: 78, 
        budget: 580000,
        budgetUsed: 406000,
        completedSessions: 189,
        averageRating: 4.5
      },
      { 
        department: "Finance", 
        employees: 89, 
        activeMentorships: 23, 
        budget: 180000,
        budgetUsed: 92000,
        completedSessions: 67,
        averageRating: 4.4
      },
      { 
        department: "HR", 
        employees: 67, 
        activeMentorships: 22, 
        budget: 150000,
        budgetUsed: 110000,
        completedSessions: 58,
        averageRating: 4.9
      },
      { 
        department: "Other", 
        employees: 141, 
        activeMentorships: 35, 
        budget: 280000,
        budgetUsed: 168000,
        completedSessions: 96,
        averageRating: 4.6
      }
    ]
  },

  employees: {
    pendingApprovals: 12,
    activeMentorships: 324,
    completedPrograms: 89,
    totalBudget: 3000000,
    budgetUsed: 2040000,
    
    pendingRequests: [
      {
        id: "request-001",
        employee: {
          id: "emp-001",
          name: "Sarah Njeri Kamau",
          email: "sarah.njeri@safaricom.co.ke",
          department: "Engineering",
          position: "Senior Software Developer",
          joinDate: "2023-01-15",
          profileImage: "/images/avatars/sarah.jpg"
        },
        mentorshipType: "Technical Leadership",
        duration: "3 months",
        estimatedCost: 45000,
        requestDate: "2024-01-18T14:30:00Z",
        goals: "Develop technical leadership skills and learn how to effectively lead a development team",
        preferredAreas: ["Team Management", "Technical Architecture", "Code Reviews"],
        justification: "Recently promoted to team lead role and need guidance on best practices for leading technical teams",
        status: "pending_approval",
        priority: "high"
      },
      {
        id: "request-002",
        employee: {
          id: "emp-002",
          name: "Peter Mwangi Karanja",
          email: "peter.mwangi@safaricom.co.ke",
          department: "Sales",
          position: "Account Executive",
          joinDate: "2022-08-20",
          profileImage: "/images/avatars/peter.jpg"
        },
        mentorshipType: "Sales Excellence",
        duration: "2 months",
        estimatedCost: 30000,
        requestDate: "2024-01-17T10:15:00Z",
        goals: "Improve closing rates and develop strategic account management skills",
        preferredAreas: ["Sales Strategy", "Negotiation", "Account Management"],
        justification: "Want to transition to enterprise sales and need guidance on handling larger accounts",
        status: "pending_approval",
        priority: "medium"
      },
      {
        id: "request-003",
        employee: {
          id: "emp-003",
          name: "Mary Onjala Kimani",
          email: "mary.onjala@safaricom.co.ke",
          department: "Marketing",
          position: "Digital Marketing Specialist",
          joinDate: "2023-06-10",
          profileImage: "/images/avatars/mary.jpg"
        },
        mentorshipType: "Product Marketing",
        duration: "4 months",
        estimatedCost: 60000,
        requestDate: "2024-01-16T16:45:00Z",
        goals: "Learn product marketing strategies and develop go-to-market expertise",
        preferredAreas: ["Product Strategy", "Market Research", "Campaign Development"],
        justification: "Moving into product marketing role and need comprehensive guidance on product positioning",
        status: "pending_approval",
        priority: "medium"
      },
      {
        id: "request-004",
        employee: {
          id: "emp-004",
          name: "James Kiprotich Mutai",
          email: "james.mutai@safaricom.co.ke",
          department: "Finance",
          position: "Financial Analyst",
          joinDate: "2022-03-12",
          profileImage: "/images/avatars/james.jpg"
        },
        mentorshipType: "Financial Planning",
        duration: "2 months",
        estimatedCost: 25000,
        requestDate: "2024-01-15T11:20:00Z",
        goals: "Advance financial modeling skills and learn strategic financial planning",
        preferredAreas: ["Financial Modeling", "Budget Planning", "Investment Analysis"],
        justification: "Seeking promotion to Senior Analyst and need advanced financial planning skills",
        status: "pending_approval",
        priority: "low"
      },
      {
        id: "request-005",
        employee: {
          id: "emp-005",
          name: "Grace Wanjiku Mwangi",
          email: "grace.wanjiku@safaricom.co.ke",
          department: "Operations",
          position: "Operations Manager",
          joinDate: "2021-11-08",
          profileImage: "/images/avatars/grace.jpg"
        },
        mentorshipType: "Operational Excellence",
        duration: "3 months",
        estimatedCost: 40000,
        requestDate: "2024-01-14T09:30:00Z",
        goals: "Optimize operational processes and implement lean management principles",
        preferredAreas: ["Process Optimization", "Lean Management", "Team Efficiency"],
        justification: "Leading a process improvement initiative and need expert guidance on operational excellence",
        status: "pending_approval",
        priority: "high"
      }
    ],
    
    recentApprovals: [
      {
        id: "approval-001",
        employeeName: "David Maina Njoroge",
        department: "Engineering",
        cost: 35000,
        approvedDate: "2024-01-19T08:15:00Z",
        mentorshipType: "Cloud Architecture"
      },
      {
        id: "approval-002",
        employeeName: "Linda Akinyi Odhiambo",
        department: "Marketing",
        cost: 28000,
        approvedDate: "2024-01-18T14:20:00Z",
        mentorshipType: "Digital Strategy"
      },
      {
        id: "approval-003",
        employeeName: "Michael Kiptoo Ruto",
        department: "Sales",
        cost: 32000,
        approvedDate: "2024-01-17T11:45:00Z",
        mentorshipType: "Enterprise Sales"
      },
      {
        id: "approval-004",
        employeeName: "Ruth Nyong Achieng",
        department: "HR",
        cost: 30000,
        approvedDate: "2024-01-16T16:30:00Z",
        mentorshipType: "Talent Development"
      },
      {
        id: "approval-005",
        employeeName: "Joseph Kipkoech Ruto",
        department: "Finance",
        cost: 26000,
        approvedDate: "2024-01-15T13:10:00Z",
        mentorshipType: "Risk Management"
      }
    ]
  },

  mentors: {
    totalMentors: 156,
    verifiedMentors: 142,
    newThisMonth: 12,
    
    topRatedMentors: [
      {
        id: "mentor-001",
        name: "Dr. Grace Wanjiku Mwangi",
        rating: 4.9,
        sessions: 45,
        specialization: "Tech Leadership",
        verified: true,
        totalEarnings: 225000,
        joinedDate: "2023-03-15",
        location: "Nairobi",
        responseTime: "< 2 hours"
      },
      {
        id: "mentor-002", 
        name: "James Kiprotich Mutai",
        rating: 4.8,
        sessions: 38,
        specialization: "Strategic Planning",
        verified: true,
        totalEarnings: 190000,
        joinedDate: "2023-01-20",
        location: "Eldoret",
        responseTime: "< 4 hours"
      },
      {
        id: "mentor-003",
        name: "Dr. Amina Hassan Abdi",
        rating: 4.8,
        sessions: 42,
        specialization: "Digital Transformation",
        verified: true,
        totalEarnings: 210000,
        joinedDate: "2022-11-10",
        location: "Mombasa",
        responseTime: "< 1 hour"
      },
      {
        id: "mentor-004",
        name: "Peter Mwangi Karanja",
        rating: 4.7,
        sessions: 35,
        specialization: "Software Engineering",
        verified: true,
        totalEarnings: 175000,
        joinedDate: "2023-06-05",
        location: "Nakuru",
        responseTime: "< 3 hours"
      },
      {
        id: "mentor-005",
        name: "Mary Onjala Kimani",
        rating: 4.9,
        sessions: 52,
        specialization: "Product Management",
        verified: true,
        totalEarnings: 260000,
        joinedDate: "2022-08-18",
        location: "Kisumu",
        responseTime: "< 2 hours"
      }
    ],
    
    mentorMetrics: {
      averageResponseTime: "2.3 hours",
      averageSessionRating: 4.7,
      totalRevenue: 2450000,
      averageEarningsPerMentor: 15705,
      topCategories: ["Leadership", "Technology", "Business Strategy", "Communication", "Data Science"],
      retentionRate: 94,
      activeHours: 3240
    }
  },

  analytics: {
    sessionTrends: [
      { month: "Sep 2023", sessions: 67, revenue: 134000, newMentors: 8, completionRate: 84 },
      { month: "Oct 2023", sessions: 89, revenue: 178000, newMentors: 12, completionRate: 85 },
      { month: "Nov 2023", sessions: 124, revenue: 248000, newMentors: 15, completionRate: 86 },
      { month: "Dec 2023", sessions: 156, revenue: 312000, newMentors: 18, completionRate: 87 },
      { month: "Jan 2024", sessions: 198, revenue: 396000, newMentors: 22, completionRate: 89 }
    ],
    
    departmentEngagement: [
      { department: "Engineering", engagement: 94, averageSessionsPerEmployee: 2.8, satisfaction: 4.8 },
      { department: "Sales", engagement: 87, averageSessionsPerEmployee: 2.3, satisfaction: 4.6 },
      { department: "Marketing", engagement: 91, averageSessionsPerEmployee: 2.6, satisfaction: 4.7 },
      { department: "Operations", engagement: 83, averageSessionsPerEmployee: 2.1, satisfaction: 4.5 },
      { department: "Finance", engagement: 78, averageSessionsPerEmployee: 1.8, satisfaction: 4.4 },
      { department: "HR", engagement: 88, averageSessionsPerEmployee: 2.4, satisfaction: 4.9 }
    ],
    
    programEffectiveness: {
      skillImprovement: 89,
      careerAdvancement: 76,
      jobSatisfaction: 82,
      employeeRetention: 94,
      performanceImprovement: 78,
      promotionRate: 23,
      internalMobilityRate: 31
    },

    topMentorshipTopics: [
      { topic: "Leadership Development", sessions: 245, growth: 15 },
      { topic: "Technical Skills", sessions: 198, growth: 22 },
      { topic: "Career Planning", sessions: 167, growth: 8 },
      { topic: "Communication Skills", sessions: 134, growth: 12 },
      { topic: "Project Management", sessions: 123, growth: 18 },
      { topic: "Data Analysis", sessions: 89, growth: 25 }
    ],

    geographicDistribution: [
      { region: "Nairobi", employees: 623, mentorships: 187, mentors: 45 },
      { region: "Mombasa", employees: 234, mentorships: 78, mentors: 23 },
      { region: "Kisumu", employees: 156, mentorships: 34, mentors: 18 },
      { region: "Nakuru", employees: 89, mentorships: 12, mentors: 8 },
      { region: "Eldoret", employees: 78, mentorships: 8, mentors: 6 },
      { region: "Other", employees: 67, mentorships: 5, mentors: 4 }
    ]
  },

  recentActivity: [
    {
      id: "activity-001",
      type: "employee_approval",
      title: "Employee Request Approved",
      description: "David Maina's mentorship request approved",
      details: "Cloud Architecture mentorship - KES 35,000 budget allocation",
      timestamp: "2024-01-19T08:15:00Z",
      icon: "CheckCircle",
      color: "green",
      userId: "admin-001",
      userName: "James Kiprotich"
    },
    {
      id: "activity-002", 
      type: "budget_alert",
      title: "Budget Alert",
      description: "Engineering department reached 85% of mentorship budget",
      details: "KES 578,000 of KES 680,000 budget used",
      timestamp: "2024-01-19T09:15:00Z",
      icon: "AlertTriangle",
      color: "orange",
      userId: "system",
      userName: "System"
    },
    {
      id: "activity-003",
      type: "program_completion",
      title: "Program Completed",
      description: "Leadership Development Program completed by 12 employees",
      details: "Average satisfaction rating: 4.8/5",
      timestamp: "2024-01-19T08:45:00Z",
      icon: "Award",
      color: "blue",
      userId: "system",
      userName: "System"
    },
    {
      id: "activity-004",
      type: "employee_request",
      title: "New Mentorship Request",
      description: "Sarah Njeri requested Technical Leadership mentorship",
      details: "3-month program - KES 45,000 estimated cost",
      timestamp: "2024-01-18T14:30:00Z",
      icon: "UserPlus",
      color: "blue",
      userId: "system",
      userName: "System"
    },
    {
      id: "activity-005",
      type: "employee_approval",
      title: "Employee Request Approved",
      description: "Linda Akinyi's mentorship request approved",
      details: "Digital Strategy mentorship - KES 28,000 budget allocation",
      timestamp: "2024-01-18T14:20:00Z",
      icon: "CheckCircle",
      color: "green",
      userId: "admin-001",
      userName: "James Kiprotich"
    },
    {
      id: "activity-006",
      type: "payment_processed",
      title: "Payments Processed",
      description: "Monthly mentor payments processed successfully",
      details: "KES 1,245,000 distributed to 142 mentors",
      timestamp: "2024-01-18T12:00:00Z",
      icon: "DollarSign",
      color: "green",
      userId: "system",
      userName: "System"
    },
    {
      id: "activity-007",
      type: "session_milestone",
      title: "Session Milestone",
      description: "1000th mentorship session completed this quarter",
      details: "Record-breaking engagement across all departments",
      timestamp: "2024-01-17T15:30:00Z",
      icon: "Target",
      color: "purple",
      userId: "system",
      userName: "System"
    },
    {
      id: "activity-008",
      type: "employee_approval",
      title: "Employee Request Approved",
      description: "Michael Kiptoo's mentorship request approved",
      details: "Enterprise Sales mentorship - KES 32,000 budget allocation",
      timestamp: "2024-01-17T11:45:00Z",
      icon: "CheckCircle",
      color: "green",
      userId: "admin-002",
      userName: "Sarah Nyong"
    }
  ],

  alerts: [
    {
      id: "alert-001",
      type: "approval",
      title: "Pending Employee Approvals",
      message: "12 employees are waiting for mentorship approval",
      details: "Requests pending for more than 48 hours. Review required to maintain employee engagement.",
      severity: "warning",
      actionRequired: true,
      createdAt: "2024-01-18T16:00:00Z",
      count: 12
    },
    {
      id: "alert-002",
      type: "budget",
      title: "Budget Alert",
      message: "Engineering department has used 85% of allocated mentorship budget",
      details: "KES 578,000 of KES 680,000 budget used. Consider budget reallocation.",
      severity: "warning",
      actionRequired: true,
      createdAt: "2024-01-19T09:15:00Z",
      department: "Engineering"
    },
    {
      id: "alert-003",
      type: "compliance",
      title: "Compliance Review",
      message: "Monthly mentorship compliance report is due in 3 days",
      details: "Ensure all required documentation is prepared for submission.",
      severity: "warning",
      actionRequired: true,
      createdAt: "2024-01-16T10:00:00Z",
      dueDate: "2024-01-22T23:59:59Z"
    },
    {
      id: "alert-004",
      type: "quality",
      title: "Quality Assurance",
      message: "2 mentors flagged for performance review",
      details: "Below average ratings detected. Schedule review meetings.",
      severity: "warning",
      actionRequired: true,
      createdAt: "2024-01-18T14:10:00Z",
      mentorsAffected: ["mentor-045", "mentor-078"]
    }
  ],

  systemHealth: {
    uptime: "99.8%",
    averageResponseTime: "245ms",
    activeUsers: 1247,
    concurrentSessions: 45,
    dataStorageUsed: "67%",
    bandwidthUsage: "234 GB",
    errorRate: "0.02%",
    lastBackup: "2024-01-19T02:00:00Z"
  },

  financialSummary: {
    totalBudget: 3000000,
    budgetUsed: 2040000,
    budgetRemaining: 960000,
    averageCostPerSession: 1200,
    projectedMonthlySpend: 450000,
    costPerEmployee: 1636,
    ROIMetrics: {
      trainingCostSavings: 850000,
      retentionSavings: 1200000,
      productivityGains: 2100000,
      totalROI: 4150000
    }
  }
}

export default mockCorporateAdminData 