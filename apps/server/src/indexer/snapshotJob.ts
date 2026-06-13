import { scheduleSnapshotJob as scheduleSnapshotJobImpl } from '../jobs/snapshotJob';

export const snapshotJob = {
  start: () => scheduleSnapshotJobImpl(),
};

export { scheduleSnapshotJobImpl as scheduleSnapshotJob };
