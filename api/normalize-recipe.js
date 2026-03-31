/**
 * Vercel serverless function: normalise recipe data using Google Gemini (free tier).
 * POST /api/normalize-recipe
 * Body: { name, ingredients: [{name, amount}], steps: [string] }
 * Returns: { ingredients: [{name, amount}], steps: [string] }
 *
 * Requires env var: GEMINI_API_KEY (free from https://aistudio.google.com)
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  const { name = '', ingredients = [], steps = [] } = req.body || {};

  const prompt = `Eres un asistente de cocina. Dado el nombre de una receta y sus datos crudos importados de internet, devuelve un JSON limpio y normalizado.

RECETA: "${name}"

INGREDIENTES CRUDOS:
${ingredients.map(i => `- ${i.amount ? i.amount + ' ' : ''}${i.name}`).join('\n')}

PASOS CRUDOS:
${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

INSTRUCCIONES:
1. Normaliza cada ingrediente al formato: cantidad + unidad estándar (g, kg, ml, l, ud, cdas, cdta, pizca, al gusto) + nombre del ingrediente en minúsculas. Ejemplo: "250 gr. de lentejas ya cocidas" → amount:"250 g" name:"lentejas cocidas".
2. Si no hay cantidad, deja amount:"" y pon el nombre limpio.
3. Condensa los pasos a máximo 5, en español, cada uno en 1-2 frases cortas y directas. Elimina redundancias.
4. No añadas ingredientes ni pasos que no estén en el original.

Responde SOLO con JSON válido, sin texto adicional ni bloques de código, con este formato exacto:
{"ingredients":[{"amount":"...","name":"..."}],"steps":["...","..."]}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
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

    const normalized = JSON.parse(jsonMatch[0]);
    res.status(200).json(normalized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
