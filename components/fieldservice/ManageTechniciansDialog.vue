<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-4xl max-h-[90vh] overflow-auto">
      <DialogHeader>
        <DialogTitle>Manage Field Technicians</DialogTitle>
        <DialogDescription>
          Add, edit, and manage your ISP field technician workforce
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="technicians" class="mt-4">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="technicians">Technicians</TabsTrigger>
          <TabsTrigger value="scheduling">Schedules</TabsTrigger>
          <TabsTrigger value="skills">Skills & Certifications</TabsTrigger>
        </TabsList>

        <!-- Technicians Tab -->
        <TabsContent value="technicians" class="space-y-4 pt-4">
          <div class="flex justify-between items-center">
            <div class="space-y-1">
              <h2 class="text-xl font-semibold">Field Technicians</h2>
              <p class="text-sm text-muted-foreground">Manage your team of {{ technicians.length }} field technicians</p>
            </div>

            <Button @click="handleAddTechnician">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Technician
            </Button>
          </div>

          <Input v-model="technicianSearch" placeholder="Search technicians..." class="max-w-sm" />

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Skill Level</TableHead>
                  <TableHead>Specialties</TableHead>
                  <TableHead>Assignments</TableHead>
                  <TableHead class="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="tech in filteredTechnicians" :key="tech.id">
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <Avatar class="h-8 w-8">
                        <AvatarImage :src="tech.avatar" />
                        <AvatarFallback>{{ getInitials(tech.name) }}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div class="font-medium">{{ tech.name }}</div>
                        <div class="text-xs text-muted-foreground">{{ tech.id }}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge :class="{
                      'bg-green-50 text-green-700': tech.status === 'available',
                      'bg-amber-50 text-amber-700': tech.status === 'on_job',
                      'bg-blue-50 text-blue-700': tech.status === 'en_route',
                      'bg-slate-50 text-slate-700': tech.status === 'off_duty' || tech.status === 'break',
                      'bg-red-50 text-red-700': tech.status === 'delayed'
                    }">
                      {{ formatStatus(tech.status) }}
                    </Badge>
                  </TableCell>
                  <TableCell>{{ tech.skillLevel }}</TableCell>
                  <TableCell>
                    <div class="flex flex-wrap gap-1">
                      <Badge v-for="specialty in tech.specialties.slice(0, 2)" :key="specialty" variant="outline" class="text-xs">
                        {{ specialty }}
                      </Badge>
                      <Badge v-if="tech.specialties.length > 2" variant="outline" class="text-xs">
                        +{{ tech.specialties.length - 2 }}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="text-xs">
                      <div>Today: {{ tech.appointmentsToday || 0 }}</div>
                      <div>This Week: {{ tech.appointmentsThisWeek || 0 }}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                          <MoreHorizontalIcon class="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="handleEditTechnician(tech)">
                          <PencilIcon class="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="handleUpdateTechnicianStatus(tech)">
                          <RefreshCwIcon class="h-4 w-4 mr-2" />
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="handleViewSchedule(tech)">
                          <CalendarIcon class="h-4 w-4 mr-2" />
                          View Schedule
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem @click="handleDeleteTechnician(tech)" class="text-red-600">
                          <TrashIcon class="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <!-- Scheduling Tab -->
        <TabsContent value="scheduling" class="space-y-4 pt-4">
          <div class="space-y-1">
            <h2 class="text-xl font-semibold">Technician Scheduling</h2>
            <p class="text-sm text-muted-foreground">Manage work schedules and availability</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Calendar -->
            <Card class="md:col-span-2">
              <CardHeader>
                <CardTitle>Team Schedule</CardTitle>
                <CardDescription>Weekly view of technician schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <Button variant="outline" size="sm">
                      <ChevronLeftIcon class="h-4 w-4 mr-1" />
                      Previous Week
                    </Button>
                    <div class="font-medium">July 24 - July 30, 2023</div>
                    <Button variant="outline" size="sm">
                      Next Week
                      <ChevronRightIcon class="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  <div class="border rounded-md">
                    <!-- Days of week header -->
                    <div class="grid grid-cols-7 border-b">
                      <div v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="day"
                           class="p-2 text-center text-sm font-medium border-r last:border-r-0">
                        {{ day }}
                      </div>
                    </div>

                    <!-- Schedule grid -->
                    <div class="h-80 overflow-auto">
                      <div v-for="tech in technicians.slice(0, 5)" :key="tech.id" class="grid grid-cols-7 border-b last:border-b-0">
                        <div class="border-r p-1 text-xs" :class="{'bg-green-50': isAvailable(tech, 1)}">
                          <Badge v-if="hasAppointment(tech, 1)" variant="secondary" class="text-[10px]">2 jobs</Badge>
                        </div>
                        <div class="border-r p-1 text-xs" :class="{'bg-green-50': isAvailable(tech, 2)}">
                          <Badge v-if="hasAppointment(tech, 2)" variant="secondary" class="text-[10px]">1 job</Badge>
                        </div>
                        <div class="border-r p-1 text-xs" :class="{'bg-green-50': isAvailable(tech, 3)}">
                          <Badge v-if="hasAppointment(tech, 3)" variant="secondary" class="text-[10px]">3 jobs</Badge>
                        </div>
                        <div class="border-r p-1 text-xs" :class="{'bg-green-50': isAvailable(tech, 4)}">
                          <Badge v-if="hasAppointment(tech, 4)" variant="secondary" class="text-[10px]">2 jobs</Badge>
                        </div>
                        <div class="border-r p-1 text-xs" :class="{'bg-green-50': isAvailable(tech, 5)}">
                          <Badge v-if="hasAppointment(tech, 5)" variant="secondary" class="text-[10px]">1 job</Badge>
                        </div>
                        <div class="border-r p-1 text-xs bg-gray-100">
                          <Badge v-if="tech.id === 'TECH-1001'" variant="outline" class="text-[10px] text-gray-500">Off</Badge>
                        </div>
                        <div class="p-1 text-xs bg-gray-100">
                          <Badge v-if="tech.id !== 'TECH-1003'" variant="outline" class="text-[10px] text-gray-500">Off</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Schedule Adjustments -->
            <Card>
              <CardHeader>
                <CardTitle>Schedule Adjustments</CardTitle>
                <CardDescription>Add time off and special schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="tech in technicians" :key="tech.id" :value="tech.id">
                        {{ tech.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div class="space-y-2">
                    <Label>Schedule Adjustment Type</Label>
                    <RadioGroup defaultValue="time_off">
                      <div class="flex items-center space-x-2">
                        <RadioGroupItem value="time_off" id="time_off" />
                        <Label for="time_off">Time Off</Label>
                      </div>
                      <div class="flex items-center space-x-2">
                        <RadioGroupItem value="training" id="training" />
                        <Label for="training">Training</Label>
                      </div>
                      <div class="flex items-center space-x-2">
                        <RadioGroupItem value="special_assignment" id="special_assignment" />
                        <Label for="special_assignment">Special Assignment</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Start Date</Label>
                      <Input type="date" />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input type="date" />
                    </div>
                  </div>

                  <Textarea placeholder="Add notes about this schedule adjustment" />

                  <Button class="w-full">
                    Save Adjustment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <!-- Skills & Certifications Tab -->
        <TabsContent value="skills" class="space-y-4 pt-4">
          <div class="space-y-1">
            <h2 class="text-xl font-semibold">Skills & Certifications</h2>
            <p class="text-sm text-muted-foreground">Manage technician qualifications and training</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Skills Database -->
            <Card class="md:col-span-2">
              <CardHeader>
                <CardTitle>Skills Database</CardTitle>
                <CardDescription>Available skills and certifications for field technicians</CardDescription>
                <Input placeholder="Search skills and certifications..." class="mt-2" />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill/Certification</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Technicians</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div class="font-medium">Fiber Optic Installation</div>
                        <div class="text-xs text-muted-foreground">Level 2 Certification</div>
                      </TableCell>
                      <TableCell>Installation</TableCell>
                      <TableCell>7 technicians</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <PencilIcon class="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div class="font-medium">Network Troubleshooting</div>
                        <div class="text-xs text-muted-foreground">Advanced</div>
                      </TableCell>
                      <TableCell>Repair</TableCell>
                      <TableCell>5 technicians</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <PencilIcon class="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div class="font-medium">DOCSIS 3.1 Certification</div>
                        <div class="text-xs text-muted-foreground">Official Certification</div>
                      </TableCell>
                      <TableCell>Certification</TableCell>
                      <TableCell>3 technicians</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <PencilIcon class="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div class="font-medium">Wireless Network Setup</div>
                        <div class="text-xs text-muted-foreground">WiFi 6 Certified</div>
                      </TableCell>
                      <TableCell>Installation</TableCell>
                      <TableCell>9 technicians</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <PencilIcon class="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div class="font-medium">Cable Splicing</div>
                        <div class="text-xs text-muted-foreground">Advanced Skill</div>
                      </TableCell>
                      <TableCell>Repair</TableCell>
                      <TableCell>4 technicians</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <PencilIcon class="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <!-- Add New Skill/Certification -->
            <Card>
              <CardHeader>
                <CardTitle>Add New Skill</CardTitle>
                <CardDescription>Create new skills or certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div>
                    <Label>Skill Name</Label>
                    <Input placeholder="Enter skill name" />
                  </div>

                  <div>
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="installation">Installation</SelectItem>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="certification">Certification</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="hardware">Hardware</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea placeholder="Describe the skill or certification" />
                  </div>

                  <div>
                    <Label>Required Training</Label>
                    <Input placeholder="Enter required training (if any)" />
                  </div>

                  <Button class="w-full">
                    <PlusIcon class="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter class="mt-6">
        <Button variant="outline" @click="$emit('update:open', false)">Close</Button>
      </DialogFooter>
    </DialogContent>

    <!-- Edit Technician Dialog -->
    <Dialog :open="showEditTechnicianDialog" @update:open="showEditTechnicianDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ isNewTechnician ? 'Add New Technician' : 'Edit Technician' }}</DialogTitle>
          <DialogDescription>
            {{ isNewTechnician ? 'Create a new technician profile' : `Update information for ${selectedTechnician?.name}` }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedTechnician || isNewTechnician" class="py-4 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input v-model="editedTechnician.name" placeholder="Full name" />
            </div>
            <div>
              <Label>Employee ID</Label>
              <Input v-model="editedTechnician.id" placeholder="TECH-XXXX" :disabled="!isNewTechnician" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input v-model="editedTechnician.phone" placeholder="Phone number" />
            </div>
            <div>
              <Label>Email</Label>
              <Input v-model="editedTechnician.email" placeholder="Email address" />
            </div>
            <div>
              <Label>Skill Level</Label>
              <Select v-model="editedTechnician.skillLevel">
                <SelectTrigger>
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select v-model="editedTechnician.status">
                <SelectTrigger>
                  <SelectValue placeholder="Current status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="on_job">On Job</SelectItem>
                  <SelectItem value="off_duty">Off Duty</SelectItem>
                  <SelectItem value="break">On Break</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Specialties</Label>
            <div class="flex flex-wrap gap-2 mt-2">
              <Badge
                  v-for="specialty in editedTechnician.specialties"
                  :key="specialty"
                  variant="secondary"
                  class="flex items-center gap-1"
              >
                {{ specialty }}
                <Button variant="ghost" size="sm" class="h-4 w-4 p-0 text-muted-foreground hover:text-foreground" @click="removeSpecialty(specialty)">
                  <XIcon class="h-3 w-3" />
                </Button>
              </Badge>
              <div class="flex items-center gap-2">
                <Input v-model="newSpecialty" placeholder="Add specialty" class="w-40 h-8" @keydown.enter.prevent="addSpecialty" />
                <Button variant="outline" size="sm" class="h-8" @click="addSpecialty">Add</Button>
              </div>
            </div>
          </div>

          <div>
            <Label>Certifications</Label>
            <div class="flex flex-wrap gap-2 mt-2">
              <Badge
                  v-for="cert in editedTechnician.certifications"
                  :key="cert"
                  variant="outline"
                  class="flex items-center gap-1"
              >
                {{ cert }}
                <Button variant="ghost" size="sm" class="h-4 w-4 p-0 text-muted-foreground hover:text-foreground" @click="removeCertification(cert)">
                  <XIcon class="h-3 w-3" />
                </Button>
              </Badge>
              <div class="flex items-center gap-2">
                <Input v-model="newCertification" placeholder="Add certification" class="w-40 h-8" @keydown.enter.prevent="addCertification" />
                <Button variant="outline" size="sm" class="h-8" @click="addCertification">Add</Button>
              </div>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea v-model="editedTechnician.notes" placeholder="Additional notes about this technician" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showEditTechnicianDialog = false">
            Cancel
          </Button>
          <Button @click="saveTechnician">
            {{ isNewTechnician ? 'Create Technician' : 'Save Changes' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Dialog>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue';
import { format } from 'date-fns';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  PlusIcon, PencilIcon, TrashIcon, MoreHorizontalIcon, RefreshCwIcon,
  CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XIcon
} from 'lucide-vue-next';

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  technicians: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:open', 'update']);

// Search and filtering
const technicianSearch = ref('');
const filteredTechnicians = computed(() => {
  if (!technicianSearch.value) return props.technicians;

  const search = technicianSearch.value.toLowerCase();
  return props.technicians.filter(tech =>
      tech.name.toLowerCase().includes(search) ||
      tech.id.toLowerCase().includes(search) ||
      tech.specialties.some(s => s.toLowerCase().includes(search))
  );
});

// Edit technician dialog
const showEditTechnicianDialog = ref(false);
const selectedTechnician = ref(null);
const isNewTechnician = ref(false);
const editedTechnician = reactive({
  id: '',
  name: '',
  phone: '',
  email: '',
  status: 'available',
  skillLevel: 'Junior',
  specialties: [],
  certifications: [],
  notes: ''
});
const newSpecialty = ref('');
const newCertification = ref('');

// Initialize edited technician when selection changes
watch(selectedTechnician, (tech) => {
  if (tech) {
    editedTechnician.id = tech.id;
    editedTechnician.name = tech.name;
    editedTechnician.phone = tech.phone || '';
    editedTechnician.email = tech.email || '';
    editedTechnician.status = tech.status;
    editedTechnician.skillLevel = tech.skillLevel;
    editedTechnician.specialties = [...(tech.specialties || [])];
    editedTechnician.certifications = [...(tech.certifications || [])];
    editedTechnician.notes = tech.notes || '';
  }
});

function handleAddTechnician() {
  isNewTechnician.value = true;
  selectedTechnician.value = null;

  // Reset form
  editedTechnician.id = `TECH-${Math.floor(1000 + Math.random() * 9000)}`;
  editedTechnician.name = '';
  editedTechnician.phone = '';
  editedTechnician.email = '';
  editedTechnician.status = 'available';
  editedTechnician.skillLevel = 'Junior';
  editedTechnician.specialties = [];
  editedTechnician.certifications = [];
  editedTechnician.notes = '';

  showEditTechnicianDialog.value = true;
}

function handleEditTechnician(technician) {
  isNewTechnician.value = false;
  selectedTechnician.value = technician;
  showEditTechnicianDialog.value = true;
}

function handleDeleteTechnician(technician) {
  if (confirm(`Are you sure you want to delete ${technician.name}?`)) {
    const updatedTechnicians = props.technicians.filter(t => t.id !== technician.id);
    emit('update', updatedTechnicians);
  }
}

function handleUpdateTechnicianStatus(technician) {
  // In a real app, this would show a status update dialog
  const statusOptions = ['available', 'on_job', 'off_duty', 'break'];
  const currentIndex = statusOptions.indexOf(technician.status);
  const nextIndex = (currentIndex + 1) % statusOptions.length;

  const updatedTechnicians = props.technicians.map(t => {
    if (t.id === technician.id) {
      return { ...t, status: statusOptions[nextIndex] };
    }
    return t;
  });

  emit('update', updatedTechnicians);
}

function handleViewSchedule(technician) {
  // In a real app, this would navigate to the technician's schedule
  console.log(`View schedule for ${technician.name}`);
}

// Specialty and certification management
function addSpecialty() {
  if (newSpecialty.value && !editedTechnician.specialties.includes(newSpecialty.value)) {
    editedTechnician.specialties.push(newSpecialty.value);
    newSpecialty.value = '';
  }
}

function removeSpecialty(specialty) {
  editedTechnician.specialties = editedTechnician.specialties.filter(s => s !== specialty);
}

function addCertification() {
  if (newCertification.value && !editedTechnician.certifications.includes(newCertification.value)) {
    editedTechnician.certifications.push(newCertification.value);
    newCertification.value = '';
  }
}

function removeCertification(cert) {
  editedTechnician.certifications = editedTechnician.certifications.filter(c => c !== cert);
}

// Schedule grid helpers
function isAvailable(technician, day) {
  // Mock availability
  if (technician.id === 'TECH-1001' && day === 6) return false;
  if (technician.id === 'TECH-1002' && day === 7) return false;
  if (technician.id === 'TECH-1003' && (day === 6 || day === 7)) return true;
  if (day === 6 || day === 7) return false;
  return true;
}

function hasAppointment(technician, day) {
  // Mock appointments
  const appointments = {
    'TECH-1001': [1, 3, 4],
    'TECH-1002': [2, 5],
    'TECH-1003': [1, 3, 4, 7],
    'TECH-1004': [1, 2],
    'TECH-1005': [3, 4, 5]
  };

  return appointments[technician.id]?.includes(day) || false;
}

// Save technician changes
function saveTechnician() {
  if (!editedTechnician.name) {
    alert('Technician name is required');
    return;
  }

  let updatedTechnicians;

  if (isNewTechnician.value) {
    // Add new technician
    updatedTechnicians = [
      ...props.technicians,
      {
        ...editedTechnician,
        appointmentsToday: 0,
        appointmentsThisWeek: 0,
        avatar: null
      }
    ];
  } else {
    // Update existing technician
    updatedTechnicians = props.technicians.map(t => {
      if (t.id === editedTechnician.id) {
        return { ...t, ...editedTechnician };
      }
      return t;
    });
  }

  emit('update', updatedTechnicians);
  showEditTechnicianDialog.value = false;
}

// Helper functions
function getInitials(name) {
  return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
}

function formatStatus(status) {
  const statusMap = {
    'available': 'Available',
    'on_job': 'On Service Call',
    'en_route': 'En Route',
    'off_duty': 'Off Duty',
    'break': 'On Break',
    'delayed': 'Delayed'
  };
  return statusMap[status] || status;
}
</script>