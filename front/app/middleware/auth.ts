export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();
  const redirectInfo = useSupabaseCookieRedirect();
  
  // Si l'utilisateur n'est pas connecté et tente d'accéder à une page protégée
  if (!user.value) {
    // Sauvegarde du chemin actuel pour la redirection après connexion
    redirectInfo.path.value = to.fullPath;
    
    // Redirection vers la page de connexion
    return navigateTo('/login');
  }
}) 