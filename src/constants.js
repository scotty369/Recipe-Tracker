export const CATEGORIES = [
  {
    id: 'breakfast', label: 'Breakfast', icon: '🍳',
    subs: ['Eggs & Omelets', 'Pancakes & Waffles', 'Smoothies & Bowls', 'Muffins & Quick Breads', 'Cereals & Oats', 'Other Breakfast'],
  },
  {
    id: 'lunch', label: 'Lunch', icon: '🥗',
    subs: ['Sandwiches & Wraps', 'Salads', 'Soups & Chili', 'Grain Bowls', 'Light Bites', 'Other Lunch'],
  },
  {
    id: 'dinner', label: 'Dinner', icon: '🍽️',
    subs: ['Pasta & Noodles', 'Steak & Chops', 'Seafood', 'Stews & Braises', 'Stir-Fry', 'Roasts', 'Casseroles', 'Other Dinner'],
  },
  {
    id: 'bbq', label: 'BBQ & Grilling', icon: '🔥',
    subs: ['Burgers & Hot Dogs', 'Ribs & Brisket', 'Grilled Chicken', 'Grilled Seafood', 'Veggie Grilling', 'Sides & Sauces'],
  },
  {
    id: 'world', label: 'World Cuisine', icon: '🌍',
    subs: ['Mexican & Tex-Mex', 'Italian', 'Asian', 'Middle Eastern', 'Indian', 'French', 'Greek & Mediterranean', 'Other International'],
  },
  {
    id: 'baking', label: 'Baked Goods', icon: '🧁',
    subs: ['Cakes & Cupcakes', 'Cookies & Bars', 'Pies & Tarts', 'Breads & Rolls', 'Savory Pastry', 'Other Baking'],
  },
  {
    id: 'desserts', label: 'Desserts', icon: '🍰',
    subs: ['Frozen Treats', 'Puddings & Custards', 'Candy & Chocolate', 'Fruit Desserts', 'No-Bake Desserts', 'Other Desserts'],
  },
  {
    id: 'drinks', label: 'Drinks', icon: '🥤',
    subs: ['Cocktails', 'Mocktails & Juices', 'Hot Drinks', 'Smoothies', 'Other Drinks'],
  },
  {
    id: 'sides', label: 'Sides & Sauces', icon: '🫙',
    subs: ['Salads & Slaws', 'Dips & Spreads', 'Pickles & Ferments', 'Sauces & Gravies', 'Roasted Veggies', 'Other Sides'],
  },
]

export const DIFFICULTY = ['Easy', 'Medium', 'Advanced']

export const TAGS = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free',
  'kid-friendly', 'quick', 'make-ahead', 'spicy',
  'comfort food', 'healthy',
]

export const EMOJIS = [
  '🍳','🥞','🧇','🥗','🥙','🌮','🌯','🥘','🍲','🫕',
  '🍛','🍜','🍝','🍣','🍱','🥩','🥓','🔥','🍕','🥚',
  '🧆','🧈','🧁','🎂','🍰','🥧','🍪','🍩','🍦','🍷',
  '🥤','☕','🫖','🥣','🫙','📄',
]

export function getCatLabel(catId) {
  return CATEGORIES.find(c => c.id === catId)?.label || catId
}

export function getCatIcon(catId) {
  return CATEGORIES.find(c => c.id === catId)?.icon || '📄'
}
