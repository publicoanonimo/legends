import { useState } from 'react'
import {
  TrendingUp, Users, Ticket, Beer, ShieldCheck,
  Search, ArrowUpRight, Plus, RefreshCw, CheckCircle2, Clock
} from 'lucide-react'
import { playClickSound } from '../../utils/sound'

const initialRecentBookings = [
  { id: 'LEG-1092', client: 'Carlos Mendoza', type: 'Mesa Fantasma', total: 300, date: 'Hace 12 min', status: 'Confirmado', method: 'QR Simple' },
  { id: 'LEG-1091', client: 'Valeria Torrez', type: '4x Preventa', total: 40, date: 'Hace 34 min', status: 'Confirmado', method: 'Efectivo' },
  { id: 'LEG-1090', client: 'Rodrigo Aliaga', type: 'Mesa Pennywise', total: 250, date: 'Hace 1 hora', status: 'Confirmado', method: 'QR Simple' },
  { id: 'LEG-1089', client: 'Natalia Quispe', type: 'Mesa Maldita', total: 280, date: 'Hace 2 horas', status: 'Pendiente', method: 'Transferencia' },
  { id: 'LEG-1088', client: 'Alejandro Rios', type: '2x Preventa', total: 20, date: 'Hace 3 horas', status: 'Confirmado', method: 'QR Simple' },
]

