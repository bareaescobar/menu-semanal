import { useState, useEffect, useMemo } from "react";
import { Star, ShoppingCart, X, Clock, Plus, Check, BookOpen } from "lucide-react";

const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const DAYS_SHORT = ['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'];
const SLOTS = [
  { key:'primero', label:'1er Plato', emoji:'🥗' },
  { key:'segundo', label:'2do Plato', emoji:'🍽️' },
  { key:'cena',    label:'Cena',      emoji:'🌙' },
];
const SS = {
  primero: { bg:'#fefce8', border:'#fde047', accent:'#ca8a04' },
  segundo: { bg:'#fdf4ff', border:'#e879f9', accent:'#a21caf' },
  cena:    { bg:'#eff6ff', border:'#93c5fd', accent:'#1d4ed8' },
};
const TS = {
  verdura:  { bg:'#dcfce7', color:'#15803d', label:'🥦 Verdura' },
  pescado:  { bg:'#dbeafe', color:'#1d4ed8', label:'🐟 Pescado' },
  carne:    { bg:'#fee2e2', color:'#b91c1c', label:'🍗 Carne' },
  legumbre: { bg:'#fef9c3', color:'#a16207', label:'🫘 Legumbre' },
  huevo:    { bg:'#ffedd5', color:'#c2410c', label:'🥚 Huevo' },
};

