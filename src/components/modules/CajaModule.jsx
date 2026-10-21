import { useState } from 'react'
import {
  CreditCard, Banknote, QrCode, ShoppingCart, Trash2, Plus, Minus,
  CheckCircle2, Printer, Sparkles, RefreshCw
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { playClickSound, playSuccessSound } from '../../utils/sound'

const catalog = [
  { id: 't-prev', name: 'Entrada Preventa', price: 10, category: 'Entradas' },
  { id: 't-door', name: 'Entrada Puerta', price: 15, category: 'Entradas' },
  { id: 't-vip', name: 'Entrada VIP / Free Pass', price: 25, category: 'Entradas' },
  { id: 'm-penny', name: 'Mesa Pennywise', price: 250, category: 'Mesas' },
  { id: 'm-infierno', name: 'Mesa del Infierno', price: 260, category: 'Mesas' },
  { id: 'm-fantasma', name: 'Mesa Fantasma', price: 300, category: 'Mesas' },
  { id: 'b-redbull', name: 'Lata Red Bull', price: 20, category: 'Bar' },
  { id: 'b-singani', name: 'Botella La Casa Real', price: 120, category: 'Bar' },
  { id: 'b-ron', name: 'Botella Ron Flor de Caña', price: 130, category: 'Bar' },
  { id: 'b-cerveza', name: 'Cerveza Huari / Paceña', price: 18, category: 'Bar' },
  { id: 'b-soda', name: 'Refresco 2L + Hielo', price: 25, category: 'Bar' },
]

export default function CajaModule({ onToast }) {
  const [cart, setCart] = useState([
    { id: 't-prev', name: 'Entrada Preventa', price: 10, qty: 2 },
  ])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [cashGiven, setCashGiven] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [recentSales, setRecentSales] = useState([
    { id: 'TKT-8012', items: '2x Preventa', total: 20, method: 'QR', time: '10:42 AM' },
    { id: 'TKT-8011', items: '1x Mesa Pennywise', total: 250, method: 'Efectivo', time: '10:35 AM' },
  ])
  const [receipt, setReceipt] = useState(null)

  const categories = ['Todos', 'Entradas', 'Mesas', 'Bar']

  const filteredCatalog = catalog.filter(
    (c) => selectedCategory === 'Todos' || c.category === selectedCategory
  )

  const addToCart = (product) => {
    playClickSound()
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    playClickSound()
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta
            return newQty > 0 ? { ...item, qty: newQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const clearCart = () => {
    setCart([])
    setCashGiven('')
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const cashNum = parseFloat(cashGiven) || 0
  const change = cashNum >= total ? cashNum - total : 0

  const handleCheckout = () => {
    if (cart.length === 0) return
    playSuccessSound()
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } })
    } catch (e) {
      // ignore
    }

    const newSale = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      items: cart.map((i) => `${i.qty}x ${i.name}`).join(', '),
      total,
      method: paymentMethod === 'cash' ? 'Efectivo' : 'QR Simple',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setRecentSales([newSale, ...recentSales])
    setReceipt(newSale)
    clearCart()

    if (onToast) {
      onToast({
        type: 'success',
        title: 'Cobro completado',
        message: `Venta registrada por ${total} Bs (${newSale.method}).`,
      })
    }
  }

  return (
    <div className="module-view pos-view">
      <div className="module-header">
        <div>
          <span className="module-kicker">PUNTO DE COBRO Y PUERTA</span>
          <h2 className="module-title">Caja / Terminal POS</h2>
          <p className="module-subtitle">Cobro rápido de entradas, mesas y barra para la noche del evento.</p>
        </div>
      </div>

      <div className="pos-layout">
        {/* Left: Catalog */}
        <div className="pos-catalog-panel">
          <div className="pos-category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`cat-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="pos-items-grid">
            {filteredCatalog.map((item) => (
              <button
                key={item.id}
                type="button"
                className="pos-item-btn"
                onClick={() => addToCart(item)}
              >
                <div className="pos-item-info">
                  <span className="pos-item-category">{item.category}</span>
                  <strong className="pos-item-name">{item.name}</strong>
                </div>
                <div className="pos-item-price-tag">
                  <strong>{item.price}</strong> <small>Bs</small>
                </div>
              </button>
            ))}
          </div>

          {/* Quick history */}
          <div className="pos-history-box">
            <h4 className="pos-history-title">Últimos Cobros en este Turno</h4>
            <div className="pos-history-list">
              {recentSales.map((sale) => (
                <div key={sale.id} className="pos-history-item">
                  <div className="history-left">
                    <code>{sale.id}</code>
                    <span>{sale.items}</span>
                  </div>
                  <div className="history-right">
                    <strong>{sale.total} Bs</strong>
                    <small>{sale.method} · {sale.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart & Payment */}
        <div className="pos-cart-panel">
          <div className="cart-header">
            <div className="cart-title-row">
              <ShoppingCart size={18} />
              <h3>Detalle de Venta</h3>
            </div>
            {cart.length > 0 && (
              <button className="clear-cart-btn" onClick={clearCart} title="Vaciar orden">
                <Trash2 size={15} />
                <span>Vaciar</span>
              </button>
            )}
          </div>

          <div className="cart-items-list">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <span>✦</span>
                <p>No hay artículos en la orden.<br />Toca un producto de la izquierda para agregar.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <div className="cart-item-info">
                    <span className="cart-item-title">{item.name}</span>
                    <small className="cart-item-unit">{item.price} Bs c/u</small>
                  </div>
                  <div className="cart-item-actions">
                    <div className="cart-stepper">
                      <button onClick={() => updateQty(item.id, -1)} aria-label="Menos">
                        <Minus size={12} />
                      </button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} aria-label="Más">
                        <Plus size={12} />
                      </button>
                    </div>
                    <strong className="cart-item-subtotal">{item.price * item.qty} Bs</strong>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <div className="cart-summary-line">
              <span>Total a Cobrar</span>
              <strong className="cart-total-num">{total} <small>Bs</small></strong>
            </div>

            {/* Payment method selector */}
            <div className="method-picker">
              <button
                type="button"
                className={`method-option ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <Banknote size={17} />
                <span>Efectivo</span>
              </button>
              <button
                type="button"
                className={`method-option ${paymentMethod === 'qr' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('qr')}
              >
                <QrCode size={17} />
                <span>QR Simple</span>
              </button>
            </div>

            {paymentMethod === 'cash' && total > 0 && (
              <div className="cash-calculator">
                <div className="cash-input-row">
                  <label htmlFor="cash-given">Efectivo Recibido (Bs):</label>
                  <input
                    id="cash-given"
                    type="number"
                    placeholder="Ej. 50"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    className="cash-input"
                  />
                </div>
                <div className="quick-amounts">
                  {[total, 20, 50, 100, 200].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className="quick-amt-btn"
                      onClick={() => setCashGiven(String(amt))}
                    >
                      {amt} Bs
                    </button>
                  ))}
                </div>
                {cashNum > 0 && (
                  <div className={`change-display ${cashNum >= total ? 'ok' : 'pending'}`}>
                    <span>{cashNum >= total ? 'CAMBIO / VUELTO:' : 'FALTANTE:'}</span>
                    <strong>{Math.abs(change)} Bs</strong>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'qr' && total > 0 && (
              <div className="qr-sim-box">
                <div className="qr-icon-placeholder">
                  <QrCode size={48} className="qr-svg" />
                  <span>QR Dinámico generado</span>
                </div>
                <p>Monto codificado: <strong>{total} Bs</strong></p>
              </div>
            )}

            <button
              type="button"
              className="checkout-btn"
              disabled={cart.length === 0 || (paymentMethod === 'cash' && cashNum > 0 && cashNum < total)}
              onClick={handleCheckout}
            >
              <CheckCircle2 size={18} />
              <span>COBRAR {total} BS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {receipt && (
        <div className="modal-backdrop" onClick={() => setReceipt(null)}>
          <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-paper">
              <div className="receipt-brand">
                <h2>THE LEGENDS</h2>
                <span>PARANORMAL FEST · COMPROBANTE</span>
                <small>San Pedro · 30 de Octubre</small>
              </div>

              <div className="receipt-divider" />

              <div className="receipt-data-rows">
                <div className="receipt-row">
                  <span>Nro. Ticket:</span>
                  <strong>{receipt.id}</strong>
                </div>
                <div className="receipt-row">
                  <span>Hora:</span>
                  <span>{receipt.time}</span>
                </div>
                <div className="receipt-row">
                  <span>Método:</span>
                  <span>{receipt.method}</span>
                </div>
                <div className="receipt-row">
                  <span>Detalle:</span>
                  <span>{receipt.items}</span>
                </div>
              </div>

              <div className="receipt-divider" />

              <div className="receipt-total-row">
                <strong>TOTAL PAGADO</strong>
                <strong>{receipt.total} Bs</strong>
              </div>

              <div className="receipt-barcode">
                <div className="barcode-lines" />
                <small>Presenta este comprobante en el acceso</small>
              </div>
            </div>

            <div className="receipt-actions">
              <button className="primary-action-btn" onClick={() => setReceipt(null)}>
                <span>Listo</span>
              </button>
              <button
                className="secondary-action-btn"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                <span>Imprimir Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
