type DownloadCompanyJoinQrPdfInput = {
  companyName: string
  joinUrl: string
  qrDataUrl: string
}

export const COMPANY_JOIN_QR_BRAND_COLOR = '#8f1f74'
export const COMPANY_JOIN_QR_BRAND_RGB = [143, 31, 116] as const

const slugify = (value: string) => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'company'
}

export const companyJoinQrPdfFileName = (companyName: string) =>
  `prosper-mentor-${slugify(companyName)}-join-qr.pdf`

export const buildCompanyJoinQrDataUrl = async (joinUrl: string): Promise<string> => {
  const QRCode = await import('qrcode')

  return QRCode.toDataURL(joinUrl, {
    margin: 2,
    width: 320,
    color: {
      dark: COMPANY_JOIN_QR_BRAND_COLOR,
      light: '#FFFFFF',
    },
  })
}

export const downloadCompanyJoinQrPdf = async ({
  companyName,
  joinUrl,
  qrDataUrl,
}: DownloadCompanyJoinQrPdfInput): Promise<void> => {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 18
  const qrSize = 88
  const qrX = (pageWidth - qrSize) / 2

  doc.setFillColor(...COMPANY_JOIN_QR_BRAND_RGB)
  doc.rect(0, 0, pageWidth, 34, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Prosper Mentor', margin, 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('We Guide. You Conquer.', margin, 24)

  doc.setTextColor(20, 30, 42)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(`Join ${companyName}`, margin, 52)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text('Scan this QR code to create your Prosper Mentor account and join your company mentorship programme.', margin, 62, {
    maxWidth: pageWidth - margin * 2,
  })

  doc.addImage(qrDataUrl, 'PNG', qrX, 76, qrSize, qrSize)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Signup link', margin, 178)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(doc.splitTextToSize(joinUrl, pageWidth - margin * 2), margin, 186)

  doc.setTextColor(86, 98, 110)
  doc.setFontSize(9)
  doc.text('After email verification, your account will be added to the company automatically.', margin, 224)

  doc.save(companyJoinQrPdfFileName(companyName))
}
