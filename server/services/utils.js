export function uniqueNonEmpty(values) {
  if (!Array.isArray(values)) return [];

  const normalized = values
    .map((value) => {
      if (value === null || value === undefined) return '';
      return String(value).trim();
    })
    .filter(Boolean);

  return [...new Set(normalized)];
}

export class TaskQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.next();
    });
  }

  next() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const { task, resolve, reject } = this.queue.shift();
    this.running++;

    try {
      Promise.resolve(task())
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.running--;
          this.next();
        });
    } catch (err) {
      this.running--;
      reject(err);
      this.next();
    }
  }
}
