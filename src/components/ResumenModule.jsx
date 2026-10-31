import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { Banknote, ChartBar, Repeat, ReceiptText, Pencil, Trash2, Check, X } from 'lucide-react'
import { db } from '../firebase'

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

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, 'posProducts'), orderBy('createdAt', 'desc')), (snapshot) => {
      let purchase = 0; let sale = 0
      snapshot.forEach((item) => { const data = item.data(); const units = Math.max(0, Number(data.quantity) || 0); purchase += (Number(data.purchasePrice) || 0) * units; sale += (Number(data.salePrice ?? data.price) || 0) * units })
      setTotalPurchase(purchase); setTotalSale(sale); setProductCount(snapshot.size); setLoading(false); setError('')
    }, () => { setLoading(false); setError('No se pudieron cargar los productos. Revisa las reglas de Firestore.') })
    return unsubscribe
  }, [])

  useEffect(() => onSnapshot(query(collection(db, 'posSales'), orderBy('createdAt', 'desc')), (snapshot) => setSales(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), (snapshotError) => console.error('No se pudieron cargar las ventas:', snapshotError)), [])
  const progressTotal = sales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0)
  const startEdit = (sale) => { setEditingId(sale.id); setEditBuyer(sale.buyer || ''); setEditTotal(String(sale.total || 0)) }
  const saveEdit = async (sale) => { const total = Number(editTotal); if (!editBuyer.trim() || !Number.isFinite(total) || total < 0) return; await updateDoc(doc(db, 'posSales', sale.id), { buyer: editBuyer.trim(), total }); setEditingId(null) }
  const removeSale = async (sale) => { if (window.confirm(`¿Eliminar el registro de ${sale.buyer || 'esta venta'}?`)) await deleteDoc(doc(db, 'posSales', sale.id)) }

  return <section className="dashboard-module"><div className="dashboard-page-heading"><div><span className="dashboard-eyebrow">RESUMEN DE INVENTARIO</span><h1>Dashboard</h1><p>Totales de inventario y registros de caja actualizados automáticamente.</p></div><span className="dashboard-total"><ChartBar size={18}/> {productCount} {productCount === 1 ? 'producto' : 'productos'}</span></div>
    {loading ? <p className="registration-loading">Cargando totales...</p> : error ? <p className="registration-error">{error}</p> : <><div className="dashboard-tiles"><article className="dashboard-tile purchase-tile"><div className="dashboard-tile-icon"><Banknote size={34}/></div><div className="dashboard-tile-content"><strong>Total compra productos</strong><p className="dashboard-tile-total">{formatPrice(totalPurchase)}</p></div></article><article className="dashboard-tile sale-tile"><div className="dashboard-tile-icon"><Repeat size={34}/></div><div className="dashboard-tile-content"><strong>Total venta producto</strong><p className="dashboard-tile-total">{formatPrice(totalSale)}</p></div></article><article className="dashboard-tile progress-tile"><div className="dashboard-tile-icon"><ReceiptText size={34}/></div><div className="dashboard-tile-content"><strong>Ventas en progreso</strong><p className="dashboard-tile-total">{formatPrice(progressTotal)}</p></div></article></div>
      <section className="sales-history-card light-card"><div className="sales-history-heading"><div><span className="dashboard-eyebrow">REGISTRO DE CAJA</span><h2><ReceiptText size={19}/> Ventas recientes</h2></div><span>{sales.length} {sales.length === 1 ? 'venta' : 'ventas'}</span></div>{sales.length === 0 ? <p className="pos-empty-note">Sin ventas registradas.</p> : <ul className="sales-history-list">{sales.map((sale) => <li key={sale.id}><div className="sales-row-main">{editingId === sale.id ? <><input className="modal-input sales-edit-input" aria-label="Nombre de la venta" value={editBuyer} onChange={(e) => setEditBuyer(e.target.value)}/><input className="modal-input sales-edit-input" type="number" min="0" step="0.01" aria-label="Monto de la venta" value={editTotal} onChange={(e) => setEditTotal(e.target.value)}/></> : <><strong>{sale.buyer}</strong><span>{(sale.products || []).map((item) => `${item.quantity}x ${item.name} (${formatPrice(item.price)})`).join(' · ')}</span><small>{sale.paymentMethod}</small></>}</div><div className="sales-row-actions">{editingId === sale.id ? <><b>{formatPrice(editTotal)}</b><button type="button" className="sales-action-btn" aria-label="Guardar cambios" onClick={() => saveEdit(sale)}><Check size={16}/></button><button type="button" className="sales-action-btn" aria-label="Cancelar edición" onClick={() => setEditingId(null)}><X size={16}/></button></> : <><b>{formatPrice(sale.total)}</b><button type="button" className="sales-action-btn" aria-label={`Editar ${sale.buyer}`} onClick={() => startEdit(sale)}><Pencil size={15}/></button><button type="button" className="sales-action-btn delete" aria-label={`Eliminar ${sale.buyer}`} onClick={() => removeSale(sale)}><Trash2 size={15}/></button></>}</div></li>)}</ul>}</section>
    </>}
  </section>
}
