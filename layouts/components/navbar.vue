<template>
  <div class="w-full flex items-center gap-4">
    <Sheet>
      <SheetTrigger as-child>
        <Button variant="outline" size="icon" class="shrink-0 md:hidden">
          <Menu class="h-5 w-5" />
          <span class="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
    </Sheet>

    <!-- Search Bar -->
    <div class="flex-1 max-w-xl">
      <Popover>
        <PopoverTrigger asChild>
          <div class="relative w-full">
            <Input type="search" placeholder="Search..." class="w-full pl-10" />
            <Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </PopoverTrigger>
        <PopoverContent class="w-[400px] p-4">
          <Command>
            <CommandInput placeholder="Search anything..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>

    <div class="navbar-items flex items-center justify-end gap-4">
      

      <!-- My Applications -->
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary" size="icon" class="rounded-full">
            <LayoutGrid class="h-5 w-5" />
            <span class="sr-only">Applications</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-[300px] p-4">
          <h4 class="mb-4 text-sm font-medium text-center">My Applications</h4>
          <div class="grid grid-cols-2 gap-4">
            <NuxtLink
              class="flex flex-col items-center p-3 rounded-lg hover:bg-muted cursor-pointer border border-gray-200">
              <MessageCircle class="h-8 w-8 mb-2" />
              <span class="text-sm text-center">WhatsApp</span>
            </NuxtLink>
            <NuxtLink
              class="flex flex-col items-center p-3 rounded-lg hover:bg-muted cursor-pointer border border-gray-200">
              <Boxes class="h-8 w-8 mb-2" />
              <span class="text-sm text-center">Assets & Inventory</span>
            </NuxtLink>
            <NuxtLink
              class="flex flex-col items-center p-3 rounded-lg hover:bg-muted cursor-pointer border border-gray-200">
              <Server class="h-8 w-8 mb-2" />
              <span class="text-sm text-center">OLT</span>
            </NuxtLink>
            <NuxtLink
                      class="flex flex-col items-center p-3 rounded-lg hover:bg-muted cursor-pointer border border-gray-200">
              <BadgeDollarSign class="h-8 w-8 mb-2" />
              <span class="text-sm text-center">Pcash</span>
            </NuxtLink>
          </div>
        </PopoverContent>
      </Popover>

      <!-- Notifications -->
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary" size="icon" class="rounded-full">
            <BellRing class="h-5 w-5" />
            <span class="sr-only">Notifications</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-[300px] p-0">
          <div class="flex flex-col">
            <div class="p-4 border-b">
              <h4 class="text-sm font-medium">Notifications</h4>
            </div>
            <ScrollArea className="h-[300px]">
              <div class="p-4">
                <p class="text-sm text-muted-foreground">No new notifications</p>
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>

      <!-- User Menu -->
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" class="rounded-full">
            <User2 class="h-5 w-5" />
            <span class="sr-only">User menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <NuxtLink  @click="logout">Logout</NuxtLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Menu,
  User2,
  BellRing,
  Search,
  LayoutGrid,
  MessageCircle,
  Boxes,
  Server,
  BarChart2,
  BadgeDollarSign
} from 'lucide-vue-next'
import { useAuthStore } from '@/store/modules/auth'
import { useToast } from '@/components/ui/toast'


const authStore = useAuthStore()
const { toast }= useToast()

const logout = async () => {
  try {
    await authStore.signOut()
    // const message = 'Login successful!'
    //   toast({
    //     title: 'Success',
    //     description: message,
    //     variant: 'success',
    //   })
  } catch (error: any) {
    console.error(error)
    // const errorMessage = 'Logout failed'
    // toast({
    //   title: 'Error',
    //   description: errorMessage,
    //   variant: 'destructive',
    // })
  }
}
</script>

<style scoped>
.navbar-items {
  position: fixed;
  right: 1.5rem;
  top: 1rem;
  width: auto;
  z-index: 50;
  background-color: transparent;
  display: flex;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .navbar-items {
    position: relative;
    right: auto;
    top: auto;
  }
}
</style>