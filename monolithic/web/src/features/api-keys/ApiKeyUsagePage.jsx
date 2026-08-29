import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, KeyRound } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import AppPageHeader from '../../components/app/AppPageHeader.jsx'
import { ErrorState, LoadingState } from '../../components/app/AppStates.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { formatDate } from '../../lib/formatters.js'
import { apiKeysApi } from './apiKeys.api.js'
import ApiKeyUsageFilters from './ApiKeyUsageFilters.jsx'
import ApiKeyUsageTable from './ApiKeyUsageTable.jsx'
import './apiKeyUsage.css'

const defaultFilters = {
  method: '',
  statusCode: '',
  from: '',
  to: '',
  limit: '25',
}

const toQuery = (filters, cursor) => ({
  method: filters.method,
  statusCode: filters.statusCode,
  from: filters.from ? new Date(filters.from).toISOString() : '',
  to: filters.to ? new Date(filters.to).toISOString() : '',
  limit: filters.limit,
  cursor,
})

function ApiKeyUsagePage() {
  const { apiKeyId } = useParams()
  const location = useLocation()
  const { apiRequest } = useAuth()
  const requestId = useRef(0)
  const [apiKey, setApiKey] = useState(location.state?.apiKey || null)
  const [draftFilters, setDraftFilters] = useState(defaultFilters)
  const [filters, setFilters] = useState(defaultFilters)
  const [cursorHistory, setCursorHistory] = useState([null])
  const [usage, setUsage] = useState([])
  const [pagination, setPagination] = useState({ hasMore: false, nextCursor: null, limit: 25 })
  const [loadingKey, setLoadingKey] = useState(!location.state?.apiKey)
  const [loadingUsage, setLoadingUsage] = useState(true)
  const [error, setError] = useState('')

  const cursor = cursorHistory[cursorHistory.length - 1]

  const loadApiKey = useCallback(async () => {
    if (apiKey) return

    setLoadingKey(true)
    try {
      const result = await apiKeysApi.list(apiRequest)
      const selectedKey = result.keys?.find((key) => key.id === apiKeyId)
      if (!selectedKey) throw new Error('API key not found')
      setApiKey(selectedKey)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoadingKey(false)
    }
  }, [apiKey, apiKeyId, apiRequest])

  const loadUsage = useCallback(async () => {
    const currentRequestId = ++requestId.current
    setLoadingUsage(true)
    setError('')

    try {
      const result = await apiKeysApi.usage(apiRequest, apiKeyId, toQuery(filters, cursor))
      if (currentRequestId !== requestId.current) return
      setUsage(result.usage || [])
      setPagination(result.pagination || { hasMore: false, nextCursor: null, limit: Number(filters.limit) })
    } catch (requestError) {
      if (currentRequestId === requestId.current) setError(requestError.message)
    } finally {
      if (currentRequestId === requestId.current) setLoadingUsage(false)
    }
  }, [apiKeyId, apiRequest, cursor, filters])

  useEffect(() => {
    const timer = window.setTimeout(loadApiKey, 0)
    return () => window.clearTimeout(timer)
  }, [loadApiKey])

  useEffect(() => {
    const timer = window.setTimeout(loadUsage, 0)
    return () => window.clearTimeout(timer)
  }, [loadUsage])

  const applyFilters = (event) => {
    event.preventDefault()
    setCursorHistory([null])
    setFilters({ ...draftFilters })
  }

  const resetFilters = () => {
    setDraftFilters(defaultFilters)
    setCursorHistory([null])
    setFilters({ ...defaultFilters })
  }

  if (loadingKey) return <LoadingState label="Loading API key" />

  return (
    <div className="app-page api-key-usage-page">
      <AppPageHeader
        eyebrow="API key activity"
        title={apiKey?.name || 'Usage'}
        copy="Inspect requests authenticated with this key. Usage can take a few seconds to appear."
        action={(
          <Link className="button button-small button-outline" to="/app/developer/api-keys">
            <ArrowLeft size={16} /> API keys
          </Link>
        )}
      />

      {apiKey && (
        <div className="usage-key-summary">
          <span className="key-icon"><KeyRound size={18} /></span>
          <div>
            <code>{apiKey.keyPrefix}...</code>
            <small>Created {formatDate(apiKey.createdAt)} | Last used {formatDate(apiKey.lastUsedAt)}</small>
          </div>
          <span className={`status-dot ${apiKey.status}`}>{apiKey.status}</span>
        </div>
      )}

      <ApiKeyUsageFilters
        filters={draftFilters}
        loading={loadingUsage}
        onChange={(event) => setDraftFilters((current) => ({ ...current, [event.target.name]: event.target.value }))}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {error && <ErrorState message={error} onRetry={loadUsage} />}
      {loadingUsage
        ? <LoadingState label="Loading API usage" />
        : (!error || usage.length > 0) && <ApiKeyUsageTable usage={usage} />}

      {!loadingUsage && !error && usage.length > 0 && (
        <div className="usage-pagination">
          <span>Page {cursorHistory.length} | Up to {pagination.limit} requests</span>
          <div>
            <button
              className="button button-small button-outline"
              type="button"
              onClick={() => setCursorHistory((current) => current.slice(0, -1))}
              disabled={cursorHistory.length === 1}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              className="button button-small button-dark"
              type="button"
              onClick={() => setCursorHistory((current) => [...current, pagination.nextCursor])}
              disabled={!pagination.hasMore || !pagination.nextCursor}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApiKeyUsagePage
