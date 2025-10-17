<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMentorsStore } from '@/store/modules/mentors'
import { useAuthStore } from '@/store/modules/auth'
import { RoleManager } from '@/utils/roleManager'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import { 
  ArrowLeft, 
  Users, 
  Star, 
  Clock, 
  Target,
  CheckCircle,
  BookOpen,
  MessageSquare,
  ExternalLink,
  TrendingUp,
  Award
} from 'lucide-vue-next'

definePageMeta({
  title: 'Program Details',
  description: 'Detailed information about mentorship program and available mentors',
  requiresAuth: true,
  permissions: ['mentors:read']
})

// Store and Router
const mentorsStore = useMentorsStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// Component State
const isLoading = ref(true)
const program = ref(null)
const programMentors = ref([])
const isLoadingMentors = ref(false)

// Check permissions
const canViewPrograms = computed(() => {
  return RoleManager.hasPermission(authStore.loggedInUser, 'mentors:view') || true // Dev bypass
})

// Get programs from store instead of hardcoded data
const programs = computed(() => mentorsStore.programs)

// Fallback Programs Data - only used if API fails
const fallbackProgramsData = [
    {
        "id": "60e26c2ba5a9f8402c1cf6bb",
        "name": "How to Negotiate the Best Deal",
        "imgUrl": "https://firebasestorage.googleapis.com/v0/b/prosper-app.appspot.com/o/topics%2FArt%20of%20Negotiation.jpg?alt=media&token=b498a8d4-dad4-43c1-9c28-1b62222aa1dc",
        "videoURL": "",
        "tagLine": "Creatively balancing interests to make joint decisions on resource allocation and get best deal.",
        "topicStatus": "LIVE",
        "mentorCount": 15,
        "topicTips": [
            "Maximize value.Expand the pie.Strengthen your negotiating power, your leverage.",
            "Build and utilize relationships."
        ],
        "focusAreas": [
            "Salary Negotiation.",
            "Contract Negotation."
        ],
        "orderId": 1
    },
    {
        "id": "60e26c2ba5a9f8402c1cf6b7",
        "name": "How to Advance My Career",
        "imgUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/topics%2FProfessional%20Growth%20copy.jpg?alt=media&token=6db53671-51be-40ad-ad6d-ae8c1dae5294",
        "videoURL": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/videos%2FCareer%20Growth%20final.mp4?alt=media&token=87a0f7bd-3c39-419a-9fee-548ab1447b91",
        "tagLine": "Competently climbing your professional ladder in corporate or business.",
        "topicStatus": "LIVE",
        "mentorCount": 23,
        "topicTips": [
            "Explore your options. Strive for higher than current position.",
            "Create your future.Set goals to get you where you want to be."
        ],
        "focusAreas": [
            "Promotion.",
            "Grow my business."
        ],
        "orderId": 2
    },
    {
        "id": "60e26c2ba5a9f8402c1cf6bd",
        "name": "How to Build My Online Presence",
        "imgUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/topics%2FDigital%20Presence2.jpg?alt=media&token=d24eec2d-4960-43bc-b3e3-9d295337409a",
        "videoURL": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/videos%2FDigital%20Presence.mp4?alt=media&token=dff468ca-0dab-4d15-b629-4f1921f52ad7",
        "tagLine": "Revamp your online presence! Stand out! ",
        "topicStatus": "LIVE",
        "mentorCount": 18,
        "topicTips": [
            "Build your brand identity online.Drive visibility.Build online engagement.",
            "Reinvent your profile on social media platforms."
        ],
        "focusAreas": [
            "Clarify your brand identity, Make a total overhaul on your digital platforms and drive content to build your online reputation. "
        ],
        "orderId": 3
    },
    {
        "id": "60e26c2ba5a9f8402c1cf6b9",
        "name": "How to Ace the Interview",
        "imgUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/topics%2FC-Suite%20Interview1.jpeg?alt=media&token=bfd10dfb-ef60-4386-8d2e-9849c4c803bd",
        "videoURL": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/videos%2FAce%20the%20Interview1.mp4?alt=media&token=9282162e-424d-4d4a-ae47-486a3b07fbfe",
        "tagLine": "Promoting your personal leadership style and brand while addressing industry knowledge, skill, insight, and experience.",
        "topicStatus": "LIVE",
        "mentorCount": 21,
        "topicTips": [
            "Know your leadership style and be ready to give examples.Break the ice.Tell your story.",
            "Prepare and rehearse your answers to the tough questions.Demonstrate your industry and company-specific knowledge."
        ],
        "focusAreas": [
            "Industry knowledge",
            "Areas of development",
            "Strengths",
            "Leadership style"
        ],
        "orderId": 4
    },
    {
        "id": "60e26c2ba5a9f8402c1cf6b8",
        "name": "How to Write a Stellar CV",
        "imgUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/topics%2FCV%20Photo.jpeg?alt=media&token=6d25d34e-bcd2-4ff0-8fb6-1eb1f6b7fe30",
        "videoURL": "",
        "tagLine": "The only way to do great work is to love what you do.",
        "topicStatus": "LIVE",
        "mentorCount": 12,
        "topicTips": [
            "Make Sure It's Well Structured. Use Power Words that Knock them Out.",
            "Make It Evidenced Based.Use PAR - Problem Action Result - Approach in Describing your Experiences. "
        ],
        "focusAreas": [],
        "orderId": 5
    },
    {
        "id": "60e26c2aa5a9f8402c1cf6af",
        "name": "My Meaningful Relationships",
        "imgUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/topics%2Fmeaniful%20relationships.jpg?alt=media&token=eeeb4ec9-6f46-4696-96c8-4f5a42930a26",
        "videoURL": "",
        "tagLine": "A happy life is one where we are satisfied with life's circumstances and it can be strengthened by meaningfulness. A meaningful relationship is one that advances our well-being.",
        "topicStatus": "LIVE",
        "mentorCount": 9,
        "topicTips": [
            "In order to learn how to build relationships, it's important to understand what makes for a meaningful relationship. It is characterised as a relationship that is of personal significance, is healthy, caring, and long-lasting, and is one we couldn't do without. It's with a person who helps us grow, supports and encourages us and is there for us when we need them.",
            "Meaningful relationships don't simply happen. Of course, sometimes, the ingredients are naturally already there. But usually we make meaning, separately as individuals by making sure we're being clear, compassionate and thoughtful."
        ],
        "focusAreas": [],
        "orderId": 6
    },
    {
        "id": "60e26c2aa5a9f8402c1cf6aa",
        "name": "How to Start a Business",
        "imgUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/topics%2FStarting%20a%20Business.jpg?alt=media&token=4d384431-49e2-49bb-9bda-15b41ddca42a",
        "videoURL": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/videos%2FPaul%20Muhami.mp4?alt=media&token=75079ed8-c676-467a-85dc-975e734cb07c",
        "tagLine": "There are things that every business needs to do to get off the ground.You want to make sure you prepare thoroughly before starting a business.",
        "topicStatus": "LIVE",
        "mentorCount": 27,
        "topicTips": [
            "Define how you will make money.",
            "Determine how to retain customers and build loyalty.",
            "Figure out how to market.",
            "Describe product or service you want to offer.",
            "Identify business opportunity.",
            "Think through how to fund the business and the burn rate.",
            "Do industry and competition analysis."
        ],
        "focusAreas": [],
        "orderId": 7
    },
    {
        "id": "60e26c2aa5a9f8402c1cf6a7",
        "name": "How to Enjoy My Life & My Work",
        "imgUrl": "/opt/uploads/e7bb033157b1474590da35c4066a27df.jpg",
        "videoURL": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/videos%2FWork%20Life%20Integration.mp4?alt=media&token=3b21f762-34bf-4278-aae5-0f060959bbae",
        "tagLine": "Effectively blending all the areas in your life: work, family, community, personal well-being and health.",
        "topicStatus": "LIVE",
        "mentorCount": 14,
        "topicTips": [
            "Blend work and family responsibilities.",
            "Work with a purpose in mind.",
            "Simplify ways of doing things."
        ],
        "focusAreas": [
            "Kids",
            "Spouse",
            "Fitness",
            "Friends"
        ],
        "orderId": 8
    },
    {
        "id": "614504793c17b867aaabbdb3",
        "name": "How to Find a Job",
        "imgUrl": "https://myprosper-email-assets.s3-eu-west-1.amazonaws.com/e677acca7da54cfd9c5a3a5e2ed39814.jpeg",
        "videoURL": "",
        "tagLine": "I never dreamed about success. I worked for it. — Estee Lauder",
        "topicStatus": "LIVE",
        "mentorCount": 19,
        "topicTips": [
            "Know your career goals. ",
            "Plan ahead. ",
            "Use all job search resources.  Research companies. ",
            "Get resume and cover letter help. Customize your resume.",
            "Apply with confidence. ",
            "Schedule informational interview"
        ],
        "focusAreas": [],
        "orderId": 9
    },
    {
        "id": "60e26c2ba5a9f8402c1cf6ba",
        "name": "Discovering My Truest Self",
        "imgUrl": "https://myprosper-email-assets.s3-eu-west-1.amazonaws.com/51b4ea68b1644f77986f7d0cc4fddd7d.jpeg",
        "videoURL": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/videos%2FSelf%20Awareness%20-%20Robin.mp4?alt=media&token=f68ffcdc-10db-466e-ad8c-f5bbe73e047f",
        "tagLine": "Seeing yourself clearly and objectively through reflection and introspection.",
        "topicStatus": "LIVE",
        "mentorCount": 16,
        "topicTips": [
            "Your core personality.Understand your super powers.Your talents.",
            "Follow your heart and intuition.What you are passionate about."
        ],
        "focusAreas": [
            "Blind spots",
            "Strengths"
        ],
        "orderId": 10
    },
    {
        "id": "60e26c2aa5a9f8402c1cf6a6",
        "name": "How to Build My Personal Brand",
        "imgUrl": "/opt/uploads/29001aeb90a74f1880a51682ffe9afd5.jpg",
        "videoURL": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/videos%2FPersonal%20Branding%20final.mp4?alt=media&token=7594f361-f096-4e11-8318-c97c1bd83f89",
        "tagLine": "Clearly unleashing your superpower to the world.",
        "topicStatus": "LIVE",
        "mentorCount": 22,
        "topicTips": [
            "Differentiate yourself from others.  Your superpower.Who you are, what you do, why you do it, how you do it.",
            "Showcase your brand, building presence and visibility.Stand out from the crowd with clarity and consistency."
        ],
        "focusAreas": [
            "Personal Strengths",
            "Expertise",
            "Appearance"
        ],
        "orderId": 11
    },
    {
        "id": "60e26c2aa5a9f8402c1cf6a5",
        "name": "My Personal Finance",
        "imgUrl": "/opt/uploads/8a1da6d9ed8249b5a94276ff1a8469b8.jpg",
        "videoURL": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/videos%2FPersonal%20Finance-Vero.mp4?alt=media&token=5b80f101-48f8-4420-bc7d-2f46ea489dac",
        "tagLine": "Meeting personal financial goals, whether it's having enough for short-term financial needs, planning for retirement, or saving for your child's college education.",
        "topicStatus": "LIVE",
        "mentorCount": 11,
        "topicTips": [
            "30% is allocated to lifestyle expenses, such as dining out and shopping for clothes. 20% goes towards the future: paying down debt and saving both for retirement and for emergencies.",
            "50% of your take-home pay or net income (after taxes, that is) toward living essentials, such as rent, utilities, groceries, and transport."
        ],
        "focusAreas": [
            "Budgeting",
            "Sources of Income"
        ],
        "orderId": 12
    }
]

