<!-- filepath: c:\Users\user\Documents\pcash-inventory\pcash-inventory\components\warehouse\shipping\PrintShippingLabelDialog.vue -->
<template>
  <DialogContent class="sm:max-w-[700px]">
    <DialogHeader>
      <DialogTitle>Print Shipping Label</DialogTitle>
      <DialogDescription>
        Generate and print shipping label for order #{{ order.orderNumber }}
      </DialogDescription>
    </DialogHeader>

    <div class="grid gap-6 py-4">
      <!-- Step Navigation -->
      <div class="w-full flex items-center">
        <div class="w-full flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            class="flex flex-col items-center"
            :class="currentStep === 'details' ? 'text-primary' : 'text-muted-foreground'"
            @click="currentStep = 'details'"
          >
            <div class="flex items-center justify-center h-8 w-8 rounded-full border mb-1" 
                 :class="currentStep === 'details' ? 'border-primary bg-primary/10' : 'border-muted'">
              <ClipboardIcon class="h-4 w-4" />
            </div>
            <span class="text-xs">Shipping Details</span>
          </Button>
          <div class="h-px bg-muted flex-1 mx-1"></div>
          <Button
            variant="ghost"
            size="sm"
            class="flex flex-col items-center"
            :class="currentStep === 'package' ? 'text-primary' : 'text-muted-foreground'"
            @click="isValidShipping ? currentStep = 'package' : null"
            :disabled="!isValidShipping"
          >
            <div class="flex items-center justify-center h-8 w-8 rounded-full border mb-1"
                 :class="currentStep === 'package' ? 'border-primary bg-primary/10' : 'border-muted'">
              <PackageIcon class="h-4 w-4" />
            </div>
            <span class="text-xs">Package Details</span>
          </Button>
          <div class="h-px bg-muted flex-1 mx-1"></div>
          <Button
            variant="ghost"
            size="sm"
            class="flex flex-col items-center"
            :class="currentStep === 'preview' ? 'text-primary' : 'text-muted-foreground'"
            @click="isValidPackage ? currentStep = 'preview' : null"
            :disabled="!isValidPackage"
          >
            <div class="flex items-center justify-center h-8 w-8 rounded-full border mb-1"
                 :class="currentStep === 'preview' ? 'border-primary bg-primary/10' : 'border-muted'">
              <FileTextIcon class="h-4 w-4" />
            </div>
            <span class="text-xs">Preview & Print</span>
          </Button>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="flex items-center justify-between p-3 rounded-md bg-muted/50">
        <div>
          <p class="text-sm font-medium">Order #{{ order.orderNumber }}</p>
          <p class="text-xs text-muted-foreground">
            {{ order.items.length }} items • {{ formatDate(order.orderDate) }}
          </p>
        </div>
        <Badge :variant="getOrderStatusVariant(order.status)">
          {{ order.status }}
        </Badge>
      </div>

      <!-- Shipping Details Step -->
      <div v-if="currentStep === 'details'" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="carrier">Shipping Carrier *</Label>
            <Select v-model="labelData.carrier">
              <SelectTrigger id="carrier">
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ups">UPS</SelectItem>
                <SelectItem value="fedex">FedEx</SelectItem>
                <SelectItem value="usps">USPS</SelectItem>
                <SelectItem value="dhl">DHL</SelectItem>
                <SelectItem value="ontrac">OnTrac</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.carrier" class="text-destructive text-xs">{{ errors.carrier }}</p>
          </div>

          <div class="space-y-2">
            <Label for="service">Shipping Service *</Label>
            <Select v-model="labelData.service">
              <SelectTrigger id="service">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup v-if="labelData.carrier === 'usps'">
                  <SelectLabel>USPS Services</SelectLabel>
                  <SelectItem value="priority">Priority Mail</SelectItem>
                  <SelectItem value="first_class">First Class</SelectItem>
                  <SelectItem value="ground">Ground</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                </SelectGroup>
                <SelectGroup v-else-if="labelData.carrier === 'ups'">
                  <SelectLabel>UPS Services</SelectLabel>
                  <SelectItem value="ground">Ground</SelectItem>
                  <SelectItem value="3day">3-Day Select</SelectItem>
                  <SelectItem value="2day">2-Day Air</SelectItem>
                  <SelectItem value="nextday">Next Day Air</SelectItem>
                </SelectGroup>
                <SelectGroup v-else-if="labelData.carrier === 'fedex'">
                  <SelectLabel>FedEx Services</SelectLabel>
                  <SelectItem value="ground">Ground</SelectItem>
                  <SelectItem value="express_saver">Express Saver</SelectItem>
                  <SelectItem value="2day">2Day</SelectItem>
                  <SelectItem value="priority">Priority Overnight</SelectItem>
                </SelectGroup>
                <SelectGroup v-else>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p v-if="errors.service" class="text-destructive text-xs">{{ errors.service }}</p>
          </div>

          <div class="space-y-2 col-span-2">
            <div class="flex items-center justify-between">
              <Label>Shipping Address</Label>
              <Button 
                variant="outline" 
                size="sm" 
                @click="editingAddress = !editingAddress"
              >
                <PencilIcon v-if="!editingAddress" class="h-3 w-3 mr-1" />
                <CheckIcon v-else class="h-3 w-3 mr-1" />
                {{ editingAddress ? 'Done Editing' : 'Edit Address' }}
              </Button>
            </div>

            <div v-if="!editingAddress" class="p-3 border rounded-md space-y-1">
              <p class="font-medium">{{ labelData.address.name }}</p>
              <p v-if="labelData.address.company" class="text-sm">{{ labelData.address.company }}</p>
              <p class="text-sm">{{ labelData.address.line1 }}</p>
              <p v-if="labelData.address.line2" class="text-sm">{{ labelData.address.line2 }}</p>
              <p class="text-sm">
                {{ labelData.address.city }}, {{ labelData.address.state }} {{ labelData.address.postalCode }}
              </p>
              <p class="text-sm">{{ labelData.address.country }}</p>
              <p v-if="labelData.address.phone" class="text-sm text-muted-foreground mt-1">
                {{ labelData.address.phone }}
              </p>
            </div>

            <div v-else class="grid grid-cols-2 gap-2 p-3 border rounded-md">
              <div class="space-y-2">
                <Label for="name">Full Name *</Label>
                <Input id="name" v-model="labelData.address.name" />
              </div>
              <div class="space-y-2">
                <Label for="company">Company</Label>
                <Input id="company" v-model="labelData.address.company" />
              </div>
              <div class="col-span-2 space-y-2">
                <Label for="line1">Address Line 1 *</Label>
                <Input id="line1" v-model="labelData.address.line1" />
              </div>
              <div class="col-span-2 space-y-2">
                <Label for="line2">Address Line 2</Label>
                <Input id="line2" v-model="labelData.address.line2" />
              </div>
              <div class="space-y-2">
                <Label for="city">City *</Label>
                <Input id="city" v-model="labelData.address.city" />
              </div>
              <div class="space-y-2">
                <Label for="state">State/Province *</Label>
                <Input id="state" v-model="labelData.address.state" />
              </div>
              <div class="space-y-2">
                <Label for="postalCode">Postal Code *</Label>
                <Input id="postalCode" v-model="labelData.address.postalCode" />
              </div>
              <div class="space-y-2">
                <Label for="country">Country *</Label>
                <Input id="country" v-model="labelData.address.country" />
              </div>
              <div class="space-y-2 col-span-2">
                <Label for="phone">Phone Number</Label>
                <Input id="phone" v-model="labelData.address.phone" />
              </div>
            </div>
            <p v-if="errors.address" class="text-destructive text-xs">{{ errors.address }}</p>
          </div>

          <div class="space-y-2 col-span-2">
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="residential" 
                v-model:checked="labelData.residentialAddress" 
              />
              <Label for="residential">Residential Address</Label>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-2">
          <Button variant="outline" @click="$emit('close')">Cancel</Button>
          <Button 
            variant="default" 
            @click="validateShippingAndContinue"
          >
            Continue to Package Details
            <ArrowRightIcon class="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- Package Details Step -->
      <div v-if="currentStep === 'package'" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="packageType">Package Type *</Label>
            <Select v-model="labelData.packageType">
              <SelectTrigger id="packageType">
                <SelectValue placeholder="Select package type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Box Sizes</SelectLabel>
                  <SelectItem value="small_box">Small Box</SelectItem>
                  <SelectItem value="medium_box">Medium Box</SelectItem>
                  <SelectItem value="large_box">Large Box</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Other Packaging</SelectLabel>
                  <SelectItem value="envelope">Envelope</SelectItem>
                  <SelectItem value="poly_mailer">Poly Mailer</SelectItem>
                  <SelectItem value="tube">Tube</SelectItem>
                  <SelectItem value="custom">Custom Package</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p v-if="errors.packageType" class="text-destructive text-xs">{{ errors.packageType }}</p>
          </div>
          
          <div class="space-y-2">
            <Label for="weight">Weight (lbs) *</Label>
            <div class="flex">
              <Input 
                id="weight" 
                v-model="labelData.weight" 
                type="number" 
                min="0.1" 
                step="0.1"
                placeholder="Enter weight" 
              />
              <Select v-model="labelData.weightUnit" class="w-[90px] ml-2">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lb">lbs</SelectItem>
                  <SelectItem value="oz">oz</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p v-if="errors.weight" class="text-destructive text-xs">{{ errors.weight }}</p>
          </div>

          <div 
            v-if="labelData.packageType === 'custom'" 
            class="col-span-2 space-y-2"
          >
            <Label>Package Dimensions</Label>
            <div class="grid grid-cols-3 gap-2">
              <div class="space-y-1">
                <Label for="length" class="text-xs">Length</Label>
                <Input id="length" v-model="labelData.dimensions.length" type="number" min="0.1" step="0.1" />
              </div>
              <div class="space-y-1">
                <Label for="width" class="text-xs">Width</Label>
                <Input id="width" v-model="labelData.dimensions.width" type="number" min="0.1" step="0.1" />
              </div>
              <div class="space-y-1">
                <Label for="height" class="text-xs">Height</Label>
                <Input id="height" v-model="labelData.dimensions.height" type="number" min="0.1" step="0.1" />
              </div>
            </div>
            <div class="flex items-center">
              <p class="text-xs text-muted-foreground">All dimensions in inches</p>
            </div>
            <p v-if="errors.dimensions" class="text-destructive text-xs">{{ errors.dimensions }}</p>
          </div>

          <div class="space-y-2">
            <Label for="referenceNumber">Reference Number</Label>
            <Input 
              id="referenceNumber" 
              v-model="labelData.referenceNumber" 
              placeholder="Optional reference number" 
            />
          </div>

          <div class="space-y-2">
            <Label for="labelFormat">Label Format</Label>
            <Select v-model="labelData.format">
              <SelectTrigger id="labelFormat">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4x6">4" x 6"</SelectItem>
                <SelectItem value="letter">Letter (8.5" x 11")</SelectItem>
                <SelectItem value="a4">A4</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="zpl">ZPL (Thermal Printer)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="col-span-2 space-y-2">
            <Label>Additional Options</Label>
            <div class="grid grid-cols-2 gap-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="signature" 
                  v-model:checked="labelData.requireSignature" 
                />
                <Label for="signature">Require Signature</Label>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="insurance" 
                  v-model:checked="labelData.addInsurance" 
                />
                <Label for="insurance">Add Insurance</Label>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="saturday" 
                  v-model:checked="labelData.saturdayDelivery" 
                />
                <Label for="saturday">Saturday Delivery</Label>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="returnLabel" 
                  v-model:checked="labelData.includeReturnLabel" 
                />
                <Label for="returnLabel">Include Return Label</Label>
              </div>
            </div>
          </div>

          <div v-if="labelData.addInsurance" class="space-y-2">
            <Label for="insuranceAmount">Insurance Amount ($)</Label>
            <Input 
              id="insuranceAmount" 
              v-model="labelData.insuranceValue" 
              type="number" 
              min="0" 
              step="0.01"
              placeholder="Enter value to insure" 
            />
            <p v-if="errors.insurance" class="text-destructive text-xs">{{ errors.insurance }}</p>
          </div>

          <div class="col-span-2 space-y-2">
            <Label for="notes">Special Instructions (Optional)</Label>
            <Textarea
              id="notes"
              v-model="labelData.notes"
              placeholder="Add any special instructions or notes for this shipment..."
              :rows="2"
            />
          </div>
        </div>

        <div class="flex justify-between">
          <Button 
            variant="outline" 
            @click="currentStep = 'details'"
          >
            <ArrowLeftIcon class="mr-2 h-4 w-4" />
            Back to Shipping Details
          </Button>
          <Button 
            variant="default" 
            @click="validatePackageAndContinue"
          >
            Continue to Preview
            <ArrowRightIcon class="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- Preview & Print Step -->
      <div v-if="currentStep === 'preview'" class="space-y-4">
        <div v-if="isGeneratingLabel" class="flex flex-col items-center justify-center py-8">
          <Loader2Icon class="h-10 w-10 animate-spin text-primary mb-3" />
          <p class="text-center font-medium">Generating shipping label...</p>
          <p class="text-center text-sm text-muted-foreground">
            Connecting to {{ formatCarrierName(labelData.carrier) }} servers
          </p>
        </div>

        <div v-else-if="labelError" class="p-4 border border-destructive/30 bg-destructive/10 rounded-md space-y-2">
          <div class="flex items-center text-destructive font-medium">
            <XCircleIcon class="h-5 w-5 mr-2" />
            Error generating shipping label
          </div>
          <p class="text-sm">{{ labelError }}</p>
          <div class="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              @click="retryLabelGeneration"
            >
              <RefreshCwIcon class="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </div>

        <div v-else-if="generatedLabel" class="space-y-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-base font-medium">Shipping Label</h3>
              <p class="text-sm text-muted-foreground">
                {{ formatCarrierName(labelData.carrier) }} {{ formatServiceName(labelData.service) }}
              </p>
            </div>
            <div class="space-y-1">
              <Badge variant="outline" class="ml-auto">
                {{ labelData.format.toUpperCase() }}
              </Badge>
              <p v-if="generatedLabel.trackingNumber" class="text-xs text-right">
                Tracking #: {{ generatedLabel.trackingNumber }}
              </p>
            </div>
          </div>

          <div class="border rounded-md p-4 bg-muted/30 flex items-center justify-center min-h-[300px]">
            <!-- Label Preview -->
            <div v-if="!previewError" class="relative border bg-white max-w-[400px] w-full aspect-[1.5/1] flex items-center justify-center">
              <!-- This would be a real label preview in production -->
              <img 
                v-if="generatedLabel.previewUrl" 
                :src="generatedLabel.previewUrl" 
                alt="Shipping Label Preview" 
                class="max-w-full max-h-full"
              />
              <div v-else class="text-center p-4">
                <PackageIcon class="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p class="text-sm font-medium">Label Preview Not Available</p>
                <p class="text-xs text-muted-foreground">The label has been generated and is ready to print</p>
              </div>
              
              <div class="absolute inset-0 flex items-center justify-center bg-black/60 text-white" v-if="generatedLabel.previewUrl">
                <p class="px-3 py-1 bg-black/80 rounded-md text-sm">Preview Only</p>
              </div>
            </div>
            <div v-else class="text-center">
              <ImageOffIcon class="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p class="text-sm">Preview not available</p>
              <p class="text-xs text-muted-foreground">You can still print the label</p>
            </div>
          </div>

          <div class="space-y-2">
            <h4 class="text-sm font-medium">Shipment Summary</h4>
            <div class="border rounded-md divide-y">
              <div class="p-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p class="text-muted-foreground">To:</p>
                  <p class="font-medium">{{ labelData.address.name }}</p>
                  <p>{{ labelData.address.city }}, {{ labelData.address.state }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Service:</p>
                  <p>{{ formatCarrierName(labelData.carrier) }} {{ formatServiceName(labelData.service) }}</p>
                </div>
              </div>
              <div class="p-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p class="text-muted-foreground">Package:</p>
                  <p>{{ formatPackageType(labelData.packageType) }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Weight:</p>
                  <p>{{ labelData.weight }} {{ labelData.weightUnit }}</p>
                </div>
              </div>
              <div v-if="generatedLabel.cost" class="p-3 text-sm">
                <div class="flex justify-between">
                  <p class="text-muted-foreground">Shipping Cost:</p>
                  <p class="font-medium">${{ generatedLabel.cost.toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="emailLabel" 
                v-model:checked="emailLabelCopy" 
              />
              <Label for="emailLabel">Email a copy of this label</Label>
            </div>
            
            <div v-if="emailLabelCopy" class="flex space-x-2">
              <Input 
                v-model="emailAddress" 
                placeholder="Enter email address" 
                type="email"
              />
              <Button 
                variant="outline"
                :disabled="!isValidEmail || isSendingEmail"
                @click="sendEmailLabel"
              >
                <Loader2Icon v-if="isSendingEmail" class="h-4 w-4 mr-2 animate-spin" />
                <MailIcon v-else class="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>

        <div class="flex justify-between">
          <Button 
            variant="outline" 
            @click="currentStep = 'package'"
          >
            <ArrowLeftIcon class="mr-2 h-4 w-4" />
            Back to Package Details
          </Button>
          
          <div class="space-x-2">
            <Button 
              v-if="!generatedLabel && !isGeneratingLabel" 
              variant="default"
              @click="generateLabel"
            >
              <TagIcon class="h-4 w-4 mr-2" />
              Generate Label
            </Button>
            
            <Button 
              v-if="generatedLabel" 
              variant="outline" 
              @click="downloadLabel"
            >
              <DownloadIcon class="h-4 w-4 mr-2" />
              Download
            </Button>
            
            <Button 
              v-if="generatedLabel" 
              variant="default" 
              @click="printLabel"
            >
              <PrinterIcon class="h-4 w-4 mr-2" />
              Print Label
            </Button>
          </div>
        </div>
      </div>
    </div>

    <AlertDialog v-model:open="showPrintConfirmation">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Label Printed Successfully</AlertDialogTitle>
          <AlertDialogDescription>
            The shipping label has been sent to your printer. Would you like to mark this order as shipped?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showPrintConfirmation = false">No, Just Close</AlertDialogCancel>
          <AlertDialogAction @click="confirmShipment">Yes, Mark as Shipped</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </DialogContent>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ClipboardIcon,
  DownloadIcon,
  FileTextIcon,
  ImageOffIcon,
  Loader2Icon,
  MailIcon,
  PackageIcon,
  PencilIcon,
  PrinterIcon,
  RefreshCwIcon,
  TagIcon,
  XCircleIcon
} from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'label-printed', 'mark-shipped'])

// State
const currentStep = ref('details')
const editingAddress = ref(false)
const isGeneratingLabel = ref(false)
const generatedLabel = ref(null)
const labelError = ref(null)
const previewError = ref(false)
const showPrintConfirmation = ref(false)
const emailLabelCopy = ref(false)
const emailAddress = ref('')
const isSendingEmail = ref(false)

// Form data
const labelData = reactive({
  // Shipping details
  carrier: 'usps',
  service: 'priority',
  address: {
    name: props.order.shippingAddress?.name || '',
    company: props.order.shippingAddress?.company || '',
    line1: props.order.shippingAddress?.line1 || '',
    line2: props.order.shippingAddress?.line2 || '',
    city: props.order.shippingAddress?.city || '',
    state: props.order.shippingAddress?.state || '',
    postalCode: props.order.shippingAddress?.postalCode || '',
    country: props.order.shippingAddress?.country || 'United States',
    phone: props.order.shippingAddress?.phone || ''
  },
  residentialAddress: true,
  
  // Package details
  packageType: 'medium_box',
  weight: '',
  weightUnit: 'lb',
  dimensions: {
    length: '',
    width: '',
    height: ''
  },
  referenceNumber: props.order.orderNumber,
  format: '4x6',
  
  // Additional options
  requireSignature: false,
  addInsurance: false,
  insuranceValue: '',
  saturdayDelivery: false,
  includeReturnLabel: false,
  notes: ''
})

// Validation errors
const errors = reactive({
  carrier: '',
  service: '',
  address: '',
  packageType: '',
  weight: '',
  dimensions: '',
  insurance: ''
})

// Computed properties
const isValidShipping = computed(() => {
  return labelData.carrier && 
         labelData.service && 
         labelData.address.name && 
         labelData.address.line1 && 
         labelData.address.city && 
         labelData.address.state && 
         labelData.address.postalCode && 
         labelData.address.country
})

const isValidPackage = computed(() => {
  return labelData.packageType && 
         labelData.weight && 
         (!labelData.addInsurance || labelData.insuranceValue) &&
         (labelData.packageType !== 'custom' || 
          (labelData.dimensions.length && 
           labelData.dimensions.width && 
           labelData.dimensions.height))
})

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(emailAddress.value)
})