const RECIPES = [
  { id:'p1',slot:'primero',name:'Ensalada mediterránea',time:10,difficulty:1,favorite:true,isNew:false,type:'verdura',
    ingredients:[{name:'Lechuga',amount:'1 ud'},{name:'Tomate',amount:'2 ud'},{name:'Pepino',amount:'1 ud'},{name:'Aceitunas negras',amount:'50g'},{name:'Queso feta',amount:'80g'}],
    steps:['Lavar y cortar todas las verduras.','Mezclar en un bol con aceitunas.','Desmenuzar el queso feta.','Aliñar con aceite, limón y orégano.'] },
  { id:'p2',slot:'primero',name:'Gazpacho andaluz',time:15,difficulty:1,favorite:true,isNew:false,type:'verdura',
    ingredients:[{name:'Tomates maduros',amount:'1 kg'},{name:'Pepino',amount:'1 ud'},{name:'Pimiento verde',amount:'1 ud'},{name:'Ajo',amount:'1 diente'},{name:'Pan del día anterior',amount:'50g'}],
    steps:['Trocear todos los ingredientes.','Triturar con aceite, vinagre y sal.','Colar para textura fina.','Enfriar en nevera mínimo 1 hora.'] },
  { id:'p3',slot:'primero',name:'Crema de calabaza',time:30,difficulty:1,favorite:false,isNew:false,type:'verdura',
    ingredients:[{name:'Calabaza',amount:'600g'},{name:'Cebolla',amount:'1 ud'},{name:'Zanahoria',amount:'2 ud'},{name:'Caldo de verduras',amount:'500ml'},{name:'Jengibre',amount:'1 trozo'}],
    steps:['Pochar cebolla y zanahoria 5 min.','Añadir calabaza y jengibre.','Cubrir con caldo y cocer 20 min.','Triturar y salpimentar.'] },
  { id:'p4',slot:'primero',name:'Ensalada de garbanzos',time:5,difficulty:1,favorite:false,isNew:true,type:'legumbre',
    ingredients:[{name:'Garbanzos cocidos',amount:'400g'},{name:'Tomate cherry',amount:'150g'},{name:'Cebolla morada',amount:'½ ud'},{name:'Pimiento rojo',amount:'1 ud'}],
    steps:['Escurrir y aclarar garbanzos.','Cortar tomates y pimiento.','Mezclar en un bol.','Aliñar con aceite, limón y comino.'] },
  { id:'p5',slot:'primero',name:'Crema de brócoli',time:25,difficulty:1,favorite:false,isNew:true,type:'verdura',
    ingredients:[{name:'Brócoli',amount:'500g'},{name:'Cebolla',amount:'1 ud'},{name:'Ajo',amount:'2 dientes'},{name:'Caldo de verduras',amount:'400ml'}],
    steps:['Pochar cebolla y ajo 3 min.','Añadir brócoli en ramilletes.','Cubrir con caldo, cocer 15 min.','Triturar y rectificar sal.'] },
  { id:'s1',slot:'segundo',name:'Merluza a la plancha',time:15,difficulty:1,favorite:true,isNew:false,type:'pescado',
    ingredients:[{name:'Merluza en filetes',amount:'400g'},{name:'Ajo',amount:'2 dientes'},{name:'Perejil',amount:'al gusto'},{name:'Limón',amount:'1 ud'}],
    steps:['Salar los filetes.','Calentar plancha con aceite.','Cocinar 3-4 min por lado.','Servir con ajo, perejil y limón.'] },
  { id:'s2',slot:'segundo',name:'Pollo al horno',time:45,difficulty:1,favorite:true,isNew:false,type:'carne',
    ingredients:[{name:'Pechuga de pollo',amount:'600g'},{name:'Pimiento rojo',amount:'1 ud'},{name:'Pimiento verde',amount:'1 ud'},{name:'Cebolla',amount:'1 ud'},{name:'Calabacín',amount:'1 ud'},{name:'Ajo',amount:'3 dientes'}],
    steps:['Precalentar horno 200°C.','Trocear todo y salpimentar con orégano.','Poner en bandeja con aceite.','Hornear 35-40 min hasta dorado.'] },
  { id:'s3',slot:'segundo',name:'Salmón con espinacas',time:20,difficulty:1,favorite:true,isNew:false,type:'pescado',
    ingredients:[{name:'Salmón en filetes',amount:'400g'},{name:'Espinacas frescas',amount:'200g'},{name:'Ajo',amount:'2 dientes'},{name:'Limón',amount:'1 ud'}],
    steps:['Saltear ajo en aceite 1 min.','Añadir espinacas y rehogar.','Cocinar salmón 4 min por lado.','Servir sobre las espinacas.'] },
  { id:'s4',slot:'segundo',name:'Lentejas con verduras',time:35,difficulty:1,favorite:false,isNew:false,type:'legumbre',
    ingredients:[{name:'Lentejas pardinas',amount:'300g'},{name:'Zanahoria',amount:'2 ud'},{name:'Cebolla',amount:'1 ud'},{name:'Tomate',amount:'2 ud'},{name:'Pimentón dulce',amount:'1 cdta'}],
    steps:['Pochar cebolla y zanahoria.','Añadir tomate, cocinar 5 min.','Lentejas, cubrir de agua y cocer 25 min.','Salpimentar.'] },
  { id:'s5',slot:'segundo',name:'Pavo con champiñones',time:20,difficulty:1,favorite:false,isNew:true,type:'carne',
    ingredients:[{name:'Pechuga de pavo',amount:'400g'},{name:'Champiñones',amount:'250g'},{name:'Cebolla',amount:'1 ud'},{name:'Salsa de soja',amount:'2 cdas'},{name:'Ajo',amount:'2 dientes'}],
    steps:['Cortar el pavo en tiras.','Saltear ajo y cebolla 3 min.','Añadir pavo y dorar.','Champiñones y soja, 5 min más.'] },
  { id:'s6',slot:'segundo',name:'Shakshuka',time:25,difficulty:2,favorite:false,isNew:true,type:'huevo',
    ingredients:[{name:'Huevos',amount:'4 ud'},{name:'Tomate triturado',amount:'400g'},{name:'Pimiento rojo',amount:'1 ud'},{name:'Cebolla',amount:'1 ud'},{name:'Comino y pimentón',amount:'1 cdta c/u'}],
    steps:['Sofreír cebolla y pimiento 8 min.','Especias y tomate, 10 min.','Hacer huecos y cascar los huevos.','Tapar y cocinar 5 min.'] },
  { id:'s7',slot:'segundo',name:'Dorada al horno',time:30,difficulty:1,favorite:false,isNew:true,type:'pescado',
    ingredients:[{name:'Dorada',amount:'2 ud'},{name:'Patata',amount:'2 ud'},{name:'Cebolla',amount:'1 ud'},{name:'Vino blanco',amount:'100ml'},{name:'Limón',amount:'1 ud'}],
    steps:['Precalentar horno 200°C.','Patata y cebolla en rodajas en bandeja.','Dorada encima con vino y limón.','Hornear 20-25 min.'] },
  { id:'c1',slot:'cena',name:'Tortilla de verduras',time:20,difficulty:1,favorite:true,isNew:false,type:'huevo',
    ingredients:[{name:'Huevos',amount:'4 ud'},{name:'Calabacín',amount:'1 ud'},{name:'Pimiento rojo',amount:'1 ud'},{name:'Cebolla',amount:'½ ud'}],
    steps:['Pochar verduras cortadas finas.','Batir huevos con sal.','Mezclar huevo y verduras.','Cuajar a fuego suave y dar la vuelta.'] },
  { id:'c2',slot:'cena',name:'Crema de verduras',time:25,difficulty:1,favorite:false,isNew:false,type:'verdura',
    ingredients:[{name:'Verduras de temporada',amount:'600g'},{name:'Cebolla',amount:'1 ud'},{name:'Caldo de verduras',amount:'400ml'}],
    steps:['Pochar la cebolla.','Añadir verduras troceadas.','Cubrir con caldo, cocer 20 min.','Triturar y salpimentar.'] },
  { id:'c3',slot:'cena',name:'Caballa al limón',time:15,difficulty:1,favorite:false,isNew:true,type:'pescado',
    ingredients:[{name:'Filetes de caballa',amount:'4 ud'},{name:'Limón',amount:'2 ud'},{name:'Alcaparras',amount:'2 cdas'}],
    steps:['Calentar sartén con aceite.','Cocinar caballa 3 min por lado.','Añadir limón y alcaparras.','1 min más y servir.'] },
  { id:'c4',slot:'cena',name:'Revuelto setas y gambas',time:15,difficulty:1,favorite:true,isNew:false,type:'huevo',
    ingredients:[{name:'Huevos',amount:'3 ud'},{name:'Setas variadas',amount:'200g'},{name:'Gambas peladas',amount:'150g'},{name:'Ajo',amount:'2 dientes'}],
    steps:['Saltear ajo y setas.','Añadir gambas, 2 min.','Bajar fuego, añadir huevos batidos.','Remover suavemente hasta cuajar.'] },
  { id:'c5',slot:'cena',name:'Pavo a la plancha',time:15,difficulty:1,favorite:true,isNew:false,type:'carne',
    ingredients:[{name:'Pechuga de pavo',amount:'300g'},{name:'Limón',amount:'1 ud'},{name:'Hierbas provenzales',amount:'al gusto'}],
    steps:['Salpimentar con hierbas.','Plancha caliente 4 min por lado.','Reposar 2 min.','Servir con limón.'] },
  { id:'c6',slot:'cena',name:'Ensalada de atún',time:10,difficulty:1,favorite:true,isNew:false,type:'pescado',
    ingredients:[{name:'Atún en lata',amount:'2 latas'},{name:'Tomate',amount:'2 ud'},{name:'Cebolla morada',amount:'½ ud'},{name:'Lechuga',amount:'1 ud'}],
    steps:['Cortar lechuga y tomate.','Cebolla muy fina.','Mezclar con atún escurrido.','Aliñar con aceite y vinagre.'] },
];

