<template>
  <div class="home-view">
    <!-- fb-root requerido por el SDK de Facebook -->
    <div id="fb-root"></div>

    <NavBar :transparent="false" />

    <!-- 1. HERO SECTION -->
    <header id="inicio" class="hero">
      <div class="hero__content">
        <h1 class="hero__title">Descubre la altura<br/>de Guatemala.</h1>
        <p class="hero__subtitle">
          Una exploración minimalista de la geografía volcánica del país.
        </p>
      </div>
      <!-- Imagen de fondo sutil o abstracta -->
      <div class="hero__bg"></div>
    </header>

    <!-- 2. ESTADÍSTICAS (Minimalistas) -->
    <section class="section stats-section" ref="statsSection">
      <div class="stats-container">
        <div class="stat-item">
          <div class="stat-item__number">{{ animateStats ? totalVolcanoes : '0' }}</div>
          <div class="stat-item__label">Volcanes Registrados</div>
        </div>
        <div class="stat-item">
          <div class="stat-item__number">{{ animateStats ? '3' : '0' }}</div>
          <div class="stat-item__label">Con Actividad Constante</div>
        </div>
        <div class="stat-item">
          <div class="stat-item__number">
            {{ animateStats ? '4,220' : '0' }}<span class="stat-item__unit">m</span>
          </div>
          <div class="stat-item__label">Elevación Máxima</div>
        </div>
      </div>
    </section>

    <!-- 3. LOS MÁS POPULARES (Sin tarjetas, lista elegante) -->
    <section id="volcanes" class="section list-section">
      <div class="section__header">
        <h2 class="section__title">Destinos Frecuentes</h2>
        <p class="section__desc">Los gigantes más visitados por exploradores y turistas.</p>
      </div>

      <div v-if="popularState.loading" class="loading-state">
        Cargando destinos...
      </div>
      <div v-else-if="popularState.error" class="error-msg">
        Error al cargar la información.
      </div>
      <div v-else-if="popularVolcanoes.length === 0" class="empty-msg">
        No hay datos disponibles en este momento.
      </div>
      <div v-else class="elegant-list">
        <div
          v-for="(volcano, index) in popularVolcanoes"
          :key="volcano.id"
          class="list-item"
          @click="router.push({ name: 'Volcanoes', params: { id: volcano.id } })"
        >
          <div class="list-item__number">0{{ index + 1 }}</div>
          <div class="list-item__content">
            <h3 class="list-item__name">{{ volcano.name }}</h3>
            <p class="list-item__region">{{ volcano.region || 'Guatemala' }}</p>
          </div>
          <div class="list-item__action">
            <span>Explorar</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. REDES SOCIALES (Guías / Novedades) -->
    <section id="guias" class="section social-section">
      <div class="section__header">
        <h2 class="section__title">Novedades & Guías</h2>
      </div>

      <div v-if="postsState.loading" class="loading-state">
        Cargando novedades...
      </div>
      <div v-else-if="postsState.error" class="error-msg">
        Error al cargar las novedades.
      </div>
      <div v-else-if="posts.length === 0" class="empty-msg">
        No hay publicaciones recientes.
      </div>
      <div v-else class="social-grid">
        <div
          v-for="post in posts"
          :key="post.id"
          class="social-item"
        >
          <div class="social-item__header">
            <div class="social-icon" :style="{ color: getSocialColor(post.appPage) }">
              <i :class="getSocialIcon(post.appPage)"></i>
            </div>
            <div class="social-meta">
              <h4>{{ getSupportedNetwork(post.appPage) }}</h4>
              <span>{{ formatDate(post.createdAt) }}</span>
            </div>
          </div>
          <div class="social-item__body">
            <!-- Si no hay iframe, se muestra el content plano de forma limpia -->
            <p v-if="!post.isLoaded || post.hasError" class="social-item__content">
              {{ post.content }}
            </p>
            <div v-html="post.htmlContent" class="embed-wrapper"></div>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from "vue";
import { useRouter } from 'vue-router';
import "./HomeView.css";
import NavBar from "@/components/NavBar.vue";
import Footer from "@/components/Footer.vue";
import {
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

const router = useRouter();
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

/** Total real de volcanes para la sección de estadísticas */
const totalVolcanoes = computed(() =>
  allVolcanoNames.value.length > 0 ? String(allVolcanoNames.value.length) : "37"
);

// ─── Scroll ───────────────────────────────────────────────────────────────────

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
};

// ─── Carga de datos ───────────────────────────────────────────────────────────

const loadPopularVolcanoes = async () => {
  popularState.value = { loading: true, error: false };
  try {
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

const loadSocialPosts = async () => {
  postsState.value = { loading: true, error: false };
  try {
    const raw = await getSocialPosts('post');

    posts.value = raw
      .filter((p) => getSupportedNetwork(p.appPage) !== null)
      .slice(0, 4)
      .map((p) => ({ ...p, isLoaded: false, hasError: false }));

    const networks = [...new Set(
      posts.value.map((p) => getSupportedNetwork(p.appPage)).filter(Boolean)
    )];
    await loadSDKs(networks);

    const postsContainer = document.querySelector('.social-section');
    await nextTick();
    requestAnimationFrame(() => processEmbeds(postsContainer));

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
  loadPopularVolcanoes();
  loadSocialPosts();
  setupObserver();

  nextTick(() => {
    if (statsSection.value && observer) {
      observer.observe(statsSection.value);
    }
  });
});

onUnmounted(() => {
  if (observer) observer.disconnect();
  embedCancellers.forEach((cancel) => cancel());
  embedCancellers = [];
});
</script>

<style scoped>
@import "./HomeView.css";
</style>
