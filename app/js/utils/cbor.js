export class Cbor {
  encode(obj){ const out=[]; this._enc(obj,out); return new Uint8Array(out); }
  _enc(v,r){ if(v==null) r.push(0xF6); else if(typeof v==='boolean') r.push(v?0xF5:0xF4); else if(typeof v==='number') this._num(v,r); else if(typeof v==='string') this._str(v,r); else if(v instanceof Uint8Array) this._bytes(v,r); else if(Array.isArray(v)) this._arr(v,r); else if(typeof v==='object') this._map(v,r); else r.push(0xF6); }
  _num(n,r){ if(n>=0){ if(n<24) r.push(n); else if(n<256) r.push(0x18,n); else if(n<65536) r.push(0x19,(n>>8)&0xFF,n&0xFF); else r.push(0x1A,(n>>24)&0xFF,(n>>16)&0xFF,(n>>8)&0xFF,n&0xFF); } else { const m=-1-n; if(m<24) r.push(0x20|m); else if(m<256) r.push(0x38,m); else if(m<65536) r.push(0x39,(m>>8)&0xFF,m&0xFF); else r.push(0x3A,(m>>24)&0xFF,(m>>16)&0xFF,(m>>8)&0xFF,m&0xFF); } }
  _str(s,r){ const b=new TextEncoder().encode(s); this._hdr(r,3,b.length); r.push(...b); }
  _bytes(b,r){ this._hdr(r,2,b.length); r.push(...b); }
  _arr(a,r){ this._hdr(r,4,a.length); a.forEach(v=>this._enc(v,r)); }
  _map(o,r){ const ks=Object.keys(o); this._hdr(r,5,ks.length); for(const k of ks){ this._str(String(k),r); this._enc(o[k],r);} }
  _hdr(r,t,l){ if(l<24) r.push((t<<5)|l); else if(l<256) r.push((t<<5)|24,l); else if(l<65536) r.push((t<<5)|25,(l>>8)&0xFF,l&0xFF); else r.push((t<<5)|26,(l>>24)&0xFF,(l>>16)&0xFF,(l>>8)&0xFF,l&0xFF); }

  // Minimal decoder for maps/arrays/strings/ints
  decode(u8){ this._i=0; this._b=u8; return this._dec(); }
  _dec(){ if(this._i>=this._b.length) return null; const ib=this._b; let h=ib[this._i++]; const mt=h>>5, ai=h&0x1F; const readArg=(ai)=>{ if(ai<24) return ai; if(ai===24) return ib[this._i++]; if(ai===25){ const v=(ib[this._i++]<<8)|ib[this._i++]; return v; } if(ai===26){ const v=(ib[this._i++]<<24)|(ib[this._i++]<<16)|(ib[this._i++]<<8)|ib[this._i++]; return v>>>0; } throw new Error('len too big'); };
    const len = readArg(ai);
    if(mt===0) return len; // unsigned int
    if(mt===1) return -1 - len; // negative int
    if(mt===2){ const v=ib.slice(this._i,this._i+len); this._i+=len; return v; }
    if(mt===3){ const v=new TextDecoder().decode(ib.slice(this._i,this._i+len)); this._i+=len; return v; }
    if(mt===4){ const arr=[]; for(let i=0;i<len;i++) arr.push(this._dec()); return arr; }
    if(mt===5){ const obj={}; for(let i=0;i<len;i++){ const k=this._dec(); const v=this._dec(); obj[k]=v; } return obj; }
    if(mt===7){ if(ai===20) return false; if(ai===21) return true; if(ai===22) return null; }
    return null; }
}
