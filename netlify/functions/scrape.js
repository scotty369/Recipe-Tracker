// netlify/functions/scrape.js
// Fetches a recipe page server-side and extracts Schema.org Recipe data

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let url
  try {
    const body = JSON.parse(event.body)
    url = body.url
    if (!url || !url.startsWith('http')) throw new Error('Invalid URL')
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Please provide a valid URL.' }) }
  }

  // Fetch the page
  let html
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RecipeTracker/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    html = await res.text()
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: `Could not fetch that page: ${e.message}` }) }
  }

  // Extract all JSON-LD blocks
  const jsonLdBlocks = []
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim())
      jsonLdBlocks.push(parsed)
    } catch {}
  }

  // Find the Recipe object (may be nested in @graph)
  function findRecipe(obj) {
    if (!obj) return null
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const found = findRecipe(item)
        if (found) return found
      }
      return null
    }
    const type = obj['@type']
    if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) return obj
    if (obj['@graph']) return findRecipe(obj['@graph'])
    return null
  }

  let recipe = null
  for (const block of jsonLdBlocks) {
    recipe = findRecipe(block)
    if (recipe) break
  }

  if (!recipe) {
    return {
      statusCode: 422, headers,
      body: JSON.stringify({ error: "Couldn't find a recipe on that page. The site may not support standard recipe markup." }),
    }
  }

  // ── Parse ingredients ──────────────────────────────────────────────────────
  function parseIngredients(raw) {
    if (!raw || !Array.isArray(raw)) return []
    return raw.map(line => {
      if (typeof line !== 'string') return { qty: '', name: String(line) }
      // Try to split "2 cups flour" → qty: "2 cups", name: "flour"
      const trimmed = line.trim()
      const m = trimmed.match(/^([\d¼½¾⅓⅔⅛⅜⅝⅞\/\-\s\.]+(?:cup|cups|tbsp|tsp|tablespoon|teaspoon|oz|ounce|lb|pound|g|gram|kg|ml|liter|l|pinch|dash|handful|slice|slices|can|cans|clove|cloves|piece|pieces|large|medium|small|inch)?s?\.?)\s+(.+)/i)
      if (m) return { qty: m[1].trim(), name: m[2].trim() }
      return { qty: '', name: trimmed }
    })
  }

  // ── Parse instructions ─────────────────────────────────────────────────────
  function parseInstructions(raw) {
    if (!raw) return ''
    if (typeof raw === 'string') return raw.replace(/<[^>]+>/g, '').trim()
    if (Array.isArray(raw)) {
      return raw.map((step, i) => {
        if (typeof step === 'string') return `${i + 1}. ${step.replace(/<[^>]+>/g, '').trim()}`
        if (step.text) return `${i + 1}. ${step.text.replace(/<[^>]+>/g, '').trim()}`
        if (step.itemListElement) {
          return step.itemListElement.map((s, j) => `${j + 1}. ${(s.text || '').replace(/<[^>]+>/g, '').trim()}`).join('\n')
        }
        return ''
      }).filter(Boolean).join('\n')
    }
    return ''
  }

  // ── Parse duration strings like "PT30M", "PT1H30M" ────────────────────────
  function parseDuration(iso) {
    if (!iso || typeof iso !== 'string') return ''
    const h = iso.match(/(\d+)H/)?.[1]
    const m = iso.match(/(\d+)M/)?.[1]
    if (h && m) return `${h} hr ${m} min`
    if (h) return `${h} hr`
    if (m) return `${m} min`
    return ''
  }

  // ── Build total time ───────────────────────────────────────────────────────
  function totalTime(r) {
    return parseDuration(r.totalTime) || parseDuration(r.cookTime) || ''
  }

  const result = {
    title: recipe.name || '',
    ingredients: parseIngredients(recipe.recipeIngredient),
    instructions: parseInstructions(recipe.recipeInstructions),
    servings: String(recipe.recipeYield || recipe.yield || '').replace(/\D+$/, '').trim() || '',
    time: totalTime(recipe),
    notes: recipe.description ? recipe.description.replace(/<[^>]+>/g, '').slice(0, 300) : '',
    sourceUrl: url,
  }

  return { statusCode: 200, headers, body: JSON.stringify(result) }
}
