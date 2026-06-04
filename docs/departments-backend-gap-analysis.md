# Departments Module Backend Gap Analysis

## Scope
Target UI: `Admin Settings -> Departments` tab at `/app/admin/settings?tab=departments` with:
- Department CRUD
- Department member listing
- Add employees to department
- Remove employees from department
- Pagination and search

## Current API Coverage

### Available today
1. Employee lookup for assignment
- `GET /v1/companies/{companyId}/profiles`
- Supports: `page`, `size`, `search`
- Used for: selectable employee list in assignment dialog

### Required by new frontend module
The new request layer expects these endpoints:

1. Departments list
- `GET /v1/companies/{companyId}/departments`
- Query: `page`, `size`, `search`
- Response shape:
  - `success`, `message`
  - `data.departments[]`
  - `data.currentPage`, `data.pageSize`, `data.totalPages`, `data.totalItems`, `data.hasNext`, `data.hasPrevious`

2. Create department
- `POST /v1/companies/{companyId}/departments`
- Body: `{ name, code?, description? }`
- Response shape:
  - `success`, `message`
  - `data` with created department record

3. Update department
- `PUT /v1/companies/{companyId}/departments/{departmentId}`
- Body: `{ name?, code?, description?, isActive? }`
- Response shape:
  - `success`, `message`
  - `data` with updated department record

4. Delete department
- `DELETE /v1/companies/{companyId}/departments/{departmentId}`
- Response shape:
  - `success`, `message`
  - optional `data.departmentId`

5. Department members list
- `GET /v1/companies/{companyId}/departments/{departmentId}/members`
- Query: `page`, `size`, `search`
- Response shape:
  - `success`, `message`
  - `data.members[]`
  - pagination fields matching list endpoint

6. Assign employees to department
- `POST /v1/companies/{companyId}/departments/{departmentId}/members`
- Body: `{ profileIds: string[] }`
- Response shape:
  - `success`, `message`
  - optional counts: `assignedCount`, `skippedCount`

7. Remove employee from department
- `DELETE /v1/companies/{companyId}/departments/{departmentId}/members/{profileId}`
- Response shape:
  - `success`, `message`
  - optional `data.departmentId`, `data.profileId`

## Data Contract Recommendations

1. Department record
- `id`, `companyId`, `name`, `code`, `description`, `memberCount`, `isActive`, `createdAt`, `updatedAt`

2. Member record
- `departmentId`, `profileId`, `profileName`, `profileEmail`, `profileRole`, `profileAvatarUrl`, `joinedAt`

3. Validation rules
- Department `name` required and unique per company (case-insensitive)
- `code` optional but unique per company when provided
- Member assignment idempotent (re-adding same `profileId` should not fail hard)

## Known Gaps To Confirm With Backend

1. Delete semantics
- Decide whether delete hard-removes the department or soft-deactivates it.
- Current UI assumes members become unassigned when a department is deleted.

2. Employee eligibility
- Current UI filters roles to `employee|mentee`.
- Confirm backend should enforce role eligibility as source of truth.

3. Concurrency/versioning
- If optimistic locking is used, include `version` in responses and accept it in updates.

4. Auditability
- For enterprise reporting, capture `createdBy`, `updatedBy`, and assignment actor metadata.

## Frontend Behavior If Endpoints Are Missing
- The settings tab renders, but CRUD/member actions will surface backend error messages from API responses.
- No local mock fallback is used for department mutations to avoid data drift from source of truth.