const SKEY = 'msv1';
const emptyMenu = () => Object.fromEntries(DAYS.map(d=>[d,{primero:null,segundo:null,cena:null}]));

function loadFromStorage(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function saveToStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── PostItSlot ──────────────────────────────────────────────────────
function PostItSlot({ slotKey, menuVal, recipes, onSlotClick, onRemove, onViewRecipe }) {
  const [hover, setHover] = useState(false);
  const s = SS[slotKey];
  const slot = SLOTS.find(x=>x.key===slotKey);
  const recipe = menuVal ? recipes.find(r=>r.id===menuVal) : null;
  const t = recipe ? TS[recipe.type] : null;

  if (recipe) return (
    <div onClick={()=>onViewRecipe(menuVal)}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        background:s.bg, border:`2px solid ${s.border}`,
        borderRadius:12, padding:'10px 10px 8px', cursor:'pointer', position:'relative',
        transform: hover ? 'rotate(-0.4deg) translateY(-2px)' : 'rotate(0.2deg)',
        boxShadow: hover ? '3px 6px 16px rgba(0,0,0,0.13)' : '1px 2px 6px rgba(0,0,0,0.06)',
        transition:'all 0.18s ease', minHeight:88,
      }}>
      {hover && (
        <button onClick={e=>{e.stopPropagation();onRemove();}}
          style={{position:'absolute',top:4,right:4,width:18,height:18,borderRadius:'50%',background:'rgba(255,255,255,0.9)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#ef4444'}}>
          <X size={10} strokeWidth={3}/>
        </button>
      )}
      <div style={{fontSize:14,marginBottom:4}}>{slot.emoji}</div>
      <div style={{fontWeight:600,fontSize:11,color:'#1f2937',lineHeight:1.3,marginBottom:6}}>{recipe.name}</div>
      <div style={{display:'flex',alignItems:'center',gap:3,color:'#9ca3af',fontSize:10}}>
        <Clock size={9}/><span>{recipe.time}m</span>
      </div>
      {t && (
        <div style={{marginTop:5,fontSize:'0.6rem',padding:'2px 6px',borderRadius:99,display:'inline-block',fontWeight:600,background:t.bg,color:t.color}}>
          {t.label}
        </div>
      )}
    </div>
  );

  const [btnHover, setBtnHover] = useState(false);
  return (
    <button onClick={onSlotClick}
      onMouseEnter={()=>setBtnHover(true)} onMouseLeave={()=>setBtnHover(false)}
      style={{
        width:'100%', minHeight:88, borderRadius:12, border:`2px dashed ${btnHover?s.border:s.border+'66'}`,
        background: btnHover ? s.bg : 'transparent',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        gap:3, cursor:'pointer', color:s.accent, transition:'all 0.15s ease',
      }}>
      <span style={{fontSize:14}}>{slot.emoji}</span>
      <Plus size={14} strokeWidth={2.5}/>
      <span style={{fontSize:10,fontWeight:600}}>{slot.label}</span>
    </button>
  );
}

