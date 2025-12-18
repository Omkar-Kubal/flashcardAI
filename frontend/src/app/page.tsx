import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex bg-[#101922]">
      {/* Sidebar placeholder */}
      <aside className="w-64 h-screen bg-[#111a22] border-r border-[#233648] flex flex-col shrink-0 hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FACC15] flex items-center justify-center text-[#101922]">
            <span className="material-symbols-outlined text-[20px]">flash_on</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-bold leading-none tracking-tight">BrainDeck</h1>
            <p className="text-[#92adc9] text-xs font-normal mt-1">AI Learning</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-2 flex flex-col gap-2">
          <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#92adc9] hover:bg-[#233648] hover:text-white transition-colors">
            <span className="material-symbols-outlined">login</span>
            <span className="text-sm font-medium">Sign In</span>
          </Link>
          <Link href="/signup" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#92adc9] hover:bg-[#233648] hover:text-white transition-colors">
            <span className="material-symbols-outlined">person_add</span>
            <span className="text-sm font-medium">Sign Up</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#233648] bg-[#111a22]/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#FACC15] flex items-center justify-center text-[#101922]">
              <span className="material-symbols-outlined text-[20px]">flash_on</span>
            </div>
            <span className="text-white font-bold">BrainDeck</span>
          </div>
          <div className="hidden md:block"></div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-[#92adc9] hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="px-4 py-2 text-sm font-bold bg-[#FACC15] text-[#101922] rounded-lg hover:bg-[#EAB308] transition-colors">
              Sign Up
            </Link>
          </div>
        </header>

        {/* Hero */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto text-center py-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Learn Smarter with
              <span className="block mt-2 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] bg-clip-text text-transparent">
                AI-Powered Flashcards
              </span>
            </h1>
            <p className="text-xl text-[#92adc9] mb-10 max-w-2xl mx-auto">
              BrainDeck uses spaced repetition and AI to help you remember anything.
              Create flashcards from any text or let AI generate them for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="btn-primary text-lg py-4 px-8">
                <span className="material-symbols-outlined">rocket_launch</span>
                Start Learning Free
              </Link>
              <Link href="/login" className="btn-secondary text-lg py-4 px-8 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">login</span>
                Sign In
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="card card-hover">
              <div className="icon-box mb-4">
                <span className="material-symbols-outlined text-[#FACC15]">psychology</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Spaced Repetition</h3>
              <p className="text-[#92adc9]">
                Our algorithm shows you cards right before you forget them, maximizing retention.
              </p>
            </div>
            <div className="card card-hover">
              <div className="icon-box mb-4">
                <span className="material-symbols-outlined text-[#FACC15]">auto_awesome</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Generation</h3>
              <p className="text-[#92adc9]">
                Paste any text or upload a PDF. Our AI creates flashcards automatically.
              </p>
            </div>
            <div className="card card-hover">
              <div className="icon-box mb-4">
                <span className="material-symbols-outlined text-[#FACC15]">insights</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Track Progress</h3>
              <p className="text-[#92adc9]">
                See your learning stats, streaks, and mastery rate. Stay motivated.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
