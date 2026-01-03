type ObserverCallback = (entry: IntersectionObserverEntry) => void;

const callbacks = new Map<Element, ObserverCallback>();

let observer: IntersectionObserver | null = null;

export function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cb = callbacks.get(entry.target);
          if (cb) cb(entry);
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.2,
      }
    );
  }
  return observer;
}

export function observeElement(
  el: Element,
  callback: ObserverCallback
) {
  const observer = getObserver();
  callbacks.set(el, callback);
  observer.observe(el);
}

export function unobserveElement(el: Element) {
  const observer = getObserver();
  observer.unobserve(el);
  callbacks.delete(el);
}
