/* ---------- presets ---------- */
  const PRESET_ORDER = ['sunMoon','moonBlue','growth','dayNight','fullLight','moonOnly'];
  const ICONS = {
    sunMoon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12l4 4L16 12"/><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
    moonBlue: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 8v4"/><path d="M12 16v4"/></svg>',
    growth: '<svg viewBox="0 0 24 24"><path d="M17 3h-8v4h8a4 4 0 0 0 0-8zm-6 9h-2v3H5v3h4v6h2v-6h4v-3h-4v-3z"/><circle cx="7" cy="7" r="3"/><circle cx="17" cy="17" r="3"/></svg>',
    dayNight: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="4"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>',
    fullLight: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 1 0 0 20"/><path d="M2 12a10 10 0 1 0 0 20"/></svg>',
    moonOnly: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="8" r="2"/><circle cx="12" cy="16" r="2"/></svg>'
  };
  const PRESETS = {
    sunMoon: [
      { h:5, m:16,  w:0,  r:0,  g:0,  b:4 },
      { h:6, m:16,  w:22, r:18, g:12, b:8 },
      { h:10, m:55, w:80, r:42, g:18, b:48 },
      { h:13, m:14, w:92, r:48, g:20, b:62 },
      { h:20, m:42, w:55, r:36, g:16, b:6 },
      { h:21, m:12, w:0,  r:0,  g:0,  b:4 }
    ],
    moonBlue: [
      { h:5, m:16,  w:0,  r:0,  g:0,  b:4 },
      { h:6, m:16,  w:0,  r:0,  g:0,  b:4 },
      { h:10, m:55, w:0,  r:0,  g:0,  b:4 },
      { h:13, m:14, w:0,  r:0,  g:0,  b:4 },
      { h:20, m:42, w:0,  r:0,  g:0,  b:4 },
      { h:21, m:12, w:0,  r:0,  g:0,  b:4 }
    ],
    growth: [
      { h:5, m:16,  w:0,  r:0,  g:0,  b:0 },
      { h:6, m:16,  w:25, r:28, g:14, b:4 },
      { h:10, m:55, w:85, r:48, g:18, b:20 },
      { h:13, m:14, w:95, r:58, g:24, b:22 },
      { h:20, m:42, w:50, r:40, g:14, b:4 },
      { h:21, m:12, w:0,  r:0,  g:0,  b:0 }
    ],
    dayNight: [
      { h:5, m:16,  w:0,  r:0,  g:0,  b:0 },
      { h:6, m:16,  w:30, r:24, g:18, b:10 },
      { h:10, m:55, w:90, r:50, g:45, b:45 },
      { h:13, m:14, w:100, r:55, g:52, b:52 },
      { h:20, m:42, w:50, r:30, g:22, b:12 },
      { h:21, m:12, w:0,  r:0,  g:0,  b:0 }
    ],
    fullLight: [
      { h:5, m:16,  w:0,  r:0,  g:0,  b:0 },
      { h:6, m:16,  w:70, r:35, g:25, b:20 },
      { h:10, m:55, w:100, r:100, g:100, b:100 },
      { h:13, m:14, w:100, r:100, g:100, b:100 },
      { h:20, m:42, w:60, r:35, g:22, b:12 },
      { h:21, m:12, w:0,  r:0,  g:0,  b:0 }
    ],
    moonOnly: [
      { h:0, m:0,  w:0, r:0, g:0, b:4 },
      { h:4, m:0,  w:0, r:0, g:0, b:4 },
      { h:8, m:0,  w:0, r:0, g:0, b:4 },
      { h:12, m:0, w:0, r:0, g:0, b:4 },
      { h:16, m:0, w:0, r:0, g:0, b:4 },
      { h:20, m:0, w:0, r:0, g:0, b:4 }
    ]
  };