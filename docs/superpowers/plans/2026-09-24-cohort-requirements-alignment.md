# Cohort Requirements Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the cohort implementation with the requirements discussed so far: contextual program selection, shadcn date inputs, Summit/plenary selection from real events, public self-join links without the logged-in app shell, and a standalone circles workspace.

**Architecture:** Keep cohorts owned by the enterprise backend/API contract. Add one narrow backend endpoint that exposes available Summit/events as plenary options, then consume that from the enterprise frontend cohort editor. Keep raw IDs internal; users select programs, dates, and plenary events through domain-language controls.

**Tech Stack:** Spring Boot Java backend, Supabase REST via existing backend WebClient, Nuxt 3, Vue 3, Pinia, shadcn-vue primitives, Node-based repository tests, browser E2E verification.

---

## File Structure

**Backend repository:** `/Users/macbookpro/IdeaProjects/ProsperMentor`

- Create: `src/main/java/com/prosper/prospermentor/dto/CohortPlenaryEventOptionDto.java`
  - Response DTO for the enterprise plenary event picker.
- Create: `src/main/java/com/prosper/prospermentor/service/CohortPlenaryEventService.java`
  - Reads available events from Supabase `events` using the existing `supabaseAdminWebClient`.
- Create: `src/main/java/com/prosper/prospermentor/controller/CohortPlenaryEventController.java`
  - Authenticated enterprise endpoint for available plenary events.
- Create: `src/test/java/com/prosper/prospermentor/service/CohortPlenaryEventServiceTest.java`
  - Unit test for filtering and mapping event payloads.
- Create: `src/test/java/com/prosper/prospermentor/controller/CohortPlenaryEventControllerTest.java`
  - Controller/security contract test.

**Enterprise frontend worktree:** `/Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923`

- Modify: `http/requests/app/companyProgramCohorts.ts`
  - Add `PlenaryEventOptionRecord` and `listAvailablePlenaryEvents()`.
- Modify: `store/modules/company-program-cohorts.ts`
  - Add plenary option state/action.
- Modify: `components/app/admin/cohorts/CompanyProgramCohortEditorDialog.vue`
  - Replace native date inputs with `DatePicker`.
  - Replace raw `Plenary event ID` input with `Linked plenary event` selector.
  - Refine program selector behavior and label.
- Modify/Create: `pages/app/admin/cohorts/[cohortId]/circles.vue`
  - Create a standalone circles workspace route, reusing the existing circles tab logic.
- Modify: `pages/app/admin/cohorts/[cohortId].vue`
  - Route the Circles tab/action to the standalone route or deep-link cleanly to it.
- Modify: `pages/app/employee/cohorts/join.vue`
  - Make the public join page usable without the authenticated app header/footer.
- Create/Modify tests:
  - `tests/b2b2c-admin-cohort-ui.test.mjs`
  - `tests/admin-standalone-cohorts-route.test.mjs`
  - `tests/b2b2c-employee-cohort-ui.test.mjs`
  - `tests/b2b2c-cohort-data-layer.test.mjs`

---

## Task 1: Backend Plenary Event Option API

