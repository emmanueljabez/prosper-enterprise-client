<template>
  <div class="flex flex-col h-[calc(85vh)]">
    <div class="flex items-center justify-between p-2">
      <div>
        <h3 class="text-lg font-medium">Receive Inventory</h3>
        <p class="text-sm text-muted-foreground">Record inventory received from suppliers or purchase orders</p>
      </div>
      <Button variant="ghost" size="icon" @click="$emit('close')">
        <XIcon class="h-4 w-4" />
      </Button>
    </div>
    
    <Separator />
    
    <div class="flex-1 overflow-y-auto pr-1">
      <form @submit.prevent="handleSubmit" class="space-y-8 p-2">
        <!-- Transaction Type Selection -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium">Receive Type</h4>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="receive-type">Transaction Type *</Label>
              <Select v-model="form.receiveType" @update:model-value="onReceiveTypeChange">
                <SelectTrigger id="receive-type">
                  <SelectValue placeholder="Select receive type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE_ITEM">Single Item Receive</SelectItem>
                  <SelectItem value="MULTI_ITEM">Multi-Item Receive</SelectItem>
                  <SelectItem value="MULTI_ITEM_FROM_PO">Multi-Item from Purchase Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <!-- Reference Type for Multi-Item from PO -->
            <div v-if="form.receiveType === 'MULTI_ITEM_FROM_PO'" class="space-y-2">
              <Label for="reference-type">Reference Type *</Label>
              <Select v-model="form.referenceType" @update:model-value="onReferenceTypeChange">
                <SelectTrigger id="reference-type">
                  <SelectValue placeholder="Select reference type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PURCHASE_ORDER">Purchase Order</SelectItem>
                  <SelectItem value="SALES_ORDER">Sales Order</SelectItem>
                  <SelectItem value="WORK_ORDER">Work Order</SelectItem>
                  <SelectItem value="TRANSFER_ORDER">Transfer Order</SelectItem>
                  <SelectItem value="ADJUSTMENT_ORDER">Adjustment Order</SelectItem>
                  <SelectItem value="QUALITY_CONTROL">Quality Control</SelectItem>
                  <SelectItem value="MANUAL">Manual Reference</SelectItem>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <!-- Purchase Order Selection -->
          <div v-if="form.receiveType === 'MULTI_ITEM_FROM_PO' && form.referenceType === 'PURCHASE_ORDER'" class="space-y-2">
            <Label for="purchase-order">Purchase Order *</Label>
            <Select v-model="form.genericReferenceId" @update:model-value="onPurchaseOrderSelected">
              <SelectTrigger id="purchase-order">
                <SelectValue :placeholder="purchaseOrdersLoading ? 'Loading...' : 'Select purchase order'" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="order in purchaseOrders" 
                  :key="order.id" 
                  :value="order.id?.toString()"
                >
                  PO #{{ order.invoiceNumber }} - {{ order.supplier?.name }}
                  <span class="text-muted-foreground ml-2">{{ formatCurrency(order.amount, order.currency) }}</span>
                </SelectItem>
                
                <!-- Load More Option -->
                <SelectItem 
                  v-if="purchaseOrdersPaginationMeta.hasMore && !purchaseOrdersLoading"
                  value="load-more"
                  class="text-blue-600 hover:text-blue-800"
                >
                  Load More...
                </SelectItem>
                
                <!-- Loading indicator -->
                <SelectItem 
                  v-if="purchaseOrdersLoading"
                  value="loading"
                  disabled
                >
                  Loading more orders...
                </SelectItem>
              </SelectContent>
            </Select>
            
            <!-- Selected PO Info -->
            <div v-if="form.genericReferenceId && getSelectedOrderInfo()" class="p-3 bg-muted/50 rounded-lg">
              <div class="text-sm">
                <strong>{{ getSelectedOrderInfo().invoiceNumber || getSelectedOrderInfo().orderNumber || `PO-${getSelectedOrderInfo().id}` }}</strong> - {{ getSelectedOrderInfo().supplier?.name || getSelectedOrderInfo().supplierName }}
              </div>
              <div class="text-xs text-muted-foreground mt-1">
                Total: {{ formatCurrency(getSelectedOrderInfo().amount) }} | 
                Status: {{ getSelectedOrderInfo().status }}
              </div>
            </div>
          </div>
          
          <!-- Manual Reference ID Input for Non-PO References in Multi-Item from PO -->
          <div v-if="form.receiveType === 'MULTI_ITEM_FROM_PO' && form.referenceType && form.referenceType !== 'PURCHASE_ORDER'" class="space-y-2">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="manual-reference-id-po">Reference ID</Label>
                <Input 
                  id="manual-reference-id-po" 
                  v-model.number="form.genericReferenceId" 
                  type="number"
                  placeholder="Enter reference ID"
                />
              </div>
              
              <div class="space-y-2">
                <Label for="manual-reference-number-po">Reference Number</Label>
                <Input 
                  id="manual-reference-number-po" 
                  v-model="form.genericReferenceNumber" 
                  placeholder="Enter reference number"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Transaction Details -->
        <div v-if="form.receiveType !== 'MULTI_ITEM_FROM_PO'" class="space-y-4">
          <h4 class="text-sm font-medium">Transaction Details</h4>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="transaction-date">Date *</Label>
              <Input 
                id="transaction-date" 
                v-model="form.transactionDate" 
                type="datetime-local" 
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="reference-type-standard">Reference Type</Label>
              <Select v-model="form.referenceType" @update:model-value="onReferenceTypeChange">
                <SelectTrigger id="reference-type-standard">
                  <SelectValue placeholder="Select reference type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PURCHASE_ORDER">Purchase Order</SelectItem>
                  <SelectItem value="SALES_ORDER">Sales Order</SelectItem>
                  <SelectItem value="WORK_ORDER">Work Order</SelectItem>
                  <SelectItem value="TRANSFER_ORDER">Transfer Order</SelectItem>
                  <SelectItem value="ADJUSTMENT_ORDER">Adjustment Order</SelectItem>
                  <SelectItem value="QUALITY_CONTROL">Quality Control</SelectItem>
                  <SelectItem value="MANUAL">Manual Reference</SelectItem>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <!-- Purchase Order Selection for Standard Receives -->
          <div v-if="form.referenceType === 'PURCHASE_ORDER'" class="space-y-2">
            <Label for="purchase-order-standard">Purchase Order *</Label>
            <Select v-model="form.genericReferenceId" @update:model-value="onPurchaseOrderSelected">
              <SelectTrigger id="purchase-order-standard">
                <SelectValue :placeholder="purchaseOrdersLoading ? 'Loading...' : 'Select purchase order'" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="order in purchaseOrders" 
                  :key="order.id" 
                  :value="order.id?.toString()"
                >
                  PO #{{ order.invoiceNumber }} - {{ order.supplier?.name }}
                  <span class="text-muted-foreground ml-2">{{ formatCurrency(order.amount, order.currency) }}</span>
                </SelectItem>
                
                <!-- Load More Option -->
                <SelectItem 
                  v-if="purchaseOrdersPaginationMeta.hasMore && !purchaseOrdersLoading"
                  value="load-more"
                  class="text-blue-600 hover:text-blue-800"
                >
                  Load More...
                </SelectItem>
                
                <!-- Loading indicator -->
                <SelectItem 
                  v-if="purchaseOrdersLoading"
                  value="loading"
                  disabled
                >
                  Loading more orders...
                </SelectItem>
              </SelectContent>
            </Select>
            
            <!-- Selected PO Info for Standard Receives -->
            <div v-if="form.genericReferenceId && getSelectedOrderInfo()" class="p-3 bg-muted/50 rounded-lg">
              <div class="text-sm">
                <strong>{{ getSelectedOrderInfo().invoiceNumber || getSelectedOrderInfo().orderNumber || `PO-${getSelectedOrderInfo().id}` }}</strong> - {{ getSelectedOrderInfo().supplier?.name || getSelectedOrderInfo().supplierName }}
              </div>
              <div class="text-xs text-muted-foreground mt-1">
                Total: {{ formatCurrency(getSelectedOrderInfo().amount) }} | 
                Status: {{ getSelectedOrderInfo().status }}
              </div>
            </div>
          </div>
          
          <!-- Manual Reference ID Input for Non-PO References -->
          <div v-if="form.referenceType && form.referenceType !== 'PURCHASE_ORDER'" class="space-y-2">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="manual-reference-id">Reference ID</Label>
                <Input 
                  id="manual-reference-id" 
                  v-model.number="form.genericReferenceId" 
                  type="number"
                  placeholder="Enter reference ID"
                />
              </div>
              
              <div class="space-y-2">
                <Label for="manual-reference-number">Reference Number</Label>
                <Input 
                  id="manual-reference-number" 
                  v-model="form.genericReferenceNumber" 
                  placeholder="Enter reference number"
                />
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="supplier">Supplier</Label>
              <Select v-model="form.supplierId">
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select supplier (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="supplier in suppliers" 
                    :key="supplier.id" 
                    :value="supplier.id"
                  >
                    {{ supplier.name || supplier.companyName }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="warehouse">Warehouse *</Label>
              <Select v-model="form.warehouseId" required>
                <SelectTrigger id="warehouse">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup v-for="group in warehouseGroups" :key="group.type">
                    <SelectLabel>{{ formatLocationType(group.type) }}</SelectLabel>
                    <SelectItem 
                      v-for="warehouse in group.warehouses" 
                      :key="warehouse.id" 
                      :value="warehouse.id"
                    >
                      {{ warehouse.name || warehouse.code }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="priority">Priority</Label>
              <Select v-model="form.priority">
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <!-- Empty space for alignment -->
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="supplier-reference">Supplier Reference</Label>
              <Input 
                id="supplier-reference" 
                v-model="form.supplierReference" 
                placeholder="Supplier invoice/order number"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="packing-slip">Packing Slip Number</Label>
              <Input 
                id="packing-slip" 
                v-model="form.packingSlipNumber" 
                placeholder="Optional"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="expected-date">Expected Date</Label>
              <Input 
                id="expected-date" 
                v-model="form.expectedDate" 
                type="datetime-local"
                placeholder="Expected delivery date"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="received-date">Received Date *</Label>
              <Input 
                id="received-date" 
                v-model="form.receivedDate" 
                type="datetime-local"
                placeholder="Actual delivery date"
                required
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="tracking-number">Tracking Number</Label>
              <Input 
                id="tracking-number" 
                v-model="form.trackingNumber" 
                placeholder="Shipment tracking number"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="freight-cost">Freight Cost</Label>
              <div class="relative">
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2">$</span>
                <Input 
                  id="freight-cost" 
                  v-model.number="form.freightCost" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  class="pl-6"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div class="space-y-2">
              <Label for="customs-cost">Customs Cost</Label>
              <div class="relative">
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2">$</span>
                <Input 
                  id="customs-cost" 
                  v-model.number="form.customsCost" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  class="pl-6"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="notes">Notes</Label>
            <Textarea 
              id="notes" 
              v-model="form.notes" 
              placeholder="Enter any additional information about this receipt" 
              rows="3"
            />
          </div>
        </div>
        
        <!-- Purchase Order Transaction Details -->
        <div v-if="form.receiveType === 'MULTI_ITEM_FROM_PO'" class="space-y-4">
          <h4 class="text-sm font-medium">Purchase Order Receipt Details</h4>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="po-transaction-date">Date *</Label>
              <Input 
                id="po-transaction-date" 
                v-model="form.transactionDate" 
                type="datetime-local" 
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="po-supplier">Supplier</Label>
              <Select v-model="form.supplierId">
                <SelectTrigger id="po-supplier">
                  <SelectValue placeholder="Select supplier (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="supplier in suppliers" 
                    :key="supplier.id" 
                    :value="supplier.id"
                  >
                    {{ supplier.name || supplier.companyName }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="po-warehouse">Warehouse *</Label>
              <Select v-model="form.warehouseId" required>
                <SelectTrigger id="po-warehouse">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup v-for="group in warehouseGroups" :key="group.type">
                    <SelectLabel>{{ formatLocationType(group.type) }}</SelectLabel>
                    <SelectItem 
                      v-for="warehouse in group.warehouses" 
                      :key="warehouse.id" 
                      :value="warehouse.id"
                    >
                      {{ warehouse.name || warehouse.code }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="po-external-reference">External Reference</Label>
              <Input 
                id="po-external-reference" 
                v-model="form.externalReference" 
                placeholder="External invoice/reference number"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="po-supplier-reference">Supplier Reference</Label>
              <Input 
                id="po-supplier-reference" 
                v-model="form.supplierReference" 
                placeholder="Supplier invoice/order number"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="po-packing-slip">Packing Slip Number</Label>
              <Input 
                id="po-packing-slip" 
                v-model="form.packingSlipNumber" 
                placeholder="Packing slip number"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="po-delivery-note">Delivery Note Number</Label>
              <Input 
                id="po-delivery-note" 
                v-model="form.deliveryNoteNumber" 
                placeholder="Delivery note number"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="po-carrier">Carrier Name</Label>
              <Input 
                id="po-carrier" 
                v-model="form.carrierName" 
                placeholder="Shipping carrier name"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="po-tracking">Tracking Number</Label>
              <Input 
                id="po-tracking" 
                v-model="form.trackingNumber" 
                placeholder="Shipment tracking number"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="po-expected-delivery">Expected Delivery Date</Label>
              <Input 
                id="po-expected-delivery" 
                v-model="form.expectedDeliveryDate" 
                type="datetime-local"
                placeholder="Expected delivery date"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="po-actual-delivery">Actual Delivery Date</Label>
              <Input 
                id="po-actual-delivery" 
                v-model="form.actualDeliveryDate" 
                type="datetime-local"
                placeholder="Actual delivery date"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="po-received-date">Received Date *</Label>
              <Input 
                id="po-received-date" 
                v-model="form.receivedDate" 
                type="datetime-local"
                placeholder="Date when items were received"
                required
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="po-freight-cost">Freight Cost</Label>
              <div class="relative">
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2">$</span>
                <Input 
                  id="po-freight-cost" 
                  v-model.number="form.freightCost" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  class="pl-6"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="po-insurance-cost">Insurance Cost</Label>
              <div class="relative">
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2">$</span>
                <Input 
                  id="po-insurance-cost" 
                  v-model.number="form.insuranceCost" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  class="pl-6"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div class="space-y-2">
              <Label for="po-customs-duty">Customs Duty</Label>
              <div class="relative">
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2">$</span>
                <Input 
                  id="po-customs-duty" 
                  v-model.number="form.customsCost" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  class="pl-6"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="po-other-charges">Other Charges</Label>
              <div class="relative">
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2">$</span>
                <Input 
                  id="po-other-charges" 
                  v-model.number="form.otherCharges" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  class="pl-6"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div class="space-y-2">
              <!-- Empty space for alignment -->
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="po-priority">Priority</Label>
              <Select v-model="form.priority">
                <SelectTrigger id="po-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="po-quality-status">Overall Quality Status</Label>
              <Select v-model="form.overallQualityStatus">
                <SelectTrigger id="po-quality-status">
                  <SelectValue placeholder="Select quality status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING_INSPECTION">Pending Inspection</SelectItem>
                  <SelectItem value="PASSED">Passed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="CONDITIONAL_PASS">Conditional Pass</SelectItem>
                  <SelectItem value="QUARANTINED">Quarantined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="po-notes">Notes</Label>
            <Textarea 
              id="po-notes" 
              v-model="form.notes" 
              placeholder="Enter any additional information about this purchase order receipt" 
              rows="3"
            />
          </div>
        </div>
        
        <Separator />
        
        <!-- Items -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium">Items</h4>
            <Button 
              v-if="form.receiveType !== 'SINGLE_ITEM'"
              type="button" 
              variant="outline" 
              size="sm" 
              @click="addItemRow"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div v-if="form.items.length === 0" class="border rounded-md p-8 flex flex-col items-center justify-center bg-muted/40">
            <PackageIcon class="h-8 w-8 text-muted-foreground mb-2" />
            <p class="text-muted-foreground">No items added yet.</p>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              class="mt-2"
              @click="addItemRow"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div v-else class="space-y-4">
            <Card v-for="(item, index) in form.items" :key="index" class="overflow-hidden">
              <CardHeader class="bg-muted/60 p-3 flex flex-row items-center justify-between">
                <CardTitle class="text-sm font-medium">Item {{ index + 1 }}</CardTitle>
                <Button 
                  v-if="form.receiveType !== 'SINGLE_ITEM'"
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  class="h-7 w-7" 
                  @click="removeItemRow(index)"
                >
                  <Trash2Icon class="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent class="p-4 space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label :for="`item-${index}`">Item *</Label>
                    <Select v-model="item.itemId" required>
                      <SelectTrigger :id="`item-${index}`">
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="inventoryItem in items" :key="inventoryItem.id" :value="inventoryItem.id">
                          {{ inventoryItem.name }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div class="space-y-2">
                    <Label :for="`quantity-${index}`">Quantity *</Label>
                    <Input 
                      :id="`quantity-${index}`" 
                      v-model.number="item.quantity" 
                      type="number" 
                      min="1" 
                      step="1" 
                      required
                    />
                  </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label :for="`cost-${index}`">Unit Cost *</Label>
                    <div class="relative">
                      <span class="absolute left-2.5 top-1/2 -translate-y-1/2">$</span>
                      <Input 
                        :id="`cost-${index}`" 
                        v-model.number="item.unitCost" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        class="pl-6"
                        required
                      />
                    </div>
                  </div>
                  
                  <div class="space-y-2">
                    <Label :for="`quality-status-${index}`">Quality Status</Label>
                    <Select v-model="item.qualityStatus">
                      <SelectTrigger :id="`quality-status-${index}`">
                        <SelectValue placeholder="Select quality status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING_INSPECTION">Pending Inspection</SelectItem>
                        <SelectItem value="PASSED">Passed</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="CONDITIONAL_PASS">Conditional Pass</SelectItem>
                        <SelectItem value="QUARANTINED">Quarantined</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label :for="`lot-number-${index}`">Lot Number</Label>
                    <Input 
                      :id="`lot-number-${index}`" 
                      v-model="item.lotNumber" 
                      placeholder="Enter lot number"
                    />
                  </div>
                  
                  <div class="space-y-2">
                    <Label :for="`batch-number-${index}`">Batch Number</Label>
                    <Input 
                      :id="`batch-number-${index}`" 
                      v-model="item.batchNumber" 
                      placeholder="Enter batch number"
                    />
                  </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label :for="`expiration-${index}`">Expiration Date</Label>
                    <Input 
                      :id="`expiration-${index}`" 
                      v-model="item.expirationDate" 
                      type="date"
                    />
                  </div>
                  
                  <div class="space-y-2">
                    <Label :for="`serial-${index}`">Serial Numbers</Label>
                    <div class="flex space-x-2">
                      <Input 
                        :id="`serial-${index}`" 
                        v-model="serialNumberInputs[index]" 
                        placeholder="Add serial numbers"
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        class="shrink-0"
                        @click="addSerialNumber(index)"
                      >
                        <PlusIcon class="h-4 w-4" />
                      </Button>
                    </div>
                    <div v-if="item.serialNumbers && item.serialNumbers.length > 0" class="flex flex-wrap gap-1 mt-2">
                      <Badge 
                        v-for="(serial, sIndex) in item.serialNumbers" 
                        :key="sIndex" 
                        variant="secondary"
                        class="flex items-center gap-1"
                      >
                        {{ serial }}
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          class="h-4 w-4 p-0" 
                          @click="removeSerialNumber(index, sIndex)"
                        >
                          <XIcon class="h-3 w-3" />
                        </Button>
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <Label :for="`item-notes-${index}`">Item Notes</Label>
                  <Textarea 
                    :id="`item-notes-${index}`" 
                    v-model="item.itemNotes" 
                    placeholder="Optional notes for this item"
                    rows="2"
                  />
                </div>
                
                <div class="flex justify-between items-center mt-2 text-sm">
                  <div class="text-muted-foreground">Subtotal:</div>
                  <div class="font-medium">{{ formatCurrency(calculateSubtotal(item)) }}</div>
                </div>
              </CardContent>
            </Card>
            
            <div class="flex justify-end space-x-4 items-center">
              <span class="text-muted-foreground">Total:</span>
              <span class="text-lg font-medium">{{ formatCurrency(calculateTotal()) }}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
    
    <div class="border-t pt-4 pb-2 px-2 bg-background">
      <div class="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          @click="$emit('close')"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          :disabled="submitting || !isFormValid"
          @click="handleSubmit"
        >
          <Loader2Icon v-if="submitting" class="h-4 w-4 mr-2 animate-spin" />
          <span>{{ submitting ? 'Submitting...' : 'Complete Receipt' }}</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  XIcon,
  PlusIcon,
  Trash2Icon,
  PackageIcon,
  Loader2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
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
  warehouses: {
    type: Array,
    default: () => []
  },
  items: {
    type: Array,
    default: () => []
  },
  suppliers: {
    type: Array,
    default: () => []
  },
  purchaseOrders: {
    type: Array,
    default: () => []
  },
  purchaseOrdersLoading: {
    type: Boolean,
    default: false
  },
  purchaseOrdersPaginationMeta: {
    type: Object,
    default: () => ({
      page: 0,
      totalPages: 0,
      hasMore: false
    })
  },
  // For pre-filling form with a scanned item
  scannedItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'close', 
  'transaction-created', 
  'multi-receive-from-po',
  'load-purchase-orders'
])

// Form state
const form = reactive({
  receiveType: 'SINGLE_ITEM', // SINGLE_ITEM, MULTI_ITEM, MULTI_ITEM_FROM_PO
  referenceType: 'MANUAL', // PURCHASE_ORDER, MANUAL
  genericReferenceId: null,
  genericReferenceNumber: '',
  transactionDate: formatCurrentDateTime(),
  receivedDate: formatCurrentDateTime(), // Dedicated received date field
  expectedDate: '',
  expectedDeliveryDate: '',
  actualDeliveryDate: '',
  warehouseId: null,
  locationId: null,
  supplierId: null,
  priority: 'NORMAL',
  overallQualityStatus: 'PENDING_INSPECTION',
  requiresInspection: true,
  receivedBy: 1, // TODO: Get from auth context
  externalReference: '',
  supplierReference: '',
  packingSlipNumber: '',
  deliveryNoteNumber: '',
  carrierName: '',
  trackingNumber: '',
  freightCost: 0,
  customsCost: 0,
  insuranceCost: 0,
  otherCharges: 0,
  notes: '',
  items: []
})

const serialNumberInputs = ref({})
const submitting = ref(false)

// Purchase Order handling methods
const onReceiveTypeChange = (newType) => {
  // Reset relevant fields when receive type changes
  form.referenceType = 'MANUAL'
  form.genericReferenceId = null
  form.genericReferenceNumber = ''
  form.externalReference = ''
  
  // Clear items for single item receive
  if (newType === 'SINGLE_ITEM') {
    form.items = []
    if (form.items.length === 0) {
      addItemRow()
    }
  }
  
  if (newType === 'MULTI_ITEM_FROM_PO') {
    // Load purchase orders if not already loaded
    if (props.purchaseOrders.length === 0) {
      emit('load-purchase-orders', { append: false })
    }
  }
}

const onReferenceTypeChange = (newReferenceType) => {
  form.genericReferenceId = null
  form.genericReferenceNumber = ''
  
  if (newReferenceType === 'PURCHASE_ORDER') {
    // Load purchase orders if not already loaded
    if (props.purchaseOrders.length === 0) {
      emit('load-purchase-orders', { append: false })
    }
  }
}

const onPurchaseOrderSelected = (selectedId) => {
  if (selectedId === 'load-more') {
    emit('load-purchase-orders', {
      page: props.purchaseOrdersPaginationMeta.page + 1,
      append: true
    })
    // Reset selection
    form.genericReferenceId = null
    return
  }
  
  if (selectedId === 'loading') {
    return
  }
  
  // Get the selected purchase order and populate form fields
  const selectedPO = props.purchaseOrders.find(po => po.id?.toString() === selectedId?.toString())
  if (selectedPO) {
    form.genericReferenceId = selectedPO.id
    form.supplierId = selectedPO.supplierId
    // Use invoiceNumber, orderNumber, or purchaseOrder - whichever is available
    const poNumber = selectedPO.invoiceNumber || selectedPO.orderNumber || selectedPO.purchaseOrder || `PO-${selectedPO.id}`
    form.genericReferenceNumber = poNumber
    form.externalReference = poNumber
    // Could also pre-populate items from PO if available
  }
}

const getSelectedOrderInfo = () => {
  if (!form.genericReferenceId) return null
  return props.purchaseOrders.find(po => po.id?.toString() === form.genericReferenceId?.toString())
}

const formatCurrency = (value, currencyCode = 'KES') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(value || 0)
}

// Serial number methods
function addSerialNumber(index) {
  const serial = serialNumberInputs.value[index]
  if (!serial) return
  
  if (!form.items[index].serialNumbers) {
    form.items[index].serialNumbers = []
  }
  
  if (!form.items[index].serialNumbers.includes(serial)) {
    form.items[index].serialNumbers.push(serial)
  }
  
  serialNumberInputs.value[index] = ''
}

function removeSerialNumber(itemIndex, serialIndex) {
  form.items[itemIndex].serialNumbers.splice(serialIndex, 1)
}

// Computed properties
const warehouseGroups = computed(() => {
  // Group active warehouses
  const activeWarehouses = props.warehouses.filter(warehouse => warehouse.isActive)
  
  // Group warehouses by type or treat all as warehouses
  const groups = {}
  activeWarehouses.forEach(warehouse => {
    const type = warehouse.type || 'warehouse'
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(warehouse)
  })

  // Convert to array format for SelectGroup
  return Object.entries(groups).map(([type, warehouses]) => ({
    type,
    warehouses
  }))
})

const isFormValid = computed(() => {
  // Check basic transaction details
  if (!form.transactionDate || !form.warehouseId) {
    return false
  }
  
  // For purchase order receives, check PO selection
  if (form.receiveType === 'MULTI_ITEM_FROM_PO') {
    if (form.referenceType === 'PURCHASE_ORDER' && !form.genericReferenceId) {
      return false
    }
  }
  
  // Check if we have at least one item
  if (form.items.length === 0) {
    return false
  }
  
  // Check that each item has required fields
  for (const item of form.items) {
    if (!item.itemId || !item.quantity || item.quantity <= 0 || !item.unitCost) {
      return false
    }
  }
  
  return true
})

// Methods
function formatCurrentDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function calculateSubtotal(item) {
  const cost = item.unitCost || 0
  const quantity = item.quantity || 0
  return cost * quantity
}

function calculateTotal() {
  return form.items.reduce((total, item) => {
    return total + calculateSubtotal(item)
  }, 0)
}

function addItemRow() {
  const index = form.items.length
  
  // For single item receive, only allow one item
  if (form.receiveType === 'SINGLE_ITEM' && form.items.length >= 1) {
    return
  }
  
  form.items.push({
    itemId: null,
    quantity: 1,
    unitCost: 0,
    qualityStatus: 'PENDING_INSPECTION',
    itemNotes: '',
    lotNumber: '',
    batchNumber: '',
    expirationDate: '',
    serialNumbers: []
  })
  
  serialNumberInputs.value[index] = ''
}

function removeItemRow(index) {
  // For single item receive, don't allow removing the only item
  if (form.receiveType === 'SINGLE_ITEM') {
    return
  }
  
  form.items.splice(index, 1)
  
  // Update serial number inputs
  const newSerialInputs = {}
  Object.keys(serialNumberInputs.value).forEach(key => {
    const keyNum = parseInt(key)
    if (keyNum < index) {
      newSerialInputs[keyNum] = serialNumberInputs.value[keyNum]
    } else if (keyNum > index) {
      newSerialInputs[keyNum - 1] = serialNumberInputs.value[keyNum]
    }
  })
  serialNumberInputs.value = newSerialInputs
}

function formatLocationType(type) {
  switch (type) {
    case 'warehouse': return 'Warehouses'
    case 'main': return 'Main Warehouses'
    case 'distribution': return 'Distribution Centers'
    case 'store': return 'Stores'
    case 'zone': return 'Zones'
    case 'other': return 'Other Locations'
    default: return type.charAt(0).toUpperCase() + type.slice(1) + 's'
  }
}

async function handleSubmit() {
  if (!isFormValid.value) return
  
  submitting.value = true
  
  try {
    // Set locationId to warehouseId for API compatibility
    form.locationId = form.warehouseId
    
    if (form.receiveType === 'SINGLE_ITEM') {
      // Single Item Receive Transaction
      const singleItem = form.items[0]
      const transaction = {
        itemId: singleItem.itemId,
        locationId: form.locationId,
        quantity: singleItem.quantity,
        unitCost: singleItem.unitCost,
        referenceNumber: form.genericReferenceNumber || form.externalReference,
        referenceType: form.referenceType,
        referenceId: form.genericReferenceId,
        supplierId: form.supplierId,
        qualityStatus: singleItem.qualityStatus,
        expectedDate: form.expectedDate,
        receivedDate: form.receivedDate,
        freightCost: form.freightCost || 0,
        customsCost: form.customsCost || 0,
        supplierReference: form.supplierReference,
        trackingNumber: form.trackingNumber,
        notes: form.notes
      }
      
      emit('transaction-created', { type: 'SINGLE_ITEM_RECEIVE', payload: transaction })
    } else if (form.receiveType === 'MULTI_ITEM_FROM_PO' && form.referenceType === 'PURCHASE_ORDER') {
      // Multi-Item Receive from Purchase Order
      const transaction = {
        referenceType: 'PURCHASE_ORDER',
        genericReferenceId: parseInt(form.genericReferenceId),
        genericReferenceNumber: form.genericReferenceNumber,
        locationId: form.locationId,
        warehouseId: form.warehouseId,
        supplierId: form.supplierId,
        transactionDate: form.transactionDate,
        externalReference: form.externalReference,
        supplierReference: form.supplierReference,
        packingSlipNumber: form.packingSlipNumber,
        deliveryNoteNumber: form.deliveryNoteNumber,
        carrierName: form.carrierName,
        trackingNumber: form.trackingNumber,
        expectedDeliveryDate: form.expectedDeliveryDate,
        actualDeliveryDate: form.actualDeliveryDate || form.transactionDate,
        receivedDate: form.receivedDate,
        freightCost: form.freightCost || 0,
        insuranceCost: form.insuranceCost || 0,
        customsDuty: form.customsCost || 0,
        otherCharges: form.otherCharges || 0,
        notes: form.notes,
        priority: form.priority,
        overallQualityStatus: form.overallQualityStatus,
        requiresInspection: form.requiresInspection,
        receivedBy: form.receivedBy,
        items: form.items.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          qualityStatus: item.qualityStatus,
          itemNotes: item.itemNotes,
          // lotNumber: item.lotNumber,
          // batchNumber: item.batchNumber,
          // expirationDate: item.expirationDate,
          // serialNumbers: item.serialNumbers
        }))
      }
      
      emit('multi-receive-from-po', transaction)
    } else {
      // Multi-Item Receive Transaction (standard)
      const transaction = {
        referenceType: form.referenceType,
        genericReferenceId: form.genericReferenceId,
        genericReferenceNumber: form.genericReferenceNumber,
        locationId: form.locationId,
        warehouseId: form.warehouseId,
        supplierId: form.supplierId,
        transactionDate: form.transactionDate,
        externalReference: form.externalReference,
        supplierReference: form.supplierReference,
        packingSlipNumber: form.packingSlipNumber,
        deliveryNoteNumber: form.deliveryNoteNumber,
        carrierName: form.carrierName,
        trackingNumber: form.trackingNumber,
        expectedDeliveryDate: form.expectedDeliveryDate,
        actualDeliveryDate: form.actualDeliveryDate || form.transactionDate,
        receivedDate: form.receivedDate,
        freightCost: form.freightCost || 0,
        insuranceCost: form.insuranceCost || 0,
        customsDuty: form.customsCost || 0,
        otherCharges: form.otherCharges || 0,
        notes: form.notes,
        priority: form.priority,
        overallQualityStatus: form.overallQualityStatus,
        requiresInspection: form.requiresInspection,
        receivedBy: form.receivedBy,
        items: form.items.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          qualityStatus: item.qualityStatus,
          itemNotes: item.itemNotes,
          // lotNumber: item.lotNumber,
          // batchNumber: item.batchNumber,
          // expirationDate: item.expirationDate,
          // serialNumbers: item.serialNumbers
        }))
      }
      
      emit('transaction-created', { type: 'MULTI_ITEM_RECEIVE', payload: transaction })
    }
  } catch (error) {
    console.error('Error creating transaction:', error)
  } finally {
    submitting.value = false
  }
}

// Initialize
onMounted(() => {
  // Add first item row by default
  if (form.items.length === 0) {
    addItemRow()
  }
  
  // Handle pre-filled scanned item if provided
  if (props.scannedItem) {
    // Find the item in our items list
    const matchedItem = props.items.find(
      item => item.id === props.scannedItem.id || 
             item.sku === props.scannedItem.barcode ||
             item.barcode === props.scannedItem.barcode
    )
    
    if (matchedItem) {
      form.items[0].itemId = matchedItem.id
      form.items[0].quantity = 1
      form.items[0].unitCost = matchedItem.cost || 0
    }
  }
})
</script>