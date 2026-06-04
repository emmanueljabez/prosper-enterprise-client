# CyberSource Secure Acceptance Hosted Checkout Integration Plan

## Overview
Integrate CyberSource Secure Acceptance Hosted Checkout as an additional payment method alongside existing M-Pesa for subscription renewals and session payments.

---

## Current Architecture Analysis

### Existing Payment Flow
1. **Component Layer**: `PaymentDialog.vue` - UI and user interactions
2. **Store Layer**: `subscriptions.ts` - State management (Pinia)
3. **Request Layer**: `subscriptions.ts` - API calls via axios
4. **Backend API**: REST endpoints at `http://localhost:8080/api` (dev)

### Current Payment Methods
- **M-Pesa**: Full implementation with STK Push and polling
- **Card**: Placeholder (disabled, showing "Coming soon")

### Payment Use Cases
1. **Subscription Upgrades** - `upgradeSubscription()`
2. **Addon Session Purchases** - `purchaseAddonSessions()`
3. **Session Bookings** - Currently uses subscription sessions

### Key Files Identified
- **Frontend**:
  - `components/ui/subscriptions/PaymentDialog.vue` - Payment UI
  - `store/modules/subscriptions.ts` - Payment state management
  - `http/requests/app/subscriptions.ts` - API client
  - `http/axios.ts` - Axios instance with auth interceptor

- **Backend** (inferred from API calls):
  - `/v1/subscriptions/upgrade` - Subscription upgrade endpoint
  - `/v1/subscriptions/addons/purchase` - Addon purchase endpoint
  - `/v1/payments/status/:checkoutRequestId` - Payment status polling

---

## CyberSource Integration Strategy

### 1. Payment Method Selection
**Decision**: Hybrid approach - use CyberSource Hosted Checkout for international cards, keep M-Pesa for local payments

**Rationale**:
- CyberSource Secure Acceptance Hosted Checkout redirects users to CyberSource payment page
- Minimal PCI compliance requirements
- Supports multiple card brands and currencies
- Good for international payments while M-Pesa handles local Kenyan market

### 2. Architecture Pattern

#### Frontend Flow:
```
User selects payment method (M-Pesa | Card)
  ↓
If Card:
  → Create payment transaction → Backend generates signature
  → Redirect to CyberSource Hosted Checkout page
  → User completes payment on CyberSource
  → CyberSource redirects back to our app
  → Verify payment status
  → Update UI
```

#### Backend Flow:
```
Receive payment request
  ↓
Generate transaction ID and signature
  ↓
Return CyberSource parameters to frontend
  ↓
[User redirects to CyberSource]
  ↓
Receive webhook/callback from CyberSource
  ↓
Verify signature and update payment status
  ↓
Notify frontend via polling/webhook
```

---

## Implementation Plan

### Phase 1: Backend Setup

#### 1.1 Environment Configuration
**Files to create/modify**:
- `.env` - Add CyberSource credentials

```env
# CyberSource Configuration
CYBERSOURCE_MERCHANT_ID=your_merchant_id
CYBERSOURCE_ACCESS_KEY=your_access_key
CYBERSOURCE_SECRET_KEY=your_secret_key
CYBERSOURCE_PROFILE_ID=your_profile_id
CYBERSOURCE_ENDPOINT_URL=https://testsecureacceptance.cybersource.com/pay
# Production: https://secureacceptance.cybersource.com/pay
```

#### 1.2 Payment Service Layer
**New Backend Files** (API structure inferred):
- `services/payment/CyberSourceService.ts` - Core CyberSource integration
  - `generateSignature()` - Create HMAC-SHA256 signature
  - `buildPaymentForm()` - Generate form parameters
  - `verifyCallback()` - Verify CyberSource response signature
  - `getPaymentStatus()` - Check transaction status

