import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import AuthButton from '../components/AuthButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'All Influencer - 인플루언서 플랫폼',
  description: '최고의 인플루언서들과 브랜드를 연결하는 플랫폼',
  keywords: ['influencer', 'marketing', 'brand', 'collaboration'],
  authors: [{ name: 'All Influencer Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
  openGraph: {
    title: 'All Influencer',
    description: '최고의 인플루언서들과 브랜드를 연결하는 플랫폼',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="text-xl font-bold text-primary-600 hover:text-primary-700">
                  All Influencer
                </Link>
              </div>
              
              <nav className="hidden md:flex space-x-8">
                <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">
                  홈
                </Link>
                <Link href="/users" className="text-gray-700 hover:text-primary-600 transition-colors">
                  사용자
                </Link>
                <Link href="/jobs" className="text-gray-700 hover:text-primary-600 transition-colors">
                  구인공고
                </Link>
              </nav>

              <div className="flex items-center gap-4">
                <AuthButton />
              </div>
            </div>
          </div>
        </header>

        <div className="min-h-screen bg-background text-foreground">
          <main className="flex-1">{children}</main>
        </div>

        <footer className="border-t bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">플랫폼</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/users" className="text-sm text-gray-600 hover:text-gray-900">
                        사용자 목록
                      </Link>
                    </li>
                    <li>
                      <Link href="/jobs" className="text-sm text-gray-600 hover:text-gray-900">
                        구인공고
                      </Link>
                    </li>
                    <li>
                      <a href="http://localhost:3001/api/docs" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-gray-900">
                        API 문서
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">개발</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-gray-900">
                        GitHub
                      </a>
                    </li>
                    <li>
                      <a href="http://localhost:3001/api-json" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-gray-900">
                        OpenAPI JSON
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">기술 스택</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Next.js 14 + TypeScript</li>
                    <li>• NestJS + Prisma</li>
                    <li>• PostgreSQL + Docker</li>
                    <li>• Turborepo + pnpm</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  © 2024 All Influencer. 데모 프로젝트 - 교육 목적으로만 사용됩니다.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
