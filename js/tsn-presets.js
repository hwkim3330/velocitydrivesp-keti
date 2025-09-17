// TSN presets (editable) — derived from typical AVB/industrial defaults
// Values should be reviewed against device documentation before production use
window.TSNPRESETS = {
  'AVB Basic': {
    tas: { cycle_ns: 1000000, base_time_ns: 0, gates: ['FF','FF','FF','00','00','00','00','00'] },
    cbs: { class: 3, idle_kbps: 100000, send_kbps: -100000 },
    ptp: { instance: 0, domain: 0, two_step: true }
  },
  'Industrial Control': {
    tas: { cycle_ns: 500000, base_time_ns: 0, gates: ['FF','00','00','00','00','00','00','00'] },
    cbs: { class: 4, idle_kbps: 200000, send_kbps: -200000 },
    ptp: { instance: 0, domain: 1, two_step: true }
  },
  'Low Latency Streaming': {
    tas: { cycle_ns: 250000, base_time_ns: 0, gates: ['FF','FF','00','00','00','00','00','00'] },
    cbs: { class: 2, idle_kbps: 300000, send_kbps: -300000 },
    ptp: { instance: 0, domain: 2, two_step: true }
  }
};

