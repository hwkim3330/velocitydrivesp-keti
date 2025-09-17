export class MUP1 {
  createCoapInitFrame(){ return '>c\n'; }
  createCoapDataFrame(coapBytes){
    const hex = Array.from(coapBytes).map(b=>b.toString(16).padStart(2,'0')).join('');
    let cs=0; for(let i=0;i<coapBytes.length;i++) cs^=coapBytes[i];
    return `>d${hex}<<${cs.toString(16).padStart(4,'0')}\n`;
  }
  parseFrame(line){
    if(line.startsWith('>P')) return {type:'ping-response', data:line};
    if(line.startsWith('>C')) return {type:'coap-init-response'};
    if(line.startsWith('>D')){
      const m=line.match(/>D([0-9a-fA-F]+)<</); if(m){
        const hex=m[1];
        const u8=new Uint8Array(hex.match(/.{2}/g).map(h=>parseInt(h,16)));
        return {type:'coap-data-response', data:u8};
      }
    }
    return {type:'unknown', data:line};
  }
}

