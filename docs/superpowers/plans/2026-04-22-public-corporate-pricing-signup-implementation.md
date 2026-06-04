# Public Corporate Pricing, Signup, and Activation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public corporate acquisition flow with a public `/pricing` page, company-only `/auth/signup`, and mandatory `/app/admin/activate` session-purchase gate before a company admin can use the corporate workspace.

**Architecture:** Keep one onboarding pipeline. Public pricing stores a local pre-auth selection, public signup creates and completes a persisted backend signup intent, and activation either resumes the signup intent purchase or creates a secured company-subscription invoice for an already-authenticated company admin. Backend invoice creation remains inside the existing company-subscription service; public endpoints only establish intent and orchestrate signup completion.

**Tech Stack:** Nuxt 3, Vue 3, Pinia, Axios, Node assert-based frontend tests, Spring Boot, Spring Security, JPA/Hibernate, Flyway, PostgreSQL, JUnit 5, Mockito.

---

## File Structure

### Backend: `/Users/macbookpro/IdeaProjects/ProsperMentor`

- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/resources/db/migration/V54__Create_company_signup_intents.sql`
  - Add the persisted `company_signup_intents` table.
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/CompanySignupIntent.java`
  - JPA model for public corporate signup state.
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/CompanySignupIntentRepository.java`
  - Lookup by token, pending status, linked company, and linked profile.
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CreateCompanySignupIntentRequest.java`
  - Public create-intent request DTO.
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CompleteCompanySignupIntentRequest.java`
  - Public complete-intent request DTO.
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanySignupIntentService.java`
  - Create, load, complete, and expire signup intents.
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyAdminRegistrationService.java`
  - Shared orchestration for company-admin account completion so `AuthController` and the new public controller do not duplicate Supabase signup/signin logic.
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/PublicCompanySignupIntentController.java`
  - Public endpoints under `/api/v1/public/company-signup-intents`.
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyService.java`
  - Extract a helper that creates a pending company registration record without exposing the generic create-company endpoint as the public contract.
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/AuthController.java`
  - Delegate existing company-registration completion to the shared registration service.
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/config/SecurityConfig.java`
  - Permit only public create/get/complete signup-intent endpoints while keeping purchase resume authenticated.
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanySignupIntentServiceTest.java`
  - Cover intent creation, token reuse rules, and intent lookup.
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanyAdminRegistrationServiceTest.java`
  - Cover completion and resume-purchase orchestration.

### Frontend: `/Users/macbookpro/WebstormProjects/myProsperV2`

- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/http/requests/public/companySignup.ts`
  - Axios client for public signup-intent APIs.
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/company-signup.ts`
  - Local pre-auth pricing selection + backend signup-intent lifecycle.
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/company-activation.ts`
  - Activation-state loading and purchase-resume actions.
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/components/auth/AuthSplitShell.vue`
  - Shared login/signup two-column shell.
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/pricing.vue`
  - Public corporate pricing page.
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/auth/signup.vue`
  - Company-only signup page using the login shell.
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/admin/activate.vue`
  - Mandatory activation page before the admin workspace unlocks.
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/auth/login.vue`
  - Route company admins with activation work to `/app/admin/activate` and update the signup link.
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/auth.ts`
  - Extract a reusable authenticated-session hydrator and wire public-signup completion into the same local auth/session behavior.
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/landing.vue`
  - Point public pricing navigation to `/pricing`.
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/middleware/auth.global.ts`
  - Make `/pricing` public and redirect incomplete company admins to `/app/admin/activate`.
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/utils/roleManager.ts`
  - Allow `/app/admin/activate` for company admins.
- Test: `/Users/macbookpro/WebstormProjects/myProsperV2/tests/public-pricing-route.test.mjs`
  - Verify landing and pricing route wiring.
- Test: `/Users/macbookpro/WebstormProjects/myProsperV2/tests/auth-signup-page.test.mjs`
  - Verify signup page uses the shared auth shell and company-only copy.
- Test: `/Users/macbookpro/WebstormProjects/myProsperV2/tests/public-company-signup-data-layer.test.mjs`
  - Verify the public signup and activation stores expose the expected actions.
- Test: `/Users/macbookpro/WebstormProjects/myProsperV2/tests/corporate-activation-page.test.mjs`
  - Verify activation-page route and middleware redirect logic are present.

---

### Task 1: Add Backend Signup-Intent Persistence

**Files:**
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/resources/db/migration/V54__Create_company_signup_intents.sql`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/CompanySignupIntent.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/CompanySignupIntentRepository.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanySignupIntentService.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyService.java`
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanySignupIntentServiceTest.java`

- [ ] **Step 1: Write the failing service test**

```java
@ExtendWith(MockitoExtension.class)
class CompanySignupIntentServiceTest {

    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private CompanySignupIntentRepository companySignupIntentRepository;
    @Mock
    private SubscriptionPlanRepository subscriptionPlanRepository;
    @Mock
    private CompanyService companyService;

    @InjectMocks
    private CompanySignupIntentService companySignupIntentService;

    @Test
    void createIntent_shouldPersistPricingDrivenIntentWithPendingCompanyRegistration() {
        UUID planId = UUID.fromString("11111111-1111-1111-1111-111111111111");

        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setId(planId);
        plan.setIsActive(true);
        plan.setPlanAudience(SubscriptionPlan.PlanAudience.CORPORATE);

        Company company = new Company();
        company.setId(UUID.fromString("22222222-2222-2222-2222-222222222222"));
        company.setName("Acme Airways");
        company.setEmailAddress("ops@acme.test");
        company.setPhoneNumber("+254700000000");
        company.setRegistrationToken("reg-token");
        company.setRegistrationCompleted(false);

        when(subscriptionPlanRepository.findById(planId)).thenReturn(Optional.of(plan));
        when(companySignupIntentRepository.save(any(CompanySignupIntent.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(companyService.createPendingCompanyRegistration(any(CreateCompanyRequest.class))).thenReturn(company);

        CompanySignupIntent intent = companySignupIntentService.createIntent(
                "Acme Airways",
                "ops@acme.test",
                "+254700000000",
                "Ada",
                "Lovelace",
                planId,
                40
        );

        assertThat(intent.getCompany().getId()).isEqualTo(company.getId());
        assertThat(intent.getCompanyRegistrationToken()).isEqualTo("reg-token");
        assertThat(intent.getTargetPlanId()).isEqualTo(planId);
        assertThat(intent.getTargetSessionCount()).isEqualTo(40);
        assertThat(intent.getToken()).isNotBlank();
        assertThat(intent.getStatus()).isEqualTo(CompanySignupIntent.SignupIntentStatus.PENDING);
    }
}
```

