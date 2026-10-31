import { useEffect, useMemo, useRef, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore'
import { Banknote, CreditCard, PackagePlus, Plus, ShoppingBag, X, Pencil, Trash2 } from 'lucide-react'
import { db } from '../firebase'

const money = (value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2 }).format(Number(value) || 0)

function PaymentModal({ total, onClose, onPay, busy }) {
  return <div className="modal-backdrop" onClick={onClose} role="presentation"><div className="booking-modal-card payment-modal" role="dialog" aria-modal="true" aria-labelledby="payment-title" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><span className="modal-kicker">CONFIRMAR COBRO</span><h2 id="payment-title" className="modal-title">{money(total)}</h2></div><button className="modal-close-btn" onClick={onClose} aria-label="Cerrar"><X size={20} /></button></div><div className="payment-options"><button className="payment-option qr" disabled={busy} onClick={() => onPay('QR')}><CreditCard size={28} /><strong>QR</strong><span>Pago digital</span></button><button className="payment-option cash" disabled={busy} onClick={() => onPay('Efectivo')}><Banknote size={28} /><strong>Efectivo</strong><span>Pago en caja</span></button></div></div></div>
}

export default function CajaModule({ onToast }) {
  const [products, setProducts] = useState([])
  const [packs, setPacks] = useState([])
  const [packName, setPackName] = useState('')
  const [selected, setSelected] = useState([])
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [editingPackId, setEditingPackId] = useState(null)
  const [pendingEditPack, setPendingEditPack] = useState(null)
  const [pendingDeletePack, setPendingDeletePack] = useState(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [packActionError, setPackActionError] = useState('')
  const [packActionBusy, setPackActionBusy] = useState(false)
  const [paymentPack, setPaymentPack] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const paymentLock = useRef(false)

  useEffect(() => {
    const unsubProducts = onSnapshot(query(collection(db, 'posProducts'), orderBy('createdAt', 'desc')), (s) => {
      const records = s.docs.map((d) => ({ id: d.id, ...d.data() }))
      setProducts(records.filter((item) => !item.recordType))
      setPacks(records.filter((item) => item.recordType === 'pack'))
    }, () => setError('No se pudo cargar el inventario.'))
    return unsubProducts
  }, [])
  const total = useMemo(() => selected.reduce((sum, p) => sum + Number(p.price || 0), 0), [selected])
  const toggleProduct = (product) => setSelected((current) => {
    const exists = current.find((item) => item.id === product.id)
    if (exists) return current.filter((item) => item.id !== product.id)
    if (Number(product.quantity) <= 0) { setError(`${product.name} no tiene stock.`); return current }
    setError('')
    return [...current, { id: product.id, name: product.name, price: Number(product.salePrice ?? product.price ?? 0) }]
  })
  const startCreatePack = () => { setEditingPackId(null); setPackName(''); setSelected([]); setError(''); setCreatorOpen(true) }
  const startEditPack = (pack) => { setEditingPackId(pack.id); setPackName(pack.name); setSelected((pack.products || []).map((item) => ({ ...item }))); setError(''); setCreatorOpen(true) }
  const authorizePackEdit = () => {
    if (deletePassword !== 'admin001') return setPackActionError('Contraseña incorrecta.')
    const pack = pendingEditPack
    setPendingEditPack(null); setDeletePassword(''); setPackActionError('')
    if (pack) startEditPack(pack)
  }
  const savePack = async () => {
    if (!packName.trim()) return setError('Escribe el nombre del pack.')
    if (!selected.length) return setError('Selecciona al menos un producto.')
    setSaving(true)
    try {
      const packData = { recordType: 'pack', name: packName.trim(), products: selected, total, salePrice: total, price: total, quantity: 0, updatedAt: serverTimestamp() }
      if (editingPackId) await updateDoc(doc(db, 'posProducts', editingPackId), packData)
      else await addDoc(collection(db, 'posProducts'), { ...packData, createdAt: serverTimestamp() })
      setPackName(''); setSelected([]); setCreatorOpen(false); setEditingPackId(null); setError('')
      onToast?.({ type: 'success', title: editingPackId ? 'Pack actualizado' : 'Pack creado', message: `${money(total)} · ${packName.trim()}` })
    } catch (saveError) { console.error('No se pudo guardar el pack:', saveError); setError(saveError.code === 'permission-denied' ? 'Firebase bloqueó el guardado del pack. Publica las reglas actualizadas de Firestore.' : `No se pudo guardar el pack: ${saveError.message || 'error desconocido'}`) } finally { setSaving(false) }
  }
  const completeSale = async (method) => {
    if (paymentLock.current || !paymentPack) return
    paymentLock.current = true
    const pack = paymentPack
    setPaymentPack(null)
    setSaving(true)
    try {
      await runTransaction(db, async (transaction) => {
        const refs = pack.products.map((item) => doc(db, 'posProducts', item.id))
        const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)))
        snapshots.forEach((snapshot, index) => { if (!snapshot.exists() || Number(snapshot.data().quantity) < 1) throw new Error(`Stock insuficiente para ${pack.products[index].name}.`) })
        snapshots.forEach((snapshot) => transaction.update(snapshot.ref, { quantity: Number(snapshot.data().quantity) - 1, updatedAt: serverTimestamp() }))
        transaction.set(doc(collection(db, 'posSales')), { buyer: pack.name, paymentMethod: method, packId: pack.id, products: pack.products.map((item) => ({ id: item.id, name: item.name, price: Number(item.price), quantity: 1 })), total: Number(pack.total), createdAt: serverTimestamp() })
      })
      onToast?.({ type: 'success', title: 'Venta registrada', message: `${pack.name} · ${money(pack.total)} · ${method}` })
    } catch (saleError) { setError(saleError.message || 'No se pudo registrar la venta.') } finally { setSaving(false); paymentLock.current = false }
  }
  const deletePack = async () => {
    if (deletePassword !== 'admin001') return setPackActionError('Contraseña incorrecta.')
    if (!pendingDeletePack) return
    setPackActionBusy(true)
    try { await deleteDoc(doc(db, 'posProducts', pendingDeletePack.id)); setPendingDeletePack(null); setDeletePassword(''); setPackActionError(''); onToast?.({ type: 'success', title: 'Pack eliminado', message: pendingDeletePack.name }) }
    catch (deleteError) { setPackActionError(`No se pudo eliminar: ${deleteError.message}`) }
    finally { setPackActionBusy(false) }
  }

  return <section className="dashboard-module caja-module"><div className="dashboard-page-heading"><div><span className="dashboard-eyebrow">CAJA POS · VENTAS</span><h1>Caja POS</h1><p>Crea packs con productos del inventario y registra su cobro.</p></div><span className="dashboard-total"><ShoppingBag size={18} /> {packs.length} packs</span></div>
    <section className="pos-products-panel light-card"><div className="sales-history-heading"><div><h2>Inventario disponible</h2></div></div><div className="inventory-grid"><button type="button" className="pos-create-card pos-create-pack-card" onClick={startCreatePack}><span className="pos-create-icon"><PackagePlus size={24}/></span><strong>Crear pack</strong><span>Arma un pack de productos</span></button>{packs.map((pack) => <article className="inv-card pos-pack-inventory-card" key={pack.id}><button type="button" className="pos-pack-select" onClick={() => !saving && setPaymentPack(pack)} disabled={saving}><div className="inv-top"><div><span className="inv-category">PACK</span><h3 className="inv-name">{pack.name}</h3></div><span className="inv-status-tag status-good">Disponible</span></div><div className="inv-stock-level"><span className="stock-hint">Productos incluidos</span><div className="stock-number-row"><strong className="stock-big-num">{pack.products?.length || 0}</strong><span className="stock-unit-label">productos</span></div></div><div className="inv-prices"><div className="inv-price-row"><span>Precio total del pack</span><strong className="inv-sale-price">{money(pack.total)}</strong></div></div><small className="pos-pack-select-hint">Toca la tarjeta para cobrar</small></button><div className="inv-actions"><span className="stock-hint">Editar o eliminar</span><div className="inv-action-buttons"><button type="button" className="pos-product-tool-btn" onClick={() => { setPendingEditPack(pack); setDeletePassword(''); setPackActionError('') }} aria-label={`Editar ${pack.name}`} title="Editar pack"><Pencil size={15}/></button><button type="button" className="pos-product-tool-btn danger" onClick={() => { setPendingDeletePack(pack); setDeletePassword(''); setPackActionError('') }} aria-label={`Eliminar ${pack.name}`} title="Eliminar pack"><Trash2 size={15}/></button></div></div></article>)}</div>{!packs.length && <p className="pos-empty-note">Crea un pack para que aparezca aquí.</p>}</section>
    {creatorOpen && <div className="modal-backdrop" onClick={() => !saving && setCreatorOpen(false)} role="presentation"><div className="booking-modal-card pack-modal" role="dialog" aria-modal="true" aria-labelledby="pack-title" onClick={(e) => e.stopPropagation()}><div className="modal-header"><div><span className="modal-kicker">{editingPackId ? 'EDITAR PACK' : 'NUEVO PACK'}</span><h2 id="pack-title" className="modal-title">{editingPackId ? 'Editar pack' : 'Crear pack'}</h2></div><button className="modal-close-btn" onClick={() => setCreatorOpen(false)} aria-label="Cerrar"><X size={20}/></button></div><div className="pack-modal-body"><label className="field-label" htmlFor="pack-name">Nombre del pack</label><input id="pack-name" className="modal-input" value={packName} onChange={(e) => setPackName(e.target.value)} maxLength={80} placeholder="Ej. Pack de celebración"/><div className="cart-total"><span>Productos seleccionados</span><strong>{money(total)}</strong></div><div className="pos-products-grid pack-product-grid">{products.map((product) => { const chosen = selected.some((item) => item.id === product.id); return <button key={product.id} type="button" className={`pos-product-card ${chosen ? 'pack-product-selected' : ''} ${Number(product.quantity) <= 0 && !chosen ? 'sold-out' : ''}`} onClick={() => toggleProduct(product)} disabled={Number(product.quantity) <= 0 && !chosen}><strong>{product.name}</strong><span>{money(product.salePrice ?? product.price)}</span><small>{chosen ? 'Agregado · toca para quitar' : `${Number(product.quantity)} unidades · toca para agregar`}</small></button> })}</div>{!products.length && <p className="pos-empty-note">Agrega productos en Inventario para armar packs.</p>}{error && <p className="login-error" role="alert">{error}</p>}<button className="submit-booking-btn pos-charge-btn" disabled={saving} onClick={savePack}><Plus size={17}/><span>{saving ? 'Guardando…' : editingPackId ? 'Guardar cambios' : 'Guardar pack'}</span></button></div></div></div>}
    {(pendingDeletePack || pendingEditPack) && <div className="modal-backdrop" role="presentation" onClick={() => { if (!packActionBusy) { setPendingDeletePack(null); setPendingEditPack(null) } }}><form className="booking-modal-card delete-modal-card" role="dialog" aria-modal="true" onSubmit={(e) => { e.preventDefault(); pendingDeletePack ? deletePack() : authorizePackEdit() }} onClick={(e) => e.stopPropagation()}><div className="modal-header"><div><span className="modal-kicker">CONFIRMAR ACCIÓN</span><h2 className="modal-title">{pendingDeletePack ? 'Eliminar pack' : 'Editar pack'}</h2></div><button type="button" className="modal-close-btn" onClick={() => { setPendingDeletePack(null); setPendingEditPack(null) }} aria-label="Cerrar"><X size={20}/></button></div><div className="modal-body"><p>{pendingDeletePack ? <>¿Eliminar el pack <strong>{pendingDeletePack.name}</strong>?</> : <>Ingresa la contraseña para editar <strong>{pendingEditPack?.name}</strong>.</>}</p><label className="field-label" htmlFor="pack-delete-password">Contraseña</label><input id="pack-delete-password" className="modal-input" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} autoComplete="off" required/>{packActionError && <p className="login-error" role="alert">{packActionError}</p>}</div><div className="modal-footer"><button className="submit-booking-btn delete-confirm-btn" disabled={packActionBusy}>{pendingDeletePack ? <Trash2 size={16}/> : <Pencil size={16}/>}<span>{packActionBusy ? 'Procesando…' : pendingDeletePack ? 'Confirmar eliminación' : 'Continuar edición'}</span></button></div></form></div>}
    {paymentPack && <PaymentModal total={paymentPack.total} onClose={() => setPaymentPack(null)} onPay={completeSale} busy={saving}/>}{error && !creatorOpen && <p className="login-error" role="alert">{error}</p>}
  </section>
}
