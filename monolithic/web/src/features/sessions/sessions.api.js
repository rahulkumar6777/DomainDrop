export const sessionsApi = {
  list: (call) => call('/v1/auth/sessions'),
  revoke: (call, sessionId) => call(`/v1/auth/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
  }),
  revokeOthers: (call) => call('/v1/auth/sessions/others', {
    method: 'DELETE',
  }),
}
