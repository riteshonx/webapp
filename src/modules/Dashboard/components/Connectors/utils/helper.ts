import { AgaveLinkType, SourceSystemType } from './types';
export const getSourceSystemLabel = (metadata: any): SourceSystemType => {
  if ('Procore' in metadata) return 'Procore';
  else if ('BIM 360' in metadata) return 'BIM 360';
  return 'Slate';
};

export const getTransformAccountId = (sourceSystem: AgaveLinkType | null) => {
  if (!sourceSystem) return null;
  const { name, accountId } = sourceSystem;
  if (name === 'Procore') return accountId;
  else if (name === 'BIM 360') return accountId.slice(2);
  return '';
};
