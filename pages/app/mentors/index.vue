<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMentorsStore } from '@/store/modules/mentors'
import { useAuthStore } from '@/store/modules/auth'
import { RoleManager } from '@/utils/roleManager'
import { storeToRefs } from 'pinia'

// UI Components
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Real mentor data
const realMentorsData = [
  {
    "id": "60ea94d2d5efdc75988d09f5",
    "email": "mycoach@thrityengineer.org",
    "name": "Thrity Engineer",
    "phoneNumber": "+254737700699",
    "status": "ACTIVE",
    "linkedInUrl": "https://www.linkedin.com/in/thrity-engineer-mbuthia/",
    "favouriteQuote": "Nothing is impossible - You just have to find a way!",
    "biography": "Thrity is a seasoned marketer with over 20 years experience in leading diverse teams, strategy development and brand communication. She is also an executive leadership coach.",
    "profilePicUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FPROFILE%20PIC.jpg?alt=media&token=1f9a5d98-9f0a-47ae-8c33-5bc1b0b2ab8e",
    "topics": [
      {
        "id": "60e26c2ba5a9f8402c1cf6b9",
        "name": "How to Ace the Interview"
      },
      {
        "id": "60e26c2aa5a9f8402c1cf6a6",
        "name": "How to Build My Personal Brand"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6bc",
        "name": "Increasing My Personal Productivity"
      },
      {
        "id": "60e26c2aa5a9f8402c1cf6a7",
        "name": "How to Enjoy My Life & My Work"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b7",
        "name": "How to Advance My Career"
      }
    ],
    "occupation": "",
    "country": "Kenya",
    "orderId": 1
  },
  {
    "id": "60ea94d3d5efdc75988d09fe",
    "email": "achieng@digitalbeehive.net",
    "name": "Achieng Butler",
    "phoneNumber": "+254728200005",
    "status": "ACTIVE",
    "linkedInUrl": "http://linkedin.com/in/achieng-butler-4787b740",
    "favouriteQuote": "I am not a product of my circumstances. I am a product of my decisions",
    "biography": "Founder & CEO of Digital Beehive (strategy & digital marketing: digitalbeehive.net). Seasoned marketer & keen techpreneur. Experience in tourism, telco, beverage & tertiary ed. (Coca-Cola Africa, Airtel Africa, Danone France). I've reinvented my career many times over, & mentor on career (IG:@achitude). I have an MBA (UK), Postgrad Diploma in Research (UK), & BA degree in French & German (UON)",
    "profilePicUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2F25FBD548-14F5-4D04-B0E8-A4737F3320A1.jpeg?alt=media&token=a4584fca-69d8-4b89-8f1d-bc0e5093fa75",
    "topics": [
      {
        "id": "60e26c2ba5a9f8402c1cf6b7",
        "name": "How to Advance My Career"
      },
      {
        "id": "60e26c2aa5a9f8402c1cf6a6",
        "name": "How to Build My Personal Brand"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6bd",
        "name": "How to Build My Online Presence"
      }
    ],
    "occupation": "CEO - Marketing Strategist - Consultant",
    "country": "Kenya",
    "orderId": 2
  },
  {
    "id": "60ea94d6d5efdc75988d0a3f",
    "email": "faithnkathagitonga@gmail.com",
    "name": "Faith Nkatha Gitonga",
    "phoneNumber": "+254720755990",
    "status": "ACTIVE",
    "linkedInUrl": "http://linkedin.com/in/faithnkathagitonga",
    "favouriteQuote": "Do one thing every day that scares you",
    "biography": "Faith currently works for Oracle Corporation leading their Digital Transformation efforts for the Public Sector. Her background cuts across Strategy, Retail and Corporate banking. She has a degree in Marketing, a Masters in Psychology and is a Graduate of Yale University and UC Berkeley with Executive MBAs in Leadership. She sits on the Women on Boards Network Board. She is Married with 3 boys.",
    "profilePicUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FBD84BAA5-BED1-468E-9EAF-60230E5E4A0E.jpeg?alt=media&token=efa8e28e-ecc2-4877-bc9b-72e49d276961",
    "topics": [
      {
        "id": "60e26c2aa5a9f8402c1cf6a6",
        "name": "How to Build My Personal Brand"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b7",
        "name": "How to Advance My Career"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b9",
        "name": "How to Ace the Interview"
      }
    ],
    "occupation": "",
    "country": "Kenya",
    "orderId": 3
  },
  {
    "id": "60ea94d4d5efdc75988d0a21",
    "email": "janicekemoli4@gmail.com",
    "name": "Janice Kemoli",
    "phoneNumber": "+254722702902",
    "status": "ACTIVE",
    "linkedInUrl": "http://linkedin.com/in/janice-kemoli-b412b110a",
    "favouriteQuote": "Stop worrying and start living - Dale Carnegie",
    "biography": "A thought leader in brand and marketing strategy. Janice has held responsibility for P&L growth and brand/marketing strategy techniques that correlate both classical and digital marketing for over 40 brands and product lines across Eastern and Southern Africa. She is passionate about Africans designing for Africa.",
    "profilePicUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2F0F16A019-1207-4487-B61A-9F9BD22F796B.jpeg?alt=media&token=5c21e191-43c3-4390-ad08-c70ae41f2e7c",
    "topics": [
      {
        "id": "60e26c2ba5a9f8402c1cf6c0",
        "name": "Creating My Ability to Adapt to Change"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b7",
        "name": "How to Advance My Career"
      },
      {
        "id": "614504793c17b867aaabbdb3",
        "name": "How to Find a Job"
      }
    ],
    "occupation": "",
    "country": "Kenya",
    "orderId": 4
  },
  {
    "id": "60ea94d4d5efdc75988d0a11",
    "email": "dick.omondi@gmail.com",
    "name": "Dick Omondi",
    "phoneNumber": "+254737048009",
    "status": "ACTIVE",
    "linkedInUrl": "https://www.linkedin.com/in/domondi/",
    "favouriteQuote": "Nothing changes without Action.",
    "biography": "I work to grow people and brands through cutting edge management, marketing, public relations and corporate relations strategies. My exceptional growth journey traverses several senior leadership and board management roles with leading consumer brands including Airtel, Audimu, Coca-Cola, Colgate- Palmolive, Diageo, Kenya Airways, Ogilvy&Mather Advertising, Village Creative and Vodacom.",
    "profilePicUrl": "https://firebasestorage.googleapis.com/v0/b/prosper-app.appspot.com/o/images%2FIMG-3499.JPG?alt=media&token=4129ea7a-a83e-4c51-a9cf-e5673803540c",
    "topics": [
      {
        "id": "60e26c2ba5a9f8402c1cf6b4",
        "name": "How to Show Up & Boss Up"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b5",
        "name": "How to Strategically Network"
      },
      {
        "id": "60e26c2aa5a9f8402c1cf6a6",
        "name": "How to Build My Personal Brand"
      }
    ],
    "occupation": "",
    "country": "Kenya",
    "orderId": 5
  },
  {
    "id": "60ea94d4d5efdc75988d0a14",
    "email": "susan.kiamba@outlook.com",
    "name": "Susan Kiamba",
    "phoneNumber": "+254722330724",
    "status": "ACTIVE",
    "linkedInUrl": "https://www.linkedin.com/in/susankiamba",
    "favouriteQuote": "Forget perfection, embrace excellence!",
    "biography": "I am a career development trainer who creates Aha! moments about careers and work. Using my 15+ years of experience in banking, consulting and professional services, I help professionals establish an online brand on LinkedIn to attract the right people and grow in their careers.",
    "profilePicUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FProfile_Pic_Susan_Kiamba001.jpg?alt=media&token=93fc6d24-f690-4e6f-8177-1fe61cb4267b",
    "topics": [
      {
        "id": "60e26c2aa5a9f8402c1cf6a6",
        "name": "How to Build My Personal Brand"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b7",
        "name": "How to Advance My Career"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6bd",
        "name": "How to Build My Online Presence"
      }
    ],
    "occupation": "Career Development Trainer",
    "country": "Kenya",
    "orderId": 6
  },
  {
    "id": "60ea94d4d5efdc75988d0a0e",
    "email": "gweru01@gmail.com",
    "name": "George Muriithi Weru",
    "phoneNumber": "+254727341584",
    "status": "ACTIVE",
    "linkedInUrl": "https://www.linkedin.com/in/george-weru-cfa-aa47846/",
    "favouriteQuote": "Continuous effort is key to unlocking our potential",
    "biography": "I am an experienced professional with a demonstrated history of working in the accounting and finance industry mainly in the areas of Insolvency and Restructuring and Corporate Finance. Professionally I am a holder of a law degree, a CFA charterholder, a CPA, CFE and have an MBA, from University of Leicester. More importantly, I am a husband and father or two loving daughters.",
    "profilePicUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FGeorge%20Weru%20Photo.jpg?alt=media&token=956f26e0-5bd9-4a78-919e-8702a83925e8",
    "topics": [
      {
        "id": "60e26c2ba5a9f8402c1cf6b7",
        "name": "How to Advance My Career"
      }
    ],
    "occupation": "Consulting",
    "country": "Kenya",
    "orderId": 7
  },
  {
    "id": "60ea94d5d5efdc75988d0a2b",
    "email": "paul@smecentre.co.ke",
    "name": "Paul Muhami",
    "phoneNumber": "+254722236933",
    "status": "ACTIVE",
    "linkedInUrl": "www.linkedin.com/paul-muhami-18778926",
    "favouriteQuote": "You become what you focus your mind on.",
    "biography": "Am an entrepreneur, certified business coach and mentor. I advise on business start-up and growth processes. I specialize in strategy formulation, sales and marketing, and cashflow management. Let's connect and formulate a strategy to grow your business.",
    "profilePicUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FIMG-20200910-WA0006.jpg?alt=media&token=f4d0792d-7e2f-4d74-9873-889752df6dc7",
    "topics": [
      {
        "id": "60e26c2aa5a9f8402c1cf6a5",
        "name": "My Personal Finance"
      },
      {
        "id": "60e26c2aa5a9f8402c1cf6aa",
        "name": "How to Start a Business"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b3",
        "name": "How to Grow My Business"
      }
    ],
    "occupation": "Entrepreneur",
    "country": "Kenya",
    "orderId": 8
  },
  {
    "id": "60ea94d4d5efdc75988d0a18",
    "email": "jonmuga@gmail.com",
    "name": "Jonathan Muga",
    "phoneNumber": "+254727477001",
    "status": "ACTIVE",
    "linkedInUrl": "https://www.linkedin.com/in/jonathan-muga-738b493",
    "favouriteQuote": "Great things never come from comfort zones",
    "biography": "Jonathan has over 17 years extensive multinational experience in advisory, structured and project finance.Previously he was Head of Energy and Infrastructure Finance at Standard Bank, Associate Director at Bank of Tokyo Mitsubishi in London. He also served in various capacities at PWC and Deloitte in London and Kenya. He has a Masters in Finance from London Business School.",
    "profilePicUrl": "https://firebasestorage.googleapis.com/v0/b/prosper-app.appspot.com/o/images%2FIMG-20200424-WA0031.jpg?alt=media&token=1aad57ba-9ff6-4d7c-a96f-876dc1074834",
    "topics": [
      {
        "id": "60e26c2ba5a9f8402c1cf6bb",
        "name": "How to Negotiate the Best Deal"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b7",
        "name": "How to Advance My Career"
      },
      {
        "id": "60e26c2aa5a9f8402c1cf6ab",
        "name": "Other"
      }
    ],
    "occupation": "Banker",
    "country": "Kenya",
    "orderId": 9
  },
  {
    "id": "60ea94d6d5efdc75988d0a3e",
    "email": "aruoro@gmail.com",
    "name": "Agnes Ruoro",
    "phoneNumber": "+254721581354",
    "status": "ACTIVE",
    "linkedInUrl": "https://www.linkedin.com/in/agnes-ruoro-dba-ong-mba-balanced-scorecard-certified-264a0247",
    "favouriteQuote": "Reimagine! Reinvent! Reposition! Reignite the spark to a Better Self.",
    "biography": "Agnes is an ICF certified productivity coach, personal brand strategist & leadership catalyst with over 10 years experience in executive development & talent optimization. She uses a blend of coaching, focused personal development, personality assessments, mentorship & training to optimize potential. She is a certified Clarity 4D assesor, Balanced Score card pursuing a Doctorate in Leadership.",
    "profilePicUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FUSIU%20Africa%20ID%20660360.jpg.jpg?alt=media&token=a8388325-ffd3-4882-85b1-66b9b6faa5e8",
    "topics": [
      {
        "id": "60e26c2aa5a9f8402c1cf6a7",
        "name": "How to Enjoy My Life & My Work"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6bc",
        "name": "Increasing My Personal Productivity"
      },
      {
        "id": "60e26c2aa5a9f8402c1cf6a6",
        "name": "How to Build My Personal Brand"
      }
    ],
    "occupation": "",
    "country": "Kenya",
    "orderId": 10
  },
  {
    "id": "60ea94d3d5efdc75988d0a02",
    "email": "topyster.muga@gmail.com",
    "name": "Topyster Muga",
    "phoneNumber": "+254734377070",
    "status": "ACTIVE",
    "linkedInUrl": "http://linkedin.com/in/topyster-muga-8b204ab",
    "favouriteQuote": "To trust yourself to test your limits, that's the courage to succeed.",
    "biography": "Multi-awarding winning, Top 40 under 40 women in Kenya, Topy is the Founder and CEO of Prosper Mentor. She has a multi-national, multi-faceted career in technology spanning over 16 years in telecommunications, digital financial services and on-demand services having held a number of roles in strategy, operations, applications support, digital products and business transformation in Visa, Vodafone, Airtel and Barclays.",
    "profilePicUrl": "https://myprosper-email-assets.s3-eu-west-1.amazonaws.com/0b913452a70b4556b82c58b01707c95f.jpeg",
    "topics": [
      {
        "id": "60e26c2ba5a9f8402c1cf6b8",
        "name": "How to Write a Stellar CV"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b7",
        "name": "How to Advance My Career"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b9",
        "name": "How to Ace the Interview"
      }
    ],
    "occupation": "Founder and CEO| Digital Financial Services| On-Demand Services",
    "country": "Kenya",
    "orderId": 11
  },
  {
    "id": "646515c2b42b1d68dd4d6a8f",
    "email": "gichinga_gachuiri@yahoo.com",
    "name": "Amos Gachuiri",
    "phoneNumber": "+254722602966",
    "status": "ACTIVE",
    "linkedInUrl": "https://www.linkedin.com/in/amos-gachuiri-437a721b/",
    "favouriteQuote": "Learn. Build. Share. Repeat",
    "biography": "Amos is a board-level leader with over 20 years' experience as an investment professional with experience across Financial Services, SME finance, impact investing, and development finance. He is A Senior Manager, Investments at FSD Africa. He has led multiple projects across the investment life cycle and represents FSD Africa as an investor representative in several boards. He has worked with PwC,",
    "profilePicUrl": "https://my-prosper-public-assets.s3-eu-west-1.amazonaws.com/fc7d6f3eb56542569c6fefb028e5aac1.jpg",
    "topics": [
      {
        "id": "60e26c2aa5a9f8402c1cf6a5",
        "name": "My Personal Finance"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6bb",
        "name": "How to Negotiate the Best Deal"
      },
      {
        "id": "60e26c2aa5a9f8402c1cf6aa",
        "name": "How to Start a Business"
      }
    ],
    "occupation": "Investment Professional",
    "country": "Kenya",
    "orderId": 12
  }
]