// ── DayColumn ───────────────────────────────────────────────────────
function DayColumn({ day, dayShort, menuDay, recipes, onSlotClick, onRemoveSlot, onViewRecipe }) {
  return (
    <div style={{width:148,flexShrink:0}}>
      <div style={{textAlign:'center',marginBottom:10,paddingBottom:8,borderBottom:'1px solid #e5e7eb'}}>
        <div style={{fontSize:10,fontWeight:700,color:'#9ca3af',letterSpacing:'0.1em',marginBottom:2}}>{dayShort}</div>
        <div style={{fontSize:13,fontWeight:600,color:'#374151'}}>{day}</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {SLOTS.map(({key})=>(
          <PostItSlot key={key} slotKey={key}
            menuVal={menuDay[key]} recipes={recipes}
            onSlotClick={()=>onSlotClick(day,key)}
            onRemove={()=>onRemoveSlot(day,key)}
            onViewRecipe={onViewRecipe}/>
        ))}
      </div>
    </div>
  );
}

// ── RecipeCard ──────────────────────────────────────────────────────
function RecipeCard({ recipe, onSelect, onToggleFav, onViewRecipe }) {
  const [h, setH] = useState(false);
  const t = TS[recipe.type]||{};
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{background:'white',border:`1px solid ${h?'#d1d5db':'#f3f4f6'}`,borderRadius:12,padding:12,boxShadow:h?'0 4px 12px rgba(0,0,0,0.08)':'none',transition:'all 0.15s'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          {recipe.isNew && <span style={{fontSize:'0.58rem',background:'#d1fae5',color:'#065f46',padding:'2px 6px',borderRadius:99,fontWeight:700}}>✨ NUEVO</span>}
          {recipe.favorite && <span style={{fontSize:'0.58rem',background:'#fef3c7',color:'#92400e',padding:'2px 6px',borderRadius:99,fontWeight:700}}>⭐ FAV</span>}
        </div>
        <button onClick={e=>{e.stopPropagation();onToggleFav();}} style={{border:'none',background:'none',cursor:'pointer',padding:2,flexShrink:0}}>
          <Star size={15} fill={recipe.favorite?'#fbbf24':'none'} color={recipe.favorite?'#fbbf24':'#d1d5db'} strokeWidth={recipe.favorite?0:2}/>
        </button>
      </div>
      <div style={{fontWeight:600,fontSize:13,color:'#1f2937',lineHeight:1.3,marginBottom:6}}>{recipe.name}</div>
      <div style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'#9ca3af',marginBottom:6}}>
        <Clock size={11}/><span>{recipe.time} min</span>
        <span style={{margin:'0 2px'}}>·</span>
        <span>{'●'.repeat(recipe.difficulty)}{'○'.repeat(3-recipe.difficulty)}</span>
      </div>
      {t.label && (
        <div style={{background:t.bg,color:t.color,fontSize:'0.68rem',padding:'2px 8px',borderRadius:99,display:'inline-block',fontWeight:600,marginBottom:8}}>
          {t.label}
        </div>
      )}
      <div style={{display:'flex',gap:6}}>
        <button onClick={onViewRecipe}
          style={{flex:1,padding:'6px 0',fontSize:11,borderRadius:8,border:'1px solid #e5e7eb',background:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:4,color:'#6b7280',fontWeight:500}}>
          <BookOpen size={11}/> Receta
        </button>
        <button onClick={onSelect}
          style={{flex:1,padding:'6px 0',fontSize:11,borderRadius:8,border:'none',background:'#f59e0b',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:4,color:'white',fontWeight:600}}>
          <Plus size={11}/> Añadir
        </button>
      </div>
    </div>
  );
}

