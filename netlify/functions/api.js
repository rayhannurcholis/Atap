import app from '../../src/app.js'

export default async (request) => {
  return app.fetch(request)
}

export const config = {
  path: '/*',
}
