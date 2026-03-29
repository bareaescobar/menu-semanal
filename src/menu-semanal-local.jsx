import { useState, useEffect, useMemo, useCallback } from "react";
import { Star, ShoppingCart, X, Clock, Plus, Check, BookOpen, Pencil, Trash2, Save, Calendar, ChevronLeft, ChevronRight, Coffee, Share2, Copy, MessageCircle, Download } from "lucide-react";
import { dbLoad, dbSave } from "./supabase";

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
  fuera:    { bg:'#f3f4f6', color:'#6b7280', label:'🍴 Fuera' },
};

// Plato especial "Comer fuera"
const COMER_FUERA = {
  id:'__fuera__', name:'Comer fuera', time:0, difficulty:0,
  favorite:false, isNew:false, type:'fuera',
  slots:['primero','segundo','cena'],
  ingredients:[], steps:['No hay nada que preparar. ¡A disfrutar!'],
};

const RECIPES_BASE = [
  // ── PRIMEROS ────────────────────────────────────────────────────
  { id:'p01',slots:['primero'],name:'Ensalada mediterránea',time:10,difficulty:1,favorite:true,isNew:false,type:'verdura',
    ingredients:[{name:'Lechuga',amount:'1 ud'},{name:'Tomate',amount:'2 ud'},{name:'Pepino',amount:'1 ud'},{name:'Aceitunas negras',amount:'50 g'},{name:'Queso feta',amount:'80 g'}],
    steps:['Lavar y cortar todas las verduras.','Mezclar en un bol con aceitunas.','Desmenuzar queso feta por encima.','Aliñar con aceite, limón y orégano.'] },
  { id:'p02',slots:['primero'],name:'Gazpacho andaluz',time:15,difficulty:1,favorite:true,isNew:false,type:'verdura',
    ingredients:[{name:'Tomates maduros',amount:'1 kg'},{name:'Pepino',amount:'1 ud'},{name:'Pimiento verde',amount:'1 ud'},{name:'Ajo',amount:'1 diente'},{name:'Pan del día anterior',amount:'50 g'}],
    steps:['Trocear todos los ingredientes.','Triturar con aceite, vinagre y sal.','Colar para textura fina.','Enfriar en nevera mínimo 1 hora.'] },
  { id:'p03',slots:['primero','cena'],name:'Crema de calabaza',time:30,difficulty:1,favorite:false,isNew:false,type:'verdura',
    ingredients:[{name:'Calabaza',amount:'600 g'},{name:'Cebolla',amount:'1 ud'},{name:'Zanahoria',amount:'2 ud'},{name:'Caldo de verduras',amount:'500 ml'},{name:'Jengibre',amount:'1 trozo'}],
    steps:['Pochar cebolla y zanahoria 5 min.','Añadir calabaza y jengibre.','Cubrir con caldo y cocer 20 min.','Triturar y salpimentar.'] },
  { id:'p04',slots:['primero'],name:'Ensalada de garbanzos',time:5,difficulty:1,favorite:false,isNew:true,type:'legumbre',
    ingredients:[{name:'Garbanzos cocidos',amount:'400 g'},{name:'Tomate cherry',amount:'150 g'},{name:'Cebolla morada',amount:'½ ud'},{name:'Pimiento rojo',amount:'1 ud'}],
    steps:['Escurrir y aclarar garbanzos.','Cortar tomates y pimiento.','Mezclar todo en un bol.','Aliñar con aceite, limón y comino.'] },
  { id:'p05',slots:['primero','cena'],name:'Crema de brócoli',time:25,difficulty:1,favorite:false,isNew:true,type:'verdura',
    ingredients:[{name:'Brócoli',amount:'500 g'},{name:'Cebolla',amount:'1 ud'},{name:'Ajo',amount:'2 dientes'},{name:'Caldo de verduras',amount:'400 ml'}],
    steps:['Pochar cebolla y ajo 3 min.','Añadir brócoli en ramilletes.','Cubrir con caldo, cocer 15 min.','Triturar y rectificar sal.'] },
  { id:'p06',slots:['primero'],name:'Ensalada de aguacate y atún',time:10,difficulty:1,favorite:true,isNew:false,type:'pescado',
    ingredients:[{name:'Aguacate',amount:'1 ud'},{name:'Atún en lata',amount:'1 lata'},{name:'Tomate cherry',amount:'100 g'},{name:'Cebolla morada',amount:'¼ ud'},{name:'Limón',amount:'1 ud'}],
    steps:['Cortar aguacate en dados.','Escurrir el atún.','Mezclar con tomates y cebolla fina.','Aliñar con limón y aceite.'] },
  { id:'p07',slots:['primero'],name:'Pisto manchego',time:35,difficulty:1,favorite:false,isNew:false,type:'verdura',
    ingredients:[{name:'Calabacín',amount:'2 ud'},{name:'Pimiento rojo',amount:'1 ud'},{name:'Pimiento verde',amount:'1 ud'},{name:'Tomate maduro',amount:'3 ud'},{name:'Cebolla',amount:'1 ud'}],
    steps:['Pochar cebolla y pimientos 10 min.','Añadir calabacín, 5 min más.','Incorporar tomate y cocer 20 min.','Salpimentar y añadir azúcar si es necesario.'] },
  { id:'p08',slots:['primero','cena'],name:'Sopa de verduras',time:30,difficulty:1,favorite:false,isNew:false,type:'verdura',
    ingredients:[{name:'Zanahoria',amount:'2 ud'},{name:'Patata',amount:'1 ud'},{name:'Judías verdes',amount:'100 g'},{name:'Caldo de pollo',amount:'1 l'},{name:'Cebolla',amount:'1 ud'}],
    steps:['Cortar todas las verduras en trozos similares.','Pochar cebolla 3 min.','Añadir el resto y caldo.','Cocer 20 min, salpimentar.'] },
  { id:'p09',slots:['primero'],name:'Ensalada César',time:15,difficulty:1,favorite:true,isNew:false,type:'verdura',
    ingredients:[{name:'Lechuga romana',amount:'1 ud'},{name:'Pechuga de pollo',amount:'200 g'},{name:'Queso parmesano',amount:'40 g'},{name:'Crutones',amount:'30 g'},{name:'Salsa César',amount:'3 cdas'}],
    steps:['Planchar el pollo y cortarlo en tiras.','Lavar y trocear la lechuga.','Mezclar con crutones y parmesano.','Aliñar con salsa César.'] },
  { id:'p10',slots:['primero'],name:'Taboulé',time:20,difficulty:1,favorite:false,isNew:true,type:'verdura',
    ingredients:[{name:'Bulgur',amount:'150 g'},{name:'Tomate',amount:'2 ud'},{name:'Pepino',amount:'1 ud'},{name:'Perejil fresco',amount:'1 manojo'},{name:'Limón',amount:'2 ud'}],
    steps:['Remojar bulgur en agua caliente 15 min.','Cortar finamente tomate, pepino y perejil.','Mezclar con bulgur escurrido.','Aliñar con aceite y limón abundante.'] },
  { id:'p11',slots:['primero'],name:'Hummus con crudités',time:10,difficulty:1,favorite:true,isNew:false,type:'legumbre',
    ingredients:[{name:'Garbanzos cocidos',amount:'400 g'},{name:'Tahini',amount:'2 cdas'},{name:'Limón',amount:'1 ud'},{name:'Ajo',amount:'1 diente'},{name:'Zanahoria y apio',amount:'200 g'}],
    steps:['Triturar garbanzos con tahini, limón y ajo.','Añadir agua fría hasta textura cremosa.','Salpimentar y añadir aceite encima.','Servir con verduras cortadas.'] },
  { id:'p12',slots:['primero'],name:'Crema de lentejas rojas',time:25,difficulty:1,favorite:false,isNew:true,type:'legumbre',
    ingredients:[{name:'Lentejas rojas',amount:'200 g'},{name:'Cebolla',amount:'1 ud'},{name:'Zanahoria',amount:'2 ud'},{name:'Comino',amount:'1 cdta'},{name:'Caldo de verduras',amount:'700 ml'}],
    steps:['Pochar cebolla y zanahoria 5 min.','Añadir lentejas, comino y caldo.','Cocer 20 min hasta que estén tiernas.','Triturar y salpimentar.'] },
  { id:'p13',slots:['primero','cena'],name:'Salmorejo',time:15,difficulty:1,favorite:true,isNew:false,type:'verdura',
    ingredients:[{name:'Tomates maduros',amount:'1 kg'},{name:'Pan duro',amount:'150 g'},{name:'Ajo',amount:'1 diente'},{name:'Aceite de oliva',amount:'100 ml'},{name:'Huevo duro',amount:'1 ud'}],
    steps:['Remojar el pan 5 min.','Triturar tomates, pan, ajo y aceite.','Colar para textura fina.','Servir frío con huevo duro y jamón.'] },
  { id:'p14',slots:['primero'],name:'Ensalada de espinacas y fresas',time:10,difficulty:1,favorite:false,isNew:true,type:'verdura',
    ingredients:[{name:'Espinacas baby',amount:'150 g'},{name:'Fresas',amount:'150 g'},{name:'Nueces',amount:'30 g'},{name:'Queso de cabra',amount:'60 g'},{name:'Vinagre balsámico',amount:'1 cda'}],
    steps:['Lavar espinacas y fresas.','Cortar fresas por la mitad.','Mezclar con nueces y queso desmenuzado.','Aliñar con aceite y vinagre balsámico.'] },
  { id:'p15',slots:['primero'],name:'Vichyssoise',time:35,difficulty:2,favorite:false,isNew:true,type:'verdura',
    ingredients:[{name:'Puerro',amount:'3 ud'},{name:'Patata',amount:'300 g'},{name:'Caldo de verduras',amount:'600 ml'},{name:'Nata ligera',amount:'100 ml'},{name:'Cebollino',amount:'al gusto'}],
    steps:['Pochar puerro 10 min a fuego suave.','Añadir patata y caldo, cocer 20 min.','Triturar y añadir nata.','Enfriar completamente y servir con cebollino.'] },
  // ── SEGUNDOS ─────────────────────────────────────────────────────
  { id:'s01',slots:['segundo'],name:'Merluza a la plancha',time:15,difficulty:1,favorite:true,isNew:false,type:'pescado',
    ingredients:[{name:'Merluza en filetes',amount:'400 g'},{name:'Ajo',amount:'2 dientes'},{name:'Perejil',amount:'al gusto'},{name:'Limón',amount:'1 ud'}],
    steps:['Salar los filetes.','Calentar plancha con aceite.','Cocinar 3-4 min por lado.','Servir con ajo, perejil y limón.'] },
  { id:'s02',slots:['segundo'],name:'Pollo al horno con verduras',time:45,difficulty:1,favorite:true,isNew:false,type:'carne',
    ingredients:[{name:'Pechuga de pollo',amount:'600 g'},{name:'Pimiento rojo',amount:'1 ud'},{name:'Pimiento verde',amount:'1 ud'},{name:'Cebolla',amount:'1 ud'},{name:'Calabacín',amount:'1 ud'},{name:'Ajo',amount:'3 dientes'}],
    steps:['Precalentar horno 200°C.','Trocear todo y salpimentar con orégano.','Poner en bandeja con aceite.','Hornear 35-40 min hasta dorado.'] },
  { id:'s03',slots:['segundo'],name:'Salmón con espinacas',time:20,difficulty:1,favorite:true,isNew:false,type:'pescado',
    ingredients:[{name:'Salmón en filetes',amount:'400 g'},{name:'Espinacas frescas',amount:'200 g'},{name:'Ajo',amount:'2 dientes'},{name:'Limón',amount:'1 ud'}],
    steps:['Saltear ajo en aceite 1 min.','Añadir espinacas y rehogar.','Cocinar salmón 4 min por lado.','Servir sobre las espinacas.'] },
  { id:'s04',slots:['segundo','primero'],name:'Lentejas con verduras',time:35,difficulty:1,favorite:false,isNew:false,type:'legumbre',
    ingredients:[{name:'Lentejas pardinas',amount:'300 g'},{name:'Zanahoria',amount:'2 ud'},{name:'Cebolla',amount:'1 ud'},{name:'Tomate',amount:'2 ud'},{name:'Pimentón dulce',amount:'1 cdta'}],
    steps:['Pochar cebolla y zanahoria.','Añadir tomate, cocinar 5 min.','Lentejas, cubrir de agua y cocer 25 min.','Salpimentar.'] },
  { id:'s05',slots:['segundo'],name:'Pavo con champiñones',time:20,difficulty:1,favorite:false,isNew:true,type:'carne',
    ingredients:[{name:'Pechuga de pavo',amount:'400 g'},{name:'Champiñones',amount:'250 g'},{name:'Cebolla',amount:'1 ud'},{name:'Salsa de soja',amount:'2 cdas'},{name:'Ajo',amount:'2 dientes'}],
    steps:['Cortar el pavo en tiras.','Saltear ajo y cebolla 3 min.','Añadir pavo y dorar.','Champiñones y soja, 5 min más.'] },
  { id:'s06',slots:['segundo'],name:'Shakshuka',time:25,difficulty:2,favorite:false,isNew:true,type:'huevo',
    ingredients:[{name:'Huevos',amount:'4 ud'},{name:'Tomate triturado',amount:'400 g'},{name:'Pimiento rojo',amount:'1 ud'},{name:'Cebolla',amount:'1 ud'},{name:'Comino y pimentón',amount:'1 cdta c/u'}],
    steps:['Sofreír cebolla y pimiento 8 min.','Especias y tomate, 10 min.','Hacer huecos y cascar los huevos.','Tapar y cocinar 5 min.'] },
  { id:'s07',slots:['segundo'],name:'Dorada al horno',time:30,difficulty:1,favorite:false,isNew:true,type:'pescado',
    ingredients:[{name:'Dorada',amount:'2 ud'},{name:'Patata',amount:'2 ud'},{name:'Cebolla',amount:'1 ud'},{name:'Vino blanco',amount:'100 ml'},{name:'Limón',amount:'1 ud'}],
    steps:['Precalentar horno 200°C.','Patata y cebolla en rodajas en bandeja.','Dorada encima con vino y limón.','Hornear 20-25 min.'] },
  { id:'s08',slots:['segundo'],name:'Pollo al limón',time:25,difficulty:1,favorite:true,isNew:false,type:'carne',
    ingredients:[{name:'Contramuslos de pollo',amount:'600 g'},{name:'Limón',amount:'2 ud'},{name:'Ajo',amount:'4 dientes'},{name:'Romero',amount:'2 ramas'},{name:'Vino blanco',amount:'50 ml'}],
    steps:['Marinar el pollo con limón, ajo y romero 10 min.','Dorar en sartén 5 min por lado.','Añadir vino y reducir.','Hornear 15 min a 180°C.'] },
  { id:'s09',slots:['segundo'],name:'Bacalao al pil-pil',time:30,difficulty:3,favorite:false,isNew:true,type:'pescado',
    ingredients:[{name:'Bacalao desalado',amount:'400 g'},{name:'Ajo',amount:'6 dientes'},{name:'Guindilla',amount:'1 ud'},{name:'Aceite de oliva virgen',amount:'200 ml'}],
    steps:['Confitar el ajo en aceite a 60°C 15 min.','Retirar y añadir el bacalao con la piel abajo.','Mover la cazuela en círculos para ligar el pil-pil.','Servir con el ajo confitado.'] },
  { id:'s10',slots:['segundo'],name:'Garbanzos con espinacas',time:20,difficulty:1,favorite:true,isNew:false,type:'legumbre',
    ingredients:[{name:'Garbanzos cocidos',amount:'400 g'},{name:'Espinacas',amount:'200 g'},{name:'Tomate triturado',amount:'200 g'},{name:'Ajo',amount:'2 dientes'},{name:'Comino',amount:'1 cdta'}],
    steps:['Sofreír ajo con comino 1 min.','Añadir tomate y cocinar 5 min.','Incorporar garbanzos y espinacas.','Cocer 5 min hasta que espinacas se reduzcan.'] },
  { id:'s11',slots:['segundo'],name:'Lubina a la sal',time:35,difficulty:2,favorite:false,isNew:true,type:'pescado',
    ingredients:[{name:'Lubina entera',amount:'800 g'},{name:'Sal gruesa',amount:'1.5 kg'},{name:'Clara de huevo',amount:'2 ud'},{name:'Limón',amount:'1 ud'}],
    steps:['Precalentar horno 200°C.','Mezclar sal con claras.','Cubrir la lubina completamente con la sal.','Hornear 25 min, romper la costra y servir.'] },
  { id:'s12',slots:['segundo'],name:'Pollo tikka masala ligero',time:35,difficulty:2,favorite:false,isNew:true,type:'carne',
    ingredients:[{name:'Pechuga de pollo',amount:'500 g'},{name:'Yogur natural',amount:'150 g'},{name:'Tomate triturado',amount:'400 g'},{name:'Curry y cúrcuma',amount:'2 cdtas'},{name:'Cebolla',amount:'1 ud'}],
    steps:['Marinar el pollo en yogur y especias 15 min.','Dorar el pollo en sartén.','Sofreír cebolla y añadir tomate y especias.','Añadir el pollo y cocer 15 min.'] },
  { id:'s13',slots:['segundo'],name:'Albóndigas de pavo',time:30,difficulty:2,favorite:false,isNew:true,type:'carne',
    ingredients:[{name:'Carne picada de pavo',amount:'500 g'},{name:'Huevo',amount:'1 ud'},{name:'Pan rallado',amount:'3 cdas'},{name:'Tomate triturado',amount:'400 g'},{name:'Cebolla',amount:'1 ud'}],
    steps:['Mezclar pavo, huevo, pan rallado y sal.','Formar albóndigas y dorar en aceite.','Preparar salsa de tomate con cebolla.','Cocer albóndigas en la salsa 15 min.'] },
  { id:'s14',slots:['segundo'],name:'Atún con tomate',time:15,difficulty:1,favorite:true,isNew:false,type:'pescado',
    ingredients:[{name:'Atún fresco',amount:'400 g'},{name:'Tomate maduro',amount:'3 ud'},{name:'Cebolla',amount:'1 ud'},{name:'Pimiento verde',amount:'1 ud'},{name:'Ajo',amount:'2 dientes'}],
    steps:['Sofreír cebolla, pimiento y ajo.','Añadir tomate y cocer 15 min.','Incorporar el atún en dados.','Cocer 3-4 min, rectificar sal.'] },
  { id:'s15',slots:['segundo'],name:'Pechuga rellena de espinacas',time:35,difficulty:2,favorite:false,isNew:true,type:'carne',
    ingredients:[{name:'Pechuga de pollo',amount:'2 ud'},{name:'Espinacas',amount:'100 g'},{name:'Queso fresco',amount:'80 g'},{name:'Ajo',amount:'1 diente'},{name:'Piñones',amount:'20 g'}],
    steps:['Saltear espinacas con ajo y piñones.','Abrir las pechugas en libro.','Rellenar y cerrar con palillos.','Hornear 25 min a 180°C.'] },
  { id:'s16',slots:['segundo'],name:'Rodaballo al vapor',time:20,difficulty:1,favorite:false,isNew:true,type:'pescado',
    ingredients:[{name:'Rodaballo',amount:'600 g'},{name:'Jengibre',amount:'1 trozo'},{name:'Salsa de soja',amount:'2 cdas'},{name:'Cebolleta',amount:'2 ud'},{name:'Aceite de sésamo',amount:'1 cda'}],
    steps:['Cocer el rodaballo al vapor 12 min.','Cortar jengibre y cebolleta muy finos.','Poner encima del pescado.','Calentar aceite hasta humear y volcar sobre el pescado.'] },
  { id:'s17',slots:['segundo'],name:'Pollo en salsa de yogur',time:25,difficulty:1,favorite:false,isNew:true,type:'carne',
    ingredients:[{name:'Contramuslos de pollo',amount:'600 g'},{name:'Yogur griego',amount:'200 g'},{name:'Ajo',amount:'2 dientes'},{name:'Comino y coriandro',amount:'1 cdta c/u'},{name:'Limón',amount:'1 ud'}],
    steps:['Dorar el pollo por todos lados.','Mezclar yogur con especias y ajo.','Añadir la salsa al pollo y bajar el fuego.','Cocer tapado 15 min a fuego suave.'] },
  { id:'s18',slots:['segundo'],name:'Judías blancas con verduras',time:25,difficulty:1,favorite:false,isNew:false,type:'legumbre',
    ingredients:[{name:'Judías blancas cocidas',amount:'400 g'},{name:'Pimiento rojo',amount:'1 ud'},{name:'Calabacín',amount:'1 ud'},{name:'Tomate',amount:'2 ud'},{name:'Ajo',amount:'2 dientes'}],
    steps:['Sofreír ajo, pimiento y calabacín 8 min.','Añadir tomate y cocer 5 min.','Incorporar judías y mezclar.','Cocer 5 min más y salpimentar.'] },
  { id:'s19',slots:['segundo'],name:'Rape al horno con patatas',time:40,difficulty:2,favorite:false,isNew:true,type:'pescado',
    ingredients:[{name:'Cola de rape',amount:'600 g'},{name:'Patata',amount:'3 ud'},{name:'Tomate',amount:'2 ud'},{name:'Aceitunas',amount:'50 g'},{name:'Vino blanco',amount:'100 ml'}],
    steps:['Pelar y cortar patatas, poner en bandeja.','Colocar el rape encima.','Añadir tomate, aceitunas y vino.','Hornear 30 min a 200°C.'] },
  { id:'s20',slots:['segundo'],name:'Pollo al curry verde',time:30,difficulty:2,favorite:false,isNew:true,type:'carne',
    ingredients:[{name:'Pechuga de pollo',amount:'500 g'},{name:'Leche de coco',amount:'400 ml'},{name:'Pasta de curry verde',amount:'2 cdas'},{name:'Pimiento verde',amount:'1 ud'},{name:'Cilantro',amount:'al gusto'}],
    steps:['Dorar el pollo en dados.','Añadir pasta de curry y cocinar 1 min.','Incorporar leche de coco y pimiento.','Cocer 15 min y añadir cilantro al final.'] },
  // ── CENAS ─────────────────────────────────────────────────────────
  { id:'c01',slots:['cena'],name:'Tortilla de verduras',time:20,difficulty:1,favorite:true,isNew:false,type:'huevo',
    ingredients:[{name:'Huevos',amount:'4 ud'},{name:'Calabacín',amount:'1 ud'},{name:'Pimiento rojo',amount:'1 ud'},{name:'Cebolla',amount:'½ ud'}],
    steps:['Pochar verduras cortadas finas.','Batir huevos con sal.','Mezclar huevo y verduras.','Cuajar a fuego suave y dar la vuelta.'] },
  { id:'c02',slots:['cena','primero'],name:'Crema de verduras',time:25,difficulty:1,favorite:false,isNew:false,type:'verdura',
    ingredients:[{name:'Verduras de temporada',amount:'600 g'},{name:'Cebolla',amount:'1 ud'},{name:'Caldo de verduras',amount:'400 ml'}],
    steps:['Pochar la cebolla.','Añadir verduras troceadas.','Cubrir con caldo, cocer 20 min.','Triturar y salpimentar.'] },
  { id:'c03',slots:['cena'],name:'Caballa al limón',time:15,difficulty:1,favorite:false,isNew:true,type:'pescado',
    ingredients:[{name:'Filetes de caballa',amount:'4 ud'},{name:'Limón',amount:'2 ud'},{name:'Alcaparras',amount:'2 cdas'}],
    steps:['Calentar sartén con aceite.','Cocinar caballa 3 min por lado.','Añadir limón y alcaparras.','1 min más y servir.'] },
  { id:'c04',slots:['cena'],name:'Revuelto de setas y gambas',time:15,difficulty:1,favorite:true,isNew:false,type:'huevo',
    ingredients:[{name:'Huevos',amount:'3 ud'},{name:'Setas variadas',amount:'200 g'},{name:'Gambas peladas',amount:'150 g'},{name:'Ajo',amount:'2 dientes'}],
    steps:['Saltear ajo y setas.','Añadir gambas, 2 min.','Bajar fuego, añadir huevos batidos.','Remover suavemente hasta cuajar.'] },
  { id:'c05',slots:['cena'],name:'Pavo a la plancha',time:15,difficulty:1,favorite:true,isNew:false,type:'carne',
    ingredients:[{name:'Pechuga de pavo',amount:'300 g'},{name:'Limón',amount:'1 ud'},{name:'Hierbas provenzales',amount:'al gusto'}],
    steps:['Salpimentar con hierbas.','Plancha caliente 4 min por lado.','Reposar 2 min.','Servir con limón.'] },
  { id:'c06',slots:['cena','primero'],name:'Ensalada de atún',time:10,difficulty:1,favorite:true,isNew:false,type:'pescado',
    ingredients:[{name:'Atún en lata',amount:'2 latas'},{name:'Tomate',amount:'2 ud'},{name:'Cebolla morada',amount:'½ ud'},{name:'Lechuga',amount:'1 ud'}],
    steps:['Cortar lechuga y tomate.','Cebolla muy fina.','Mezclar con atún escurrido.','Aliñar con aceite y vinagre.'] },
  { id:'c07',slots:['cena'],name:'Merluza al vapor con limón',time:20,difficulty:1,favorite:false,isNew:true,type:'pescado',
    ingredients:[{name:'Merluza en filetes',amount:'400 g'},{name:'Limón',amount:'1 ud'},{name:'Eneldo',amount:'al gusto'},{name:'Judías verdes',amount:'200 g'}],
    steps:['Cocer judías verdes al vapor 8 min.','Colocar merluza en la vaporera.','Añadir limón y eneldo.','Cocer 10 min y servir.'] },
  { id:'c08',slots:['cena'],name:'Revuelto de espárragos',time:15,difficulty:1,favorite:false,isNew:false,type:'huevo',
    ingredients:[{name:'Huevos',amount:'3 ud'},{name:'Espárragos trigueros',amount:'200 g'},{name:'Ajo',amount:'1 diente'},{name:'Jamón serrano',amount:'50 g'}],
    steps:['Saltear espárragos con ajo 3 min.','Añadir jamón, 1 min.','Bajar fuego y añadir huevos batidos.','Remover suavemente y servir.'] },
  { id:'c09',slots:['cena'],name:'Sardinas al horno',time:25,difficulty:1,favorite:false,isNew:true,type:'pescado',
    ingredients:[{name:'Sardinas limpias',amount:'500 g'},{name:'Ajo',amount:'3 dientes'},{name:'Perejil',amount:'al gusto'},{name:'Limón',amount:'1 ud'},{name:'Tomate',amount:'2 ud'}],
    steps:['Precalentar horno 200°C.','Poner tomate en rodajas en bandeja.','Colocar sardinas encima con ajo y perejil.','Hornear 15-18 min.'] },
  { id:'c10',slots:['cena'],name:'Tortilla francesa de champiñones',time:10,difficulty:1,favorite:true,isNew:false,type:'huevo',
    ingredients:[{name:'Huevos',amount:'3 ud'},{name:'Champiñones',amount:'150 g'},{name:'Ajo',amount:'1 diente'},{name:'Perejil',amount:'al gusto'}],
    steps:['Saltear champiñones con ajo.','Batir los huevos con sal.','Hacer la tortilla francesa.','Rellenar con los champiñones.'] },
  { id:'c11',slots:['cena'],name:'Boquerones al limón',time:15,difficulty:1,favorite:false,isNew:true,type:'pescado',
    ingredients:[{name:'Boquerones frescos',amount:'400 g'},{name:'Limón',amount:'2 ud'},{name:'Ajo',amount:'2 dientes'},{name:'Perejil',amount:'al gusto'}],
    steps:['Limpiar los boquerones.','Marinar con limón, ajo y perejil 5 min.','Pasar por harina y freír en aceite caliente.','Servir con limón fresco.'] },
  { id:'c12',slots:['cena'],name:'Wrap de pollo y verduras',time:15,difficulty:1,favorite:false,isNew:true,type:'carne',
    ingredients:[{name:'Tortilla de trigo',amount:'2 ud'},{name:'Pollo a la plancha',amount:'200 g'},{name:'Lechuga',amount:'2 hojas'},{name:'Tomate',amount:'1 ud'},{name:'Yogur natural',amount:'2 cdas'}],
    steps:['Calentar las tortillas.','Cortar el pollo en tiras.','Poner lechuga, pollo y tomate.','Añadir yogur como salsa y enrollar.'] },
  { id:'c13',slots:['cena'],name:'Huevos al plato con tomate',time:20,difficulty:1,favorite:false,isNew:false,type:'huevo',
    ingredients:[{name:'Huevos',amount:'4 ud'},{name:'Tomate triturado',amount:'300 g'},{name:'Ajo',amount:'1 diente'},{name:'Pimentón dulce',amount:'1 cdta'}],
    steps:['Sofreír ajo con pimentón.','Añadir tomate y cocer 10 min.','Cascar los huevos encima.','Tapar y cocinar 5 min hasta cuajar.'] },
  { id:'c14',slots:['cena'],name:'Ensalada de salmón ahumado',time:10,difficulty:1,favorite:true,isNew:false,type:'pescado',
    ingredients:[{name:'Salmón ahumado',amount:'150 g'},{name:'Rúcula',amount:'100 g'},{name:'Aguacate',amount:'1 ud'},{name:'Alcaparras',amount:'1 cda'},{name:'Limón',amount:'1 ud'}],
    steps:['Extender la rúcula en el plato.','Añadir salmón y aguacate en láminas.','Poner alcaparras por encima.','Aliñar con limón y aceite.'] },
  { id:'c15',slots:['cena'],name:'Gazpacho de sandía',time:15,difficulty:1,favorite:false,isNew:true,type:'verdura',
    ingredients:[{name:'Sandía',amount:'600 g'},{name:'Tomate',amount:'300 g'},{name:'Pepino',amount:'½ ud'},{name:'Vinagre',amount:'1 cda'},{name:'Aceite de oliva',amount:'2 cdas'}],
    steps:['Trocear la sandía y retirar pepitas.','Triturar con tomate, pepino, vinagre y aceite.','Colar si se quiere más fino.','Servir muy frío.'] },
];

