import { createError, defineEventHandler, readBody } from 'h3'
import {
  getBackendApiBase,
  getCyberSourcePayload,
  saveCyberSourcePayload
} from '../../utils/cybersourceGateway'

interface FinalizeRequestBody {
  token?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<FinalizeRequestBody>(event)
  const token = body?.token?.trim()

  if (!token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'token is required'
    })
  }

  const payload = await getCyberSourcePayload(token)

  if (payload.finalizeResult) {
    return payload.finalizeResult
  }

  const callbackUrl = `${getBackendApiBase()}/v1/payments/cybersource/callback`
  const formData = new URLSearchParams(payload.params)

  let callbackResponse: Record<string, any> | null = null
  let callbackError: string | null = null

  try {
    callbackResponse = await $fetch<Record<string, any>>(callbackUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    })
  } catch (error: any) {
    callbackError = error?.data?.message || error?.message || 'Failed to process callback'
  }

  const decision = String(payload.params.decision || '').toUpperCase()
  const reasonCode = payload.params.reason_code || ''
  const transactionId = payload.params.transaction_id || payload.params.req_transaction_id || ''
  const authCode = payload.params.auth_code || ''

  const successDecision = decision === 'ACCEPT'
  const responseSuccess = callbackResponse?.success !== false && !callbackError

  const finalizeResult = {
    success: successDecision && responseSuccess,
    decision,
    transactionId,
    authCode,
    reasonCode,
    message: callbackError || callbackResponse?.message || payload.params.message || '',
    callbackResponse
  }

  payload.finalizedAt = Date.now()
  payload.finalizeResult = finalizeResult
  await saveCyberSourcePayload(token, payload)

  return finalizeResult
})
