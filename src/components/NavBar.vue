<template>
  <nav :class="['navbar', { 'navbar--scrolled': isScrolled || !transparent }]">
    <div class="navbar__container">
      <router-link :to="{ name: 'Home' }" class="navbar__logo">
        🌋 Volcanoes<span class="logo-highlight">GT</span>
      </router-link>
      
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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  background-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

/* Glassmorphism for scrolled or solid state */
.navbar--scrolled {
  background: rgba(15, 23, 42, 0.85); /* var(--color-primary) with opacity */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Si es transparente al inicio, no tiene fondo ni sombra */
.navbar:not(.navbar--scrolled) {
  background-color: transparent;
  box-shadow: none;
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
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  text-decoration: none;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-highlight {
  color: var(--color-secondary);
}

.navbar__links {
  display: flex;
  gap: 2.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar__links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 0;
}

.navbar__links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background-color: var(--color-secondary);
  transition: width 0.3s ease;
  border-radius: var(--radius-full);
}

.navbar__links a:hover,
.navbar__links a.router-link-exact-active {
  color: white;
}

.navbar__links a:hover::after,
.navbar__links a.router-link-exact-active::after {
  width: 100%;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .navbar {
    padding: 1rem 0;
  }
  .navbar__container {
    flex-direction: column;
    gap: 1rem;
  }
  .navbar__links {
    gap: 1.5rem;
  }
}
</style>
