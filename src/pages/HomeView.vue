<template>
  <div class="home-view">
    <!-- fb-root requerido por el SDK de Facebook — debe estar una sola vez -->
    <div id="fb-root"></div>

    <!-- 1. NAVBAR -->
    <nav :class="['navbar', { 'navbar--scrolled': isScrolled }]">
      <div class="navbar__container">
        <ul class="navbar__links">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#volcanes">Volcanes</a></li>
          <li><a href="#guias">Guías</a></li>
        </ul>
      </div>
    </nav>

    <!-- 2. HERO SECTION -->
    <header id="inicio" class="hero">
      <div class="hero__overlay"></div>
      <div class="hero__content">
        <h1 class="hero__title">Volcanes de Guatemala</h1>
        <p class="hero__subtitle">
          Descubre la majestuosidad de la tierra viva. Una aventura inolvidable
          te espera en las alturas.
        </p>
        <button class="btn btn--primary" @click="scrollTo('volcanes')">
          Explorar volcanes
        </button>
      </div>
    </header>

    <!-- 3. LOS MÁS POPULARES -->
    <section id="volcanes" class="section popular-section">
      <h2 class="section__title">Los más populares</h2>

      <div v-if="popularState.loading" class="grid-4">
        <div v-for="i in 4" :key="i" class="card skeleton volcano-skeleton"></div>
      </div>

      <div v-else-if="popularState.error" class="error-msg">
        <p>⚠️ Error al cargar los volcanes. Intenta de nuevo más tarde.</p>
      </div>

      <div v-else-if="popularVolcanoes.length === 0" class="empty-msg">
        <p>No hay volcanes disponibles en este momento.</p>
      </div>

      <div v-else class="grid-4">
        <div
          v-for="volcano in popularVolcanoes"
          :key="volcano.id"
          class="card volcano-card"
        >
          <!-- Solo inyecta background-image si existe la URL para evitar petición 404 -->
          <div
            class="volcano-card__bg"
            :style="volcano.imageUrl ? { backgroundImage: `url(${volcano.imageUrl})` } : {}"
          >
            <div v-if="!volcano.imageUrl" class="volcano-card__fallback">🌋</div>
          </div>
          <div class="volcano-card__overlay">
            <h3 class="volcano-card__name">{{ volcano.name }}</h3>
          </div>
        </div>
      </div>
    </section>

    <!-- MARQUEE — nombres de volcanes con scroll automático -->
    <section v-if="allVolcanoNames.length" class="marquee-section">
      <div class="marquee">
        <div class="marquee__content">
          <span
            v-for="(name, index) in marqueeItems"
            :key="`${index}-${name}`"
            class="marquee__item"
          >
            {{ name }} <span class="marquee__separator">•</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 4. PUBLICACIONES RECIENTES -->
    <section class="section posts-section">
      <h2 class="section__title">Publicaciones relevantes recientes</h2>

      <div v-if="postsState.loading" class="grid-posts">
        <div v-for="i in 4" :key="i" class="skeleton skeleton--tall"></div>
      </div>

      <div v-else-if="postsState.error" class="error-msg">
        <p>⚠️ Error al cargar las publicaciones.</p>
      </div>

      <div v-else-if="posts.length === 0" class="empty-msg">
        <p>No hay publicaciones disponibles en este momento.</p>
      </div>

      <div v-else class="grid-posts">
        <div v-for="post in posts" :key="post.id" class="post-card">
          <!-- Skeleton mientras el SDK renderiza el iframe -->
          <div v-if="!post.isLoaded" class="post-card__skeleton skeleton"></div>

          <!-- Embed container: data-post-id usado para detectar render del iframe -->
          <div
            :class="['post-card__embed', { 'is-hidden': !post.isLoaded }]"
            :data-post-id="post.id"
          >
            <!-- INSTAGRAM -->
            <blockquote
              v-if="isInstagram(post.appPage) && !post.hasError"
              class="instagram-media"
              :data-instgrm-permalink="post.srcUrl"
              data-instgrm-version="14"
              style="max-width:540px; width:100%; margin:0 auto;"
            ></blockquote>

            <!-- X / TWITTER -->
            <blockquote
              v-else-if="isTwitter(post.appPage) && !post.hasError"
              class="twitter-tweet"
            >
              <a :href="post.srcUrl"></a>
            </blockquote>

            <!-- FACEBOOK -->
            <div
              v-else-if="isFacebook(post.appPage) && !post.hasError"
              class="fb-post"
              :data-href="post.srcUrl"
              data-width="500"
            ></div>
          </div>

          <!-- Fallback: se muestra cuando hasError = true -->
          <div v-if="post.hasError" class="post-card__fallback">
            <div class="post-card__fallback-header">
              <span
                class="social-badge"
                :style="{ background: getSocialColor(post.appPage) }"
              >
                {{ getSocialIcon(post.appPage) }}
              </span>
              <span class="volcano-badge">{{ post.volcanoName }}</span>
            </div>
            <p class="post-card__fallback-desc">{{ post.description }}</p>
            <span class="post-card__fallback-date">{{ formatDate(post.createdAt) }}</span>
            <a
              :href="post.srcUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn--outline mt-auto"
            >
              Ver publicación
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. ESTADÍSTICAS -->
    <section class="section stats-section" ref="statsSection">
      <div class="grid-4 stats-grid">
        <div class="stat-item">
          <div class="stat-item__number">{{ animateStats ? totalVolcanoes : '0' }}</div>
          <div class="stat-item__label">Volcanes en total</div>
        </div>
        <div class="stat-item">
          <div class="stat-item__number">{{ animateStats ? '3' : '0' }}</div>
          <div class="stat-item__label">Activos constantemente</div>
        </div>
        <div class="stat-item">
          <div class="stat-item__number">
            {{ animateStats ? '4220' : '0' }}<span class="stat-item__unit">m</span>
          </div>
          <div class="stat-item__label">Altura máxima (Tajumulco)</div>
        </div>
        <div class="stat-item">
          <div class="stat-item__number">
            {{ animateStats ? '100' : '0' }}<span class="stat-item__unit">%</span>
          </div>
          <div class="stat-item__label">Aventura garantizada</div>
        </div>
      </div>
    </section>

    <!-- 6. FOOTER -->
    <footer class="footer">
      <div class="footer__bottom">
        <p>&copy; {{ new Date().getFullYear() }} VolcanoesGT. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from "vue";
