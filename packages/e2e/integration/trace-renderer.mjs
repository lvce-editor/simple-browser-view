// Temporary diagnostics for the address/menu race; remove before merging.
const prelude = `
globalThis.__browserTrace = { entries: [], dropped: 0, truncated: 0 };
globalThis.__recordBrowserTrace = (direction, payload) => {
  const trace = globalThis.__browserTrace;
  if (trace.entries.length >= 20000) { trace.dropped++; return; }
  const seen = new WeakSet();
  let value;
  try {
    let text = JSON.stringify(payload, (key, item) => {
      if (/token|password|authorization|clipboard/i.test(key)) return '[redacted]';
      if (typeof item === 'bigint') return String(item);
      if (item && typeof item === 'object') {
        if (seen.has(item)) return '[circular]';
        seen.add(item);
        if (item instanceof ArrayBuffer) return { byteLength: item.byteLength };
        if (item.constructor?.name === 'MessagePort') return '[MessagePort]';
      }
      return item;
    });
    if (text?.length > 30000) { trace.truncated++; value = { truncated: text.slice(0, 30000) }; }
    else value = text ? JSON.parse(text) : null;
  } catch { value = '[serialization failed]'; }
  trace.entries.push({ sequence: trace.entries.length, time: performance.now(), direction, payload: value });
};
for (const type of ['focusin', 'focusout', 'keydown', 'input', 'pointerdown', 'contextmenu']) {
  addEventListener(type, event => {
    globalThis.__recordBrowserTrace('dom', {
      type, key: event.key, value: event.target?.value, target: event.target?.className,
      active: document.activeElement?.className, hasFocus: document.hasFocus(),
      menuFocused: !!document.querySelector('#Menu-0')?.contains(document.activeElement),
    });
  }, true);
}
`

const replaceOne = (source, before, after) => {
  if (source.split(before).length !== 2) throw new Error('Expected one renderer trace marker: ' + before)
  return source.replace(before, after)
}

export const instrumentRenderer = (source) => {
  source = replaceOne(
    source,
    'const handleMessage = event => {',
    "const handleMessage = event => { globalThis.__recordBrowserTrace('received', event.data);",
  )
  source = replaceOne(
    source,
    'const send$1 = (method, ...params) => {',
    "const send$1 = (method, ...params) => { globalThis.__recordBrowserTrace('sent', { method, params });",
  )
  source = replaceOne(
    source,
    'const invoke$1 = (method, ...params) => {',
    "const invoke$1 = (method, ...params) => { globalThis.__recordBrowserTrace('invoke', { method, params });",
  )
  return prelude + source
}