const SKEY = 'msv1';
const emptyMenu = () => Object.fromEntries(DAYS.map(d=>[d,{primero:null,segundo:null,cena:null}]));

// ── Helpers fecha ─────────────────────────────────────────────────
function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
  // Usar fecha local para evitar desfase por timezone (UTC+1 en España)
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth()+1).padStart(2,'0');
  const dd   = String(d.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}
function weekLabel(weekKey) {
  const d = new Date(weekKey + 'T00:00:00');
  const end = new Date(d); end.setDate(d.getDate()+6);
  const fmt = (dt) => dt.toLocaleDateString('es-ES',{day:'numeric',month:'short'});
  return `${fmt(d)} – ${fmt(end)}`;
}
function addWeeks(weekKey, n) {
  const d = new Date(weekKey + 'T00:00:00');
  d.setDate(d.getDate() + n*7);
  return getWeekKey(d);
}

function loadLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function saveLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
// Migrar recetas del formato antiguo (slot:string) al nuevo (slots:array)
function migrateRecipes(recipes) {
  return recipes.map(r => {
    if (!r.slots && r.slot) return { ...r, slots: [r.slot] };
    if (!r.slots)            return { ...r, slots: ['segundo'] };
    return r;
  });
}

// ── Hook responsive ───────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [is, setIs] = useState(() => typeof window !== 'undefined' && window.innerWidth < breakpoint);
  useEffect(() => {
    const h = () => setIs(window.innerWidth < breakpoint);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [breakpoint]);
  return is;
}

