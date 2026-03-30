/**
 * Vercel serverless function: generate a full recipe from a dish name using Gemini.
 * POST /api/generate-recipe
 * Body: { name: string }
 * Returns: { name, time, difficulty, type, slots, ingredients, steps }
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  const { name = '' } = req.body || {};
  if (!name.trim()) return res.status(400).json({ error: 'Missing name' });

  const prompt = `Eres un chef español. Genera una receta completa para "${name}" pensada para el menú semanal de una familia española.

Devuelve SOLO JSON válido con este formato exacto (sin texto extra, sin bloques de código):
{
  "name": "nombre del plato en español",
  "time": 30,
  "difficulty": 2,
  "type": "verdura",
  "slots": ["segundo"],
  "ingredients": [
    {"amount": "200 g", "name": "pollo"},
    {"amount": "2 dientes", "name": "ajo"},
    {"amount": "", "name": "sal"}
  ],
  "steps": [
    "Paso 1 en 1-2 frases.",
    "Paso 2 en 1-2 frases."
  ]
}

Reglas:
- time: minutos totales de preparación + cocción (número entero)
- difficulty: 1 (fácil), 2 (normal) o 3 (difícil)
- type: exactamente uno de: "verdura", "pescado", "carne", "legumbre", "huevo", "fuera"
- slots: array con uno o más de: "primero", "segundo", "cena"
- ingredients: entre 4 y 12 ingredientes con amount en unidades estándar (g, kg, ml, l, ud, cdas, cdta, pizca, al gusto)
- steps: entre 3 y 6 pasos cortos y claros en español
- Todo en español`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: `Gemini API error: ${response.status}`, detail: err });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(502).json({ error: 'No JSON in response', raw: text });

    const recipe = JSON.parse(jsonMatch[0]);

    // Sanitize fields to match app expectations
    const VALID_TYPES = ['verdura', 'pescado', 'carne', 'legumbre', 'huevo', 'fuera'];
    const VALID_SLOTS = ['primero', 'segundo', 'cena'];
    recipe.type = VALID_TYPES.includes(recipe.type) ? recipe.type : 'verdura';
    recipe.slots = (recipe.slots || []).filter(s => VALID_SLOTS.includes(s));
    if (!recipe.slots.length) recipe.slots = ['segundo'];
    recipe.time = Math.max(5, Math.min(180, parseInt(recipe.time) || 30));
    recipe.difficulty = [1, 2, 3].includes(recipe.difficulty) ? recipe.difficulty : 2;
    recipe.ingredients = (recipe.ingredients || []).map((i, idx) => ({
      amount: String(i.amount || ''),
      name: String(i.name || ''),
      _id: idx,
    })).filter(i => i.name.trim());
    recipe.steps = (recipe.steps || []).map(s => String(s).trim()).filter(Boolean);

    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
