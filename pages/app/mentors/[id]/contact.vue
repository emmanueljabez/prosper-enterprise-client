<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-vue-next'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()

const mentorId = route.params.id
const goBack = () => router.go(-1)
</script>

<template>
  <div class="container mx-auto px-4 py-6 max-w-4xl">
    <Button variant="ghost" @click="goBack" class="mb-4">
      <ArrowLeft class="h-4 w-4 mr-2" />
      Back to Profile
    </Button>

    <Card>
      <CardHeader>
        <CardTitle>Contact Mentor</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-muted-foreground">
          Contact functionality for mentor {{ mentorId }} will be implemented here.
        </p>
      </CardContent>
    </Card>
  </div>
</template> 