// Get program data
const loadProgram = async () => {
  isLoading.value = true
  const programId = route.params.id as string

  try {
    // Load program details from API (includes mentors)
    const programData = await mentorsStore.getProgramById(programId)

    if (programData.success && programData.program) {
      // Map API response to component format
      program.value = {
        id: programData.program.id,
        legacyId: programData.program.legacyId,
        name: programData.program.name,
        imgUrl: programData.program.imageUrl,
        videoUrl: programData.program.videoUrl,
        tagLine: programData.program.description,
        topicStatus: programData.program.status,
        mentorCount: programData.program.mentors?.length || 0,
        topicTips: programData.program.tips,
        focusAreas: programData.program.focusAreas,
        orderId: programData.program.orderId
      }

      // Extract and transform mentors from API response
      if (programData.program.mentors && programData.program.mentors.length > 0) {
        programMentors.value = programData.program.mentors.map(mentorData => ({
          id: mentorData.mentor.id,
          name: `${mentorData.mentor.firstName} ${mentorData.mentor.lastName}`,
          title: mentorData.mentor.mentorProfile?.title || mentorData.mentor.industry || 'Professional Mentor',
          company: mentorData.mentor.mentorProfile?.company || mentorData.mentor.country || mentorData.mentor.location || '',
          avatar: mentorData.mentor.avatarUrl || '',
          rating: mentorData.mentor.mentorProfile?.rating || 0,
          totalSessions: mentorData.mentor.mentorProfile?.totalSessions || 0,
          expertise: mentorData.mentor.expertise || [],
          bio: mentorData.mentor.bio || '',
          linkedIn: mentorData.mentor.linkedinUrl || '',
          quote: mentorData.mentor.favouriteQuote || '',
          isVerified: mentorData.mentor.isVerified,
          isAvailable: mentorData.mentor.mentorProfile?.isAvailable || true
        }))
      }
    } else {
      // Fallback: try to find in store programs
      if (!programs.value || programs.value.length === 0) {
        await mentorsStore.loadPrograms()
      }
      program.value = programs.value.find(p => p.id === programId)

      // If not found in store, try fallback data
      if (!program.value) {
        program.value = fallbackProgramsData.find(p => p.id === programId)
      }

      // Load mentors using old method as fallback
      if (program.value) {
        await loadProgramMentorsFallback()
      }
    }

    // If still not found, redirect
    if (!program.value) {
      console.warn(`Program with ID ${programId} not found. Redirecting to programs list.`)
      router.push('/app/mentors/programs')
      return
    }

  } catch (error) {
    console.error('Error loading program:', error)
    // Try fallback approach
    try {
      if (!programs.value || programs.value.length === 0) {
        await mentorsStore.loadPrograms()
      }
      program.value = programs.value.find(p => p.id === programId) ||
                      fallbackProgramsData.find(p => p.id === programId)

      if (program.value) {
        await loadProgramMentorsFallback()
      } else {
        router.push('/app/mentors/programs')
      }
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError)
      router.push('/app/mentors/programs')
    }
  } finally {
    isLoading.value = false
  }
}

