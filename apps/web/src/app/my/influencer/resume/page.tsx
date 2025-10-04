'use client';

import { useState, useEffect } from 'react';
import { User, MapPin, Globe, Star, Save, Edit3, Plus, X } from 'lucide-react';

interface ResumeData {
  headline?: string;
  bio?: string;
  skills: string[];
  portfolioUrls: string[];
  resumeJson?: any;
  categories: string[];
  location?: string;
  languages: string[];
  ratePerPost?: number;
  updatedAt: string;
}

export default function InfluencerResumePage() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newPortfolioUrl, setNewPortfolioUrl] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const response = await fetch(`${API_URL}/my/influencer/resume`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setResume(data);
      } else {
        console.error('Failed to fetch resume');
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!resume) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/my/influencer/resume`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          headline: resume.headline,
          bio: resume.bio,
          skills: resume.skills,
          portfolioUrls: resume.portfolioUrls,
          resumeJson: resume.resumeJson,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setResume({ ...resume, ...updatedData });
        setIsEditing(false);
        alert('이력서가 성공적으로 저장되었습니다.');
      } else {
        alert('저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && resume) {
      setResume({
        ...resume,
        skills: [...resume.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    if (resume) {
      setResume({
        ...resume,
        skills: resume.skills.filter((_, i) => i !== index),
      });
    }
  };

  const addPortfolioUrl = () => {
    if (newPortfolioUrl.trim() && resume) {
      setResume({
        ...resume,
        portfolioUrls: [...resume.portfolioUrls, newPortfolioUrl.trim()],
      });
      setNewPortfolioUrl('');
    }
  };

  const removePortfolioUrl = (index: number) => {
    if (resume) {
      setResume({
        ...resume,
        portfolioUrls: resume.portfolioUrls.filter((_, i) => i !== index),
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              이력서를 불러올 수 없습니다
            </h2>
            <p className="text-red-600">
              서버와의 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">이력서 관리</h1>
              <p className="mt-1 text-sm text-gray-500">
                마지막 업데이트: {new Date(resume.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={saving}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? '저장 중...' : '저장하기'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 flex items-center"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  편집하기
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8 space-y-8">
            {/* 기본 정보 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>
              
              <div className="space-y-4">
                {/* 헤드라인 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    한 줄 소개
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={resume.headline || ''}
                      onChange={(e) => setResume({ ...resume, headline: e.target.value })}
                      placeholder="예: 테크 리뷰 전문 인플루언서입니다."
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {resume.headline || '한 줄 소개를 추가해보세요.'}
                    </p>
                  )}
                </div>

                {/* 자기소개 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    자기소개
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={resume.bio || ''}
                      onChange={(e) => setResume({ ...resume, bio: e.target.value })}
                      placeholder="자신에 대해 자세히 소개해주세요..."
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 whitespace-pre-line">
                      {resume.bio || '자기소개를 추가해보세요.'}
                    </p>
                  )}
                </div>

                {/* 기타 기본 정보 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{resume.location || '위치 미설정'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="h-4 w-4 mr-2" />
                    <span>
                      포스트당 요금: {resume.ratePerPost 
                        ? `${resume.ratePerPost.toLocaleString()}원`
                        : '미설정'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 보유 기술/관심사 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">보유 기술 · 관심사</h2>
              
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(index)}
                          className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      placeholder="새 기술/관심사 추가"
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={addSkill}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {resume.skills.length > 0 ? (
                    resume.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">보유 기술이나 관심사를 추가해보세요.</p>
                  )}
                </div>
              )}
            </div>

            {/* 포트폴리오 링크 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">포트폴리오</h2>
              
              {isEditing ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {resume.portfolioUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 text-blue-600 hover:text-blue-500 underline"
                        >
                          {url}
                        </a>
                        <button
                          onClick={() => removePortfolioUrl(index)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newPortfolioUrl}
                      onChange={(e) => setNewPortfolioUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPortfolioUrl()}
                      placeholder="https://example.com"
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={addPortfolioUrl}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {resume.portfolioUrls.length > 0 ? (
                    resume.portfolioUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500 underline"
                        >
                          {url}
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">포트폴리오 링크를 추가해보세요.</p>
                  )}
                </div>
              )}
            </div>

            {/* 카테고리 & 언어 (읽기 전용) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">전문 분야</h2>
                <div className="flex flex-wrap gap-2">
                  {resume.categories.length > 0 ? (
                    resume.categories.map((category, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                      >
                        {category}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">전문 분야가 설정되지 않았습니다.</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">사용 언어</h2>
                <div className="flex flex-wrap gap-2">
                  {resume.languages.map((language, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
