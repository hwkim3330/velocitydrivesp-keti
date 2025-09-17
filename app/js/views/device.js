export class DeviceView{
  constructor(state){ this.state=state; }
  el(){
    const wrap=document.createElement('div');
    wrap.className='card';
    wrap.innerHTML=`<div class="card-h">장치</div><div class="card-b"><div class="row"><button class="btn p" id="devConnect">Connect</button><button class="btn" id="devDisconnect">Disconnect</button></div><div class="row" style="margin-top:10px"><div class="log" id="devLog"></div></div></div>`;
    wrap.querySelector('#devConnect').onclick=async()=>{
      try{ await this.state.transport.connect(); this.state.connected=true; this.log('INFO','CONNECT'); }
      catch(e){ this.log('ERR',e.message); }
      this.state.transport.onFrame=(line)=>{ this.log('RX',line) };
    };
    wrap.querySelector('#devDisconnect').onclick=async()=>{ await this.state.transport.disconnect(); this.state.connected=false; this.log('INFO','DISCONNECT'); };
    this._logEl = wrap.querySelector('#devLog');
    return wrap;
  }
  log(tag,msg){ const t=new Date().toLocaleTimeString(); const div=document.createElement('div'); div.textContent=`${t} ${tag} ${msg||''}`; this._logEl?.appendChild(div); this._logEl.scrollTop=this._logEl.scrollHeight; }
}