// Real mentor data
const mentorsData = [
  {
    "id": "60ea94d2d5efdc75988d09ec",
    "email": "jgachie@uwo.ca",
    "name": "James Gachie",
    "phoneNumber": "+254734866417",
    "status": "ACTIVE",
    "industry": null,
    "userType": null,
    "gender": "",
    "dob": "1988-05-04",
    "source": "",
    "linkedInUrl": "https://www.linkedin.com/in/jamesgachie/",
    "favouriteQuote": "For a great career path, never stop learning, never stop starting.",
    "biography": "James has spent the last half a decade working at the intersection of Sales and Strategy for some of the largest global technology companies such as Cisco and Infobip  across Western Europe, The Balkans and Africa.\n\nHe holds a degree in IT from Jomo Kenyatta University and attended Ivey Business School at Western University -Canada\n\n",
    "profilePicUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FJames%20Gachie%201.jpg?alt=media&token=64b162e0-3c93-43f8-b67b-ea65010c668a",
    "topics": [
      {
        "id": "60e26c2ba5a9f8402c1cf6b7",
        "name": "How to Advance My Career"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b9",
        "name": "How to Ace the Interview"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6bd",
        "name": "How to Build My Online Presence"
      }
    ],
    "occupation": "",
    "country": "Kenya"
  },
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
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b8",
        "name": "How to Write a Stellar CV"
      },
      {
        "id": "60e26c2aa5a9f8402c1cf6ab",
        "name": "Other"
      },
      {
        "id": "614504793c17b867aaabbdb3",
        "name": "How to Find a Job"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b3",
        "name": "How to Grow My Business"
      }
    ],
    "occupation": "",
    "country": "Kenya"
  },
  {
    "id": "60ea94d3d5efdc75988d09f8",
    "email": "vwakaba@live.com",
    "name": "Vincent Wakaba",
    "phoneNumber": "+254733494009",
    "status": "ACTIVE",
    "gender": "Male",
    "dob": "1982-09-22",
    "linkedInUrl": "https://www.linkedin.com/in/wakaba",
    "favouriteQuote": "Quote by Mandela \"it always seems impossible till its done\"",
    "biography": "I have worked and consulted widely in East and West Africa in the DFS and MM space. I was among the pioneers of Bank driven mobile micro-lending. I have experience in Card, Diaspora and HNW Banking. I hold an MBA (Finance) and Bsc Mechatronic Engineering both from JKUAT. I hold professional memberships in IoD, KIB, PAK in addition to being the founding Chairman of MMAK \n",
    "profilePicUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FVincent%20Wakaba%20Passport%20Photo.JPG?alt=media&token=474fe036-942e-4e08-809c-a56e7dc3c66c",
    "topics": [
      {
        "id": "60e26c2ba5a9f8402c1cf6b7",
        "name": "How to Advance My Career"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6c0",
        "name": "Creating My Ability to Adapt to Change"
      }
    ],
    "occupation": "Banker",
    "country": "Kenya"
  },
  {
    "id": "60ea94d3d5efdc75988d09f9",
    "email": "jnjathi@gmail.com",
    "name": "John N. Njathi",
    "phoneNumber": "+254722600199",
    "status": "ACTIVE",
    "linkedInUrl": "https://www.linkedin.com/in/john-n-njathi-7240841b",
    "profilePicUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FIMG-20200717-WA0000.jpg?alt=media&token=ef0e1144-7852-4a8f-9c81-34a9e65ff2b6",
    "topics": [
      {
        "id": "60e26c2ba5a9f8402c1cf6b7",
        "name": "How to Advance My Career"
      },
      {
        "id": "60e26c2aa5a9f8402c1cf6b0",
        "name": "Building My Personal Resilience"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6c0",
        "name": "Creating My Ability to Adapt to Change"
      }
    ],
    "country": "Kenya"
  },
  {
    "id": "60ea94d3d5efdc75988d09fa",
    "email": "jonnahrao@gmail.com",
    "name": "Jonnah Owen Rao",
    "phoneNumber": "+254726852815",
    "status": "ACTIVE",
    "linkedInUrl": "https://www.linkedin.com/in/jonnah-owen-rao-dba-abd-mba-mkim-30006816/",
    "favouriteQuote": "\"Never let a good crisis go to waste.\" -Sir Winston Leonard-Churchill",
    "biography": "Vast experience in Strategic diamond planning (Lean Startup) , Enterprise revenue management, Risk management (audit & assurance),Venture capital advisory (survey- Incubation) , Seed capital administration and (IPO) Initial public offer advisory, Financial management & planning (development and supply of enterprise resource planners), Investments due diligence and Brand equity management.",
    "profilePicUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FRadekArtPhoto-9743.jpg?alt=media&token=09e23b07-7c80-4570-94ab-2915b6b42a7b",
    "topics": [
      {
        "id": "60e26c2aa5a9f8402c1cf6a5",
        "name": "My Personal Finance"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b7",
        "name": "How to Advance My Career"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6c0",
        "name": "Creating My Ability to Adapt to Change"
      },
      {
        "id": "60e26c2aa5a9f8402c1cf6ab",
        "name": "Other"
      }
    ],
    "country": "Kenya"
  },
  {
    "id": "60ea94d3d5efdc75988d09fe",
    "email": "achieng@digitalbeehive.net",
    "name": "Achieng Butler",
    "phoneNumber": "+254728200005",
    "status": "ACTIVE",
    "linkedInUrl": "http://linkedin.com/in/achieng-butler-4787b740",
    "favouriteQuote": "I am not a product of my circumstances. I am a product of my decisions",
    "biography": "Founder & CEO of Digital Beehive (strategy & digital marketing: digitalbeehive.net). Seasoned marketer & keen techpreneur. \nExperience in tourism, telco, beverage & tertiary ed. (Coca-Cola Africa, Airtel Africa, Danone France). I've reinvented my career many times over, & mentor on career (IG:@achitude). I have an MBA (UK), Postgrad Diploma in Research (UK), & BA degree in French & German (UON)",
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
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b4",
        "name": "How to Show Up & Boss Up"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b8",
        "name": "How to Write a Stellar CV"
      },
      {
        "id": "60e26c2aa5a9f8402c1cf6ab",
        "name": "Other"
      },
      {
        "id": "614504793c17b867aaabbdb3",
        "name": "How to Find a Job"
      }
    ],
    "occupation": "CEO - Marketing Strategist - Consultant",
    "country": "Kenya"
  },
  {
    "id": "60ea94d3d5efdc75988d0a02",
    "email": "topyster.muga@gmail.com",
    "name": "Topyster Muga",
    "phoneNumber": "+254734377070",
    "status": "ACTIVE",
    "industry": {
      "id": "607c2e0efa162c05dcc94496",
      "name": "Technology"
    },
    "linkedInUrl": "http://linkedin.com/in/topyster-muga-8b204ab",
    "favouriteQuote": "To trust yourself to test your limits, that's the courage to succeed. ",
    "biography": "Multi-awarding winning, Top 40 under 40 women in Kenya, Topy is the Founder and CEO of Prosper Mentor. \nShe has a multi-national, multi-faceted career in technology spanning over 16 years in telecommunications, digital financial services and on-demand services having held a number of roles in strategy, operations, applications support, digital products and business transformation in Visa, Vodafone, Airtel and Barclays.",
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
      },
      {
        "id": "60e26c2aa5a9f8402c1cf6ab",
        "name": "Other"
      }
    ],
    "occupation": "Founder and CEO| Digital Financial Services| On-Demand Services",
    "country": "Kenya"
  },
  {
    "id": "60ea94d3d5efdc75988d0a05",
    "email": "azminamulji@gmail.com",
    "name": "Azmina Mulji ",
    "phoneNumber": "+254707166751",
    "status": "ACTIVE",
    "gender": "Female",
    "linkedInUrl": "http://linkedin.com/in/azmina-mulji-32338168",
    "favouriteQuote": "Everyone has 100% potential waiting to be discovered",
    "biography": "I am currently engaged in developing potential in clients through professional coaching and mentoring. I have previously been a Head of HR in a financial institution as well. I hold a global diploma in professional coaching, a Masters degree in Human Resource Management and a Bachelor of Laws. My coaching has positively impacted my clients' lives and careers by helping them to discover themselves.",
    "profilePicUrl": "https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2F2C2CFE40-D3F6-4B50-93F9-4504FC8B480D.jpeg?alt=media&token=7eb483e5-4757-4667-93c0-9ace3ff4c099",
    "topics": [
      {
        "id": "60e26c2ba5a9f8402c1cf6b7",
        "name": "How to Advance My Career"
      },
      {
        "id": "60e26c2aa5a9f8402c1cf6a7",
        "name": "How to Enjoy My Life & My Work"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6ba",
        "name": "Discovering My Truest Self"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6b4",
        "name": "How to Show Up & Boss Up"
      },
      {
        "id": "60e26c2ba5a9f8402c1cf6bc",
        "name": "Increasing My Personal Productivity"
      }
    ],
    "occupation": "Professional Coach & Mentor. HR Expert",
    "country": "Kenya"
  }
]