// ── Sumar cantidades ──────────────────────────────────────────────
function parseAmount(str) {
  const s = str.trim();
  const m = s.match(/^([\d.,½¼¾]+)\s*(.*)$/);
  if (!m) return { num: null, unit: s };
  const raw = m[1].replace('½','0.5').replace('¼','0.25').replace('¾','0.75').replace(',','.');
  return { num: parseFloat(raw), unit: m[2].trim().toLowerCase() };
}
function mergeAmounts(amounts) {
  const parsed = amounts.map(parseAmount);
  const units = [...new Set(parsed.map(p => p.unit))];
  if (units.length === 1 && parsed.every(p => p.num !== null)) {
    const total = parsed.reduce((s,p) => s + p.num, 0);
    const display = Number.isInteger(total) ? total : Math.round(total * 100) / 100;
    return `${display} ${units[0]}`.trim();
  }
  return amounts.join(' + ');
}

// ── PostItSlot ────────────────────────────────────────────────────
function PostItSlot({ slotKey, menuVal, recipes, onSlotClick, onRemove, onViewRecipe }) {
  const [hover, setHover] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const s = SS[slotKey];
  const slot = SLOTS.find(x => x.key === slotKey);
  const allRecipes = [COMER_FUERA, ...recipes];
  const recipe = menuVal ? allRecipes.find(r => r.id === menuVal) : null;
  const t = recipe ? TS[recipe.type] : null;

  if (recipe) {
    const isFuera = recipe.id === '__fuera__';
    return (
      <div onClick={() => !isFuera && onViewRecipe(menuVal)}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        className="postit-filled"
        style={{
          background: 'white',
          border: `1px solid ${hover && !isFuera ? '#d1d5db' : '#ebebeb'}`,
          borderLeft: `3px solid ${isFuera ? '#d1d5db' : s.accent}`,
          boxShadow: hover && !isFuera ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
          transform: hover && !isFuera ? 'translateY(-2px)' : 'none',
          cursor: isFuera ? 'default' : 'pointer',
        }}>
        <button onClick={e => { e.stopPropagation(); onRemove(); }}
          className="postit-remove-btn"
          style={{ opacity: hover ? 1 : 0 }}>
          <X size={10} strokeWidth={3} />
        </button>
        <div className="postit-emoji">{isFuera ? '🍴' : slot.emoji}</div>
        <div className="postit-name" style={{ color: isFuera ? '#aaaaaa' : '#111111' }}>{recipe.name}</div>
        {!isFuera && (
          <div className="postit-meta">
            <Clock size={9} /><span>{recipe.time}m</span>
          </div>
        )}
        {t && <div className="postit-tag" style={{ color: s.accent, background: 'transparent' }}>{t.label.split(' ')[1]}</div>}
      </div>
    );
  }

  return (
    <button onClick={onSlotClick}
      onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}
      className="postit-empty"
      style={{
        border: `1px dashed ${btnHover ? '#c4c4c4' : '#e0e0e0'}`,
        background: btnHover ? '#fafafa' : 'white',
        color: btnHover ? '#6b7280' : '#c4c4c4',
      }}>
      <span className="postit-empty-emoji" style={{ opacity: btnHover ? 0.8 : 0.4 }}>{slot.emoji}</span>
      <Plus size={14} strokeWidth={2} />
      <span className="postit-empty-label">{slot.label}</span>
    </button>
  );
}

// ── DayColumn ─────────────────────────────────────────────────────
function DayColumn({ day, dayShort, menuDay, recipes, onSlotClick, onRemoveSlot, onViewRecipe }) {
  const filledCount = SLOTS.filter(({key}) => menuDay[key]).length;
  return (
    <div className="day-column">
      <div className="day-header">
        <div className="day-short-row">
          <span className="day-short">{dayShort}</span>
          {filledCount > 0 && <span className="day-count">{filledCount}/{SLOTS.length}</span>}
        </div>
        <div className="day-name">{day}</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {SLOTS.map(({ key }) => (
          <PostItSlot key={key} slotKey={key}
            menuVal={menuDay[key]} recipes={recipes}
            onSlotClick={() => onSlotClick(day, key)}
            onRemove={() => onRemoveSlot(day, key)}
            onViewRecipe={onViewRecipe} />
        ))}
      </div>
    </div>
  );
}

