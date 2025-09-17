export class PsfpView{
  constructor(state){ this.state=state; }
  el(){
    const w=document.createElement('div'); w.className='card';
    w.innerHTML=`<div class="card-h">PSFP</div>
      <div class="card-b">
        <div class="row" style="margin-bottom:10px; color:#6b7280">Flow Meter / Stream Filter / Stream Gate 구성을 문서 기준으로 반영 중입니다.</div>
        <div class="grid">
          <div class="card"><div class="card-h">Flow Meter</div><div class="card-b">
            <div class="row">CIR/CBS/EIR/EBS, color-mode/coupling/mark-red</div>
          </div></div>
          <div class="card"><div class="card-h">Stream Filter</div><div class="card-b">
            <div class="row">stream-handle/wildcard/priority-spec/oversize/fm-enable/ref/gate-ref</div>
          </div></div>
          <div class="card"><div class="card-h">Stream Gate</div><div class="card-b">
            <div class="row">admin/oper-control-list, base-time/cycle/gate-states</div>
          </div></div>
        </div>
      </div>`;
    return w;
  }
}

