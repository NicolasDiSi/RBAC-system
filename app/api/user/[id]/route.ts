import { NextResponse } from 'next/server';
import { getUserById } from '@/lib/data/user';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Return only necessary public user data
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      is_active: user.is_active,
      role_id: user.role_id,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
