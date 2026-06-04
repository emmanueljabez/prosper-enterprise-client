# CyberSource Secure Acceptance Hosted Checkout Integration Plan
## **UPDATED WITH BACKEND DETAILS**

## Overview
Integrate CyberSource Secure Acceptance Hosted Checkout as an additional payment method alongside existing M-Pesa for subscription renewals and session payments.

---

## Backend Technology Stack (Confirmed)

### Spring Boot Application
- **Framework**: Spring Boot 3.5.4
- **Java Version**: Java 17
- **Build Tool**: Gradle
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Spring Data JPA / Hibernate
- **Migrations**: Flyway
- **Project Location**: `/Users/macbookpro/IdeaProjects/ProsperMentor`

### Existing Payment Infrastructure
- **M-Pesa Service**: `MpesaService.java` - Handles STK Push payments
- **Payment Entity**: `Payment.java` - JPA entity with PaymentMethod enum (MPESA, CARD, BANK_TRANSFER, PAYPAL, FREE)
- **Payment Controller**: `PaymentController.java` - REST endpoints
- **Subscription Service**: `SubscriptionService.java` - Manages subscriptions
- **Currency Service**: `CurrencyService.java` - Handles currency conversions

---

## Current Architecture Analysis

### Frontend (Nuxt 3/Vue 3)
**Location**: `/Users/macbookpro/WebstormProjects/myProsperV2`

1. **Component Layer**: `PaymentDialog.vue` - UI and user interactions
2. **Store Layer**: `subscriptions.ts` - State management (Pinia)
3. **Request Layer**: `subscriptions.ts` - API calls via axios
4. **Backend API**: REST endpoints at `http://localhost:8080/api` (dev)

### Backend (Spring Boot)
**Location**: `/Users/macbookpro/IdeaProjects/ProsperMentor`

1. **Controller Layer**: `PaymentController.java` - REST endpoints
2. **Service Layer**: `MpesaService.java`, `SubscriptionService.java`
3. **Repository Layer**: `PaymentRepository.java`, `SubscriptionRepository.java`
4. **Entity Layer**: `Payment.java`, `Subscription.java`

### Current Payment Methods
- **M-Pesa**: Full implementation with STK Push and polling
- **Card**: Enum exists in PaymentMethod but not implemented

### Payment Use Cases
1. **Subscription Upgrades** - `upgradeSubscription()`
2. **Addon Session Purchases** - `purchaseAddonSessions()`
3. **Session Bookings** - Can be paid or from subscription balance

---

## Implementation Plan

### Phase 1: Backend Setup (Spring Boot)

#### 1.1 Environment Configuration

**File**: `src/main/resources/application-local.properties`
```properties
# CyberSource Secure Acceptance Configuration
cybersource.merchant.id=your_test_merchant_id
cybersource.access.key=your_test_access_key
cybersource.secret.key=your_test_secret_key
cybersource.profile.id=your_test_profile_id
cybersource.endpoint.url=https://testsecureacceptance.cybersource.com/pay
cybersource.callback.url=${app.base-url}/api/v1/payments/cybersource/callback
cybersource.return.url=${app.base-url}/payment/cybersource-return
cybersource.cancel.url=${app.base-url}/payment/cybersource-cancel
```

**File**: `src/main/resources/application-prod.properties`
```properties
# Production CyberSource Configuration
cybersource.merchant.id=${CYBERSOURCE_MERCHANT_ID}
cybersource.access.key=${CYBERSOURCE_ACCESS_KEY}
cybersource.secret.key=${CYBERSOURCE_SECRET_KEY}
cybersource.profile.id=${CYBERSOURCE_PROFILE_ID}
cybersource.endpoint.url=https://secureacceptance.cybersource.com/pay
cybersource.callback.url=${CYBERSOURCE_CALLBACK_URL}
cybersource.return.url=${CYBERSOURCE_RETURN_URL}
cybersource.cancel.url=${CYBERSOURCE_CANCEL_URL}
```

#### 1.2 Database Migration

