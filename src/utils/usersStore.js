const USERS_KEY = 'legends_users'

const LEGACY_USERS = [
  { username: 'admin', password: 'admin', role: 'admin' },
  { username: 'carlos', password: '60109945', role: 'admin' },
  { username: 'mica', password: '76584608', role: 'admin' },
  { username: 'george', password: '68176771', role: 'admin' },
  { username: 'moira', password: '75264279', role: 'admin' },
]

export function readUsers() {
  try {
    const stored = window.localStorage.getItem(USERS_KEY)
    if (!stored) return LEGACY_USERS
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter((user) => user?.username && user?.password && user?.role) : LEGACY_USERS
  } catch {
    return LEGACY_USERS
  }
}

export function persistUsers(users) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function modulesForRole(role) {
  if (role === 'admin') return ['inicio', 'resumen', 'dashboard', 'caja', 'inventario', 'usuarios']
  if (role === 'caja') return ['resumen', 'caja']
  if (role === 'inventario') return ['resumen', 'inventario']
  if (role === 'inscripciones') return ['dashboard']
  return []
}

export const ROLE_OPTIONS = [
  { id: 'admin', label: 'Administrador', description: 'Acceso a todos los módulos y usuarios.' },
  { id: 'caja', label: 'Caja', description: 'Dashboard y Caja POS.' },
  { id: 'inventario', label: 'Inventario', description: 'Dashboard e Inventario.' },
  { id: 'inscripciones', label: 'Inscripciones', description: 'Lista de inscripciones.' },
]

export function roleLabel(role) {
  return ROLE_OPTIONS.find((item) => item.id === role)?.label || role
}
