/**
 * Simple concurrency limit helper.
 * Executes promises with a concurrency limit.
 */
export async function mapLimit<T, R>(
    items: T[],
    limit: number,
    iterator: (item: T) => Promise<R>
  ): Promise<R[]> {
    const results: Promise<R>[] = []
    const executing: Promise<void>[] = []
  
    for (const item of items) {
      const p = Promise.resolve().then(() => iterator(item))
      results.push(p)
  
      if (limit <= items.length) {
        const e: Promise<void> = p.then(() => {
          executing.splice(executing.indexOf(e), 1)
        })
        executing.push(e)
        if (executing.length >= limit) {
          await Promise.race(executing)
        }
      }
    }
  
    return Promise.all(results)
  }