import "./HomeView.css";
import {
  isInstagram,
  isTwitter,
  isFacebook,
  getSupportedNetwork,
  loadSDKs,
  processEmbeds,
  waitForIframe,
  getSocialColor,
  getSocialIcon,
  formatDate,
} from "@/utils/embedUtils.js";
import { getVolcanoes, getPopularVolcanoes, getSocialPosts } from "@/services/volcanoService.js";

// ─── State ────────────────────────────────────────────────────────────────────

const isScrolled       = ref(false);
const popularState     = ref({ loading: true, error: false });
const postsState       = ref({ loading: true, error: false });
const popularVolcanoes = ref([]);
const allVolcanoNames  = ref([]);
const posts            = ref([]);
const statsSection     = ref(null);
const animateStats     = ref(false);

// Cleanup refs
let observer        = null;
let embedCancellers = []; // funciones cancel() de waitForIframe

// ─── Computed ─────────────────────────────────────────────────────────────────

/** Duplicado para la animación de marquee infinito */
const marqueeItems = computed(() => [...allVolcanoNames.value, ...allVolcanoNames.value]);

/** Total real de volcanes para la sección de estadísticas */
const totalVolcanoes = computed(() =>
  allVolcanoNames.value.length > 0 ? String(allVolcanoNames.value.length) : "37"
);

// ─── Scroll ───────────────────────────────────────────────────────────────────

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

// ─── Carga de datos ───────────────────────────────────────────────────────────

/**
 * Carga los volcanes más populares desde el servicio.
 * El manejo de estados loading/error se gestiona aquí; el HTTP en volcanoService.
 * Popularity 'asc': menor número = más popular (ranking 1, 2, 3…).
 */
const loadPopularVolcanoes = async () => {
  popularState.value = { loading: true, error: false };
  try {
    // getPopularVolcanoes retorna el top-N ya ordenado y limitado
    const [popular, all] = await Promise.all([
      getPopularVolcanoes(4, 'asc'),
      getVolcanoes(),
    ]);
    popularVolcanoes.value = popular;
    allVolcanoNames.value  = all.map((v) => v.name);
  } catch {
    popularState.value.error = true;
  } finally {
    popularState.value.loading = false;
  }
};

/** Carga publicaciones de redes sociales, inicializa los embeds y gestiona el polling por iframe. */
const loadSocialPosts = async () => {
  postsState.value = { loading: true, error: false };
  try {
    const raw = await getSocialPosts('post');

    posts.value = raw
      .filter((p) => getSupportedNetwork(p.appPage) !== null)
      .slice(0, 4)
      .map((p) => ({ ...p, isLoaded: false, hasError: false }));

    // Cargar únicamente los SDKs de las redes presentes en los posts
    const networks = [...new Set(
      posts.value.map((p) => getSupportedNetwork(p.appPage)).filter(Boolean)
    )];
    await loadSDKs(networks);

    // Procesar embeds limitando el scope al contenedor de la sección
    const postsContainer = document.querySelector('.posts-section');
    await nextTick();
    requestAnimationFrame(() => processEmbeds(postsContainer));

    // Polling individual por post: detecta el iframe o activa el fallback
    embedCancellers = posts.value.map((p) =>
      waitForIframe(p.id, {
        onSuccess: () => {
          const idx = posts.value.findIndex((x) => x.id === p.id);
          if (idx !== -1)
            posts.value[idx] = { ...posts.value[idx], isLoaded: true, hasError: false };
        },
        onError: () => {
          const idx = posts.value.findIndex((x) => x.id === p.id);
          if (idx !== -1)
            posts.value[idx] = { ...posts.value[idx], isLoaded: true, hasError: true };
        },
      })
    );
  } catch {
    postsState.value.error = true;
  } finally {
    postsState.value.loading = false;
  }
};

// ─── IntersectionObserver ─────────────────────────────────────────────────────

const setupObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        animateStats.value = true;
        observer.disconnect();
      }
    },
    { threshold: 0.5 }
  );
};

// ─── Ciclo de vida ────────────────────────────────────────────────────────────

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  loadPopularVolcanoes();
  loadSocialPosts();
  setupObserver();

  // nextTick garantiza que statsSection.value esté disponible tras el primer render
  nextTick(() => {
    if (statsSection.value && observer) {
      observer.observe(statsSection.value);
    }
  });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  if (observer) observer.disconnect();
  // Cancela todos los pollings activos de waitForIframe
  embedCancellers.forEach((cancel) => cancel());
  embedCancellers = [];
});
</script>

<style scoped>
@import "./HomeView.css";
</style>