**New Flyway Migration**: `src/main/resources/db/migration/V{next_version}__add_cybersource_support.sql`

```sql
-- Add CyberSource specific fields to existing payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS gateway_transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS gateway_reference VARCHAR(255),
ADD COLUMN IF NOT EXISTS gateway_auth_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS card_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS card_last_four VARCHAR(4);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_gateway_transaction_id
ON payments(gateway_transaction_id);

CREATE INDEX IF NOT EXISTS idx_payments_payment_method
ON payments(payment_method);

-- Create detailed CyberSource transaction tracking table
CREATE TABLE IF NOT EXISTS cybersource_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  transaction_uuid VARCHAR(255) NOT NULL,
  request_id VARCHAR(255),

  -- Authorization details
  auth_code VARCHAR(100),
  auth_amount DECIMAL(10,2),
  auth_response VARCHAR(10),
  auth_time TIMESTAMP,

  -- Card details (masked)
  card_type VARCHAR(50),
  card_number VARCHAR(20), -- masked format: ************1111
  card_expiry VARCHAR(10),

  -- Transaction details
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  decision VARCHAR(20) NOT NULL, -- ACCEPT, DECLINE, REVIEW, ERROR, CANCEL
  reason_code VARCHAR(10),
  message TEXT,

  -- Request/Response data
  req_reference_number VARCHAR(255),
  req_bill_to_forename VARCHAR(100),
  req_bill_to_surname VARCHAR(100),
  req_bill_to_email VARCHAR(255),

  -- Signature verification
  signed_field_names TEXT,
  signature VARCHAR(512),

  -- Raw data for debugging
  raw_request TEXT,
  raw_response TEXT,

  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for CyberSource transactions
CREATE INDEX IF NOT EXISTS idx_cybersource_transactions_payment_id
ON cybersource_transactions(payment_id);

CREATE INDEX IF NOT EXISTS idx_cybersource_transactions_transaction_id
ON cybersource_transactions(transaction_id);

CREATE INDEX IF NOT EXISTS idx_cybersource_transactions_decision
ON cybersource_transactions(decision);

-- Add comments
COMMENT ON TABLE cybersource_transactions IS 'Detailed tracking of CyberSource card payment transactions';
COMMENT ON COLUMN payments.payment_method IS 'Payment method: MPESA, CARD, BANK_TRANSFER, PAYPAL, FREE';
COMMENT ON COLUMN payments.gateway_transaction_id IS 'Transaction ID from payment gateway (CyberSource, etc.)';
```

#### 1.3 Update Payment Entity

**File**: `src/main/java/com/prosper/prospermentor/entity/Payment.java`

Add new fields and methods:
```java
@Entity
@Table(name = "payments")
public class Payment {
    // ... existing fields ...

    /**
     * Gateway transaction ID (for CyberSource, Stripe, etc.)
     */
    @Column(name = "gateway_transaction_id", length = 255)
    private String gatewayTransactionId;

    /**
     * Gateway reference number
     */
    @Column(name = "gateway_reference", length = 255)
    private String gatewayReference;

    /**
     * Gateway authorization code
     */
    @Column(name = "gateway_auth_code", length = 100)
    private String gatewayAuthCode;

    /**
     * Card type (Visa, Mastercard, Amex, etc.)
     */
    @Column(name = "card_type", length = 50)
    private String cardType;

    /**
     * Last 4 digits of card (for display purposes)
     */
    @Column(name = "card_last_four", length = 4)
    private String cardLastFour;

    // ... existing methods ...

    /**
     * Mark payment as successful (card payment)
     */
    public void markAsCardPaymentSuccessful(String transactionId, String authCode,
                                           String cardType, String lastFour) {
        this.status = PaymentStatus.COMPLETED;
        this.paymentMethod = PaymentMethod.CARD;
        this.gatewayTransactionId = transactionId;
        this.gatewayAuthCode = authCode;
        this.cardType = cardType;
        this.cardLastFour = lastFour;
        this.completedAt = LocalDateTime.now();
    }

    /**
     * Mark card payment as failed
     */
    public void markAsCardPaymentFailed(String errorMessage, String reasonCode) {
        this.status = PaymentStatus.FAILED;
        this.paymentMethod = PaymentMethod.CARD;
        this.errorMessage = errorMessage;
        this.resultDescription = reasonCode;
    }

    /**
     * Check if payment is card payment
     */
    public boolean isCardPayment() {
        return paymentMethod == PaymentMethod.CARD;
    }

    /**
     * Get masked card number for display
     */
    public String getMaskedCardNumber() {
        if (cardLastFour != null) {
            return "•••• •••• •••• " + cardLastFour;
        }
        return null;
    }
}
```

