import { defineEventHandler, sendRedirect } from 'h3'
import { readCyberSourceParams, storeCyberSourcePayload } from '../../utils/cybersourceGateway'

export default defineEventHandler(async (event) => {
  const params = await readCyberSourceParams(event)
  const token = await storeCyberSourcePayload('cancel', params)
  return sendRedirect(event, `/payment/cybersource-cancel?token=${encodeURIComponent(token)}`, 302)
})

