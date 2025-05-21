<template>
  <SheetContent class="sm:max-w-2xl overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Customer Details</SheetTitle>
      <SheetDescription>
        View information about {{ customer?.name }}
      </SheetDescription>
    </SheetHeader>

    <div v-if="!customer" class="flex justify-center items-center py-12">
      <Loader2Icon class="h-8 w-8 animate-spin text-primary" />
    </div>

    <div v-else class="space-y-6 py-6">
      <!-- Customer Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <Badge :variant="customer.status === 'active' ? 'success' : 'secondary'">
            {{ customer.status === 'active' ? 'Active' : 'Inactive' }}
          </Badge>
          <span class="text-sm text-muted-foreground">
            Customer since {{ formatDate(customer.createdAt) }}
          </span>
        </div>
        <div class="flex items-center space-x-2">
          <Button size="sm" variant="outline" @click="$emit('edit-customer', customer)">
            <EditIcon class="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
              size="sm"
              :variant="customer.status === 'active' ? 'destructive' : 'default'"
              @click="$emit('toggle-status', customer)"
          >
            <component
                :is="customer.status === 'active' ? BanIcon : CheckIcon"
                class="h-4 w-4 mr-2"
            />
            {{ customer.status === 'active' ? 'Deactivate' : 'Activate' }}
          </Button>
        </div>
      </div>

      <!-- Customer Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Personal Information -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl class="space-y-2">
              <div class="flex justify-between">
                <dt class="text-sm font-medium text-muted-foreground">Name:</dt>
                <dd class="text-sm">{{ customer.name }}</dd>
              </div>
              <div v-if="customer.company && customer.company !== customer.name" class="flex justify-between">
                <dt class="text-sm font-medium text-muted-foreground">Company:</dt>
                <dd class="text-sm">{{ customer.company }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm font-medium text-muted-foreground">Email:</dt>
                <dd class="text-sm">{{ customer.email }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm font-medium text-muted-foreground">Phone:</dt>
                <dd class="text-sm">{{ customer.phone }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm font-medium text-muted-foreground">Type:</dt>
                <dd class="text-sm">{{ customer.company ? 'Business' : 'Individual' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm font-medium text-muted-foreground">Status:</dt>
                <dd class="text-sm">{{ customer.status === 'active' ? 'Active' : 'Inactive' }}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <!-- Address Information -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl class="space-y-2">
              <div class="flex justify-between">
                <dt class="text-sm font-medium text-muted-foreground">Street:</dt>
                <dd class="text-sm">{{ customer.address?.street }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm font-medium text-muted-foreground">City:</dt>
                <dd class="text-sm">{{ customer.address?.city }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm font-medium text-muted-foreground">County:</dt>
                <dd class="text-sm">{{ customer.address?.state }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm font-medium text-muted-foreground">Postal Code:</dt>
                <dd class="text-sm">{{ customer.address?.zip }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm font-medium text-muted-foreground">Country:</dt>
                <dd class="text-sm">{{ customer.address?.country }}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <!-- Services -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle>Services</CardTitle>
          <Button size="sm" variant="ghost" @click="$emit('add-service', customer)">
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </CardHeader>
        <CardContent>
          <div v-if="!customer.services || customer.services.length === 0" class="text-center py-4">
            <PackageIcon class="h-10 w-10 mx-auto text-muted-foreground" />
            <p class="mt-2 text-sm text-muted-foreground">No services for this customer.</p>
            <Button size="sm" variant="outline" class="mt-2" @click="$emit('add-service', customer)">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add First Service
            </Button>
          </div>
          <div v-else>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Monthly Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="service in customer.services" :key="service.id">
                  <TableCell>{{ formatServiceType(service.type) }}</TableCell>
                  <TableCell>{{ service.plan }}</TableCell>
                  <TableCell>KES {{ service.monthlyCost.toLocaleString() }}</TableCell>
                  <TableCell>
                    <Badge :variant="service.status === 'active' ? 'success' : 'secondary'">
                      {{ service.status === 'active' ? 'Active' : 'Inactive' }}
                    </Badge>
                  </TableCell>
                  <TableCell>{{ formatDate(service.createdAt) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <!-- Notes -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="!customer.notes" class="text-center py-4">
            <FileTextIcon class="h-10 w-10 mx-auto text-muted-foreground" />
            <p class="mt-2 text-sm text-muted-foreground">No notes for this customer.</p>
            <Button size="sm" variant="ghost" class="mt-2" @click="$emit('edit-customer', customer)">
              <PencilIcon class="h-4 w-4 mr-2" />
              Add Notes
            </Button>
          </div>
          <div v-else>
            <p class="text-sm">{{ customer.notes }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <SheetFooter>
      <Button variant="outline" type="button" @click="$emit('close')">
        Close
      </Button>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { format, parseISO } from 'date-fns'
import {
  SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter
} from '@/components/ui/sheet'
import {
  Card, CardHeader, CardTitle, CardContent
} from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  EditIcon, BanIcon, CheckIcon, PlusIcon, PackageIcon,
  FileTextIcon, PencilIcon, Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  customer: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['edit-customer', 'toggle-status', 'add-service', 'close'])

// Methods
function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

function formatServiceType(type) {
  const types = {
    'fiber': 'Fiber Internet',
    'lte': 'LTE Wireless',
    'wimax': 'WiMAX',
    'dsl': 'DSL',
    'business': 'Business Dedicated',
    'satellite': 'Satellite'
  }
  return types[type] || type
}
</script>