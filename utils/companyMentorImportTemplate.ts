export const COMPANY_MENTOR_IMPORT_HEADERS = [
  'email',
  'phone',
  'first_name',
  'last_name',
  'title',
  'department',
  'tags',
  'visibility',
  'program_or_cohort',
] as const

type CompanyMentorImportColumn = typeof COMPANY_MENTOR_IMPORT_HEADERS[number]
type CompanyMentorTemplateRow = Record<CompanyMentorImportColumn, string>

export const COMPANY_MENTOR_IMPORT_SAMPLE_ROWS: CompanyMentorTemplateRow[] = [
  {
    email: 'mentor.one@example.com',
    phone: '+254720000001',
    first_name: 'Maya',
    last_name: 'Otieno',
    title: 'Engineering Lead',
    department: 'Engineering',
    tags: 'leadership, engineering, africa',
    visibility: 'COMPANY_PRIVATE',
    program_or_cohort: 'Leadership Accelerator',
  },
  {
    email: 'mentor.two@example.com',
    phone: '+254720000002',
    first_name: 'Amina',
    last_name: 'Njoroge',
    title: 'Product Director',
    department: 'Product',
    tags: 'product, strategy',
    visibility: 'PUBLIC_REQUESTED',
    program_or_cohort: 'Product Mentorship',
  },
]

const COMPANY_MENTOR_IMPORT_INSTRUCTIONS = [
  ['Column', 'Required', 'Notes'],
  ['email', 'Yes', 'Mentor email address. This is used to identify existing Prosper mentors and send email invites.'],
  ['phone', 'Yes', 'International format is recommended. This is used for WhatsApp invites.'],
  ['first_name', 'No', 'Mentor first name for invitation personalization.'],
  ['last_name', 'No', 'Mentor last name for invitation personalization.'],
  ['title', 'No', 'Role or professional title.'],
  ['department', 'No', 'Department or function inside the company.'],
  ['tags', 'No', 'Comma-separated tags such as leadership, engineering, finance.'],
  ['visibility', 'No', 'Use COMPANY_PRIVATE, PROGRAM_RESTRICTED, or PUBLIC_REQUESTED. Defaults to COMPANY_PRIVATE when blank.'],
  ['program_or_cohort', 'No', 'Optional program or cohort label for internal grouping.'],
]

export const COMPANY_MENTOR_IMPORT_TEMPLATE_FILENAME = 'prosper-company-mentor-import-template.xlsx'

export async function downloadCompanyMentorImportTemplate(
  filename = COMPANY_MENTOR_IMPORT_TEMPLATE_FILENAME,
) {
  if (typeof window === 'undefined') return

  const xlsx = await import('xlsx')
  const mentorRows = [
    COMPANY_MENTOR_IMPORT_HEADERS,
    ...COMPANY_MENTOR_IMPORT_SAMPLE_ROWS.map(row =>
      COMPANY_MENTOR_IMPORT_HEADERS.map(header => row[header] || ''),
    ),
  ]

  const workbook = xlsx.utils.book_new()
  const mentorsSheet = xlsx.utils.aoa_to_sheet(mentorRows)
  mentorsSheet['!cols'] = [
    { wch: 28 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 24 },
    { wch: 20 },
    { wch: 34 },
    { wch: 22 },
    { wch: 28 },
  ]

  const instructionsSheet = xlsx.utils.aoa_to_sheet(COMPANY_MENTOR_IMPORT_INSTRUCTIONS)
  instructionsSheet['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 96 }]

  xlsx.utils.book_append_sheet(workbook, mentorsSheet, 'Mentors')
  xlsx.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions')

  const workbookBuffer = xlsx.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
    compression: true,
  })
  const blob = new Blob([workbookBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const objectUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0)
}
