# Unified B2B B2C Auth Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared backend auth session contract and migrate the enterprise frontend plus B2C signin to consume it while preserving current product-specific routes and legacy Supabase compatibility.

**Architecture:** The backend keeps Supabase as the identity provider and adds a mapper that converts Supabase auth responses plus Prosper profile/free-trial state into a normalized `accessToken`, `refreshToken`, `user`, `profile`, `memberships`, `entitlements`, and `defaultDestination` response. The enterprise frontend reads this contract first while preserving existing fields. The B2C frontend signs in through the backend, then hydrates the existing Supabase client session from the returned Supabase tokens so current B2C profile hooks keep working during migration.

**Tech Stack:** Spring Boot 3.5, Java 17, JUnit 5, Mockito, Nuxt 3, Vue 3, Pinia, Vite, React 18, TypeScript, Supabase Auth.

---

## Scope Check

The full design in `/Users/macbookpro/WebstormProjects/myProsperV2/docs/superpowers/specs/2026-09-23-unified-b2b-b2c-auth-design.md` spans several independent subprojects. This plan implements the first deployable slice:

- Backend unified session response for existing auth endpoints.
- Enterprise frontend compatibility with the unified response.
- B2C signin through backend `/api/auth/login` while preserving Supabase client state.

Separate plans should cover:

- B2C mentee signup migration to backend signup intent fields.
- Mentor signup migration after backend accepts the full mentor onboarding metadata.
- Backend-owned OAuth initiation/callback endpoints.
- Shared-domain HTTP-only cookie rollout.

## File Structure

Backend repository: `/Users/macbookpro/IdeaProjects/ProsperMentor`

- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/auth/UnifiedAuthSession.java`
  - Serializable response records for normalized auth sessions.
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/AuthSessionMapper.java`
  - Converts Supabase auth JSON and Prosper profile/free-trial data into normalized response maps with legacy compatibility fields.
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/AuthController.java`
  - Injects `AuthSessionMapper` and applies it to `login` and `refresh` in this foundation slice.
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/AuthSessionMapperTest.java`
  - Unit coverage for roles, memberships, entitlements, token fields, and destinations.
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/controller/AuthControllerUnifiedSessionTest.java`
  - Controller coverage for `POST /api/auth/login` response compatibility.
- Modify: existing backend auth controller tests that construct `AuthController`.
  - Add `AuthSessionMapper` test dependency construction.

Enterprise frontend repository: `/Users/macbookpro/WebstormProjects/myProsperV2`

- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/utils/authSession.ts`
  - Shared normalization helper for camelCase and legacy auth response fields.
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/auth.ts`
  - Uses `normalizeAuthSession` in `login`, `ssoLogin`, and storage hydration helpers.
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/tests/auth-session-normalization.test.mjs`
  - Source-level regression check for the helper and auth store usage.

B2C frontend repository: `/Users/macbookpro/WebstormProjects/prosper-link-africa`

- Create: `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/services/backendAuthService.ts`
  - Backend auth client for login, refresh, logout, token resolution, and session persistence.
- Modify: `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/components/auth/AuthForm.tsx`
  - Replaces email/password signin with backend login and `supabase.auth.setSession`.
- Modify: `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/hooks/useAuth.tsx`
  - Sign out calls backend logout before clearing local state.
- Create: `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/tests/backend-auth-signin.test.mjs`
  - Source-level regression check for backend signin integration.

---

### Task 1: Backend Unified Session Mapper