// ── RecipeCard ────────────────────────────────────────────────────
function RecipeCard({ recipe, onSelect, onToggleFav, onViewRecipe, freq }) {
  const [h, setH] = useState(false);
  const t = TS[recipe.type] || {};
  const isFuera = recipe.id === '__fuera__';
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background:'white', border:`1px solid ${h ? '#c8c8c8' : '#ebebeb'}`, borderRadius:10, padding:12,
        boxShadow: h ? '0 4px 12px rgba(0,0,0,0.07)' : 'none', transition:'all 0.15s' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {recipe.isNew && <span style={{ fontSize:'0.58rem', background:'#d1fae5', color:'#065f46', padding:'2px 6px', borderRadius:99, fontWeight:700 }}>✨ NUEVO</span>}
          {recipe.favorite && <span style={{ fontSize:'0.58rem', background:'#fef3c7', color:'#92400e', padding:'2px 6px', borderRadius:99, fontWeight:700 }}>⭐ FAV</span>}
          {freq > 0 && <span style={{ fontSize:'0.58rem', background:'#f5f5f5', color:'#aaaaaa', padding:'2px 6px', borderRadius:99, fontWeight:700 }}>{freq}x últimas semanas</span>}
        </div>
        {!isFuera && (
          <button onClick={e => { e.stopPropagation(); onToggleFav(); }}
            style={{ border:'none', background:'none', cursor:'pointer', padding:2, flexShrink:0 }}>
            <Star size={15} fill={recipe.favorite ? '#fbbf24' : 'none'} color={recipe.favorite ? '#fbbf24' : '#d1d5db'} strokeWidth={recipe.favorite ? 0 : 2} />
          </button>
        )}
      </div>
      <div style={{ fontWeight:600, fontSize:13, color: isFuera ? '#aaaaaa' : '#111111', lineHeight:1.3, marginBottom:6 }}>{recipe.name}</div>
      {!isFuera && (
        <>
          <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#9ca3af', marginBottom:4 }}>
            <Clock size={11} /><span>{recipe.time} min</span>
            <span style={{ margin:'0 2px' }}>·</span>
            <span>{'●'.repeat(recipe.difficulty)}{'○'.repeat(3 - recipe.difficulty)}</span>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginBottom:6 }}>
            {(recipe.slots||[]).map(sl => {
              const info = SLOTS.find(s => s.key === sl);
              const sc = SS[sl];
              return <span key={sl} style={{ fontSize:'0.58rem', padding:'1px 6px', borderRadius:99, fontWeight:600, background: sc.bg, color: sc.accent, border:`1px solid ${sc.border}` }}>{info?.emoji} {info?.label}</span>;
            })}
          </div>
        </>
      )}
      {t.label && (
        <div style={{ background:t.bg, color:t.color, fontSize:'0.65rem', padding:'2px 8px', borderRadius:99, display:'inline-block', fontWeight:600, marginBottom:8 }}>
          {t.label}
        </div>
      )}
      <div style={{ display:'flex', gap:6 }}>
        {!isFuera && (
          <button onClick={onViewRecipe}
            style={{ flex:1, padding:'6px 0', fontSize:11, borderRadius:6, border:'1px solid #ebebeb',
              background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4, color:'#888888', fontWeight:500 }}>
            <BookOpen size={11} /> Receta
          </button>
        )}
        <button onClick={onSelect}
          style={{ flex:1, padding:'6px 0', fontSize:11, borderRadius:6, border:'none',
            background: isFuera ? '#888888' : '#f59e0b',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4, color:'white', fontWeight:600 }}>
          <Plus size={11} /> Añadir
        </button>
      </div>
    </div>
  );
}