**Files:**
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CohortPlenaryEventOptionDto.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CohortPlenaryEventService.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/CohortPlenaryEventController.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CohortPlenaryEventServiceTest.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/controller/CohortPlenaryEventControllerTest.java`

- [ ] **Step 1: Write the failing service test**

```java
package com.prosper.prospermentor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class CohortPlenaryEventServiceTest {
    @Test
    void mapsSupabaseEventsIntoPickerOptionsAndExcludesCancelledEvents() {
        ObjectMapper objectMapper = new ObjectMapper();
        CohortPlenaryEventService service = new CohortPlenaryEventService(null, objectMapper);

        List<Map<String, Object>> rows = List.of(
                Map.of(
                        "id", "11111111-1111-1111-1111-111111111111",
                        "title", "G4G Nairobi Kickoff",
                        "status", "published",
                        "event_type", "workshop",
                        "start_date", "2026-10-05T09:00:00Z",
                        "end_date", "2026-10-05T11:00:00Z",
                        "location_type", "virtual"
                ),
                Map.of(
                        "id", "22222222-2222-2222-2222-222222222222",
                        "title", "Cancelled Event",
                        "status", "cancelled",
                        "event_type", "webinar",
                        "start_date", "2026-10-06T09:00:00Z",
                        "end_date", "2026-10-06T10:00:00Z",
                        "location_type", "virtual"
                )
        );

        var options = service.mapRows(rows);

        assertThat(options).hasSize(1);
        assertThat(options.get(0).id()).isEqualTo("11111111-1111-1111-1111-111111111111");
        assertThat(options.get(0).title()).isEqualTo("G4G Nairobi Kickoff");
        assertThat(options.get(0).status()).isEqualTo("published");
        assertThat(options.get(0).startDate()).isEqualTo("2026-10-05T09:00:00Z");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CohortPlenaryEventServiceTest
```

Expected: FAIL because `CohortPlenaryEventService` and `CohortPlenaryEventOptionDto` do not exist.

- [ ] **Step 3: Add DTO**

```java
package com.prosper.prospermentor.dto;

public record CohortPlenaryEventOptionDto(
        String id,
        String title,
        String status,
        String eventType,
        String startDate,
        String endDate,
        String locationType
) {
}
```

- [ ] **Step 4: Add service**

```java
package com.prosper.prospermentor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prosper.prospermentor.dto.CohortPlenaryEventOptionDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CohortPlenaryEventService {
    private final WebClient supabaseAdminWebClient;
    private final ObjectMapper objectMapper;

    public List<CohortPlenaryEventOptionDto> listAvailableEvents() {
        List<Map<String, Object>> rows = supabaseAdminWebClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/rest/v1/events")
                        .queryParam("select", "id,title,status,event_type,start_date,end_date,location_type")
                        .queryParam("status", "in.(draft,published,completed)")
                        .queryParam("order", "start_date.asc")
                        .build())
                .retrieve()
                .bodyToFlux(Map.class)
                .map(row -> (Map<String, Object>) row)
                .collectList()
                .block();

        return mapRows(rows == null ? List.of() : rows);
    }

    public List<CohortPlenaryEventOptionDto> mapRows(List<Map<String, Object>> rows) {
        return rows.stream()
                .filter(row -> !"cancelled".equalsIgnoreCase(asString(row.get("status"))))
                .map(row -> new CohortPlenaryEventOptionDto(
                        asString(row.get("id")),
                        asString(row.get("title")),
                        asString(row.get("status")),
                        asString(row.get("event_type")),
                        asString(row.get("start_date")),
                        asString(row.get("end_date")),
                        asString(row.get("location_type"))
                ))
                .filter(option -> option.id() != null && option.title() != null)
                .toList();
    }

    private static String asString(Object value) {
        return Objects.toString(value, null);
    }
}
```

- [ ] **Step 5: Run service test to verify it passes**

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CohortPlenaryEventServiceTest
```

Expected: PASS.

- [ ] **Step 6: Add controller test**

```java
package com.prosper.prospermentor.controller;

import com.prosper.prospermentor.dto.CohortPlenaryEventOptionDto;
import com.prosper.prospermentor.service.CohortPlenaryEventService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CohortPlenaryEventController.class)
class CohortPlenaryEventControllerTest {
    @Autowired
    MockMvc mockMvc;

    @MockBean
    CohortPlenaryEventService service;

    @Test
    void returnsAvailablePlenaryEvents() throws Exception {
        when(service.listAvailableEvents()).thenReturn(List.of(
                new CohortPlenaryEventOptionDto(
                        "11111111-1111-1111-1111-111111111111",
                        "G4G Nairobi Kickoff",
                        "published",
                        "workshop",
                        "2026-10-05T09:00:00Z",
                        "2026-10-05T11:00:00Z",
                        "virtual"
                )
        ));

        mockMvc.perform(get("/api/v1/cohorts/plenary-events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title").value("G4G Nairobi Kickoff"));
    }
}
```

- [ ] **Step 7: Add controller**

```java
package com.prosper.prospermentor.controller;

import com.prosper.prospermentor.dto.ApiResponse;
import com.prosper.prospermentor.dto.CohortPlenaryEventOptionDto;
import com.prosper.prospermentor.service.CohortPlenaryEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/cohorts")
public class CohortPlenaryEventController {
    private final CohortPlenaryEventService service;

    @GetMapping("/plenary-events")
    public ResponseEntity<ApiResponse<List<CohortPlenaryEventOptionDto>>> listAvailablePlenaryEvents() {
        return ResponseEntity.ok(ApiResponse.success(
                "Available plenary events retrieved successfully",
                service.listAvailableEvents()
        ));
    }
}
```

- [ ] **Step 8: Run backend tests**

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CohortPlenaryEventServiceTest --tests CohortPlenaryEventControllerTest
```

Expected: PASS.

- [ ] **Step 9: Commit backend changes**

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git status --short
git add src/main/java/com/prosper/prospermentor/dto/CohortPlenaryEventOptionDto.java \
  src/main/java/com/prosper/prospermentor/service/CohortPlenaryEventService.java \
  src/main/java/com/prosper/prospermentor/controller/CohortPlenaryEventController.java \
  src/test/java/com/prosper/prospermentor/service/CohortPlenaryEventServiceTest.java \
  src/test/java/com/prosper/prospermentor/controller/CohortPlenaryEventControllerTest.java
git commit -m "feat: expose cohort plenary event options"
```

---

## Task 2: Frontend Request And Store Support For Plenary Options

**Files:**
- Modify: `/Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923/http/requests/app/companyProgramCohorts.ts`
- Modify: `/Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923/store/modules/company-program-cohorts.ts`
- Modify: `/Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923/tests/b2b2c-cohort-data-layer.test.mjs`

- [ ] **Step 1: Write failing data-layer test**

Add assertions to `tests/b2b2c-cohort-data-layer.test.mjs`:

```js
assert.match(
  requestSource,
  /export interface PlenaryEventOptionRecord/,
  'Cohort request layer should type available plenary event options.',
)

assert.match(
  requestSource,
  /listAvailablePlenaryEvents/,
  'Cohort request layer should expose listAvailablePlenaryEvents.',
)

assert.match(
  requestSource,
  /\/cohorts\/plenary-events/,
  'Available plenary events should come from the backend cohorts endpoint.',
)

assert.match(
  storeSource,
  /plenaryEventOptions/,
  'Cohort store should keep plenary event options.',
)

assert.match(
  storeSource,
  /loadPlenaryEventOptions/,
  'Cohort store should load plenary event options for the editor.',
)
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923
node tests/b2b2c-cohort-data-layer.test.mjs
```

Expected: FAIL because the request/store methods do not exist.

- [ ] **Step 3: Add request method**

In `http/requests/app/companyProgramCohorts.ts`, add:

```ts
export interface PlenaryEventOptionRecord {
  id: string
  title: string
  status?: string | null
  eventType?: string | null
  startDate?: string | null
  endDate?: string | null
  locationType?: string | null
}

export const listAvailablePlenaryEvents = async (): Promise<PlenaryEventOptionRecord[]> => {
  const response = await api.get<ApiEnvelope<PlenaryEventOptionRecord[]>>('/cohorts/plenary-events')
  return response.data.data || []
}
```

- [ ] **Step 4: Add store state/action**

In `store/modules/company-program-cohorts.ts`, add state fields:

```ts
plenaryEventOptions: [] as PlenaryEventOptionRecord[],
plenaryEventOptionsLoading: false,
```

Add action:

```ts
async loadPlenaryEventOptions() {
  this.plenaryEventOptionsLoading = true
  try {
    this.plenaryEventOptions = await listAvailablePlenaryEvents()
    return this.plenaryEventOptions
  } finally {
    this.plenaryEventOptionsLoading = false
  }
}
```

- [ ] **Step 5: Run data-layer test**

```bash
cd /Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923
node tests/b2b2c-cohort-data-layer.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit frontend data-layer changes**

```bash
cd /Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923
git add http/requests/app/companyProgramCohorts.ts store/modules/company-program-cohorts.ts tests/b2b2c-cohort-data-layer.test.mjs
git commit -m "feat: load cohort plenary event options"
```

---

## Task 3: Cohort Editor UX For Program, Dates, And Plenary

**Files:**
- Modify: `/Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923/components/app/admin/cohorts/CompanyProgramCohortEditorDialog.vue`
- Modify: `/Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923/tests/b2b2c-admin-cohort-ui.test.mjs`

- [ ] **Step 1: Write failing UI source test**

Add assertions:

```js
assert.match(
  editorSource,
  /import \{ DatePicker \} from ['"]@\/components\/ui\/date-picker['"]/,
  'Cohort editor should use the shadcn DatePicker component.',
)

assert.doesNotMatch(
  editorSource,
  /type="datetime-local"/,
  'Cohort editor should not use native datetime-local inputs.',
)

assert.match(
  editorSource,
  /Linked plenary event/,
  'Cohort editor should show a domain label for plenary event selection.',
)

assert.doesNotMatch(
  editorSource,
  /Plenary event ID/,
  'Cohort editor should not expose raw plenary event IDs.',
)

assert.match(
  editorSource,
  /loadPlenaryEventOptions/,
  'Cohort editor should load available plenary events when opened.',
)

assert.match(
  editorSource,
  /Partner program/,
  'Cohort editor should use Partner program language instead of generic Program.',
)
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923
node tests/b2b2c-admin-cohort-ui.test.mjs
```

Expected: FAIL for missing `DatePicker`, `Linked plenary event`, and raw ID field still present.

- [ ] **Step 3: Import DatePicker and plenary option refs**

In `CompanyProgramCohortEditorDialog.vue`, add:

```ts
import { DatePicker } from '@/components/ui/date-picker'
```

Extend store refs:

```ts
const {
  plenaryEventOptions,
  plenaryEventOptionsLoading,
} = storeToRefs(cohortsStore)
```

If there is already a `storeToRefs(cohortsStore)` call, merge these into it.

- [ ] **Step 4: Add display helpers**

Add:

```ts
const NO_PLENARY_EVENT = '__NO_PLENARY_EVENT__'

const selectedPlenaryEventId = computed({
  get: () => form.plenaryEventId || NO_PLENARY_EVENT,
  set: value => {
    if (!value || value === NO_PLENARY_EVENT) {
      form.plenaryEventType = 'NONE'
      form.plenaryEventId = ''
      return
    }

    form.plenaryEventType = 'SUMMIT_EVENT'
    form.plenaryEventId = value
  },
})

const formatPlenaryEventLabel = (event: PlenaryEventOptionRecord) => {
  const date = event.startDate ? new Date(event.startDate) : null
  const dateLabel = date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Date not set'
  return `${event.title} - ${dateLabel}`
}
```

Import `PlenaryEventOptionRecord` from the request module.

- [ ] **Step 5: Load plenary options when dialog opens**

Update the existing open watcher:

```ts
watch(() => props.open, async isOpen => {
  if (isOpen) {
    resetForm()
    await Promise.all([
      loadLocationCatalog(),
      cohortsStore.loadPlenaryEventOptions(),
    ])
  }
})
```

Keep `loadLocationCatalog()` guarded by `companyId`; the promise can resolve immediately when no company exists.

- [ ] **Step 6: Replace native date inputs with DatePicker**

Replace `Input type="datetime-local"` controls for `startsAt`, `endsAt`, and `selfJoinExpiresAt` with:

```vue
<DatePicker
  v-model="form.startsAt"
  :include-time="true"
  placeholder="Select cohort start"
/>
```

```vue
<DatePicker
  v-model="form.endsAt"
  :include-time="true"
  placeholder="Select cohort end"
/>
```

```vue
<DatePicker
  v-model="form.selfJoinExpiresAt"
  :include-time="true"
  placeholder="Select intake deadline"
  :disabled="!form.selfJoinEnabled"
/>
```

- [ ] **Step 7: Replace plenary source and raw ID fields**

Replace the current two-column `Plenary source` plus `Plenary event ID` block with:

```vue
<div class="grid gap-2">
  <label class="text-sm font-medium">Linked plenary event</label>
  <Select v-model="selectedPlenaryEventId" :disabled="plenaryEventOptionsLoading">
    <SelectTrigger>
      <SelectValue :placeholder="plenaryEventOptionsLoading ? 'Loading Summit events...' : 'Select Summit event'" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem :value="NO_PLENARY_EVENT">No linked plenary</SelectItem>
      <SelectItem
        v-for="event in plenaryEventOptions"
        :key="event.id"
        :value="event.id"
      >
        {{ formatPlenaryEventLabel(event) }}
      </SelectItem>
    </SelectContent>
  </Select>
  <p class="text-xs text-muted-foreground">
    Link this cohort to a Summit event so plenary scheduling and attendance can be tracked.
  </p>
</div>
```

- [ ] **Step 8: Refine program selector label and visibility**

Change the label from `Program` to `Partner program`.

Use this display rule:

```ts
const shouldShowProgramSelector = computed(() =>
  !isEditing.value
  && !props.programId
  && props.programOptions.length > 1
)
```

Render the selector only when `shouldShowProgramSelector` is true. When it is false, keep using `effectiveProgramId`.

- [ ] **Step 9: Run UI test**

```bash
cd /Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923
node tests/b2b2c-admin-cohort-ui.test.mjs
```

Expected: PASS.

- [ ] **Step 10: Commit cohort editor UX changes**

```bash
cd /Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923
git add components/app/admin/cohorts/CompanyProgramCohortEditorDialog.vue tests/b2b2c-admin-cohort-ui.test.mjs
git commit -m "feat: align cohort editor with plenary and date UX"
```

---

## Task 4: Standalone Circles Workspace

**Files:**
- Create: `/Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923/pages/app/admin/cohorts/[cohortId]/circles.vue`
- Modify: `/Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923/pages/app/admin/cohorts/[cohortId].vue`
- Modify: `/Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923/tests/admin-standalone-cohorts-route.test.mjs`

- [ ] **Step 1: Write failing route test**

Add:

```js
const circlesRoute = path.join(repoRoot, 'pages/app/admin/cohorts/[cohortId]/circles.vue')
assert.ok(fs.existsSync(circlesRoute), 'Standalone circles workspace route should exist.')

const circlesSource = fs.readFileSync(circlesRoute, 'utf8')
assert.match(circlesSource, /Form circles|Circles in this cohort|Confirm circles as final/, 'Standalone circles route should render circle management language.')

const detailSource = fs.readFileSync(path.join(repoRoot, 'pages/app/admin/cohorts/[cohortId].vue'), 'utf8')
assert.match(detailSource, /\/app\/admin\/cohorts\/.*\/circles/, 'Cohort detail should link to the standalone circles workspace.')
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923
node tests/admin-standalone-cohorts-route.test.mjs
```

Expected: FAIL because the standalone circles route does not exist.

- [ ] **Step 3: Extract reusable circles section if needed**

If the circles markup in `[cohortId].vue` is large, create:

`components/app/admin/cohorts/CohortCirclesWorkspace.vue`

Move the existing circles tab content and its handlers into the component with props:

```ts
defineProps<{
  cohortId: string
}>()
```

The component loads its own dashboard/circles through `useCompanyProgramCohortsStore()`.

- [ ] **Step 4: Create standalone route**

Create `pages/app/admin/cohorts/[cohortId]/circles.vue`:

```vue
<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import CohortCirclesWorkspace from '@/components/app/admin/cohorts/CohortCirclesWorkspace.vue'
import { Button } from '@/components/ui/button'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const cohortId = computed(() => String(route.params.cohortId || ''))
</script>

<template>
  <div class="space-y-6">
    <Button variant="ghost" class="gap-2" @click="router.push(`/app/admin/cohorts/${cohortId}`)">
      <ArrowLeft class="h-4 w-4" />
      Back to cohort
    </Button>

    <div>
      <p class="text-sm font-semibold uppercase tracking-wide text-[#9a4884]">Form circles</p>
      <h1 class="text-3xl font-semibold tracking-tight">Circles workspace</h1>
      <p class="text-muted-foreground">Group mentees into common-interest circles, assign facilitators, and finalize membership.</p>
    </div>

    <CohortCirclesWorkspace :cohort-id="cohortId" />
  </div>
</template>
```

- [ ] **Step 5: Link cohort detail to standalone circles**

In `[cohortId].vue`, update the Circles tab/action to navigate:

```vue
<Button
  type="button"
  variant="outline"
  @click="router.push(`/app/admin/cohorts/${cohortId}/circles`)"
>
  Open circles workspace
</Button>
```

Keep `?tab=circles` compatibility by redirecting to the new route when `route.query.tab === 'circles'`.

- [ ] **Step 6: Run route test**

```bash
cd /Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923
node tests/admin-standalone-cohorts-route.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Commit route changes**

```bash
cd /Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923
git add pages/app/admin/cohorts/[cohortId].vue pages/app/admin/cohorts/[cohortId]/circles.vue components/app/admin/cohorts/CohortCirclesWorkspace.vue tests/admin-standalone-cohorts-route.test.mjs
git commit -m "feat: add standalone cohort circles workspace"
```

---

## Task 5: Public Self-Join Link Without Logged-In Header/Footer

**Files:**
- Modify: `/Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923/pages/app/employee/cohorts/join.vue`
- Modify: `/Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923/pages/app/admin/cohorts/[cohortId].vue`
- Modify: `/Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923/tests/b2b2c-employee-cohort-ui.test.mjs`

- [ ] **Step 1: Write failing public join UI test**

Add:

```js
const joinRoute = fs.readFileSync(path.join(repoRoot, 'pages/app/employee/cohorts/join.vue'), 'utf8')

assert.match(
  joinRoute,
  /layout:\s*['"]auth['"]|layout:\s*['"]public['"]|layout:\s*false/,
  'Public cohort join route should not use the logged-in app shell.',
)

assert.doesNotMatch(
  joinRoute,
  /middleware:\s*\[['"]auth['"]\]/,
  'Public cohort join route should not require auth before showing the join form.',
)

const adminDetailSource = fs.readFileSync(path.join(repoRoot, 'pages/app/admin/cohorts/[cohortId].vue'), 'utf8')
assert.match(
  adminDetailSource,
  /joinCode|join link|Intake Link/i,
  'Admin cohort detail should expose the public intake link.',
)
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923
node tests/b2b2c-employee-cohort-ui.test.mjs
```

Expected: FAIL if the join route still uses the authenticated app shell or lacks intake link assertions.

- [ ] **Step 3: Update join route metadata**

In `pages/app/employee/cohorts/join.vue`, use:

```ts
definePageMeta({
  layout: 'auth',
  auth: false,
})
```

If the project has a `public` layout, use `layout: 'public'`. If neither layout is appropriate, use `layout: false` and render the Prosper Mentor logo and form container directly.

- [ ] **Step 4: Ensure join works by code/link**

Keep the route query contract:

```ts
const joinCode = computed(() => String(route.query.code || '').trim())
```

When the page loads with `?code=G4G-NAIROBI-Q3-2026`, prefill the code and fetch cohort metadata through the existing self-join lookup action.

- [ ] **Step 5: Expose public intake link on admin detail**

In `[cohortId].vue`, compute:

```ts
const publicIntakeLink = computed(() => {
  const code = selectedCohort.value?.code
  if (!code) return ''
  return `${window.location.origin}/app/employee/cohorts/join?code=${encodeURIComponent(code)}`
})
```

Render a copyable field in the existing `Intake Link` card.

- [ ] **Step 6: Run public join test**

```bash
cd /Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923
node tests/b2b2c-employee-cohort-ui.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Commit public join changes**

```bash
cd /Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923
git add pages/app/employee/cohorts/join.vue pages/app/admin/cohorts/[cohortId].vue tests/b2b2c-employee-cohort-ui.test.mjs
git commit -m "feat: make cohort self join link public"
```

---

## Task 6: Full Verification And Browser Test

**Files:**
- No source files expected unless verification reveals a defect.

- [ ] **Step 1: Run frontend focused tests**

```bash
cd /Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923
node tests/b2b2c-cohort-data-layer.test.mjs
node tests/b2b2c-admin-cohort-ui.test.mjs
node tests/admin-standalone-cohorts-route.test.mjs
node tests/b2b2c-employee-cohort-ui.test.mjs
```

Expected: all PASS.

- [ ] **Step 2: Run frontend build check**

```bash
cd /Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923
npm run build
```

Expected: build completes without TypeScript or Nuxt route errors.

- [ ] **Step 3: Run backend focused tests**

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CohortPlenaryEventServiceTest --tests CohortPlenaryEventControllerTest
```

Expected: PASS.

- [ ] **Step 4: Browser-test production or preview after deployment**

Use corporate admin credentials from `AGENTS.md`.

Browser test flow:

1. Open `https://enterprise.prospermentor.com/auth/login`.
2. Sign in as `emmanuel@pcash.africa`.
3. Open `/app/admin/cohorts`.
4. Click `Create cohort`.
5. Confirm `Partner program` is hidden or preselected when context is clear.
6. Confirm date fields open shadcn popover calendars.
7. Confirm `Linked plenary event` lists available Summit/events.
8. Create a smoke cohort with a timestamped name.
9. Open the cohort detail page.
10. Copy/open the intake link in a signed-out browser context and confirm it does not show the logged-in header/footer.
11. Open `/app/admin/cohorts/{cohortId}/circles` and confirm the standalone circles workspace renders.

- [ ] **Step 5: Record verification result**

Append a short note to the PR description:

```md
Verification:
- Backend focused tests passed.
- Frontend cohort tests passed.
- Nuxt build passed.
- Browser smoke test covered cohort creation, Summit picker, public intake link, and standalone circles route.
```

---

## Deployment Plan

- [ ] **Step 1: Push backend branch and open PR**

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git status --short
git push origin HEAD
```

- [ ] **Step 2: Push enterprise frontend branch and open PR**

```bash
cd /Users/macbookpro/.config/superpowers/worktrees/myProsperV2/deploy-cohorts-restore-logo-upload-20260923
git status --short
git push origin HEAD
```

- [ ] **Step 3: Merge backend first**

The frontend Summit picker depends on `GET /api/v1/cohorts/plenary-events`, so deploy backend before deploying the frontend.

- [ ] **Step 4: Merge frontend and tag release**

Use the repo’s standard release flow from `AGENTS.md`: merge to `main`, create the next release tag, push the tag, then verify the production alias.

- [ ] **Step 5: Production verification**

Repeat the browser test against `https://enterprise.prospermentor.com/app/admin/cohorts`.

---

## Self-Review

- Spec coverage: Covers contextual program selection, shadcn dates, Summit/plenary pull, raw ID hiding, public cohort join link without app shell, and standalone circles workspace.
- Scope check: The backend endpoint and frontend editor changes are coupled and should ship together. The public join link and standalone circles route can be separate commits but are part of the same cohort requirements alignment.
- Type consistency: Frontend uses `PlenaryEventOptionRecord`; backend uses `CohortPlenaryEventOptionDto`; both expose `id`, `title`, `status`, `eventType`, `startDate`, `endDate`, and `locationType`.
- Verification coverage: Focused source tests, backend unit/controller tests, Nuxt build, and browser production smoke test are included.