// Icons
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Users,
  AlertCircle,
  X
} from 'lucide-vue-next'

// Components
import MentorCard from '@/components/ui/mentors/MentorCard.vue'
import MentorFilters from '@/components/ui/mentors/MentorFilters.vue'
import MentorSearchBar from '@/components/ui/mentors/MentorSearchBar.vue'
import MentorStats from '@/components/ui/mentors/MentorStats.vue'

definePageMeta({
  title: 'Find Mentors',
  description: 'Discover experienced mentors to accelerate your professional growth',
  requiresAuth: true,
  permissions: ['mentors:view']
})

// Store and Router
const mentorsStore = useMentorsStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Component State
const searchQuery = ref('')
const showFilters = ref(false)
const isInitialized = ref(false)

// Check permissions
const canViewMentors = computed(() => {
  const hasPermission = RoleManager.hasPermission(authStore.loggedInUser, 'mentors:view')
  console.log('🔐 Checking mentors:view permission:', hasPermission)
  console.log('🔐 Current user:', authStore.loggedInUser)
  console.log('🔐 User permissions:', RoleManager.getUserPermissions(authStore.loggedInUser))
  
  // For development: always return true
  return true // Temporarily bypass permission check
  // return hasPermission
})

const canSearchMentors = computed(() => 
  RoleManager.hasPermission(authStore.loggedInUser, 'mentors:search')
)

