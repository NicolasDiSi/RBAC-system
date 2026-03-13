
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/services/auth/permissions';
import { getRoleById } from '@/lib/data/role';

export async function GET(request: Request, { params }: { params: { roleId: string } }) {
  try {
    const hasPermission = await checkPermission("roles.read");
    if (!hasPermission) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    const { roleId } = await params;

    if (!roleId) {
      return NextResponse.json({ message: 'Role ID is required' }, { status: 400 });
    }

    const { rolePermissions } = await getRoleById(roleId); // Fix this type inference

    return NextResponse.json(rolePermissions.map((rp)=>rp.permissionId));
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
