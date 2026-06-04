export const resolveCompanyId = (loggedInUser?: { companyId?: string | null } | null) => {
  if (typeof window !== 'undefined') {
    const rawProfile = localStorage.getItem('profile')
    if (rawProfile) {
      try {
        const parsedProfile = JSON.parse(rawProfile)
        return parsedProfile?.company?.id || parsedProfile?.companyId || parsedProfile?.company_id || ''
      } catch {
        return loggedInUser?.companyId || ''
      }
    }
  }

  return loggedInUser?.companyId || ''
}

export const humanizeReportValue = (value?: string | null) =>
  String(value || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())

export const formatReportDate = (value?: string | null) => {
  if (!value) return '-'

  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatReportDateTime = (value?: string | null) => {
  if (!value) return '-'

  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const escapeCsv = (value: unknown) => {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

export const downloadReportCsv = (
  filename: string,
  headers: string[],
  rows: Array<Array<unknown>>,
) => {
  const csv = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const reportFilename = (slug: string) => `${slug}-${new Date().toISOString().slice(0, 10)}.csv`
