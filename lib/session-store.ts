// lib/session-store.ts
type SessionStore = Map<string, { userId: string }>

const sessionStore: SessionStore = new Map()

export function createSession(userId: string): string {
  const sessionId = crypto.randomUUID()
  sessionStore.set(sessionId, { userId })
  return sessionId
}

export function getSession(sessionId: string) {
  return sessionStore.get(sessionId)
}

export function destroySession(sessionId: string) {
  sessionStore.delete(sessionId)
}
