import { useEffect, useState } from 'react'
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc,
} from 'firebase/firestore'
import {
  Banknote, CheckCircle2, KeyRound, Pencil, Plus, QrCode, ShieldAlert, ShoppingBag, Trash2, X,
} from 'lucide-react'
import { db } from '../firebase'

const SUPERADMIN_PASSWORD = 'admin001'

function formatPrice(value) {
  const price = Number(value)
  if (!Number.isFinite(price)) return 'Bs 0,00'

  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(price)
}

function ProductFormModal({ product, onClose, onToast }) {
  const isEditing = Boolean(product)
  const [name, setName] = useState(product?.name || '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
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
    const numericPrice = Number(price)

    if (!trimmedName) {
      setError('Escribe el nombre del producto.')
      return
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError('Escribe un precio válido mayor a 0.')
      return
    }

    setSaving(true)
    setError('')

    try {
      if (isEditing) {
        await updateDoc(doc(db, 'posProducts', product.id), {
          name: trimmedName,
          price: numericPrice,
          updatedAt: serverTimestamp(),
        })
      } else {
        await addDoc(collection(db, 'posProducts'), {
          name: trimmedName,
          price: numericPrice,
          createdAt: serverTimestamp(),
        })
      }

      onToast?.({
        type: 'success',
        title: isEditing ? 'Producto actualizado' : 'Producto creado',
        message: `${trimmedName} · ${formatPrice(numericPrice)}`,
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
        aria-labelledby="product-form-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <div className="modal-header">
          <div>
            <span className="modal-kicker">✦ CAJA · PRODUCTOS</span>
            <h2 id="product-form-title" className="modal-title">
              {isEditing ? 'Editar producto' : 'Crear producto'}
            </h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="field-group">
            <label className="field-label" htmlFor="product-name">Nombre</label>
            <input
              id="product-name"
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

          <div className="field-group">
            <label className="field-label" htmlFor="product-price">Precio (Bs)</label>
            <input
              id="product-price"
              className="modal-input"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(event) => {
                setPrice(event.target.value)
                if (error) setError('')
              }}
              placeholder="Ej. 15.00"
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
        aria-labelledby="product-admin-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <div className="modal-header">
          <div>
            <span className="modal-kicker">✦ ACCESO DE SUPERADMINISTRADOR</span>
            <h2 id="product-admin-title" className="modal-title">{title}</h2>
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
            <label className="field-label" htmlFor="product-admin-password">
              Contraseña de superadministrador
            </label>
            <input
              id="product-admin-password"
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

function PaymentModal({ product, onClose, onToast }) {
  const [method, setMethod] = useState('')

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const choose = (value) => {
    setMethod(value)
    onToast?.({
      type: 'success',
      title: 'Cobro registrado',
      message: `${product.name} cobrado en ${value === 'qr' ? 'QR' : 'Efectivo'} por ${formatPrice(product.price)}.`,
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="booking-modal-card payment-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="modal-kicker">✦ CAJA · COBRAR</span>
            <h2 id="payment-title" className="modal-title">Método de pago</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="payment-product-summary">
            <span>PRODUCTO</span>
            <strong>{product.name}</strong>
            <p className="payment-price">{formatPrice(product.price)}</p>
          </div>

          {method ? (
            <div className="payment-success">
              <CheckCircle2 size={36} />
              <strong>Pago con {method === 'qr' ? 'QR' : 'Efectivo'} registrado</strong>
              <p>{product.name} · {formatPrice(product.price)}</p>
              <button className="submit-booking-btn" type="button" onClick={onClose}>
                <CheckCircle2 size={17} />
                <span>Listo</span>
              </button>
            </div>
          ) : (
            <div className="payment-options">
              <button className="payment-option qr" type="button" onClick={() => choose('qr')}>
                <QrCode size={34} />
                <span>QR</span>
                <small>Pago digital</small>
              </button>
              <button className="payment-option cash" type="button" onClick={() => choose('cash')}>
                <Banknote size={34} />
                <span>Efectivo</span>
                <small>Pago en mano</small>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product, onOpen, onEdit, onDelete }) {
  return (
    <article className="pos-product-card">
      <div className="pos-product-tools">
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

      <button
        type="button"
        className="pos-product-open"
        onClick={() => onOpen(product)}
        aria-label={`Cobrar ${product.name} por ${formatPrice(product.price)}`}
      >
        <span className="pos-product-badge">PRODUCTO</span>
        <span className="pos-product-name">{product.name}</span>
        <span className="pos-product-price">{formatPrice(product.price)}</span>
        <span className="pos-product-hint">Toca para cobrar</span>
      </button>
    </article>
  )
}

export default function CajaModule({ onToast }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
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

  const deleteProduct = async (product) => {
    await deleteDoc(doc(db, 'posProducts', product.id))
    setPendingAction(null)
    onToast?.({
      type: 'success',
      title: 'Producto eliminado',
      message: `${product.name} se eliminó de la caja.`,
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
          <span className="dashboard-eyebrow">CAJA · COBRO DE PRODUCTOS</span>
          <h1>Caja POS</h1>
          <p>Crea productos, edítalos y cobra con QR o efectivo.</p>
        </div>
        <span className="dashboard-total">
          <ShoppingBag size={18} /> {products.length} {products.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      {loading ? (
        <p className="registration-loading">Cargando productos…</p>
      ) : error ? (
        <p className="registration-error">{error}</p>
      ) : (
        <>
          <div className="pos-products-grid">
            <button type="button" className="pos-create-card" onClick={() => setCreating(true)}>
              <span className="pos-create-icon"><Plus size={24} /></span>
              <strong>Crear producto</strong>
              <span>Agrega nombre y precio</span>
            </button>

            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpen={setSelectedProduct}
                onEdit={(item) => setPendingAction({ type: 'edit', product: item })}
                onDelete={(item) => setPendingAction({ type: 'delete', product: item })}
              />
            ))}
          </div>

          {products.length === 0 && (
            <p className="pos-empty-note">Aún no hay productos. Crea el primero para empezar a cobrar.</p>
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

      {selectedProduct && (
        <PaymentModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
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