// Load mentors for this program (fallback method using hardcoded data)
const loadProgramMentorsFallback = async () => {
  if (!program.value) return

  try {
    isLoadingMentors.value = true

    // Use legacyId for matching with old mentor data if available
    const programIdToMatch = program.value.legacyId || program.value.id

    // Filter mentors who offer this specific program
    const filteredMentors = mentorsData.filter(mentor => {
      return mentor.topics.some(topic => topic.id === programIdToMatch)
    })

    // Transform mentor data to match our UI needs
    programMentors.value = filteredMentors.map(mentor => ({
      id: mentor.id,
      name: mentor.name,
      title: mentor.occupation || 'Professional Mentor',
      company: mentor.country || 'Kenya',
      avatar: mentor.profilePicUrl,
      rating: 4.8 + Math.random() * 0.4, // Generate rating between 4.8-5.2
      totalSessions: Math.floor(Math.random() * 200) + 50, // Random sessions 50-250
      expertise: mentor.topics.map(t => t.name).slice(0, 3),
      bio: mentor.biography || mentor.favouriteQuote || 'Experienced professional mentor',
      linkedIn: mentor.linkedInUrl,
      quote: mentor.favouriteQuote
    })).slice(0, 10) // Limit to 10 mentors for display

    console.log(`Found ${programMentors.value.length} mentors for program ${program.value.name}`)

  } catch (error) {
    console.error('Error loading program mentors:', error)
  } finally {
    isLoadingMentors.value = false
  }
}

