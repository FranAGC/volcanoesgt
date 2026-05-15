<template>
  <footer class="footer">
    <div class="footer__container">
      <div class="footer__brand">
        <h3>volcanes de<span class="logo-highlight"> guatemala</span></h3>
      </div>
      <div class="footer__bottom">
        <p>&copy; {{ new Date().getFullYear() }} VolcanoesGT. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--color-bg-alt);
  color: var(--color-text);
  padding: 2rem 2rem 2rem;
  margin-top: 1rem;
}

.footer__container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.footer__brand h3 {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 300;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer__brand span {
  font-weight: 600;
  color: var(--color-secondary);
}

.footer__brand p {
  color: var(--color-text-muted);
  max-width: 450px;
  margin: 0 auto;
  font-size: 1rem;
  line-height: 1.8;
  font-weight: 300;
}

.footer__bottom {
  width: 100%;
  border-top: 1px solid var(--color-border);
}

.footer__bottom p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
