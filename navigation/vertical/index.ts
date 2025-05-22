import dashboard from './dashboard';
import catalog from './catalog';
import pricing from './pricing';
import inventory from './inventory';
import warehouse from './warehouse';
import type { NavigationItem } from './navigation';

export const navigation: NavigationItem[] = [
  ...dashboard,
  ...catalog,
  ...pricing,
  ...inventory,
  ...warehouse,
];