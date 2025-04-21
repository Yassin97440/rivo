<script setup lang="ts">
definePageMeta({
  layout: 'auth'
});

const user = useSupabaseUser();
const redirectInfo = useSupabaseCookieRedirect();
const loading = ref(true);

watch(user, () => {
  if (user.value) {
    loading.value = false;
    // Récupérer le chemin de redirection et le supprimer du cookie
    const path = redirectInfo.pluck();
    // Rediriger vers le chemin sauvegardé ou vers la page d'accueil
    navigateTo(path || '/');
  }
}, { immediate: true });
</script>

<template>
  <v-container class="max-w-md mx-auto d-flex flex-column justify-center align-center min-h-[50vh]">
    <v-card class="bg-surface rounded-lg w-100">
      <v-card-text class="text-center py-6">
        <v-progress-circular 
          v-if="loading" 
          indeterminate 
          color="primary" 
          class="mb-4"
          size="64"
        ></v-progress-circular>
        <h2 class="text-h5 mb-4">Authentification en cours...</h2>
        <p class="text-body-1 text-medium-emphasis">
          Veuillez patienter pendant que nous confirmons votre identité.
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template> 