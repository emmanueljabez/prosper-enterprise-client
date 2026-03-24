import { useRuntimeConfig, useStorage } from '#imports'
import { H3Event, createError, getRequestURL, readRawBody } from 'h3'
import { randomUUID } from 'node:crypto'

const LEGACY_API_BASE = 'https://app.prospermentor.com/api'
const ENTERPRISE_API_BASE = 'https://enterprise.prospermentor.com/api'

export type CyberSourceFlow = 'response' | 'cancel'

export interface StoredCyberSourcePayload {
  token: string
  flow: CyberSourceFlow
  params: Record<string, string>
  createdAt: number
  finalizedAt?: number
  finalizeResult?: Record<string, any>
}

const STORAGE_PREFIX = 'cybersource:payload:'
const DEFAULT_TTL_MS = 15 * 60 * 1000

export async function readCyberSourceParams(event: H3Event): Promise<Record<string, string>> {
  const rawBody = await readRawBody(event, 'utf8')
  const serializedParams = rawBody && rawBody.length > 0
    ? rawBody
    : getRequestURL(event).searchParams.toString()

  if (!serializedParams) {
    return {}
  }

  const parsed = new URLSearchParams(serializedParams)
  const params: Record<string, string> = {}
  for (const [key, value] of parsed.entries()) {
    params[key] = value
  }
  return params
}

export async function storeCyberSourcePayload(flow: CyberSourceFlow, params: Record<string, string>): Promise<string> {
  const token = randomUUID()
  const payload: StoredCyberSourcePayload = {
    token,
    flow,
    params,
    createdAt: Date.now()
  }

  await useStorage().setItem(storageKey(token), payload)
  return token
}

export async function getCyberSourcePayload(token: string): Promise<StoredCyberSourcePayload> {
  const payload = await useStorage().getItem<StoredCyberSourcePayload>(storageKey(token))

  if (!payload) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Payment response token was not found'
    })
  }

  const ageMs = Date.now() - payload.createdAt
  if (ageMs > getResponseTtlMs()) {
    await useStorage().removeItem(storageKey(token))
    throw createError({
      statusCode: 410,
      statusMessage: 'Payment response token expired'
    })
  }

  return payload
}

export async function saveCyberSourcePayload(token: string, payload: StoredCyberSourcePayload): Promise<void> {
  await useStorage().setItem(storageKey(token), payload)
}

export function getBackendApiBase(): string {
  const config = useRuntimeConfig()
  const configuredBase = normalizeApiBase(String(
    config.cybersourceBackendApiBase || config.public?.apiBaseUrl || ''
  ))
  if (configuredBase.length > 0) {
    return configuredBase
  }

  const nodeEnv = String(config.public?.nodeEnv || process.env.NODE_ENV || '')
  const defaultBase = nodeEnv === 'development'
    ? 'http://localhost:8080/api'
    : ENTERPRISE_API_BASE

  return defaultBase.replace(/\/+$/, '')
}

function normalizeApiBase(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, '')
  return trimmed === LEGACY_API_BASE ? ENTERPRISE_API_BASE : trimmed
}

function storageKey(token: string): string {
  return `${STORAGE_PREFIX}${token}`
}

function getResponseTtlMs(): number {
  const config = useRuntimeConfig()
  const parsed = Number(config.cybersourceResponseTtlMs)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_MS
}
