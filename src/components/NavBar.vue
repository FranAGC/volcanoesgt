<template>
  <nav :class="['navbar', { 'navbar--scrolled': isScrolled || !transparent }]">
    <div class="navbar__container">
      <router-link :to="{ name: 'Home' }" class="navbar__logo">
        volcanes de<span class="logo-highlight"> guatemala</span>
      </router-link>
      
      <ul class="navbar__links">
        <li><router-link :to="{ name: 'Home', hash: '#inicio' }">Inicio</router-link></li>
        <li><router-link :to="{ name: 'Volcanoes' }">Explorar</router-link></li>
        <li><router-link :to="{ name: 'Home', hash: '#guias' }">Guías</router-link></li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineProps } from 'vue';

const props = defineProps({
  transparent: {
    type: Boolean,
    default: false
  }
});

const isScrolled = ref(false);

const handleScroll = () => {
  if (props.transparent) {
    isScrolled.value = window.scrollY > 50;
  }
};

onMounted(() => {
  if (props.transparent) {
    window.addEventListener('scroll', handleScroll);
    handleScroll();
  }
});

onUnmounted(() => {
  if (props.transparent) {
    window.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1.2rem 0;
  transition: all 0.4s ease;
  z-index: 100;
  background-color: var(--color-bg);
}

.navbar--scrolled {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--color-border);
}

.navbar:not(.navbar--scrolled) {
  background-color: transparent;
  border-bottom: 1px solid transparent;
}

.navbar__container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.navbar__logo {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 300;
  color: var(--color-text);
  text-decoration: none;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.navbar:not(.navbar--scrolled) .navbar__logo,
.navbar:not(.navbar--scrolled) .navbar__links a {
  color: var(--color-primary); /* Use deep blue if transparent (on light hero) */
}

.logo-highlight {
  font-weight: 600;
  color: var(--color-secondary);
}

.navbar__links {
  display: flex;
  gap: 3rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar__links a {
  color: var(--color-text-muted);
  text-decoration: none;
  font-weight: 400;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: color 0.3s ease;
}

.navbar__links a:hover,
.navbar__links a.router-link-exact-active {
  color: var(--color-primary);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .navbar {
    padding: 1.5rem 0;
  }
  .navbar__container {
    flex-direction: column;
    gap: 1.5rem;
  }
  .navbar__links {
    gap: 1.5rem;
  }
}
</style>
