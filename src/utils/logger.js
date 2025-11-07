export const isDev = import.meta.env.DEV;

export const log = {
  info: (msg, data) => isDev && console.log(`ℹ️  [INFO] ${msg}`, data || ''),
  success: (msg, data) => isDev && console.log(`✅ [SUCCESS] ${msg}`, data || ''),
  error: (msg, data) => console.error(`❌ [ERROR] ${msg}`, data || ''),
  warn: (msg, data) => isDev && console.warn(`⚠️  [WARN] ${msg}`, data || ''),
  socket: (msg, data) => isDev && console.log(`🔌 [SOCKET] ${msg}`, data || ''),
  canvas: (msg, data) => isDev && console.log(`🎨 [CANVAS] ${msg}`, data || ''),
};
