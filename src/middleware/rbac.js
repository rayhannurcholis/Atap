export function requireRole(...roles) {
  return async (c, next) => {
    const auth = c.get('auth')

    if (!auth || !roles.includes(auth.role)) {
      return c.json({ error: 'Forbidden' }, 403)
    }

    await next()
  }
}