**Files:**
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/auth/UnifiedAuthSession.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/AuthSessionMapper.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/AuthSessionMapperTest.java`

- [ ] **Step 1: Write the failing mapper test**

Create `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/AuthSessionMapperTest.java`:

```java
package com.prosper.prospermentor.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class AuthSessionMapperTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AuthSessionMapper mapper = new AuthSessionMapper(objectMapper);

    @Test
    void toLoginResponse_shouldReturnNormalizedFieldsAndKeepLegacyTokens() throws Exception {
        UUID userId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        JsonNode authResponse = objectMapper.readTree("""
                {
                  "access_token": "legacy-access",
                  "refresh_token": "legacy-refresh",
                  "user": {
                    "id": "11111111-1111-1111-1111-111111111111",
                    "email": "hr@example.com",
                    "user_metadata": {
                      "first_name": "Grace",
                      "last_name": "Admin"
                    }
                  }
                }
                """);
        Map<String, Object> profile = Map.of(
                "id", userId,
                "email", "hr@example.com",
                "firstName", "Grace",
                "lastName", "Admin",
                "role", "company",
                "companyId", "22222222-2222-2222-2222-222222222222"
        );

        Map<String, Object> response = mapper.toLoginResponse(authResponse, profile, null, false);

        assertThat(response)
                .containsEntry("access_token", "legacy-access")
                .containsEntry("refresh_token", "legacy-refresh")
                .containsEntry("accessToken", "legacy-access")
                .containsEntry("refreshToken", "legacy-refresh")
                .containsKeys("user", "profile", "memberships", "entitlements", "defaultDestination");

        @SuppressWarnings("unchecked")
        Map<String, Object> user = (Map<String, Object>) response.get("user");
        assertThat(user)
                .containsEntry("id", userId.toString())
                .containsEntry("email", "hr@example.com")
                .containsEntry("firstName", "Grace")
                .containsEntry("lastName", "Admin")
                .containsEntry("displayName", "Grace Admin");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> memberships = (List<Map<String, Object>>) response.get("memberships");
        assertThat(memberships).containsExactly(Map.of(
                "type", "company",
                "role", "corporate_admin",
                "status", "active",
                "companyId", "22222222-2222-2222-2222-222222222222"
        ));

        @SuppressWarnings("unchecked")
        Map<String, Object> destination = (Map<String, Object>) response.get("defaultDestination");
        assertThat(destination)
                .containsEntry("product", "enterprise")
                .containsEntry("url", "https://enterprise.prospermentor.com/app/admin");
    }

    @Test
    void toLoginResponse_shouldExposeFreeTrialEntitlementAndB2cDestination() throws Exception {
        UUID userId = UUID.fromString("33333333-3333-3333-3333-333333333333");
        JsonNode authResponse = objectMapper.readTree("""
                {
                  "access_token": "trial-access",
                  "refresh_token": "trial-refresh",
                  "user": {
                    "id": "33333333-3333-3333-3333-333333333333",
                    "email": "mentee@example.com"
                  }
                }
                """);
        Map<String, Object> profile = Map.of(
                "id", userId,
                "email", "mentee@example.com",
                "firstName", "Mentee",
                "lastName", "User",
                "role", "mentee"
        );
        Map<String, Object> freeTrial = Map.of(
                "requested", true,
                "activated", true,
                "remainingSessions", 1,
                "sessionDurationMinutes", 30
        );

        Map<String, Object> response = mapper.toLoginResponse(authResponse, profile, freeTrial, true);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> entitlements = (List<Map<String, Object>>) response.get("entitlements");
        assertThat(entitlements).containsExactly(Map.of(
                "type", "free_trial",
                "status", "active",
                "remainingSessions", 1,
                "sessionDurationMinutes", 30
        ));

        @SuppressWarnings("unchecked")
        Map<String, Object> destination = (Map<String, Object>) response.get("defaultDestination");
        assertThat(destination)
                .containsEntry("product", "b2c")
                .containsEntry("url", "https://prospermentor.com/mentors");
    }
}
```

- [ ] **Step 2: Run the mapper test to verify it fails**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.AuthSessionMapperTest
```

Expected: FAIL because `AuthSessionMapper` does not exist.

- [ ] **Step 3: Add the response records**

Create `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/auth/UnifiedAuthSession.java`:

```java
package com.prosper.prospermentor.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UnifiedAuthSession(
        String accessToken,
        String refreshToken,
        UserPayload user,
        Map<String, Object> profile,
        List<MembershipPayload> memberships,
        List<EntitlementPayload> entitlements,
        String nextAction,
        DestinationPayload defaultDestination
) {
    public record UserPayload(
            String id,
            String email,
            String firstName,
            String lastName,
            String displayName,
            String avatarUrl,
            Boolean emailVerified,
            String provider
    ) {}

    public record MembershipPayload(
            String type,
            String role,
            String status,
            String companyId
    ) {}

    public record EntitlementPayload(
            String type,
            String status,
            Integer remainingSessions,
            Integer sessionDurationMinutes
    ) {}

    public record DestinationPayload(
            String product,
            String url
    ) {}
}
```

- [ ] **Step 4: Add the mapper implementation**

Create `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/AuthSessionMapper.java`:

```java
package com.prosper.prospermentor.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prosper.prospermentor.dto.auth.UnifiedAuthSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthSessionMapper {

    private static final String B2C_BASE_URL = "https://prospermentor.com";
    private static final String ENTERPRISE_BASE_URL = "https://enterprise.prospermentor.com";

    private final ObjectMapper objectMapper;

    public Map<String, Object> toLoginResponse(JsonNode authResponse,
                                               Map<String, Object> profile,
                                               Map<String, Object> freeTrial,
                                               boolean freeTrialRequested) {
        Map<String, Object> response = authResponse == null || authResponse.isNull()
                ? new LinkedHashMap<>()
                : objectMapper.convertValue(authResponse, new TypeReference<LinkedHashMap<String, Object>>() {});

        String accessToken = text(authResponse, "access_token");
        String refreshToken = text(authResponse, "refresh_token");
        JsonNode userNode = authResponse != null && authResponse.has("user") ? authResponse.get("user") : null;

        UnifiedAuthSession.UserPayload user = buildUser(userNode, profile);
        String normalizedRole = normalizeRole(value(profile, "role"));
        List<UnifiedAuthSession.MembershipPayload> memberships = buildMemberships(normalizedRole, profile);
        List<UnifiedAuthSession.EntitlementPayload> entitlements = buildEntitlements(freeTrial);
        UnifiedAuthSession.DestinationPayload destination = buildDestination(normalizedRole, freeTrialRequested);

        UnifiedAuthSession session = new UnifiedAuthSession(
                accessToken,
                refreshToken,
                user,
                profile,
                memberships,
                entitlements,
                null,
                destination
        );

        Map<String, Object> normalized = objectMapper.convertValue(session, new TypeReference<LinkedHashMap<String, Object>>() {});
        normalized.entrySet().removeIf(entry -> entry.getValue() == null);
        response.putAll(normalized);

        if (profile != null) {
            response.put("profile", profile);
        }
        if (freeTrial != null) {
            response.put("freeTrial", freeTrial);
        }

        return response;
    }

    public Map<String, Object> toRefreshResponse(JsonNode authResponse) {
        return toLoginResponse(authResponse, null, null, false);
    }

    private UnifiedAuthSession.UserPayload buildUser(JsonNode userNode, Map<String, Object> profile) {
        String id = firstNonBlank(text(userNode, "id"), value(profile, "id"));
        String email = firstNonBlank(text(userNode, "email"), value(profile, "email"));
        String firstName = firstNonBlank(value(profile, "firstName"), value(profile, "first_name"), metadata(userNode, "first_name"), metadata(userNode, "firstName"));
        String lastName = firstNonBlank(value(profile, "lastName"), value(profile, "last_name"), metadata(userNode, "last_name"), metadata(userNode, "lastName"));
        String displayName = firstNonBlank(value(profile, "displayName"), joinName(firstName, lastName), email);
        String avatarUrl = firstNonBlank(value(profile, "avatarUrl"), value(profile, "avatar_url"), metadata(userNode, "avatar_url"));
        Boolean emailVerified = userNode != null && userNode.has("email_confirmed_at") && !userNode.get("email_confirmed_at").isNull();
        String provider = firstNonBlank(metadata(userNode, "provider"), "local");

        return new UnifiedAuthSession.UserPayload(id, email, firstName, lastName, displayName, avatarUrl, emailVerified, provider);
    }

    private List<UnifiedAuthSession.MembershipPayload> buildMemberships(String role, Map<String, Object> profile) {
        List<UnifiedAuthSession.MembershipPayload> memberships = new ArrayList<>();
        String companyId = firstNonBlank(value(profile, "companyId"), value(profile, "company_id"));

        if ("corporate_admin".equals(role) || "employee".equals(role)) {
            memberships.add(new UnifiedAuthSession.MembershipPayload("company", role, "active", companyId));
            return memberships;
        }

        memberships.add(new UnifiedAuthSession.MembershipPayload("b2c", role, "active", null));
        return memberships;
    }

    private List<UnifiedAuthSession.EntitlementPayload> buildEntitlements(Map<String, Object> freeTrial) {
        List<UnifiedAuthSession.EntitlementPayload> entitlements = new ArrayList<>();
        if (freeTrial == null || freeTrial.isEmpty()) {
            return entitlements;
        }

        boolean activated = Boolean.TRUE.equals(freeTrial.get("activated"));
        Integer remainingSessions = integerValue(freeTrial.get("remainingSessions"));
        Integer sessionDurationMinutes = integerValue(freeTrial.get("sessionDurationMinutes"));
        entitlements.add(new UnifiedAuthSession.EntitlementPayload(
                "free_trial",
                activated ? "active" : "unavailable",
                remainingSessions,
                sessionDurationMinutes
        ));
        return entitlements;
    }

    private UnifiedAuthSession.DestinationPayload buildDestination(String role, boolean freeTrialRequested) {
        if (freeTrialRequested) {
            return new UnifiedAuthSession.DestinationPayload("b2c", B2C_BASE_URL + "/mentors");
        }
        if ("corporate_admin".equals(role)) {
            return new UnifiedAuthSession.DestinationPayload("enterprise", ENTERPRISE_BASE_URL + "/app/admin");
        }
        if ("employee".equals(role)) {
            return new UnifiedAuthSession.DestinationPayload("enterprise", ENTERPRISE_BASE_URL + "/app/employee");
        }
        return new UnifiedAuthSession.DestinationPayload("b2c", B2C_BASE_URL + "/dashboard");
    }

    private String normalizeRole(String rawRole) {
        String role = rawRole == null || rawRole.isBlank() ? "mentee" : rawRole.trim().toLowerCase();
        if (role.equals("company") || role.equals("company_admin")) {
            return "corporate_admin";
        }
        if (role.equals("advisee")) {
            return "mentee";
        }
        if (role.equals("advisor")) {
            return "mentor";
        }
        return role;
    }

    private String metadata(JsonNode userNode, String key) {
        if (userNode == null || !userNode.has("user_metadata")) {
            return null;
        }
        JsonNode metadata = userNode.get("user_metadata");
        return text(metadata, key);
    }

    private String text(JsonNode node, String key) {
        if (node == null || !node.has(key) || node.get(key).isNull()) {
            return null;
        }
        return node.get(key).asText();
    }

    private String value(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key) || map.get(key) == null) {
            return null;
        }
        return String.valueOf(map.get(key));
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private String joinName(String firstName, String lastName) {
        String joined = String.join(" ",
                firstName == null ? "" : firstName.trim(),
                lastName == null ? "" : lastName.trim()
        ).trim();
        return joined.isBlank() ? null : joined;
    }

    private Integer integerValue(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String string && !string.isBlank()) {
            return Integer.parseInt(string);
        }
        return null;
    }
}
```

