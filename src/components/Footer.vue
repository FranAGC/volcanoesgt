<template>
  <footer class="footer">
    <div class="footer__bottom">
      <p>&copy; {{ new Date().getFullYear() }} VolcanoesGT. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #2a2d34;
  color: white;
  text-align: center;
  padding: 1.5rem 0;
  margin-top: 4rem;
}

.footer__bottom p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}
</style>
