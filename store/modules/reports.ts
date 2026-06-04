import { defineStore } from 'pinia'
import reportsApi, {
  type BillingTransactionReportRow,
  type MatchReportRow,
  type ParticipantReportRow,
  type ProgramReportRow,
  type PulseCoverageReportRow,
  type ReportList,
  type ReportQueryParams,
  type RiskSignalReportRow,
  type SessionReportRow,
} from '@/http/requests/app/reports'

type ReportKey =
  | 'program'
  | 'participant'
  | 'match'
  | 'session'
  | 'pulseCoverage'
  | 'riskSignals'
  | 'billingTransactions'

type ReportMeta = Omit<ReportList<unknown>, 'rows'>

interface ReportsState {
  loading: Record<ReportKey, boolean>
  errors: Record<ReportKey, string | null>
  metas: Record<ReportKey, ReportMeta | null>
  programRows: ProgramReportRow[]
  participantRows: ParticipantReportRow[]
  matchRows: MatchReportRow[]
  sessionRows: SessionReportRow[]
  pulseCoverageRows: PulseCoverageReportRow[]
  riskSignalRows: RiskSignalReportRow[]
  billingTransactionRows: BillingTransactionReportRow[]
}

const emptyLoading = (): Record<ReportKey, boolean> => ({
  program: false,
  participant: false,
  match: false,
  session: false,
  pulseCoverage: false,
  riskSignals: false,
  billingTransactions: false,
})

const emptyErrors = (): Record<ReportKey, string | null> => ({
  program: null,
  participant: null,
  match: null,
  session: null,
  pulseCoverage: null,
  riskSignals: null,
  billingTransactions: null,
})

const emptyMetas = (): Record<ReportKey, ReportMeta | null> => ({
  program: null,
  participant: null,
  match: null,
  session: null,
  pulseCoverage: null,
  riskSignals: null,
  billingTransactions: null,
})

const toMeta = <T>(report: ReportList<T>): ReportMeta => ({
  count: report.count,
  currentPage: report.currentPage,
  pageSize: report.pageSize,
  totalPages: report.totalPages,
  totalItems: report.totalItems,
  hasNext: report.hasNext,
  hasPrevious: report.hasPrevious,
})

const reportError = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback

export const useReportsStore = defineStore('reports', {
  state: (): ReportsState => ({
    loading: emptyLoading(),
    errors: emptyErrors(),
    metas: emptyMetas(),
    programRows: [],
    participantRows: [],
    matchRows: [],
    sessionRows: [],
    pulseCoverageRows: [],
    riskSignalRows: [],
    billingTransactionRows: [],
  }),

  actions: {
    async loadProgramReport(companyId: string, params: ReportQueryParams = {}) {
      this.loading.program = true
      this.errors.program = null

      try {
        const report = await reportsApi.getProgramReport(companyId, params)
        this.programRows = report.rows
        this.metas.program = toMeta(report)
        return report
      } catch (error: any) {
        this.errors.program = reportError(error, 'Failed to load program report')
        throw error
      } finally {
        this.loading.program = false
      }
    },

    async loadParticipantReport(companyId: string, params: ReportQueryParams = {}) {
      this.loading.participant = true
      this.errors.participant = null

      try {
        const report = await reportsApi.getParticipantReport(companyId, params)
        this.participantRows = report.rows
        this.metas.participant = toMeta(report)
        return report
      } catch (error: any) {
        this.errors.participant = reportError(error, 'Failed to load participant report')
        throw error
      } finally {
        this.loading.participant = false
      }
    },

    async loadMatchReport(companyId: string, params: ReportQueryParams = {}) {
      this.loading.match = true
      this.errors.match = null

      try {
        const report = await reportsApi.getMatchReport(companyId, params)
        this.matchRows = report.rows
        this.metas.match = toMeta(report)
        return report
      } catch (error: any) {
        this.errors.match = reportError(error, 'Failed to load mentor match report')
        throw error
      } finally {
        this.loading.match = false
      }
    },

    async loadSessionReport(companyId: string, params: ReportQueryParams = {}) {
      this.loading.session = true
      this.errors.session = null

      try {
        const report = await reportsApi.getSessionReport(companyId, params)
        this.sessionRows = report.rows
        this.metas.session = toMeta(report)
        return report
      } catch (error: any) {
        this.errors.session = reportError(error, 'Failed to load session report')
        throw error
      } finally {
        this.loading.session = false
      }
    },

    async loadPulseCoverageReport(companyId: string, params: ReportQueryParams = {}) {
      this.loading.pulseCoverage = true
      this.errors.pulseCoverage = null

      try {
        const report = await reportsApi.getPulseCoverageReport(companyId, params)
        this.pulseCoverageRows = report.rows
        this.metas.pulseCoverage = toMeta(report)
        return report
      } catch (error: any) {
        this.errors.pulseCoverage = reportError(error, 'Failed to load pulse coverage report')
        throw error
      } finally {
        this.loading.pulseCoverage = false
      }
    },

    async loadRiskSignalsReport(companyId: string, params: ReportQueryParams = {}) {
      this.loading.riskSignals = true
      this.errors.riskSignals = null

      try {
        const report = await reportsApi.getRiskSignalsReport(companyId, params)
        this.riskSignalRows = report.rows
        this.metas.riskSignals = toMeta(report)
        return report
      } catch (error: any) {
        this.errors.riskSignals = reportError(error, 'Failed to load risk signals report')
        throw error
      } finally {
        this.loading.riskSignals = false
      }
    },

    async loadBillingTransactionsReport(companyId: string, params: ReportQueryParams = {}) {
      this.loading.billingTransactions = true
      this.errors.billingTransactions = null

      try {
        const report = await reportsApi.getBillingTransactionsReport(companyId, params)
        this.billingTransactionRows = report.rows
        this.metas.billingTransactions = toMeta(report)
        return report
      } catch (error: any) {
        this.errors.billingTransactions = reportError(error, 'Failed to load billing transactions report')
        throw error
      } finally {
        this.loading.billingTransactions = false
      }
    },
  },
})
