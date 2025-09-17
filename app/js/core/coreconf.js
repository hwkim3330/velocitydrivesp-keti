import { MUP1 } from './mup1.js';
import { CoAP } from './coap.js';

export class CoreconfClient{
  constructor(state){ this.state=state; this.mup1=new MUP1(); this.coap=new CoAP(); this.pending=new Map(); this._wired=false; }
  _wire(){ if(this._wired) return; this._wired=true; this.state.transport.onFrame=(line)=>{ const f=this.mup1.parseFrame(line); if(f.type==='coap-data-response'){ const resp=this.coap.parseMessage(f.data); if(!resp) return; const ent=this.pending.get(resp.messageId); if(ent){ clearTimeout(ent.to); this.pending.delete(resp.messageId); ent.res(resp); } } } }
  async _send(method, uri, payload){ if(!this.state.transport.writer) throw new Error('not connected'); this._wire(); await this.state.transport.writer.write(new TextEncoder().encode(this.mup1.createCoapInitFrame())); const msg=this.coap.buildMessage(method,uri,payload); const frame=this.mup1.createCoapDataFrame(msg); await this.state.transport.writer.write(new TextEncoder().encode(frame)); const id=this.coap.messageId-1; return new Promise((res,rej)=>{ const to=setTimeout(()=>{ this.pending.delete(id); rej(new Error('timeout')); },10000); this.pending.set(id,{res,rej,to}); }); }
  get(uri){ return this._send('GET', uri, null); }
  put(uri, payload){ return this._send('PUT', uri, payload); }
}