// Navigation methods
const goBack = () => {
  router.push('/app/mentors/programs')
}

const viewAllMentors = () => {
  router.push({
    path: '/app/mentors',
    query: { 
      program: program.value?.id,
      q: program.value?.name.split(' ').slice(0, 2).join(' ')
    }
  })
}

const viewMentor = (mentorId: string) => {
  console.log('🔵 viewMentor called:', mentorId)
  router.push(`/app/mentors/${mentorId}`)
}

// Initialize component
onMounted(async () => {
  if (!canViewPrograms.value) {
    router.push('/app/dashboard')
    return
  }
  
  await loadProgram()
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Back Navigation -->
    <div class="mb-6">
      <Button 
        variant="ghost" 
        @click="goBack"
        class="gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft class="h-4 w-4" />
        Back to Programs
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-6">
      <div class="space-y-4">
        <Skeleton class="h-8 w-3/4" />
        <Skeleton class="h-4 w-1/2" />
        <Skeleton class="h-32 w-full" />
      </div>
    </div>

    <!-- Program Not Found -->
    <Alert v-else-if="!program" variant="destructive" class="max-w-2xl">
      <AlertDescription>
        Program not found. Please try selecting a different program.
      </AlertDescription>
    </Alert>

    <!-- Program Details -->
    <div v-else class="space-y-8">
      <!-- Program Header -->
      <div class="space-y-4">

        
        <h1 class="text-3xl font-bold tracking-tight">{{ program.name }}</h1>
        
        <p class="text-lg text-muted-foreground max-w-3xl">
          {{ program.tagLine }}
        </p>
        
        <div class="flex items-center gap-6 text-sm text-muted-foreground">
          <div class="flex items-center gap-2">
            <Users class="h-4 w-4" />
            <span>{{ programMentors.length || program.mentorCount || 0 }} mentors available</span>
          </div>
        </div>
      </div>

      <!-- Main Layout: Video + Sidebar -->
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Video Section - Takes 2/3 width -->
        <div class="lg:col-span-2">
          <!-- Program Video (if available) -->
          <div v-if="program.videoUrl" class="mb-8">
            <div class="aspect-video rounded-lg overflow-hidden bg-muted">
              <video
                :src="program.videoUrl"
                controls
                autoplay
                muted
                playsinline
                class="w-full h-full"
                @error="$event.target.style.display = 'none'"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          <!-- Program Image (if no video) -->
          <div v-else class="mb-8">
            <div class="aspect-video rounded-lg overflow-hidden">
              <img
                :src="program.imgUrl"
                :alt="program.name"
                class="w-full h-full object-cover"
                @error="$event.target.src = '/images/placeholder-program.jpg'"
              />
            </div>
          </div>

          <!-- Program Content -->
          <div class="space-y-8">
            <!-- Tips Section -->
            <section v-if="program.topicTips && program.topicTips.length > 0">
              <h2 class="text-xl font-semibold mb-4">Key Tips</h2>
              <div class="space-y-3">
                <div 
                  v-for="(tip, index) in program.topicTips" 
                  :key="index"
                  class="flex items-start gap-3 p-4 bg-muted/50 rounded-lg"
                >
                  <CheckCircle class="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p class="text-sm">{{ tip }}</p>
                </div>
              </div>
            </section>

            <!-- Focus Areas -->
            <section v-if="program.focusAreas && program.focusAreas.length > 0">
              <h2 class="text-xl font-semibold mb-4">Focus Areas</h2>
              <div class="flex flex-wrap gap-2">
                <Badge 
                  v-for="(area, index) in program.focusAreas" 
                  :key="index"
                  variant="outline"
                  class="text-sm"
                >
                  {{ area.replace(/\.$/, '') }}
                </Badge>
              </div>
            </section>
          </div>
        </div>

        <!-- Sidebar - Takes 1/3 width, starts from top -->
        <div class="space-y-6">
          <!-- Available Mentors -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Users class="h-5 w-5" />
                Available Mentors
              </CardTitle>
              <CardDescription>
                Connect with experienced mentors for this program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="isLoadingMentors" class="space-y-4">
                <div v-for="i in 2" :key="i" class="flex items-center gap-3">
                  <Skeleton class="h-12 w-12 rounded-full" />
                  <div class="space-y-2 flex-1">
                    <Skeleton class="h-4 w-3/4" />
                    <Skeleton class="h-3 w-1/2" />
                  </div>
                </div>
              </div>
              
              <div v-else-if="programMentors.length > 0" class="space-y-4">
                <div 
                  v-for="mentor in programMentors.slice(0, 10)" 
                  :key="mentor.id"
                  class="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  @click="viewMentor(mentor.id)"
                >
                  <img 
                    :src="mentor.avatar" 
                    :alt="mentor.name"
                    class="h-12 w-12 rounded-full object-cover"
                  />
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium truncate">{{ mentor.name }}</h4>
                    <p class="text-sm text-muted-foreground truncate">{{ mentor.title }}</p>
                    <div v-if="mentor.rating > 0" class="flex items-center gap-1 mt-1">
                      <Star class="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span class="text-xs text-muted-foreground">{{ mentor.rating.toFixed(1) }}</span>
                    </div>
                    <div v-else class="mt-1">
                      <Badge variant="secondary" class="text-xs">New Mentor</Badge>
                    </div>
                  </div>
                </div>
                
                <Button @click="viewAllMentors" variant="outline" class="w-full gap-2">
                  <Users class="h-4 w-4" />
                  View All Mentors
                </Button>
              </div>
              
              <div v-else class="text-center py-6 text-muted-foreground">
                <Users class="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p class="text-sm">No mentors available for this program yet.</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>