// ── ShoppingList ──────────────────────────────────────────────────
function ShoppingList({ items, checked, onToggle, onClearChecked, weekKey }) {
  const [copied, setCopied] = useState(false);
  const pending = items.filter(i => !checked.has(i.k));
  const done    = items.filter(i =>  checked.has(i.k));

  const buildText = () => {
    const header = `🛒 Lista de la compra — semana del ${weekLabel(weekKey)}\n`;
    const lines = pending.map(i => `• ${i.name}  ${i.amount}`).join('\n');
    const doneLines = done.length > 0 ? `\n\n✅ Ya en casa:\n` + done.map(i => `• ${i.name}`).join('\n') : '';
    return header + '\n' + lines + doneLines;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(buildText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const Row = ({ item, crossed }) => (
    <div onClick={() => onToggle(item.k)}
      style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 8px', borderRadius:8, cursor:'pointer', opacity: crossed ? 0.45 : 1 }}
      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div style={{ width:18, height:18, borderRadius:4, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
        background: crossed ? '#22c55e' : 'transparent', border: crossed ? '2px solid #22c55e' : '2px solid #d1d5db' }}>
        {crossed && <Check size={10} strokeWidth={3} color="white" />}
      </div>
      <span style={{ fontSize:13, color: crossed ? '#9ca3af' : '#374151', flex:1, textDecoration: crossed ? 'line-through' : 'none' }}>{item.name}</span>
      <span style={{ fontSize:12, color:'#9ca3af', flexShrink:0, fontWeight:500 }}>{item.amount}</span>
    </div>
  );

  return (
    <div style={{ background:'white', borderRadius:12, border:'1px solid #ebebeb', padding:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <ShoppingCart size={16} style={{ color:'#f59e0b' }} />
        <span style={{ fontWeight:600, color:'#111111', fontSize:14, flex:1 }}>Lista de la compra</span>
        {pending.length > 0 && (
          <span style={{ fontSize:11, background:'#fef3c7', color:'#92400e', padding:'2px 8px', borderRadius:99, fontWeight:700 }}>
            {pending.length}
          </span>
        )}
      </div>

      {items.length > 0 && (
        <div style={{ display:'flex', gap:6, marginBottom:12 }}>
          <button onClick={handleWhatsApp}
            style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5,
              padding:'7px 0', borderRadius:9, border:'none', background:'#25D366', color:'white',
              fontSize:12, fontWeight:700, cursor:'pointer' }}>
            <MessageCircle size={13}/> WhatsApp
          </button>
          <button onClick={handleCopy}
            style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5,
              padding:'7px 0', borderRadius:8, border:'1px solid #ebebeb', background: copied ? '#f0fdf4' : 'white',
              color: copied ? '#16a34a' : '#6b7280', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
            <Copy size={13}/> {copied ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ textAlign:'center', padding:'32px 0', color:'#d1d5db' }}>
          <ShoppingCart size={28} style={{ margin:'0 auto 8px', display:'block' }} />
          <p style={{ fontSize:13, margin:0 }}>Añade platos al menú</p>
        </div>
      ) : (
        <div style={{ overflowY:'auto', maxHeight:'60vh' }}>
          {pending.map(item => <Row key={item.k} item={item} crossed={false} />)}
          {done.length > 0 && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 8px 4px',
                fontSize:10, color:'#d1d5db', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                <span>Comprado ✓</span>
                <button onClick={onClearChecked}
                  style={{ border:'none', background:'none', fontSize:10, color:'#d1d5db', cursor:'pointer', fontWeight:600 }}>
                  limpiar
                </button>
              </div>
              {done.map(item => <Row key={item.k} item={item} crossed={true} />)}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── RecipeDrawer ──────────────────────────────────────────────────
function RecipeDrawer({ slot, recipes, filter, onFilterChange, onSelect, onClose, onToggleFav, onViewRecipe, freq }) {
  const slotInfo = SLOTS.find(s => s.key === slot.slotKey);
  const allRecipes = [COMER_FUERA, ...recipes];
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    let list = allRecipes.filter(r => r.id === '__fuera__' || (r.slots||[]).includes(slot.slotKey));
    if (filter === 'fav') list = list.filter(r => r.favorite);
    if (filter === 'new') list = list.filter(r => r.isNew);
    if (search.trim()) list = list.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [recipes, slot.slotKey, filter, search]);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:20, display:'flex', flexDirection:'column', justifyContent:'flex-end', backdropFilter:'blur(2px)' }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position:'relative', background:'white', borderRadius:'20px 20px 0 0',
        boxShadow:'0 -4px 32px rgba(0,0,0,0.18)', maxHeight:'84vh', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid #ebebeb', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontWeight:600, color:'#111111', fontSize:15 }}>
              {slotInfo.emoji} {slotInfo.label} — <span style={{ color:'#f59e0b' }}>{slot.day}</span>
            </div>
            <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>
              {search ? `${filtered.length} resultados` : `${filtered.length} opciones para este slot`}
            </div>
          </div>
          <button onClick={onClose} style={{ border:'none', background:'none', cursor:'pointer', padding:8, borderRadius:10, color:'#9ca3af' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding:'10px 16px 0', background:'white' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍 Buscar receta..."
            style={{ width:'100%', fontSize:13, padding:'8px 12px', border:'1px solid #ebebeb', borderRadius:8,
              outline:'none', color:'#333333', background:'#fafafa', boxSizing:'border-box', marginBottom:10 }} />
        </div>
        <div style={{ padding:'0 16px 10px', borderBottom:'1px solid #ebebeb', background:'white', display:'flex', gap:6, overflowX:'auto' }}>
          {[['all','Todas'],['fav','⭐ Favoritas'],['new','✨ Nuevas']].map(([v, l]) => (
            <button key={v} onClick={() => onFilterChange(v)}
              style={{ padding:'5px 14px', borderRadius:99, fontSize:12, fontWeight:600, border: filter === v ? 'none' : '1px solid #ebebeb', cursor:'pointer', flexShrink:0,
                background: filter === v ? '#f59e0b' : 'white', color: filter === v ? 'white' : '#888888', transition:'all 0.15s' }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ overflowY:'auto', flex:1, padding:16 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'#d1d5db', fontSize:13 }}>No hay recetas en esta categoría</div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {filtered.map(r => (
                <RecipeCard key={r.id} recipe={r}
                  onSelect={() => onSelect(r.id)}
                  onToggleFav={() => onToggleFav(r.id)}
                  onViewRecipe={() => onViewRecipe(r)}
                  freq={freq?.[r.id] || 0} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── RecipeModal ───────────────────────────────────────────────────
function RecipeModal({ recipe, onClose, onUpdateIngredients, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [localIngs, setLocalIngs] = useState(recipe.ingredients.map((ing, i) => ({ ...ing, _id: i })));
  const t = TS[recipe.type] || {};
  const s = SS[recipe.slots?.[0]] || { bg:'#f9fafb' };

  useEffect(() => {
    setLocalIngs(recipe.ingredients.map((ing, i) => ({ ...ing, _id: i })));
    setEditing(false);
  }, [recipe.id]);

  const handleSave = () => {
    onUpdateIngredients(recipe.id, localIngs.map(({ _id, ...rest }) => rest));
    setEditing(false);
  };
  const updateIng = (id, field, val) => setLocalIngs(prev => prev.map(ing => ing._id === id ? { ...ing, [field]: val } : ing));
  const removeIng = (id) => setLocalIngs(prev => prev.filter(ing => ing._id !== id));
  const addIng = () => setLocalIngs(prev => [...prev, { name:'', amount:'', _id: Date.now() }]);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:30, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position:'relative', background:'white', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:520, boxShadow:'0 -8px 40px rgba(0,0,0,0.2)', overflow:'hidden' }}>
        <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid #ebebeb' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
            <div style={{ flex:1 }}>
              <h2 style={{ fontWeight:700, fontSize:18, color:'#111111', margin:0, lineHeight:1.3 }}>{recipe.name}</h2>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:8, alignItems:'center' }}>
                <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, color:'#6b7280' }}><Clock size={13} />{recipe.time} min</span>
                {t.label && <span style={{ fontSize:11, padding:'3px 10px', borderRadius:99, fontWeight:600, background:t.bg, color:t.color }}>{t.label}</span>}
                {(recipe.slots||[]).map(sl => {
                  const info = SLOTS.find(x => x.key === sl); const sc = SS[sl];
                  return <span key={sl} style={{ fontSize:11, padding:'3px 8px', borderRadius:99, fontWeight:600, background:sc.bg, color:sc.accent, border:`1px solid ${sc.border}` }}>{info?.emoji} {info?.label}</span>;
                })}
              </div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {onEdit && (
                <button onClick={()=>onEdit(recipe)}
                  style={{ border:'1px solid #ebebeb', background:'white', cursor:'pointer', padding:8, borderRadius:8, color:'#666666', display:'flex', alignItems:'center', gap:4, fontSize:12, fontWeight:600 }}>
                  <Pencil size={14}/> Editar
                </button>
              )}
              <button onClick={onClose} style={{ border:'1px solid #ebebeb', background:'white', cursor:'pointer', padding:8, borderRadius:8, color:'#888888' }}>
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
        <div style={{ overflowY:'auto', maxHeight:'62vh' }}>
          <div style={{ padding:'16px 20px 8px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'0.1em', textTransform:'uppercase' }}>🛒 Ingredientes</div>
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#f59e0b', border:'1px solid #fde68a', background:'#fffbeb', borderRadius:8, padding:'4px 10px', cursor:'pointer', fontWeight:600 }}>
                  <Pencil size={11} /> Editar
                </button>
              ) : (
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => { setLocalIngs(recipe.ingredients.map((ing,i) => ({...ing,_id:i}))); setEditing(false); }}
                    style={{ fontSize:11, color:'#aaaaaa', border:'1px solid #ebebeb', background:'white', borderRadius:6, padding:'4px 10px', cursor:'pointer', fontWeight:600 }}>
                    Cancelar
                  </button>
                  <button onClick={handleSave}
                    style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'white', border:'none', background:'#22c55e', borderRadius:8, padding:'4px 10px', cursor:'pointer', fontWeight:600 }}>
                    <Save size={11} /> Guardar
                  </button>
                </div>
              )}
            </div>
            {!editing ? (
              localIngs.map((ing, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #f0f0f0' }}>
                  <span style={{ fontSize:14, color:'#333333' }}>{ing.name}</span>
                  <span style={{ fontSize:14, color:'#aaaaaa', fontWeight:500 }}>{ing.amount}</span>
                </div>
              ))
            ) : (
              <>
                {localIngs.map(ing => (
                  <div key={ing._id} style={{ display:'flex', gap:6, alignItems:'center', marginBottom:6 }}>
                    <input value={ing.name} onChange={e => updateIng(ing._id, 'name', e.target.value)} placeholder="Ingrediente"
                      style={{ flex:2, fontSize:13, padding:'7px 9px', border:'1px solid #e0e0e0', borderRadius:6, outline:'none', color:'#333333' }} />
                    <input value={ing.amount} onChange={e => updateIng(ing._id, 'amount', e.target.value)} placeholder="Cantidad"
                      style={{ flex:1, fontSize:13, padding:'7px 9px', border:'1px solid #e0e0e0', borderRadius:6, outline:'none', color:'#333333' }} />
                    <button onClick={() => removeIng(ing._id)}
                      style={{ border:'none', background:'#fee2e2', color:'#ef4444', borderRadius:8, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button onClick={addIng}
                  style={{ width:'100%', marginTop:4, padding:'8px', fontSize:12, color:'#f59e0b', border:'1px dashed #fde68a', background:'#fffbeb', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                  + Añadir ingrediente
                </button>
              </>
            )}
          </div>
          <div style={{ padding:'12px 20px 28px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12 }}>👩‍🍳 Preparación</div>
            {recipe.steps.map((step, i) => (
              <div key={i} style={{ display:'flex', gap:12, marginBottom:12 }}>
                <div style={{ width:24, height:24, borderRadius:'50%', background:'#f59e0b', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, fontWeight:700, color:'white' }}>
                  {i + 1}
                </div>
                <span style={{ fontSize:14, color:'#444444', lineHeight:1.6, paddingTop:3 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RecipeEditor ──────────────────────────────────────────────────
const BLANK_RECIPE = () => ({
  id: 'usr_' + Date.now(),
  name:'', type:'verdura', slots:['segundo'],
  time:20, difficulty:1,
  favorite:false, isNew:true,
  ingredients:[{ name:'', amount:'', _id:0 }],
  steps:[''],
});

function RecipeEditor({ recipe, onSave, onDelete, onClose }) {
  const isNew = !recipe;
  const [form, setForm] = useState(() => recipe
    ? { ...recipe, ingredients: recipe.ingredients.map((i,idx)=>({...i,_id:idx})), steps:[...recipe.steps] }
    : BLANK_RECIPE()
  );

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const toggleSlot = (sk) => setForm(p => {
    const has = p.slots.includes(sk);
    if (has && p.slots.length === 1) return p;
    return { ...p, slots: has ? p.slots.filter(s=>s!==sk) : [...p.slots, sk] };
  });

  const updIng  = (id, f, v) => setForm(p => ({ ...p, ingredients: p.ingredients.map(i => i._id===id ? {...i,[f]:v} : i) }));
  const remIng  = (id)       => setForm(p => ({ ...p, ingredients: p.ingredients.filter(i => i._id!==id) }));
  const addIng  = ()         => setForm(p => ({ ...p, ingredients: [...p.ingredients, {name:'',amount:'',_id:Date.now()}] }));
  const updStep = (idx, v)   => setForm(p => { const s=[...p.steps]; s[idx]=v; return {...p,steps:s}; });
  const remStep = (idx)      => setForm(p => ({ ...p, steps: p.steps.filter((_,i)=>i!==idx) }));
  const addStep = ()         => setForm(p => ({ ...p, steps: [...p.steps, ''] }));

  const handleSave = () => {
    if (!form.name.trim()) { alert('Ponle un nombre a la receta'); return; }
    if (form.ingredients.some(i=>!i.name.trim())) { alert('Rellena el nombre de todos los ingredientes'); return; }
    if (form.steps.some(s=>!s.trim())) { alert('Rellena todos los pasos'); return; }
    const clean = { ...form, ingredients: form.ingredients.map(({_id,...r})=>r) };
    onSave(clean);
  };

  const inputStyle = { width:'100%', fontSize:13, padding:'8px 10px', border:'1px solid #e0e0e0', borderRadius:6, outline:'none', color:'#333333', background:'white' };
  const labelStyle = { fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', display:'block', marginBottom:5 };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:40, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)' }} onClick={onClose} />
      <div style={{ position:'relative', background:'white', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:540,
        boxShadow:'0 -8px 40px rgba(0,0,0,0.25)', display:'flex', flexDirection:'column', maxHeight:'92vh' }}>
        <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid #ebebeb', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div style={{ fontWeight:700, fontSize:16, color:'#111111' }}>{isNew ? '✨ Nueva receta' : '✏️ Editar receta'}</div>
          <button onClick={onClose} style={{ border:'1px solid #ebebeb', background:'white', cursor:'pointer', padding:8, borderRadius:8, color:'#888888' }}><X size={16} /></button>
        </div>
        <div style={{ overflowY:'auto', flex:1, padding:'16px 20px 24px' }}>
          <div style={{ marginBottom:16 }}>
            <label style={labelStyle}>Nombre del plato</label>
            <input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Ej: Merluza al limón con alcaparras"
              style={{ ...inputStyle, fontSize:15, fontWeight:600 }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }}>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select value={form.type} onChange={e=>set('type',e.target.value)} style={inputStyle}>
                {Object.entries(TS).filter(([k])=>k!=='fuera').map(([k,v])=>(
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Dificultad</label>
              <select value={form.difficulty} onChange={e=>set('difficulty',Number(e.target.value))} style={inputStyle}>
                <option value={1}>Fácil</option>
                <option value={2}>Media</option>
                <option value={3}>Difícil</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tiempo (min)</label>
              <input type="number" min={1} max={240} value={form.time} onChange={e=>set('time',Number(e.target.value))} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={labelStyle}>Para qué momento (elige varios si aplica)</label>
            <div style={{ display:'flex', gap:8 }}>
              {SLOTS.map(sl => {
                const sc = SS[sl.key]; const active = form.slots.includes(sl.key);
                return (
                  <button key={sl.key} onClick={()=>toggleSlot(sl.key)}
                    style={{ flex:1, padding:'8px 4px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                      border: active ? `2px solid ${sc.border}` : '2px solid #ebebeb',
                      background: active ? sc.bg : 'white', color: active ? sc.accent : '#aaaaaa' }}>
                    {sl.emoji}<br/>{sl.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginBottom:20 }}>
            {[['favorite','⭐ Favorita','#fef3c7','#92400e'],['isNew','✨ Receta nueva','#d1fae5','#065f46']].map(([f,l,bg,color])=>(
              <button key={f} onClick={()=>set(f,!form[f])}
                style={{ flex:1, padding:'8px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer',
                  border: form[f] ? 'none' : '1px solid #ebebeb',
                  background: form[f] ? bg : 'white', color: form[f] ? color : '#aaaaaa' }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={labelStyle}>Ingredientes</label>
            {form.ingredients.map(ing => (
              <div key={ing._id} style={{ display:'flex', gap:6, marginBottom:7, alignItems:'center' }}>
                <input value={ing.name} onChange={e=>updIng(ing._id,'name',e.target.value)} placeholder="Ingrediente" style={{ ...inputStyle, flex:2 }} />
                <input value={ing.amount} onChange={e=>updIng(ing._id,'amount',e.target.value)} placeholder="Cantidad" style={{ ...inputStyle, flex:1 }} />
                <button onClick={()=>remIng(ing._id)} disabled={form.ingredients.length===1}
                  style={{ border:'none', background: form.ingredients.length===1 ? '#f9fafb' : '#fee2e2',
                    color: form.ingredients.length===1 ? '#d1d5db' : '#ef4444',
                    borderRadius:8, width:30, height:34, display:'flex', alignItems:'center', justifyContent:'center', cursor: form.ingredients.length===1 ? 'default' : 'pointer', flexShrink:0 }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button onClick={addIng} style={{ width:'100%', padding:'8px', fontSize:12, color:'#f59e0b', border:'1px dashed #fde68a', background:'#fffbeb', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
              + Añadir ingrediente
            </button>
          </div>
          <div>
            <label style={labelStyle}>Pasos de preparación</label>
            {form.steps.map((step, idx) => (
              <div key={idx} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'flex-start' }}>
                <div style={{ width:24, height:24, borderRadius:'50%', background:'#f59e0b', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, fontWeight:700, color:'white', marginTop:5 }}>
                  {idx+1}
                </div>
                <textarea value={step} onChange={e=>updStep(idx,e.target.value)} rows={2} placeholder={`Paso ${idx+1}...`}
                  style={{ ...inputStyle, flex:1, resize:'vertical', lineHeight:1.5 }} />
                <button onClick={()=>remStep(idx)} disabled={form.steps.length===1}
                  style={{ border:'none', background: form.steps.length===1 ? '#f9fafb' : '#fee2e2',
                    color: form.steps.length===1 ? '#d1d5db' : '#ef4444',
                    borderRadius:8, width:30, height:34, display:'flex', alignItems:'center', justifyContent:'center', cursor: form.steps.length===1 ? 'default' : 'pointer', flexShrink:0, marginTop:2 }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button onClick={addStep} style={{ width:'100%', padding:'8px', fontSize:12, color:'#aaaaaa', border:'1px dashed #e0e0e0', background:'#fafafa', borderRadius:6, cursor:'pointer', fontWeight:600 }}>
              + Añadir paso
            </button>
          </div>
        </div>
        <div style={{ padding:'14px 20px', borderTop:'1px solid #ebebeb', display:'flex', gap:10, flexShrink:0, background:'white' }}>
          {!isNew && (
            <button onClick={()=>{ if(window.confirm('¿Eliminar esta receta?')) onDelete(form.id); }}
              style={{ padding:'10px 16px', borderRadius:10, fontSize:13, border:'none', background:'#fee2e2', color:'#ef4444', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
              <Trash2 size={14}/> Eliminar
            </button>
          )}
          <button onClick={onClose} style={{ flex:1, padding:'10px', borderRadius:8, fontSize:13, border:'1px solid #ebebeb', background:'white', color:'#888888', cursor:'pointer', fontWeight:600 }}>
            Cancelar
          </button>
          <button onClick={handleSave}
            style={{ flex:2, padding:'10px', borderRadius:10, fontSize:13, border:'none', background:'#f59e0b', color:'white', cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <Save size={14}/> {isNew ? 'Crear receta' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── RecipeManager ─────────────────────────────────────────────────
function RecipeManager({ recipes, onEdit, onNew, onToggleFav }) {
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [slotFilter, setSlotFilter] = useState('all');

  const filtered = useMemo(() => recipes.filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (slotFilter !== 'all' && !(r.slots||[]).includes(slotFilter)) return false;
    return true;
  }), [recipes, search, typeFilter, slotFilter]);

  const userRecipes    = filtered.filter(r => r.id.startsWith('usr_'));
  const defaultRecipes = filtered.filter(r => !r.id.startsWith('usr_'));

  const Section = ({ title, items }) => items.length === 0 ? null : (
    <>
      <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'0.1em', textTransform:'uppercase', padding:'12px 0 6px' }}>
        {title} ({items.length})
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:10, marginBottom:8 }}>
        {items.map(r => (
          <div key={r.id} style={{ background:'white', border:'1px solid #ebebeb', borderRadius:10, padding:12, display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:13, color:'#111111', lineHeight:1.3, marginBottom:3 }}>{r.name}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                  {(r.slots||[]).map(sl => { const info=SLOTS.find(s=>s.key===sl); const sc=SS[sl];
                    return <span key={sl} style={{ fontSize:'0.58rem', padding:'1px 5px', borderRadius:99, fontWeight:600, background:sc.bg, color:sc.accent }}>{info?.emoji}</span>; })}
                  {TS[r.type] && <span style={{ fontSize:'0.58rem', padding:'1px 6px', borderRadius:99, fontWeight:600, background:TS[r.type].bg, color:TS[r.type].color }}>{TS[r.type].label}</span>}
                </div>
              </div>
              <button onClick={()=>onToggleFav(r.id)} style={{ border:'none', background:'none', cursor:'pointer', padding:2 }}>
                <Star size={14} fill={r.favorite?'#fbbf24':'none'} color={r.favorite?'#fbbf24':'#d1d5db'} strokeWidth={r.favorite?0:2}/>
              </button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#9ca3af' }}>
              <Clock size={10}/><span>{r.time} min</span><span>·</span>
              <span>{'●'.repeat(r.difficulty)}{'○'.repeat(3-r.difficulty)}</span>
            </div>
            <button onClick={()=>onEdit(r)}
              style={{ width:'100%', marginTop:2, padding:'6px', fontSize:11, borderRadius:6, border:'1px solid #ebebeb', background:'white', cursor:'pointer', color:'#888888', fontWeight:500, display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
              <Pencil size={11}/> Editar
            </button>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div style={{ maxWidth:960, margin:'0 auto', padding:16 }}>
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar receta..."
          style={{ flex:1, minWidth:160, fontSize:13, padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8, outline:'none', color:'#333333' }}/>
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}
          style={{ fontSize:12, padding:'8px 10px', border:'1px solid #e0e0e0', borderRadius:8, outline:'none', color:'#666666', background:'white' }}>
          <option value="all">Todos los tipos</option>
          {Object.entries(TS).filter(([k])=>k!=='fuera').map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={slotFilter} onChange={e=>setSlotFilter(e.target.value)}
          style={{ fontSize:12, padding:'8px 10px', border:'1px solid #e0e0e0', borderRadius:8, outline:'none', color:'#666666', background:'white' }}>
          <option value="all">Todos los momentos</option>
          {SLOTS.map(s=><option key={s.key} value={s.key}>{s.emoji} {s.label}</option>)}
        </select>
        <button onClick={onNew}
          style={{ padding:'8px 16px', borderRadius:10, fontSize:13, fontWeight:700, border:'none', background:'#f59e0b', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <Plus size={14}/> Nueva receta
        </button>
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px 0', color:'#d1d5db' }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🍽️</div>
          <p style={{ fontSize:14 }}>No hay recetas con ese filtro</p>
        </div>
      ) : (
        <>
          <Section title="Mis recetas" items={userRecipes} />
          <Section title="Recetas incluidas" items={defaultRecipes} />
        </>
      )}
    </div>
  );
}

// ── Calcular frecuencia de recetas ───────────────────────────────
function getFrequency(history, weekKey, weeks = 8) {
  const freq = {};
  const keys = Object.keys(history).sort().reverse();
  // Excluir la semana actual del conteo
  const pastKeys = keys.filter(k => k !== weekKey).slice(0, weeks);
  pastKeys.forEach(wk => {
    const menu = history[wk];
    DAYS.forEach(day => {
      SLOTS.forEach(({ key }) => {
        const rid = menu?.[day]?.[key];
        if (rid && rid !== '__fuera__') freq[rid] = (freq[rid] || 0) + 1;
      });
    });
  });
  return freq;
}

// ── HistoryPanel ─────────────────────────────────────────────────
function HistoryPanel({ history, recipes, currentWeekKey, onWeekSelect }) {
  const sortedWeeks = Object.keys(history).sort().reverse().filter(k => {
    return Object.values(history[k]).some(d => Object.values(d).some(Boolean));
  });
  const freq = getFrequency(history, currentWeekKey, 12);
  const topRecipes = Object.entries(freq)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 10)
    .map(([id, count]) => ({ recipe: recipes.find(r => r.id === id), count }))
    .filter(x => x.recipe);

  return (
    <div style={{ maxWidth:960, margin:'0 auto', padding:16 }}>
      <div className="history-grid">

        {/* Ranking de frecuencia */}
        <div style={{ background:'white', borderRadius:12, border:'1px solid #ebebeb', padding:16 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#111111', marginBottom:4 }}>🏆 Lo que más coméis</div>
          <div style={{ fontSize:11, color:'#9ca3af', marginBottom:14 }}>Últimas 12 semanas</div>
          {topRecipes.length === 0 ? (
            <div style={{ textAlign:'center', padding:'24px 0', color:'#d1d5db', fontSize:13 }}>
              Aún no hay historial suficiente
            </div>
          ) : topRecipes.map(({ recipe: r, count }, i) => {
            const t = TS[r.type] || {};
            const maxCount = topRecipes[0].count;
            return (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{ width:20, fontSize:12, fontWeight:700, color: i < 3 ? '#f59e0b' : '#d1d5db', textAlign:'right', flexShrink:0 }}>
                  {i+1}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'#374151', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.name}</div>
                  <div style={{ marginTop:3, height:4, borderRadius:99, background:'#f0f0f0', overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:99, background: i===0 ? '#f59e0b' : i===1 ? '#fbbf24' : '#fde68a', width: `${(count/maxCount)*100}%`, transition:'width 0.3s' }} />
                  </div>
                </div>
                {t.label && <span style={{ fontSize:'0.6rem', padding:'1px 6px', borderRadius:99, fontWeight:600, background:t.bg, color:t.color, flexShrink:0 }}>{t.label}</span>}
                <span style={{ fontSize:12, fontWeight:700, color:'#9ca3af', flexShrink:0 }}>{count}x</span>
              </div>
            );
          })}
        </div>

        {/* Semanas guardadas */}
        <div style={{ background:'white', borderRadius:12, border:'1px solid #ebebeb', padding:16 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#111111', marginBottom:4 }}>📅 Semanas guardadas</div>
          <div style={{ fontSize:11, color:'#9ca3af', marginBottom:14 }}>{sortedWeeks.length} semanas con menú</div>
          {sortedWeeks.length === 0 ? (
            <div style={{ textAlign:'center', padding:'24px 0', color:'#d1d5db', fontSize:13 }}>
              Aún no hay semanas guardadas
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:420, overflowY:'auto' }}>
              {sortedWeeks.map(wk => {
                const menu = history[wk];
                const total = Object.values(menu).reduce((a,d)=>a+Object.values(d).filter(Boolean).length, 0);
                const isCurrent = wk === currentWeekKey;
                const typeCount = {};
                DAYS.forEach(d => SLOTS.forEach(({key}) => {
                  const rid = menu[d]?.[key]; if(!rid || rid==='__fuera__') return;
                  const rec = recipes.find(r=>r.id===rid); if(!rec) return;
                  typeCount[rec.type] = (typeCount[rec.type]||0)+1;
                }));
                return (
                  <button key={wk} onClick={()=>onWeekSelect(wk)}
                    style={{ textAlign:'left', padding:'10px 12px', borderRadius:8, border: isCurrent ? '2px solid #f59e0b' : '1px solid #ebebeb',
                      background: isCurrent ? '#fffbeb' : 'white', cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={e=>{ if(!isCurrent) e.currentTarget.style.background='#fafafa'; }}
                    onMouseLeave={e=>{ if(!isCurrent) e.currentTarget.style.background='white'; }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:12, fontWeight:600, color: isCurrent?'#92400e':'#333333' }}>
                        {isCurrent ? '● ' : ''}{weekLabel(wk)}
                      </span>
                      <span style={{ fontSize:11, color:'#9ca3af' }}>{total}/21 platos</span>
                    </div>
                    <div style={{ display:'flex', gap:4, marginTop:5, flexWrap:'wrap' }}>
                      {Object.entries(typeCount).map(([type, n]) => {
                        const t = TS[type]; if(!t) return null;
                        return <span key={type} style={{ fontSize:'0.6rem', padding:'1px 6px', borderRadius:99, fontWeight:600, background:t.bg, color:t.color }}>{t.label.split(' ')[1]} ×{n}</span>;
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── WeekPicker ────────────────────────────────────────────────────
function WeekPicker({ weekKey, onChange, history }) {
  const isCurrentWeek = weekKey === getWeekKey(new Date());
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <button onClick={() => onChange(addWeeks(weekKey, -1))}
        style={{ border:'1px solid #ebebeb', background:'white', cursor:'pointer', borderRadius:6, width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', color:'#888888' }}>
        <ChevronLeft size={15} />
      </button>
      <div style={{ textAlign:'center', minWidth:160 }}>
        <div style={{ fontSize:11, fontWeight:700, color: isCurrentWeek ? '#f59e0b' : '#bbbbbb', textTransform:'uppercase', letterSpacing:'0.05em' }}>
          {isCurrentWeek ? '● Esta semana' : '○ Semana'}
        </div>
        <div style={{ fontSize:12, fontWeight:600, color:'#333333' }}>{weekLabel(weekKey)}</div>
      </div>
      <button onClick={() => onChange(addWeeks(weekKey, 1))}
        style={{ border:'1px solid #ebebeb', background:'white', cursor:'pointer', borderRadius:6, width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', color:'#888888' }}>
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  const [recipes, setRecipes] = useState(() => migrateRecipes(loadLS(SKEY+'_recipes', RECIPES_BASE)));
  const [history, setHistory]           = useState(() => loadLS(SKEY+'_history', {}));
  const [checked, setChecked]           = useState(() => new Set(loadLS(SKEY+'_checked', [])));
  const [weekKey, setWeekKey]           = useState(() => getWeekKey(new Date()));
  const [activeSlot, setActiveSlot]     = useState(null);
  const [recipeModal, setRecipeModal]   = useState(null);
  const [recipeEditor, setRecipeEditor] = useState(null); // null=cerrado, false=nueva, obj=editar
  const [mobileTab, setMobileTab]       = useState('board');
  const [drawerFilter, setDrawerFilter] = useState('all');
  const [showClear, setShowClear]       = useState(false);
  const [dbSyncing, setDbSyncing]       = useState(true);
  const [selectedDay, setSelectedDay]   = useState(() => {
    const jsDay = new Date().getDay();
    const idx = jsDay === 0 ? 6 : jsDay - 1; // Sun→6, Mon→0
    return DAYS[idx];
  });

  // ── Carga inicial desde Supabase ──────────────────────────────
  useEffect(() => {
    Promise.all([
      dbLoad('recipes'),
      dbLoad('history'),
      dbLoad('checked'),
    ]).then(([dbRecipes, dbHistory, dbChecked]) => {
      if (dbRecipes) {
        const migrated = migrateRecipes(dbRecipes);
        setRecipes(migrated);
        saveLS(SKEY+'_recipes', migrated);
      } else {
        // Supabase vacío: migrar datos de localStorage a Supabase
        setRecipes(prev => { dbSave('recipes', prev); return prev; });
      }
      if (dbHistory) {
        setHistory(dbHistory);
        saveLS(SKEY+'_history', dbHistory);
      } else {
        setHistory(prev => { dbSave('history', prev); return prev; });
      }
      if (dbChecked) {
        setChecked(new Set(dbChecked));
        saveLS(SKEY+'_checked', dbChecked);
      } else {
        setChecked(prev => { dbSave('checked', [...prev]); return prev; });
      }
    }).catch(() => {}).finally(() => {
      setDbSyncing(false);
    });
  }, []);

  const menu = history[weekKey] || emptyMenu();
  const setMenu = useCallback((updater) => {
    setHistory(prev => {
      const current = prev[weekKey] || emptyMenu();
      const next = typeof updater === 'function' ? updater(current) : updater;
      const newHistory = { ...prev, [weekKey]: next };
      saveLS(SKEY+'_history', newHistory);
      return newHistory;
    });
  }, [weekKey]);

  useEffect(() => {
    saveLS(SKEY+'_recipes', recipes);
    dbSave('recipes', recipes);
  }, [recipes]);

  useEffect(() => {
    saveLS(SKEY+'_checked', [...checked]);
    dbSave('checked', [...checked]);
  }, [checked]);

  useEffect(() => {
    dbSave('history', history);
  }, [history]);

  useEffect(() => {
    if (recipeModal) {
      const updated = recipes.find(r => r.id === recipeModal.id);
      if (updated) setRecipeModal(updated);
    }
  }, [recipes]);

  const shoppingList = useMemo(() => {
    const raw = {};
    DAYS.forEach(day => {
      SLOTS.forEach(({ key }) => {
        const rid = menu[day]?.[key];
        if (!rid || rid === '__fuera__') return;
        const rec = recipes.find(r => r.id === rid); if (!rec) return;
        rec.ingredients.forEach(ing => {
          const nameKey = ing.name.trim().toLowerCase();
          if (!raw[nameKey]) raw[nameKey] = { name: ing.name, amounts: [] };
          raw[nameKey].amounts.push(ing.amount);
        });
      });
    });
    return Object.values(raw).map(({ name, amounts }) => ({ k: name.toLowerCase(), name, amount: mergeAmounts(amounts) }));
  }, [menu, recipes]);

  const totalPlatos    = Object.values(menu).reduce((a, d) => a + Object.values(d).filter(Boolean).length, 0);
  const uncheckedCount = shoppingList.filter(i => !checked.has(i.k)).length;

  const handleUpdateIngredients = (recipeId, newIngredients) => {
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, ingredients: newIngredients } : r));
    setChecked(prev => {
      const validKeys = new Set(newIngredients.map(ing => ing.name.trim().toLowerCase()));
      const next = new Set(prev);
      [...prev].forEach(k => { if (!validKeys.has(k)) next.delete(k); });
      return next;
    });
  };

  const handleSaveRecipe = (recipe) => {
    setRecipes(prev => {
      const exists = prev.find(r => r.id === recipe.id);
      return exists ? prev.map(r => r.id === recipe.id ? recipe : r) : [...prev, recipe];
    });
    setRecipeEditor(null);
  };

  const handleDeleteRecipe = (id) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    setHistory(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(wk => {
        const w = { ...next[wk] };
        DAYS.forEach(d => { SLOTS.forEach(({key}) => { if(w[d]?.[key]===id) w[d]={...w[d],[key]:null}; }); });
        next[wk] = w;
      });
      saveLS(SKEY+'_history', next);
      return next;
    });
    setRecipeEditor(null);
    // dbSave for history triggered by the useEffect above
  };

  const TABS = [
    { key:'board',   icon:'🗓', label:'Pizarra' },
    { key:'recipes', icon:'📖', label:'Recetas' },
    { key:'history', icon:'📊', label:'Historial' },
    { key:'shop',    icon:'🛒', label:'Compra' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f5', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>

      {/* HEADER */}
      <div className="app-header">
        <div className="header-inner">
          {/* Fila 1: título + tabs (desktop) */}
          <div className="header-row1">
            <div className="header-brand">
              <span className="header-logo">🥘</span>
              <div>
                <div className="header-title">Menú Semanal</div>
                <div className="header-subtitle">
                  {dbSyncing
                    ? '⏳ Sincronizando…'
                    : `${totalPlatos}/${DAYS.length * 3} platos planificados`}
                </div>
              </div>
            </div>
            {/* Tabs — solo visibles en desktop */}
            <div className="desktop-tabs">
              {TABS.map(({ key, icon, label }) => (
                <button key={key} onClick={() => setMobileTab(key)}
                  className={`desktop-tab-btn ${mobileTab === key ? 'active' : ''}`}>
                  <span>{icon}</span>
                  <span>{label}</span>
                  {key === 'shop' && uncheckedCount > 0 && (
                    <span className="tab-badge">{uncheckedCount}</span>
                  )}
                </button>
              ))}
              <button onClick={() => setShowClear(v => !v)}
                className="more-btn" title="Más opciones">···</button>
            </div>
          </div>
          {/* Fila 2: selector semana / botón nueva receta + limpiar */}
          <div className="header-row2">
            {mobileTab === 'recipes' || mobileTab === 'history' ? (
              <button onClick={() => setRecipeEditor(false)} className="btn-new-recipe">
                <Plus size={13}/> Nueva receta
              </button>
            ) : (
              <WeekPicker weekKey={weekKey} onChange={setWeekKey} history={history} />
            )}
            {mobileTab !== 'recipes' && showClear && (
              <button onClick={() => { if (window.confirm('¿Limpiar el menú de esta semana?')) { setMenu(emptyMenu()); setShowClear(false); }}}
                className="btn-clear-week">
                🗑 Limpiar semana
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB: RECETAS */}
      {mobileTab === 'recipes' && (
        <div className="tab-content">
          <RecipeManager recipes={recipes}
            onEdit={r => setRecipeEditor(r)}
            onNew={() => setRecipeEditor(false)}
            onToggleFav={id => setRecipes(p => p.map(r => r.id === id ? { ...r, favorite:!r.favorite } : r))} />
        </div>
      )}

      {/* TAB: HISTORIAL */}
      {mobileTab === 'history' && (
        <div className="tab-content">
          <HistoryPanel history={history} recipes={recipes} currentWeekKey={weekKey}
            onWeekSelect={wk => { setWeekKey(wk); setMobileTab('board'); }} />
        </div>
      )}

      {/* MAIN: PIZARRA + LISTA */}
      {mobileTab !== 'recipes' && (
        <div className="main-layout">

          {/* PIZARRA */}
          <div className={`board-area ${mobileTab === 'shop' ? 'hidden-mobile' : ''}`}>

            {/* ── MÓVIL: selector de días + vista de un día ── */}
            <div className="mobile-board">
              {/* Pills de días */}
              <div className="day-pills-row">
                {DAYS.map((day, di) => {
                  const filled = SLOTS.filter(({key}) => menu[day]?.[key]).length;
                  const isToday = di === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                  return (
                    <button key={day} className={`day-pill ${selectedDay === day ? 'active' : ''} ${isToday ? 'today' : ''}`}
                      onClick={() => setSelectedDay(day)}>
                      <span className="day-pill-short">{DAYS_SHORT[di]}</span>
                      <span className={`day-pill-dot ${filled === 3 ? 'full' : filled > 0 ? 'partial' : 'empty'}`} />
                    </button>
                  );
                })}
              </div>
              {/* Nombre del día seleccionado */}
              <div className="selected-day-header">
                <span className="selected-day-name">{selectedDay}</span>
                <span className="selected-day-count">
                  {SLOTS.filter(({key}) => menu[selectedDay]?.[key]).length}/{SLOTS.length} platos
                </span>
              </div>
              {/* Slots del día seleccionado en formato grande */}
              <div className="mobile-slots">
                {SLOTS.map(({ key, label, emoji }) => (
                  <div key={key} className="mobile-slot-row">
                    <div className="mobile-slot-label">
                      <span className="mobile-slot-emoji">{emoji}</span>
                      <span className="mobile-slot-text">{label}</span>
                    </div>
                    <PostItSlot slotKey={key}
                      menuVal={menu[selectedDay]?.[key]} recipes={recipes}
                      onSlotClick={() => { setDrawerFilter('all'); setActiveSlot({ day:selectedDay, slotKey:key }); }}
                      onRemove={() => setMenu(p => ({ ...p, [selectedDay]:{ ...p[selectedDay], [key]:null } }))}
                      onViewRecipe={rid => { const r = rid === '__fuera__' ? null : recipes.find(x => x.id === rid); if(r) setRecipeModal(r); }} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── DESKTOP: todos los días en scroll horizontal ── */}
            <div className="desktop-board">
              <div style={{ overflowX:'auto', paddingBottom:8, WebkitOverflowScrolling:'touch' }}>
                <div style={{ display:'flex', gap:10, minWidth:'max-content' }}>
                  {DAYS.map((day, di) => (
                    <DayColumn key={day} day={day} dayShort={DAYS_SHORT[di]}
                      menuDay={menu[day] || { primero:null, segundo:null, cena:null }}
                      recipes={recipes}
                      onSlotClick={(d, sk) => { setDrawerFilter('all'); setActiveSlot({ day:d, slotKey:sk }); }}
                      onRemoveSlot={(d, sk) => setMenu(p => ({ ...p, [d]:{ ...p[d], [sk]:null } }))}
                      onViewRecipe={rid => { const r = rid === '__fuera__' ? null : recipes.find(x => x.id === rid); if(r) setRecipeModal(r); }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="board-hint">
              💡 Toca + para añadir · Pulsa el post-it para ver la receta
            </div>
          </div>

          {/* LISTA COMPRA */}
          <div className={`shopping-sidebar ${mobileTab === 'board' ? 'hidden-mobile' : ''}`} id="sidebar-shopping">
            <ShoppingList items={shoppingList} checked={checked} weekKey={weekKey}
              onToggle={k => setChecked(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; })}
              onClearChecked={() => setChecked(p => { const n = new Set(p); shoppingList.filter(i => p.has(i.k)).forEach(i => n.delete(i.k)); return n; })} />
          </div>
        </div>
      )}

      {/* BOTTOM NAV — solo móvil */}
      <nav className="bottom-nav">
        {TABS.map(({ key, icon, label }) => (
          <button key={key} onClick={() => setMobileTab(key)}
            className={`bottom-nav-btn ${mobileTab === key ? 'active' : ''}`}>
            <span className="bottom-nav-icon">{icon}</span>
            <span className="bottom-nav-label">{label}</span>
            {key === 'shop' && uncheckedCount > 0 && (
              <span className="bottom-nav-badge">{uncheckedCount}</span>
            )}
          </button>
        ))}
      </nav>

      {/* DRAWER */}
      {activeSlot && (
        <RecipeDrawer slot={activeSlot} recipes={recipes} filter={drawerFilter}
          freq={getFrequency(history, weekKey)}
          onFilterChange={setDrawerFilter}
          onSelect={rid => { setMenu(p => ({ ...p, [activeSlot.day]:{ ...p[activeSlot.day], [activeSlot.slotKey]:rid } })); setActiveSlot(null); }}
          onClose={() => setActiveSlot(null)}
          onToggleFav={id => setRecipes(p => p.map(r => r.id === id ? { ...r, favorite:!r.favorite } : r))}
          onViewRecipe={setRecipeModal} />
      )}

      {/* MODAL RECETA */}
      {recipeModal && (
        <RecipeModal recipe={recipeModal} onClose={() => setRecipeModal(null)}
          onUpdateIngredients={handleUpdateIngredients}
          onEdit={r => { setRecipeModal(null); setRecipeEditor(r); }} />
      )}

      {/* EDITOR RECETA */}
      {recipeEditor !== null && (
        <RecipeEditor
          recipe={recipeEditor || null}
          onSave={handleSaveRecipe}
          onDelete={handleDeleteRecipe}
          onClose={() => setRecipeEditor(null)} />
      )}

      <style>{`
        /* ── ESTILO: MINIMALISTA PURO ───────────────── */
        /* Reset */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f5f5; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 2px; }
        input:focus, textarea:focus, select:focus {
          border-color: #f59e0b !important;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.12) !important;
          outline: none;
        }
        button { font-family: inherit; }

        /* ── Header ────────────────────────────────── */
        .app-header {
          background: #ffffff;
          border-bottom: 1px solid #ebebeb;
          position: sticky; top: 0; z-index: 50;
        }
        .header-inner { max-width: 1300px; margin: 0 auto; padding: 12px 20px; }
        .header-row1 { display: flex; align-items: center; gap: 16px; margin-bottom: 10px; }
        .header-brand { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .header-logo { font-size: 20px; line-height: 1; flex-shrink: 0; }
        .header-title { font-weight: 700; color: #111111; font-size: 15px; letter-spacing: -0.01em; }
        .header-subtitle { font-size: 11px; color: #aaaaaa; margin-top: 1px; letter-spacing: 0.01em; }
        .header-row2 { display: flex; align-items: center; gap: 8px; justify-content: space-between; }

        /* Desktop tabs — estilo minimalista con underline */
        .desktop-tabs { display: flex; gap: 2px; align-items: center; flex-shrink: 0; }
        .desktop-tab-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 14px; border-radius: 0; border: none; cursor: pointer;
          font-size: 12px; font-weight: 500; letter-spacing: 0.01em;
          background: transparent; color: #aaaaaa;
          transition: all 0.15s ease; position: relative;
          border-bottom: 2px solid transparent;
        }
        .desktop-tab-btn:hover { color: #555555; border-bottom-color: #e0e0e0; }
        .desktop-tab-btn.active { color: #111111; border-bottom-color: #f59e0b; font-weight: 600; }
        .tab-badge {
          position: absolute; top: 2px; right: 4px;
          width: 15px; height: 15px; border-radius: 50%;
          background: #f59e0b; color: white;
          font-size: 8px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .more-btn {
          padding: 5px 10px; border-radius: 6px; font-size: 13px;
          border: 1px solid #ebebeb; background: white; cursor: pointer; color: #aaaaaa;
          transition: all 0.15s; margin-left: 6px;
        }
        .more-btn:hover { background: #f5f5f5; }
        .btn-new-recipe {
          padding: 7px 16px; border-radius: 6px; font-size: 12px; font-weight: 600;
          border: none; background: #f59e0b; color: white; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: all 0.15s; letter-spacing: 0.01em;
        }
        .btn-new-recipe:hover { background: #d97706; }
        .btn-clear-week {
          font-size: 11px; color: #ef4444; border: 1px solid #fecaca;
          background: white; border-radius: 6px; padding: 5px 12px;
          cursor: pointer; font-weight: 500; transition: all 0.15s;
        }
        .btn-clear-week:hover { background: #fef2f2; }

        /* ── Layout ────────────────────────────────── */
        .tab-content { padding-bottom: 80px; }
        .main-layout {
          max-width: 1300px; margin: 0 auto; padding: 20px;
          display: flex; gap: 20px; align-items: flex-start;
          padding-bottom: 80px;
        }
        .board-area { flex: 1; min-width: 0; }
        .board-hint { font-size: 11px; color: #cccccc; margin-top: 10px; padding-left: 2px; }
        .shopping-sidebar {
          width: 280px; flex-shrink: 0;
          position: sticky; top: 90px;
        }

        /* ── DayColumn ─────────────────────────────── */
        .day-column { width: 158px; flex-shrink: 0; }
        .day-header {
          text-align: center; margin-bottom: 12px;
          padding-bottom: 10px; border-bottom: 1px solid #ebebeb;
        }
        .day-short-row {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; margin-bottom: 3px;
        }
        .day-short {
          font-size: 10px; font-weight: 700; color: #cccccc;
          letter-spacing: 0.12em; text-transform: uppercase;
        }
        .day-name { font-size: 13px; font-weight: 600; color: #111111; letter-spacing: -0.01em; }
        .day-count {
          font-size: 9px; font-weight: 700; color: #f59e0b;
          background: #fffbeb; padding: 1px 6px; border-radius: 99px;
          border: 1px solid #fde68a; line-height: 1.4;
        }

        /* ── PostIt ────────────────────────────────── */
        .postit-filled, .postit-empty { height: 108px; }

        .postit-filled {
          border-radius: 8px; padding: 10px 10px 8px 12px;
          position: relative; overflow: hidden;
          transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
          display: flex; flex-direction: column;
        }
        .postit-filled:hover .postit-remove-btn { opacity: 1 !important; }
        .postit-remove-btn {
          position: absolute; top: 5px; right: 5px;
          width: 18px; height: 18px; border-radius: 4px;
          background: white; border: 1px solid #ebebeb; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #999999; transition: all 0.15s; flex-shrink: 0;
        }
        .postit-remove-btn:hover { color: #ef4444; border-color: #fecaca; }
        .postit-emoji { font-size: 13px; margin-bottom: 4px; line-height: 1; flex-shrink: 0; }
        .postit-name {
          font-weight: 600; font-size: 11.5px; line-height: 1.3; margin-bottom: 4px;
          color: #111111; letter-spacing: -0.01em;
          overflow: hidden;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          flex-shrink: 0;
        }
        .postit-meta {
          display: flex; align-items: center; gap: 3px;
          color: #bbbbbb; font-size: 10px; flex-shrink: 0;
        }
        .postit-tag {
          margin-top: auto; font-size: 10px;
          display: inline-block; font-weight: 500;
          align-self: flex-start; letter-spacing: 0.01em;
        }
        .postit-empty {
          width: 100%; border-radius: 8px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 4px; cursor: pointer; transition: all 0.15s ease;
        }
        .postit-empty:hover { }
        .postit-empty-emoji { font-size: 14px; line-height: 1; }
        .postit-empty-label { font-size: 10px; font-weight: 500; letter-spacing: 0.02em; }

        /* ── History ───────────────────────────────── */
        .history-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: start;
        }

        /* ── Mobile board: hidden on desktop ──────── */
        .mobile-board { display: none; }
        .desktop-board { display: block; }

        /* ── Bottom Nav (mobile only) ──────────────── */
        .bottom-nav { display: none; }

        /* ── Responsive ────────────────────────────── */
        @media (max-width: 767px) {
          /* Hide desktop tabs in header */
          .desktop-tabs { display: none; }

          /* Show bottom nav */
          .bottom-nav {
            display: flex;
            position: fixed; bottom: 0; left: 0; right: 0;
            background: white;
            border-top: 1px solid #f0f0f0;
            box-shadow: 0 -2px 12px rgba(0,0,0,0.07);
            padding: 6px 0;
            padding-bottom: calc(6px + env(safe-area-inset-bottom));
            z-index: 100;
          }
          .bottom-nav-btn {
            flex: 1; display: flex; flex-direction: column;
            align-items: center; gap: 2px;
            background: none; border: none; cursor: pointer;
            padding: 4px 0; position: relative;
            color: #9ca3af; font-size: 10px; font-weight: 600;
            transition: color 0.15s;
          }
          .bottom-nav-btn.active { color: #f59e0b; }
          .bottom-nav-btn.active .bottom-nav-icon { transform: scale(1.15); }
          .bottom-nav-icon { font-size: 18px; line-height: 1; transition: transform 0.15s; }
          .bottom-nav-label { font-size: 10px; }
          .bottom-nav-badge {
            position: absolute; top: 0; right: calc(50% - 18px);
            width: 16px; height: 16px; border-radius: 50%;
            background: #ef4444; color: white;
            font-size: 9px; font-weight: 700;
            display: flex; align-items: center; justify-content: center;
          }

          /* Stack history on mobile */
          .history-grid { grid-template-columns: 1fr; }

          /* Reduce header padding */
          .header-inner { padding: 8px 12px; }
          .header-row1 { margin-bottom: 6px; }
          .header-title { font-size: 14px; }

          /* Main layout adjusts */
          .main-layout { padding: 12px 12px 80px; gap: 12px; }
          .tab-content { padding-bottom: 80px; }

          /* Shopping sidebar full width on mobile */
          .shopping-sidebar { width: 100%; position: static; }

          /* Hide/show helpers */
          .hidden-mobile { display: none !important; }

          /* Make board hint shorter on mobile */
          .board-hint { font-size: 10px; }

          /* PostIt mismo tamaño en móvil */
          .postit-filled, .postit-empty { height: 112px; }
          /* Always show remove button on mobile (no hover) */
          .postit-remove-btn { opacity: 0.7 !important; }

          /* ── Mobile board layout ─────────────────── */
          .mobile-board  { display: block; }
          .desktop-board { display: none; }

          /* Day pills row */
          .day-pills-row {
            display: flex; gap: 6px;
            overflow-x: auto; padding-bottom: 4px; margin-bottom: 14px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .day-pills-row::-webkit-scrollbar { display: none; }
          .day-pill {
            flex-shrink: 0; display: flex; flex-direction: column;
            align-items: center; gap: 5px;
            padding: 8px 12px; border-radius: 14px;
            border: 1.5px solid #e8e8e8; background: white;
            cursor: pointer; transition: all 0.18s; min-width: 52px;
          }
          .day-pill.today { border-color: #fde68a; }
          .day-pill.active { background: #f59e0b; border-color: #f59e0b; }
          .day-pill-short {
            font-size: 10px; font-weight: 800; letter-spacing: 0.1em;
            color: #bbbbbb; text-transform: uppercase;
          }
          .day-pill.today .day-pill-short { color: #d97706; }
          .day-pill.active .day-pill-short { color: white; }
          .day-pill-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: #e8e8e8; transition: background 0.18s;
          }
          .day-pill-dot.partial { background: #fcd34d; }
          .day-pill-dot.full    { background: #10b981; }
          .day-pill.active .day-pill-dot { background: rgba(255,255,255,0.5); }
          .day-pill.active .day-pill-dot.full { background: rgba(255,255,255,0.95); }

          /* Selected day header */
          .selected-day-header {
            display: flex; align-items: baseline; gap: 8px;
            margin-bottom: 12px; padding: 0 2px;
          }
          .selected-day-name {
            font-size: 20px; font-weight: 700; color: #111111; letter-spacing: -0.02em;
          }
          .selected-day-count {
            font-size: 11px; color: #aaaaaa; font-weight: 500;
          }

          /* Slot rows with labels */
          .mobile-slots { display: flex; flex-direction: column; gap: 10px; }
          .mobile-slot-row { display: flex; flex-direction: column; gap: 4px; }
          .mobile-slot-label {
            display: flex; align-items: center; gap: 5px; padding-left: 2px;
          }
          .mobile-slot-emoji { font-size: 13px; }
          .mobile-slot-text {
            font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
            text-transform: uppercase; color: #aaaaaa;
          }

          /* Taller, more spacious slot cards on mobile */
          .mobile-slot-row .postit-filled,
          .mobile-slot-row .postit-empty {
            height: 90px; border-radius: 14px;
          }
          .mobile-slot-row .postit-filled { padding: 12px 12px 8px 14px; }
          .mobile-slot-row .postit-name { font-size: 13px; -webkit-line-clamp: 2; }
          .mobile-slot-row .postit-remove-btn { opacity: 1 !important; }
        }

        @media (min-width: 768px) {
          /* Shopping sidebar always visible on desktop */
          #sidebar-shopping { display: block !important; }
          .hidden-mobile { display: block; }
          .tab-content { padding-bottom: 16px; }
          .main-layout { padding-bottom: 24px; }
        }
      `}</style>
    </div>
  );
}