// Initialize with order data
onMounted(() => {
  // Pre-fill weight based on order items if available
  if (props.order.totalWeight) {
    labelData.weight = props.order.totalWeight
  } else if (props.order.items && props.order.items.length > 0) {
    // Calculate estimated weight based on items
    const estimatedWeight = props.order.items.reduce((total, item) => {
      return total + (item.weight || 0.5) * item.quantity
    }, 0)
    labelData.weight = Math.max(0.1, estimatedWeight).toFixed(1)
  }

  // Pre-select carrier based on shipping method if available
  if (props.order.shippingMethod) {
    switch (props.order.shippingMethod.toLowerCase()) {
      case 'express':
        labelData.carrier = 'fedex'
        labelData.service = '2day'
        break
      case 'priority':
        labelData.carrier = 'usps'
        labelData.service = 'priority'
        break
      case 'economy':
        labelData.carrier = 'usps'
        labelData.service = 'ground'
        break
      default:
        labelData.carrier = 'ups'
        labelData.service = 'ground'
    }
  }
})

// Methods
function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return format(new Date(dateString), 'MMM d, yyyy')
}

function getOrderStatusVariant(status) {
  switch (status) {
    case 'pending': return 'secondary'
    case 'processing': return 'default'
    case 'shipped': return 'success'
    case 'delivered': return 'success'
    case 'cancelled': return 'destructive'
    default: return 'outline'
  }
}