#### 1.3 API Endpoints
**New Backend Routes**:
```
POST /v1/payments/cybersource/initiate
  - Create payment transaction
  - Generate signature
  - Return form parameters

POST /v1/payments/cybersource/callback
  - Receive CyberSource response (webhook)
  - Verify signature
  - Update payment status
  - Update subscription/session status

GET /v1/payments/cybersource/status/:transactionId
  - Check payment status
  - Return to frontend for polling
```

#### 1.4 Database Schema Updates
**New/Modified Tables**:
```sql
-- Add to existing payments table
ALTER TABLE payments ADD COLUMN payment_gateway VARCHAR(50); -- 'mpesa' | 'cybersource'
ALTER TABLE payments ADD COLUMN gateway_transaction_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN gateway_reference VARCHAR(255);
ALTER TABLE payments ADD COLUMN gateway_auth_code VARCHAR(100);
ALTER TABLE payments ADD COLUMN card_type VARCHAR(50); -- visa, mastercard, amex
ALTER TABLE payments ADD COLUMN card_last_four VARCHAR(4);

-- Optional: Create cybersource_transactions table for detailed tracking
CREATE TABLE cybersource_transactions (
  id UUID PRIMARY KEY,
  payment_id UUID REFERENCES payments(id),
  transaction_id VARCHAR(255) UNIQUE,
  request_id VARCHAR(255),
  auth_code VARCHAR(100),
  card_type VARCHAR(50),
  card_number VARCHAR(20), -- masked
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  decision VARCHAR(20), -- ACCEPT, DECLINE, REVIEW, ERROR
  reason_code VARCHAR(10),
  message TEXT,
  signed_fields TEXT,
  signature VARCHAR(512),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

### Phase 2: Frontend Integration

#### 2.1 Update Payment Dialog Component
**File**: `components/ui/subscriptions/PaymentDialog.vue`

**Changes**:
1. Enable card payment option (remove `disabled` flag)
2. Add CyberSource payment handler
3. Create redirect flow for CyberSource Hosted Checkout
4. Handle return from CyberSource payment page

**New Methods**:
```typescript
const handleCyberSourcePayment = async () => {
  // 1. Call backend to initiate payment
  const paymentData = await subscriptionsStore.initiateCyberSourcePayment({
    userId: authStore.loggedInUser.id,
    amount: totalAmount.value,
    currency: 'KES', // or USD for international
    paymentType: isAddonPurchase.value ? 'addon' : 'subscription',
    itemId: isAddonPurchase.value ? null : props.plan.id
  })

  // 2. Create and submit hidden form to CyberSource
  createCyberSourceForm(paymentData.cybersourceParams)
}

const createCyberSourceForm = (params) => {
  // Create hidden form with CyberSource parameters
  // Auto-submit to redirect user to CyberSource
}

const handleCyberSourceReturn = () => {
  // Handle return from CyberSource
  // Poll payment status
  // Update UI based on result
}
```

#### 2.2 Update Subscriptions Store
**File**: `store/modules/subscriptions.ts`

**New Actions**:
```typescript
const initiateCyberSourcePayment = async (payload: CyberSourcePaymentPayload) => {
  isProcessing.value = true
  error.value = null

  try {
    const response = await subscriptionsApi.initiateCyberSourcePayment(payload)
    if (response.success) {
      return response.data
    } else {
      error.value = response.message
      return null
    }
  } catch (err) {
    error.value = err.message
    return null
  } finally {
    isProcessing.value = false
  }
}

const verifyCyberSourcePayment = async (transactionId: string) => {
  try {
    const response = await subscriptionsApi.getCyberSourcePaymentStatus(transactionId)
    return response
  } catch (err) {
    error.value = err.message
    return null
  }
}
```

#### 2.3 Update API Client
**File**: `http/requests/app/subscriptions.ts`

**New Types**:
```typescript
export interface CyberSourcePaymentPayload {
  userId: string
  amount: number
  currency: string
  paymentType: 'subscription' | 'addon' | 'session'
  itemId?: string
  returnUrl?: string
  cancelUrl?: string
}

