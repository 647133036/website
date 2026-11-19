export const PRODUCTS = [
  {
    id: 'bundle-pd',
    name: 'Complete PD Bundle',
    price: 143.18,
    compare: null,
    category: 'bundle',
    tone: 'green',
    formula: 'Mucuna pruriens HPLC std + BF12',
    meta: 'Day + Night + Routine, 60-day supply',
    badge: 'Best value',
    variants: [
      { id: 'single', label: 'One-off', delta: 0 },
      { id: 'sub', label: 'Subscribe & save', delta: -10, note: 'Save £10 + free shipping' }
    ]
  },
  {
    id: 'starter',
    name: 'Day + Night Starter Pack',
    price: 70.18,
    compare: 70,
    category: 'bundle',
    tone: 'green',
    formula: 'Mucuna pruriens HPLC std + BF12',
    meta: 'Start your on-and-on routine',
    badge: 'New',
    variants: [
      { id: 'single', label: 'One-off', delta: 0 },
      { id: 'sub', label: 'Subscribe & save', delta: -5, note: 'Free shipping' }
    ]
  },
  {
    id: 'macudopa-day',
    name: 'MacuDopa Day',
    price: 35.0,
    compare: null,
    category: 'day',
    tone: 'orange',
    formula: 'Mucuna pruriens HPLC std + BF12',
    meta: 'Daytime, fast-acting dopaminergic support',
    badge: null,
    variants: [
      { id: '30', label: '30 capsules', delta: 0 },
      { id: '60', label: '60 capsules', delta: 20 },
      { id: 'sub', label: 'Subscribe & save', delta: -4, note: '10% off + free shipping' }
    ]
  },
  {
    id: 'macudopa-night',
    name: 'MacuDopa Night',
    price: 35.0,
    compare: null,
    category: 'night',
    tone: 'purple',
    formula: 'Mucuna pruriens HPLC std + BF12',
    meta: 'Overnight, smooths the morning off-period',
    badge: 'Coming soon',
    variants: [
      { id: '30', label: '30 capsules', delta: 0 },
      { id: '60', label: '60 capsules', delta: 20 },
      { id: 'sub', label: 'Subscribe & save', delta: -4, note: '10% off + free shipping' }
    ]
  }
];

export function byId(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

export function productPrice(p, variant) {
  const base = p.price;
  const delta = variant && p.variants ? (p.variants.find((v) => v.id === variant.id)?.delta || 0) : 0;
  return +(base + delta).toFixed(2);
}
