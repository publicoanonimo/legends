import { useEffect, useState } from 'react'
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc,
} from 'firebase/firestore'
import {
  KeyRound, Package, Pencil, Plus, ShieldAlert, Trash2, X,
} from 'lucide-react'
import { db } from '../firebase'

const SUPERADMIN_PASSWORD = 'admin001'
const LOW_STOCK_LIMIT = 3

function formatPrice(value) {
  const price = Number(value)
  if (!Number.isFinite(price)) return 'Bs 0,00'

  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(price)
}

function getQuantity(product) {
  const quantity = Number(product.quantity)
  return Number.isFinite(quantity) ? quantity : 0
}

function getPurchasePrice(product) {
  const price = Number(product.purchasePrice)
  return Number.isFinite(price) ? price : 0
}

function getSalePrice(product) {
  const salePrice = Number(product.salePrice)
  if (Number.isFinite(salePrice)) return salePrice

  const legacyPrice = Number(product.price)
  return Number.isFinite(legacyPrice) ? legacyPrice : 0
}

function ProductFormModal({ product, onClose, onToast }) {
  const isEditing = Boolean(product)
  const [name, setName] = useState(product?.name || '')
  const [quantity, setQuantity] = useState(product ? String(getQuantity(product)) : '')
  const [purchasePrice, setPurchasePrice] = useState(
    product ? String(getPurchasePrice(product)) : '',
  )
  const [salePrice, setSalePrice] = useState(
    product ? String(getSalePrice(product)) : '',
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, saving])

  const submit = async (event) => {
    event.preventDefault()

    const trimmedName = name.trim()
    const numericQuantity = Number(quantity)
    const numericPurchasePrice = Number(purchasePrice)
    const numericSalePrice = Number(salePrice)

    if (!trimmedName) {
      setError('Escribe el nombre del producto.')
      return
    }

    if (quantity.trim() === '' || !Number.isInteger(numericQuantity) || numericQuantity < 0) {
      setError('La cantidad debe ser un número entero igual o mayor a 0.')
      return
    }

    if (purchasePrice.trim() === '' || !Number.isFinite(numericPurchasePrice) || numericPurchasePrice < 0) {
      setError('Escribe un precio de compra válido.')
      return
    }

    if (salePrice.trim() === '' || !Number.isFinite(numericSalePrice) || numericSalePrice <= 0) {
      setError('Escribe un precio de venta válido mayor a 0.')
      return
    }

    setSaving(true)
    setError('')

    try {
      if (isEditing) {
        await updateDoc(doc(db, 'posProducts', product.id), {
          name: trimmedName,
          quantity: numericQuantity,
          purchasePrice: numericPurchasePrice,
          salePrice: numericSalePrice,
          updatedAt: serverTimestamp(),
        })
      } else {
        await addDoc(collection(db, 'posProducts'), {
          name: trimmedName,
          quantity: numericQuantity,
          purchasePrice: numericPurchasePrice,
          salePrice: numericSalePrice,
          createdAt: serverTimestamp(),
        })
      }

      onToast?.({
        type: 'success',
        title: isEditing ? 'Producto actualizado' : 'Producto creado',
        message: `${trimmedName} · ${numericQuantity} unidades`,
      })
      onClose()
    } catch (saveError) {
      console.error('No se pudo guardar el producto:', saveError)
      setError('No se pudo guardar el producto. Revisa las reglas de Firestore.')
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <form
        className="booking-modal-card product-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-form-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <div className="modal-header">
          <div>
            <span className="modal-kicker">✦ INVENTARIO · PRODUCTOS</span>
            <h2 id="inventory-form-title" className="modal-title">
              {isEditing ? 'Editar producto' : 'Crear producto'}
            </h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="field-group">
            <label className="field-label" htmlFor="inventory-name">Nombre</label>
            <input
              id="inventory-name"
              className="modal-input"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                if (error) setError('')
              }}
              maxLength={80}
              placeholder="Ej. Cerveza, gaseosa, entrada…"
              autoFocus
              required
            />
          </div>

          <div className="inventory-form-row">
            <div className="field-group">
              <label className="field-label" htmlFor="inventory-quantity">Cantidad</label>
              <input
                id="inventory-quantity"
                className="modal-input"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={quantity}
                onChange={(event) => {
                  setQuantity(event.target.value)
                  if (error) setError('')
                }}
                placeholder="0"
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="inventory-purchase-price">Precio compra (Bs)</label>
              <input
                id="inventory-purchase-price"
                className="modal-input"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={purchasePrice}
                onChange={(event) => {
                  setPurchasePrice(event.target.value)
                  if (error) setError('')
                }}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="inventory-sale-price">Precio venta (Bs)</label>
            <input
              id="inventory-sale-price"
              className="modal-input"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={salePrice}
              onChange={(event) => {
                setSalePrice(event.target.value)
                if (error) setError('')
              }}
              placeholder="0.00"
              required
            />
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="submit-booking-btn" type="submit" disabled={saving}>
            <Plus size={17} />
            <span>{saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear producto'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

function SuperadminPasswordModal({ title, message, confirmLabel, onClose, onConfirm }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !working) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, working])

  const submit = async (event) => {
    event.preventDefault()

    if (password !== SUPERADMIN_PASSWORD) {
      setError('Contraseña de superadministrador incorrecta.')
      return
    }

    setWorking(true)
    setError('')

    try {
      await onConfirm()
    } catch (confirmError) {
      console.error('No se pudo completar la acción:', confirmError)
      setError('No se pudo completar la acción. Revisa las reglas de Firestore.')
      setWorking(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <form
        className="booking-modal-card product-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-admin-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <div className="modal-header">
          <div>
            <span className="modal-kicker">✦ ACCESO DE SUPERADMINISTRADOR</span>
            <h2 id="inventory-admin-title" className="modal-title">{title}</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-modal-warning">
            <ShieldAlert size={18} />
            <p>{message}</p>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="inventory-admin-password">
              Contraseña de superadministrador
            </label>
            <input
              id="inventory-admin-password"
              className="modal-input"
              type="password"
              autoComplete="off"
              autoFocus
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                if (error) setError('')
              }}
              required
            />
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="submit-booking-btn" type="submit" disabled={working}>
            <KeyRound size={16} />
            <span>{working ? 'Verificando…' : confirmLabel}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

function ProductCard({ product, onEdit, onDelete }) {
  const quantity = getQuantity(product)
  const purchasePrice = getPurchasePrice(product)
  const salePrice = getSalePrice(product)
  const isLowStock = quantity <= LOW_STOCK_LIMIT

  return (
    <article className={`inv-card ${isLowStock ? 'low-stock-card' : ''}`}>
      <div className="inv-top">
        <div>
          <span className="inv-category">PRODUCTO</span>
          <h3 className="inv-name">{product.name}</h3>
        </div>
        <span className={`inv-status-tag ${isLowStock ? 'status-critical' : 'status-good'}`}>
          {isLowStock ? 'Stock bajo' : 'Disponible'}
        </span>
      </div>

      <div className="inv-stock-level">
        <span className="stock-hint">Cantidad en stock</span>
        <div className="stock-number-row">
          <strong className="stock-big-num">{quantity}</strong>
          <span className="stock-unit-label">{quantity === 1 ? 'unidad' : 'unidades'}</span>
        </div>
      </div>

      <div className="inv-prices">
        <div className="inv-price-row">
          <span>Precio compra</span>
          <strong>{formatPrice(purchasePrice)}</strong>
        </div>
        <div className="inv-price-row">
          <span>Precio venta</span>
          <strong className="inv-sale-price">{formatPrice(salePrice)}</strong>
        </div>
      </div>

      <div className="inv-actions">
        <span className="stock-hint">Editar o eliminar con contraseña</span>
        <div className="inv-action-buttons">
          <button
            type="button"
            className="pos-product-tool-btn"
            onClick={() => onEdit(product)}
            aria-label={`Editar ${product.name}`}
            title="Editar producto"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            className="pos-product-tool-btn danger"
            onClick={() => onDelete(product)}
            aria-label={`Eliminar ${product.name}`}
            title="Eliminar producto"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  )
}

export default function InventarioModule({ onToast }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)

  useEffect(() => {
    const productsQuery = query(
      collection(db, 'posProducts'),
      orderBy('createdAt', 'desc'),
    )

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        setProducts(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })))
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

  const actionProduct = pendingAction?.product
  const lowStockCount = products.filter((product) => getQuantity(product) <= LOW_STOCK_LIMIT).length

  const deleteProduct = async (product) => {
    await deleteDoc(doc(db, 'posProducts', product.id))
    setPendingAction(null)
    onToast?.({
      type: 'success',
      title: 'Producto eliminado',
      message: `${product.name} se eliminó del inventario.`,
    })
  }

  const verifyEdit = () => {
    setEditingProduct(pendingAction.product)
    setPendingAction(null)
  }

  return (
    <section className="dashboard-module">
      <div className="dashboard-page-heading">
        <div>
          <span className="dashboard-eyebrow">INVENTARIO · STOCK & PRECIOS</span>
          <h1>Inventario</h1>
          <p>Crea productos con cantidad, precio de compra y precio de venta.</p>
        </div>
        <span className="dashboard-total">
          <Package size={18} /> {products.length} {products.length === 1 ? 'producto' : 'productos'}
          {lowStockCount > 0 ? ` · ${lowStockCount} con stock bajo` : ''}
        </span>
      </div>

      {loading ? (
        <p className="registration-loading">Cargando inventario…</p>
      ) : error ? (
        <p className="registration-error">{error}</p>
      ) : (
        <>
          <div className="inventory-grid">
            <button type="button" className="pos-create-card" onClick={() => setCreating(true)}>
              <span className="pos-create-icon"><Plus size={24} /></span>
              <strong>Crear producto</strong>
              <span>Nombre, cantidad y precios</span>
            </button>

            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={(item) => setPendingAction({ type: 'edit', product: item })}
                onDelete={(item) => setPendingAction({ type: 'delete', product: item })}
              />
            ))}
          </div>

          {products.length === 0 && (
            <p className="pos-empty-note">Aún no hay productos. Crea el primero para empezar a controlar el stock.</p>
          )}
        </>
      )}

      {creating && (
        <ProductFormModal onClose={() => setCreating(false)} onToast={onToast} />
      )}

      {editingProduct && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onToast={onToast}
        />
      )}

      {pendingAction && (
        <SuperadminPasswordModal
          title={pendingAction.type === 'delete' ? 'Eliminar producto' : 'Editar producto'}
          message={pendingAction.type === 'delete'
            ? `¿Seguro que quieres eliminar «${actionProduct.name}»? Esta acción no se puede deshacer.`
            : `Ingresa la contraseña para editar «${actionProduct.name}».`}
          confirmLabel={pendingAction.type === 'delete' ? 'Confirmar eliminación' : 'Continuar'}
          onClose={() => setPendingAction(null)}
          onConfirm={pendingAction.type === 'delete'
            ? () => deleteProduct(actionProduct)
            : verifyEdit}
        />
      )}
    </section>
  )
}