export interface CyberSourceParams {
  access_key: string
  profile_id: string
  transaction_uuid: string
  signed_field_names: string
  unsigned_field_names: string
  signed_date_time: string
  locale: string
  transaction_type: string
  reference_number: string
  amount: string
  currency: string
  merchant_defined_data1?: string
  signature: string
  // ... other CyberSource fields
}

export interface CyberSourcePaymentResponse {
  success: boolean
  message: string
  data: {
    transactionId: string
    cybersourceParams: CyberSourceParams
    cybersourceEndpoint: string
  }
}
```

**New Methods**:
```typescript
async initiateCyberSourcePayment(payload: CyberSourcePaymentPayload): Promise<CyberSourcePaymentResponse> {
  const { data } = await api.post('/v1/payments/cybersource/initiate', payload)
  return data
}

async getCyberSourcePaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
  const { data } = await api.get(`/v1/payments/cybersource/status/${transactionId}`)
  return data
}
```

#### 2.4 Create CyberSource Return Handler Page
**New File**: `pages/payment/cybersource-return.vue`

```vue
<script setup lang="ts">
// Handle return from CyberSource
// Extract query parameters
// Verify payment
// Redirect to appropriate page with status
</script>
```

---

### Phase 3: Session Payment Integration

#### 3.1 Add Payment to Session Booking Flow
**Files to modify**:
- `pages/app/mentors/[id].vue` - Mentor booking page
- `components/ui/mentors/SessionBookingDialog.vue` (if exists)

**Flow**:
1. User books session with mentor
2. If session requires payment (outside subscription):
   - Show payment dialog
   - Support both M-Pesa and CyberSource
3. Process payment before confirming session

#### 3.2 Create Session Payment API
**New Backend Endpoints**:
```
POST /v1/sessions/payment/initiate
  - Initiate payment for session booking
  - Support both M-Pesa and CyberSource

POST /v1/sessions/payment/verify
  - Verify session payment status
  - Update session status if paid
```

---

### Phase 4: Security & Error Handling

#### 4.1 Security Measures
1. **Signature Verification**:
   - Verify all CyberSource callbacks
   - Use HMAC-SHA256 with secret key
   - Reject invalid signatures

2. **HTTPS Only**:
   - All production endpoints must use HTTPS
   - CyberSource requires secure callbacks

3. **Transaction Validation**:
   - Verify transaction amounts match expected
   - Check for duplicate transactions
   - Validate currency and merchant ID

4. **Environment Separation**:
   - Use test credentials in development
   - Separate production credentials
   - Never commit secrets to git

#### 4.2 Error Handling
1. **Frontend**:
   - Handle network failures
   - Show appropriate error messages
   - Provide retry mechanism
   - Handle timeout scenarios

2. **Backend**:
   - Log all payment attempts
   - Handle CyberSource API failures
   - Implement retry logic for webhooks
   - Send admin notifications for failures

#### 4.3 Logging & Monitoring
```typescript
// Log payment attempts
logger.info('CyberSource payment initiated', {
  transactionId,
  userId,
  amount,
  currency,
  paymentType
})

// Log payment completions
logger.info('CyberSource payment completed', {
  transactionId,
  decision,
  authCode,
  cardType
})

// Alert on failures
logger.error('CyberSource payment failed', {
  transactionId,
  reasonCode,
  message
})
```

---

### Phase 5: Testing Strategy

#### 5.1 CyberSource Test Environment
1. Use CyberSource test credentials
2. Test endpoint: `https://testsecureacceptance.cybersource.com/pay`
3. Use test card numbers:
   - Success: 4111111111111111
   - Decline: 4000300011112220
   - Review: 4000100011112224

#### 5.2 Test Scenarios

