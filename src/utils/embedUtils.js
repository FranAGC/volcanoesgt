/**
 * embedUtils.js
 * Utilidades puras para manejo de embeds de redes sociales.
 * Sin dependencias de Vue — importable desde cualquier contexto.
 */

// ─── URLs de SDKs ──────────────────────────────────────────────────────────────

const SDK_URLS = {
  instagram: { src: 'https://www.instagram.com/embed.js', id: 'ig-sdk' },
  twitter:   { src: 'https://platform.twitter.com/widgets.js', id: 'tw-sdk' },
  facebook:  { src: 'https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v18.0', id: 'fb-sdk' },
}

// ─── 1. Detección de red social ────────────────────────────────────────────────

/** Retorna true si appPage corresponde a Instagram. */
export const isInstagram = (appPage) =>
  Boolean(appPage?.toLowerCase().includes('instagram.com'))

/** Retorna true si appPage corresponde a X / Twitter. */
export const isTwitter = (appPage) =>
  Boolean(
    appPage?.toLowerCase().includes('x.com') ||
    appPage?.toLowerCase().includes('twitter.com')
  )

/** Retorna true si appPage corresponde a Facebook. */
export const isFacebook = (appPage) =>
  Boolean(appPage?.toLowerCase().includes('facebook.com'))

/**
 * Identifica la red social de un post.
 * @returns {'instagram'|'twitter'|'facebook'|null}
 */
export const getSupportedNetwork = (appPage) => {
  if (isInstagram(appPage)) return 'instagram'
  if (isTwitter(appPage))   return 'twitter'
  if (isFacebook(appPage))  return 'facebook'
  return null
}

// ─── 2. Carga de SDKs ─────────────────────────────────────────────────────────

/**
 * Inyecta un script en document.head si aún no existe (por id o src).
 * Resuelve la Promise tanto en onload como en onerror para no bloquear.
 * @param {string} src - URL del script.
 * @param {string} id  - ID único para verificar duplicados.
 * @returns {Promise<void>}
 */
export const loadScript = (src, id) =>
  new Promise((resolve) => {
    if (
      document.getElementById(id) ||
      document.querySelector(`script[src="${src}"]`)
    ) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.id    = id
    script.src   = src
    script.async = true
    script.onload  = resolve
    script.onerror = resolve // No bloquear si el SDK falla
    document.head.appendChild(script)
  })

/**
 * Carga únicamente los SDKs de las redes presentes en los posts.
 * Respeta el orden: instagram → twitter → facebook.
 * @param {Array<'instagram'|'twitter'|'facebook'>} networks - Redes a cargar.
 * @returns {Promise<void>}
 */
export const loadSDKs = async (networks = []) => {
  const order = ['instagram', 'twitter', 'facebook']
  for (const network of order) {
    if (networks.includes(network)) {
      const { src, id } = SDK_URLS[network]
      await loadScript(src, id)
    }
  }
}

// ─── 3. Procesamiento de embeds ────────────────────────────────────────────────

/**
 * Re-invoca los parsers de cada SDK para procesar blockquotes en el DOM.
 * Acepta un containerEl opcional para limitar el scope del parse.
 * Silencia cualquier error de SDK — los fallbacks se activan vía hasError.
 * @param {Element|null} containerEl - Contenedor DOM para limitar el scope.
 */
export const processEmbeds = (containerEl = null) => {
  try {
    if (window.instgrm) {
      window.instgrm.embeds.process()
    }
    if (window.twttr) {
      // Twitter acepta un elemento DOM para parsear solo dentro de él
      window.twttr.widgets.load(containerEl ?? document)
    }
    if (window.FB) {
      // Facebook acepta undefined para parsear el documento completo
      window.FB.XFBML.parse(containerEl ?? undefined)
    }
  } catch {
    // Silencioso: errores de SDK no deben romper el flujo
  }
}

// ─── 4. Detección de iframe renderizado ───────────────────────────────────────

/**
 * Espera de forma no bloqueante a que un SDK renderice su iframe dentro
 * del contenedor `[data-post-id="${postId}"]`. Usa polling con setTimeout
 * recursivo para poder cancelarlo limpiamente desde onUnmounted.
 *
 * @param {string|number} postId - Valor del atributo data-post-id.
 * @param {object} options
 * @param {number}   [options.maxAttempts=20]  - Intentos máximos antes de onError.
 * @param {number}   [options.interval=300]    - Milisegundos entre intentos.
 * @param {Function} [options.onSuccess]       - Callback cuando el iframe aparece.
 * @param {Function} [options.onError]         - Callback al agotar los intentos.
 * @returns {Function} cancel - Llama a esta función para detener el polling.
 */
export const waitForIframe = (postId, options = {}) => {
  const {
    maxAttempts = 20,
    interval    = 300,
    onSuccess   = () => {},
    onError     = () => {},
  } = options

  let attempts  = 0
  let timeoutId = null
  let cancelled = false

  const poll = () => {
    if (cancelled) return

    const container = document.querySelector(`[data-post-id="${postId}"]`)
    const hasIframe = container?.querySelector('iframe') != null

    if (hasIframe) {
      onSuccess()
      return
    }

    attempts++
    if (attempts >= maxAttempts) {
      onError()
      return
    }

    timeoutId = setTimeout(poll, interval)
  }

  // Primer intento diferido para que el DOM se pinte primero
  timeoutId = setTimeout(poll, interval)

  /** Cancela el polling — invocar desde onUnmounted para evitar memory leaks. */
  return () => {
    cancelled = true
    if (timeoutId !== null) clearTimeout(timeoutId)
  }
}

// ─── 5. Helpers visuales ──────────────────────────────────────────────────────

/**
 * Retorna el color o gradiente CSS asociado a la red social.
 * @param {string} appPage
 * @returns {string}
 */
export const getSocialColor = (appPage) => {
  if (isTwitter(appPage))   return '#000000'
  if (isFacebook(appPage))  return '#1877F2'
  if (isInstagram(appPage)) return 'linear-gradient(45deg, #E1306C, #833AB4)'
  return '#6b7280'
}

/**
 * Retorna el símbolo o emoji representativo de la red social.
 * @param {string} appPage
 * @returns {string}
 */
export const getSocialIcon = (appPage) => {
  if (isTwitter(appPage))   return '𝕏'
  if (isFacebook(appPage))  return 'f'
  if (isInstagram(appPage)) return '📷'
  return '🔗'
}

/**
 * Formatea una fecha ISO en formato legible en español.
 * Retorna cadena vacía si la fecha es inválida o no se proporciona.
 * @param {string} dateString - Fecha en formato ISO 8601.
 * @param {string} [locale='es-ES'] - Locale para el formateo.
 * @returns {string}
 */
export const formatDate = (dateString, locale = 'es-ES') => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale, {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  }).format(date)
}
