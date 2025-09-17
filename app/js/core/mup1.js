export class MUP1 {
  createCoapInitFrame(){ return '>c\n'; }
  createCoapDataFrame(coapBytes){
    const hex = Array.from(coapBytes).map(b=>b.toString(16).padStart(2,'0')).join('');
    // 16-bit one's complement checksum over the ASCII of the frame prefix and data
    const frameBody = `>d${hex}<<`;
    let sum = 0;
    for(let i=0;i<frameBody.length;i++) sum = (sum + frameBody.charCodeAt(i)) & 0xFFFF;
    sum = (~sum) & 0xFFFF;
    const cs = sum.toString(16).toUpperCase().padStart(4,'0');
    return `${frameBody}${cs}\n`;
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