**Subscription Payments**:
- [ ] Upgrade subscription with CyberSource card
- [ ] Handle successful payment
- [ ] Handle declined payment
- [ ] Handle payment timeout
- [ ] Verify subscription activation after payment

**Addon Purchases**:
- [ ] Purchase addon sessions with card
- [ ] Verify session credits added
- [ ] Handle partial failures

**Session Payments**:
- [ ] Book and pay for session
- [ ] Verify session confirmed after payment
- [ ] Test with different currencies (if supported)

**Error Scenarios**:
- [ ] Network failure during redirect
- [ ] User abandons payment
- [ ] Invalid signature from CyberSource
- [ ] Duplicate transaction attempts
- [ ] Amount mismatch attacks

**Cross-Payment Method Tests**:
- [ ] Switch between M-Pesa and Card
- [ ] Verify both methods work independently
- [ ] Test payment status polling for both

---

### Phase 6: User Experience Enhancements

#### 6.1 Payment Method Selection
- Clear icons and labels for M-Pesa vs Card
- Show supported card brands (Visa, Mastercard, Amex)
- Display currency and conversion rates if applicable
- Show security badges (PCI DSS, SSL)

#### 6.2 Loading States
- Show loading indicator during redirect
- Display "Redirecting to secure payment..." message
- Handle return with status messaging

#### 6.3 Payment Receipts
- Email receipt after successful payment
- Show payment details in user dashboard
- Downloadable invoice/receipt

---

## Configuration Details

### CyberSource Secure Acceptance Parameters

**Required Fields**:
```javascript
{
  // Merchant Configuration
  access_key: process.env.CYBERSOURCE_ACCESS_KEY,
  profile_id: process.env.CYBERSOURCE_PROFILE_ID,

  // Transaction Details
  transaction_uuid: generateUUID(),
  transaction_type: 'sale', // or 'authorization'
  reference_number: `SUB-${subscriptionId}`,
  amount: '1000.00',
  currency: 'KES',

  // Timestamps
  signed_date_time: new Date().toISOString(),

  // URLs
  override_custom_receipt_page: `${appUrl}/payment/cybersource-return`,
  override_custom_cancel_page: `${appUrl}/payment/cybersource-cancel`,

  // Locale
  locale: 'en',

  // Custom Data (for tracking)
  merchant_defined_data1: userId,
  merchant_defined_data2: paymentType, // 'subscription' | 'addon' | 'session'
  merchant_defined_data3: itemId,

  // Signature Fields
  signed_field_names: 'access_key,profile_id,transaction_uuid,...',
  unsigned_field_names: '',
  signature: calculateSignature(...)
}
```

### Signature Generation Algorithm
```typescript
function generateSignature(params: Record<string, string>, secretKey: string): string {
  // 1. Get signed field names
  const signedFields = params.signed_field_names.split(',')

  // 2. Build data to sign
  const dataToSign = signedFields
    .map(field => `${field}=${params[field]}`)
    .join(',')

  // 3. Create HMAC-SHA256 signature
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(dataToSign)
    .digest('base64')

  return signature
}
```

---

## Deployment Checklist

### Development
- [ ] Set up CyberSource test account
- [ ] Configure test credentials in `.env`
- [ ] Implement backend CyberSource service
- [ ] Create database migrations
- [ ] Update frontend payment dialog
- [ ] Create return/cancel pages
- [ ] Add API endpoints
- [ ] Implement signature generation/verification
- [ ] Test with CyberSource test cards
- [ ] Add logging and monitoring

### Staging
- [ ] Deploy to staging environment
- [ ] Configure staging CyberSource credentials
- [ ] Run full test suite
- [ ] Test webhook callbacks
- [ ] Verify email notifications
- [ ] Load testing
- [ ] Security audit

### Production
- [ ] Obtain production CyberSource credentials
- [ ] Configure production environment variables
- [ ] Set up SSL/HTTPS
- [ ] Configure production callback URLs in CyberSource portal
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Monitor first transactions closely
- [ ] Set up payment failure alerts
- [ ] Document runbook for payment issues

