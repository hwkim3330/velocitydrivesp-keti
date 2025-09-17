import { extractSidFromArchive, buildProxiedUrl } from '../utils/coreconf-util.js';

export class CoreconfView{
  constructor(state){ this.state=state; }
  el(){
    const w=document.createElement('div'); w.className='card';
    w.innerHTML=`<div class="card-h">Coreconf</div><div class="card-b"><div class="row"><button class="btn" id="fetch">Fetch Latest</button><input type="file" id="arc" accept=".tgz,.tar,.tar.gz" style="display:none"/><button class="btn" id="importArc">Import Archive</button></div><div class="row" style="gap:18px;margin-top:10px"><div>Mappings: <b id="mapCnt">0</b></div><div>Modules: <b id="modCnt">0</b></div></div></div>`;
    const mapCnt=w.querySelector('#mapCnt'); const modCnt=w.querySelector('#modCnt');
    w.querySelector('#importArc').onclick=()=>w.querySelector('#arc').click();
    w.querySelector('#arc').onchange=async(e)=>{ const f=e.target.files?.[0]; if(!f) return; const u8=new Uint8Array(await f.arrayBuffer()); const m=await extractSidFromArchive(u8,f.name); window.yangSidMap=m.mapping; window.moduleStats=m.moduleStats; mapCnt.textContent=Object.keys(m.mapping).length; modCnt.textContent=Object.keys(m.moduleStats||{}).filter(k=>m.moduleStats[k]>0).length; };
    w.querySelector('#fetch').onclick=async()=>{ try{ const cfg=await (await fetch('../config.json',{cache:'no-store'})).json(); const src=(cfg.coreconfSources||[]).find(s=> (s.type==='tgzUrl'||s.type==='tarUrl')&&s.url); const url=src?.url || prompt('Archive URL (.tgz/.tar)')||''; if(!url) return; const r=await fetch(buildProxiedUrl(url,cfg.corsProxy||src?.proxy||''),{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status); const m=await extractSidFromArchive(new Uint8Array(await r.arrayBuffer()),url.toLowerCase()); window.yangSidMap=m.mapping; window.moduleStats=m.moduleStats; mapCnt.textContent=Object.keys(m.mapping).length; modCnt.textContent=Object.keys(m.moduleStats||{}).filter(k=>m.moduleStats[k]>0).length; }catch(e){ alert('Fetch failed: '+e.message);} };
    return w;
  }
}
