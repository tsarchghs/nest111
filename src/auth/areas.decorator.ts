import { SetMetadata } from '@nestjs/common';
import type { AppArea } from './access.types';

export const ALLOWED_AREAS_KEY = 'allowedAreas';

export const AllowedAreas = (...areas: AppArea[]) =>
  SetMetadata(ALLOWED_AREAS_KEY, areas);
