<script setup lang="ts">
// Pas besoin de vérifier l'authentification ici, car ce layout 
// est spécifiquement pour les pages non-authentifiées
</script>

<template>
  <v-app>
    <v-main class="bg-background">
      <v-container class="d-flex flex-column justify-center min-h-screen py-12">
        <div class="text-center mb-8">
          <!-- Logo ou titre du site -->
          <h1 class="text-primary text-h4 font-weight-bold">Votre Application</h1>
        </div>
        
        <!-- Contenu de la page actuelle -->
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template> 