'use client';

import { useEffect, useState } from 'react';

interface UserInfo {
  user_id: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
}

interface Shade {
  name: string;
  score?: number;
  category?: string;
}

export function UserProfile() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [shades, setShades] = useState<Shade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        // Fetch user info
        const infoRes = await fetch('/api/user/info');
        const infoData = await infoRes.json();
        if (infoData.code === 0) {
          setUserInfo(infoData.data);
        }

        // Fetch user shades
        const shadesRes = await fetch('/api/user/shades');
        const shadesData = await shadesRes.json();
        if (shadesData.code === 0 && shadesData.data.shades) {
          setShades(shadesData.data.shades);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="text-center p-8 text-gray-500">
        无法加载用户信息
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
      {/* User Header */}
      <div className="flex items-center gap-4 mb-6">
        {userInfo.avatar && (
          <img
            src={userInfo.avatar}
            alt={userInfo.nickname || '用户头像'}
            className="w-20 h-20 rounded-full object-cover shadow-md"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {userInfo.nickname || '匿名用户'}
          </h2>
          {userInfo.bio && (
            <p className="text-gray-600 mt-1">{userInfo.bio}</p>
          )}
        </div>
      </div>

      {/* Shades/Interests */}
      {shades.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">兴趣标签</h3>
          <div className="flex flex-wrap gap-2">
            {shades.map((shade, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium hover:bg-emerald-200 transition-colors"
              >
                {shade.name}
                {shade.score !== undefined && (
                  <span className="ml-1 text-emerald-600">
                    {Math.round(shade.score * 100)}%
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
