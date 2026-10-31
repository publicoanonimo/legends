import { useEffect, useState } from 'react'
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query,
  runTransaction, serverTimestamp, updateDoc,
} from 'firebase/firestore'
import { Banknote, ChartBar, CircleDollarSign, QrCode, ReceiptText, Pencil, Trash2, Check, X, Plus, Download } from 'lucide-react'
import { db } from '../firebase'
import { downloadSalesReportPdf } from '../utils/salesReportPdf'

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
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [purchaseLabel, setPurchaseLabel] = useState('')
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [purchaseError, setPurchaseError] = useState('')
  const [savingPurchase, setSavingPurchase] = useState(false)
  const [inventoryProducts, setInventoryProducts] = useState([])
  const [purchaseEntries, setPurchaseEntries] = useState([])
  const [pendingPurchaseAction, setPendingPurchaseAction] = useState(null)
  const [purchaseActionPassword, setPurchaseActionPassword] = useState('')
  const [purchaseActionLabel, setPurchaseActionLabel] = useState('')
  const [purchaseActionAmount, setPurchaseActionAmount] = useState('')
  const [purchaseActionError, setPurchaseActionError] = useState('')
  const [purchaseActionBusy, setPurchaseActionBusy] = useState(false)

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, 'posProducts'), orderBy('createdAt', 'desc')), (snapshot) => {
      let purchase = 0; let count = 0
      const regularProducts = []
      const extraPurchases = []
      snapshot.forEach((item) => {
        const data = item.data()
        if (data.recordType === 'pack') return
        if (data.recordType === 'purchase') { purchase += Number(data.amount) || 0; extraPurchases.push({ id: item.id, ...data }); return }
        count += 1
        regularProducts.push({ id: item.id, ...data })
      })
      setInventoryProducts(regularProducts); setPurchaseEntries(extraPurchases)
      setTotalPurchase(purchase); setProductCount(count); setLoading(false); setError('')
    }, () => { setLoading(false); setError('No se pudieron cargar los productos. Revisa las reglas de Firestore.') })
    return unsubscribe
  }, [])

  useEffect(() => onSnapshot(query(collection(db, 'posSales'), orderBy('createdAt', 'desc')), (snapshot) => {
    const records = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
    setSales(records)
    setTotalSale(records.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0))
  }, (snapshotError) => console.error('No se pudieron cargar las ventas:', snapshotError)), [])

  const qrTotal = sales.filter((sale) => sale.paymentMethod === 'QR').reduce((sum, sale) => sum + (Number(sale.total) || 0), 0)
  const cashTotal = sales.filter((sale) => sale.paymentMethod === 'Efectivo').reduce((sum, sale) => sum + (Number(sale.total) || 0), 0)
  const allCashSales = qrTotal + cashTotal

  const startEdit = (sale) => { setEditingId(sale.id); setEditBuyer(sale.buyer || ''); setEditTotal(String(sale.total || 0)); setActionError('') }
  const saveEdit = async (sale) => {
    const total = Number(editTotal)
    if (!editBuyer.trim() || !Number.isFinite(total) || total < 0) return setActionError('Revisa el nombre y el monto de la venta.')
    try { await updateDoc(doc(db, 'posSales', sale.id), { buyer: editBuyer.trim(), total }); setEditingId(null); setActionError('') }
    catch (saveError) { setActionError(`No se pudo editar: ${saveError.message}`) }
  }

  const removeSale = async () => {
    if (deletePassword !== DELETE_PASSWORD) return setActionError('Contraseña incorrecta.')
    const sale = pendingDelete
    if (!sale) return
    setDeleting(true); setActionError('')
    try {
      const [catalog, packSnapshot] = await Promise.all([
        getDocs(collection(db, 'posProducts')),
        sale.packId ? getDoc(doc(db, 'posProducts', sale.packId)) : Promise.resolve(null),
      ])
      const byName = new Map()
      catalog.docs.filter((product) => !product.data().recordType).forEach((product) => {
        const name = product.data().name
        byName.set(name, [...(byName.get(name) || []), product.id])
      })
      await runTransaction(db, async (transaction) => {
        const saleRef = doc(db, 'posSales', sale.id)
        const currentSale = await transaction.get(saleRef)
        if (!currentSale.exists()) throw new Error('La venta ya no existe.')
        let products = currentSale.data().products || []
        if (products.some((item) => !item.id) && currentSale.data().packId && packSnapshot?.exists()) products = packSnapshot.data().products || products
        let inventoryItems = products.filter((item) => item.id && Number(item.quantity) > 0)
        if (products.some((item) => !item.id && Number(item.quantity) > 0)) {
          const legacyItems = products.filter((item) => !item.id && Number(item.quantity) > 0).map((item) => {
            const matches = byName.get(item.name) || []
            if (matches.length !== 1) throw new Error(`No se pudo identificar el producto "${item.name}"; no se borró la venta ni se cambió el inventario.`)
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
    } catch (deleteError) {
      const message = deleteError.code === 'permission-denied'
        ? 'Firebase rechazó la operación. Revisa permisos de lectura/actualización en posProducts y lectura/eliminación en posSales.'
        : deleteError.message
      setActionError(`No se pudo eliminar: ${message}`)
    } finally { setDeleting(false) }
  }

  const savePurchase = async (event) => {
    event.preventDefault()
    const amount = Number(purchaseAmount)
    if (!Number.isFinite(amount) || amount <= 0) return setPurchaseError('Ingresa un monto mayor a cero.')
    setSavingPurchase(true); setPurchaseError('')
    try {
      await addDoc(collection(db, 'posProducts'), { recordType: 'purchase', label: purchaseLabel.trim() || 'Compra adicional', amount, createdAt: serverTimestamp() })
      setPurchaseModalOpen(false); setPurchaseAmount(''); setPurchaseLabel('')
    } catch (saveError) { setPurchaseError(`No se pudo guardar la compra: ${saveError.message}`) }
    finally { setSavingPurchase(false) }
  }

  const openPurchaseAction = (entry, type) => {
    setPendingPurchaseAction({ entry, type })
    setPurchaseActionPassword('')
    setPurchaseActionLabel(entry.label || '')
    setPurchaseActionAmount(String(entry.amount || ''))
    setPurchaseActionError('')
  }

  const confirmPurchaseAction = async (event) => {
    event.preventDefault()
    if (purchaseActionPassword !== DELETE_PASSWORD) return setPurchaseActionError('Contraseña incorrecta.')
    if (!pendingPurchaseAction) return
    const { entry, type } = pendingPurchaseAction
    const amount = Number(purchaseActionAmount)
    if (type === 'edit' && (!purchaseActionLabel.trim() || !Number.isFinite(amount) || amount <= 0)) return setPurchaseActionError('Ingresa un detalle y un monto mayor a cero.')
    setPurchaseActionBusy(true); setPurchaseActionError('')
    try {
      if (type === 'edit') await updateDoc(doc(db, 'posProducts', entry.id), { label: purchaseActionLabel.trim(), amount, updatedAt: serverTimestamp() })
      else await deleteDoc(doc(db, 'posProducts', entry.id))
      setPendingPurchaseAction(null); setPurchaseActionPassword(''); setPurchaseActionError('')
    } catch (actionError) { setPurchaseActionError(`No se pudo ${type === 'edit' ? 'editar' : 'borrar'} la compra: ${actionError.message}`) }
    finally { setPurchaseActionBusy(false) }
  }

  const downloadReport = () => {
    const reportMoney = (value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)
    const dateLabel = (value) => value?.toDate ? new Intl.DateTimeFormat('es-BO', { dateStyle: 'short', timeStyle: 'short' }).format(value.toDate()) : 'Fecha no disponible'
    const report = {
      title: 'REPORTE GENERAL DE CAJA',
      generated: new Intl.DateTimeFormat('es-BO', { dateStyle: 'full', timeStyle: 'short' }).format(new Date()),
      summary: [
        { label: 'Ventas por QR', value: reportMoney(qrTotal), color: [0.70, 0.48, 0.04] },
        { label: 'Ventas por efectivo', value: reportMoney(cashTotal), color: [0.70, 0.48, 0.04] },
        { label: 'Total de caja', value: reportMoney(allCashSales), color: [0.70, 0.48, 0.04] },
        { label: 'Inversion total', value: reportMoney(totalPurchase), color: [0.72, 0.13, 0.18] },
      ],
      sections: [
        { title: 'RESUMEN DE PRODUCTOS', rows: [`Productos registrados: ${productCount}`, `Ventas acumuladas de productos: ${reportMoney(totalSale)}`] },
        { title: 'DETALLE DE PRODUCTOS', rows: inventoryProducts.map((product) => `${product.name} | Stock: ${Number(product.quantity) || 0} | Compra/u: ${reportMoney(product.purchasePrice)} | Venta/u: ${reportMoney(product.salePrice ?? product.price)} | Inversion en stock: ${reportMoney((Number(product.purchasePrice) || 0) * (Number(product.quantity) || 0))}`) },
        { title: 'COMPRAS ADICIONALES', rows: purchaseEntries.map((entry) => `${dateLabel(entry.createdAt)} | ${entry.label || 'Compra adicional'} | Monto: ${reportMoney(entry.amount)}`) },
        { title: 'REGISTRO DE VENTAS', rows: sales.flatMap((sale) => [
          `${dateLabel(sale.createdAt)} | ${sale.buyer || 'Venta'} | Pago: ${sale.paymentMethod || 'No indicado'} | Total: ${reportMoney(sale.total)}`,
          `Productos: ${(sale.products || []).map((item) => `${item.quantity}x ${item.name} (${reportMoney(item.price)} c/u)`).join(', ') || 'Detalle no disponible'}`,
        ]) },
      ],
    }
    downloadSalesReportPdf(report)
  }

  return <section className="dashboard-module">
    <div className="dashboard-page-heading"><div><span className="dashboard-eyebrow">RESUMEN DE INVENTARIO</span><h1>Dashboard</h1><p>Ventas de caja e inventario actualizados automáticamente.</p></div><div className="dashboard-heading-actions"><span className="dashboard-total"><ChartBar size={18}/> {productCount} {productCount === 1 ? 'producto' : 'productos'}</span><button type="button" className="report-download-btn" disabled={loading || Boolean(error)} onClick={downloadReport}><Download size={16}/> Descargar PDF</button></div></div>
    {loading ? <p className="registration-loading">Cargando totales...</p> : error ? <p className="registration-error">{error}</p> : <>
      <section className="dashboard-summary-section cash-summary-section"><div className="summary-section-heading"><h2>Ventas de caja</h2></div><div className="dashboard-tiles cash-summary-tiles">
        <article className="dashboard-tile cash-total-tile"><div className="dashboard-tile-icon"><QrCode size={32}/></div><div className="dashboard-tile-content"><strong>Ventas por QR</strong><p className="dashboard-tile-total">{formatPrice(qrTotal)}</p></div></article>
        <article className="dashboard-tile cash-total-tile"><div className="dashboard-tile-icon"><Banknote size={32}/></div><div className="dashboard-tile-content"><strong>Ventas por efectivo</strong><p className="dashboard-tile-total">{formatPrice(cashTotal)}</p></div></article>
        <article className="dashboard-tile cash-total-tile"><div className="dashboard-tile-icon"><CircleDollarSign size={32}/></div><div className="dashboard-tile-content"><strong>Total de caja</strong><p className="dashboard-tile-total">{formatPrice(allCashSales)}</p></div></article>
      </div></section>

      <section className="sales-history-card light-card"><div className="sales-history-heading"><div><span className="dashboard-eyebrow">REGISTRO DE CAJA</span><h2><ReceiptText size={19}/> Ventas recientes</h2></div><span>{sales.length} {sales.length === 1 ? 'venta' : 'ventas'}</span></div>{actionError && !pendingDelete && <p className="login-error" role="alert">{actionError}</p>}{sales.length === 0 ? <p className="pos-empty-note">Sin ventas registradas.</p> : <ul className="sales-history-list">{sales.map((sale) => <li key={sale.id}><div className="sales-row-main">{editingId === sale.id ? <><input className="modal-input sales-edit-input" aria-label="Nombre de la venta" value={editBuyer} onChange={(e) => setEditBuyer(e.target.value)}/><input className="modal-input sales-edit-input" type="number" min="0" step="0.01" aria-label="Monto de la venta" value={editTotal} onChange={(e) => setEditTotal(e.target.value)}/></> : <><strong>{sale.buyer}</strong><span>{(sale.products || []).map((item) => `${item.quantity}x ${item.name} (${formatPrice(item.price)})`).join(' · ')}</span><small>{sale.paymentMethod}</small></>}</div><div className="sales-row-actions">{editingId === sale.id ? <><b>{formatPrice(editTotal)}</b><button type="button" className="sales-action-btn" aria-label="Guardar cambios" onClick={() => saveEdit(sale)}><Check size={16}/></button><button type="button" className="sales-action-btn" aria-label="Cancelar edición" onClick={() => setEditingId(null)}><X size={16}/></button></> : <><b>{formatPrice(sale.total)}</b><button type="button" className="sales-action-btn" aria-label={`Editar ${sale.buyer}`} onClick={() => startEdit(sale)}><Pencil size={15}/></button><button type="button" className="sales-action-btn delete" aria-label={`Eliminar ${sale.buyer}`} onClick={() => { setPendingDelete(sale); setDeletePassword(''); setActionError('') }}><Trash2 size={15}/></button></>}</div></li>)}</ul>}</section>

      <section className="dashboard-summary-section inventory-summary-section"><div className="summary-section-heading purchase-section-heading"><h2>Resumen de productos</h2><button type="button" className="add-purchase-btn" onClick={() => { setPurchaseModalOpen(true); setPurchaseError('') }}><Plus size={16}/> Añadir compra</button></div><div className="dashboard-tiles inventory-summary-tiles">
        <article className="dashboard-tile purchase-tile"><div className="dashboard-tile-icon"><Banknote size={34}/></div><div className="dashboard-tile-content"><strong>Total compra producto</strong><p className="dashboard-tile-total">{formatPrice(totalPurchase)}</p></div></article>
        <article className="dashboard-tile sale-tile"><div className="dashboard-tile-icon"><ReceiptText size={34}/></div><div className="dashboard-tile-content"><strong>Total venta producto</strong><p className="dashboard-tile-total">{formatPrice(totalSale)}</p></div></article>
      </div><section className="purchase-register-list"><div className="sales-history-heading"><div><h3>Compras adicionales</h3></div><span>{purchaseEntries.length} {purchaseEntries.length === 1 ? 'compra' : 'compras'}</span></div>{purchaseEntries.length ? <ul>{purchaseEntries.map((entry) => <li key={entry.id}><div><strong>{entry.label || 'Compra adicional'}</strong><small>{entry.createdAt?.toDate ? new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short' }).format(entry.createdAt.toDate()) : 'Registro reciente'}</small></div><div className="purchase-register-row-actions"><b>{formatPrice(entry.amount)}</b><button type="button" className="sales-action-btn" aria-label={`Editar ${entry.label || 'compra'}`} onClick={() => openPurchaseAction(entry, 'edit')}><Pencil size={15}/></button><button type="button" className="sales-action-btn delete" aria-label={`Borrar ${entry.label || 'compra'}`} onClick={() => openPurchaseAction(entry, 'delete')}><Trash2 size={15}/></button></div></li>)}</ul> : <p className="pos-empty-note">Las compras adicionales que registres aparecerán aquí.</p>}</section></section>
    </>}

    {pendingDelete && <div className="modal-backdrop" role="presentation" onClick={() => !deleting && setPendingDelete(null)}><form className="booking-modal-card delete-modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-sale-title" onSubmit={(event) => { event.preventDefault(); removeSale() }} onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><span className="modal-kicker">CONFIRMAR ELIMINACIÓN</span><h2 id="delete-sale-title" className="modal-title">Borrar venta</h2></div><button type="button" className="modal-close-btn" onClick={() => setPendingDelete(null)} aria-label="Cerrar"><X size={20}/></button></div><div className="modal-body"><p>Se eliminará <strong>{pendingDelete.buyer}</strong> y se devolverán sus productos al inventario.</p><label className="field-label" htmlFor="delete-sale-password">Contraseña</label><input id="delete-sale-password" className="modal-input" type="password" autoComplete="off" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} required />{actionError && <p className="login-error" role="alert">{actionError}</p>}</div><div className="modal-footer"><button className="submit-booking-btn delete-confirm-btn" type="submit" disabled={deleting}><Trash2 size={16}/><span>{deleting ? 'Eliminando...' : 'Confirmar eliminación'}</span></button></div></form></div>}

    {purchaseModalOpen && <div className="modal-backdrop" role="presentation" onClick={() => !savingPurchase && setPurchaseModalOpen(false)}><form className="booking-modal-card delete-modal-card" role="dialog" aria-modal="true" aria-labelledby="purchase-title" onSubmit={savePurchase} onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><span className="modal-kicker">REGISTRAR COMPRA</span><h2 id="purchase-title" className="modal-title">Añadir monto a compras</h2></div><button type="button" className="modal-close-btn" onClick={() => setPurchaseModalOpen(false)} aria-label="Cerrar"><X size={20}/></button></div><div className="modal-body"><label className="field-label" htmlFor="purchase-label">Detalle (opcional)</label><input id="purchase-label" className="modal-input" value={purchaseLabel} onChange={(event) => setPurchaseLabel(event.target.value)} placeholder="Ej. Reposición de productos"/><label className="field-label purchase-amount-label" htmlFor="purchase-amount">Monto de compra (Bs)</label><input id="purchase-amount" className="modal-input" type="number" min="0.01" step="0.01" value={purchaseAmount} onChange={(event) => setPurchaseAmount(event.target.value)} required/>{purchaseError && <p className="login-error" role="alert">{purchaseError}</p>}</div><div className="modal-footer"><button className="submit-booking-btn" disabled={savingPurchase}><Plus size={16}/><span>{savingPurchase ? 'Guardando...' : 'Guardar compra'}</span></button></div></form></div>}

    {pendingPurchaseAction && <div className="modal-backdrop" role="presentation" onClick={() => !purchaseActionBusy && setPendingPurchaseAction(null)}><form className="booking-modal-card delete-modal-card" role="dialog" aria-modal="true" aria-labelledby="purchase-action-title" onSubmit={confirmPurchaseAction} onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><span className="modal-kicker">ACCESO DE ADMINISTRADOR</span><h2 id="purchase-action-title" className="modal-title">{pendingPurchaseAction.type === 'edit' ? 'Editar compra' : 'Borrar compra'}</h2></div><button type="button" className="modal-close-btn" onClick={() => setPendingPurchaseAction(null)} aria-label="Cerrar"><X size={20}/></button></div><div className="modal-body">{pendingPurchaseAction.type === 'edit' && <><label className="field-label" htmlFor="purchase-edit-label">Detalle</label><input id="purchase-edit-label" className="modal-input" value={purchaseActionLabel} onChange={(event) => setPurchaseActionLabel(event.target.value)} required/><label className="field-label purchase-amount-label" htmlFor="purchase-edit-amount">Monto (Bs)</label><input id="purchase-edit-amount" className="modal-input" type="number" min="0.01" step="0.01" value={purchaseActionAmount} onChange={(event) => setPurchaseActionAmount(event.target.value)} required/></>}{pendingPurchaseAction.type === 'delete' && <p>Se borrará <strong>{pendingPurchaseAction.entry.label || 'esta compra'}</strong> y su monto se descontará del total.</p>}<label className="field-label purchase-amount-label" htmlFor="purchase-action-password">Contraseña</label><input id="purchase-action-password" className="modal-input" type="password" autoComplete="off" value={purchaseActionPassword} onChange={(event) => setPurchaseActionPassword(event.target.value)} required/>{purchaseActionError && <p className="login-error" role="alert">{purchaseActionError}</p>}</div><div className="modal-footer"><button className="submit-booking-btn delete-confirm-btn" disabled={purchaseActionBusy}>{pendingPurchaseAction.type === 'edit' ? <Pencil size={16}/> : <Trash2 size={16}/>}<span>{purchaseActionBusy ? 'Guardando...' : pendingPurchaseAction.type === 'edit' ? 'Guardar cambios' : 'Confirmar borrado'}</span></button></div></form></div>}
  </section>
}
