type Listener = () => void;
let listener: Listener | null = null;

export function setNetworkFailureListener(fn: Listener) {
  listener = fn;
}

export function reportNetworkFailure() {
  listener?.();
}