// Store computed properties
const {
  mentors,
  isLoading,
  isSearching,
  error,
  totalCount,
  hasMore,
  viewMode,
  hasActiveFilters,
  featuredMentors,
  trendingMentors,
  marketplaceStats,
  searchResults
} = storeToRefs(mentorsStore)

// Debug logging
watch(mentors, (newMentors) => {
  console.log('🎯 Mentors updated:', newMentors.length, newMentors)
}, { immediate: true })

watch(isLoading, (loading) => {
  console.log('⏳ Loading state:', loading)
}, { immediate: true })

watch(error, (err) => {
  console.log('❌ Error state:', err)
}, { immediate: true })

// Search functionality
const handleSearch = async (query: string) => {
  searchQuery.value = query
  await mentorsStore.searchMentors({ query, page: 1 })
}

const clearSearch = async () => {
  searchQuery.value = ''
  await mentorsStore.clearSearch()
}

// Sorting options
const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'newest', label: 'Newest' },
  { value: 'most_popular', label: 'Most Popular' }
]

const handleSortChange = async (sortBy: string) => {
  await mentorsStore.updateSort(sortBy as any)
}

const handleViewModeChange = (mode: 'grid' | 'list') => {
  mentorsStore.setViewMode(mode)
}

const loadMoreMentors = async () => {
  await mentorsStore.loadMoreMentors()
}

