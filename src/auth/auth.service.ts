import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  ROLE_AREA_MAP,
  type AppRole,
  type AuthBranch,
  type AuthSessionUser,
  type AuthWorkspace,
} from './access.types';

interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
}

interface MembershipRow {
  id: string;
  role: AppRole;
  workspace_id: string;
  branch_id: string | null;
}

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async login(payload: { email: string; password: string }) {
    const supabase = this.supabaseService.getPublicClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = await this.resolveUserFromToken(data.session.access_token);

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
      user,
    };
  }

  async getCurrentUser(token: string) {
    return this.resolveUserFromToken(token);
  }

  private async resolveUserFromToken(token: string): Promise<AuthSessionUser> {
    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const authUser = data.user;

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .eq('id', authUser.id)
      .maybeSingle<ProfileRow>();

    if (profileError || !profile) {
      throw new ForbiddenException('User profile is not configured');
    }

    const { data: membership, error: membershipError } = await supabase
      .from('workspace_memberships')
      .select('id, role, workspace_id, branch_id')
      .eq('user_id', authUser.id)
      .eq('active', true)
      .limit(1)
      .maybeSingle<MembershipRow>();

    if (membershipError || !membership) {
      throw new ForbiddenException('No active workspace membership found');
    }

    const workspace = await this.getWorkspace(membership.workspace_id);
    const branch = membership.branch_id
      ? await this.getBranch(membership.branch_id)
      : null;

    return {
      userId: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: membership.role,
      allowedAreas: ROLE_AREA_MAP[membership.role] ?? [],
      workspace,
      branch,
    };
  }

  private async getWorkspace(workspaceId: string): Promise<AuthWorkspace> {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('workspaces')
      .select('id, name, slug')
      .eq('id', workspaceId)
      .maybeSingle<AuthWorkspace>();

    if (error || !data) {
      throw new ForbiddenException('Workspace not found');
    }

    return data;
  }

  private async getBranch(branchId: string): Promise<AuthBranch> {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('branches')
      .select('id, name, code')
      .eq('id', branchId)
      .maybeSingle<AuthBranch>();

    if (error || !data) {
      throw new ForbiddenException('Branch not found');
    }

    return data;
  }
}