#### 1.4 Create CyberSource Transaction Entity

**New File**: `src/main/java/com/prosper/prospermentor/entity/CyberSourceTransaction.java`

```java
package com.prosper.prospermentor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity for tracking detailed CyberSource transaction data
 */
@Entity
@Table(name = "cybersource_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CyberSourceTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    /**
     * Reference to the main payment record
     */
    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", insertable = false, updatable = false)
    private Payment payment;

    /**
     * CyberSource transaction ID
     */
    @Column(name = "transaction_id", nullable = false, unique = true)
    private String transactionId;

    /**
     * Unique transaction UUID generated for this request
     */
    @Column(name = "transaction_uuid", nullable = false)
    private String transactionUuid;

    /**
     * CyberSource request ID
     */
    @Column(name = "request_id")
    private String requestId;

    // Authorization details
    @Column(name = "auth_code")
    private String authCode;

    @Column(name = "auth_amount", precision = 10, scale = 2)
    private BigDecimal authAmount;

    @Column(name = "auth_response", length = 10)
    private String authResponse;

    @Column(name = "auth_time")
    private LocalDateTime authTime;

    // Card details (masked)
    @Column(name = "card_type", length = 50)
    private String cardType;

    @Column(name = "card_number", length = 20)
    private String cardNumber; // Masked: ************1111

    @Column(name = "card_expiry", length = 10)
    private String cardExpiry;

    // Transaction details
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", length = 3, nullable = false)
    private String currency;

    @Column(name = "decision", length = 20, nullable = false)
    private String decision; // ACCEPT, DECLINE, REVIEW, ERROR, CANCEL

    @Column(name = "reason_code", length = 10)
    private String reasonCode;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    // Request data
    @Column(name = "req_reference_number")
    private String reqReferenceNumber;

    @Column(name = "req_bill_to_forename", length = 100)
    private String reqBillToForename;

    @Column(name = "req_bill_to_surname", length = 100)
    private String reqBillToSurname;

    @Column(name = "req_bill_to_email")
    private String reqBillToEmail;

    // Signature verification
    @Column(name = "signed_field_names", columnDefinition = "TEXT")
    private String signedFieldNames;

    @Column(name = "signature", length = 512)
    private String signature;

    // Raw data for debugging
    @Column(name = "raw_request", columnDefinition = "TEXT")
    private String rawRequest;

    @Column(name = "raw_response", columnDefinition = "TEXT")
    private String rawResponse;

    // Audit fields
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public boolean isApproved() {
        return "ACCEPT".equalsIgnoreCase(decision);
    }

    public boolean isDeclined() {
        return "DECLINE".equalsIgnoreCase(decision);
    }

    public boolean requiresReview() {
        return "REVIEW".equalsIgnoreCase(decision);
    }
}
```

#### 1.5 Create Repository

**New File**: `src/main/java/com/prosper/prospermentor/repository/CyberSourceTransactionRepository.java`

```java
package com.prosper.prospermentor.repository;

import com.prosper.prospermentor.entity.CyberSourceTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CyberSourceTransactionRepository extends JpaRepository<CyberSourceTransaction, UUID> {

    Optional<CyberSourceTransaction> findByTransactionId(String transactionId);

    Optional<CyberSourceTransaction> findByPaymentId(UUID paymentId);

    Optional<CyberSourceTransaction> findByTransactionUuid(String transactionUuid);
}
```

