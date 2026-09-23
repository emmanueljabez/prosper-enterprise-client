# Enterprise Employee QR Join Design

Date: 2026-09-23

## Goal

Let a corporate admin generate a QR code from the Enterprise Employees page that can be shared with mentees. When a mentee signs up through that QR link and completes email verification, the system automatically attaches the new account to the admin's company.

The QR code must be downloadable as a PDF, and the Employees page actions should be consolidated into a top-level actions dropdown. The existing Buy Sessions button should be removed from this page.

## Approved Product Decision

Use a reusable but revocable company join token. The QR code points to a secure join link, not to a raw company ID. Admins can regenerate the token later if the link is leaked or should be rotated.

## User Flow

```text
Corporate Admin
   |
   | /app/admin/employees -> Actions -> Generate QR Code
   v
Frontend requests current company join link
   |
   v
Backend creates or returns reusable active company join token
   |
   v
Frontend renders QR preview and PDF download
   |
   v
Mentee scans QR and opens enterprise signup with companyJoinToken
   |
   v
Mentee signs up and verifies email
   |
   v
Backend validates token and attaches verified user to company
   |
   v
User appears in company employees list
```

## Frontend Design

Update the Enterprise Employees page at `/app/admin/employees`.

### Top Actions Dropdown

Replace the current separate top action buttons with one `Actions` dropdown.

Dropdown items:

- Invite Employee
- Import Employees
- Generate QR Code
- Export CSV
- Refresh

Remove the Buy Sessions button from the page. Keep table configuration controls such as column visibility as table controls rather than company actions.

### QR Code Dialog

Selecting Generate QR Code opens a dialog with:

- Company name.
- QR code preview.
- Join URL with copy action.
- Download PDF action.
- Regenerate QR link action.

The dialog fetches the current reusable join link on open. If no active link exists, the backend creates one.

### PDF Download

The frontend generates a client-side PDF containing:

- Prosper Mentor branding.
- Company name.
- QR code image.
- Join URL in text form.
- Short instruction copy for mentees.

The filename should follow:

`prosper-mentor-<company-slug>-join-qr.pdf`

The PDF is generated in the browser so admins can download it immediately without adding a backend rendering dependency.

## Backend Design

Add backend support for company join links and signup completion.

### Join Link API

Expose endpoints under the existing company admin API surface:

```text
GET /api/v1/companies/{companyId}/join-link
POST /api/v1/companies/{companyId}/join-link/regenerate
```

The GET endpoint returns the active reusable link, creating one if necessary. The regenerate endpoint revokes the current token and returns a new link.

Response shape:

```json
{
  "companyId": "uuid",
  "companyName": "Girls for Girls",
  "joinToken": "opaque-token",
  "joinUrl": "https://enterprise.prospermentor.com/auth/signup?companyJoinToken=opaque-token",
  "status": "ACTIVE",
  "createdAt": "2026-09-23T00:00:00Z",
  "revokedAt": null
}
```

Only corporate admins for the target company can read or regenerate the join link.

### Data Model

Persist join tokens in a backend-owned table.

Suggested table: `company_join_links`

Core fields:

- `id`
- `company_id`
- `token_hash`
- `status`
- `created_by_profile_id`
- `created_at`
- `revoked_at`
- `revoked_by_profile_id`
- `last_used_at`

Token values are generated as high-entropy opaque secrets. Store only a hash in the database.

Status values:

- `ACTIVE`
- `REVOKED`

At most one active token should exist per company.

### Signup Completion

Enterprise signup accepts `companyJoinToken`.

After email verification completes, the backend:

- Validates the token hash.
- Confirms the token is active.
- Resolves the company.
- Links the verified profile to the company.
- Creates or updates the company employee/mentee relationship used by the employees page.
- Records `last_used_at` for auditability.

If a user already has a profile, the same token should attach the existing verified profile after sign-in or signup completion when allowed by current auth rules. The operation is idempotent: retrying the completion should not create duplicate employee rows.

## Security And Abuse Controls

- Never expose raw company IDs as the trust mechanism.
- Store token hashes, not token plaintext.
- Regeneration revokes the previous token immediately.
- Company admins can only manage links for their own company.
- Invalid or revoked tokens show a clear signup error and do not create company membership.
- The join token assigns company membership only after email verification, not before.

## Error Handling

Frontend dialog states:

- Loading current QR link.
- Failed to load QR link.
- Failed to regenerate QR link.
- PDF generation failed.
- Clipboard copy failed.

Signup error codes:

- `INVALID_COMPANY_JOIN_TOKEN`
- `REVOKED_COMPANY_JOIN_TOKEN`
- `COMPANY_JOIN_NOT_ALLOWED`
- `COMPANY_JOIN_ALREADY_COMPLETE`

## Testing Strategy

Frontend tests:

- Employees page renders a single top Actions dropdown.
- Buy Sessions is not present on the Employees page.
- Generate QR Code opens the QR dialog.
- QR dialog calls the company join-link API.
- PDF download uses the returned join URL.

Backend tests:

- Corporate admin can create/read a company join link for their company.
- Admin cannot read or regenerate another company's join link.
- Regenerate revokes the previous token and returns a new token.
- Signup with an active token links the verified user to the company.
- Signup with a revoked or invalid token does not link the user.
- Repeated signup completion is idempotent.

End-to-end validation:

- Admin logs into Enterprise and opens `/app/admin/employees`.
- Admin generates QR code and downloads the PDF.
- New mentee signs up using the QR link.
- After email verification, the mentee appears in the company's employees list.

## Deployment Notes

This feature requires coordinated backend and enterprise frontend releases. Deploy backend first so the frontend QR dialog can call the join-link endpoints, then deploy the enterprise frontend.
