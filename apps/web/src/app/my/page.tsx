import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

async function getUserRole() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    
    if (!accessToken) {
      return null;
    }

    const response = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: {
        'Cookie': cookieStore.toString(),
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return data.user?.role;
    }

    return null;
  } catch (error) {
    console.error('Failed to get user role:', error);
    return null;
  }
}

export default async function MyPage() {
  const userRole = await getUserRole();

  if (!userRole) {
    redirect('/auth/login');
  }

  // 역할별 리다이렉트
  if (userRole === 'INFLUENCER') {
    redirect('/my/influencer');
  } else if (userRole === 'ADVERTISER') {
    redirect('/my/advertiser');
  } else {
    // ADMIN이거나 기타 역할의 경우 기본적으로 인플루언서로
    redirect('/my/influencer');
  }
}
