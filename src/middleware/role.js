export function requireRole(...roles) {
  return async (c, next) => {
    const user = c.get("user");

    if (!user || !roles.includes(user.role)) {
      return c.json({ message: "Forbidden" }, 403);
    }

    await next();
  };
}