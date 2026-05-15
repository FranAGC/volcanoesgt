<template>
  <nav :class="['navbar', { 'navbar--scrolled': isScrolled || !transparent }]">
    <div class="navbar__container">
      <ul class="navbar__links">
        <li><router-link :to="{ name: 'Home', hash: '#inicio' }">Inicio</router-link></li>
        <li><router-link :to="{ name: 'Volcanoes' }">Volcanes</router-link></li>
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
  padding: 1.5rem 0;
  transition: all 0.3s ease;
  z-index: 100;
  background-color: #2a2d34; /* Color oscuro base de la imagen */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Si es transparente al inicio, no tiene fondo ni sombra */
.navbar:not(.navbar--scrolled) {
  background-color: transparent;
  box-shadow: none;
}

.navbar__container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.navbar__links {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar__links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: opacity 0.2s ease;
}

.navbar__links a:hover,
.navbar__links a.router-link-exact-active {
  opacity: 0.8;
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .navbar {
    padding: 1rem 0;
  }
  .navbar__links {
    gap: 1.5rem;
  }
  .navbar__links a {
    font-size: 0.9rem;
  }
}
</style>