// ── ShoppingList ────────────────────────────────────────────────────
function ShoppingList({ items, checked, onToggle, onClearChecked }) {
  const pending = items.filter(i=>!checked.has(i.k));
  const done    = items.filter(i=> checked.has(i.k));
  return (
    <div style={{background:'white',borderRadius:16,border:'1px solid #f3f4f6',padding:16,height:'100%'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
        <ShoppingCart size={16} style={{color:'#f59e0b'}}/>
        <span style={{fontWeight:600,color:'#1f2937',fontSize:14,flex:1}}>Lista de la compra</span>
        {pending.length>0 && (
          <span style={{fontSize:11,background:'#fef3c7',color:'#92400e',padding:'2px 8px',borderRadius:99,fontWeight:700}}>
            {pending.length} items
          </span>
        )}
      </div>
      {items.length===0 ? (
        <div style={{textAlign:'center',padding:'32px 0',color:'#d1d5db'}}>
          <ShoppingCart size={28} style={{margin:'0 auto 8px'}}/>
          <p style={{fontSize:13,margin:0}}>Añade platos al menú</p>
        </div>
      ) : (
        <div style={{overflowY:'auto',maxHeight:'calc(100vh - 180px)'}}>
          {pending.map(item=>(
            <div key={item.k} onClick={()=>onToggle(item.k)}
              style={{display:'flex',alignItems:'center',gap:10,padding:'6px 8px',borderRadius:8,cursor:'pointer',transition:'background 0.1s'}}
              onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{width:16,height:16,borderRadius:4,border:'2px solid #d1d5db',flexShrink:0}}/>
              <span style={{fontSize:13,color:'#374151',flex:1}}>{item.name}</span>
              <span style={{fontSize:11,color:'#9ca3af',flexShrink:0}}>{item.amount}</span>
            </div>
          ))}
          {done.length>0 && (<>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 8px 4px',fontSize:10,color:'#d1d5db',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase'}}>
              <span>Comprado ✓</span>
              <button onClick={onClearChecked} style={{border:'none',background:'none',fontSize:10,color:'#d1d5db',cursor:'pointer',fontWeight:600}}>limpiar</button>
            </div>
            {done.map(item=>(
              <div key={item.k} onClick={()=>onToggle(item.k)}
                style={{display:'flex',alignItems:'center',gap:10,padding:'6px 8px',borderRadius:8,cursor:'pointer',opacity:0.5}}
                onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:16,height:16,borderRadius:4,background:'#22c55e',border:'2px solid #22c55e',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Check size={9} strokeWidth={3} color="white"/>
                </div>
                <span style={{fontSize:13,color:'#9ca3af',flex:1,textDecoration:'line-through'}}>{item.name}</span>
                <span style={{fontSize:11,color:'#d1d5db',flexShrink:0}}>{item.amount}</span>
              </div>
            ))}
          </>)}
        </div>
      )}
    </div>
  );
}

// ── RecipeDrawer ────────────────────────────────────────────────────
function RecipeDrawer({ slot, recipes, filter, onFilterChange, onSelect, onClose, onToggleFav, onViewRecipe }) {
  const slotInfo = SLOTS.find(s=>s.key===slot.slotKey);
  return (
    <div style={{position:'fixed',inset:0,zIndex:20,display:'flex',flexDirection:'column',justifyContent:'flex-end',backdropFilter:'blur(2px)'}}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.4)'}} onClick={onClose}/>
      <div style={{position:'relative',background:'white',borderRadius:'20px 20px 0 0',boxShadow:'0 -4px 32px rgba(0,0,0,0.18)',maxHeight:'82vh',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'16px 16px 12px',borderBottom:'1px solid #f3f4f6',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{fontWeight:600,color:'#1f2937',fontSize:15}}>
              {slotInfo.emoji} {slotInfo.label} — <span style={{color:'#f59e0b'}}>{slot.day}</span>
            </div>
            <div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>Toca "Añadir" para poner en la pizarra</div>
          </div>
          <button onClick={onClose} style={{border:'none',background:'none',cursor:'pointer',padding:6,borderRadius:10,color:'#9ca3af'}}>
            <X size={20}/>
          </button>
        </div>
        <div style={{padding:'10px 16px',borderBottom:'1px solid #f9fafb',background:'#fafafa',display:'flex',gap:8,overflowX:'auto'}}>
          {[['all','Todas'],['fav','⭐ Favoritas'],['new','✨ Nuevas']].map(([v,l])=>(
            <button key={v} onClick={()=>onFilterChange(v)}
              style={{padding:'5px 14px',borderRadius:99,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',flexShrink:0,
                background:filter===v?'#f59e0b':'#f3f4f6', color:filter===v?'white':'#6b7280', transition:'all 0.15s'}}>
              {l}
            </button>
          ))}
        </div>
        <div style={{overflowY:'auto',flex:1,padding:16}}>
          {recipes.length===0 ? (
            <div style={{textAlign:'center',padding:'40px 0',color:'#d1d5db',fontSize:13}}>No hay recetas en esta categoría</div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {recipes.map(r=>(
                <RecipeCard key={r.id} recipe={r}
                  onSelect={()=>onSelect(r.id)}
                  onToggleFav={()=>onToggleFav(r.id)}
                  onViewRecipe={()=>onViewRecipe(r)}/>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── RecipeModal ─────────────────────────────────────────────────────
function RecipeModal({ recipe, onClose }) {
  const t = TS[recipe.type]||{};
  const s = SS[recipe.slot]||{bg:'#f9fafb'};
  return (
    <div style={{position:'fixed',inset:0,zIndex:30,display:'flex',alignItems:'flex-end',justifyContent:'center',padding:'0'}}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.5)'}} onClick={onClose}/>
      <div style={{position:'relative',background:'white',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:480,boxShadow:'0 -8px 40px rgba(0,0,0,0.2)',overflow:'hidden'}}>
        <div style={{padding:'20px 20px 16px',background:s.bg}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
            <div style={{flex:1}}>
              <h2 style={{fontWeight:700,fontSize:18,color:'#111827',margin:0,lineHeight:1.3}}>{recipe.name}</h2>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8,alignItems:'center'}}>
                <span style={{display:'flex',alignItems:'center',gap:4,fontSize:13,color:'#6b7280'}}><Clock size={13}/>{recipe.time} min</span>
                {t.label&&<span style={{fontSize:11,padding:'3px 10px',borderRadius:99,fontWeight:600,background:t.bg,color:t.color}}>{t.label}</span>}
              </div>
            </div>
            <button onClick={onClose} style={{border:'none',background:'rgba(0,0,0,0.08)',cursor:'pointer',padding:8,borderRadius:10,color:'#374151'}}>
              <X size={18}/>
            </button>
          </div>
        </div>
        <div style={{overflowY:'auto',maxHeight:'60vh'}}>
          <div style={{padding:'16px 20px 8px'}}>
            <div style={{fontSize:10,fontWeight:700,color:'#9ca3af',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10}}>🛒 Ingredientes</div>
            {recipe.ingredients.map((ing,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #f9fafb'}}>
                <span style={{fontSize:14,color:'#374151'}}>{ing.name}</span>
                <span style={{fontSize:14,color:'#9ca3af',fontWeight:500}}>{ing.amount}</span>
              </div>
            ))}
          </div>
          <div style={{padding:'12px 20px 24px'}}>
            <div style={{fontSize:10,fontWeight:700,color:'#9ca3af',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12}}>👩‍🍳 Preparación</div>
            {recipe.steps.map((step,i)=>(
              <div key={i} style={{display:'flex',gap:12,marginBottom:12}}>
                <div style={{width:24,height:24,borderRadius:'50%',background:'#f59e0b',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:11,fontWeight:700,color:'white'}}>
                  {i+1}
                </div>
                <span style={{fontSize:14,color:'#4b5563',lineHeight:1.6,paddingTop:3}}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App ─────────────────────────────────────────────────────────────
export default function App() {
  const [recipes, setRecipes] = useState(()=>loadFromStorage(SKEY+'_recipes', RECIPES));
  const [menu, setMenu] = useState(()=>loadFromStorage(SKEY+'_menu', emptyMenu()));
  const [checked, setChecked] = useState(()=>new Set(loadFromStorage(SKEY+'_checked', [])));
  const [activeSlot, setActiveSlot] = useState(null);
  const [recipeModal, setRecipeModal] = useState(null);
  const [mobileTab, setMobileTab] = useState('board');
  const [drawerFilter, setDrawerFilter] = useState('all');

  useEffect(()=>{ saveToStorage(SKEY+'_recipes', recipes); },[recipes]);
  useEffect(()=>{ saveToStorage(SKEY+'_menu', menu); },[menu]);
  useEffect(()=>{ saveToStorage(SKEY+'_checked', [...checked]); },[checked]);

  const shoppingList = useMemo(()=>{
    const map={};
    DAYS.forEach(day=>{
      SLOTS.forEach(({key})=>{
        const rid=menu[day]?.[key]; if(!rid) return;
        const rec=recipes.find(r=>r.id===rid); if(!rec) return;
        rec.ingredients.forEach(ing=>{
          const k=`${rid}__${ing.name}`;
          if(!map[k]) map[k]={...ing,recipeName:rec.name,k};
        });
      });
    });
    return Object.values(map);
  },[menu,recipes]);

  const filteredDrawer = useMemo(()=>{
    if(!activeSlot) return [];
    let list=recipes.filter(r=>r.slot===activeSlot.slotKey);
    if(drawerFilter==='fav') list=list.filter(r=>r.favorite);
    if(drawerFilter==='new') list=list.filter(r=>r.isNew);
    return list;
  },[recipes,activeSlot,drawerFilter]);

  const totalPlatos = Object.values(menu).reduce((a,d)=>a+Object.values(d).filter(Boolean).length,0);
  const uncheckedCount = shoppingList.filter(i=>!checked.has(i.k)).length;

  return (
    <div style={{minHeight:'100vh',background:'#faf8f5',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>

      {/* HEADER */}
      <div style={{background:'white',borderBottom:'1px solid #f3f4f6',position:'sticky',top:0,zIndex:10,boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'10px 16px',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:22}}>🥘</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,color:'#111827',fontSize:15,lineHeight:1}}>Menú Semanal</div>
            <div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>{totalPlatos} / {DAYS.length*3} platos planificados</div>
          </div>
          <button onClick={()=>{if(window.confirm('¿Limpiar toda la semana?'))setMenu(emptyMenu());}}
            style={{display:'flex',gap:4,alignItems:'center',fontSize:11,color:'#9ca3af',border:'none',background:'none',cursor:'pointer',padding:'4px 8px',borderRadius:8}}>
            <X size={12}/> Limpiar semana
          </button>
          <div style={{display:'flex',gap:4}}>
            {[['board','🗓 Pizarra'],['shop','🛒']].map(([tab,label])=>(
              <button key={tab} onClick={()=>setMobileTab(tab)}
                style={{padding:'6px 12px',borderRadius:12,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',position:'relative',transition:'all 0.15s',
                  background:mobileTab===tab?'#fef3c7':'transparent',color:mobileTab===tab?'#92400e':'#9ca3af'}}>
                {label}
                {tab==='shop'&&uncheckedCount>0&&(
                  <span style={{position:'absolute',top:-2,right:-2,width:16,height:16,borderRadius:'50%',background:'#ef4444',color:'white',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {uncheckedCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{maxWidth:1200,margin:'0 auto',padding:16,display:'flex',gap:16,alignItems:'flex-start'}}>

        {/* BOARD */}
        <div style={{flex:1,minWidth:0,display:mobileTab==='shop'?'none':'block'}}>
          <div style={{overflowX:'auto',paddingBottom:8,WebkitOverflowScrolling:'touch'}}>
            <div style={{display:'flex',gap:12,minWidth:'max-content'}}>
              {DAYS.map((day,di)=>(
                <DayColumn key={day} day={day} dayShort={DAYS_SHORT[di]}
                  menuDay={menu[day]||{primero:null,segundo:null,cena:null}}
                  recipes={recipes}
                  onSlotClick={(d,sk)=>{setDrawerFilter('all');setActiveSlot({day:d,slotKey:sk});}}
                  onRemoveSlot={(d,sk)=>setMenu(p=>({...p,[d]:{...p[d],[sk]:null}}))}
                  onViewRecipe={rid=>setRecipeModal(recipes.find(r=>r.id===rid))}/>
              ))}
            </div>
          </div>
          <div style={{fontSize:11,color:'#d1d5db',marginTop:8,paddingLeft:4}}>
            💡 Toca + para añadir · Pulsa el post-it para ver la receta · Pasa el ratón para eliminar
          </div>
        </div>

        {/* SHOPPING LIST — siempre visible en escritorio */}
        <div style={{width:260,flexShrink:0,position:'sticky',top:72,display: mobileTab==='board' ? 'none' : 'block'}}
          id="sidebar-shopping">
          <ShoppingList items={shoppingList} checked={checked}
            onToggle={k=>setChecked(p=>{const n=new Set(p);n.has(k)?n.delete(k):n.add(k);return n;})}
            onClearChecked={()=>setChecked(p=>{const n=new Set(p);shoppingList.filter(i=>p.has(i.k)).forEach(i=>n.delete(i.k));return n;})}/>
        </div>
      </div>

      {/* RECIPE DRAWER */}
      {activeSlot&&(
        <RecipeDrawer slot={activeSlot} recipes={filteredDrawer} filter={drawerFilter}
          onFilterChange={setDrawerFilter}
          onSelect={rid=>{setMenu(p=>({...p,[activeSlot.day]:{...p[activeSlot.day],[activeSlot.slotKey]:rid}}));setActiveSlot(null);}}
          onClose={()=>setActiveSlot(null)}
          onToggleFav={id=>setRecipes(p=>p.map(r=>r.id===id?{...r,favorite:!r.favorite}:r))}
          onViewRecipe={setRecipeModal}/>
      )}

      {/* RECIPE MODAL */}
      {recipeModal&&<RecipeModal recipe={recipeModal} onClose={()=>setRecipeModal(null)}/>}

      <style>{`
        @media (min-width: 768px) {
          #sidebar-shopping { display: block !important; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
      `}</style>
    </div>
  );
}
