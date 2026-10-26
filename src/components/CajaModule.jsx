import { useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot, orderBy, query, runTransaction, serverTimestamp } from 'firebase/firestore'
import { Banknote, CreditCard, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { db } from '../firebase'

const money = (value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2 }).format(Number(value) || 0)

function PaymentModal({ total, onClose, onPay }) {
  return <div className="modal-backdrop" onClick={onClose} role="presentation">
    <div className="booking-modal-card payment-modal" role="dialog" aria-modal="true" aria-labelledby="payment-title" onClick={(event) => event.stopPropagation()}>
      <div className="modal-header"><div><span className="modal-kicker">✦ CONFIRMAR COBRO</span><h2 id="payment-title" className="modal-title">{money(total)}</h2></div><button className="modal-close-btn" onClick={onClose} aria-label="Cerrar"><X size={20} /></button></div>
      <div className="payment-options"><button className="payment-option qr" onClick={() => onPay('QR')}><CreditCard size={28} /><strong>QR</strong><span>Pago digital</span></button><button className="payment-option cash" onClick={() => onPay('Efectivo')}><Banknote size={28} /><strong>Efectivo</strong><span>Pago en caja</span></button></div>
    </div>
  </div>
}

export default function CajaModule({ onToast }) {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [buyer, setBuyer] = useState('')
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, 'posProducts'), orderBy('createdAt', 'desc')), (snapshot) => setProducts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), (snapshotError) => setError('No se pudo cargar el inventario.'))
    return unsubscribe
  }, [])
  const total = useMemo(() => cart.reduce((sum, item) => sum + Number(item.salePrice || 0) * item.quantity, 0), [cart])
  const addProduct = (product) => {
    if (Number(product.quantity) <= 0) return onToast?.({ type: 'error', title: 'Sin stock', message: `${product.name} está agotado.` })
    setCart((current) => {
      const found = current.find((item) => item.id === product.id)
      if (found) return current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, Number(product.quantity)) } : item)
      if (current.length >= 3) { setError('Puedes seleccionar hasta 3 productos distintos por venta.'); return current }
      setError(''); return [...current, { id: product.id, name: product.name, salePrice: Number(product.salePrice ?? product.price ?? 0), quantity: 1 }]
    })
  }
  const changeCart = (id, changes) => setCart((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item).filter((item) => item.quantity > 0))
  const beginPayment = () => {
    if (!buyer.trim()) return setError('Escribe el nombre de la venta o del cliente.')
    if (!cart.length) return setError('Selecciona al menos un producto.')
    if (cart.some((item) => !Number.isFinite(Number(item.salePrice)) || Number(item.salePrice) <= 0)) return setError('Cada producto debe tener un precio de venta válido.')
    setError(''); setPaymentOpen(true)
  }
  const completeSale = async (method) => {
    setSaving(true)
    try {
      await runTransaction(db, async (transaction) => {
        const inventory = await Promise.all(cart.map((item) => transaction.get(doc(db, 'posProducts', item.id))))
        inventory.forEach((snapshot, index) => { if (!snapshot.exists() || Number(snapshot.data().quantity) < cart[index].quantity) throw new Error(`Stock insuficiente para ${cart[index].name}.`) })
        inventory.forEach((snapshot, index) => transaction.update(snapshot.ref, { quantity: Number(snapshot.data().quantity) - cart[index].quantity, updatedAt: serverTimestamp() }))
        transaction.set(doc(collection(db, 'posSales')), { buyer: buyer.trim(), paymentMethod: method, products: cart.map((item) => ({ name: item.name, price: Number(item.salePrice), quantity: item.quantity })), total, createdAt: serverTimestamp() })
      })
      onToast?.({ type: 'success', title: 'Venta registrada', message: `${buyer.trim()} · ${money(total)} · ${method}` })
      setCart([]); setBuyer(''); setPaymentOpen(false)
    } catch (saleError) { setError(saleError.message || 'No se pudo guardar la venta.'); setPaymentOpen(false) } finally { setSaving(false) }
  }
  return <section className="dashboard-module caja-module"><div className="dashboard-page-heading"><div><span className="dashboard-eyebrow">CAJA POS · VENTAS</span><h1>Caja POS</h1><p>Selecciona hasta 3 productos. El stock se descuenta al confirmar el pago.</p></div><span className="dashboard-total"><ShoppingBag size={18} /> {cart.length}/3 productos</span></div>
    <div className="pos-sale-layout"><section className="pos-products-panel light-card"><h2>Inventario disponible</h2><div className="pos-products-grid">{products.map((product) => <button type="button" className={`pos-product-card ${Number(product.quantity) <= 0 ? 'sold-out' : ''}`} key={product.id} onClick={() => addProduct(product)} disabled={Number(product.quantity) <= 0}><strong>{product.name}</strong><span>{money(product.salePrice ?? product.price)}</span><small>{Number(product.quantity)} unidades</small></button>)}</div>{products.length === 0 && <p className="pos-empty-note">Crea productos en Inventario para venderlos aquí.</p>}</section>
      <section className="pos-cart-panel light-card"><h2>Venta actual</h2><label className="field-label" htmlFor="sale-buyer">Nombre de la venta / cliente</label><input id="sale-buyer" className="modal-input" value={buyer} onChange={(e) => setBuyer(e.target.value)} placeholder="Ej. Mesa 4 o nombre del cliente" maxLength={80}/><div className="cart-list">{cart.map((item) => <div className="cart-item" key={item.id}><div><strong>{item.name}</strong><label>Precio (Bs)<input type="number" min="0.01" step="0.01" value={item.salePrice} onChange={(e) => changeCart(item.id, { salePrice: e.target.value })}/></label></div><div className="cart-quantity"><button onClick={() => changeCart(item.id, { quantity: item.quantity - 1 })} aria-label="Restar"><Minus size={14}/></button><span>{item.quantity}</span><button onClick={() => changeCart(item.id, { quantity: item.quantity + 1 })} aria-label="Sumar"><Plus size={14}/></button></div></div>)}</div>{!cart.length && <p className="pos-empty-note">Toca una tarjeta de producto para agregarla.</p>}<div className="cart-total"><span>Total</span><strong>{money(total)}</strong></div>{error && <p className="login-error" role="alert">{error}</p>}<button className="submit-booking-btn pos-charge-btn" disabled={saving} onClick={beginPayment}><Banknote size={17}/><span>{saving ? 'Guardando…' : 'Cobrar venta'}</span></button></section></div>
    {paymentOpen && <PaymentModal total={total} onClose={() => setPaymentOpen(false)} onPay={completeSale}/>}</section>
}
