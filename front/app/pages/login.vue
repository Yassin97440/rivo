<script setup lang="ts">
definePageMeta({
    layout: 'auth'
});

const supabase = useSupabaseClient();
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const formMode = ref('login'); // 'login' ou 'register'
const loading = ref(false);
const errorMessage = ref('');

// Changement entre les modes connexion et inscription
const toggleFormMode = () => {
  formMode.value = formMode.value === 'login' ? 'register' : 'login';
  errorMessage.value = '';
};

// Connexion avec email/mot de passe
const signInWithPassword = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Veuillez remplir tous les champs';
    return;
  }
  
  loading.value = true;
  errorMessage.value = '';
  
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    
    if (error) throw error;

    navigateTo('/');
  } catch (error: any) {
    errorMessage.value = error.message || 'Erreur de connexion';
  } finally {
    loading.value = false;
  }
};

// Inscription avec email/mot de passe
const signUpWithPassword = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Veuillez remplir tous les champs';
    return;
  }
  
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas';
    return;
  }
  
  loading.value = true;
  errorMessage.value = '';
  
  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`,
      }
    });
    
    if (error) throw error;
  } catch (error: any) {
    errorMessage.value = error.message || 'Erreur d\'inscription';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-container class="max-w-md mx-auto">
    <v-card class="bg-surface mt-10 rounded-lg">
      <v-card-title class="text-primary text-center text-h5 font-weight-bold pt-8">
        {{ formMode === 'login' ? 'Connexion' : 'Inscription' }}
      </v-card-title>
      
      <v-card-text>
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
        </v-alert>
        
        <v-form @submit.prevent="formMode === 'login' ? signInWithPassword() : signUpWithPassword()">
          <v-text-field
            v-model="email"
            type="email"
            label="Adresse e-mail"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            class="mb-3"
            data-testid="email-input"
          />
          
          <v-text-field
            v-model="password"
            type="password"
            label="Mot de passe"
            prepend-inner-icon="mdi-lock-outline"
            variant="outlined"
            class="mb-3"
            data-testid="password-input"
          />
          
          <v-text-field
            v-if="formMode === 'register'"
            v-model="confirmPassword"
            type="password"
            label="Confirmer le mot de passe"
            prepend-inner-icon="mdi-lock-outline"
            variant="outlined"
            class="mb-3"
            data-testid="confirm-password-input"
          />
          
          <v-btn
            block
            color="primary"
            size="large"
            type="submit"
            :loading="loading"
            class="mb-4"
            data-testid="submit-button"
          >
            {{ formMode === 'login' ? 'Se connecter' : 'S\'inscrire' }}
          </v-btn>
        </v-form>
        
        <div class="text-center">
          <p class="text-body-2 text-medium-emphasis mb-2">
            {{ formMode === 'login' ? 'Vous n\'avez pas de compte ?' : 'Vous avez déjà un compte ?' }}
          </p>
          <v-btn
            variant="text"
            color="primary"
            @click="toggleFormMode"
            data-testid="toggle-form-button"
          >
            {{ formMode === 'login' ? 'S\'inscrire' : 'Se connecter' }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
