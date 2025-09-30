import type { FunctionalComponent } from 'vue';
import type { LucideProps } from 'lucide-vue-next';

export interface NavigationItem {
  title: string;
  icon?: FunctionalComponent<LucideProps>;
  url?: string;
  isActive?: boolean;
  permission?: string;
  children?: NavigationItem[];
}