export type RunResult = { status: 'ok'; output: string } | { status: 'error'; error: string } | { status: 'timeout'; error: string };

// The frame has an opaque origin and its CSP blocks network access. The worker
// keeps synchronous user code off the UI thread so the frame can be terminated.
const frameDocument = `<!doctype html>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none';">
<script>
addEventListener('message', function start(event) {
  if (event.source !== parent || !event.data || event.data.type !== 'run') return;
  removeEventListener('message', start);
  const source = \`onmessage = function(event) {
    try {
      const run = new Function('input', event.data.code + '\\\\n; if (typeof solve !== "function") throw new Error("Define function solve(input)"); return solve(input);');
      const result = run(event.data.input);
      if (result && typeof result.then === 'function') throw new Error('solve(input) must return synchronously');
      if (result === undefined || result === null) throw new Error('solve(input) must return output');
      postMessage({ output: String(result) });
    } catch (error) {
      postMessage({ error: error instanceof Error ? error.message : String(error) });
    }
  };\`;
  try {
    const url = URL.createObjectURL(new Blob([source], {type:'text/javascript'}));
    const worker = new Worker(url);
    URL.revokeObjectURL(url);
    worker.onmessage = e => parent.postMessage({type:'result', result:e.data}, '*');
    worker.onerror = e => parent.postMessage({type:'result', result:{error:e.message || 'Worker error'}}, '*');
    worker.postMessage({code:event.data.code,input:event.data.input});
  } catch (error) {
    parent.postMessage({type:'result',result:{error:String(error)}}, '*');
  }
});
parent.postMessage({type:'ready'}, '*');
<\/script>`;

export function runJavaScript(code: string, input: string, timeoutMs = 1500, signal?: AbortSignal): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Cancelled', 'AbortError'));
      return;
    }
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.hidden = true;
    frame.srcdoc = frameDocument;
    let finished = false;
    let started = false;
    const cleanup = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      window.removeEventListener('message', onMessage);
      frame.remove();
    };
    const finish = (result: RunResult) => {
      if (finished) return;
      finished = true;
      cleanup();
      resolve(result);
    };
    const abort = () => {
      if (finished) return;
      finished = true;
      cleanup();
      reject(new DOMException('Cancelled', 'AbortError'));
    };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow || !event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'ready' && !started) {
        started = true;
        frame.contentWindow?.postMessage({ type: 'run', code, input }, '*');
      } else if (event.data.type === 'result' && started) {
        const result = event.data.result;
        if (!result || typeof result !== 'object') {
          finish({ status: 'error', error: 'Invalid worker response' });
        } else if (typeof result.error === 'string') {
          finish({ status: 'error', error: result.error });
        } else if (typeof result.output === 'string') {
          finish({ status: 'ok', output: result.output });
        } else {
          finish({ status: 'error', error: 'Invalid worker response' });
        }
      }
    };
    const timer = setTimeout(() => finish({ status: 'timeout', error: 'Time limit exceeded' }), timeoutMs);
    signal?.addEventListener('abort', abort, { once: true });
    window.addEventListener('message', onMessage);
    document.body.appendChild(frame);
  });
}

export const normalizeOutput = (value: string) => value.trim().split(/\s+/).join(' ');
