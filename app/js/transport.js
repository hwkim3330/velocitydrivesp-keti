export class Transport {
  constructor(){ this.port=null; this.reader=null; this.writer=null; this.onLine=null; this.onFrame=null; }
  async connect(){
    this.port = await navigator.serial.requestPort();
    await this.port.open({ baudRate: 115200 });
    this.writer = this.port.writable.getWriter();
    this.reader = this.port.readable.getReader();
    this.readLoop();
  }
  async disconnect(){ try{ this.reader?.releaseLock(); this.writer?.releaseLock(); await this.port?.close(); }catch(e){} }
  async write(text){ if(!this.writer) throw new Error('not connected'); await this.writer.write(new TextEncoder().encode(text)); }
  async readLoop(){ const dec=new TextDecoder(); let buf=''; while(this.reader){ try{ const {value,done}=await this.reader.read(); if(done) break; const t=dec.decode(value); buf+=t; while(buf.includes('\n')){ const i=buf.indexOf('\n'); const line=buf.slice(0,i); buf=buf.slice(i+1); this.onFrame && this.onFrame(line); } }catch(e){ break } } }
}

