<template>
  <div class="loading-container">
    <div class="spinner"></div>
    <p>Cargando...</p>
  </div>
</template>

<script setup>
  // No necesitas lógica reactiva aquí, es un componente visual puro
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ccc;
  border-top: 4px solid #3498db; /* Puedes usar colorFuerte si lo tienes */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
