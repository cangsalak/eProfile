import { ModuleDefinition } from '@/lib/modules/types';
import { VehiclesManifest } from './manifest';
import VehicleList from './components/VehicleList';

export * from './manifest';
export { default as VehicleCard } from './components/VehicleCard';
export { default as VehicleFormModal } from './components/VehicleFormModal';
export { default as VehicleList } from './components/VehicleList';
export * from './components/VehicleCard';
export * from './components/VehicleFormModal';
export * from './components/VehicleList';

export const VehiclesModule: ModuleDefinition = {
  manifest: VehiclesManifest,
  views: {
    '': VehicleList,
  },
};
