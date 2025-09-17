import { Transport } from './transport.js';
import { CoreconfClient } from './core/coreconf.js';
import { DeviceView } from './views/device.js';
import { CoreconfView } from './views/coreconf.js';
import { TsnView } from './views/tsn.js';
import { PsfpView } from './views/psfp.js';
import { LogsView } from './views/logs.js';

const state = { transport: new Transport(), connected: false };
state.coreconf = new CoreconfClient(state);

const views = {
  device: new DeviceView(state),
  coreconf: new CoreconfView(state),
  tsn: new TsnView(state),
  psfp: new PsfpView(state),
  logs: new LogsView(state),
};

function render(name){
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.view===name));
  const v = document.getElementById('view');
  v.innerHTML = '';
  v.appendChild(views[name].el());
}

document.addEventListener('click', (e)=>{
  const b = e.target.closest('.tab'); if(!b) return;
  render(b.dataset.view);
});

// Status pill mirror
setInterval(()=>{
  const pill=document.getElementById('pill'); const dot=document.getElementById('dot'); const txt=document.getElementById('ptext');
  pill?.classList.toggle('on', state.connected);
  if(dot) dot.style.background = state.connected? 'var(--green)':'#8e8e93';
  if(txt) txt.textContent = state.connected? 'Connected':'Disconnected';
}, 500);

// default
render('device');