- [ ] **Step 2: Run the backend test to verify it fails**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.CompanySignupIntentServiceTest
```

Expected: FAIL with missing `CompanySignupIntent`, repository, and service symbols.

- [ ] **Step 3: Write the minimal persistence and service implementation**

```sql
-- /Users/macbookpro/IdeaProjects/ProsperMentor/src/main/resources/db/migration/V54__Create_company_signup_intents.sql
CREATE TABLE company_signup_intents (
    id UUID PRIMARY KEY,
    token VARCHAR(120) NOT NULL UNIQUE,
    company_id UUID NOT NULL REFERENCES companies(id),
    company_registration_token VARCHAR(120) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    admin_first_name VARCHAR(120) NOT NULL,
    admin_last_name VARCHAR(120) NOT NULL,
    admin_phone_number VARCHAR(80) NOT NULL,
    target_plan_id UUID NULL REFERENCES subscription_plans(id),
    target_session_count INTEGER NULL,
    status VARCHAR(40) NOT NULL,
    linked_user_id UUID NULL,
    linked_profile_id UUID NULL,
    completed_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_company_signup_intents_token ON company_signup_intents(token);
CREATE INDEX idx_company_signup_intents_admin_email_status ON company_signup_intents(admin_email, status);
```

```java
// /Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/CompanySignupIntent.java
@Entity
@Table(name = "company_signup_intents")
@Getter
@Setter
public class CompanySignupIntent {

    public enum SignupIntentStatus {
        PENDING,
        COMPLETED,
        EXPIRED,
        CANCELLED
    }

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "company_registration_token", nullable = false)
    private String companyRegistrationToken;

    @Column(name = "admin_email", nullable = false)
    private String adminEmail;

    @Column(name = "admin_first_name", nullable = false)
    private String adminFirstName;

    @Column(name = "admin_last_name", nullable = false)
    private String adminLastName;

    @Column(name = "admin_phone_number", nullable = false)
    private String adminPhoneNumber;

    @Column(name = "target_plan_id")
    private UUID targetPlanId;

    @Column(name = "target_session_count")
    private Integer targetSessionCount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SignupIntentStatus status;

    @Column(name = "linked_user_id")
    private UUID linkedUserId;

    @Column(name = "linked_profile_id")
    private UUID linkedProfileId;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (token == null || token.isBlank()) token = UUID.randomUUID().toString();
        if (expiresAt == null) expiresAt = LocalDateTime.now().plusDays(7);
        if (status == null) status = SignupIntentStatus.PENDING;
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

```java
// /Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/CompanySignupIntentRepository.java
public interface CompanySignupIntentRepository extends JpaRepository<CompanySignupIntent, UUID> {

    Optional<CompanySignupIntent> findByToken(String token);
}
```

```java
// /Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyService.java
public Company createPendingCompanyRegistration(CreateCompanyRequest request) {
    Optional<Company> existingCompany = companyRepository.findByEmailAddress(request.getEmailAddress());
    if (existingCompany.isPresent()) {
        Company company = existingCompany.get();
        if (Boolean.TRUE.equals(company.getRegistrationCompleted())) {
            throw new IllegalStateException("A company with this email address already exists");
        }
        if (company.getRegistrationToken() == null || company.getRegistrationToken().isBlank()) {
            company.setRegistrationToken(UUID.randomUUID().toString());
            company.setRegistrationTokenExpiry(LocalDateTime.now().plusDays(7));
        }
        return companyRepository.save(company);
    }

    Company company = new Company();
    company.setName(request.getName());
    company.setEmailAddress(request.getEmailAddress());
    company.setPhoneNumber(request.getPhoneNumber());
    company.setWebsite(request.getWebsite());
    company.setCountry(request.getCountry());
    company.setRegistrationToken(UUID.randomUUID().toString());
    company.setRegistrationTokenExpiry(LocalDateTime.now().plusDays(7));
    company.setRegistrationCompleted(false);
    company.setIsActive(true);
    return companyRepository.save(company);
}
```

```java
// /Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanySignupIntentService.java
@Service
@Transactional
public class CompanySignupIntentService {

    private final CompanySignupIntentRepository repository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final CompanyService companyService;

    public CompanySignupIntent createIntent(String companyName,
                                            String workEmail,
                                            String phoneNumber,
                                            String adminFirstName,
                                            String adminLastName,
                                            UUID targetPlanId,
                                            Integer targetSessionCount) {
        SubscriptionPlan plan = null;
        if (targetPlanId != null) {
            plan = subscriptionPlanRepository.findById(targetPlanId)
                    .filter(SubscriptionPlan::supportsCorporatePurchases)
                    .orElseThrow(() -> new IllegalArgumentException("Selected corporate plan is not available"));
        }

        Company company = companyService.createPendingCompanyRegistration(
                new CreateCompanyRequest(companyName, workEmail, phoneNumber, null, null, null, null, null, null, null, null)
        );

        CompanySignupIntent intent = new CompanySignupIntent();
        intent.setCompany(company);
        intent.setCompanyRegistrationToken(company.getRegistrationToken());
        intent.setAdminEmail(workEmail);
        intent.setAdminFirstName(adminFirstName);
        intent.setAdminLastName(adminLastName);
        intent.setAdminPhoneNumber(phoneNumber);
        intent.setTargetPlanId(plan != null ? plan.getId() : null);
        intent.setTargetSessionCount(targetSessionCount);
        return repository.save(intent);
    }

    @Transactional(readOnly = true)
    public CompanySignupIntent requireActiveIntent(String token) {
        CompanySignupIntent intent = repository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Company signup intent not found"));

        if (intent.getStatus() != CompanySignupIntent.SignupIntentStatus.PENDING) {
            throw new IllegalStateException("Company signup intent is no longer active");
        }
        if (intent.getExpiresAt().isBefore(LocalDateTime.now())) {
            intent.setStatus(CompanySignupIntent.SignupIntentStatus.EXPIRED);
            repository.save(intent);
            throw new IllegalStateException("Company signup intent has expired");
        }

        return intent;
    }

    public void markCompleted(String token, UUID linkedUserId, UUID linkedProfileId) {
        CompanySignupIntent intent = requireActiveIntent(token);
        intent.setStatus(CompanySignupIntent.SignupIntentStatus.COMPLETED);
        intent.setLinkedUserId(linkedUserId);
        intent.setLinkedProfileId(linkedProfileId);
        intent.setCompletedAt(LocalDateTime.now());
        repository.save(intent);
    }

    public Map<String, Object> toPublicPayload(CompanySignupIntent intent) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("token", intent.getToken());
        payload.put("companyRegistrationToken", intent.getCompanyRegistrationToken());
        payload.put("companyName", intent.getCompany().getName());
        payload.put("workEmail", intent.getAdminEmail());
        payload.put("firstName", intent.getAdminFirstName());
        payload.put("lastName", intent.getAdminLastName());
        payload.put("planId", intent.getTargetPlanId());
        payload.put("sessionCount", intent.getTargetSessionCount());
        payload.put("status", intent.getStatus().name());
        payload.put("expiresAt", intent.getExpiresAt());
        return payload;
    }
}
```

- [ ] **Step 4: Run the backend test to verify it passes**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.CompanySignupIntentServiceTest
```

Expected: PASS with `1 test completed`.

- [ ] **Step 5: Commit**

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/resources/db/migration/V54__Create_company_signup_intents.sql \
  src/main/java/com/prosper/prospermentor/entity/CompanySignupIntent.java \
  src/main/java/com/prosper/prospermentor/repository/CompanySignupIntentRepository.java \
  src/main/java/com/prosper/prospermentor/service/CompanySignupIntentService.java \
  src/main/java/com/prosper/prospermentor/service/CompanyService.java \
  src/test/java/com/prosper/prospermentor/service/CompanySignupIntentServiceTest.java
git commit -m "feat: persist public company signup intents"
```

### Task 2: Add Public Signup-Intent Completion and Purchase Resume APIs

**Files:**
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CreateCompanySignupIntentRequest.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CompleteCompanySignupIntentRequest.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyAdminRegistrationService.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/PublicCompanySignupIntentController.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/AuthController.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/config/SecurityConfig.java`
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanyAdminRegistrationServiceTest.java`

- [ ] **Step 1: Write the failing orchestration test**

```java
@ExtendWith(MockitoExtension.class)
class CompanyAdminRegistrationServiceTest {

    @Mock
    private CompanySignupIntentService companySignupIntentService;
    @Mock
    private CompanyService companyService;
    @Mock
    private CompanySubscriptionService companySubscriptionService;
    @Mock
    private SupabaseAuthService supabaseAuthService;
    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private CompanyAdminRegistrationService companyAdminRegistrationService;

    @Test
    void resumePurchase_shouldCreateInvoiceUsingLinkedCompanyAndStoredSelection() {
        UUID companyId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        UUID userId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        UUID planId = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");

        Company company = new Company();
        company.setId(companyId);

        CompanySignupIntent intent = new CompanySignupIntent();
        intent.setCompany(company);
        intent.setTargetPlanId(planId);
        intent.setTargetSessionCount(25);

        when(companySignupIntentService.requireActiveIntent("intent-token")).thenReturn(intent);
        when(companySubscriptionService.createCompanySubscription(
                companyId,
                planId,
                25,
                BillingInterval.MONTHLY,
                userId,
                "https://enterprise.prospermentor.com/app/admin/activate?invoice_paid=1",
                "https://enterprise.prospermentor.com/app/admin/activate?invoice_cancelled=1"
        )).thenReturn(Map.of("paymentUrl", "https://pay.example.com/invoice"));

        Map<String, Object> payload = companyAdminRegistrationService.resumePurchase(
                "intent-token",
                userId,
                "https://enterprise.prospermentor.com/app/admin/activate?invoice_paid=1",
                "https://enterprise.prospermentor.com/app/admin/activate?invoice_cancelled=1"
        );

        assertThat(payload).containsEntry("paymentUrl", "https://pay.example.com/invoice");
    }
}
```

- [ ] **Step 2: Run the backend orchestration test to verify it fails**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.CompanyAdminRegistrationServiceTest
```

Expected: FAIL with missing `CompanyAdminRegistrationService` and `requireActiveIntent`/`resumePurchase` methods.

- [ ] **Step 3: Implement the public controller, shared registration service, and security rule**

```java
// /Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CreateCompanySignupIntentRequest.java
@Data
public class CreateCompanySignupIntentRequest {

    @NotBlank
    private String companyName;

    @NotBlank
    @Email
    private String workEmail;

    @NotBlank
    private String phoneNumber;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private UUID planId;

    @Min(1)
    private Integer sessionCount;
}
```

```java
// /Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CompleteCompanySignupIntentRequest.java
@Data
public class CompleteCompanySignupIntentRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    private String phoneNumber;

    private String dateOfBirth;
}
```

```java
// /Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyAdminRegistrationService.java
@Service
public class CompanyAdminRegistrationService {

