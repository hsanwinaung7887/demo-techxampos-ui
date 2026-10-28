export const getDeviceFingerprint = () => {
  const STORAGE_KEY = 'device_fingerprint';
  let fingerprint = localStorage.getItem(STORAGE_KEY);
  if (!fingerprint) {
    // ပထမဆုံးအကြိမ် – random UUID ထုတ်
    fingerprint = crypto.randomUUID 
      ? crypto.randomUUID() 
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
    localStorage.setItem(STORAGE_KEY, fingerprint);
  }
  return fingerprint;
};