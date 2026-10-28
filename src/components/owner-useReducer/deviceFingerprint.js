export const collectDeviceFingerprint = async () => {
  try {
    const fingerprint = {
      // Browser info
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || navigator.msDoNotTrack,
      
      // Screen info
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      orientation: window.screen.orientation?.type,
      
      // Timezone
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      // WebGL info (for graphics fingerprint)
      webglInfo: {}
    };
    
    // Collect WebGL info
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          fingerprint.webglInfo = {
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
            version: gl.getParameter(gl.VERSION),
            shadingLanguage: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
          };
        }
      }
    } catch (e) {
      fingerprint.webglError = e.message;
    }
    
    // Generate hash
    const fingerprintString = JSON.stringify(fingerprint);
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return {
      components: fingerprint,
      hash: hashHex.substring(0, 32),
      fullHash: hashHex,
      timestamp: Date.now()
    };
    
  } catch (error) {
    console.error('Error collecting device fingerprint:', error);
    
    // Fallback to basic info
    const basicFingerprint = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      timestamp: Date.now()
    };
    
    const basicString = JSON.stringify(basicFingerprint);
    const basicHash = btoa(basicString).substring(0, 32);
    
    return {
      components: basicFingerprint,
      hash: basicHash,
      error: error.message
    };
  }
};