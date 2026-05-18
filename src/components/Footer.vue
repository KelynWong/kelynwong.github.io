<template>
  <footer class="footer">
    <div class="footer-content">
      <span>Made with passion by Kelyn Wong and powered by AI © 2026</span>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
}
</script>

<style scoped>
.footer {
  background: var(--bg2);
  border-top: 1px solid var(--border);
  color: var(--text);
  font-family: var(--sans);
}

.footer-content {
  width: 100%;
  padding: 20px 24px 20px 20px;
  text-align: right;
  font-size: 12px;
  color: var(--text-dim);
}

@media (max-width: 768px) {
  .footer-content {
    padding: 16px 24px 16px 24px;
  }
}
</style>
