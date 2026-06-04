# Employee Management Backend Gap Analysis

## Scope
Target UI: Corporate Employee Management workspace with:
- KPI cards (`Total Employees`, `Active in Program`, `Mentors Assigned`, `Avg Sessions`)
- Employee directory table (`Name`, `Department`, `Program Status`, `Mentor Assigned`, `Sessions`, `Actions`)
- Filters (`Department`, `Status`, search)
- CSV export
- Column visibility controls

## Existing API Coverage

### Fully available today
1. Employee directory core list and search
- `GET /v1/companies/{companyId}/profiles`
- Supports: `page`, `size`, `search`
- Used for: name/email/avatar/base identity + pagination totals

2. Invite/whitelist lifecycle
- `GET /v1/companies/{companyId}/whitelist`
- `POST /v1/companies/{companyId}/whitelist`
- `DELETE /v1/companies/{companyId}/whitelist/{whitelistId}`
- `POST /v1/companies/{companyId}/whitelist/{whitelistId}/send-invitation`
- `GET /v1/companies/{companyId}/whitelist/{whitelistId}/resend-invitation`
- Used for: invite employee, resend, remove, whitelist tab

3. Company-funded session allocation actions
- `GET /v1/companies/{companyId}/employee-session-allocations/lookup`
- `POST /v1/companies/{companyId}/employee-session-allocations/{profileId}/allocate`
- `POST /v1/companies/{companyId}/employee-session-allocations/{profileId}/withdraw`
- Used for: allocate/withdraw actions and funded-session balances

### Partially available (requires fan-out in frontend)
4. Program status and mentor assignment per employee
- Available via per-program participants endpoint:
  - `GET /v1/company-programs/{companyProgramId}/participants`
- Gap: no single company-level employee row projection; frontend must load programs then N participant lists and merge.

5. Session activity by employee
- `GET /v1/companies/{companyId}/sessions` returns session records.
- Gap: no direct employee-level aggregate endpoint (e.g., yearly sessions count per employee).

## Gaps vs Screenshot Directive

1. Department filter fidelity
- Current profile payload has no canonical `department` field.
- Frontend currently falls back to `industry/location`, which is not equivalent.

2. Program status in employee directory
- No company-level endpoint returns `programStatus` per employee for directory rows.

3. Mentor assigned in employee directory
- No company-level endpoint returns resolved mentor per employee across programs.

4. KPI cards (`Active in Program`, `Mentors Assigned`, `Avg Sessions`) as authoritative metrics
- No single endpoint returning precomputed employee-management stats.

5. CSV export for full dataset
- Frontend can export currently loaded rows.
- No backend export endpoint for full filtered dataset across all pages.

6. Column preference persistence (optional)
- No endpoint to persist admin-specific table column settings/preferences.

## Recommended Backend Additions

### A) Company Employee Management Aggregation Endpoint (primary)
`GET /v1/companies/{companyId}/employee-management`

Query params:
- `page`, `size`, `search`
- `department` (or `departmentId`)
- `status` (`ACTIVE|INACTIVE|INVITED`)
- `sortBy`, `sortDir`
- `period` (`LAST_30_DAYS`, `LAST_12_MONTHS`, custom)

Response payload (example shape):
- `stats`:
  - `totalEmployees`
  - `activeInProgram`
  - `activeParticipationRate`
  - `mentorsAssigned`
  - `avgSessionsPerEmployee`
- `filters`:
  - `departments[]` (canonical list)
  - `statuses[]`
- `employees[]`:
  - `profileId`
  - `name`
  - `email`
  - `avatarUrl`
  - `department`
  - `programStatus`
  - `mentorAssigned` `{ id, name, avatarUrl } | null`
  - `sessionsCount` (for selected period)
  - `allocation` `{ allocatedTotal, consumedTotal, availableBalance }`
  - `lastActivityAt`
- pagination:
  - `currentPage`, `pageSize`, `totalPages`, `totalItems`, `hasNext`, `hasPrevious`

Why:
- Eliminates expensive frontend fan-out (program-by-program participant aggregation).
- Produces consistent KPI + row metrics from the same snapshot.

### B) Employee Management CSV Export Endpoint
`GET /v1/companies/{companyId}/employee-management/export`

Query params mirror list endpoint filters.
Returns file stream (`text/csv`).

Why:
- Supports complete export over full filtered dataset, not just visible page.

### C) (Optional) Admin table preference endpoint
- `GET /v1/companies/{companyId}/admin-preferences/employee-management`
- `PUT /v1/companies/{companyId}/admin-preferences/employee-management`

Fields:
- `visibleColumns[]`
- `defaultSort`
- `defaultFilters`

Why:
- Persist user-specific table setup for repeat admin workflows.

## Immediate Frontend Strategy (already applied)
- Keep all existing capabilities intact:
  - invite/import/whitelist flows
  - allocate/withdraw session actions
  - wallet and billing context
- Apply design-direction layout and interactions.
- Use best-available current fields for missing backend data and mark backend gaps above for follow-up.