#### 1.6 Create CyberSource Service

**New File**: `src/main/java/com/prosper/prospermentor/service/CyberSourceService.java`

```java
package com.prosper.prospermentor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prosper.prospermentor.entity.CyberSourceTransaction;
import com.prosper.prospermentor.entity.Payment;
import com.prosper.prospermentor.repository.CyberSourceTransactionRepository;
import com.prosper.prospermentor.repository.PaymentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service for handling CyberSource Secure Acceptance payments
 */
@Service
@Slf4j
public class CyberSourceService {

    private final PaymentRepository paymentRepository;
    private final CyberSourceTransactionRepository cyberSourceTransactionRepository;
    private final SubscriptionService subscriptionService;
    private final ObjectMapper objectMapper;

    @Value("${cybersource.merchant.id}")
    private String merchantId;

    @Value("${cybersource.access.key}")
    private String accessKey;

    @Value("${cybersource.secret.key}")
    private String secretKey;

    @Value("${cybersource.profile.id}")
    private String profileId;

    @Value("${cybersource.endpoint.url}")
    private String endpointUrl;

    @Value("${cybersource.callback.url}")
    private String callbackUrl;

    @Value("${cybersource.return.url}")
    private String returnUrl;

    @Value("${cybersource.cancel.url}")
    private String cancelUrl;

    @Value("${app.name:ProsperMentor}")
    private String appName;

    public CyberSourceService(PaymentRepository paymentRepository,
                             CyberSourceTransactionRepository cyberSourceTransactionRepository,
                             SubscriptionService subscriptionService,
                             ObjectMapper objectMapper) {
        this.paymentRepository = paymentRepository;
        this.cyberSourceTransactionRepository = cyberSourceTransactionRepository;
        this.subscriptionService = subscriptionService;
        this.objectMapper = objectMapper;
    }

    /**
     * Generate CyberSource payment parameters with signature
     */
    public Map<String, String> generatePaymentParameters(Payment payment) {
        try {
            log.info("Generating CyberSource payment parameters for payment ID: {}", payment.getId());

            // Generate transaction UUID
            String transactionUuid = UUID.randomUUID().toString();
            String referenceNumber = "PAY-" + payment.getId().toString().substring(0, 8).toUpperCase();

            // Generate timestamp in UTC
            String signedDateTime = LocalDateTime.now(ZoneId.of("UTC"))
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'"));

            // Build parameters map
            Map<String, String> params = new LinkedHashMap<>();
            params.put("access_key", accessKey);
            params.put("profile_id", profileId);
            params.put("transaction_uuid", transactionUuid);
            params.put("signed_field_names", buildSignedFieldNames());
            params.put("unsigned_field_names", "");
            params.put("signed_date_time", signedDateTime);
            params.put("locale", "en");
            params.put("transaction_type", "sale");
            params.put("reference_number", referenceNumber);
            params.put("amount", payment.getAmount().toString());
            params.put("currency", payment.getCurrency());
            params.put("payment_method", "card");

            // URLs
            params.put("override_custom_receipt_page", returnUrl);
            params.put("override_custom_cancel_page", cancelUrl);

            // Merchant defined data (for tracking)
            params.put("merchant_defined_data1", payment.getUserId().toString());
            params.put("merchant_defined_data2", payment.getPaymentType().toString());
            if (payment.getSessionId() != null) {
                params.put("merchant_defined_data3", payment.getSessionId().toString());
            } else if (payment.getSubscriptionId() != null) {
                params.put("merchant_defined_data3", payment.getSubscriptionId().toString());
            }
            params.put("merchant_defined_data4", payment.getId().toString());

            // Generate signature
            String signature = generateSignature(params);
            params.put("signature", signature);

            // Save transaction record
            saveCyberSourceTransaction(payment, transactionUuid, referenceNumber, params);

            return params;

        } catch (Exception e) {
            log.error("Error generating CyberSource payment parameters: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate payment parameters", e);
        }
    }

    /**
     * Generate HMAC-SHA256 signature for CyberSource request
     */
    public String generateSignature(Map<String, String> params) {
        try {
            // Get signed field names
            String signedFieldNamesStr = params.get("signed_field_names");
            String[] signedFieldNames = signedFieldNamesStr.split(",");

            // Build data to sign
            StringBuilder dataToSign = new StringBuilder();
            for (int i = 0; i < signedFieldNames.length; i++) {
                String fieldName = signedFieldNames[i];
                String fieldValue = params.get(fieldName);
                dataToSign.append(fieldName).append("=").append(fieldValue != null ? fieldValue : "");
                if (i < signedFieldNames.length - 1) {
                    dataToSign.append(",");
                }
            }

            // Create HMAC-SHA256 signature
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);

            byte[] signatureBytes = sha256_HMAC.doFinal(dataToSign.toString().getBytes(StandardCharsets.UTF_8));
            String signature = Base64.getEncoder().encodeToString(signatureBytes);

            log.debug("Generated signature for data: {}", dataToSign.toString().substring(0, Math.min(100, dataToSign.length())));

            return signature;

        } catch (Exception e) {
            log.error("Error generating signature: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate signature", e);
        }
    }

    /**
     * Verify signature from CyberSource callback
     */
    public boolean verifySignature(Map<String, String> responseParams) {
        try {
            String receivedSignature = responseParams.get("signature");
            if (receivedSignature == null) {
                log.warn("No signature in response");
                return false;
            }

            // Remove signature from params for verification
            Map<String, String> paramsForVerification = new LinkedHashMap<>(responseParams);
            paramsForVerification.remove("signature");

            // Generate expected signature
            String expectedSignature = generateSignature(paramsForVerification);

            boolean isValid = expectedSignature.equals(receivedSignature);
            if (!isValid) {
                log.error("Signature mismatch. Expected: {}, Received: {}", expectedSignature, receivedSignature);
            }

            return isValid;

        } catch (Exception e) {
            log.error("Error verifying signature: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Handle CyberSource callback/response
     */
    @Transactional
    public void handleCallback(Map<String, String> callbackData) {
        try {
            log.info("Processing CyberSource callback for transaction: {}", callbackData.get("transaction_id"));

            // Verify signature first
            if (!verifySignature(callbackData)) {
                log.error("Invalid signature in CyberSource callback");
                throw new SecurityException("Invalid signature");
            }

            String transactionId = callbackData.get("transaction_id");
            String decision = callbackData.get("decision");
            String reasonCode = callbackData.get("reason_code");
            String message = callbackData.get("message");

            // Find transaction record
            CyberSourceTransaction transaction = cyberSourceTransactionRepository
                    .findByTransactionUuid(callbackData.get("req_transaction_uuid"))
                    .orElseThrow(() -> new RuntimeException("Transaction not found"));

            // Update transaction with response data
            updateTransactionWithResponse(transaction, callbackData);

            // Find and update payment
            Payment payment = paymentRepository.findById(transaction.getPaymentId())
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            if ("ACCEPT".equalsIgnoreCase(decision)) {
                // Payment successful
                String authCode = callbackData.get("auth_code");
                String cardType = callbackData.get("req_card_type");
                String cardNumber = callbackData.get("req_card_number");
                String lastFour = cardNumber != null && cardNumber.length() >= 4
                        ? cardNumber.substring(cardNumber.length() - 4)
                        : null;

                payment.markAsCardPaymentSuccessful(transactionId, authCode, cardType, lastFour);
                paymentRepository.save(payment);

                // Update subscription/session status if applicable
                updateRelatedEntities(payment);

                log.info("Payment {} marked as successful", payment.getId());

            } else if ("DECLINE".equalsIgnoreCase(decision)) {
                // Payment declined
                payment.markAsCardPaymentFailed(message, reasonCode);
                paymentRepository.save(payment);

                log.warn("Payment {} declined. Reason: {} - {}", payment.getId(), reasonCode, message);

            } else {
                // Review or other status
                log.info("Payment {} requires review or has other status: {}", payment.getId(), decision);
            }

        } catch (Exception e) {
            log.error("Error handling CyberSource callback: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to handle callback", e);
        }
    }

    /**
     * Build list of signed field names
     */
    private String buildSignedFieldNames() {
        return String.join(",", Arrays.asList(
                "access_key",
                "profile_id",
                "transaction_uuid",
                "signed_field_names",
                "unsigned_field_names",
                "signed_date_time",
                "locale",
                "transaction_type",
                "reference_number",
                "amount",
                "currency",
                "payment_method",
                "override_custom_receipt_page",
                "override_custom_cancel_page",
                "merchant_defined_data1",
                "merchant_defined_data2",
                "merchant_defined_data3",
                "merchant_defined_data4"
        ));
    }

    /**
     * Save initial CyberSource transaction record
     */
    private void saveCyberSourceTransaction(Payment payment, String transactionUuid,
                                           String referenceNumber, Map<String, String> params) {
        try {
            CyberSourceTransaction transaction = new CyberSourceTransaction();
            transaction.setPaymentId(payment.getId());
            transaction.setTransactionUuid(transactionUuid);
            transaction.setReqReferenceNumber(referenceNumber);
            transaction.setAmount(payment.getAmount());
            transaction.setCurrency(payment.getCurrency());
            transaction.setDecision("PENDING");
            transaction.setRawRequest(objectMapper.writeValueAsString(params));

            cyberSourceTransactionRepository.save(transaction);

            log.info("Saved CyberSource transaction record: {}", transaction.getId());

        } catch (Exception e) {
            log.error("Error saving CyberSource transaction: {}", e.getMessage(), e);
        }
    }

    /**
     * Update transaction with CyberSource response data
     */
    private void updateTransactionWithResponse(CyberSourceTransaction transaction,
                                              Map<String, String> response) {
        try {
            transaction.setTransactionId(response.get("transaction_id"));
            transaction.setRequestId(response.get("req_reference_number"));
            transaction.setDecision(response.get("decision"));
            transaction.setReasonCode(response.get("reason_code"));
            transaction.setMessage(response.get("message"));
            transaction.setAuthCode(response.get("auth_code"));
            transaction.setAuthResponse(response.get("auth_response"));

            if (response.get("auth_amount") != null) {
                transaction.setAuthAmount(new BigDecimal(response.get("auth_amount")));
            }

            transaction.setCardType(response.get("req_card_type"));
            transaction.setCardNumber(response.get("req_card_number")); // Already masked by CyberSource
            transaction.setSignedFieldNames(response.get("signed_field_names"));
            transaction.setSignature(response.get("signature"));
            transaction.setRawResponse(objectMapper.writeValueAsString(response));

            if ("ACCEPT".equalsIgnoreCase(response.get("decision"))) {
                transaction.setAuthTime(LocalDateTime.now());
            }

            cyberSourceTransactionRepository.save(transaction);

        } catch (Exception e) {
            log.error("Error updating transaction with response: {}", e.getMessage(), e);
        }
    }

    /**
     * Update subscription/session after successful payment
     */
    private void updateRelatedEntities(Payment payment) {
        try {
            if (payment.getSubscriptionId() != null) {
                // Update subscription status
                subscriptionService.activateSubscriptionAfterPayment(payment);
            }

            if (payment.getSessionId() != null) {
                // Update session status (confirm booking)
                // sessionService.confirmSessionAfterPayment(payment);
            }
        } catch (Exception e) {
            log.error("Error updating related entities: {}", e.getMessage(), e);
        }
    }

    /**
     * Get CyberSource endpoint URL
     */
    public String getEndpointUrl() {
        return endpointUrl;
    }

    /**
     * Get transaction by ID
     */
    public CyberSourceTransaction getTransactionByPaymentId(UUID paymentId) {
        return cyberSourceTransactionRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new RuntimeException("Transaction not found for payment: " + paymentId));
    }
}
```

This is just the first part - I'll create a separate continuation document with the rest of the implementation details. The plan is getting very comprehensive with all the Spring Boot specific code!
