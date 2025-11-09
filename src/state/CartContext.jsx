import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const CartCtx = createContext(null)

function readStorage() {
  try { return JSON.parse(localStorage.getItem('cart') || '[]') } catch { return [] }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStorage())
  const [prices, setPrices] = useState([])

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(items)) }, [items])

  async function refreshPrices() {
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
    const { data } = await axios.get(`${base}/api/prices`)
    setPrices(data)
  }

  useEffect(() => { refreshPrices() }, [])

  const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

  // Helper to fetch & return product details from DB
  async function fetchProductById(id) {
    try {
      const { data } = await axios.get(`${base}/api/products/${id}`)
      return data
    } catch (e) {
      console.error('Failed to fetch product for cart enrichment', id, e)
      return null
    }
  }

  // Helper to fetch box item by sku
  async function fetchBoxBySku(sku) {
    if (!sku) return null
    try {
      const { data } = await axios.get(`${base}/api/items/sku/${encodeURIComponent(sku)}`)
      return data
    } catch (e) {
      // ignore missing box
      return null
    }
  }

  // Enrich existing items on mount (so localStorage items are upgraded)
  useEffect(() => {
    let mounted = true
    async function enrichAll() {
      if (!items || items.length === 0) return
      const needs = items.filter(it => (
        it.making_charges_type === undefined ||
        it.making_charges_value === undefined ||
        it.purity === undefined
      ))
      if (needs.length === 0) return

      const updated = await Promise.all(items.map(async it => {
        if (it.making_charges_type !== undefined && it.purity !== undefined) return it
        const prod = await fetchProductById(it.id)
        if (!prod) return it
        let boxInfo = null
        if (prod.box_sku) boxInfo = await fetchBoxBySku(prod.box_sku)
        return {
          ...it,
          // preserve qty if present
          qty: it.qty || 1,
          // enrich fields from product record
          making_charges_type: prod.making_charges_type,
          making_charges_value: prod.making_charges_value,
          purity: prod.purity,
          metal_type: prod.metal_type || it.metal_type,
          weight: prod.weight || it.weight,
          box_rate: boxInfo?.rate ? Number(boxInfo.rate) : (it.box_rate || 0)
        }
      }))
      if (mounted) setItems(updated)
    }
    enrichAll()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount

  // Add item to cart. If item lacks making/purity/box info, we fetch product details and enrich before storing.
  async function add(item) {
    // item may come minimal (id, name, weight, qty, image_url)
    // we enrich it with product fields to ensure accurate totals
    let enriched = { ...item, qty: item.qty || 1 }

    // if critical fields missing, fetch from DB
    const missing = (
      enriched.making_charges_type === undefined ||
      enriched.making_charges_value === undefined ||
      enriched.purity === undefined ||
      enriched.metal_type === undefined
    )

    if (missing) {
      const prod = await fetchProductById(item.id)
      if (prod) {
        enriched = {
          ...enriched,
          // product origin fields: prefer fields from DB
          name: prod.name ?? enriched.name,
          weight: prod.weight ?? enriched.weight,
          metal_type: prod.metal_type ?? enriched.metal_type,
          purity: prod.purity ?? enriched.purity,
          making_charges_type: prod.making_charges_type ?? enriched.making_charges_type,
          making_charges_value: prod.making_charges_value ?? enriched.making_charges_value,
          box_sku: prod.box_sku ?? enriched.box_sku,
          sku: prod.sku ?? enriched.sku
        }

        // fetch box item if box_sku present to populate box_rate
        if (prod.box_sku) {
          const box = await fetchBoxBySku(prod.box_sku)
          if (box && box.rate !== undefined) enriched.box_rate = Number(box.rate)
        }
      }
    }

    setItems(prev => {
      const idx = prev.findIndex(p => p.id === enriched.id)
      if (idx >= 0) {
        // increment qty
        const copy = [...prev]
        copy[idx] = { ...copy[idx], qty: (copy[idx].qty || 1) + (enriched.qty || 1) }
        // also merge any newly enriched fields
        copy[idx] = { ...copy[idx], ...enriched }
        return copy
      }
      return [...prev, enriched]
    })
  }

  function remove(id) { setItems(prev => prev.filter(p => p.id !== id)) }
  function setQty(id, qty) { setItems(prev => prev.map(p => p.id === id ? { ...p, qty } : p)) }
  function clear() { setItems([]) }

  const totals = useMemo(() => {
    // helper: choose correct price key based on purity / metal_type
    const rateOf = (it) => {
      const purity = (it.purity || (it.metal_type === 'gold' ? '22K' : '999')).toString()
      const pickGoldKey = purity === '24K' ? 'gold_24k' : 'gold_22k'
      const metalKey = (it.metal_type === 'gold') ? pickGoldKey : 'silver'
      const e = prices.find(p => p.metal === metalKey)
      return e ? Number(e.rate_per_gram) : 0
    }

    let subtotal = 0, making = 0, boxCharges = 0
    for (const it of items) {
      const qty = it.qty || 1
      const weight = Number(it.weight || 0)

      // base metal price uses correct rate for this item's metal & purity
      const rate = rateOf(it)
      const base = weight * rate * qty
      subtotal += base

      // making: support percentage, per_gram, fixed
      let mk = 0
      const mtype = (it.making_charges_type || 'fixed').toString().toLowerCase()
      const mval = Number(it.making_charges_value || 0)

      if (mtype === 'percentage') {
        mk = (mval / 100) * base
      } else if (mtype === 'per_gram') {
        mk = mval * weight * qty
      } else { // fixed (or unknown) — treat mval as fixed per item if provided, otherwise fallback
        if (mval > 0) {
          // If fixed is expected to be per-piece, multiply by qty
          mk = mval * qty
        } else {
          // fallback consistent with your previous rule
          mk = Math.max(500, weight * 50) * qty
        }
      }

      making += mk

      // box charges — if item has box_rate use it (already enriched), otherwise 0
      const box = Number(it.box_rate || 0) * qty
      boxCharges += box
    }

    const preTax = subtotal + making + boxCharges
    const gst = preTax * 0.03
    // Shipping charges (0.5% for orders < ₹50,000)
    const shippingCharges = preTax < 50000 ? preTax * 0.005 : 0
    const total = preTax + gst + shippingCharges

    // Optionally return a mapping of rates used per metal type for UI
    const ratesMap = {}
    for (const p of prices) ratesMap[p.metal] = Number(p.rate_per_gram)

    return { subtotal, making, boxCharges, gst, shippingCharges, total, ratesMap }
  }, [items, prices])

  return (
    <CartCtx.Provider value={{ items, add, remove, setQty, clear, totals, prices, refreshPrices }}>
      {children}
    </CartCtx.Provider>
  )
}

export function useCart() { return useContext(CartCtx) }
