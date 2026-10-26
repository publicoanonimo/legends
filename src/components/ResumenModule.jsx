import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { Banknote, ChartBar, Repeat } from 'lucide-react'
import { db } from '../firebase'

function formatPrice(value) {
  const price = Number(value)
  if (!Number.isFinite(price)) return 'Bs 0,00'

  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(price)
}

export default function ResumenModule() {
  const [totalPurchase, setTotalPurchase] = useState(0)
  const [totalSale, setTotalSale] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
          const purchase = Number(data.purchasePrice ?? 0)
          const sale = Number(data.salePrice ?? data.price ?? 0)

          if (Number.isFinite(purchase) && purchase > 0) purchaseTotal += purchase
          if (Number.isFinite(sale) && sale > 0) saleTotal += sale
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

  return (
    <section className="dashboard-module">
      <div className="dashboard-page-heading">
        <div>
          <span className="dashboard-eyebrow">RESUMEN DE INVENTARIO</span>
          <h1>Dashboard</h1>
          <p>Totales de precio compra y precio venta calculados desde el inventario.</p>
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
        <div className="dashboard-tiles">
          <article className="dashboard-tile purchase-tile">
            <div className="dashboard-tile-icon">
              <Banknote size={34} />
            </div>
            <div className="dashboard-tile-content">
              <strong>Precio compra</strong>
              <p className="dashboard-tile-total">{formatPrice(totalPurchase)}</p>
              <span>Suma de todos los precios de compra del inventario</span>
            </div>
          </article>

          <article className="dashboard-tile sale-tile">
            <div className="dashboard-tile-icon">
              <Repeat size={34} />
            </div>
            <div className="dashboard-tile-content">
              <strong>Precio venta</strong>
              <p className="dashboard-tile-total">{formatPrice(totalSale)}</p>
              <span>Suma de todos los precios de venta del inventario</span>
            </div>
          </article>
        </div>
      )}
    </section>
  )
}
