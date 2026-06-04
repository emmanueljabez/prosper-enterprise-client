<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#app'
import { Button } from '@/components/ui/button'
import AuthSplitShell from '@/components/auth/AuthSplitShell.vue'

definePageMeta({ auth: false })

const route = useRoute()

const email = computed(() => String(route.query.email || '').trim())
</script>

<template>
  <AuthSplitShell>
    <div class="grid gap-3 text-center">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f7e7f5] text-[#a03b93]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25V6.75Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="m5 7 6.2 5.1a1.25 1.25 0 0 0 1.6 0L19 7" />
        </svg>
      </div>

      <p class="text-xl font-semibold">
        Check your email
      </p>
      <p class="text-sm leading-6 text-muted-foreground">
        We have created your company account{{ email ? ` for ${email}` : '' }}.
        Verify your email first, then sign in to buy sessions and activate your workspace.
      </p>
    </div>

    <div class="grid gap-3">
      <NuxtLink to="/auth/login">
        <Button type="button" class="w-full" style="background-color:#a03b93">
          Go to login
        </Button>
      </NuxtLink>

      <NuxtLink to="/pricing" class="text-center text-sm underline">
        Back to pricing
      </NuxtLink>
    </div>
  </AuthSplitShell>
</template>