    public Mono<ResponseEntity<Object>> completeIntent(String token, CompleteCompanySignupIntentRequest request) {
        CompanySignupIntent intent = companySignupIntentService.requireActiveIntent(token);
        return completeFromRegistrationToken(intent.getCompanyRegistrationToken(), request)
                .map(response -> {
                    Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
                    UUID linkedUserId = UUID.fromString(String.valueOf(((Map<?, ?>) responseBody.get("user")).get("id")));
                    UUID linkedProfileId = UUID.fromString(String.valueOf(((Map<?, ?>) responseBody.get("profile")).get("id")));
                    companySignupIntentService.markCompleted(token, linkedUserId, linkedProfileId);
                    return response;
                });
    }

    public Mono<ResponseEntity<Object>> completeFromRegistrationToken(String registrationToken,
                                                                      CompleteCompanySignupIntentRequest request) {
        return supabaseAuthService.createMinimalUser(
                        request.getEmail(),
                        request.getPassword(),
                        "company",
                        request.getFirstName(),
                        request.getLastName()
                )
                .onErrorResume(error -> supabaseAuthService.signInWithPassword(request.getEmail(), request.getPassword()))
                .flatMap(authResponse -> {
                    UUID userId = UUID.fromString(authResponse.get("user").get("id").asText());
                    var signupResponse = companyService.completeCompanyRegistrationWithProfile(
                            registrationToken,
                            userId,
                            request.getEmail(),
                            request.getFirstName(),
                            request.getLastName(),
                            request.getPhoneNumber(),
                            request.getDateOfBirth()
                    );

                    Map<String, Object> payload = objectMapper.convertValue(authResponse, Map.class);
                    payload.put("profile", signupResponse.getData().get("profile"));
                    payload.put("company", signupResponse.getData().get("company"));
                    return Mono.just(ResponseEntity.ok((Object) payload));
                });
    }