function formatCarrierName(carrier) {
  switch (carrier) {
    case 'usps': return 'USPS'
    case 'ups': return 'UPS'
    case 'fedex': return 'FedEx'
    case 'dhl': return 'DHL'
    case 'ontrac': return 'OnTrac'
    default: return carrier
  }
}

function formatServiceName(service) {
  switch (service) {
    case 'priority': return 'Priority'
    case 'express': return 'Express'
    case 'ground': return 'Ground'
    case 'first_class': return 'First Class'
    case '2day': return '2-Day'
    case '3day': return '3-Day'
    case 'nextday': return 'Next Day'
    case 'express_saver': return 'Express Saver'
    default: return service
  }
}

function formatPackageType(type) {
  switch (type) {
    case 'small_box': return 'Small Box'
    case 'medium_box': return 'Medium Box'
    case 'large_box': return 'Large Box'
    case 'envelope': return 'Envelope'
    case 'poly_mailer': return 'Poly Mailer'
    case 'tube': return 'Tube'
    case 'custom': return 'Custom Package'
    default: return type
  }
}

function validateShippingAndContinue() {
  // Reset errors
  errors.carrier = ''
  errors.service = ''
  errors.address = ''
  
  // Validate carrier
  if (!labelData.carrier) {
    errors.carrier = 'Please select a carrier'
    return
  }
  
  // Validate service
  if (!labelData.service) {
    errors.service = 'Please select a shipping service'
    return
  }
  
  // Validate address
  if (!labelData.address.name) {
    errors.address = 'Recipient name is required'
    return
  }
  
  if (!labelData.address.line1) {
    errors.address = 'Address line 1 is required'
    return
  }
  
  if (!labelData.address.city) {
    errors.address = 'City is required'
    return
  }
  
  if (!labelData.address.state) {
    errors.address = 'State/Province is required'
    return
  }
  
  if (!labelData.address.postalCode) {
    errors.address = 'Postal code is required'
    return
  }
  
  if (!labelData.address.country) {
    errors.address = 'Country is required'
    return
  }
  
  // Continue to next step
  currentStep.value = 'package'
}