- [ ] **Step 5: Run the mapper test to verify it passes**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.AuthSessionMapperTest
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/java/com/prosper/prospermentor/dto/auth/UnifiedAuthSession.java \
  src/main/java/com/prosper/prospermentor/service/AuthSessionMapper.java \
  src/test/java/com/prosper/prospermentor/service/AuthSessionMapperTest.java
git commit -m "feat: add unified auth session mapper"
```

---

### Task 2: Backend AuthController Response Wiring

**Files:**
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/AuthController.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/controller/AuthControllerUnifiedSessionTest.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/controller/AuthControllerFreeTrialTest.java`

- [ ] **Step 1: Write the failing controller test**

Create `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/controller/AuthControllerUnifiedSessionTest.java`:

```java
package com.prosper.prospermentor.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prosper.prospermentor.service.AuthSessionMapper;
import com.prosper.prospermentor.service.CompanyAdminRegistrationService;
import com.prosper.prospermentor.service.CompanyService;
import com.prosper.prospermentor.service.PasswordResetService;
import com.prosper.prospermentor.service.ProfileService;
import com.prosper.prospermentor.service.SubscriptionService;
import com.prosper.prospermentor.service.SupabaseAuthService;
import com.prosper.prospermentor.service.notification.MenteeNotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerUnifiedSessionTest {

    @Mock private SupabaseAuthService supabaseAuthService;
    @Mock private ProfileService profileService;
    @Mock private CompanyService companyService;
    @Mock private CompanyAdminRegistrationService companyAdminRegistrationService;
    @Mock private SubscriptionService subscriptionService;
    @Mock private MenteeNotificationService menteeNotificationService;
    @Mock private PasswordResetService passwordResetService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private AuthController authController;

    @BeforeEach
    void setUp() {
        authController = new AuthController(
                supabaseAuthService,
                profileService,
                companyService,
                companyAdminRegistrationService,
                subscriptionService,
                objectMapper,
                menteeNotificationService,
                passwordResetService,
                new AuthSessionMapper(objectMapper)
        );
    }

    @Test
    void login_shouldReturnUnifiedSessionFieldsAndLegacyTokenFields() throws Exception {
        UUID userId = UUID.fromString("44444444-4444-4444-4444-444444444444");
        AuthController.LoginRequest request = new AuthController.LoginRequest();
        request.setEmail("employee@example.com");
        request.setPassword("Password123!");

        when(supabaseAuthService.signInWithPassword("employee@example.com", "Password123!"))
                .thenReturn(Mono.just(objectMapper.readTree("""
                        {
                          "access_token": "access-value",
                          "refresh_token": "refresh-value",
                          "user": {
                            "id": "44444444-4444-4444-4444-444444444444",
                            "email": "employee@example.com"
                          }
                        }
                        """)));
        when(profileService.getCompleteProfile(userId))
                .thenReturn(Optional.of(Map.of(
                        "id", userId,
                        "email", "employee@example.com",
                        "firstName", "Employee",
                        "lastName", "User",
                        "role", "mentee",
                        "companyId", "55555555-5555-5555-5555-555555555555"
                )));

        ResponseEntity<Object> response = authController.login(request).block();

        assertThat(response).isNotNull();
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isInstanceOf(Map.class);

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertThat(body)
                .containsEntry("access_token", "access-value")
                .containsEntry("refresh_token", "refresh-value")
                .containsEntry("accessToken", "access-value")
                .containsEntry("refreshToken", "refresh-value")
                .containsKeys("user", "profile", "memberships", "entitlements", "defaultDestination");
    }
}
```

- [ ] **Step 2: Run the controller test to verify it fails**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.controller.AuthControllerUnifiedSessionTest
```

Expected: FAIL because `AuthController` does not accept `AuthSessionMapper` and does not return camelCase token fields.

- [ ] **Step 3: Wire the mapper into `AuthController`**

Modify `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/AuthController.java`:

Add import:

```java
import com.prosper.prospermentor.service.AuthSessionMapper;
```

Add final field after `PasswordResetService passwordResetService;`:

```java
    private final AuthSessionMapper authSessionMapper;
