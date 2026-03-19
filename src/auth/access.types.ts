import type { Request } from 'express';

export type AppRole = 'owner' | 'erp' | 'admin' | 'pos';

export type AppArea = 'erp' | 'admin' | 'pos';

export interface AuthWorkspace {
  id: string;
  name: string;
  slug: string;
}

export interface AuthBranch {
  id: string;
  name: string;
  code: string;
}

export interface AuthSessionUser {
  userId: string;
  email: string;
  fullName: string;
  role: AppRole;
  allowedAreas: AppArea[];
  workspace: AuthWorkspace;
  branch: AuthBranch | null;
}

export interface AuthenticatedRequest extends Request {
  auth?: AuthSessionUser;
}

export const ROLE_AREA_MAP: Record<AppRole, AppArea[]> = {
  owner: ['erp', 'admin', 'pos'],
  erp: ['erp'],
  admin: ['admin'],
  pos: ['pos'],
};
