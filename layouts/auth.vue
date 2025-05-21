<template>
    <div class="min-h-screen bg-white flex flex-col">
      <!-- Main Content Area -->
      <main class="flex-grow flex items-center justify-center">
        <div class="w-full max-w-md px-4">
          <!-- Slot for page content -->
          <slot />
        </div>
      </main>
    </div>
  </template>
  
  <script setup>
  // No additional logic needed for basic auth layout
  </script>
  
  <style scoped>
  .min-h-screen {
    min-height: 100vh;
  }
  </style>