```

In `login`, replace:

```java
                        Map<String, Object> enhancedResponse = objectMapper.convertValue(authResponse, Map.class);
```

with:

```java
                        Map<String, Object> freeTrial = null;
                        if (isFreeTrialRequested(loginRequest)) {
                            freeTrial = activateFreeTrial(userUuid);
                        }

                        Map<String, Object> enhancedResponse = authSessionMapper.toLoginResponse(
                                authResponse,
                                profileOpt.orElse(null),
                                freeTrial,
                                isFreeTrialRequested(loginRequest)
                        );
```

Then remove the later block:

```java
                        if (isFreeTrialRequested(loginRequest)) {
                            enhancedResponse.put("freeTrial", activateFreeTrial(userUuid));
                        }
```

In the catch branch inside `login`, replace:

```java
                        return Mono.just(ResponseEntity.ok((Object) authResponse));
```

with:

```java
                        return Mono.just(ResponseEntity.ok((Object) authSessionMapper.toLoginResponse(
                                authResponse,
                                null,
                                null,
                                isFreeTrialRequested(loginRequest)
                        )));
```

In `refreshToken`, replace:

```java
                .map(result -> ResponseEntity.ok((Object) result))
```

with:

```java
                .map(result -> ResponseEntity.ok((Object) authSessionMapper.toRefreshResponse(result)))
```

- [ ] **Step 4: Update existing controller test construction**

Modify `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/controller/AuthControllerFreeTrialTest.java`.

Add import:

```java
import com.prosper.prospermentor.service.AuthSessionMapper;
```

In `setUp`, add the mapper as the final constructor argument:

```java
                menteeNotificationService,
                passwordResetService,
                new AuthSessionMapper(objectMapper)
```

- [ ] **Step 5: Run backend auth tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.AuthSessionMapperTest \
  --tests com.prosper.prospermentor.controller.AuthControllerUnifiedSessionTest \
  --tests com.prosper.prospermentor.controller.AuthControllerFreeTrialTest
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/java/com/prosper/prospermentor/controller/AuthController.java \
  src/test/java/com/prosper/prospermentor/controller/AuthControllerUnifiedSessionTest.java \
  src/test/java/com/prosper/prospermentor/controller/AuthControllerFreeTrialTest.java
git commit -m "feat: return unified auth sessions from login"
```

---

### Task 3: Enterprise Auth Session Normalization

**Files:**
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/utils/authSession.ts`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/auth.ts`
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/tests/auth-session-normalization.test.mjs`

- [ ] **Step 1: Write the failing source regression test**

Create `/Users/macbookpro/WebstormProjects/myProsperV2/tests/auth-session-normalization.test.mjs`:

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const helperSource = readFileSync(resolve(root, 'utils/authSession.ts'), 'utf8')
const authStoreSource = readFileSync(resolve(root, 'store/modules/auth.ts'), 'utf8')

assert.match(
  helperSource,
  /export const normalizeAuthSession/,
  'Enterprise should expose a shared auth session normalizer.',
)

assert.match(
  helperSource,
  /accessToken:\s*raw\.accessToken\s*\|\|\s*raw\.access_token/,
  'Normalizer should prefer camelCase accessToken and fall back to legacy access_token.',
)

assert.match(
  helperSource,
  /refreshToken:\s*raw\.refreshToken\s*\|\|\s*raw\.refresh_token/,
  'Normalizer should prefer camelCase refreshToken and fall back to legacy refresh_token.',
)

assert.match(
  authStoreSource,
  /normalizeAuthSession/,
  'Auth store should consume normalized backend auth sessions.',
)

assert.match(
  authStoreSource,
  /session\.accessToken/,
  'Auth store should persist the normalized accessToken.',
)

console.log('Enterprise auth session normalization verified.')
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/auth-session-normalization.test.mjs
```

Expected: FAIL because `utils/authSession.ts` does not exist.

- [ ] **Step 3: Add the enterprise normalizer**

Create `/Users/macbookpro/WebstormProjects/myProsperV2/utils/authSession.ts`:

