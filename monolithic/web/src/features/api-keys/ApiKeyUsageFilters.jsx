import { Filter, RotateCcw } from 'lucide-react'

function ApiKeyUsageFilters({ filters, loading, onChange, onApply, onReset }) {
  return (
    <form className="usage-filters" onSubmit={onApply}>
      <label>
        <span>Method</span>
        <select name="method" value={filters.method} onChange={onChange}>
          <option value="">All methods</option>
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((method) => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </label>

      <label>
        <span>Status code</span>
        <input
          name="statusCode"
          type="number"
          min="100"
          max="599"
          value={filters.statusCode}
          onChange={onChange}
          placeholder="Any status"
        />
      </label>

      <label>
        <span>From</span>
        <input name="from" type="datetime-local" value={filters.from} onChange={onChange} />
      </label>

      <label>
        <span>To</span>
        <input name="to" type="datetime-local" value={filters.to} onChange={onChange} />
      </label>

      <label className="usage-limit-control">
        <span>Rows</span>
        <select name="limit" value={filters.limit} onChange={onChange}>
          {[10, 25, 50, 100].map((limit) => <option key={limit} value={limit}>{limit}</option>)}
        </select>
      </label>

      <div className="usage-filter-actions">
        <button className="icon-button" type="button" onClick={onReset} disabled={loading} aria-label="Reset usage filters" title="Reset filters">
          <RotateCcw size={16} />
        </button>
        <button className="button button-small button-dark" type="submit" disabled={loading}>
          <Filter size={15} /> Apply
        </button>
      </div>
    </form>
  )
}

export default ApiKeyUsageFilters
