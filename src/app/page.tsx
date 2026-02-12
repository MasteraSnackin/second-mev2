import { getCurrentUser } from '@/lib/auth';
import { LoginButton, LogoutButton } from '@/components/LoginButton';
import { UserProfile } from '@/components/UserProfile';
import { ChatWindow } from '@/components/ChatWindow';

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    // Landing page for non-authenticated users
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-mint-50 to-teal-50">
        {/* Header */}
        <header className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Linka
            </h1>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-6xl font-bold text-gray-900 mb-6">
              智能匹配，连接未来
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              基于 SecondMe AI 的社交匹配平台，通过智能兴趣分析和个性化推荐，帮助你找到真正契合的伙伴
            </p>
            <div className="flex justify-center mb-16">
              <LoginButton />
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-20">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">智能匹配</h3>
                <p className="text-gray-600">
                  基于兴趣标签和个人特质，AI 智能评估匹配度，推荐最适合的连接
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">AI 助手</h3>
                <p className="text-gray-600">
                  与 SecondMe AI 对话，获取个性化建议和深度洞察
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">个性展示</h3>
                <p className="text-gray-600">
                  展示你的兴趣、知识和独特个性，吸引志同道合的人
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 mt-20 border-t border-emerald-100">
          <div className="text-center text-gray-500">
            <p>Powered by SecondMe API</p>
          </div>
        </footer>
      </div>
    );
  }

  // Dashboard for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-mint-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Linka
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                {user.nickname || '欢迎'}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - User Profile */}
          <div className="lg:col-span-1">
            <UserProfile />
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-2">
            <ChatWindow />
          </div>
        </div>

        {/* Match Section - Coming Soon */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            智能匹配功能即将上线
          </h2>
          <p className="text-gray-600">
            我们正在开发基于 AI 的兴趣匹配功能，敬请期待！
          </p>
        </div>
      </main>
    </div>
  );
}
