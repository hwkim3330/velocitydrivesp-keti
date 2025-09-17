export function ensureYangMaps(){
  if(!window.yangSidMap) return;
  if(!window.yangToSidMap){ window.yangToSidMap = {}; for(const [sid,path] of Object.entries(window.yangSidMap)){ window.yangToSidMap[path.replace(/^\//,'')] = parseInt(sid,10); } }
}
export function yangToSidObject(obj){ ensureYangMaps(); if(!obj||typeof obj!=='object') return obj; const out={}; for(const [k,v] of Object.entries(obj)){ if(typeof v==='object' && v && !Array.isArray(v)){ Object.assign(out,yangToSidObject(v)); } else { const sid = window.yangToSidMap?.[k.replace(/^\//,'')]; if(sid) out[sid]=v; else out[k]=v; } } return out; }
export function sidsToYangObject(obj){ if(!obj||typeof obj!=='object') return obj; const out={}; for(const [k,v] of Object.entries(obj)){ const path = window.yangSidMap?.[k] || k; out[path]= (typeof v==='object'&&v&&!Array.isArray(v))? sidsToYangObject(v): v; } return out; }

