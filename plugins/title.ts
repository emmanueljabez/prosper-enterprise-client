import { defineNuxtPlugin } from '#app';
import { navigation } from '/navigation/vertical';

export default defineNuxtPlugin((nuxtApp) => {
  const findTitleByRoute = (routePath: string): string | undefined => {
    for (const item of navigation) {
      if (item.children) {
        for (const child of item.children) {
          if (child.url === routePath) {
            return child.title;
          }
        }
      } else if (item.url === routePath) {
        return item.title;
      }
    }
    return undefined;
  };
  
  const formatTitle = (title: string | undefined): string => {
    if (!title || title === 'Prosper Mentor') {
      return 'Prosper Mentor';
    }
    return `Prosper Mentor - ${title}`;
  };

  nuxtApp.hook('app:mounted', () => {
    const initialPath = window.location.pathname;
    const pageTitle = findTitleByRoute(initialPath);
    document.title = formatTitle(pageTitle);
  });
  
  nuxtApp.hook('page:finish', (component) => {
    const currentPath = window.location.pathname;
    const pageTitle = findTitleByRoute(currentPath);
    document.title = formatTitle(pageTitle);
  });
});