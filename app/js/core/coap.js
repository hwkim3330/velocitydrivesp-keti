export class CoAP {
  constructor(){ this.messageId=1; }
  buildMessage(method, uri, payload=null){
    this._last=0; const code={GET:1,POST:2,PUT:3,DELETE:4}[method]||1;
    const header=new Uint8Array([0x40,code,(this.messageId>>8)&0xFF,this.messageId&0xFF]);
    const opts=[]; const enc = (n, bytes)=>{ const d=n-this._last, l=bytes.length; let h=0, ex=[]; if(d<13)h|=(d<<4); else if(d<269){h|=(13<<4); ex.push(d-13);} else {h|=(14<<4); ex.push((d-269)>>8,(d-269)&0xFF);} if(l<13)h|=l; else if(l<269){h|=13; ex.push(l-13);} else {h|=14; ex.push((l-269)>>8,(l-269)&0xFF);} opts.push(h,...ex,...bytes); this._last=n; };
    const te = (s)=>new TextEncoder().encode(s);
    enc(11,te('.well-known')); enc(11,te('coreconf')); enc(11,te('data'));
    if(uri && uri!=='/'){ const yp=uri.replace(/^\//,''); enc(11,te(yp)); }
    enc(17,new Uint8Array([60])); // Accept: application/yang-data+cbor
    const msg=new Uint8Array(header.length+opts.length+(payload?payload.length+1:0));
    msg.set(header); msg.set(new Uint8Array(opts),header.length);
    if(payload){ msg[header.length+opts.length]=0xFF; msg.set(payload,header.length+opts.length+1); }
    this.messageId++;
    return msg;
  }
  parseMessage(u8){ if(u8.length<4) return null; const code=u8[1], mid=(u8[2]<<8)|u8[3]; let i=4; while(i<u8.length && u8[i]!==0xFF){ const l=u8[i]&0x0F; i+=1+l; } let payload=null; if(i<u8.length && u8[i]===0xFF) payload=u8.slice(i+1); return { code:`${(code>>5)}.${(code&0x1F).toString().padStart(2,'0')}`, messageId:mid, payload } }
}