function validatePackageAndContinue() {
  // Reset errors
  errors.packageType = ''
  errors.weight = ''
  errors.dimensions = ''
  errors.insurance = ''
  
  // Validate package type
  if (!labelData.packageType) {
    errors.packageType = 'Please select a package type'
    return
  }
  
  // Validate weight
  if (!labelData.weight) {
    errors.weight = 'Please enter the package weight'
    return
  }
  
  if (isNaN(parseFloat(labelData.weight)) || parseFloat(labelData.weight) <= 0) {
    errors.weight = 'Please enter a valid weight'
    return
  }
  
  // Validate dimensions for custom package
  if (labelData.packageType === 'custom') {
    if (!labelData.dimensions.length || !labelData.dimensions.width || !labelData.dimensions.height) {
      errors.dimensions = 'Please enter all dimensions'
      return
    }
    
    if (isNaN(parseFloat(labelData.dimensions.length)) || parseFloat(labelData.dimensions.length) <= 0 ||
        isNaN(parseFloat(labelData.dimensions.width)) || parseFloat(labelData.dimensions.width) <= 0 ||
        isNaN(parseFloat(labelData.dimensions.height)) || parseFloat(labelData.dimensions.height) <= 0) {
      errors.dimensions = 'Please enter valid dimensions'
      return
    }
  }
  
  // Validate insurance amount if insurance is added
  if (labelData.addInsurance) {
    if (!labelData.insuranceValue) {
      errors.insurance = 'Please enter an insurance amount'
      return
    }
    
    if (isNaN(parseFloat(labelData.insuranceValue)) || parseFloat(labelData.insuranceValue) <= 0) {
      errors.insurance = 'Please enter a valid insurance amount'
      return
    }
  }
  
  // Continue to next step
  currentStep.value = 'preview'
}

