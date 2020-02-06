import { getDirs } from './util/task-helpers';

// All paths are related to the base dir
export const source = 'packages';
export const samplePath = 'sample';
export const integrationPath = 'integration';

export const packagePaths = getDirs(source);
