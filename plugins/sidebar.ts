export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('page:finish', (page) => {
      const sidebarRoutes = ['/app/dashboard/dashboard', '/team-performance', '/message-analytics'];
  
      if (page && sidebarRoutes.includes((nuxtApp.$router as any).currentRoute.value.path)) {
        (page as any).layout = 'sidebar';
      } else if (page) {
        (page as any).layout = 'default';
      }
    });
  });