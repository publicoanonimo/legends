import { useState } from 'react'
import {
  Package, AlertTriangle, CheckCircle2, Search, Plus, Minus,
  Sparkles, RefreshCw, BarChart2
} from 'lucide-react'
import { playClickSound } from '../../utils/sound'

const initialInventory = [
  { id: 'INV-01', name: 'Manillas Preventa (Rojas)', category: 'Accesos', stock: 108, total: 450, unit: 'unidades', minAlert: 50 },
  { id: 'INV-02', name: 'Manillas VIP (Doradas)', category: 'Accesos', stock: 24, total: 100, unit: 'unidades', minAlert: 20 },
  { id: 'INV-03', name: 'Singani La Casa Real 750ml', category: 'Licores', stock: 14, total: 30, unit: 'botellas', minAlert: 10 },
  { id: 'INV-04', name: 'Ron Flor de Caña / Havana 750ml', category: 'Licores', stock: 8, total: 25, unit: 'botellas', minAlert: 10 },
  { id: 'INV-05', name: 'Jägermeister 700ml', category: 'Licores', stock: 5, total: 15, unit: 'botellas', minAlert: 6 },
  { id: 'INV-06', name: 'Whisky Rebel 750ml', category: 'Licores', stock: 9, total: 20, unit: 'botellas', minAlert: 8 },
  { id: 'INV-07', name: 'Red Bull Energy Drink', category: 'Mezcladores', stock: 48, total: 120, unit: 'latas', minAlert: 30 },
  { id: 'INV-08', name: 'Sprite 2L Retornable/Descartable', category: 'Mezcladores', stock: 32, total: 60, unit: 'botellas', minAlert: 15 },
  { id: 'INV-09', name: 'Coca-Cola 2L', category: 'Mezcladores', stock: 28, total: 50, unit: 'botellas', minAlert: 15 },
  { id: 'INV-10', name: 'Bolsas de Hielo 5kg', category: 'Insumos', stock: 18, total: 40, unit: 'bolsas', minAlert: 12 },
  { id: 'INV-11', name: 'Jarras de Acrílico 1.5L', category: 'Insumos', stock: 35, total: 40, unit: 'unidades', minAlert: 10 },
  { id: 'INV-12', name: 'Vasos Plásticos Gruesos (Paquete x50)', category: 'Insumos', stock: 12, total: 25, unit: 'paquetes', minAlert: 8 },
]

export default function InventarioModule({ onToast }) {
  const [items, setItems] = useState(initialInventory)
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('Todos')

  const categories = ['Todos', 'Accesos', 'Licores', 'Mezcladores', 'Insumos']

  const updateStock = (id, delta) => {
    playClickSound()
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stock + delta)
          return { ...item, stock: newStock }
        }
        return item
      })
    )
  }

  const filtered = items.filter((item) => {
    const matchesCat = selectedCat === 'Todos' || item.category === selectedCat
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  const lowStockCount = items.filter((i) => i.stock <= i.minAlert).length

  return (
    <div className="module-view inventory-view">
      <div className="module-header">
        <div>
          <span className="module-kicker">CONTROL DE EXISTENCIAS EN BARRA</span>
          <h2 className="module-title">Inventario y Suministros</h2>
          <p className="module-subtitle">Monitoreo de manillas de acceso, licores, mezcladores y cristalería para el evento.</p>
        </div>
        <div className="module-header-actions">
          {lowStockCount > 0 && (
            <div className="low-stock-pill">
              <AlertTriangle size={15} />
              <span>{lowStockCount} artículos en nivel crítico</span>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Filters */}
      <div className="inventory-controls-bar">
        <div className="pos-category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-tab ${selectedCat === cat ? 'active' : ''}`}
              onClick={() => setSelectedCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por insumo o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="table-search-input"
          />
        </div>
      </div>

      {/* Inventory Cards Grid */}
      <div className="inventory-grid">
        {filtered.map((item) => {
          const percentage = Math.round((item.stock / item.total) * 100)
          const isLow = item.stock <= item.minAlert

          return (
            <div key={item.id} className={`inv-card ${isLow ? 'low-stock-card' : ''}`}>
              <div className="inv-top">
                <div>
                  <span className="inv-category">{item.category} · <code>{item.id}</code></span>
                  <h4 className="inv-name">{item.name}</h4>
                </div>
                <span className={`inv-status-tag ${isLow ? 'status-critical' : 'status-good'}`}>
                  {isLow ? (
                    <>
                      <AlertTriangle size={12} />
                      <span>Stock Bajo</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={12} />
                      <span>Disponible</span>
                    </>
                  )}
                </span>
              </div>

              <div className="inv-stock-level">
                <div className="stock-number-row">
                  <span className="stock-big-num">{item.stock}</span>
                  <span className="stock-unit-label">/ {item.total} {item.unit}</span>
                  <strong className="stock-percent">{percentage}%</strong>
                </div>
                <div className="stock-track">
                  <div
                    className={`stock-fill ${isLow ? 'fill-low' : 'fill-good'}`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>

              <div className="inv-actions">
                <span className="stock-hint">Mínimo sugerido: {item.minAlert} {item.unit}</span>
                <div className="inv-stepper">
                  <button
                    type="button"
                    onClick={() => updateStock(item.id, -1)}
                    disabled={item.stock <= 0}
                    aria-label={`Reducir 1 ${item.name}`}
                  >
                    <Minus size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStock(item.id, 1)}
                    aria-label={`Aumentar 1 ${item.name}`}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
