import { syncAllTraits as syncAllTraitsImpl } from '../services/traitSync';

export const traitSync = {
  start: () => syncAllTraitsImpl(),
};

export { syncAllTraitsImpl as syncAllTraits };
