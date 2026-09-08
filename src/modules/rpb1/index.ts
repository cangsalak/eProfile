import { ModuleDefinition } from '@/lib/modules/types';
import { Rpb1Manifest } from './manifest';
import Rpb1ListView from './views/Rpb1ListView';
import Rpb1FormView from './views/Rpb1FormView';

export * from './types';
export * from './manifest';
export { default as Page1Personal } from './components/Page1Personal';
export { default as Page2Education } from './components/Page2Education';
export { default as Page3WorkMilitary } from './components/Page3WorkMilitary';
export { default as Page4SocialForeign } from './components/Page4SocialForeign';
export { default as Page5LegalParents } from './components/Page5LegalParents';
export { default as Page6MarriageChildren } from './components/Page6MarriageChildren';
export { default as Page7RelativesOverseas } from './components/Page7RelativesOverseas';
export { default as Page8CohabitantsSignatures } from './components/Page8CohabitantsSignatures';
export { default as Page9SketchMap } from './components/Page9SketchMap';
export { default as Page10AdditionalRecord } from './components/Page10AdditionalRecord';
export { default as Rpb1PrintDocument } from './components/Rpb1PrintDocument';
export { default as Rpb1FormView } from './views/Rpb1FormView';
export { default as Rpb1ListView } from './views/Rpb1ListView';

export const Rpb1Module: ModuleDefinition = {
  manifest: Rpb1Manifest,
  views: {
    '': Rpb1ListView,
    'form': Rpb1FormView,
  },
};