    public Map<String, Object> resumePurchase(String token,
                                              UUID userId,
                                              String redirectSuccessUrl,
                                              String redirectCancelUrl) {
        CompanySignupIntent intent = companySignupIntentService.requireActiveIntent(token);
        if (intent.getTargetPlanId() == null || intent.getTargetSessionCount() == null) {
            throw new IllegalStateException("Signup intent does not contain a corporate pricing selection");
        }
        return companySubscriptionService.createCompanySubscription(
                intent.getCompany().getId(),
                intent.getTargetPlanId(),
                intent.getTargetSessionCount(),
                BillingInterval.MONTHLY,
                userId,
                redirectSuccessUrl,
                redirectCancelUrl
        );
    }
}
```

```java
// /Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/PublicCompanySignupIntentController.java
@RestController
@RequestMapping("/api/v1/public/company-signup-intents")
public class PublicCompanySignupIntentController {

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createIntent(@Valid @RequestBody CreateCompanySignupIntentRequest request) {
        CompanySignupIntent intent = companySignupIntentService.createIntent(
                request.getCompanyName(),
                request.getWorkEmail(),
                request.getPhoneNumber(),
                request.getFirstName(),
                request.getLastName(),
                request.getPlanId(),
                request.getSessionCount()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Company signup intent created successfully", companySignupIntentService.toPublicPayload(intent)));
    }

    @GetMapping("/{token}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getIntent(@PathVariable String token) {
        return ResponseEntity.ok(ApiResponse.success("Company signup intent retrieved successfully", companySignupIntentService.toPublicPayload(
                companySignupIntentService.requireActiveIntent(token)
        )));
    }

    @PostMapping("/{token}/complete")
    public Mono<ResponseEntity<Object>> completeIntent(@PathVariable String token,
                                                       @Valid @RequestBody CompleteCompanySignupIntentRequest request) {
        return companyAdminRegistrationService.completeIntent(token, request);
    }

    @PostMapping("/{token}/resume-purchase")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resumePurchase(@PathVariable String token,
                                                                           Authentication authentication,
                                                                           @RequestBody Map<String, String> body) {
        SupabaseUserDetails userDetails = (SupabaseUserDetails) authentication.getPrincipal();
        Map<String, Object> payload = companyAdminRegistrationService.resumePurchase(
                token,
                userDetails.getUserIdAsUuid(),
                body.get("redirectSuccessUrl"),
                body.get("redirectCancelUrl")
        );
        return ResponseEntity.ok(ApiResponse.success("Company purchase resumed successfully", payload));
    }
}
```

```java
// /Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/AuthController.java
@PostMapping("/complete-company-registration")
public Mono<ResponseEntity<Object>> completeCompanyRegistration(@RequestBody CompanyRegistrationSignupRequest request) {
    CompleteCompanySignupIntentRequest delegatedRequest = new CompleteCompanySignupIntentRequest();
    delegatedRequest.setEmail(request.getEmail());
    delegatedRequest.setPassword(request.getPassword());
    delegatedRequest.setFirstName(request.getFirstName());
    delegatedRequest.setLastName(request.getLastName());
    delegatedRequest.setPhoneNumber(request.getPhoneNumber());
    delegatedRequest.setDateOfBirth(request.getDateOfBirth());
    return companyAdminRegistrationService.completeFromRegistrationToken(request.getRegistrationToken(), delegatedRequest);
}
```

```java
// /Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/config/SecurityConfig.java
.requestMatchers(HttpMethod.POST, "/api/v1/public/company-signup-intents").permitAll()
.requestMatchers(HttpMethod.GET, "/api/v1/public/company-signup-intents/*").permitAll()
.requestMatchers(HttpMethod.POST, "/api/v1/public/company-signup-intents/*/complete").permitAll()
```

- [ ] **Step 4: Run the backend tests to verify they pass**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.CompanyAdminRegistrationServiceTest \
  --tests com.prosper.prospermentor.service.CompanySignupIntentServiceTest
```

Expected: PASS with both service tests green.

- [ ] **Step 5: Commit**

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/java/com/prosper/prospermentor/dto/CreateCompanySignupIntentRequest.java \
  src/main/java/com/prosper/prospermentor/dto/CompleteCompanySignupIntentRequest.java \
  src/main/java/com/prosper/prospermentor/service/CompanyAdminRegistrationService.java \
  src/main/java/com/prosper/prospermentor/controller/PublicCompanySignupIntentController.java \
  src/main/java/com/prosper/prospermentor/controller/AuthController.java \
  src/main/java/com/prosper/prospermentor/config/SecurityConfig.java \
  src/test/java/com/prosper/prospermentor/service/CompanyAdminRegistrationServiceTest.java
git commit -m "feat: expose public company signup intent APIs"
```

### Task 3: Add Frontend Public Signup and Activation Data Layers

**Files:**
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/http/requests/public/companySignup.ts`
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/company-signup.ts`
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/company-activation.ts`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/auth.ts`
- Test: `/Users/macbookpro/WebstormProjects/myProsperV2/tests/public-company-signup-data-layer.test.mjs`

- [ ] **Step 1: Write the failing frontend data-layer source test**

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const signupStore = readFileSync(
  new URL('../store/modules/company-signup.ts', import.meta.url),
  'utf8',
)

const activationStore = readFileSync(
  new URL('../store/modules/company-activation.ts', import.meta.url),
  'utf8',
)

assert.match(signupStore, /savePendingSelection/, 'The signup store should persist pricing-driven pre-auth selections.')
assert.match(signupStore, /createIntent/, 'The signup store should create backend signup intents.')
assert.match(signupStore, /completeIntent/, 'The signup store should complete public company signup intents.')
assert.match(activationStore, /loadActivationState/, 'The activation store should load company activation state.')
assert.match(activationStore, /resumeIntentPurchase/, 'The activation store should resume a signup-intent purchase.')
assert.match(activationStore, /createDirectPurchase/, 'The activation store should support standalone activation purchases.')

console.log('Company signup and activation stores verified.')
```

- [ ] **Step 2: Run the frontend source test to verify it fails**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/public-company-signup-data-layer.test.mjs
```

Expected: FAIL because the new stores do not exist yet.

- [ ] **Step 3: Implement the public request client, stores, and auth-session hydrator**

```ts
// /Users/macbookpro/WebstormProjects/myProsperV2/http/requests/public/companySignup.ts
import api from '@/http/axios'

export interface PublicCompanySignupIntentPayload {
  companyName: string
  workEmail: string
  phoneNumber: string
  firstName: string
  lastName: string
  planId?: string | null
  sessionCount?: number | null
}

export default {
  async createIntent(payload: PublicCompanySignupIntentPayload) {
    const { data } = await api.post('/v1/public/company-signup-intents', payload)
    return data
  },
  async getIntent(token: string) {
    const { data } = await api.get(`/v1/public/company-signup-intents/${token}`)
    return data
  },
  async completeIntent(token: string, payload: {
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber: string
    dateOfBirth?: string
  }) {
    const { data } = await api.post(`/v1/public/company-signup-intents/${token}/complete`, payload)
    return data
  },
  async resumePurchase(token: string, payload: { redirectSuccessUrl: string; redirectCancelUrl: string }) {
    const { data } = await api.post(`/v1/public/company-signup-intents/${token}/resume-purchase`, payload)
    return data
  },
}
```

```ts
// /Users/macbookpro/WebstormProjects/myProsperV2/store/modules/company-signup.ts
export const useCompanySignupStore = defineStore('company-signup', () => {
  const pendingSelection = ref<{ planId: string; sessionCount: number } | null>(null)
  const intentToken = ref<string | null>(null)
  const intent = ref<any | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const savePendingSelection = (selection: { planId: string; sessionCount: number }) => {
    pendingSelection.value = selection
    localStorage.setItem('companySignupPendingSelection', JSON.stringify(selection))
  }

  const hydratePendingSelection = () => {
    const raw = localStorage.getItem('companySignupPendingSelection')
    pendingSelection.value = raw ? JSON.parse(raw) : null
  }

  const clearPendingSelection = () => {
    pendingSelection.value = null
    localStorage.removeItem('companySignupPendingSelection')
  }

  const hydrateIntentToken = () => {
    intentToken.value = localStorage.getItem('companySignupIntentToken')
  }

  const createIntent = async (payload: { companyName: string; workEmail: string; phoneNumber: string; firstName: string; lastName: string }) => {
    const response = await companySignupApi.createIntent({
      ...payload,
      planId: pendingSelection.value?.planId || null,
      sessionCount: pendingSelection.value?.sessionCount || null,
    })
    intentToken.value = response.data?.token || null
    intent.value = response.data || null
    if (intentToken.value) {
      localStorage.setItem('companySignupIntentToken', intentToken.value)
    }
    return response
  }

  const completeIntent = async (payload: {
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber: string
    dateOfBirth?: string
  }) => {
    if (!intentToken.value) {
      throw new Error('No signup intent token available')
    }
    const response = await companySignupApi.completeIntent(intentToken.value, payload)
    intent.value = response.data || response
    return response
  }

  const clearIntent = () => {
    intentToken.value = null
    intent.value = null
    localStorage.removeItem('companySignupIntentToken')
  }

  return {
    pendingSelection,
    intentToken,
    intent,
    isLoading,
    error,
    savePendingSelection,
    hydratePendingSelection,
    clearPendingSelection,
    hydrateIntentToken,
    createIntent,
    completeIntent,
    clearIntent,
  }
})
```

```ts
// /Users/macbookpro/WebstormProjects/myProsperV2/store/modules/company-activation.ts
export const useCompanyActivationStore = defineStore('company-activation', () => {
  const companySubscriptions = ref<CompanySubscriptionSummary[]>([])
  const requiresActivation = computed(() =>
    !companySubscriptions.value.some(subscription =>
      subscription.status === 'ACTIVE' && Number(subscription.wallet?.sessionsPurchased || 0) > 0,
    ),
  )

  const loadActivationState = async (companyId: string) => {
    const response = await companySubscriptionsApi.getCompanySubscriptions(companyId)
    companySubscriptions.value = response.data || []
    return companySubscriptions.value
  }

  const resumeIntentPurchase = async (intentToken: string, redirectSuccessUrl: string, redirectCancelUrl: string) =>
    companySignupApi.resumePurchase(intentToken, { redirectSuccessUrl, redirectCancelUrl })

  const createDirectPurchase = async (companyId: string, planId: string, sessionCount: number, redirectSuccessUrl: string, redirectCancelUrl: string) =>
    companySubscriptionsApi.createCompanySubscription({ companyId, planId, sessionCount, redirectSuccessUrl, redirectCancelUrl })

  return { companySubscriptions, requiresActivation, loadActivationState, resumeIntentPurchase, createDirectPurchase }
})
```

```ts
// /Users/macbookpro/WebstormProjects/myProsperV2/store/modules/auth.ts
applyAuthenticatedSession(payload: any, fallback: { email: string; firstName: string; lastName: string }) {
  const responseData = payload.data || payload
  this.loggedInUser = {
    id: responseData.user?.id || responseData.id,
    email: fallback.email,
    name: responseData.user?.name || `${fallback.firstName} ${fallback.lastName}`,
    firstName: fallback.firstName,
    lastName: fallback.lastName,
    provider: 'local',
    roles: responseData.profile?.role
      ? [DEFAULT_ROLES[normalizeFrontendRoleName(responseData.profile.role)] || DEFAULT_ROLES.corporate_admin]
      : [DEFAULT_ROLES.corporate_admin],
    isVerified: true,
    createdAt: responseData.user?.createdAt || new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    companyId: responseData.profile?.company?.id || responseData.company?.companyId,
  }
  localStorage.setItem('token', payload.access_token)
  localStorage.setItem('loggedInUser', JSON.stringify(payload.user))
  localStorage.setItem('profile', JSON.stringify(responseData.profile))
  localStorage.setItem('role', responseData.profile?.role || 'company')
}
```

- [ ] **Step 4: Run the frontend source test to verify it passes**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/public-company-signup-data-layer.test.mjs
```

Expected: PASS with `Company signup and activation stores verified.`

- [ ] **Step 5: Commit**

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git add http/requests/public/companySignup.ts \
  store/modules/company-signup.ts \
  store/modules/company-activation.ts \
  store/modules/auth.ts \
  tests/public-company-signup-data-layer.test.mjs
git commit -m "feat: add public company signup and activation stores"
```

### Task 4: Build the Public `/pricing` Page and Landing Route Wiring

**Files:**
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/pricing.vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/landing.vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/middleware/auth.global.ts`
- Test: `/Users/macbookpro/WebstormProjects/myProsperV2/tests/public-pricing-route.test.mjs`

- [ ] **Step 1: Write the failing pricing-route test**

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const landingSource = readFileSync(new URL('../pages/landing.vue', import.meta.url), 'utf8')
const pricingSource = readFileSync(new URL('../pages/pricing.vue', import.meta.url), 'utf8')
const authMiddlewareSource = readFileSync(new URL('../middleware/auth.global.ts', import.meta.url), 'utf8')

assert.match(landingSource, /go\('\/pricing'\)/, 'Landing navigation should point to /pricing.')
assert.match(pricingSource, /fetchPlans\('CORPORATE'\)/, 'Public pricing should load corporate plans only.')
assert.match(pricingSource, /Buy Sessions/, 'Public pricing should expose the Buy Sessions CTA.')
assert.match(pricingSource, /sessionCount/, 'Public pricing should be session-based, not seat-based.')
assert.match(authMiddlewareSource, /'\/pricing'/, 'The auth middleware should treat /pricing as public.')

console.log('Public pricing route verified.')
```

- [ ] **Step 2: Run the pricing-route test to verify it fails**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/public-pricing-route.test.mjs
```

Expected: FAIL because `/pricing` does not exist and landing still routes to `/plans`.

- [ ] **Step 3: Implement the public pricing page and route wiring**

```vue
<!-- /Users/macbookpro/WebstormProjects/myProsperV2/pages/pricing.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from '#app'
import { storeToRefs } from 'pinia'
import { useSubscriptionsStore } from '@/store/modules/subscriptions'
import { useCompanySignupStore } from '@/store/modules/company-signup'

definePageMeta({ auth: false })

const router = useRouter()
const subscriptionsStore = useSubscriptionsStore()
const companySignupStore = useCompanySignupStore()
const { activePlans } = storeToRefs(subscriptionsStore)
const sessionCount = ref(25)

const corporatePlan = computed(() =>
  activePlans.value.find(plan => plan.planAudience === 'CORPORATE' || plan.planAudience === 'BOTH') || null,
)

onMounted(() => subscriptionsStore.fetchPlans('CORPORATE'))

const beginSignup = async () => {
  if (!corporatePlan.value) return
  companySignupStore.savePendingSelection({ planId: corporatePlan.value.id, sessionCount: sessionCount.value })
  await router.push('/auth/signup')
}
</script>
```

```vue
<!-- /Users/macbookpro/WebstormProjects/myProsperV2/pages/landing.vue -->
<button
  class="text-black font-normal text-[12px] leading-normal px-4 py-2 rounded-full hover:bg-brand-purple/10 transition focus:outline-none focus:ring-2 focus:ring-brand-purple"
  @click="go('/pricing')"
>
  Pricing
</button>
```

```ts
// /Users/macbookpro/WebstormProjects/myProsperV2/middleware/auth.global.ts
const PUBLIC_PATHS = new Set(['/', '/landing', '/pricing'])
```

- [ ] **Step 4: Run the pricing-route test to verify it passes**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/public-pricing-route.test.mjs
```

Expected: PASS with `Public pricing route verified.`

- [ ] **Step 5: Commit**

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git add pages/pricing.vue pages/landing.vue middleware/auth.global.ts tests/public-pricing-route.test.mjs
git commit -m "feat: add public corporate pricing page"
```

### Task 5: Build the Company-Only `/auth/signup` Page with the Login Shell

**Files:**
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/components/auth/AuthSplitShell.vue`
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/auth/signup.vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/auth/login.vue`
- Test: `/Users/macbookpro/WebstormProjects/myProsperV2/tests/auth-signup-page.test.mjs`

- [ ] **Step 1: Write the failing signup-page test**

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const signupSource = readFileSync(new URL('../pages/auth/signup.vue', import.meta.url), 'utf8')
const loginSource = readFileSync(new URL('../pages/auth/login.vue', import.meta.url), 'utf8')
const authShellSource = readFileSync(new URL('../components/auth/AuthSplitShell.vue', import.meta.url), 'utf8')

assert.match(signupSource, /AuthSplitShell/, 'Signup should use the shared auth shell.')
assert.match(signupSource, /Create your company admin account/, 'Signup copy should be company-only.')
assert.match(loginSource, /to="\/auth\/signup"/, 'Login should link to the new signup route.')
assert.match(authShellSource, /lg:grid-cols-2/, 'The shared shell should preserve the existing login-page two-column layout.')

console.log('Auth signup page verified.')
```

- [ ] **Step 2: Run the signup-page test to verify it fails**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/auth-signup-page.test.mjs
```

Expected: FAIL because the new shell and signup page do not exist.

- [ ] **Step 3: Implement the shared auth shell and company-only signup page**

```vue
<!-- /Users/macbookpro/WebstormProjects/myProsperV2/components/auth/AuthSplitShell.vue -->
<template>
  <div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
    <div class="hidden h-screen bg-muted lg:flex lg:items-center lg:justify-center">
      <img src="/images/prosper_mentor_logo.png" alt="Prosper Mentor" width="150" height="150" class="object-cover dark:brightness-[0.2] dark:grayscale">
    </div>
    <div class="flex items-center justify-center py-12">
      <div class="mx-auto grid w-[420px] gap-8">
        <slot />
      </div>
    </div>
  </div>
</template>
```

```vue
<!-- /Users/macbookpro/WebstormProjects/myProsperV2/pages/auth/signup.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '#app'
import { useCompanySignupStore } from '@/store/modules/company-signup'
import { useAuthStore } from '@/store/modules/auth'
import { useToast } from '@/components/ui/toast'

definePageMeta({ auth: false })

const router = useRouter()
const authStore = useAuthStore()
const companySignupStore = useCompanySignupStore()
const { toast } = useToast()
const form = ref({
  companyName: '',
  workEmail: '',
  phoneNumber: '',
  firstName: '',
  lastName: '',
  password: '',
})

onMounted(() => companySignupStore.hydratePendingSelection())
onMounted(() => companySignupStore.hydrateIntentToken())

const submit = async () => {
  await companySignupStore.createIntent(form.value)
  const completeResponse = await companySignupStore.completeIntent({
    email: form.value.workEmail,
    password: form.value.password,
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    phoneNumber: form.value.phoneNumber,
  })
  authStore.applyAuthenticatedSession(completeResponse, {
    email: form.value.workEmail,
    firstName: form.value.firstName,
    lastName: form.value.lastName,
  })
  toast({ title: 'Success', description: 'Company account created successfully.', variant: 'success' })
  await router.push('/app/admin/activate')
}
</script>
```

```vue
<!-- /Users/macbookpro/WebstormProjects/myProsperV2/pages/auth/login.vue -->
<NuxtLink to="/auth/signup" class="underline">
  Sign up
</NuxtLink>
```

- [ ] **Step 4: Run the signup-page test to verify it passes**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/auth-signup-page.test.mjs
```

Expected: PASS with `Auth signup page verified.`

- [ ] **Step 5: Commit**

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git add components/auth/AuthSplitShell.vue pages/auth/signup.vue pages/auth/login.vue tests/auth-signup-page.test.mjs
git commit -m "feat: add company-only auth signup flow"
```

### Task 6: Add `/app/admin/activate`, Login Resume Logic, and Admin Activation Gating

**Files:**
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/admin/activate.vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/auth/login.vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/middleware/auth.global.ts`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/utils/roleManager.ts`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/company-signup.ts`
- Test: `/Users/macbookpro/WebstormProjects/myProsperV2/tests/corporate-activation-page.test.mjs`

- [ ] **Step 1: Write the failing activation-page test**

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const activateSource = readFileSync(new URL('../pages/app/admin/activate.vue', import.meta.url), 'utf8')
const loginSource = readFileSync(new URL('../pages/auth/login.vue', import.meta.url), 'utf8')
const authMiddlewareSource = readFileSync(new URL('../middleware/auth.global.ts', import.meta.url), 'utf8')
const roleManagerSource = readFileSync(new URL('../utils/roleManager.ts', import.meta.url), 'utf8')

assert.match(activateSource, /Continue Payment|Buy Sessions/, 'Activation page should support invoice continuation and new purchase.')
assert.match(loginSource, /\/app\/admin\/activate/, 'Login should redirect incomplete company admins to activation.')
assert.match(authMiddlewareSource, /navigateTo\('\/app\/admin\/activate'\)/, 'Auth middleware should gate inactive company admins.')
assert.match(roleManagerSource, /'\/app\/admin\/activate'/, 'RoleManager should allow the activation route.')

console.log('Corporate activation page verified.')
```

- [ ] **Step 2: Run the activation-page test to verify it fails**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/corporate-activation-page.test.mjs
```

Expected: FAIL because the activation page and redirect logic do not exist.

- [ ] **Step 3: Implement activation page, login resume, and middleware guard**

```vue
<!-- /Users/macbookpro/WebstormProjects/myProsperV2/pages/app/admin/activate.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from '#app'
import { useCompanyActivationStore } from '@/store/modules/company-activation'
import { useCompanySignupStore } from '@/store/modules/company-signup'
import { useAuthStore } from '@/store/modules/auth'
import { useSubscriptionsStore } from '@/store/modules/subscriptions'

definePageMeta({
  requiresAuth: true,
  permissions: ['admin:dashboard:view'],
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const companyActivationStore = useCompanyActivationStore()
const companySignupStore = useCompanySignupStore()
const subscriptionsStore = useSubscriptionsStore()
const sessionCount = ref(companySignupStore.pendingSelection?.sessionCount || 25)

const companyId = computed(() => authStore.loggedInUser?.companyId || '')
const hasPendingIntent = computed(() => Boolean(companySignupStore.intentToken))
const corporatePlan = computed(() =>
  subscriptionsStore.activePlans.find(plan => plan.planAudience === 'CORPORATE' || plan.planAudience === 'BOTH') || null,
)
const selectedPlanId = computed(() => companySignupStore.pendingSelection?.planId || corporatePlan.value?.id || '')

onMounted(async () => {
  companySignupStore.hydratePendingSelection()
  companySignupStore.hydrateIntentToken()
  await subscriptionsStore.fetchPlans('CORPORATE')
  if (companyId.value) {
    await companyActivationStore.loadActivationState(companyId.value)
  }
})

const purchase = async () => {
  const origin = window.location.origin
  const successUrl = `${origin}/app/admin/activate?invoice_paid=1`
  const cancelUrl = `${origin}/app/admin/activate?invoice_cancelled=1`
  const response = hasPendingIntent.value
    ? await companyActivationStore.resumeIntentPurchase(companySignupStore.intentToken!, successUrl, cancelUrl)
    : await companyActivationStore.createDirectPurchase(companyId.value, selectedPlanId.value, sessionCount.value, successUrl, cancelUrl)

  window.location.href = response.data.paymentUrl
}
</script>
```

```ts
// /Users/macbookpro/WebstormProjects/myProsperV2/pages/auth/login.vue
if (['company', 'company_admin', 'corporate_admin'].includes(String(role || '').toLowerCase())) {
  const companyActivationStore = useCompanyActivationStore()
  const companySignupStore = useCompanySignupStore()
  companySignupStore.hydratePendingSelection()
  companySignupStore.hydrateIntentToken()
  const companyId = authStore.loggedInUser?.companyId || result.profile?.company?.id
  if (companyId) {
    await companyActivationStore.loadActivationState(companyId)
  }
  if (companySignupStore.intentToken || companySignupStore.pendingSelection || companyActivationStore.requiresActivation) {
    router.push('/app/admin/activate')
  } else {
    router.push('/app/admin')
  }
}
```

```ts
// /Users/macbookpro/WebstormProjects/myProsperV2/middleware/auth.global.ts
if (to.path.startsWith('/app/admin') && to.path !== '/app/admin/activate') {
  const authStore = useAuthStore()
  const activationStore = useCompanyActivationStore()
  const isCompanyAdmin = RoleManager.isCorporateAdmin(authStore.loggedInUser)
  const companyId = authStore.loggedInUser?.companyId || ''
  if (isCompanyAdmin && companyId) {
    await activationStore.loadActivationState(companyId)
    if (activationStore.requiresActivation) {
      return navigateTo('/app/admin/activate')
    }
  }
}
```

```ts
// /Users/macbookpro/WebstormProjects/myProsperV2/utils/roleManager.ts
'/app/admin/activate': ['admin:dashboard:view'],
```

- [ ] **Step 4: Run the activation-page test and the production build**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/corporate-activation-page.test.mjs
npm run build
```

Expected:

- `Corporate activation page verified.`
- Nuxt build completes successfully.

- [ ] **Step 5: Commit**

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git add pages/app/admin/activate.vue pages/auth/login.vue middleware/auth.global.ts utils/roleManager.ts \
  store/modules/company-signup.ts tests/corporate-activation-page.test.mjs
git commit -m "feat: gate company admins behind activation purchase"
```

### Task 7: Verify End-to-End Across Both Repos

**Files:**
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/docs/superpowers/plans/2026-04-22-public-corporate-pricing-signup-implementation.md`

- [ ] **Step 1: Run backend verification**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.CompanySignupIntentServiceTest \
  --tests com.prosper.prospermentor.service.CompanyAdminRegistrationServiceTest \
  --tests com.prosper.prospermentor.service.CompanySubscriptionServiceSessionWalletTest
./gradlew -q compileJava
```

Expected: backend tests pass and compile completes without errors.

- [ ] **Step 2: Run frontend verification**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/public-pricing-route.test.mjs
node tests/auth-signup-page.test.mjs
node tests/public-company-signup-data-layer.test.mjs
node tests/corporate-activation-page.test.mjs
npm run build
```

Expected: all frontend source tests print their success messages and Nuxt build passes.

- [ ] **Step 3: Run manual browser verification with the local app**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
npm run dev
```

Then verify with `agent-browser`:

```bash
agent-browser open http://localhost:3001/pricing
agent-browser snapshot -i
agent-browser open http://localhost:3001/auth/signup
agent-browser snapshot -i
agent-browser open http://localhost:3001/auth/login
agent-browser snapshot -i
```

Manual assertions:

- `/pricing` shows `Buy Sessions` and session-count copy.
- `/auth/signup` uses the login-shell layout and company-only copy.
- Company-admin login with pending activation routes to `/app/admin/activate`.
- `/app/admin/activate` shows `Continue Payment` when an open invoice exists.

- [ ] **Step 4: Record the verified routes and commands in the plan footer**

```md
Verified flows:
- /pricing -> /auth/signup -> /app/admin/activate
- /auth/signup (standalone) -> /app/admin/activate
- /auth/login (company admin with pending activation) -> /app/admin/activate
```

- [ ] **Step 5: Commit the final verification note**

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git add docs/superpowers/plans/2026-04-22-public-corporate-pricing-signup-implementation.md
git commit -m "docs: record verification for public corporate onboarding flow"
```

## Self-Review

### Spec coverage

- Public `/pricing`: covered by Task 4.
- Company-only `/auth/signup` using login-page shell: covered by Task 5.
- Mandatory `/app/admin/activate`: covered by Task 6.
- Public signup-intent API contract: covered by Tasks 1 and 2.
- Shared backend registration orchestration: covered by Task 2.
- Resume purchase after signup: covered by Task 2 and Task 6.
- Login resume and activation gating: covered by Task 6.
- Cross-repo verification: covered by Task 7.

### Placeholder scan

- No `TODO`, `TBD`, or deferred implementation text remains.
- Each code-changing task includes explicit file paths, code, commands, and commit messages.

### Type consistency

- `CompanySignupIntentService.createIntent(...)` is introduced in Task 1 and used consistently in Task 2.
- `CompanySignupIntentService.requireActiveIntent(...)`, `markCompleted(...)`, and `toPublicPayload(...)` are introduced in Task 1 and used consistently in Task 2.
- `CompanyAdminRegistrationService.resumePurchase(...)` is introduced in Task 2 and used consistently in Task 6.
- `useCompanySignupStore` and `useCompanyActivationStore` action names are consistent across Tasks 3, 4, 5, 6, and 7.
