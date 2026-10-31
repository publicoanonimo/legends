import { useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore'
import { Banknote, ChartBar, Repeat, ReceiptText, Pencil, Trash2, Check, X } from 'lucide-react'
import { db } from '../firebase'

const DELETE_PASSWORD = 'admin001'

function formatPrice(value) {
  const price = Number(value)
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number.isFinite(price) ? price : 0)
}

export default function ResumenModule() {
  const [totalPurchase, setTotalPurchase] = useState(0)
  const [totalSale, setTotalSale] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sales, setSales] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editBuyer, setEditBuyer] = useState('')
  const [editTotal, setEditTotal] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [actionError, setActionError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, 'posProducts'), orderBy('createdAt', 'desc')), (snapshot) => {
      let purchase = 0; let sale = 0; let count = 0
      snapshot.forEach((item) => { const data = item.data(); if (data.recordType === 'pack') return; count += 1; const units = Math.max(0, Number(data.quantity) || 0); purchase += (Number(data.purchasePrice) || 0) * units; sale += (Number(data.salePrice ?? data.price) || 0) * units })
      setTotalPurchase(purchase); setTotalSale(sale); setProductCount(count); setLoading(false); setError('')
    }, () => { setLoading(false); setError('No se pudieron cargar los productos. Revisa las reglas de Firestore.') })
    return unsubscribe
  }, [])

  useEffect(() => onSnapshot(query(collection(db, 'posSales'), orderBy('createdAt', 'desc')), (snapshot) => setSales(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), (snapshotError) => console.error('No se pudieron cargar las ventas:', snapshotError)), [])
  const progressTotal = sales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0)
  const startEdit = (sale) => { setEditingId(sale.id); setEditBuyer(sale.buyer || ''); setEditTotal(String(sale.total || 0)) }
  const saveEdit = async (sale) => {
    const total = Number(editTotal)
    if (!editBuyer.trim() || !Number.isFinite(total) || total < 0) return setActionError('Revisa el nombre y el monto de la venta.')
    try { await updateDoc(doc(db, 'posSales', sale.id), { buyer: editBuyer.trim(), total }); setEditingId(null); setActionError('') }
    catch (error) { setActionError(`No se pudo editar: ${error.message}`) }
  }
  const removeSale = async () => {
    if (deletePassword !== DELETE_PASSWORD) return setActionError('Contraseña incorrecta.')
    const sale = pendingDelete
    if (!sale) return
    setDeleting(true); setActionError('')
    try {
      // Firestore's web transaction API only reads document references, not collections.
      // Resolve legacy product names before the transaction, then verify each product doc in it.
      const [catalog, packSnapshot] = await Promise.all([
        getDocs(collection(db, 'posProducts')),
        sale.packId ? getDoc(doc(db, 'posProducts', sale.packId)) : Promise.resolve(null),
      ])
      const byName = new Map()
      catalog.docs.filter((product) => product.data().recordType !== 'pack').forEach((product) => {
        const name = product.data().name
        byName.set(name, [...(byName.get(name) || []), product.id])
      })
      await runTransaction(db, async (transaction) => {
        const saleRef = doc(db, 'posSales', sale.id)
        const currentSale = await transaction.get(saleRef)
        if (!currentSale.exists()) throw new Error('La venta ya no existe.')
        let products = currentSale.data().products || []
        if (products.some((item) => !item.id) && currentSale.data().packId) {
          if (packSnapshot.exists()) products = packSnapshot.data().products || products
        }
        let inventoryItems = products.filter((item) => item.id && Number(item.quantity) > 0)
        if (products.some((item) => !item.id && Number(item.quantity) > 0)) {
          const legacyItems = products.filter((item) => !item.id && Number(item.quantity) > 0).map((item) => {
            const matches = byName.get(item.name) || []
            if (matches.length !== 1) throw new Error(`No se pudo identificar unívocamente el producto "${item.name}"; no se borró la venta ni se cambió el inventario.`)
            return { ...item, id: matches[0] }
          })
          inventoryItems = [...inventoryItems, ...legacyItems]
        }
        const inventoryRefs = inventoryItems.map((item) => doc(db, 'posProducts', item.id))
        const inventorySnapshots = await Promise.all(inventoryRefs.map((ref) => transaction.get(ref)))
        inventorySnapshots.forEach((snapshot, index) => {
          if (!snapshot.exists()) throw new Error(`El producto "${inventoryItems[index].name}" ya no está en inventario; no se borró la venta.`)
          transaction.update(snapshot.ref, { quantity: (Number(snapshot.data().quantity) || 0) + Number(inventoryItems[index].quantity), updatedAt: serverTimestamp() })
        })
        transaction.delete(saleRef)
      })
      setPendingDelete(null); setDeletePassword(''); setActionError('')
    } catch (error) { setActionError(`No se pudo eliminar: ${error.message}`) }
    finally { setDeleting(false) }
  }

  return <section className="dashboard-module"><div className="dashboard-page-heading"><div><span className="dashboard-eyebrow">RESUMEN DE INVENTARIO</span><h1>Dashboard</h1><p>Totales de inventario y registros de caja actualizados automáticamente.</p></div><span className="dashboard-total"><ChartBar size={18}/> {productCount} {productCount === 1 ? 'producto' : 'productos'}</span></div>
    {loading ? <p className="registration-loading">Cargando totales...</p> : error ? <p className="registration-error">{error}</p> : <><div className="dashboard-tiles"><article className="dashboard-tile purchase-tile"><div className="dashboard-tile-icon"><Banknote size={34}/></div><div className="dashboard-tile-content"><strong>Total compra productos</strong><p className="dashboard-tile-total">{formatPrice(totalPurchase)}</p></div></article><article className="dashboard-tile sale-tile"><div className="dashboard-tile-icon"><Repeat size={34}/></div><div className="dashboard-tile-content"><strong>Total venta producto</strong><p className="dashboard-tile-total">{formatPrice(totalSale)}</p></div></article><article className="dashboard-tile progress-tile"><div className="dashboard-tile-icon"><ReceiptText size={34}/></div><div className="dashboard-tile-content"><strong>Ventas en progreso</strong><p className="dashboard-tile-total">{formatPrice(progressTotal)}</p></div></article></div>
      <section className="sales-history-card light-card"><div className="sales-history-heading"><div><span className="dashboard-eyebrow">REGISTRO DE CAJA</span><h2><ReceiptText size={19}/> Ventas recientes</h2></div><span>{sales.length} {sales.length === 1 ? 'venta' : 'ventas'}</span></div>{actionError && !pendingDelete && <p className="login-error" role="alert">{actionError}</p>}{sales.length === 0 ? <p className="pos-empty-note">Sin ventas registradas.</p> : <ul className="sales-history-list">{sales.map((sale) => <li key={sale.id}><div className="sales-row-main">{editingId === sale.id ? <><input className="modal-input sales-edit-input" aria-label="Nombre de la venta" value={editBuyer} onChange={(e) => setEditBuyer(e.target.value)}/><input className="modal-input sales-edit-input" type="number" min="0" step="0.01" aria-label="Monto de la venta" value={editTotal} onChange={(e) => setEditTotal(e.target.value)}/></> : <><strong>{sale.buyer}</strong><span>{(sale.products || []).map((item) => `${item.quantity}x ${item.name} (${formatPrice(item.price)})`).join(' · ')}</span><small>{sale.paymentMethod}</small></>}</div><div className="sales-row-actions">{editingId === sale.id ? <><b>{formatPrice(editTotal)}</b><button type="button" className="sales-action-btn" aria-label="Guardar cambios" onClick={() => saveEdit(sale)}><Check size={16}/></button><button type="button" className="sales-action-btn" aria-label="Cancelar edición" onClick={() => setEditingId(null)}><X size={16}/></button></> : <><b>{formatPrice(sale.total)}</b><button type="button" className="sales-action-btn" aria-label={`Editar ${sale.buyer}`} onClick={() => startEdit(sale)}><Pencil size={15}/></button><button type="button" className="sales-action-btn delete" aria-label={`Eliminar ${sale.buyer}`} onClick={() => { setPendingDelete(sale); setDeletePassword(''); setActionError('') }}><Trash2 size={15}/></button></>}</div></li>)}</ul>}</section>
      {pendingDelete && <div className="modal-backdrop" role="presentation" onClick={() => !deleting && setPendingDelete(null)}><form className="booking-modal-card delete-modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-sale-title" onSubmit={(event) => { event.preventDefault(); removeSale() }} onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><span className="modal-kicker">CONFIRMAR ELIMINACIÓN</span><h2 id="delete-sale-title" className="modal-title">Borrar venta</h2></div><button type="button" className="modal-close-btn" onClick={() => setPendingDelete(null)} aria-label="Cerrar"><X size={20}/></button></div><div className="modal-body"><p>Se eliminará <strong>{pendingDelete.buyer}</strong> y se devolverán sus productos al inventario.</p><label className="field-label" htmlFor="delete-sale-password">Contraseña</label><input id="delete-sale-password" className="modal-input" type="password" autoComplete="off" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} required />{actionError && <p className="login-error" role="alert">{actionError}</p>}</div><div className="modal-footer"><button className="submit-booking-btn delete-confirm-btn" type="submit" disabled={deleting}><Trash2 size={16}/><span>{deleting ? 'Eliminando...' : 'Confirmar eliminación'}</span></button></div></form></div>}
    </>}
  </section>
}
