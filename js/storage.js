// Simple local storage utilities for SID map and session state
(function() {
  const STORAGE_KEY_SID = 'velocitydrivesp_yangSidMap_v1';

  function loadSidMapFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SID);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load SID map from storage:', e);
    }
    return null;
  }

  function saveSidMapToStorage(map) {
    try {
      localStorage.setItem(STORAGE_KEY_SID, JSON.stringify(map));
    } catch (e) {
      console.warn('Failed to save SID map to storage:', e);
    }
  }

  function parseSidMapText(text) {
    // Accept JSON or JS file that defines `const yangSidMap = {...}`
    try {
      // Try JSON first
      return JSON.parse(text);
    } catch (_) {}

    // Try to extract object literal from JS
    try {
      const m = text.match(/yangSidMap\s*=\s*(\{[\s\S]*\});?/);
      if (m && m[1]) {
        // Use Function constructor to safely evaluate object literal
        // eslint-disable-next-line no-new-func
        const obj = Function('return (' + m[1] + ')')();
        if (obj && typeof obj === 'object') return obj;
      }
    } catch (e) {
      console.warn('Failed to parse JS SID map:', e);
    }
    throw new Error('SID mapping file format not recognized');
  }

  function download(filename, content) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Expose helpers globally
  window.SIDStorage = {
    load: loadSidMapFromStorage,
    save: saveSidMapToStorage,
    parse: parseSidMapText,
    download,
    STORAGE_KEY_SID
  };
})();

