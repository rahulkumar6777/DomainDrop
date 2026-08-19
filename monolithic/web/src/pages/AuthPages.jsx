import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { authApi } from '../lib/api.js'

function PasswordInput({ value, onChange, autoComplete = 'current-password' }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="input-with-action">
      <LockKeyhole size={18} aria-hidden="true" />
      <input
        id="password"
        name="password"
        type={isVisible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        minLength={8}
        maxLength={30}
        placeholder="Your password"
        required
      />
      <button
        type="button"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        title={isVisible ? 'Hide password' : 'Show password'}
        onClick={() => setIsVisible((current) => !current)}
      >
        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

function AuthLayout({ eyebrow, title, copy, children }) {
  return (
    <section className="auth-page">
      <div className="shell auth-layout">
        <div className="auth-aside">
          <p className="eyebrow">DomainDrop account</p>
          <h1>One secure home for every userâ€™s files.</h1>
          <div className="auth-aside-points">
            <span><ShieldCheck size={18} /> Private by default</span>
            <span><KeyRound size={18} /> Rotating refresh sessions</span>
            <span><CheckCircle2 size={18} /> Free 1 GB bucket</span>
          </div>
        </div>
        <div className="auth-form-wrap">
          <div className="auth-form-heading">
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            <p>{copy}</p>
          </div>
          {children}
        </div>
      </div>
    </section>
  )
}

function LoginPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const wasRegistered = searchParams.get('registered') === '1'

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(form)
      navigate(location.state?.from || '/app', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to DomainDrop"
      copy="Use the account that owns your bucket and API keys."
    >
      {wasRegistered && (
        <div className="form-success" role="status">
          <CheckCircle2 size={18} />
          Registration verified. You can log in now.
        </div>
      )}
      {error && <div className="form-error" role="alert">{error}</div>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email address</label>
        <div className="input-with-icon">
          <Mail size={18} aria-hidden="true" />
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            autoComplete="email"
            placeholder="you@company.com"
            required
          />
        </div>

        <div className="label-row">
          <label htmlFor="password">Password</label>
          <button className="quiet-action" type="button" disabled>
            Forgot password
          </button>
        </div>
        <PasswordInput value={form.password} onChange={updateField} />

        <button
          className="button button-dark button-full"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="spin" size={18} />
              Logging in
            </>
          ) : (
            <>
              Log in
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
      <p className="auth-switch">
        New to DomainDrop? <Link to="/signup">Create an account</Link>
      </p>
    </AuthLayout>
  )
}

function SignupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('account')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
  })
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const beginRegistration = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await authApi.beginRegistration(form)
      setStep('verify')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyRegistration = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await authApi.verifyRegistration({ email: form.email, otp })
      navigate(
        '/login?registered=1&email=' + encodeURIComponent(form.email),
        { replace: true },
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 'verify') {
    return (
      <AuthLayout
        eyebrow="Check your inbox"
        title="Verify your email"
        copy={'We sent a six-digit code to ' + form.email + '.'}
      >
        {error && <div className="form-error" role="alert">{error}</div>}
        <form className="auth-form" onSubmit={verifyRegistration}>
          <label htmlFor="otp">Verification code</label>
          <div className="input-with-icon otp-input">
            <KeyRound size={18} aria-hidden="true" />
            <input
              id="otp"
              name="otp"
              type="text"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
              }
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000000"
              autoFocus
              required
            />
          </div>
          <button
            className="button button-dark button-full"
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="spin" size={18} />
                Verifying
              </>
            ) : (
              <>
                Verify and continue
                <ArrowRight size={18} />
              </>
            )}
          </button>
          <button
            className="back-action"
            type="button"
            onClick={() => {
              setError('')
              setStep('account')
            }}
          >
            <ArrowLeft size={16} />
            Change account details
          </button>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      eyebrow="Create your account"
      title="Get your first bucket"
      copy="Free includes 1 GB, 200 objects, and private delivery."
    >
      {error && <div className="form-error" role="alert">{error}</div>}
      <form className="auth-form" onSubmit={beginRegistration}>
        <label htmlFor="fullName">Full name</label>
        <div className="input-with-icon">
          <UserRound size={18} aria-hidden="true" />
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={updateField}
            autoComplete="name"
            minLength={3}
            maxLength={30}
            placeholder="Rahul Sharma"
            required
          />
        </div>

        <label htmlFor="email">Email address</label>
        <div className="input-with-icon">
          <Mail size={18} aria-hidden="true" />
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            autoComplete="email"
            placeholder="you@company.com"
            required
          />
        </div>

        <label htmlFor="password">Password</label>
        <PasswordInput
          value={form.password}
          onChange={updateField}
          autoComplete="new-password"
        />
        <p className="field-hint">
          8â€“30 characters with uppercase, lowercase, number, and special character.
        </p>

        <button
          className="button button-dark button-full"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="spin" size={18} />
              Sending code
            </>
          ) : (
            <>
              Continue with email
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  )
}

export { LoginPage, SignupPage }
