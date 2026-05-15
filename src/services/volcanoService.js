/**
 * volcanoService.js
 * Capa de servicio para todas las llamadas HTTP relacionadas a volcanes.
 * Sin dependencias de Vue — importable desde cualquier contexto.
 */

const BASE_URL = import.meta.env.VITE_API_URL

/**
 * Helper interno: valida la respuesta HTTP y retorna el JSON parseado.
 * Lanza un Error descriptivo si el status no es 2xx.
 * @param {Response} res
 * @returns {Promise<any>}
 */
const handleResponse = async (res) => {
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  return res.json()
}

// ─── Volcanes ─────────────────────────────────────────────────────────────────

/**
 * Obtiene la lista de volcanes desde el API.
 * Soporta respuestas paginadas ({ content: [] }) y arrays directos.
 * @param {Object} [params]
 * @param {number} [params.page=0]  - Número de página.
 * @param {number} [params.size=50] - Tamaño de página.
 * @returns {Promise<Array>} Array de volcanes.
 */
export const getVolcanoes = async ({ page = 0, size = 50 } = {}) => {
  const url = `${BASE_URL}/volcanoes?page=${page}&size=${size}`
  const res  = await fetch(url)
  const data = await handleResponse(res)

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  return []
}

/**
 * Retorna los N volcanes más populares ordenados por el campo popularity.
 * Volcanes sin el campo popularity quedan al final del array.
 * @param {number} [limit=4]    - Cantidad máxima a retornar.
 * @param {'asc'|'desc'} [order='asc'] - 'asc' = menor número es más popular (ranking 1,2,3…).
 * @returns {Promise<Array>} Array ordenado y limitado.
 */
export const getPopularVolcanoes = async (limit = 4, order = 'asc') => {
  const all = await getVolcanoes()

  const withPopularity    = all.filter((v) => v.popularity != null)
  const withoutPopularity = all.filter((v) => v.popularity == null)

  withPopularity.sort((a, b) =>
    order === 'asc'
      ? a.popularity - b.popularity   // 1 = primero (más popular)
      : b.popularity - a.popularity   // mayor número = primero
  )

  return [...withPopularity, ...withoutPopularity].slice(0, limit)
}

/**
 * Obtiene los detalles de un volcán específico por su ID.
 * @param {number|string} id - ID del volcán.
 * @returns {Promise<Object>} Detalles del volcán.
 */
export const getVolcanoById = async (id) => {
  const url = `${BASE_URL}/volcanoes/${id}`
  const res = await fetch(url)
  return handleResponse(res)
}

// ─── Publicaciones ────────────────────────────────────────────────────────────

/**
 * Obtiene publicaciones de redes sociales filtradas por tipo.
 * @param {string} [type='post'] - Tipo de publicación.
 * @returns {Promise<Array>} Array de publicaciones.
 */
export const getSocialPosts = async (type = 'post') => {
  const url = `${BASE_URL}/src-volcanoes?type=${encodeURIComponent(type)}`
  const res  = await fetch(url)
  const data = await handleResponse(res)

  return Array.isArray(data) ? data : []
}
