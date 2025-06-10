class Cache {
  constructor() {
    this.cache = new Map()
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
    }
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) {
      this.stats.misses++
      return null
    }

    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    this.stats.hits++
    return item.value
  }

  set(key, value, ttlInSeconds = 3600) {
    this.cache.set(key, {
      value,
      expiresAt: ttlInSeconds ? Date.now() + ttlInSeconds * 1000 : null,
    })
    this.stats.sets++
  }

  delete(key) {
    return this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0, sets: 0 }
  }

  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
    }
  }

  // Nettoie automatiquement les entrées expirées
  cleanup() {
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt && item.expiresAt < Date.now()) {
        this.cache.delete(key)
      }
    }
  }
}

module.exports = new Cache()
