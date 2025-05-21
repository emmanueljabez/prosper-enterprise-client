<template>
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
        <p class="text-muted-foreground mt-1">
          {{ description }}
        </p>
      </div>
  
      <div class="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <SettingsIcon class="h-4 w-4 mr-2" />
              Catalog Settings
              <ChevronDownIcon class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="handleManageCategories">
              <TagIcon class="h-4 w-4 mr-2" />
              Manage Categories
            </DropdownMenuItem>
            <DropdownMenuItem @click="handleManageServiceAreas">
              <MapPinIcon class="h-4 w-4 mr-2" />
              Service Area Manager
            </DropdownMenuItem>
            <DropdownMenuItem @click="handleManagePromotions">
              <PercentIcon class="h-4 w-4 mr-2" />
              Promotion Manager
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="handleExportCatalog('csv')">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Export Catalog
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
  
        <Button @click="handleAddProduct" variant="default">
          <PlusIcon class="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { 
    SettingsIcon, 
    ChevronDownIcon, 
    TagIcon, 
    MapPinIcon, 
    PercentIcon, 
    DownloadIcon, 
    PlusIcon 
  } from 'lucide-vue-next'
  
  import { Button } from '@/components/ui/button'
  import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
  } from '@/components/ui/dropdown-menu'
  
  // Define props
  const props = defineProps({
    title: {
      type: String,
      default: 'Product Catalog'
    },
    description: {
      type: String,
      default: 'Manage all service plans, hardware offerings, and promotional bundles'
    }
  })
  
  // Define emits
  const emit = defineEmits([
    'manage-categories',
    'manage-service-areas',
    'manage-promotions',
    'export-catalog',
    'add-product'
  ])
  
  // Event handler functions
  const handleManageCategories = () => {
    emit('manage-categories')
  }
  
  const handleManageServiceAreas = () => {
    emit('manage-service-areas')
  }
  
  const handleManagePromotions = () => {
    emit('manage-promotions')
  }
  
  const handleExportCatalog = (format) => {
    emit('export-catalog', format)
  }
  
  const handleAddProduct = () => {
    emit('add-product')
  }
  </script>