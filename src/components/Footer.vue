<template>
  <footer class="footer">
    <div class="footer__container">
      <div class="footer__brand">
        <h3>🌋 Volcanoes<span class="highlight">GT</span></h3>
        <p>Descubre la majestuosidad de la tierra viva. Explora los volcanes de Guatemala con la mejor información.</p>
      </div>
      
      <div class="footer__bottom">
        <p>&copy; {{ new Date().getFullYear() }} VolcanoesGT. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--color-primary);
  color: white;
  padding: 4rem 2rem 2rem;
  margin-top: 6rem;
  border-top: 4px solid var(--color-secondary);
}

.footer__container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 3rem;
}

.footer__brand h3 {
  font-family: var(--font-heading);
  font-size: 2rem;
  color: white;
  margin-bottom: 1rem;
  letter-spacing: -0.5px;
}

.footer__brand .highlight {
  color: var(--color-secondary);
}

.footer__brand p {
  color: rgba(255, 255, 255, 0.7);
  max-width: 400px;
  margin: 0 auto;
  font-size: 1rem;
  line-height: 1.6;
}

.footer__bottom {
  width: 100%;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer__bottom p {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
}
</style>