---

## Success Metrics

### Technical Metrics
- Payment success rate > 95%
- Average payment completion time < 60 seconds
- Zero security incidents
- Webhook processing < 2 seconds
- Zero duplicate charges

### Business Metrics
- Increased conversion rate for international users
- Reduced payment abandonment rate
- Support for multiple currencies
- Improved user satisfaction scores

---

## Risk Mitigation

### Risk 1: Payment Failures
**Mitigation**:
- Implement robust retry logic
- Provide clear error messages
- Offer alternative payment method (M-Pesa fallback)
- Monitor and alert on failure spikes

### Risk 2: Security Vulnerabilities
**Mitigation**:
- Use HMAC signature verification
- Never store sensitive card data
- Regular security audits
- PCI DSS compliance via hosted checkout

### Risk 3: Integration Complexity
**Mitigation**:
- Start with test environment
- Phased rollout (subscription first, then sessions)
- Comprehensive testing
- Detailed documentation

### Risk 4: User Experience Issues
**Mitigation**:
- Clear UI/UX for payment method selection
- Informative loading states
- Graceful error handling
- User testing before launch

---

## Support & Maintenance

### Documentation Needed
1. Developer guide for CyberSource integration
2. User guide for card payments
3. Troubleshooting guide for common issues
4. API documentation updates

### Monitoring & Alerts
1. Payment success/failure rates
2. Response time monitoring
3. Error rate tracking
4. Webhook delivery monitoring

### Ongoing Maintenance
1. Keep CyberSource SDK/libraries updated
2. Monitor for security advisories
3. Review failed transactions weekly
4. Quarterly security reviews

---

## Open Questions to Clarify with User

1. **Currency Support**:
   - Should we support multiple currencies (KES, USD, EUR)?
   - Or keep it KES only for now?

2. **Session Payments**:
   - Are session payments always from subscription balance?
   - Or do some sessions require direct payment?

3. **Subscription Renewal**:
   - Should renewal be automatic with saved payment method?
   - Or manual renewal each time?

4. **Backend Framework**:
   - What backend framework is being used? (Express, NestJS, etc.)
   - This affects implementation details

5. **Database**:
   - What database system? (PostgreSQL, MySQL, etc.)
   - Do we have existing payment table schema?

6. **Testing Environment**:
   - Do you have CyberSource test credentials?
   - Or need guidance on obtaining them?

---

## Timeline Estimate

### Phase 1: Backend Setup (5-7 days)
- Environment configuration: 0.5 day
- CyberSource service implementation: 2-3 days
- API endpoints: 1-2 days
- Database updates: 1 day
- Testing: 1 day

### Phase 2: Frontend Integration (4-5 days)
- Payment dialog updates: 2 days
- Store updates: 1 day
- Return/cancel pages: 1 day
- Testing: 1 day

### Phase 3: Session Payments (3-4 days)
- API implementation: 1-2 days
- Frontend integration: 1 day
- Testing: 1 day

### Phase 4: Security & Testing (3-4 days)
- Security implementation: 1-2 days
- Comprehensive testing: 1-2 days

### Phase 5: Documentation & Deployment (2-3 days)
- Documentation: 1 day
- Staging deployment: 0.5 day
- Production deployment: 0.5 day
- Monitoring setup: 0.5 day

**Total Estimated Time: 17-23 days**

---

## Next Steps

1. **User Clarification**: Answer open questions above
2. **CyberSource Account**: Set up test account and obtain credentials
3. **Backend Framework Review**: Understand backend structure
4. **Database Schema Review**: Review existing payment tables
5. **Begin Implementation**: Start with Phase 1 backend setup

---

*This plan is comprehensive and ready for implementation once open questions are clarified. The architecture follows existing patterns and maintains consistency with current M-Pesa integration.*
