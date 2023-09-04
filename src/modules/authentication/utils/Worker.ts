const ctx: Worker = self as any;

const TRIGGER_INERVAL_MS = 60000;

const timer = setInterval(() => {
  ctx.postMessage({ trigger: true });
}, TRIGGER_INERVAL_MS);

ctx.onmessage = (event) => {
  const { stopTimer } = event.data;
  if (stopTimer) {
    console.log("WORKER: Received message from main thread to stop the timer");
    clearInterval(timer);
  }
};

export default ctx;
