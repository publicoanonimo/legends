import { useState } from 'react'
import { KeyRound, Pencil, Plus, ShieldCheck, Trash2, UserRound, UsersRound, X } from 'lucide-react'
import { ROLE_OPTIONS, roleLabel } from '../utils/usersStore'

export default function UsuariosModule({ users, currentUser, onSaveUsers }) {
  const [editingUser, setEditingUser] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('caja')
  const [error, setError] = useState('')

  const openCreate = () => {
    setEditingUser(null); setUsername(''); setPassword(''); setRole('caja'); setError(''); setModalOpen(true)
  }
  const openEdit = (user) => {
    setEditingUser(user); setUsername(user.username); setPassword(user.password); setRole(user.role); setError(''); setModalOpen(true)
  }
  const saveUser = (event) => {
    event.preventDefault()
    const normalized = username.trim().toLowerCase()
    if (!/^[a-z0-9._-]{3,32}$/.test(normalized)) return setError('Usa de 3 a 32 caracteres: letras, números, punto, guion o guion bajo.')
    if (password.length < 4) return setError('La contraseña debe tener al menos 4 caracteres.')
    if (users.some((user) => user.username.toLowerCase() === normalized && user.username !== editingUser?.username)) return setError('Ya existe un usuario con ese nombre.')
    if ((normalized === 'admin') !== (role === 'superadmin')) return setError('El usuario admin debe ser el único superadministrador.')
    const nextUsers = editingUser
      ? users.map((user) => user.username === editingUser.username ? { username: normalized, password, role } : user)
      : [...users, { username: normalized, password, role }]
    onSaveUsers(nextUsers)
    setModalOpen(false)
  }
  const removeUser = (user) => {
    if (user.username === 'admin' || user.role === 'superadmin') return setError('La cuenta admin es el superadministrador principal y no se puede eliminar.')
    if (user.username === currentUser.username) return setError('No puedes eliminar el usuario con el que tienes la sesión abierta.')
    if (!window.confirm(`¿Eliminar el usuario ${user.username}?`)) return
    onSaveUsers(users.filter((item) => item.username !== user.username))
    setError('')
  }

  return <section className="dashboard-module users-module">
    <div className="dashboard-page-heading"><div><span className="dashboard-eyebrow">ADMINISTRACIÓN</span><h1>Usuarios y roles</h1><p>Crea cuentas de acceso, actualiza sus datos y define los módulos disponibles.</p></div><span className="dashboard-total"><UsersRound size={18}/> {users.length} usuarios</span></div>
    <div className="users-toolbar"><div><ShieldCheck size={18}/><span>Los permisos se aplican al iniciar sesión. Las cuentas se guardan en este dispositivo.</span></div><button type="button" className="submit-booking-btn" onClick={openCreate}><Plus size={17}/> Crear usuario</button></div>
    <section className="users-list-card light-card"><div className="users-list-heading"><h2>Cuentas del panel</h2><span>{users.filter((user) => user.role === 'superadmin').length} superadministrador</span></div>
      {users.length ? <ul className="users-list">{users.map((user) => <li key={user.username}><div className="users-avatar"><UserRound size={18}/></div><div className="users-main"><strong>{user.username}{user.username === currentUser.username && <small>Sesión actual</small>}</strong><span>{roleLabel(user.role)}</span></div><p>{ROLE_OPTIONS.find((item) => item.id === user.role)?.description}</p><div className="users-actions"><button type="button" className="sales-action-btn" aria-label={`Editar ${user.username}`} title="Editar usuario" onClick={() => openEdit(user)}><Pencil size={15}/></button><button type="button" className="sales-action-btn delete" aria-label={`Eliminar ${user.username}`} title="Eliminar usuario" onClick={() => removeUser(user)}><Trash2 size={15}/></button></div></li>)}</ul> : <p className="pos-empty-note">Aún no hay usuarios.</p>}
      {error && !modalOpen && <p className="login-error" role="alert">{error}</p>}
    </section>
    {modalOpen && <div className="modal-backdrop" role="presentation" onClick={() => setModalOpen(false)}><form className="booking-modal-card users-edit-modal" role="dialog" aria-modal="true" aria-labelledby="users-modal-title" onSubmit={saveUser} onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><span className="modal-kicker">CUENTA DEL PANEL</span><h2 id="users-modal-title" className="modal-title">{editingUser ? 'Editar usuario' : 'Crear usuario'}</h2></div><button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)} aria-label="Cerrar"><X size={20}/></button></div><div className="modal-body"><label className="field-label" htmlFor="managed-username">Usuario</label><input id="managed-username" className="modal-input" autoComplete="off" value={username} onChange={(event) => setUsername(event.target.value)} disabled={editingUser?.username === currentUser.username || editingUser?.username === 'admin'} required/><label className="field-label users-form-label" htmlFor="managed-password">Contraseña</label><input id="managed-password" className="modal-input" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required/><label className="field-label users-form-label" htmlFor="managed-role">Rol</label><select id="managed-role" className="modal-input" value={role} onChange={(event) => setRole(event.target.value)} disabled={editingUser?.username === currentUser.username || editingUser?.username === 'admin'}>{ROLE_OPTIONS.filter((option) => option.id !== 'superadmin' || username.trim().toLowerCase() === 'admin').map((option) => <option key={option.id} value={option.id}>{option.label} — {option.description}</option>)}</select>{error && <p className="login-error" role="alert">{error}</p>}</div><div className="modal-footer"><button type="submit" className="submit-booking-btn"><KeyRound size={16}/><span>{editingUser ? 'Guardar cambios' : 'Crear usuario'}</span></button></div></form></div>}
  </section>
}