// Filter management
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const clearAllFilters = async () => {
  await mentorsStore.clearFilters()
}

// Quick filters
const quickFilters = [
  { label: 'Top Rated', filter: { rating: { min: 4.5 } } },
  { label: 'Verified', filter: { verificationStatus: ['verified'] } },
  { label: 'New Mentors', filter: { sortBy: 'newest' } }
]

const applyQuickFilter = async (filter: any) => {
  await mentorsStore.searchMentors({ ...filter, page: 1 })
}

// URL parameter handling
const initializeFromRoute = () => {
  const query = route.query.q as string
  const program = route.query.program as string
  const category = route.query.category as string
  
  if (query) {
    searchQuery.value = query
  }
  
  // Handle program filtering
  if (program || category) {
    console.log('🔍 Program/Category filter detected:', { program, category })
    // You can add program-specific filtering logic here
    // For now, we'll use the query to filter mentors
  }
}

// Watch for route changes
watch(() => route.query, () => {
  if (isInitialized.value) {
    initializeFromRoute()
  }
})

// Initialize component
onMounted(async () => {
  // Temporary development login - ensures we have a user
  if (!authStore.loggedInUser) {
    console.log('🔐 No logged in user, setting temporary dev user...')
    await authStore.login({
      username: "mentee@prospermentor.com",
      password: "any"
    })
  }

  // Direct API test - bypass store
  console.log('🧪 Testing mentorsApi directly...')
  try {
    const { default: mentorsApi } = await import('@/http/requests/app/mentors')
    console.log('🧪 mentorsApi imported:', !!mentorsApi)
    console.log('🧪 mentorsApi.discovery:', !!mentorsApi.discovery)
    
    if (mentorsApi.discovery) {
      const directResult = await mentorsApi.discovery.searchMentors({ page: 1, limit: 12 })
      console.log('🧪 Direct API call result:', directResult)
      console.log('🧪 Direct API mentors count:', directResult?.mentors?.length)
    }
  } catch (apiError) {
    console.error('🧪 Direct API test failed:', apiError)
  }

  if (!canViewMentors.value) {
    console.log('❌ User cannot view mentors, redirecting to dashboard')
    router.push('/app/dashboard')
    return
  }

  console.log('🚀 Initializing mentors page...')

  // Initialize from route params
  initializeFromRoute()

  try {
    // Initialize store if not already done
    console.log('🔄 Initializing store...')
    await mentorsStore.initializeStore()

    // Always use the provided dummy data
    console.log('🔍 Using provided dummy mentors data...')
    const transformedMentors = realMentorsData.map((mentor) => {
      const nameParts = (mentor.name || '').trim().split(' ')
      const lastName = nameParts.length > 1 ? (nameParts.pop() as string) : ''
      const firstName = nameParts.join(' ') || mentor.name || ''
      const expertiseAreas = (mentor.topics || []).map((t) => t.name)

      return {
        id: mentor.id,
        firstName,
        lastName,
        title: mentor.occupation || 'Professional Mentor',
        company: mentor.country || 'Kenya',
        industry: '',
        profilePhoto: mentor.profilePicUrl,
        profileSummary: mentor.biography || mentor.favouriteQuote || '',
        expertiseAreas,
        skills: expertiseAreas,
        averageRating: Math.round((4.6 + Math.random() * 0.6) * 10) / 10,
        totalReviews: Math.floor(Math.random() * 120) + 10,
        totalSessions: Math.floor(Math.random() * 200) + 50,
        hourlyRate: Math.floor(Math.random() * 40) + 20,
        currency: 'USD',
        responseTime: Math.floor(Math.random() * 36) + 12,
        responseRate: Math.floor(Math.random() * 10) + 90,
        verificationBadges: [],
        isAvailable: true,
        timezone: 'Africa/Nairobi',
        preferredSessionTypes: ['video_call', 'phone_call'],
        featured: false,
      }
    })

    mentorsStore.setSearchResults(transformedMentors)

    console.log('📊 Final mentors count:', mentors.value?.length || 'undefined')
    console.log('📊 mentors.value:', mentors.value)
    console.log('📊 searchResults.value:', searchResults.value)
    console.log('📊 mentorsStore.mentors:', mentorsStore.mentors)
  } catch (error) {
    console.error('❌ Error during initialization:', error)
    mentorsStore.state.error = 'Failed to load mentors. Please refresh the page.'
  }

  isInitialized.value = true
})

