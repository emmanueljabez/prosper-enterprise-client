import dashboard from './dashboard';
import catalog from './catalog';
import pricing from './pricing';
import inventory from './inventory';
import stock from './stock';
import rules from './rules';
import warehouse from './warehouse';
import locations from './locations';
import sync from './sync';
import integration from './integration';
import type { NavigationItem } from './navigation';

export const navigation: NavigationItem[] = [
  ...dashboard,
  ...catalog,
  ...pricing,
  ...inventory,
  ...stock,
  ...rules,
  ...warehouse,
  ...locations,
  ...sync,
  ...integration
];