```ts
import { DEFAULT_ROLES } from '@/utils/roleManager'

type FrontendRole = 'employee' | 'mentor' | 'corporate_admin'

const normalizeFrontendRoleName = (roleName?: string): FrontendRole => {
  const normalized = String(roleName || '').trim().toLowerCase()

  if (normalized === 'mentor') {
    return 'mentor'
  }

  if (['company', 'company_admin', 'corporate_admin'].includes(normalized)) {
    return 'corporate_admin'
  }

  return 'employee'
}

const firstNonBlank = (...values: Array<unknown>) => {
  for (const value of values) {
    const normalized = String(value || '').trim()
    if (normalized) {
      return normalized
    }
  }
  return ''
}

export const normalizeAuthSession = (rawResponse: any, fallbackEmail = '') => {
  const raw = rawResponse?.data || rawResponse || {}
  const user = raw.user || {}
  const profile = raw.profile || {}
  const normalizedRole = normalizeFrontendRoleName(
    profile.role || raw.memberships?.[0]?.role || user.role || user.roles?.[0],
  )
  const firstName = firstNonBlank(user.firstName, profile.firstName, profile.first_name, user.user_metadata?.first_name)
  const lastName = firstNonBlank(user.lastName, profile.lastName, profile.last_name, user.user_metadata?.last_name)
  const email = firstNonBlank(user.email, profile.email, fallbackEmail)
  const displayName = firstNonBlank(user.displayName, user.name, [firstName, lastName].filter(Boolean).join(' '), email)

  return {
    accessToken: raw.accessToken || raw.access_token || raw.jwtToken,
    refreshToken: raw.refreshToken || raw.refresh_token,
    user: {
      id: firstNonBlank(user.id, user.sub, raw.id, profile.id),
      email,
      name: displayName,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      picture: firstNonBlank(user.avatarUrl, user.picture, profile.avatarUrl, profile.avatar_url) || undefined,
      provider: user.provider || raw.provider || 'local',
      roles: [DEFAULT_ROLES[normalizedRole]],
      isVerified: user.emailVerified ?? true,
      createdAt: user.createdAt || user.created_at || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      companyId: profile.companyId || profile.company_id || profile.company?.id || raw.company?.companyId,
    },
    profile,
    memberships: raw.memberships || [],
    entitlements: raw.entitlements || [],
    defaultDestination: raw.defaultDestination || null,
    message: raw.message,
    freeTrial: raw.freeTrial,
  }
}
```

- [ ] **Step 4: Update enterprise auth store login normalization**

Modify `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/auth.ts`.

Add import:

```ts
import { normalizeAuthSession } from '@/utils/authSession'
```

Inside `login(loginData: LoginData)`, replace the success block that builds `responseData`, `responseUser`, `responseProfile`, `roleNames`, `mappedRoles`, and `this.loggedInUser` with:

```ts
                const session = normalizeAuthSession(response.data, loginData.email)
                this.loggedInUser = session.user

                if (typeof window !== 'undefined') {
                  if (session.accessToken) {
                    localStorage.setItem('token', session.accessToken)
                  }
                  if (session.refreshToken) {
                    localStorage.setItem('refreshToken', session.refreshToken)
                  }
                  localStorage.setItem('provider', session.user.provider)
                  localStorage.setItem('loggedInUser', JSON.stringify(this.loggedInUser))
                  if (session.profile && Object.keys(session.profile).length > 0) {
                    localStorage.setItem('profile', JSON.stringify(session.profile))
                    if (session.profile.role) {
                      localStorage.setItem('role', session.profile.role)
                    }
                  }
                }
```

Keep the surrounding `resolve(response.data)` and error handling unchanged.

- [ ] **Step 5: Run the enterprise regression test**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/auth-session-normalization.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git add utils/authSession.ts store/modules/auth.ts tests/auth-session-normalization.test.mjs
git commit -m "feat: normalize enterprise auth sessions"
```

---

### Task 4: B2C Backend Auth Client

**Files:**
- Create: `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/services/backendAuthService.ts`
- Create: `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/tests/backend-auth-signin.test.mjs`

- [ ] **Step 1: Write the failing B2C source regression test**

Create `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/tests/backend-auth-signin.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const serviceSource = readFileSync(resolve(root, 'src/services/backendAuthService.ts'), 'utf8');

assert.match(
  serviceSource,
  /export const backendAuthService/,
  'B2C should expose a backend auth service.',
);

assert.match(
  serviceSource,
  /\/api\/auth\/login/,
  'Backend auth service should call the shared backend login endpoint.',
);

assert.match(
  serviceSource,
  /accessToken:\s*raw\.accessToken\s*\|\|\s*raw\.access_token/,
  'Backend auth service should support normalized and legacy access token fields.',
);

assert.match(
  serviceSource,
  /refreshToken:\s*raw\.refreshToken\s*\|\|\s*raw\.refresh_token/,
  'Backend auth service should support normalized and legacy refresh token fields.',
);

console.log('B2C backend auth service verified');
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
node src/tests/backend-auth-signin.test.mjs
```

Expected: FAIL because `backendAuthService.ts` does not exist.

- [ ] **Step 3: Add the B2C backend auth service**

Create `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/services/backendAuthService.ts`:

```ts
export interface BackendAuthLoginRequest {
  email: string;
  password: string;
  audience?: 'b2c' | 'enterprise';
  roleIntent?: 'mentee' | 'mentor' | 'employee' | 'corporate_admin';
  product?: 'FREE_TRIAL' | string;
  trial?: boolean;
}

