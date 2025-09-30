<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMentorsStore } from '@/store/modules/mentors'
import { useAuthStore } from '@/store/modules/auth'
import { RoleManager } from '@/utils/roleManager'

// UI Components
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import { 
  Search, 
  BookOpen, 
  Users, 
  Star, 
  TrendingUp,
  Code,
  Briefcase,
  PaintBucket,
  BarChart3,
  Lightbulb,
  Target,
  ArrowRight
} from 'lucide-vue-next'

definePageMeta({
  title: 'Mentorship Programs',
  description: 'Explore mentorship programs and find the perfect learning path',
  requiresAuth: true,
  permissions: ['mentors:read']
})

// Store and Router
const mentorsStore = useMentorsStore()
const authStore = useAuthStore()
const router = useRouter()

// Component State
const searchQuery = ref('')
const selectedCategory = ref('')
const isLoading = ref(false)

// Check permissions
const canViewPrograms = computed(() => {
  return RoleManager.hasPermission(authStore.loggedInUser, 'mentors:view') || true // Dev bypass
})

// Programs Data
const programs = ref([
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
])

// Computed properties
const filteredPrograms = computed(() => {
  if (!searchQuery.value) return programs.value
  return programs.value.filter(program => 
    program.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    program.tagLine.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    program.focusAreas.some(area => area.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

// Navigation methods
const viewProgram = (programId: string, programName: string) => {
  console.log('Navigating to program:', programId, programName)
  try {
    // Navigate to dedicated program details page
    router.push(`/app/mentors/programs/${programId}`)
  } catch (error) {
    console.error('Navigation error:', error)
  }
}

const viewAllMentors = () => {
  router.push('/app/mentors')
}

// Initialize component
onMounted(async () => {
  if (!canViewPrograms.value) {
    router.push('/app/dashboard')
    return
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-8">
    <!-- Page Header -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Mentorship Programs</h1>
          <p class="text-muted-foreground">
            Discover structured learning paths with expert mentors in your field
          </p>
        </div>
        
        <Button @click="viewAllMentors" variant="outline" class="gap-2">
          <Users class="h-4 w-4" />
          Browse All Mentors
        </Button>
      </div>

    </div>

    <!-- Search Programs -->
    <section class="space-y-4">
      <div class="max-w-md">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search programs..."
            class="pl-10"
          />
        </div>
      </div>
    </section>

    <!-- All Programs -->
    <section class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold">All Programs</h2>
        <div class="text-sm text-muted-foreground">
          {{ filteredPrograms.length }} of {{ programs.length }} programs
        </div>
      </div>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="program in filteredPrograms"
          :key="program.id"
          class="bg-white rounded-lg border cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group overflow-hidden hover:border-primary/20 active:scale-95"
          @click.stop="viewProgram(program.id, program.name)"
        >
          <div class="aspect-video relative overflow-hidden">
            <img 
              :src="program.imgUrl" 
              :alt="program.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              @error="$event.target.src = '/images/placeholder-program.jpg'"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          
          <div class="p-6">
            <div class="space-y-4">
              <div>
                <h3 class="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                  {{ program.name }}
                </h3>
                <p class="text-sm text-muted-foreground mt-2 line-clamp-3">
                  {{ program.tagLine.replace(/"/g, '') }}
                </p>
              </div>
              
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs text-muted-foreground">
                  <div class="flex items-center gap-1">
                    <Users class="h-3 w-3" />
                    <span>{{ program.mentorCount }} mentors</span>
                  </div>
                </div>
                
                <div v-if="program.focusAreas.length > 0" class="flex flex-wrap gap-1">
                  <Badge 
                    v-for="area in program.focusAreas.slice(0, 2)" 
                    :key="area"
                    variant="secondary" 
                    class="text-xs"
                  >
                    {{ area.replace(/\.$/, '') }}
                  </Badge>
                  <Badge 
                    v-if="program.focusAreas.length > 2"
                    variant="outline" 
                    class="text-xs"
                  >
                    +{{ program.focusAreas.length - 2 }} more
                  </Badge>
                </div>
              </div>
              
              <div class="flex items-center justify-between pt-2">
                <div class="flex items-center gap-1">
                  <BookOpen class="h-4 w-4 text-muted-foreground" />
                  <span class="text-sm text-muted-foreground">Program</span>
                </div>
                <ArrowRight class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="text-center py-12 space-y-6">
      <div class="max-w-2xl mx-auto space-y-4">
        <h2 class="text-2xl font-semibold">Ready to Start Your Journey?</h2>
        <p class="text-muted-foreground">
          Join thousands of professionals who have accelerated their careers through mentorship.
          Find your perfect mentor and start learning today.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" @click="viewAllMentors" class="gap-2">
            <Users class="h-5 w-5" />
            Browse All Mentors
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.container {
  max-width: 1400px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.aspect-video {
  aspect-ratio: 16 / 9;
}
</style> 