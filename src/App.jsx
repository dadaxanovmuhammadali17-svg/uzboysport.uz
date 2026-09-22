import { useState, useEffect, useMemo, useRef } from 'react'
import { 
  Trophy, ShoppingCart, Heart, Search, Star, Trash2, User, Check, 
  Phone, Mail, ArrowLeft, ArrowRight, Grid, List, Filter, 
  MapPin, Clock, ShieldCheck, Truck, RefreshCw, Send, ChevronRight, X
} from 'lucide-react'
import { products as initialProducts } from './data/products'

function App() {
  // --- STATE MANAGEMENT ---
  const [route, setRoute] = useState({ page: 'home', productId: null })
  
  // Products state - initialized from localStorage if edited by admin
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('uzboy_products')
    return saved ? JSON.parse(saved) : initialProducts
  })

  // Orders state - initialized from localStorage
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('uzboy_orders')
    return saved ? JSON.parse(saved) : []
  })

  // Cart state - persisted in localStorage
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('uzboy_cart')
    return saved ? JSON.parse(saved) : []
  })
  
  // Wishlist state - persisted in localStorage
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('uzboy_wishlist')
    return saved ? JSON.parse(saved) : []
  })
  
  // Toast notifications state
  const [toasts, setToasts] = useState([])

  // Search input and autocompletes
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchRef = useRef(null)

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Shop filter states
  const [selectedShopCategory, setSelectedShopCategory] = useState('all')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('default')
  
  // Coupon discount state
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)

  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    city: 'Toshkent',
    address: '',
    deliveryMethod: 'standard',
    notes: '' // Additional information
  })
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'click',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: ''
  })
  const [isOrdering, setIsOrdering] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  // Product detail view state
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [detailQty, setDetailQty] = useState(1)
  const [detailActiveTab, setDetailActiveTab] = useState('description')
  const [detailActiveImage, setDetailActiveImage] = useState('')

  // Countdown timer for promo banner
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 42,
    seconds: 18
  })

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', phone: '', msg: '' })

  // --- PERSISTENCE EFFECT ---
  useEffect(() => {
    localStorage.setItem('uzboy_cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('uzboy_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  useEffect(() => {
    localStorage.setItem('uzboy_products', JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem('uzboy_orders', JSON.stringify(orders))
  }, [orders])

  // --- ROUTING ENGINE ---
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname || '/home'
      setMobileMenuOpen(false)
      setShowSearchDropdown(false)
      
      if (path.startsWith('/product/')) {
        const id = parseInt(path.replace('/product/', ''), 10)
        const found = products.find(p => p.id === id)
        if (found) {
          setRoute({ page: 'product-detail', productId: id })
          setDetailQty(1)
          setSelectedSize(found.sizes[0] || '')
          setSelectedColor(found.colors[0] || '')
          setDetailActiveImage(found.image)
        } else {
          history.replaceState(null, '', '/home')
          setRoute({ page: 'home', productId: null })
        }
      } else {
        const page = path.replace('/', '') || 'home'
        setRoute({ page, productId: null })
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    };
    
    window.addEventListener('popstate', handleRouteChange)
    handleRouteChange() // Initial route load
    
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [products])

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Countdown ticking effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else {
          return { hours: 24, minutes: 0, seconds: 0 } // Reset
        }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // --- ACTIONS & TOASTS ---
  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  const navigateTo = (page, productId = null) => {
    if (page === 'product-detail' && productId) {
      history.pushState(null, '', `/product/${productId}`)
    } else {
      history.pushState(null, '', `/${page}`)
    }
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  const toggleWishlist = (id, e) => {
    if (e) e.stopPropagation()
    const product = products.find(p => p.id === id)
    if (wishlist.includes(id)) {
      setWishlist(prev => prev.filter(item => item !== id))
      addToast(`"${product?.name}" sevimlilardan olib tashlandi`, 'success')
    } else {
      setWishlist(prev => [...prev, id])
      addToast(`"${product?.name}" sevimlilarga qo'shildi!`, 'success')
    }
  }

  const addToCart = (product, size, color, qty = 1, e = null) => {
    if (e) e.stopPropagation()
    
    // Check if product has sizes and none selected
    if (!size && product.sizes && product.sizes.length > 0) {
      addToast("Iltimos, o'lchamni tanlang!", 'error')
      return
    }
    // Check if color selected
    if (!color && product.colors && product.colors.length > 0) {
      addToast("Iltimos, rangni tanlang!", 'error')
      return
    }

    // Check if item already in cart
    const existingIndex = cart.findIndex(
      item => item.product.id === product.id && 
              item.selectedSize === size && 
              item.selectedColor === color
    )

    if (existingIndex > -1) {
      const updated = [...cart]
      updated[existingIndex].quantity += qty
      setCart(updated)
    } else {
      setCart(prev => [...prev, { 
        product, 
        selectedSize: size, 
        selectedColor: color, 
        quantity: qty 
      }])
    }
    
    addToast(`"${product.name}" savatchaga qo'shildi!`, 'success')
  }

  const updateCartQty = (index, delta) => {
    const updated = [...cart]
    const item = updated[index]
    const newQty = item.quantity + delta
    
    if (newQty <= 0) {
      updated.splice(index, 1)
      addToast(`"${item.product.name}" savatchadan olib tashlandi`, 'success')
    } else {
      item.quantity = newQty
    }
    setCart(updated)
  }

  const removeFromCart = (index) => {
    const item = cart[index]
    setCart(prev => prev.filter((_, i) => i !== index))
    addToast(`"${item.product.name}" savatchadan olib tashlandi`, 'success')
  }

  const handleApplyCoupon = (e) => {
    e.preventDefault()
    const cleanCoupon = couponInput.trim().toUpperCase()
    if (cleanCoupon === 'UZBOY20') {
      setDiscountPercent(0.20)
      setAppliedCoupon('UZBOY20')
      addToast("20% lik chegirma kuponi muvaffaqiyatli qo'llanildi!", 'success')
    } else if (cleanCoupon === 'START10') {
      setDiscountPercent(0.10)
      setAppliedCoupon('START10')
      addToast("10% lik chegirma kuponi muvaffaqiyatli qo'llanildi!", 'success')
    } else {
      addToast("Noto'g'ri kupon kodi kiritildi!", 'error')
    }
  }

  const handleCheckoutSubmit = (e) => {
    e.preventDefault()
    if (checkoutStep === 1) {
      if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.phone || !shippingInfo.address) {
        addToast("Iltimos, barcha majburiy maydonlarni to'ldiring!", 'error')
        return
      }
      setCheckoutStep(2)
    } else if (checkoutStep === 2) {
      if (paymentInfo.method === 'card') {
        if (!paymentInfo.cardNumber || !paymentInfo.cardName || !paymentInfo.cardExpiry || !paymentInfo.cardCvv) {
          addToast("Karta ma'lumotlarini to'liq kiriting!", 'error')
          return
        }
      }
      
      // Submit order simulation
      setIsOrdering(true)
      setTimeout(() => {
        setIsOrdering(false)
        const newOrderNum = `UZB-${Math.floor(100000 + Math.random() * 900000)}`
        setOrderNumber(newOrderNum)
        
        // Save order details to received orders list
        const newOrder = {
          id: newOrderNum,
          date: new Date().toLocaleString('uz-UZ'),
          customer: {
            firstName: shippingInfo.firstName,
            lastName: shippingInfo.lastName,
            phone: shippingInfo.phone,
            email: shippingInfo.email,
            city: shippingInfo.city,
            address: shippingInfo.address,
            notes: shippingInfo.notes
          },
          items: cart.map(item => ({
            id: item.product.id,
            name: item.product.name,
            image: item.product.image,
            price: item.product.price,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor
          })),
          subtotal: cartSubtotal,
          discount: discountAmount,
          delivery: deliveryCost,
          total: cartTotal,
          paymentMethod: paymentInfo.method,
          deliveryMethod: shippingInfo.deliveryMethod,
          status: 'Yangi' // status: Yangi, Yetkazilmoqda, Bajarildi
        }
        
        setOrders(prev => [newOrder, ...prev])
        setCheckoutStep(3)
        setCart([])
        setAppliedCoupon('')
        setDiscountPercent(0)
        setCouponInput('')
        addToast("Buyurtmangiz muvaffaqiyatli qabul qilindi!", 'success')
      }, 2000)
    }
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()
    if (!contactForm.name || !contactForm.phone || !contactForm.msg) {
      addToast("Iltimos, barcha maydonlarni to'ldiring!", 'error')
      return
    }
    addToast("Xabaringiz yuborildi! Tez orada siz bilan bog'lanamiz.", 'success')
    setContactForm({ name: '', phone: '', msg: '' })
  }

  // Admin Panel States
  const [adminTab, setAdminTab] = useState('orders')
  const [adminPasswordInput, setAdminPasswordInput] = useState('')
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => sessionStorage.getItem('uzboy_admin_session') === 'true')
  const [showPassword, setShowPassword] = useState(false)
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'running',
    brand: '',
    price: '',
    originalPrice: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    sizes: '40, 41, 42, 43, 44',
    colors: '#e11d48, #000000, #ffffff',
    specs: 'Ishlab chiqaruvchi: UzBoy, Material: Premium Tekstil, Turi: Sport'
  })

  // Admin Panel Handlers
  const handleAdminLogin = (e) => {
    e.preventDefault()
    if (adminPasswordInput === 'uz456sport77go') {
      setIsAdminAuthenticated(true)
      sessionStorage.setItem('uzboy_admin_session', 'true')
      setAdminPasswordInput('')
      addToast("Admin panelga kirish muvaffaqiyatli amalga oshirildi!", 'success')
    } else {
      addToast("Noto'g'ri parol kiritildi!", 'error')
    }
  }

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false)
    sessionStorage.removeItem('uzboy_admin_session')
    navigateTo('home')
    addToast("Admin paneldan chiqildi", 'success')
  }
  const handleDeleteProduct = (id) => {
    if (window.confirm("Haqiqatan ham ushbu mahsulotni o'chirmoqchisiz?")) {
      setProducts(prev => prev.filter(p => p.id !== id))
      addToast("Mahsulot muvaffaqiyatli o'chirildi", 'success')
    }
  }

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    addToast(`Buyurtma statusi "${newStatus}" ga o'zgartirildi`, 'success')
  }

  const handleDeleteOrder = (orderId) => {
    if (window.confirm("Haqiqatan ham ushbu buyurtmani o'chirmoqchisiz?")) {
      setOrders(prev => prev.filter(o => o.id !== orderId))
      addToast("Buyurtma muvaffaqiyatli o'chirildi", 'success')
    }
  }

  const handleSaveProduct = (e) => {
    e.preventDefault()
    if (!newProductForm.name || !newProductForm.brand || !newProductForm.price || !newProductForm.description) {
      addToast("Iltimos, barcha majburiy maydonlarni to'ldiring!", 'error')
      return
    }
    
    // Parse sizes and colors
    const parsedSizes = newProductForm.sizes.split(',').map(s => s.trim()).filter(s => s.length > 0)
    const parsedColors = newProductForm.colors.split(',').map(c => c.trim()).filter(c => c.length > 0)
    
    // Parse specs
    const parsedSpecs = {}
    newProductForm.specs.split(',').forEach(item => {
      const parts = item.split(':')
      if (parts.length >= 2) {
        parsedSpecs[parts[0].trim()] = parts.slice(1).join(':').trim()
      }
    })
    
    const maxId = products.reduce((max, p) => p.id > max ? p.id : max, 0)
    const newId = maxId + 1
    
    const categoryNames = {
      football: 'Futbol',
      running: 'Yugurish',
      fitness: 'Fitness va Zal',
      basketball: 'Basketbol',
      accessories: 'Aksessuarlar'
    }
    
    const productToAdd = {
      id: newId,
      name: newProductForm.name,
      category: newProductForm.category,
      categoryName: categoryNames[newProductForm.category] || 'Boshqa',
      brand: newProductForm.brand,
      price: parseInt(newProductForm.price, 10),
      originalPrice: newProductForm.originalPrice ? parseInt(newProductForm.originalPrice, 10) : parseInt(newProductForm.price, 10),
      rating: 5.0,
      reviewsCount: 0,
      image: newProductForm.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      gallery: [
        newProductForm.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
        newProductForm.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'
      ],
      description: newProductForm.description,
      specs: parsedSpecs,
      sizes: parsedSizes,
      colors: parsedColors,
      inStock: true,
      isFeatured: false
    }
    
    setProducts(prev => [productToAdd, ...prev])
    addToast(`"${newProductForm.name}" muvaffaqiyatli qo'shildi!`, 'success')
    
    // Reset form
    setNewProductForm({
      name: '',
      category: 'running',
      brand: '',
      price: '',
      originalPrice: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      sizes: '40, 41, 42, 43, 44',
      colors: '#e11d48, #000000, #ffffff',
      specs: 'Ishlab chiqaruvchi: UzBoy, Material: Premium Tekstil, Turi: Sport'
    })
    
    setAdminTab('products') // redirect to list tab
  }

  // --- DERIVED STATES ---
  
  // Search suggestion matching
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.categoryName.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query)
    ).slice(0, 5)
  }, [searchQuery])

  // Filter & Sort for Shop Page
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedShopCategory !== 'all' && p.category !== selectedShopCategory) {
        return false
      }
      
      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) {
        return false
      }
      
      // Min price filter
      if (minPrice && p.price < parseInt(minPrice, 10)) {
        return false
      }

      // Max price filter
      if (maxPrice && p.price > parseInt(maxPrice, 10)) {
        return false
      }
      
      return true
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0 // default sorting
    })
  }, [selectedShopCategory, selectedBrands, minPrice, maxPrice, sortBy])

  // Unique list of brands in store
  const availableBrands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand)))
  }, [])

  // Cart summary calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  }, [cart])

  const deliveryCost = useMemo(() => {
    if (cartSubtotal === 0) return 0
    if (cartSubtotal > 2000000) return 0 // Free shipping above 2M UZS
    return shippingInfo.deliveryMethod === 'express' ? 50000 : 30000
  }, [cartSubtotal, shippingInfo.deliveryMethod])

  const discountAmount = useMemo(() => {
    return cartSubtotal * discountPercent
  }, [cartSubtotal, discountPercent])

  const cartTotal = useMemo(() => {
    return cartSubtotal - discountAmount + deliveryCost
  }, [cartSubtotal, discountAmount, deliveryCost])

  // Wishlist products details
  const wishlistProducts = useMemo(() => {
    return products.filter(p => wishlist.includes(p.id))
  }, [wishlist])

  // Count items by category for sidebar helper
  const getCategoryCount = (cat) => {
    if (cat === 'all') return products.length
    return products.filter(p => p.category === cat).length
  }

  // Related products details page helper
  const relatedProducts = useMemo(() => {
    if (route.page !== 'product-detail' || !route.productId) return []
    const currentProduct = products.find(p => p.id === route.productId)
    if (!currentProduct) return []
    return products
      .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
      .slice(0, 4)
  }, [route])

  const currentDetailProduct = useMemo(() => {
    if (route.page !== 'product-detail') return null
    return products.find(p => p.id === route.productId)
  }, [route])

  // Utility to format price
  const formatUZS = (price) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(price)
  }

  return (
    <div id="root">
      
      {/* --- HEADER --- */}
      <header className="main-header">
        <div className="container header-container">
          
          {/* Logo */}
          <a href="/home" className="logo-link" onClick={(e) => { e.preventDefault(); navigateTo('home') }}>
            <Trophy className="logo-icon" size={28} color="var(--primary)" />
            UZ<span>BOY</span>
          </a>

          {/* Navigation Menu */}
          <nav className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <a 
              href="/home" 
              className={`nav-link ${route.page === 'home' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigateTo('home') }}
            >
              Bosh sahifa
            </a>
            <a 
              href="/products" 
              className={`nav-link ${route.page === 'products' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                setSelectedShopCategory('all')
                navigateTo('products')
              }}
            >
              Mahsulotlar
            </a>
            <a 
              href="/about" 
              className={`nav-link ${route.page === 'about' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigateTo('about') }}
            >
              Biz haqimizda
            </a>
            <a 
              href="/contact" 
              className={`nav-link ${route.page === 'contact' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigateTo('contact') }}
            >
              Aloqa
            </a>
          </nav>

          {/* Actions */}
          <div className="header-actions">
            
            {/* Live Search */}
            <div className="search-container" ref={searchRef}>
              <input 
                type="text" 
                placeholder="Qidiruv..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSearchDropdown(true)
                }}
                onFocus={() => setShowSearchDropdown(true)}
              />
              <Search className="search-icon" size={18} />
              
              {/* Autocomplete Dropdown */}
              {showSearchDropdown && searchSuggestions.length > 0 && (
                <div className="search-results">
                  {searchSuggestions.map(p => (
                    <div 
                      key={p.id} 
                      className="search-item"
                      onClick={() => {
                        navigateTo('product-detail', p.id)
                        setSearchQuery('')
                        setShowSearchDropdown(false)
                      }}
                    >
                      <img src={p.image} alt={p.name} className="search-item-img" />
                      <div className="search-item-info">
                        <div className="search-item-name">{p.name}</div>
                        <div className="search-item-price">{formatUZS(p.price)}</div>
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  ))}
                  <div 
                    className="search-item" 
                    style={{ justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', color: 'var(--primary)' }}
                    onClick={() => {
                      setSelectedShopCategory('all')
                      navigateTo('products')
                      setShowSearchDropdown(false)
                    }}
                  >
                    Barcha natijalarni ko'rish
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button 
              className="header-btn" 
              onClick={() => navigateTo('wishlist')}
              title="Sevimlilar"
            >
              <Heart size={20} className={wishlist.length > 0 ? 'star-icon' : ''} style={{ fill: wishlist.length > 0 ? '#ef4444' : 'none', color: wishlist.length > 0 ? '#ef4444' : 'currentColor' }} />
              {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
            </button>

            {/* Cart Button */}
            <button 
              className="header-btn" 
              onClick={() => navigateTo('cart')}
              title="Savat"
            >
              <ShoppingCart size={20} />
              {cart.length > 0 && <span className="badge">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
            </button>

            {/* Mobile Nav Button */}
            <button 
              className="header-btn mobile-nav-btn" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <List size={22} />
            </button>

          </div>
        </div>
      </header>

      {/* --- MAIN ROUTER VIEWS --- */}
      <main style={{ flexGrow: 1 }}>
        
        {/* ==================== HOME PAGE ==================== */}
        {route.page === 'home' && (
          <div>
            
            {/* Hero Section */}
            <section className="hero-section">
              <div className="container hero-grid">
                
                <div className="hero-content" style={{ textAlign: 'left' }}>
                  <div className="hero-tag">
                    <Trophy size={16} /> 100% Sifat Kafolati
                  </div>
                  <h1 className="hero-title">
                    G'alabalar Sari <span>Kuchsizlanmasdan</span> Intil!
                  </h1>
                  <p className="hero-desc">
                    Dunyoning eng mashhur brendlaridan original sport jihozlari va kiyimlari. O'zingizga qulay formatda xarid qiling va chempionlik maqomingizni mustahkamlang!
                  </p>
                  <div className="hero-actions">
                    <button className="btn btn-primary" onClick={() => navigateTo('products')}>
                      Hozir xarid qilish <ArrowRight size={18} />
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigateTo('about')}>
                      Biz haqimizda
                    </button>
                  </div>
                </div>

                <div className="hero-image-wrapper">
                  <div className="hero-img-bg"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80" 
                    alt="Premium Shoe" 
                    className="hero-main-img" 
                  />
                  
                  {/* Floating badge 1 */}
                  <div className="floating-badge fb-1">
                    <div className="fb-icon">
                      <Truck size={18} />
                    </div>
                    <div className="fb-text">
                      <h4>Tezkor yetkazib berish</h4>
                      <p>Respublika bo'ylab</p>
                    </div>
                  </div>

                  {/* Floating badge 2 */}
                  <div className="floating-badge fb-2">
                    <div className="fb-icon" style={{ backgroundColor: '#10b981' }}>
                      <ShieldCheck size={18} />
                    </div>
                    <div className="fb-text">
                      <h4>100% Original</h4>
                      <p>Kafolatlangan sifat</p>
                    </div>
                  </div>

                </div>

              </div>
            </section>

            {/* Categories grid */}
            <section className="container" style={{ padding: '40px 0' }}>
              <h2 className="section-title">Kategoriyalar bo'yicha saralash</h2>
              <p className="section-desc">Kerakli sport yo'nalishini tanlang va mos keladigan sifatli anjomlarni toping</p>
              
              <div className="categories-grid">
                {[
                  { id: 'football', name: 'Futbol', desc: 'Butsalar, to\'plar, formalar', icon: Trophy },
                  { id: 'running', name: 'Yugurish', desc: 'Krossovkalar, aqlli soatlar', icon: Clock },
                  { id: 'fitness', name: 'Fitness / Zal', desc: 'Gantellar, matlar, aksessuarlar', icon: ShieldCheck },
                  { id: 'basketball', name: 'Basketbol', desc: 'To\'plar va poyabzallar', icon: Trophy },
                  { id: 'accessories', name: 'Aksessuarlar', desc: 'Kepka, shaker, sumkalar', icon: ShoppingCart }
                ].map(cat => {
                  const Icon = cat.icon
                  return (
                    <div 
                      key={cat.id} 
                      className="category-card"
                      onClick={() => {
                        setSelectedShopCategory(cat.id)
                        navigateTo('products')
                      }}
                    >
                      <div className="category-icon-wrapper">
                        <Icon size={24} />
                      </div>
                      <h3>{cat.name}</h3>
                      <p>{cat.desc}</p>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Featured products grid */}
            <section className="container products-section">
              <div className="products-header-row">
                <div style={{ textAlign: 'left' }}>
                  <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 0 }}>Ommabop mahsulotlar</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Mijozlarimiz tomonidan eng ko'p sotib olingan sport jihozlari</p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigateTo('products')}>
                  Barcha mahsulotlar <ArrowRight size={16} />
                </button>
              </div>

              <div className="products-grid">
                {products.filter(p => p.isFeatured).slice(0, 4).map(product => (
                  <div 
                    key={product.id} 
                    className="product-card"
                    onClick={() => navigateTo('product-detail', product.id)}
                  >
                    <div className="product-card-img-wrapper">
                      {product.originalPrice > product.price && (
                        <span className="product-badge discount">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      )}
                      {product.id === 1 && <span className="product-badge new">Yangi</span>}
                      
                      <button 
                        className={`product-card-wishlist ${wishlist.includes(product.id) ? 'active' : ''}`}
                        onClick={(e) => toggleWishlist(product.id, e)}
                      >
                        <Heart size={18} style={{ fill: wishlist.includes(product.id) ? '#ef4444' : 'none' }} />
                      </button>

                      <img src={product.image} alt={product.name} className="product-card-img" />
                    </div>

                    <div className="product-card-info">
                      <span className="product-card-cat">{product.categoryName}</span>
                      <h3 className="product-card-title">{product.name}</h3>
                      
                      <div className="product-card-rating">
                        <Star size={14} className="star-icon" />
                        <span>{product.rating}</span>
                        <span>({product.reviewsCount} ta sharh)</span>
                      </div>

                      <div className="product-card-price-row">
                        <div className="product-price-wrapper">
                          {product.originalPrice > product.price && (
                            <span className="old-price">{formatUZS(product.originalPrice)}</span>
                          )}
                          <span className="current-price">{formatUZS(product.price)}</span>
                        </div>
                        
                        <button 
                          className="product-add-btn"
                          onClick={(e) => addToCart(product, product.sizes[0], product.colors[0], 1, e)}
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Special Sale Promo with Active Countdown */}
            <section className="container" style={{ marginBottom: '80px' }}>
              <div className="promo-banner">
                <div className="promo-grid">
                  <div style={{ textAlign: 'left' }}>
                    <span className="promo-badge">Haftalik chegirma</span>
                    <h2 className="promo-title">Yozgi Katta Aksiya! <br />Barcha Krossovkalarga 20% gacha</h2>
                    <p className="promo-desc">
                      Chegirmadan foydalanish uchun checkout sahifasida <strong>UZBOY20</strong> kupon kodini kiriting. Shoshiling, taklif muddati cheklangan!
                    </p>
                    
                    <div className="countdown-container">
                      <div className="countdown-box">
                        <span className="countdown-num">{timeLeft.hours.toString().padStart(2, '0')}</span>
                        <span className="countdown-lbl">Soat</span>
                      </div>
                      <div className="countdown-box">
                        <span className="countdown-num">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                        <span className="countdown-lbl">Daqiqa</span>
                      </div>
                      <div className="countdown-box">
                        <span className="countdown-num">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                        <span className="countdown-lbl">Soniya</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '20px 40px', fontSize: '18px', backgroundColor: 'white', color: '#ff5200', border: 'none', fontWeight: 'bold', borderRadius: 'var(--radius-full)' }}
                      onClick={() => {
                        setSelectedShopCategory('running')
                        navigateTo('products')
                      }}
                    >
                      Kolleksiyani ko'rish
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="reviews-section">
              <div className="container">
                <h2 className="section-title">Mijozlarimiz fikrlari</h2>
                <p className="section-desc">Bizning sport jihozlarimiz bilan g'alaba qozonayotgan professional sportchilar va havaskorlar bahosi</p>
                
                <div className="reviews-grid">
                  {[
                    { name: 'Sardor Rashidov', role: 'Professional yuguruvchi', text: 'Asics krossovkalarini shu do\'kondan sotib oldim. Amortizatsiyasi juda ajoyib, 10 km masofani charchoqsiz bosib o\'tyapman. Sifatiga gap yo\'q, yetkazib berish ham tez bo\'ldi.', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80' },
                    { name: 'Dostonbek Tursunov', role: 'Futbolchi', text: 'Nike Flight to\'pini professional o\'yinlarimiz uchun buyurtma qilgandik. Havoda parvoz traektoriyasi juda barqaror ekan. Hamma jamoamizga to\'p juda ma\'qul keldi. Rahmat!', img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80' },
                    { name: 'Malika Sobirova', role: 'Fitness murabbiyi', text: 'Yoga mati va gantellar to\'plamini uydagi mashg\'ulotlarim uchun oldim. Mat sirpanmaydi va qalinligi juda mos. Gantellar sozlanishi esa uydagilar uchun ham qo\'l keldi.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80' }
                  ].map((rev, i) => (
                    <div key={i} className="review-card" style={{ textAlign: 'left' }}>
                      <div className="review-stars">
                        {[...Array(5)].map((_, s) => <Star key={s} size={16} className="star-icon" />)}
                      </div>
                      <p className="review-text">"{rev.text}"</p>
                      <div className="review-user">
                        <img src={rev.img} alt={rev.name} className="review-avatar" />
                        <div className="review-user-info">
                          <h4>{rev.name}</h4>
                          <p>{rev.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Newsletter */}
            <section className="container newsletter-section">
              <div className="newsletter-card">
                <h2 className="newsletter-title">Klubimizga a'zo bo'ling</h2>
                <p className="newsletter-desc">Yangi kelgan sport tovarlari, eksklyuziv aksiyalar va foydali chegirmalar haqida birinchilardan bo'lib ma'lumot oling</p>
                <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); addToast("A'zoligingiz muvaffaqiyatli tasdiqlandi!", 'success'); }}>
                  <input type="email" placeholder="Elektron pochtangiz" className="newsletter-input" required />
                  <button type="submit" className="newsletter-btn">Obuna bo'lish</button>
                </form>
              </div>
            </section>

          </div>
        )}

        {/* ==================== PRODUCTS SHOP PAGE ==================== */}
        {route.page === 'products' && (
          <div className="container">
            <div className="shop-layout">
              
              {/* Sidebar Filters */}
              <aside className="filters-sidebar" style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Filtrlar</h3>
                  <button 
                    style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}
                    onClick={() => {
                      setSelectedShopCategory('all')
                      setSelectedBrands([])
                      setMinPrice('')
                      setMaxPrice('')
                      setSortBy('default')
                      addToast("Barcha filtrlar tozalandi", 'success')
                    }}
                  >
                    Tozalash
                  </button>
                </div>

                {/* Categories filter */}
                <div className="filter-group">
                  <h4 className="filter-title">Kategoriya</h4>
                  <div className="filter-categories-list">
                    {[
                      { id: 'all', name: 'Barchasi' },
                      { id: 'football', name: 'Futbol' },
                      { id: 'running', name: 'Yugurish' },
                      { id: 'fitness', name: 'Fitness va Zal' },
                      { id: 'basketball', name: 'Basketbol' },
                      { id: 'accessories', name: 'Aksessuarlar' }
                    ].map(cat => (
                      <button 
                        key={cat.id}
                        className={`filter-cat-btn ${selectedShopCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setSelectedShopCategory(cat.id)}
                      >
                        <span>{cat.name}</span>
                        <span className="filter-cat-count">{getCategoryCount(cat.id)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price filter */}
                <div className="filter-group">
                  <h4 className="filter-title">Narx (UZS)</h4>
                  <div className="price-range-inputs">
                    <div className="price-input-wrapper">
                      <input 
                        type="number" 
                        placeholder="Kamida" 
                        className="price-input"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                    </div>
                    <div className="price-input-wrapper">
                      <input 
                        type="number" 
                        placeholder="Ko'pida" 
                        className="price-input"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Brands filter */}
                <div className="filter-group">
                  <h4 className="filter-title">Brendlar</h4>
                  <div className="brand-checkbox-list">
                    {availableBrands.map(brand => (
                      <label key={brand} className="brand-label">
                        <input 
                          type="checkbox" 
                          className="brand-checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBrands(prev => [...prev, brand])
                            } else {
                              setSelectedBrands(prev => prev.filter(b => b !== brand))
                            }
                          }}
                        />
                        {brand}
                      </label>
                    ))}
                  </div>
                </div>

              </aside>

              {/* Shop Products Column */}
              <div className="shop-products-col">
                
                {/* Shop Toolbar */}
                <div className="shop-toolbar">
                  <span className="toolbar-info">
                    {filteredProducts.length} ta mahsulot topildi
                  </span>
                  
                  <div className="toolbar-controls">
                    <select 
                      className="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="default">Saralash: Default</option>
                      <option value="price-asc">Narx: Kamayish tartibida</option>
                      <option value="price-desc">Narx: O'sish tartibida</option>
                      <option value="rating">Reyting bo'yicha</option>
                      <option value="name">Nomi bo'yicha (A-Z)</option>
                    </select>
                  </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                  <div className="products-grid">
                    {filteredProducts.map(product => (
                      <div 
                        key={product.id} 
                        className="product-card"
                        onClick={() => navigateTo('product-detail', product.id)}
                      >
                        <div className="product-card-img-wrapper">
                          {product.originalPrice > product.price && (
                            <span className="product-badge discount">
                              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                            </span>
                          )}
                          <button 
                            className={`product-card-wishlist ${wishlist.includes(product.id) ? 'active' : ''}`}
                            onClick={(e) => toggleWishlist(product.id, e)}
                          >
                            <Heart size={18} style={{ fill: wishlist.includes(product.id) ? '#ef4444' : 'none' }} />
                          </button>
                          <img src={product.image} alt={product.name} className="product-card-img" />
                        </div>

                        <div className="product-card-info">
                          <span className="product-card-cat">{product.categoryName}</span>
                          <h3 className="product-card-title">{product.name}</h3>
                          
                          <div className="product-card-rating">
                            <Star size={14} className="star-icon" />
                            <span>{product.rating}</span>
                            <span>({product.reviewsCount} ta sharh)</span>
                          </div>

                          <div className="product-card-price-row">
                            <div className="product-price-wrapper">
                              {product.originalPrice > product.price && (
                                <span className="old-price">{formatUZS(product.originalPrice)}</span>
                              )}
                              <span className="current-price">{formatUZS(product.price)}</span>
                            </div>
                            
                            <button 
                              className="product-add-btn"
                              onClick={(e) => addToCart(product, product.sizes[0], product.colors[0], 1, e)}
                            >
                              <ShoppingCart size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '64px 0', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <Search size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                    <h3>Hech narsa topilmadi</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Filtr shartlarini o'zgartirib qayta urinib ko'ring.</p>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* ==================== PRODUCT DETAILS PAGE ==================== */}
        {route.page === 'product-detail' && currentDetailProduct && (
          <div className="container detail-layout">
            
            {/* Back Row */}
            <div className="back-btn-row" style={{ textAlign: 'left' }}>
              <button className="back-btn" onClick={() => navigateTo('products')}>
                <ArrowLeft size={16} /> Mahsulotlarga qaytish
              </button>
            </div>

            {/* Main Detail Grid */}
            <div className="detail-grid">
              
              {/* Left Column: Image Slider */}
              <div className="detail-gallery">
                <div className="main-image-wrapper">
                  <img src={detailActiveImage} alt={currentDetailProduct.name} className="main-image" />
                </div>
                
                {/* Thumbnails */}
                <div className="thumbnails-row">
                  {currentDetailProduct.gallery.map((imgUrl, idx) => (
                    <button 
                      key={idx}
                      className={`thumb-btn ${detailActiveImage === imgUrl ? 'active' : ''}`}
                      onClick={() => setDetailActiveImage(imgUrl)}
                    >
                      <img src={imgUrl} alt={`thumbnail ${idx}`} className="thumb-img" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Order panel */}
              <div className="detail-info" style={{ textAlign: 'left' }}>
                <span className="detail-cat">{currentDetailProduct.categoryName}</span>
                <h1 className="detail-title">{currentDetailProduct.name}</h1>
                
                <div className="detail-rating-row">
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className="star-icon"
                        style={{ fill: i < Math.floor(currentDetailProduct.rating) ? 'var(--rating-color)' : 'none' }} 
                      />
                    ))}
                  </div>
                  <span>{currentDetailProduct.rating} / 5 ({currentDetailProduct.reviewsCount} ta sharh)</span>
                </div>

                <div className="detail-price-row">
                  <span className="detail-price">{formatUZS(currentDetailProduct.price)}</span>
                  {currentDetailProduct.originalPrice > currentDetailProduct.price && (
                    <span className="detail-old-price">{formatUZS(currentDetailProduct.originalPrice)}</span>
                  )}
                </div>

                <p className="detail-description">
                  {currentDetailProduct.description}
                </p>

                {/* Colors Select */}
                {currentDetailProduct.colors && currentDetailProduct.colors.length > 0 && (
                  <div className="attribute-section">
                    <span className="attribute-title">Rang:</span>
                    <div className="color-option-list">
                      {currentDetailProduct.colors.map(col => (
                        <button 
                          key={col}
                          className={`color-option-btn ${selectedColor === col ? 'active' : ''}`}
                          style={{ backgroundColor: col }}
                          onClick={() => setSelectedColor(col)}
                          title={col}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes Select */}
                {currentDetailProduct.sizes && currentDetailProduct.sizes.length > 0 && (
                  <div className="attribute-section">
                    <span className="attribute-title">O'lcham (Razmer):</span>
                    <div className="size-option-list">
                      {currentDetailProduct.sizes.map(sz => (
                        <button 
                          key={sz}
                          className={`size-option-btn ${selectedSize === sz ? 'active' : ''}`}
                          onClick={() => setSelectedSize(sz)}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buy Controls */}
                <div className="purchase-row">
                  
                  {/* Quantity selector */}
                  <div className="quantity-control">
                    <button 
                      className="qty-btn"
                      onClick={() => setDetailQty(prev => Math.max(1, prev - 1))}
                    >
                      -
                    </button>
                    <span className="qty-val">{detailQty}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => setDetailQty(prev => prev + 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="buy-actions">
                    <button 
                      className="btn btn-primary"
                      style={{ flexGrow: 1 }}
                      onClick={() => addToCart(currentDetailProduct, selectedSize, selectedColor, detailQty)}
                    >
                      <ShoppingCart size={18} /> Savatga qo'shish
                    </button>
                    
                    <button 
                      className={`wishlist-toggle-btn ${wishlist.includes(currentDetailProduct.id) ? 'active' : ''}`}
                      onClick={() => toggleWishlist(currentDetailProduct.id)}
                    >
                      <Heart size={20} style={{ fill: wishlist.includes(currentDetailProduct.id) ? '#ef4444' : 'none' }} />
                    </button>
                  </div>

                </div>

                {/* Trust Elements */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <Truck size={18} color="var(--primary)" />
                    <span>Tezkor yetkazib berish (24-48 soat)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <RefreshCw size={18} color="var(--primary)" />
                    <span>14 kunlik qaytarish kafolati</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Tabs Panel */}
            <div className="tabs-panel" style={{ textAlign: 'left' }}>
              <div className="tabs-header">
                <button 
                  className={`tab-btn ${detailActiveTab === 'description' ? 'active' : ''}`}
                  onClick={() => setDetailActiveTab('description')}
                >
                  Tavsif
                </button>
                <button 
                  className={`tab-btn ${detailActiveTab === 'specs' ? 'active' : ''}`}
                  onClick={() => setDetailActiveTab('specs')}
                >
                  Texnik parametrlar
                </button>
                <button 
                  className={`tab-btn ${detailActiveTab === 'delivery' ? 'active' : ''}`}
                  onClick={() => setDetailActiveTab('delivery')}
                >
                  Yetkazib berish va to'lov
                </button>
              </div>

              <div className="tab-content">
                {detailActiveTab === 'description' && (
                  <div>
                    <p style={{ marginBottom: '12px' }}>{currentDetailProduct.description}</p>
                    <p>Ushbu mahsulot professional sport standartlariga to'liq javob beradi. Mashg'ulotlaringiz yanada unumli va qulay bo'lishi uchun materiallar yuqori darajada tanlangan. Ishqalanish, terlash va charchoqni oldini oluvchi texnologiyalar bilan ta'minlangan.</p>
                  </div>
                )}
                
                {detailActiveTab === 'specs' && (
                  <table className="specs-table">
                    <tbody>
                      {Object.entries(currentDetailProduct.specs).map(([key, val]) => (
                        <tr key={key}>
                          <td className="specs-label">{key}</td>
                          <td>{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {detailActiveTab === 'delivery' && (
                  <div>
                    <p style={{ marginBottom: '10px' }}><strong>O'zbekiston bo'ylab yetkazib berish:</strong></p>
                    <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li>Standard yetkazib berish: 24-48 soat ichida (30,000 UZS)</li>
                      <li>Express yetkazib berish: Toshkent shahrida 3 soat ichida (50,000 UZS)</li>
                      <li>Buyurtma summasi 2,000,000 UZS dan oshsa — yetkazib berish bepul!</li>
                    </ul>
                    <p style={{ marginTop: '16px' }}><strong>To'lov turlari:</strong> Click, Payme, naqd pul va xalqaro plastik kartalar (Visa, Mastercard).</p>
                  </div>
                )}
              </div>
            </div>

            {/* Related Products Grid */}
            {relatedProducts.length > 0 && (
              <div className="related-products">
                <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '32px' }}>O'xshash mahsulotlar</h2>
                <div className="products-grid">
                  {relatedProducts.map(product => (
                    <div 
                      key={product.id} 
                      className="product-card"
                      onClick={() => navigateTo('product-detail', product.id)}
                    >
                      <div className="product-card-img-wrapper">
                        <img src={product.image} alt={product.name} className="product-card-img" />
                      </div>
                      <div className="product-card-info" style={{ textAlign: 'left' }}>
                        <span className="product-card-cat">{product.categoryName}</span>
                        <h3 className="product-card-title">{product.name}</h3>
                        <div className="product-card-price-row">
                          <span className="current-price">{formatUZS(product.price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================== SHOPPING CART PAGE ==================== */}
        {route.page === 'cart' && (
          <div className="container cart-layout">
            <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '32px' }}>Savatcha</h1>
            
            {cart.length > 0 ? (
              <div className="cart-grid">
                
                {/* Items List */}
                <div className="cart-items-table">
                  <div className="cart-table-header">
                    <span>Mahsulot</span>
                    <span>Narx</span>
                    <span>Soni</span>
                    <span style={{ textAlign: 'right' }}>Jami</span>
                  </div>

                  {cart.map((item, idx) => (
                    <div key={idx} className="cart-item-row">
                      
                      <div className="cart-product-cell">
                        <img src={item.product.image} alt={item.product.name} className="cart-product-img" />
                        <div className="cart-product-info">
                          <h4>{item.product.name}</h4>
                          <div className="cart-product-meta">
                            {item.selectedSize && <span>O'lcham: {item.selectedSize}</span>}
                            {item.selectedColor && (
                              <span>
                                Rang: <span className="meta-color" style={{ backgroundColor: item.selectedColor }} />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="cart-price-cell">
                        {formatUZS(item.product.price)}
                      </div>

                      <div className="cart-qty-cell" style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className="quantity-control" style={{ transform: 'scale(0.85)' }}>
                          <button className="qty-btn" onClick={() => updateCartQty(idx, -1)}>-</button>
                          <span className="qty-val">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => updateCartQty(idx, 1)}>+</button>
                        </div>
                      </div>

                      <div className="cart-total-cell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
                        <span>{formatUZS(item.product.price * item.quantity)}</span>
                        
                        <button className="cart-remove-btn" onClick={() => removeFromCart(idx)}>
                          <Trash2 size={18} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Checkout summary */}
                <div className="summary-box" style={{ textAlign: 'left' }}>
                  <h3 className="summary-title">Buyurtma tafsiloti</h3>
                  
                  {/* Coupon section */}
                  <div className="promo-code-section">
                    <span style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Kupon kodini kiriting:</span>
                    <form className="promo-form" onSubmit={handleApplyCoupon}>
                      <input 
                        type="text" 
                        placeholder="Masalan: CHAMPION20" 
                        className="promo-input"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        disabled={!!appliedCoupon}
                      />
                      <button type="submit" className="promo-apply-btn" disabled={!!appliedCoupon}>
                        {appliedCoupon ? "Faol" : "Kiritish"}
                      </button>
                    </form>
                    {appliedCoupon && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>"{appliedCoupon}" kuponi kiritilgan!</span>
                        <button 
                          style={{ color: '#ef4444', fontSize: '11px', textDecoration: 'underline' }}
                          onClick={() => {
                            setAppliedCoupon('')
                            setDiscountPercent(0)
                            setCouponInput('')
                          }}
                        >
                          Bekor qilish
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="summary-rows">
                    <div className="summary-row">
                      <span>Subtotal (Jami tovarlar):</span>
                      <span>{formatUZS(cartSubtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="summary-row" style={{ color: '#ef4444' }}>
                        <span>Chegirma ({discountPercent * 100}%):</span>
                        <span>-{formatUZS(discountAmount)}</span>
                      </div>
                    )}
                    <div className="summary-row">
                      <span>Yetkazib berish:</span>
                      <span>{deliveryCost === 0 ? "Bepul" : formatUZS(deliveryCost)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Umumiy miqdor:</span>
                      <span>{formatUZS(cartTotal)}</span>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '16px' }}
                    onClick={() => {
                      setCheckoutStep(1)
                      navigateTo('checkout')
                    }}
                  >
                    Rasmiylashtirishga o'tish <ArrowRight size={18} />
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <a href="/products" className="nav-link" onClick={(e) => { e.preventDefault(); navigateTo('products') }} style={{ fontSize: '13px' }}>
                      Xaridni davom ettirish
                    </a>
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 0', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
                <ShoppingCart size={64} color="var(--text-muted)" style={{ marginBottom: '24px' }} />
                <h2>Savatchangiz bo'sh</h2>
                <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>UzBoy do'konidan eng sifatli mahsulotlarni qidirib ko'ring.</p>
                <button className="btn btn-primary" onClick={() => navigateTo('products')}>
                  Mahsulotlarni ko'rish
                </button>
              </div>
            )}

          </div>
        )}

        {/* ==================== CHECKOUT PAGE ==================== */}
        {route.page === 'checkout' && (
          <div className="container checkout-layout">
            
            {/* Checkout progress steps */}
            <div className="checkout-steps">
              <div className={`checkout-step ${checkoutStep >= 1 ? 'active' : ''} ${checkoutStep > 1 ? 'completed' : ''}`}>
                <span className="step-num">{checkoutStep > 1 ? <Check size={14} /> : "1"}</span>
                <span className="step-title">Yetkazib berish</span>
              </div>
              <div style={{ width: '40px', height: '2px', backgroundColor: checkoutStep > 1 ? '#10b981' : 'var(--border)', alignSelf: 'center' }}></div>
              <div className={`checkout-step ${checkoutStep >= 2 ? 'active' : ''} ${checkoutStep > 2 ? 'completed' : ''}`}>
                <span className="step-num">{checkoutStep > 2 ? <Check size={14} /> : "2"}</span>
                <span className="step-title">To'lov usuli</span>
              </div>
              <div style={{ width: '40px', height: '2px', backgroundColor: checkoutStep > 2 ? '#10b981' : 'var(--border)', alignSelf: 'center' }}></div>
              <div className={`checkout-step ${checkoutStep === 3 ? 'active' : ''}`}>
                <span className="step-num">3</span>
                <span className="step-title">Tasdiqlash</span>
              </div>
            </div>

            {checkoutStep < 3 ? (
              <div className="checkout-grid">
                
                {/* Left Side: Form Panels */}
                <form className="checkout-form-panel" onSubmit={handleCheckoutSubmit} style={{ textAlign: 'left' }}>
                  
                  {/* STEP 1: Shipping Info */}
                  {checkoutStep === 1 && (
                    <>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        Yetkazib berish ma'lumotlari
                      </h3>
                      
                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Ismingiz *</label>
                          <input 
                            type="text" 
                            placeholder="Masalan: Sardor" 
                            className="form-input"
                            required
                            value={shippingInfo.firstName}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Familiyangiz *</label>
                          <input 
                            type="text" 
                            placeholder="Masalan: Rashidov" 
                            className="form-input"
                            required
                            value={shippingInfo.lastName}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Telefon raqam *</label>
                          <input 
                            type="tel" 
                            placeholder="+998 (90) 123-45-67" 
                            className="form-input"
                            required
                            value={shippingInfo.phone}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Elektron pochta (Ixtiyoriy)</label>
                          <input 
                            type="email" 
                            placeholder="username@gmail.com" 
                            className="form-input"
                            value={shippingInfo.email}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Viloyat / Shahar *</label>
                          <select 
                            className="form-select"
                            value={shippingInfo.city}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                          >
                            <option value="Toshkent">Toshkent shahar</option>
                            <option value="Samarqand">Samarqand viloyati</option>
                            <option value="Buxoro">Buxoro viloyati</option>
                            <option value="Farg'ona">Farg'ona viloyati</option>
                            <option value="Andijon">Andijon viloyati</option>
                            <option value="Namangan">Namangan viloyati</option>
                            <option value="Xorazm">Xorazm viloyati</option>
                            <option value="Qashqadaryo">Qashqadaryo viloyati</option>
                            <option value="Qoraqalpog'iston">Qoraqalpog'iston Respublikasi</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Yetkazib berish turi</label>
                          <select 
                            className="form-select"
                            value={shippingInfo.deliveryMethod}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, deliveryMethod: e.target.value })}
                          >
                            <option value="standard">Standard yetkazib berish (30,000 UZS, 24-48 soat)</option>
                            <option value="express">Tezkor yetkazib berish (50,000 UZS, 3 soat ichida)</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>To'liq manzil (Ko'cha, uy, kvartira) *</label>
                        <input 
                          type="text" 
                          placeholder="Chilonzor tumani, 9-kvartal, 14-uy, 28-xonadon" 
                          className="form-input"
                          required
                          value={shippingInfo.address}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Qo'shimcha ma'lumot / Izoh</label>
                        <textarea 
                          rows="3"
                          placeholder="Kuryer uchun qo'shimcha ko'rsatmalar yoki buyurtma bo'yicha maxsus izoh..." 
                          className="form-input"
                          style={{ resize: 'vertical' }}
                          value={shippingInfo.notes}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => navigateTo('cart')}>
                          Savatga qaytish
                        </button>
                        <button type="submit" className="btn btn-primary">
                          To'lovga o'tish <ArrowRight size={16} />
                        </button>
                      </div>
                    </>
                  )}

                  {/* STEP 2: Payment */}
                  {checkoutStep === 2 && (
                    <>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        To'lov turini tanlang
                      </h3>

                      <div className="payment-methods-grid">
                        {[
                          { id: 'click', name: 'Click' },
                          { id: 'payme', name: 'Payme' },
                          { id: 'card', name: 'Plastik karta' },
                          { id: 'cash', name: 'Naqd pul (kuryerga)' }
                        ].map(pay => (
                          <div 
                            key={pay.id} 
                            className={`payment-method-card ${paymentInfo.method === pay.id ? 'active' : ''}`}
                            onClick={() => setPaymentInfo({ ...paymentInfo, method: pay.id })}
                          >
                            {pay.name}
                          </div>
                        ))}
                      </div>

                      {/* Card fields */}
                      {paymentInfo.method === 'card' && (
                        <div style={{ marginTop: '16px' }}>
                          <div className="card-mockup-wrapper">
                            <div className="card-mockup">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '18px', letterSpacing: '1px' }}>CHAMPION CARD</span>
                                <div className="card-chip"></div>
                              </div>
                              
                              <div className="card-number">
                                {paymentInfo.cardNumber ? paymentInfo.cardNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                              </div>

                              <div className="card-bottom">
                                <div className="card-holder">
                                  <div style={{ fontSize: '9px', opacity: 0.6 }}>Karta egasi</div>
                                  <div style={{ fontWeight: '600' }}>{paymentInfo.cardName || 'ISMI SHARIFI'}</div>
                                </div>
                                <div className="card-expiry">
                                  <div style={{ fontSize: '9px', opacity: 0.6 }}>Muddati</div>
                                  <div style={{ fontWeight: '600' }}>{paymentInfo.cardExpiry || 'MM/YY'}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label>Karta raqami *</label>
                            <input 
                              type="text" 
                              placeholder="8600 1234 5678 9012" 
                              maxLength="16"
                              className="form-input"
                              value={paymentInfo.cardNumber}
                              onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value.replace(/\D/g, '') })}
                              required
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label>Karta egasining ismi (lotin harflarida) *</label>
                            <input 
                              type="text" 
                              placeholder="SARDOR RASHIDOV" 
                              className="form-input"
                              value={paymentInfo.cardName}
                              onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value.toUpperCase() })}
                              required
                            />
                          </div>

                          <div className="form-group-row">
                            <div className="form-group">
                              <label>Amal qilish muddati *</label>
                              <input 
                                type="text" 
                                placeholder="12/28" 
                                maxLength="5"
                                className="form-input"
                                value={paymentInfo.cardExpiry}
                                onChange={(e) => setPaymentInfo({ ...paymentInfo, cardExpiry: e.target.value })}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>CVV / CVV2 *</label>
                              <input 
                                type="password" 
                                placeholder="•••" 
                                maxLength="3"
                                className="form-input"
                                value={paymentInfo.cardCvv}
                                onChange={(e) => setPaymentInfo({ ...paymentInfo, cardCvv: e.target.value.replace(/\D/g, '') })}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Info for Cash */}
                      {paymentInfo.method === 'cash' && (
                        <div style={{ padding: '16px', backgroundColor: 'var(--primary-light)', borderLeft: '4px solid var(--primary)', borderRadius: '4px', fontSize: '14px' }}>
                          Buyurtma uyingizga yetkazib berilganda kuryerga naqd pulda yoki tovarlar sifatini tekshirganingizdan so'ng to'lashingiz mumkin.
                        </div>
                      )}

                      {/* Info for Click / Payme */}
                      {(paymentInfo.method === 'click' || paymentInfo.method === 'payme') && (
                        <div style={{ padding: '16px', backgroundColor: 'var(--primary-light)', borderLeft: '4px solid var(--primary)', borderRadius: '4px', fontSize: '14px' }}>
                          "Buyurtma berish" tugmasini bosganingizdan so'ng, siz tanlangan to'lov tizimining havfsiz to'lov sahifasiga yo'naltirilasiz yoki telefoningizga to'lov so'rovi (USSD push) yuboriladi.
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setCheckoutStep(1)}>
                          Orqaga
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isOrdering}>
                          {isOrdering ? "Buyurtma berilmoqda..." : `Buyurtma berish (${formatUZS(cartTotal)})`}
                        </button>
                      </div>
                    </>
                  )}

                </form>

                {/* Right Side: Order summary checklist */}
                <div className="summary-box" style={{ textAlign: 'left' }}>
                  <h3 className="summary-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Savatchangiz</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                    {cart.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px' }}>
                        <img src={item.product.image} alt={item.product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div style={{ flexGrow: 1 }}>
                          <h4 style={{ fontWeight: '700', fontSize: '13px', lineHeight: '1.2' }}>{item.product.name}</h4>
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Razmer: {item.selectedSize} × {item.quantity} ta</span>
                        </div>
                        <span style={{ fontWeight: '700' }}>{formatUZS(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="summary-rows" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '13px' }}>
                    <div className="summary-row">
                      <span>Jami tovarlar:</span>
                      <span>{formatUZS(cartSubtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="summary-row" style={{ color: '#ef4444' }}>
                        <span>Chegirma ({discountPercent * 100}%):</span>
                        <span>-{formatUZS(discountAmount)}</span>
                      </div>
                    )}
                    <div className="summary-row">
                      <span>Yetkazib berish turi:</span>
                      <span>{shippingInfo.deliveryMethod === 'express' ? "Express (50,000 UZS)" : "Standard (30,000 UZS)"}</span>
                    </div>
                    <div className="summary-row">
                      <span>Manzil:</span>
                      <span style={{ maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'right' }}>
                        {shippingInfo.city}, {shippingInfo.address || '—'}
                      </span>
                    </div>
                    <div className="summary-row total" style={{ fontSize: '16px' }}>
                      <span>Jami to'lov:</span>
                      <span>{formatUZS(cartTotal)}</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              
              /* STEP 3: Order Success confirmation */
              <div className="success-panel">
                <div className="success-icon-wrapper">
                  <Check size={40} strokeWidth={3} />
                </div>
                
                <h2 className="success-title">Buyurtmangiz Qabul Qilindi!</h2>
                <p className="success-desc">
                  Hurmatli <strong>{shippingInfo.firstName} {shippingInfo.lastName}</strong>, xaridingiz uchun tashakkur! <br />
                  Sizning buyurtma raqamingiz: <strong>{orderNumber}</strong>. <br />
                  Tez orada operatorlarimiz telefon raqamingiz (<strong>{shippingInfo.phone}</strong>) orqali aloqaga chiqishadi va buyurtmani tasdiqlashadi.
                </p>

                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', width: '100%', backgroundColor: 'var(--bg-main)', textAlign: 'left', fontSize: '14px' }}>
                  <div style={{ fontWeight: 'bold', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '8px' }}>
                    Yuboriladigan manzil:
                  </div>
                  <div>Shahar: {shippingInfo.city}</div>
                  <div>Manzil: {shippingInfo.address}</div>
                  <div style={{ marginTop: '8px' }}>Yetkazib berish muddati: {shippingInfo.deliveryMethod === 'express' ? '3 soat ichida' : '24-48 soat ichida'}</div>
                </div>

                <button className="btn btn-primary" onClick={() => navigateTo('home')}>
                  Bosh sahifaga qaytish
                </button>
              </div>

            )}

          </div>
        )}

        {/* ==================== WISHLIST PAGE ==================== */}
        {route.page === 'wishlist' && (
          <div className="container wishlist-layout">
            <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '32px' }}>Sevimlilar ro'yxati</h1>

            {wishlistProducts.length > 0 ? (
              <div className="products-grid">
                {wishlistProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="product-card"
                    onClick={() => navigateTo('product-detail', product.id)}
                  >
                    <div className="product-card-img-wrapper">
                      <button 
                        className="product-card-wishlist active"
                        onClick={(e) => toggleWishlist(product.id, e)}
                      >
                        <Heart size={18} style={{ fill: '#ef4444' }} />
                      </button>
                      <img src={product.image} alt={product.name} className="product-card-img" />
                    </div>

                    <div className="product-card-info">
                      <span className="product-card-cat">{product.categoryName}</span>
                      <h3 className="product-card-title">{product.name}</h3>
                      
                      <div className="product-card-rating">
                        <Star size={14} className="star-icon" />
                        <span>{product.rating}</span>
                      </div>

                      <div className="product-card-price-row">
                        <span className="current-price">{formatUZS(product.price)}</span>
                        
                        <button 
                          className="product-add-btn"
                          onClick={(e) => addToCart(product, product.sizes[0], product.colors[0], 1, e)}
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="wishlist-empty">
                <Heart size={64} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                <h2>Sevimlilar ro'yxati bo'sh</h2>
                <p style={{ color: 'var(--text-muted)' }}>O'zingizga yoqqan tovarlarni yurakcha tugmasini bosib shu yerda saqlang.</p>
                <button className="btn btn-primary" onClick={() => navigateTo('products')}>
                  Mahsulotlarni ko'rish
                </button>
              </div>
            )}

          </div>
        )}

        {/* ==================== ABOUT US PAGE ==================== */}
        {route.page === 'about' && (
          <div className="container" style={{ paddingBottom: '80px' }}>
            <div className="about-hero">
              <h1 className="section-title">Biz Haqimizda</h1>
              <p className="section-desc">UzBoy — O'zbekistondagi professional sport anjomlari va kiyimlari do'koni</p>
            </div>

            <div className="about-grid" style={{ textAlign: 'left' }}>
              <div>
                <h2 style={{ fontSize: '28px', marginBottom: '16px', fontWeight: 'bold' }}>Tariximiz va maqsadlarimiz</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Biz 2020-yildan buyon mamlakatimiz sportchilariga eng mukammal sport kiyimlari va jihozlarini yetkazib berib kelmoqdamiz. Maqsadimiz — har bir yosh va professional sportchining o'z salohiyatini yuzaga chiqarishiga yordam berishdir.
                </p>
                <p style={{ color: 'var(--text-muted)' }}>
                  Do'konimizda faqatgina jahon miqyosidagi rasmiy va sertifikatlangan brendlar mahsulotlari taqdim etiladi. Biz mijozlarga faqat sifatni taklif qilamiz va tovarlarning originalligiga 100% kafolat beramiz.
                </p>
              </div>
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80" 
                  alt="Sport Gym" 
                  style={{ borderRadius: 'var(--radius-md)', width: '100%', height: '300px', objectFit: 'cover' }}
                />
              </div>
            </div>

            <div className="about-features">
              <div className="about-feature-card">
                <ShieldCheck size={36} color="var(--primary)" style={{ margin: '0 auto' }} />
                <h3>Kafolatlangan sifat</h3>
                <p>Jahon tan olgan brendlarning 100% original tovarlari</p>
              </div>
              <div className="about-feature-card">
                <Truck size={36} color="var(--primary)" style={{ margin: '0 auto' }} />
                <h3>Tezkor yetkazib berish</h3>
                <p>O'zbekistonning barcha viloyatlariga kurerlik xizmati</p>
              </div>
              <div className="about-feature-card">
                <RefreshCw size={36} color="var(--primary)" style={{ margin: '0 auto' }} />
                <h3>Oson qaytarish</h3>
                <p>14 kun ichida tovarni almashtirish yoki qaytarish imkoni</p>
              </div>
            </div>

          </div>
        )}

        {/* ==================== CONTACT PAGE ==================== */}
        {route.page === 'contact' && (
          <div className="container" style={{ padding: '40px 24px' }}>
            <h1 className="section-title">Aloqa va manzillarimiz</h1>
            <p className="section-desc">Biz bilan bog'laning, savollaringiz bo'lsa javob berishdan mamnunmiz</p>

            <div className="contact-grid" style={{ textAlign: 'left' }}>
              
              {/* Contact details */}
              <div className="contact-info-panel">
                
                <div className="contact-item">
                  <div className="contact-icon-box">
                    <MapPin size={20} />
                  </div>
                  <div className="contact-item-text">
                    <h4>Manzilimiz</h4>
                    <p>Toshkent shahar, Chilonzor tumani, Bunyodkor ko'chasi 42-uy</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon-box">
                    <Phone size={20} />
                  </div>
                  <div className="contact-item-text">
                    <h4>Telefon raqamlar</h4>
                    <p>+998 (71) 200-45-45 <br />+998 (99) 880-45-45</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon-box">
                    <Mail size={20} />
                  </div>
                  <div className="contact-item-text">
                    <h4>Elektron pochta</h4>
                    <p>info@champion.uz <br />support@champion.uz</p>
                  </div>
                </div>

                {/* Mock Visual Map */}
                <div className="mock-map">
                  <div className="mock-map-bg"></div>
                  <div className="mock-map-pin">
                    <MapPin size={32} style={{ fill: 'var(--primary)', color: 'white' }} />
                    <span>ChampionUz Do'koni</span>
                  </div>
                </div>

              </div>

              {/* Contact message Form */}
              <div className="checkout-form-panel">
                <h3 style={{ fontSize: '20px', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '12px' }}>
                  Xabar yuborish
                </h3>
                
                <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label>Ismingiz *</label>
                    <input 
                      type="text" 
                      placeholder="Ismingizni kiriting" 
                      className="form-input"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Telefon raqamingiz *</label>
                    <input 
                      type="tel" 
                      placeholder="+998 (90) 123-45-67" 
                      className="form-input"
                      required
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Xabaringiz matni *</label>
                    <textarea 
                      rows="4" 
                      placeholder="Savolingiz yoki fikringizni yozib qoldiring..." 
                      className="form-input"
                      style={{ resize: 'vertical' }}
                      required
                      value={contactForm.msg}
                      onChange={(e) => setContactForm({ ...contactForm, msg: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Yuborish <Send size={16} />
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* ==================== ADMIN PANEL PAGE ==================== */}
        {route.page === 'admin' && (
          <div className="container" style={{ padding: '48px 24px 80px' }}>
            {!isAdminAuthenticated ? (
              /* ADMIN LOGIN BOX */
              <div className="checkout-form-panel" style={{ maxWidth: '400px', margin: '64px auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px' }}>
                <div style={{ display: 'inline-flex', alignSelf: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Tizimga kirish</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Ushbu bo'lim faqat administratorlar uchun. Iltimos, parolni kiriting:</p>
                </div>
                <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Parol" 
                      className="form-input" 
                      style={{ paddingRight: '72px' }}
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Yashirish" : "Ko'rish"}
                    </button>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Kirish
                  </button>
                </form>
              </div>
            ) : (
              /* ACTUAL ADMIN CONTENT */
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '32px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '4px', fontSize: '32px' }}>UzBoy Admin Paneli</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Mahsulotlarni tahrirlash, yangilarini qo'shish va buyurtmalarni nazorat qilish bo'limi.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      className={`btn ${adminTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '10px 20px', fontSize: '14px' }}
                      onClick={() => setAdminTab('orders')}
                    >
                      Buyurtmalar ({orders.length})
                    </button>
                    <button 
                      className={`btn ${adminTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '10px 20px', fontSize: '14px' }}
                      onClick={() => setAdminTab('products')}
                    >
                      Mahsulotlar ({products.length})
                    </button>
                    <button 
                      className={`btn ${adminTab === 'add-product' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '10px 20px', fontSize: '14px' }}
                      onClick={() => setAdminTab('add-product')}
                    >
                      Yangi Mahsulot
                    </button>
                    <button 
                      className="btn btn-secondary"
                      style={{ padding: '10px 20px', fontSize: '14px', color: '#ef4444', borderColor: '#fca5a5' }}
                      onClick={handleAdminLogout}
                    >
                      Chiqish
                    </button>
                  </div>
                </div>

                {/* TAB 1: Kelib tushgan buyurtmalar */}
                {adminTab === 'orders' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', textAlign: 'left' }}>Mijozlar buyurtmalari</h3>
                    {orders.length > 0 ? (
                      orders.map(order => (
                        <div 
                          key={order.id} 
                          className="checkout-form-panel" 
                          style={{ borderLeft: order.status === 'Yangi' ? '6px solid var(--primary)' : order.status === 'Yetkazilmoqda' ? '6px solid #3498db' : '6px solid #10b981', display: 'flex', flexDirection: 'column', gap: '20px' }}
                        >
                          {/* Header row of order card */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                            <div style={{ textAlign: 'left' }}>
                              <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--primary)', fontFamily: 'var(--font-title)' }}>{order.id}</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '12px' }}>{order.date}</span>
                              <div style={{ marginTop: '4px', fontSize: '14px', fontWeight: '600' }}>
                                Mijoz: {order.customer.firstName} {order.customer.lastName} ({order.customer.phone})
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '700' }}>Status:</span>
                              <select 
                                className="form-select"
                                style={{ padding: '6px 12px', fontSize: '13px', width: 'auto' }}
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              >
                                <option value="Yangi">Yangi</option>
                                <option value="Yetkazilmoqda">Yetkazilmoqda</option>
                                <option value="Bajarildi">Bajarildi</option>
                              </select>
                              <button 
                                className="cart-remove-btn" 
                                style={{ padding: '6px', color: '#ef4444' }}
                                onClick={() => handleDeleteOrder(order.id)}
                                title="O'chirish"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Content: Details & Items */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', textAlign: 'left' }}>
                            {/* Items list */}
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Sotib olingan tovarlar:</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {order.items.map((item, idx) => (
                                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                    <div style={{ flexGrow: 1 }}>
                                      <h5 style={{ fontWeight: '700' }}>{item.name}</h5>
                                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                                        {item.selectedSize && `O'lcham: ${item.selectedSize}`} 
                                        {item.selectedColor && ` | Rang: `}
                                        {item.selectedColor && <span className="meta-color" style={{ backgroundColor: item.selectedColor }} />}
                                        {` | ${item.quantity} ta`}
                                      </span>
                                    </div>
                                    <span style={{ fontWeight: '700' }}>{formatUZS(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Customer details */}
                            <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '24px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>Yetkazish tafsilotlari:</h4>
                              <div><strong>Manzil:</strong> {order.customer.city}, {order.customer.address}</div>
                              {order.customer.email && <div><strong>Email:</strong> {order.customer.email}</div>}
                              <div><strong>Yetkazish turi:</strong> {order.deliveryMethod === 'express' ? "Tezkor (3 soat)" : "Standard (24-48 soat)"}</div>
                              <div><strong>To'lov usuli:</strong> {order.paymentMethod.toUpperCase()}</div>
                              
                              {/* Display Notes / Additional Info */}
                              <div style={{ marginTop: '8px', padding: '10px', backgroundColor: 'var(--bg-main)', borderRadius: '6px', borderLeft: '3px solid var(--primary)' }}>
                                <strong>Qo'shimcha ma'lumot / Izoh:</strong> <br />
                                <span style={{ fontStyle: 'italic', color: order.customer.notes ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                  {order.customer.notes || "Qo'shimcha izoh qoldirilmagan."}
                                </span>
                              </div>

                              <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '15px' }}>
                                <span>Jami to'lov:</span>
                                <span style={{ color: 'var(--primary)' }}>{formatUZS(order.total)}</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '64px 0', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                        <ShoppingCart size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                        <h3>Hozircha buyurtmalar yo'q</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Mijozlar buyurtma berganda bu yerda paydo bo'ladi.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Mavjud mahsulotlar ro'yxati */}
                {adminTab === 'products' && (
                  <div style={{ textAlign: 'left' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Do'kondagi mahsulotlar katalogi</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                      {products.map(product => (
                        <div key={product.id} className="product-card" style={{ padding: '12px' }}>
                          <img src={product.image} alt={product.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                          <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>{product.categoryName}</span>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.name}</h4>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>{formatUZS(product.price)}</span>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '8px', fontSize: '12px', color: '#ef4444', borderColor: '#fca5a5', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 size={14} /> O'chirish
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: Yangi mahsulot qo'shish formasi */}
                {adminTab === 'add-product' && (
                  <div className="checkout-form-panel" style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
                      Yangi sport tovari qo'shish
                    </h3>
                    
                    <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="form-group">
                        <label>Mahsulot nomi *</label>
                        <input 
                          type="text" 
                          placeholder="Masalan: Nike Air Max Sport" 
                          className="form-input"
                          required
                          value={newProductForm.name}
                          onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                        />
                      </div>

                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Kategoriya *</label>
                          <select 
                            className="form-select"
                            value={newProductForm.category}
                            onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                          >
                            <option value="football">Futbol</option>
                            <option value="running">Yugurish</option>
                            <option value="fitness">Fitness va Zal</option>
                            <option value="basketball">Basketbol</option>
                            <option value="accessories">Aksessuarlar</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Brend *</label>
                          <input 
                            type="text" 
                            placeholder="Masalan: Nike, Adidas, Puma" 
                            className="form-input"
                            required
                            value={newProductForm.brand}
                            onChange={(e) => setNewProductForm({ ...newProductForm, brand: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Sotilish narxi (UZS) *</label>
                          <input 
                            type="number" 
                            placeholder="Masalan: 1200000" 
                            className="form-input"
                            required
                            value={newProductForm.price}
                            onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Asl narxi (Chegirma uchun - UZS)</label>
                          <input 
                            type="number" 
                            placeholder="Masalan: 1500000" 
                            className="form-input"
                            value={newProductForm.originalPrice}
                            onChange={(e) => setNewProductForm({ ...newProductForm, originalPrice: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Rasm URL manzili</label>
                        <input 
                          type="url" 
                          placeholder="https://images.unsplash.com/..." 
                          className="form-input"
                          value={newProductForm.image}
                          onChange={(e) => setNewProductForm({ ...newProductForm, image: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Tavsif (Mahsulot haqida batafsil ma'lumot) *</label>
                        <textarea 
                          rows="4" 
                          placeholder="Mahsulotning qulayligi, materiallari va texnologiyalari haqida batafsil yozing..." 
                          className="form-input"
                          style={{ resize: 'vertical' }}
                          required
                          value={newProductForm.description}
                          onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                        />
                      </div>

                      <div className="form-group-row">
                        <div className="form-group">
                          <label>O'lchamlar (vergul bilan ajrating)</label>
                          <input 
                            type="text" 
                            placeholder="40, 41, 42, 43" 
                            className="form-input"
                            value={newProductForm.sizes}
                            onChange={(e) => setNewProductForm({ ...newProductForm, sizes: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Ranglar (vergul bilan Hex yoki nomlar)</label>
                          <input 
                            type="text" 
                            placeholder="#e11d48, #000000, #ffffff" 
                            className="form-input"
                            value={newProductForm.colors}
                            onChange={(e) => setNewProductForm({ ...newProductForm, colors: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Texnik xususiyatlar (Format: Kalit: Qiymat, Kalit: Qiymat)</label>
                        <input 
                          type="text" 
                          placeholder="Ishlab chiqaruvchi: Nike, Og'irligi: 300 gramm, Texnologiya: Air Zoom" 
                          className="form-input"
                          value={newProductForm.specs}
                          onChange={(e) => setNewProductForm({ ...newProductForm, specs: e.target.value })}
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                        Tovarni saqlash
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </main>

      {/* --- FOOTER --- */}
      <footer className="main-footer">
        <div className="container">
          
          <div className="footer-grid" style={{ textAlign: 'left' }}>
            
            {/* Col 1 */}
            <div>
              <div className="footer-logo">
                <Trophy size={26} color="var(--primary)" />
                UZ<span>BOY</span>
              </div>
              <p className="footer-about-text">
                Professional sport kiyimlari, poyabzallari va jihozlarining O'zbekistondagi eng yirik onlayn do'koni. Biz sizning g'alabangiz uchun xizmat qilamiz!
              </p>
              <div className="footer-socials">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer-social-btn">F</a>
                <a href="https://t.me" target="_blank" rel="noreferrer" className="footer-social-btn">T</a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-social-btn">I</a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="footer-social-btn">Y</a>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="footer-col-title">Tezkor havolalar</h4>
              <ul className="footer-links">
                <li><a href="/home" onClick={(e) => { e.preventDefault(); navigateTo('home') }}>Bosh sahifa</a></li>
                <li><a href="/products" onClick={(e) => { e.preventDefault(); navigateTo('products') }}>Barcha mahsulotlar</a></li>
                <li><a href="/about" onClick={(e) => { e.preventDefault(); navigateTo('about') }}>Biz haqimizda</a></li>
                <li><a href="/contact" onClick={(e) => { e.preventDefault(); navigateTo('contact') }}>Aloqa va manzillar</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="footer-col-title">Kategoriyalar</h4>
              <ul className="footer-links">
                <li><a href="/products" onClick={(e) => { e.preventDefault(); setSelectedShopCategory('football'); navigateTo('products'); }}>Futbol</a></li>
                <li><a href="/products" onClick={(e) => { e.preventDefault(); setSelectedShopCategory('running'); navigateTo('products'); }}>Yugurish</a></li>
                <li><a href="/products" onClick={(e) => { e.preventDefault(); setSelectedShopCategory('fitness'); navigateTo('products'); }}>Fitness va Zal</a></li>
                <li><a href="/products" onClick={(e) => { e.preventDefault(); setSelectedShopCategory('basketball'); navigateTo('products'); }}>Basketbol</a></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="footer-col-title">Bog'lanish</h4>
              <div className="footer-contact-item">
                <MapPin size={16} className="footer-contact-icon" />
                <span>Bunyodkor ko'chasi 42-uy, Toshkent</span>
              </div>
              <div className="footer-contact-item">
                <Phone size={16} className="footer-contact-icon" />
                <span>+998 (71) 200-45-45</span>
              </div>
              <div className="footer-contact-item">
                <Mail size={16} className="footer-contact-icon" />
                <span>info@champion.uz</span>
              </div>
            </div>

          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} UzBoy. Barcha huquqlar himoyalangan.</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="/privacy" onClick={(e) => e.preventDefault()} style={{ hover: 'color: white' }}>Maxfiylik siyosati</a>
              <a href="/terms" onClick={(e) => e.preventDefault()}>Foydalanish shartlari</a>
            </div>
          </div>

        </div>
      </footer>

      {/* --- TOAST NOTIFICATIONS --- */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <Check size={18} className={`toast-icon ${toast.type}`} />
            <div className="toast-content">{toast.message}</div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default App