export interface NormalizedBackendAuthSession {
  accessToken: string;
  refreshToken: string;
  user: Record<string, unknown>;
  profile: Record<string, unknown> | null;
  memberships: Array<Record<string, unknown>>;
  entitlements: Array<Record<string, unknown>>;
  defaultDestination: { product?: string; url?: string } | null;
  freeTrial?: Record<string, unknown>;
  raw: Record<string, unknown>;
}

const parseJsonResponse = async (response: Response) => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error || payload?.message || 'Authentication failed';
    throw new Error(message);
  }
  return payload;
};

const normalizeSession = (raw: any): NormalizedBackendAuthSession => ({
  accessToken: raw.accessToken || raw.access_token || '',
  refreshToken: raw.refreshToken || raw.refresh_token || '',
  user: raw.user || {},
  profile: raw.profile || null,
  memberships: raw.memberships || [],
  entitlements: raw.entitlements || [],
  defaultDestination: raw.defaultDestination || null,
  freeTrial: raw.freeTrial,
  raw,
});

const postJson = async (path: string, body: Record<string, unknown>, token?: string) => {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return parseJsonResponse(response);
};

export const backendAuthService = {
  async login(request: BackendAuthLoginRequest) {
    const raw = await postJson('/api/auth/login', request);
    return normalizeSession(raw);
  },

  async refresh(refreshToken: string) {
    const raw = await postJson('/api/auth/refresh', { refreshToken });
    return normalizeSession(raw);
  },

  async logout(accessToken?: string) {
    await postJson('/api/auth/logout', {}, accessToken);
  },
};
```

- [ ] **Step 4: Run the B2C service regression test**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
node src/tests/backend-auth-signin.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
git add src/services/backendAuthService.ts src/tests/backend-auth-signin.test.mjs
git commit -m "feat: add backend auth service"
```

---

### Task 5: B2C Signin Uses Backend Login

**Files:**
- Modify: `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/components/auth/AuthForm.tsx`
- Modify: `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/tests/backend-auth-signin.test.mjs`

- [ ] **Step 1: Extend the failing regression test**

Modify `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/tests/backend-auth-signin.test.mjs` to include `AuthForm.tsx`:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const serviceSource = readFileSync(resolve(root, 'src/services/backendAuthService.ts'), 'utf8');
const authFormSource = readFileSync(resolve(root, 'src/components/auth/AuthForm.tsx'), 'utf8');

assert.match(
  serviceSource,
  /export const backendAuthService/,
  'B2C should expose a backend auth service.',
);

assert.match(
  serviceSource,
  /\/api\/auth\/login/,
  'Backend auth service should call the shared backend login endpoint.',
);

assert.match(
  serviceSource,
  /accessToken:\s*raw\.accessToken\s*\|\|\s*raw\.access_token/,
  'Backend auth service should support normalized and legacy access token fields.',
);

assert.match(
  serviceSource,
  /refreshToken:\s*raw\.refreshToken\s*\|\|\s*raw\.refresh_token/,
  'Backend auth service should support normalized and legacy refresh token fields.',
);

assert.match(
  authFormSource,
  /backendAuthService\.login/,
  'B2C email signin should authenticate through the backend.',
);

assert.doesNotMatch(
  authFormSource,
  /supabase\.auth\.signInWithPassword/,
  'B2C AuthForm should not call Supabase password signin directly after backend auth migration.',
);

assert.match(
  authFormSource,
  /supabase\.auth\.setSession/,
  'B2C AuthForm should hydrate Supabase client state from backend-returned Supabase tokens during migration.',
);

console.log('B2C backend auth signin verified');
```

- [ ] **Step 2: Run the regression test to verify it fails**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
node src/tests/backend-auth-signin.test.mjs
```

Expected: FAIL because `AuthForm.tsx` still calls `supabase.auth.signInWithPassword`.

- [ ] **Step 3: Update `AuthForm.tsx` imports**

Modify `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/components/auth/AuthForm.tsx`.

Add import:

```ts
import { backendAuthService } from '@/services/backendAuthService';
```

- [ ] **Step 4: Replace password signin with backend login**

In `handleSignIn`, replace the current `authResult` assignment block with:

```ts
      const shouldResumeFreeTrial = hasAnyFreeTrialIntent(searchParams);
      const backendSession = await backendAuthService.login({
        email: formData.email,
        password: formData.password,
        audience: 'b2c',
        roleIntent: 'mentee',
        ...(shouldResumeFreeTrial ? { product: 'FREE_TRIAL', trial: true } : {}),
      });

      if (!backendSession.accessToken || !backendSession.refreshToken) {
        throw new Error('Unable to start your session. Please try again.');
      }

      const { data: authResult, error: sessionError } = await supabase.auth.setSession({
        access_token: backendSession.accessToken,
        refresh_token: backendSession.refreshToken,
      });
      if (sessionError) throw sessionError;

      if (shouldResumeFreeTrial && backendSession.freeTrial?.activated === false && backendSession.freeTrial?.message) {
        toast.info(String(backendSession.freeTrial.message));
      }
```

