export class LogsView{
  constructor(state){ this.state=state; }
  el(){
    const w=document.createElement('div'); w.className='card';
    w.innerHTML=`<div class="card-h">로그</div>
      <div class="card-b">
        <div class="row" style="margin-bottom:8px">
          <button class="btn" id="clear">Clear</button>
        </div>
        <div class="log" id="logArea"></div>
      </div>`;
    const area=w.querySelector('#logArea');
    w.querySelector('#clear').onclick=()=>{ area.innerHTML=''; };
    // mirror frames if connected
    const prev = this.state.transport.onFrame;
    this.state.transport.onFrame = (line)=>{
      const div=document.createElement('div'); div.textContent=line; area.appendChild(div); area.scrollTop=area.scrollHeight;
      prev && prev(line);
    };
    return w;
  }
}

