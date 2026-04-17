/* ═══════════════════════════════════════════════════════════════
   SEED DATA  (realistic food-stall scenario, triggers warning)
═══════════════════════════════════════════════════════════════ */
import { todayStr, daysAgo } from './helpers';

export const SEED = [
  { id:"t01", type:"income",  category:"Sales",       amount:280, date:todayStr(),  isPersonal:false, note:"Morning sales"    },
  { id:"t02", type:"expense", category:"Ingredients", amount:235, date:todayStr(),  isPersonal:false, note:"Daily restock"    },
  { id:"t03", type:"income",  category:"Sales",       amount:195, date:daysAgo(1),  isPersonal:false, note:""                 },
  { id:"t04", type:"expense", category:"Ingredients", amount:162, date:daysAgo(1),  isPersonal:false, note:"Supplier restock" },
  { id:"t05", type:"expense", category:"Gas",         amount:30,  date:daysAgo(1),  isPersonal:false, note:""                 },
  { id:"t06", type:"income",  category:"Sales",       amount:220, date:daysAgo(2),  isPersonal:false, note:""                 },
  { id:"t07", type:"expense", category:"Ingredients", amount:185, date:daysAgo(2),  isPersonal:false, note:""                 },
  { id:"t08", type:"expense", category:"Packaging",   amount:18,  date:daysAgo(2),  isPersonal:false, note:""                 },
  { id:"t09", type:"income",  category:"Sales",       amount:310, date:daysAgo(3),  isPersonal:false, note:"Weekend"          },
  { id:"t10", type:"expense", category:"Rent",        amount:150, date:daysAgo(3),  isPersonal:false, note:"Monthly rent"     },
  { id:"t11", type:"expense", category:"Staff",       amount:80,  date:daysAgo(4),  isPersonal:false, note:""                 },
  { id:"t12", type:"income",  category:"Sales",       amount:260, date:daysAgo(4),  isPersonal:false, note:""                 },
  { id:"t13", type:"expense", category:"Ingredients", amount:110, date:daysAgo(5),  isPersonal:false, note:""                 },
  { id:"t14", type:"income",  category:"Sales",       amount:175, date:daysAgo(5),  isPersonal:false, note:""                 },
  { id:"t15", type:"expense", category:"Transport",   amount:25,  date:daysAgo(6),  isPersonal:false, note:""                 },
  { id:"t16", type:"income",  category:"Sales",       amount:190, date:daysAgo(6),  isPersonal:false, note:""                 },
  { id:"t17", type:"expense", category:"Utilities",   amount:40,  date:daysAgo(7),  isPersonal:true,  note:"Personal electric"},
];