Keep the existing `if (authResult.user) { ... }` block after this replacement.

- [ ] **Step 5: Run the B2C signin regression test**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
node src/tests/backend-auth-signin.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Build B2C**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
git add src/components/auth/AuthForm.tsx src/tests/backend-auth-signin.test.mjs
git commit -m "feat: sign in b2c users through backend auth"
```

---

### Task 6: B2C Backend Logout Compatibility

**Files:**
- Modify: `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/hooks/useAuth.tsx`
- Modify: `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/tests/backend-auth-signin.test.mjs`

- [ ] **Step 1: Extend the regression test**

Add this assertion to `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/tests/backend-auth-signin.test.mjs`:

```js
const useAuthSource = readFileSync(resolve(root, 'src/hooks/useAuth.tsx'), 'utf8');

assert.match(
  useAuthSource,
  /backendAuthService\.logout/,
  'B2C signOut should notify backend logout before local cleanup.',
);
```

- [ ] **Step 2: Run the regression test to verify it fails**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
node src/tests/backend-auth-signin.test.mjs
```

Expected: FAIL because `useAuth.tsx` does not call backend logout.

- [ ] **Step 3: Update `useAuth.tsx` imports**

Modify `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/hooks/useAuth.tsx`.

Add import:

```ts
import { backendAuthService } from '@/services/backendAuthService';
```

- [ ] **Step 4: Call backend logout before Supabase signout**

Inside `signOut`, before `const { error } = await supabase.auth.signOut();`, add:

```ts
      if (session?.access_token) {
        await backendAuthService.logout(session.access_token);
      }
```

Update the `signOut` dependency array from:

```ts
  }, [navigate, clearAuthStorage]);
```

to:

```ts
  }, [navigate, clearAuthStorage, session?.access_token]);
```

- [ ] **Step 5: Run B2C regression and build**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
node src/tests/backend-auth-signin.test.mjs
npm run build
```

Expected: both commands PASS.

- [ ] **Step 6: Commit**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
git add src/hooks/useAuth.tsx src/tests/backend-auth-signin.test.mjs
git commit -m "feat: notify backend on b2c logout"
```

---

### Task 7: Cross-Repo Verification

**Files:**
- No source edits.

- [ ] **Step 1: Run backend auth-focused tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.AuthSessionMapperTest \
  --tests com.prosper.prospermentor.controller.AuthControllerUnifiedSessionTest \
  --tests com.prosper.prospermentor.controller.AuthControllerFreeTrialTest \
  --tests com.prosper.prospermentor.controller.PublicAuthControllerTest
```

Expected: PASS.

- [ ] **Step 2: Run enterprise source checks**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/auth-session-normalization.test.mjs
node tests/auth-signup-page.test.mjs
```

Expected: PASS.

- [ ] **Step 3: Run B2C source checks and build**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
node src/tests/backend-auth-signin.test.mjs
npm run build
```

Expected: PASS.

- [ ] **Step 4: Manual smoke check**

Run the three apps locally:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew bootRun
```

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
npm run dev
```

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
npm run dev -- --port 8080
```

Check these flows in a browser:

- Enterprise login at `http://localhost:3000/auth/login` still routes corporate admin users to `/app/admin` or `/app/admin/onboarding`.
- B2C login at `http://localhost:8080/auth?mode=signin` signs in through `/api/auth/login` and lands on `/dashboard`.
- B2C free-trial login at `http://localhost:8080/auth?mode=signin&audience=mentee&trial=1&product=FREE_TRIAL` lands on `/mentors`.
- Existing B2C protected routes still see a Supabase client session after backend login.

- [ ] **Step 5: Confirm no uncommitted foundation changes remain**

Run each status command and confirm all foundation files have already been committed by their task-specific commit step:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git status --short
```

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git status --short
```

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
git status --short
```

Expected: no uncommitted files from this foundation plan. Existing unrelated local changes may remain visible and should not be staged by this plan.

---

## Self-Review

- Spec coverage: This plan implements the Phase 1 foundation for `login` and `refresh`, Phase 2 enterprise compatibility, and B2C signin from Phase 3 of the design. It intentionally leaves backend signup endpoint normalization, B2C signup, mentor signup, OAuth callbacks, and shared-domain cookies for separate plans because they are independent rollout surfaces with different risk profiles.
- Placeholder scan: No task relies on undefined file ownership, unnamed endpoints, or unspecified test commands.
- Type consistency: Backend normalized token fields are `accessToken` and `refreshToken`; legacy fields remain `access_token` and `refresh_token`. Enterprise and B2C frontend helpers read both shapes.
