import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { Banknote, ChartBar, Repeat, ReceiptText } from 'lucide-react'
import { db } from '../firebase'

function formatPrice(value) {
  const price = Number(value)
  if (!Number.isFinite(price)) return 'Bs 0,00'

  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export default function ResumenModule() {
  const [totalPurchase, setTotalPurchase] = useState(0)
  const [totalSale, setTotalSale] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sales, setSales] = useState([])

  useEffect(() => {
    const productsQuery = query(
      collection(db, 'posProducts'),
      orderBy('createdAt', 'desc'),
    )

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        let purchaseTotal = 0
        let saleTotal = 0

        snapshot.forEach((document) => {
          const data = document.data()
          const quantity = Number(data.quantity)
          const units = Number.isFinite(quantity) && quantity > 0 ? quantity : 0
          const purchase = Number(data.purchasePrice ?? 0)
          const sale = Number(data.salePrice ?? data.price ?? 0)

          if (Number.isFinite(purchase) && purchase > 0) purchaseTotal += purchase * units
          if (Number.isFinite(sale) && sale > 0) saleTotal += sale * units
        })

        setTotalPurchase(purchaseTotal)
        setTotalSale(saleTotal)
        setProductCount(snapshot.size)
        setLoading(false)
        setError('')
      },
      (snapshotError) => {
        console.error('No se pudieron cargar los productos:', snapshotError)
        setLoading(false)
        setError('No se pudieron cargar los productos. Revisa las reglas de Firestore.')
      },
    )

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, 'posSales'), orderBy('createdAt', 'desc')), (snapshot) => {
      setSales(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    }, (snapshotError) => console.error('No se pudieron cargar las ventas:', snapshotError))
    return unsubscribe
  }, [])

  return (
    <section className="dashboard-module">
      <div className="dashboard-page-heading">
        <div>
          <span className="dashboard-eyebrow">RESUMEN DE INVENTARIO</span>
          <h1>Dashboard</h1>
          <p>Valor total del inventario: precio de cada producto multiplicado por sus unidades.</p>
        </div>
        <span className="dashboard-total">
          <ChartBar size={18} /> {productCount} {productCount === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      {loading ? (
        <p className="registration-loading">Cargando totales…</p>
      ) : error ? (
        <p className="registration-error">{error}</p>
      ) : (
        <>
        <div className="dashboard-tiles">
          <article className="dashboard-tile purchase-tile">
            <div className="dashboard-tile-icon">
              <Banknote size={34} />
            </div>
            <div className="dashboard-tile-content">
              <strong>Total compra productos</strong>
              <p className="dashboard-tile-total">{formatPrice(totalPurchase)}</p>
            </div>
          </article>

          <article className="dashboard-tile sale-tile">
            <div className="dashboard-tile-icon">
              <Repeat size={34} />
            </div>
            <div className="dashboard-tile-content">
              <strong>Total venta producto</strong>
              <p className="dashboard-tile-total">{formatPrice(totalSale)}</p>
            </div>
          </article>
        </div>
        <section className="sales-history-card light-card">
          <div className="sales-history-heading"><div><span className="dashboard-eyebrow">REGISTRO DE CAJA</span><h2><ReceiptText size={19} /> Ventas recientes</h2></div><span>{sales.length} {sales.length === 1 ? 'venta' : 'ventas'}</span></div>
          {sales.length === 0 ? <p className="pos-empty-note">Las ventas que registres en Caja POS aparecerán aquí.</p> : <ul className="sales-history-list">{sales.slice(0, 20).map((sale) => <li key={sale.id}><div><strong>{sale.buyer}</strong><span>{(sale.products || []).map((item) => `${item.quantity}× ${item.name} (${formatPrice(item.price)})`).join(' · ')}</span><small>{sale.paymentMethod}</small></div><b>{formatPrice(sale.total)}</b></li>)}</ul>}
        </section>
        </>
      )}
    </section>
  )
}
