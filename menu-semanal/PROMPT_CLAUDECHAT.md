# 🍽️ Menú Semanal — Traspaso de desarrollo a Claude chat

## Contexto del proyecto

Soy Eduardo. Estoy desarrollando una **app web de planificación de menú semanal** en React. Necesito tu ayuda para aplicar un template de Figma a la interfaz visual de la app.

**URL del template de Figma:**  
https://www.figma.com/community/file/1103368288888925886

---

## Stack técnico

- **Framework:** React 19 + Vite 8
- **Estructura:** Single Page Application, **un único fichero** `src/menu-semanal-local.jsx` (≈1535 líneas)
- **Estilos:** Todo el CSS está dentro del componente en un bloque `<style>` al final, más estilos inline en algunos componentes
- **Persistencia:** localStorage
- **PWA:** manifest.json + service worker (sw.js)
- **Iconos:** librería `lucide-react`
- **Ruta del proyecto:** `C:\Users\zetou\Documents\Proyectos\menuweb\menu-semanal`
- **Dev server:** `npm run dev -- --host` (para ver en móvil)
- **Build (solo en Windows):** `npm run build` (no funciona en Linux por binarios nativos)

---

## Funcionalidades actuales de la app

La app tiene **4 secciones** (tabs):

1. **Pizarra (board)** — Cuadrícula 7 días × 3 slots (1er Plato, 2do Plato, Cena). Tarjetas "post-it" para asignar recetas a cada slot.
2. **Recetas** — Gestión del recetario: buscar, filtrar, crear, editar, favoritos.
3. **Historial** — Estadísticas: ranking de recetas más usadas, semanas guardadas navegables.
4. **Compra** — Lista de la compra auto-generada a partir del menú actual, con check/uncheck, copiar y enviar por WhatsApp.

**Navegación:**
- Desktop: tabs en la cabecera con indicador de subrayado ámbar
- Móvil: barra de navegación inferior fija

**Estilo actual (Minimalista Puro):**
- Fondo `#f5f5f5`, tarjetas blancas
- Bordes `#ebebeb` (1px), sin sombras pesadas
- Acento: ámbar `#f59e0b`
- Tipografía: `-apple-system, BlinkMacSystemFont, "Segoe UI"`
- Border-radius: 8-12px

---

## Componentes principales en el código

| Componente | Descripción |
|---|---|
| `PostItSlot` | Tarjeta de un slot del menú (rellena o vacía) |
| `DayColumn` | Columna de un día (encabezado + 3 slots) |
| `RecipeCard` | Tarjeta de receta en el drawer de selección |
| `RecipeDrawer` | Panel deslizante para elegir receta |
| `RecipeModal` | Modal con detalle de receta e ingredientes |
| `RecipeEditor` | Formulario de crear/editar receta |
| `RecipeManager` | Listado de todas las recetas |
| `ShoppingList` | Lista de la compra con check |
| `HistoryPanel` | Panel de historial y estadísticas |
| `WeekPicker` | Selector de semana (← semana →) |
| `App` | Componente raíz, contiene toda la lógica y el `<style>` global |

---

## Constantes de datos clave

```js
// Slots del día
const SLOTS = [
  { key:'primero', label:'1er Plato', emoji:'🥗' },
  { key:'segundo', label:'2do Plato', emoji:'🍽️' },
  { key:'cena',    label:'Cena',      emoji:'🌙' },
];

// Colores por slot
const SS = {
  primero: { bg:'#fefce8', border:'#fde047', accent:'#ca8a04' },
  segundo: { bg:'#fdf4ff', border:'#e879f9', accent:'#a21caf' },
  cena:    { bg:'#eff6ff', border:'#93c5fd', accent:'#1d4ed8' },
};

// Tipos de plato
const TS = {
  verdura:  { bg:'#dcfce7', color:'#15803d', label:'🥦 Verdura' },
  pescado:  { bg:'#dbeafe', color:'#1d4ed8', label:'🐟 Pescado' },
  carne:    { bg:'#fee2e2', color:'#b91c1c', label:'🍗 Carne' },
  legumbre: { bg:'#fef9c3', color:'#a16207', label:'🫘 Legumbre' },
  huevo:    { bg:'#ffedd5', color:'#c2410c', label:'🥚 Huevo' },
  fuera:    { bg:'#f3f4f6', color:'#6b7280', label:'🍴 Fuera' },
};
```

---

## Tu tarea

1. **Abre el template de Figma** en el enlace de arriba (o pido que el usuario te pase capturas de pantalla del template).
2. **Analiza el estilo visual** del template: paleta de colores, tipografía, componentes, espaciado, iconografía, layout.
3. **Aplica ese estilo** al archivo `menu-semanal-local.jsx` adjunto, adaptando:
   - El bloque `<style>` (CSS global al final del archivo)
   - Los estilos inline de los componentes
   - Las constantes de color (`SS`, `TS`) si procede
   - El layout y estructura de componentes si el template lo sugiere
4. **Devuelve el fichero completo** modificado, listo para reemplazar el original.

> **Nota importante:** Toda la app es un único fichero JSX. El CSS vive en un `<style>` tag al final del componente `App`. Los cambios de estilo se hacen tanto en ese bloque CSS como en los `style={{...}}` inline de cada componente.

---

## Fichero de código

El código completo está en el fichero adjunto `menu-semanal-local.jsx`.

Si no puedes acceder al template de Figma directamente, por favor dime y el usuario te proporcionará capturas de pantalla del diseño para que puedas analizar el estilo.