async function generateLabel() {
  isGeneratingLabel.value = true
  labelError.value = null
  generatedLabel.value = null
  
  try {
    // In a real implementation, this would call your shipping API
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate a successful label generation
    const randomTrackingNumber = Math.random().toString(36).substring(2, 12).toUpperCase()
    
    generatedLabel.value = {
      trackingNumber: randomTrackingNumber,
      // In a real app, this would be a URL to the label image/PDF
      previewUrl: null, 
      labelUrl: null,
      cost: 8.75 + (Math.random() * 10).toFixed(2) * 1, // Random cost between $8.75 and $18.75
      carrier: labelData.carrier,
      service: labelData.service,
      createdAt: new Date().toISOString()
    }
    
    // Simulate occasional preview errors
    previewError.value = Math.random() > 0.7
    
  } catch (error) {
    console.error('Error generating label:', error)
    labelError.value = 'There was an error generating the shipping label. Please try again.'
  } finally {
    isGeneratingLabel.value = false
  }
}

function retryLabelGeneration() {
  generateLabel()
}

function downloadLabel() {
  // In a real implementation, this would download the actual label file
  console.log('Downloading label:', generatedLabel.value.trackingNumber)
  
  // Simulate a download
  const a = document.createElement('a')
  a.href = generatedLabel.value.labelUrl || '#'
  a.download = `shipping-label-${generatedLabel.value.trackingNumber}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function printLabel() {
  // In a real implementation, this would print the actual label
  console.log('Printing label:', generatedLabel.value.trackingNumber)
  
  // Simulate printing
  setTimeout(() => {
    showPrintConfirmation.value = true
  }, 500)
}

function confirmShipment() {
  emit('mark-shipped', {
    orderId: props.order.id,
    orderNumber: props.order.orderNumber,
    trackingNumber: generatedLabel.value.trackingNumber,
    carrier: labelData.carrier,
    service: labelData.service,
    timestamp: new Date().toISOString()
  })
  
  showPrintConfirmation.value = false
  emit('close')
}

async function sendEmailLabel() {
  if (!isValidEmail.value) return
  
  isSendingEmail.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulated success
    emailLabelCopy.value = false
    emailAddress.value = ''
    
    // Show success message
    // In a real implementation, you'd use a toast or alert system
    alert(`Label sent to ${emailAddress.value}`)
    
  } catch (error) {
    console.error('Error sending email:', error)
  } finally {
    isSendingEmail.value = false
  }
}
</script>