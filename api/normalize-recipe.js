/**
 * Vercel serverless function: normalise recipe data using Claude Haiku.
 * POST /api/normalize-recipe
 * Body: { name, ingredients: [{name, amount}], steps: [string] }
 * Returns: { ingredients: [{name, amount}], steps: [string] }
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

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

Responde SOLO con JSON válido, sin texto adicional, con este formato exacto:
{
  "ingredients": [{"amount": "...", "name": "..."}],
  "steps": ["...", "..."]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: `Anthropic API error: ${response.status}`, detail: err });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Extract JSON from the response (handle markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(502).json({ error: 'No JSON in response', raw: text });

    const normalized = JSON.parse(jsonMatch[0]);
    res.status(200).json(normalized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
