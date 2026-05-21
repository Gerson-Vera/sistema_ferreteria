import {
  HomeIcon,
  CubeIcon,
  ShoppingCartIcon,
  UsersIcon,
  TruckIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  DocumentChartBarIcon,
  BuildingStorefrontIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

const MAP: Record<string, HeroIcon> = {
  'home':              HomeIcon,
  'cube':              CubeIcon,
  'shopping-cart':     ShoppingCartIcon,
  'users':             UsersIcon,
  'truck':             TruckIcon,
  'banknotes':         BanknotesIcon,
  'chart-bar':         ChartBarIcon,
  'cog-6-tooth':       Cog6ToothIcon,
  'currency-dollar':   CurrencyDollarIcon,
  'arrow-trending-up': ArrowTrendingUpIcon,
  'clock':             ClockIcon,
  'document-text':     DocumentTextIcon,
  'archive-box':       ArchiveBoxIcon,
  'document-chart-bar': DocumentChartBarIcon,
  'building-storefront': BuildingStorefrontIcon,
  'wrench-screwdriver': WrenchScrewdriverIcon,
};

export function getIcon(name: string): HeroIcon {
  return MAP[name] ?? CubeIcon;
}

export {
  HomeIcon, CubeIcon, ShoppingCartIcon, UsersIcon, TruckIcon,
  BanknotesIcon, ChartBarIcon, Cog6ToothIcon, CurrencyDollarIcon,
  ArrowTrendingUpIcon, ClockIcon, DocumentTextIcon, ArchiveBoxIcon,
  DocumentChartBarIcon, BuildingStorefrontIcon,
  ArrowTrendingUpIcon as ArrowUpIcon,
};
