import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, doc, onSnapshot, orderBy, query, runTransaction, serverTimestamp } from 'firebase/firestore'
import { Banknote, CreditCard, PackagePlus, Plus, ShoppingBag, X } from 'lucide-react'
import { db } from '../firebase'

const money = (value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2 }).format(Number(value) || 0)

function PaymentModal({ total, onClose, onPay }) {
  return <div className="modal-backdrop" onClick={onClose} role="presentation"><div className="booking-modal-card payment-modal" role="dialog" aria-modal="true" aria-labelledby="payment-title" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><span className="modal-kicker">CONFIRMAR COBRO</span><h2 id="payment-title" className="modal-title">{money(total)}</h2></div><button className="modal-close-btn" onClick={onClose} aria-label="Cerrar"><X size={20} /></button></div><div className="payment-options"><button className="payment-option qr" onClick={() => onPay('QR')}><CreditCard size={28} /><strong>QR</strong><span>Pago digital</span></button><button className="payment-option cash" onClick={() => onPay('Efectivo')}><Banknote size={28} /><strong>Efectivo</strong><span>Pago en caja</span></button></div></div></div>
}

export default function CajaModule({ onToast }) {
  const [products, setProducts] = useState([])
  const [packs, setPacks] = useState([])
  const [packName, setPackName] = useState('')
  const [selected, setSelected] = useState([])
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [paymentPack, setPaymentPack] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsubProducts = onSnapshot(query(collection(db, 'posProducts'), orderBy('createdAt', 'desc')), (s) => setProducts(s.docs.map((d) => ({ id: d.id, ...d.data() }))), () => setError('No se pudo cargar el inventario.'))
    const unsubPacks = onSnapshot(query(collection(db, 'posPacks'), orderBy('createdAt', 'desc')), (s) => setPacks(s.docs.map((d) => ({ id: d.id, ...d.data() }))), () => setError('No se pudieron cargar los packs.'))
    return () => { unsubProducts(); unsubPacks() }
  }, [])
  const total = useMemo(() => selected.reduce((sum, p) => sum + Number(p.price || 0), 0), [selected])
  const toggleProduct = (product) => setSelected((current) => {
    const exists = current.find((item) => item.id === product.id)
    if (exists) return current.filter((item) => item.id !== product.id)
    if (Number(product.quantity) <= 0) { setError(`${product.name} no tiene stock.`); return current }
    setError('')
    return [...current, { id: product.id, name: product.name, price: Number(product.salePrice ?? product.price ?? 0) }]
  })
  const savePack = async () => {
    if (!packName.trim()) return setError('Escribe el nombre del pack.')
    if (!selected.length) return setError('Selecciona al menos un producto.')
    setSaving(true)
    try {
      await addDoc(collection(db, 'posPacks'), { name: packName.trim(), products: selected, total, createdAt: serverTimestamp() })
      setPackName(''); setSelected([]); setCreatorOpen(false); setError('')
      onToast?.({ type: 'success', title: 'Pack creado', message: `${money(total)} agregado al inventario disponible.` })
    } catch (saveError) { console.error('No se pudo guardar el pack:', saveError); setError(saveError.code === 'permission-denied' ? 'Firebase bloqueó el guardado del pack. Publica las reglas actualizadas de Firestore.' : `No se pudo guardar el pack: ${saveError.message || 'error desconocido'}`) } finally { setSaving(false) }
  }
  const completeSale = async (method) => {
    setSaving(true)
    try {
      await runTransaction(db, async (transaction) => {
        const refs = paymentPack.products.map((item) => doc(db, 'posProducts', item.id))
        const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)))
        snapshots.forEach((snapshot, index) => { if (!snapshot.exists() || Number(snapshot.data().quantity) < 1) throw new Error(`Stock insuficiente para ${paymentPack.products[index].name}.`) })
        snapshots.forEach((snapshot) => transaction.update(snapshot.ref, { quantity: Number(snapshot.data().quantity) - 1, updatedAt: serverTimestamp() }))
        transaction.set(doc(collection(db, 'posSales')), { buyer: paymentPack.name, paymentMethod: method, packId: paymentPack.id, products: paymentPack.products.map((item) => ({ id: item.id, name: item.name, price: Number(item.price), quantity: 1 })), total: Number(paymentPack.total), createdAt: serverTimestamp() })
      })
      onToast?.({ type: 'success', title: 'Venta registrada', message: `${paymentPack.name} · ${money(paymentPack.total)} · ${method}` })
      setPaymentPack(null)
    } catch (saleError) { setError(saleError.message || 'No se pudo registrar la venta.'); setPaymentPack(null) } finally { setSaving(false) }
  }

  return <section className="dashboard-module caja-module"><div className="dashboard-page-heading"><div><span className="dashboard-eyebrow">CAJA POS · VENTAS</span><h1>Caja POS</h1><p>Crea packs con productos del inventario y registra su cobro.</p></div><span className="dashboard-total"><ShoppingBag size={18} /> {packs.length} packs</span></div>
    <section className="pos-products-panel light-card"><div className="sales-history-heading"><div><h2>Inventario disponible</h2></div></div><div className="pos-products-grid"><button type="button" className="pos-product-card create-pack-card" onClick={() => { setCreatorOpen(true); setError('') }}><PackagePlus size={28}/><strong>Crear pack</strong><small>Arma un pack de productos</small></button>{packs.map((pack) => <button type="button" className="pos-product-card" key={pack.id} onClick={() => setPaymentPack(pack)}><strong>{pack.name}</strong><span>{money(pack.total)}</span><small>{pack.products?.length || 0} productos · Toca para cobrar</small></button>)}</div>{!packs.length && <p className="pos-empty-note">Crea un pack para que aparezca aquí.</p>}</section>
    {creatorOpen && <div className="modal-backdrop" onClick={() => setCreatorOpen(false)} role="presentation"><div className="booking-modal-card pack-modal" role="dialog" aria-modal="true" aria-labelledby="pack-title" onClick={(e) => e.stopPropagation()}><div className="modal-header"><div><span className="modal-kicker">NUEVO PACK</span><h2 id="pack-title" className="modal-title">Crear pack</h2></div><button className="modal-close-btn" onClick={() => setCreatorOpen(false)} aria-label="Cerrar"><X size={20}/></button></div><div className="pack-modal-body"><label className="field-label" htmlFor="pack-name">Nombre del pack</label><input id="pack-name" className="modal-input" value={packName} onChange={(e) => setPackName(e.target.value)} maxLength={80} placeholder="Ej. Pack de celebración"/><div className="cart-total"><span>Productos seleccionados</span><strong>{money(total)}</strong></div><div className="pos-products-grid pack-product-grid">{products.map((product) => { const chosen = selected.some((item) => item.id === product.id); return <button key={product.id} type="button" className={`pos-product-card ${chosen ? 'pack-product-selected' : ''} ${Number(product.quantity) <= 0 ? 'sold-out' : ''}`} onClick={() => toggleProduct(product)} disabled={Number(product.quantity) <= 0}><strong>{product.name}</strong><span>{money(product.salePrice ?? product.price)}</span><small>{chosen ? 'Agregado · toca para quitar' : `${Number(product.quantity)} unidades · toca para agregar`}</small></button> })}</div>{!products.length && <p className="pos-empty-note">Agrega productos en Inventario para armar packs.</p>}{error && <p className="login-error" role="alert">{error}</p>}<button className="submit-booking-btn pos-charge-btn" disabled={saving} onClick={savePack}><Plus size={17}/><span>{saving ? 'Guardando…' : 'Guardar pack'}</span></button></div></div></div>}
    {paymentPack && <PaymentModal total={paymentPack.total} onClose={() => setPaymentPack(null)} onPay={completeSale}/>}{error && !creatorOpen && <p className="login-error" role="alert">{error}</p>}
  </section>
}