export default function DashboardModule({ onNavigate, onToast }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [bookings, setBookings] = useState(initialRecentBookings)

  const filtered = bookings.filter((b) => {
    const matchesFilter = filter === 'all' || (filter === 'confirmed' && b.status === 'Confirmado') || (filter === 'pending' && b.status === 'Pendiente')
    const matchesSearch = b.client.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()) || b.type.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const refreshData = () => {
    playClickSound()
    if (onToast) {
      onToast({
        type: 'info',
        title: 'Métricas actualizadas',
        message: 'Datos del evento sincronizados en tiempo real.',
      })
    }
  }

  return (
    <div className="module-view dashboard-view">
      <div className="module-header">
        <div>
          <span className="module-kicker">PANEL DE CONTROL DEL EVENTO</span>
          <h2 className="module-title">Dashboard Operativo</h2>
          <p className="module-subtitle">Monitoreo en tiempo real de ventas, aforo y reservas de Paranormal Fest.</p>
        </div>
        <div className="module-header-actions">
          <button className="secondary-action-btn" onClick={refreshData}>
            <RefreshCw size={15} />
            <span>Actualizar</span>
          </button>
          <button className="primary-action-btn" onClick={() => onNavigate('caja')}>
            <Plus size={16} />
            <span>Nueva Venta</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap red-glow">
            <TrendingUp size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">RECAUDACIÓN TOTAL</span>
            <div className="kpi-val-row">
              <strong className="kpi-val">14,890 <small>Bs</small></strong>
              <span className="kpi-badge positive">+18% hoy</span>
            </div>
            <div className="kpi-progress-bar">
              <div className="kpi-progress-fill" style={{ width: '74%' }} />
            </div>
            <span className="kpi-subtext">Meta: 20,000 Bs (74% alcanzado)</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap violet-glow">
            <Ticket size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">PREVENTAS VENDIDAS</span>
            <div className="kpi-val-row">
              <strong className="kpi-val">342 <small>/ 450</small></strong>
              <span className="kpi-badge positive">76% cupo</span>
            </div>
            <div className="kpi-progress-bar">
              <div className="kpi-progress-fill violet" style={{ width: '76%' }} />
            </div>
            <span className="kpi-subtext">Quedan 108 entradas a 10 Bs</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap gold-glow">
            <Beer size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">MESAS VIP RESERVADAS</span>
            <div className="kpi-val-row">
              <strong className="kpi-val">19 <small>/ 25</small></strong>
              <span className="kpi-badge warning">Últimas 6</span>
            </div>
            <div className="kpi-progress-bar">
              <div className="kpi-progress-fill gold" style={{ width: '80%' }} />
            </div>
            <span className="kpi-subtext">Pennywise & Fantasma casi agotadas</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap cyan-glow">
            <Users size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">AFORO ESTIMADO</span>
            <div className="kpi-val-row">
              <strong className="kpi-val">520 <small>asistentes</small></strong>
              <span className="kpi-badge neutral">Cap. 650</span>
            </div>
            <div className="kpi-progress-bar">
              <div className="kpi-progress-fill cyan" style={{ width: '80%' }} />
            </div>
            <span className="kpi-subtext">San Pedro · Local habilitado</span>
          </div>
        </div>
      </div>

      {/* Charts and Status */}
      <div className="dashboard-columns">
        <div className="chart-card">
          <div className="card-top">
            <div>
              <h3 className="card-title">Ritmo de Ventas por Día</h3>
              <p className="card-sub">Evolución de preventas en bolivianos</p>
            </div>
            <span className="chart-tag">OCTUBRE 2026</span>
          </div>

          <div className="chart-visual" aria-label="Gráfico de ventas">
            {[
              { day: 'Lun 21', value: 45, bs: '1,450' },
              { day: 'Mar 22', value: 60, bs: '2,100' },
              { day: 'Mie 23', value: 75, bs: '2,900' },
              { day: 'Jue 24', value: 50, bs: '1,800' },
              { day: 'Vie 25', value: 90, bs: '3,850' },
              { day: 'Sab 26', value: 100, bs: '4,200', active: true },
              { day: 'Hoy', value: 85, bs: '3,490', current: true },
            ].map((col, idx) => (
              <div key={idx} className={`chart-col ${col.current ? 'current-col' : ''}`}>
                <div className="bar-wrapper">
                  <span className="bar-tooltip">{col.bs} Bs</span>
                  <div className="bar-fill" style={{ height: `${col.value}%` }} />
                </div>
                <span className="bar-label">{col.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="status-card">
          <div className="card-top">
            <h3 className="card-title">Disponibilidad de Mesas</h3>
            <span className="badge-pill">5 Paquetes</span>
          </div>
          <div className="tables-mini-list">
            {[
              { name: 'Mesa Pennywise', price: '250 Bs', total: 6, reserved: 5, color: '#ff1744' },
              { name: 'Mesa del Infierno', price: '260 Bs', total: 5, reserved: 4, color: '#ff526c' },
              { name: 'Mesa Fantasma', price: '300 Bs', total: 4, reserved: 4, color: '#a500ff', full: true },
              { name: 'Mesa Maldita', price: '280 Bs', total: 5, reserved: 3, color: '#00d9ff' },
              { name: 'Mesa de Conjuro', price: '280 Bs', total: 5, reserved: 3, color: '#ffb300' },
            ].map((table, idx) => (
              <div key={idx} className="table-mini-item">
                <div className="table-mini-left">
                  <span className="table-color-dot" style={{ background: table.color }} />
                  <div>
                    <strong className="table-name">{table.name}</strong>
                    <small className="table-price-tag">{table.price}</small>
                  </div>
                </div>
                <div className="table-mini-right">
                  <span className={`table-count-badge ${table.full ? 'badge-full' : ''}`}>
                    {table.full ? 'Agotada' : `${table.reserved}/${table.total} Ocupadas`}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="view-inventory-link" onClick={() => onNavigate('inventario')}>
            <span>Gestionar inventario de bebidas</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="table-card">
        <div className="table-header-bar">
          <div>
            <h3 className="card-title">Últimas Reservas y Ventas</h3>
            <p className="card-sub">Registro inmediato sincronizado con WhatsApp y Caja</p>
          </div>
          <div className="table-filters">
            <div className="search-wrap">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar cliente, código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="table-search-input"
              />
            </div>
            <div className="filter-pill-group">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Todos
              </button>
              <button
                className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
                onClick={() => setFilter('confirmed')}
              >
                Confirmados
              </button>
              <button
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pendientes
              </button>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>CÓDIGO</th>
                <th>CLIENTE</th>
                <th>TIPO</th>
                <th>MONTO</th>
                <th>MÉTODO</th>
                <th>TIEMPO</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td><code className="code-cell">{item.id}</code></td>
                  <td><strong>{item.client}</strong></td>
                  <td><span className="type-badge">{item.type}</span></td>
                  <td><strong className="money-cell">{item.total} Bs</strong></td>
                  <td><span className="method-tag">{item.method}</span></td>
                  <td><span className="time-cell">{item.date}</span></td>
                  <td>
                    <span className={`status-pill ${item.status === 'Confirmado' ? 'confirmed' : 'pending'}`}>
                      {item.status === 'Confirmado' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