// Error handling
const dismissError = () => {
  mentorsStore.clearError()
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">

    <!-- Page Header -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Find Your Mentor</h1>
          <p class="text-muted-foreground">
            Connect with experienced professionals to accelerate your growth
          </p>
        </div>
        
        <!-- View Mode Toggle -->
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="handleViewModeChange('grid')"
            :class="{ 'bg-primary text-primary-foreground': viewMode === 'grid' }"
          >
            <Grid3X3 class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="handleViewModeChange('list')"
            :class="{ 'bg-primary text-primary-foreground': viewMode === 'list' }"
          >
            <List class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- Marketplace Stats -->
      <!-- <MentorStats v-if="marketplaceStats" :stats="marketplaceStats" /> -->
    </div>

    <!-- Search and Filters -->
    <Card>
      <CardContent class="p-6">
        <div class="space-y-4">
          <!-- Search Bar -->
          <MentorSearchBar
            v-model="searchQuery"
            :is-searching="isSearching"
            @search="handleSearch"
            @clear="clearSearch"
          />

          <!-- Quick Filters and Controls -->
          <div class="flex flex-wrap items-center gap-2">
            <!-- Quick Filter Chips -->
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="filter in quickFilters"
                :key="filter.label"
                variant="outline"
                size="sm"
                @click="applyQuickFilter(filter.filter)"
                class="text-xs"
              >
                {{ filter.label }}
              </Button>
            </div>

            <Separator orientation="vertical" class="h-6" />

            <!-- Filter Toggle -->
            <Button
              variant="outline"
              size="sm"
              @click="toggleFilters"
              :class="{ 'bg-primary text-primary-foreground': showFilters }"
            >
              <SlidersHorizontal class="h-4 w-4 mr-2" />
              Filters
              <Badge v-if="hasActiveFilters" variant="secondary" class="ml-2">
                {{ Object.values(mentorsStore.activeFilters).flat().length }}
              </Badge>
            </Button>

            <!-- Sort Dropdown -->
            <Select
              :model-value="mentorsStore.state.activeSort"
              @update:model-value="handleSortChange"
            >
              <SelectTrigger class="w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in sortOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <!-- Clear Filters -->
            <Button
              v-if="hasActiveFilters"
              variant="ghost"
              size="sm"
              @click="clearAllFilters"
            >
              <X class="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Error Alert -->
    <Alert v-if="error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertDescription class="flex items-center justify-between">
        {{ error }}
        <Button variant="ghost" size="sm" @click="dismissError">
          <X class="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>

    <div class="grid lg:grid-cols-4 gap-6">
      <!-- Filters Sidebar -->
      <div v-show="showFilters" class="lg:col-span-1">
        <Card class="sticky top-6">
          <CardHeader>
            <CardTitle class="flex items-center justify-between">
              <span>Filters</span>
              <Button
                variant="ghost"
                size="sm"
                @click="toggleFilters"
                class="lg:hidden"
              >
                <X class="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MentorFilters />
          </CardContent>
        </Card>
      </div>

      <!-- Main Content -->
      <div :class="showFilters ? 'lg:col-span-3' : 'lg:col-span-4'">
        <div class="space-y-6">
          <!-- Results Header -->
          <div v-if="!isLoading && mentors.length > 0" class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold">All Mentors</h2>
              <p class="text-sm text-muted-foreground">
                Showing {{ mentors.length }} of {{ totalCount }} mentors
              </p>
            </div>
          </div>

          <!-- Mentor Grid/List -->
          <div v-if="!isLoading && mentors.length > 0">

            <!-- Original mentor display -->
            <div 
              :class="{
                'grid gap-6': viewMode === 'grid',
                'grid-cols-1 md:grid-cols-2 xl:grid-cols-3': viewMode === 'grid',
                'space-y-4': viewMode === 'list'
              }"
            >
              <MentorCard
                v-for="mentor in mentors"
                :key="mentor.id"
                :mentor="mentor"
                :view-mode="viewMode"
                :is-favorite="mentorsStore.isFavorite(mentor.id)"
                @add-favorite="mentorsStore.addToFavorites"
                @remove-favorite="mentorsStore.removeFromFavorites"
              />
            </div>

            <!-- Load More Button -->
            <div v-if="hasMore" class="flex justify-center mt-8">
              <Button
                @click="loadMoreMentors"
                :disabled="isLoading"
                variant="outline"
                size="lg"
              >
                {{ isLoading ? 'Loading...' : 'Load More Mentors' }}
              </Button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-else-if="isLoading || isSearching" class="space-y-6">
            <div 
              :class="{
                'grid gap-6': viewMode === 'grid',
                'grid-cols-1 md:grid-cols-2 xl:grid-cols-3': viewMode === 'grid',
                'space-y-4': viewMode === 'list'
              }"
            >
              <Card v-for="i in 6" :key="i">
                <CardContent class="p-6">
                  <div class="space-y-4">
                    <div class="flex items-center space-x-4">
                      <Skeleton class="h-12 w-12 rounded-full" />
                      <div class="space-y-2">
                        <Skeleton class="h-4 w-32" />
                        <Skeleton class="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton class="h-20 w-full" />
                    <div class="flex space-x-2">
                      <Skeleton class="h-6 w-16" />
                      <Skeleton class="h-6 w-16" />
                      <Skeleton class="h-6 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <div class="space-y-4">
              <Users class="h-16 w-16 mx-auto text-muted-foreground" />
              <div class="space-y-2">
                <h3 class="text-lg font-semibold">No mentors found</h3>
                <p class="text-muted-foreground max-w-md mx-auto">
                  We couldn't find any mentors matching your criteria. 
                  Try adjusting your search or filters.
                </p>
              </div>
              <Button @click="clearSearch" variant="outline">
                Clear Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1400px;
}
</style> 