<template>
  <Sheet :open="open" @update:open="updateOpen">
    <SheetContent
        class="sm:max-w-2xl flex flex-col h-full overflow-hidden"
        position="right"
        size="xl"
        @click.stop
    >
      <SheetHeader class="flex-shrink-0">
        <SheetTitle>Edit Quote #{{ quote?.quoteNumber }}</SheetTitle>
        <SheetDescription>
          Update this quote. Fields marked with an asterisk (*) are required.
        </SheetDescription>
      </SheetHeader>

      <div v-if="quote" class="flex-1 overflow-y-auto py-6 px-1" @click.stop>
        <Form :validation-schema="schema" @submit="handleSubmit" v-slot="{ errors, isSubmitting }">
          <div class="space-y-6">
            <!-- Customer Information (Read-only) -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium">Customer Information</h3>

              <div class="border rounded-md p-3 bg-muted/20">
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <p class="text-xs text-muted-foreground">Name</p>
                    <p class="text-sm font-medium">{{ quote.customer.name }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Email</p>
                    <p class="text-sm font-medium">{{ quote.customer.email }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Phone</p>
                    <p class="text-sm font-medium">{{ quote.customer.phone }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Type</p>
                    <p class="text-sm font-medium">{{ quote.customer.type === 'business' ? 'Business' : 'Individual' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quote Details -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium">Quote Details</h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="validUntil">Valid Until *</Label>
                  <Field name="validUntil" v-slot="{ field }">
                    <Input
                        type="date"
                        v-bind="field"
                        :class="{ 'border-red-500': errors.validUntil }"
                        @click.stop
                    />
                  </Field>
                  <p v-if="errors.validUntil" class="text-sm text-red-500">{{ errors.validUntil }}</p>
                </div>

                <div class="space-y-2">
                  <Label for="currency">Currency *</Label>
                  <Field name="currency" v-slot="{ field, handleChange }">
                    <Select
                        :value="field.value"
                        @update:value="handleChange"
                        @click.stop
                    >
                      <SelectTrigger :class="{ 'border-red-500': errors.currency }">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent @click.stop>
                        <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <p v-if="errors.currency" class="text-sm text-red-500">{{ errors.currency }}</p>
                </div>
              </div>
            </div>

            <!-- Line Items (same implementation as in AddQuoteSheet) -->
            <!-- ... Line Items section (same as in AddQuoteSheet) ... -->

            <!-- Notes -->
            <div class="space-y-2">
              <Label for="notes">Notes</Label>
              <Field name="notes" v-slot="{ field }">
                <Textarea
                    v-bind="field"
                    placeholder="Add any additional notes or terms..."
                    rows="3"
                    @click.stop
                />
              </Field>
            </div>
          </div>
        </Form>
      </div>

      <!-- Fixed footer with buttons -->
      <div class="border-t p-4 flex justify-end space-x-2 flex-shrink-0 bg-background">
        <Button type="button" variant="outline" @click="cancelForm" @click.stop>
          Cancel
        </Button>
        <Button type="submit" @click="handleSubmit" @click.stop>
          <span>Update Quote</span>
        </Button>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup>
// Similar script to AddQuoteSheet but with initial values from the quote prop
// and adjusted handleSubmit function to update instead of create
</script>