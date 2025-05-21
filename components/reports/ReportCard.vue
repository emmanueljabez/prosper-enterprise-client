<template>
  <div class="border rounded-lg overflow-hidden transition-all hover:shadow-md">
    <div class="p-4">
      <h3 class="font-semibold text-lg mb-1">{{ title }}</h3>
      <p class="text-sm text-muted-foreground mb-4">{{ description }}</p>

      <div class="flex items-center justify-between">
        <Button
            variant="outline"
            size="sm"
            @click="$emit('view')"
        >
          <EyeIcon class="h-4 w-4 mr-2" />
          View Report
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" class="h-8 w-8">
              <MoreVerticalIcon class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="$emit('download')">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem @click="$emit('schedule')">
              <CalendarIcon class="h-4 w-4 mr-2" />
              Schedule
            </DropdownMenuItem>
            <DropdownMenuItem @click="$emit('share')">
              <ShareIcon class="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</template>

<script setup>
import { EyeIcon, MoreVerticalIcon, DownloadIcon, CalendarIcon, ShareIcon } from 'lucide-vue-next';

defineProps({
  title: String,
  description: String,
  lastUpdated: String
});

defineEmits(['view', 'download', 'schedule', 'share']);
</script>