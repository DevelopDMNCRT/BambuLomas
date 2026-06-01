import { ref, computed } from 'vue'

export interface CartItem {
  id: string;
  productId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagenUrl?: string;
  selectedVariants?: Record<string, string[]>;
}

export const cartItems = ref<CartItem[]>([])
export const isCartOpen = ref(false)
export const selectedProductForModal = ref<any | null>(null)

export const addToCart = (product: any, selectedVariants: Record<string, string[]> = {}, precioExtraTotal: number = 0) => {
  const hashId = `${product.id}-${JSON.stringify(selectedVariants)}`
  const existing = cartItems.value.find(item => item.id === hashId)
  
  if (existing) {
    existing.cantidad++
  } else {
    cartItems.value.push({
      id: hashId,
      productId: product.id,
      nombre: product.nombre,
      precio: Number(product.precioBase) + precioExtraTotal,
      cantidad: 1,
      imagenUrl: product.imagenUrl,
      selectedVariants: { ...selectedVariants }
    })
  }
}

export const removeFromCart = (id: string) => {
  cartItems.value = cartItems.value.filter(item => item.id !== id)
}

export const updateQuantity = (id: string, qty: number) => {
  const item = cartItems.value.find(i => i.id === id)
  if (item) {
    item.cantidad = qty
    if (item.cantidad <= 0) {
      removeFromCart(id)
    }
  }
}

export const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => total + (item.precio * item.cantidad), 0)
})

export const cartCount = computed(() => {
  return cartItems.value.reduce((count, item) => count + item.cantidad, 0)
})

export const clearCart = () => {
  cartItems.value = []
}
