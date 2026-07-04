import { NavLink, useNavigate } from 'react-router-dom'

const navigation = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10.5V20h13V10.5" />
      </svg>
    )
  },
  {
    to: '/upload-statement',
    label: 'Upload Statement',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5" />
        <path d="M12 13v5" />
        <path d="m9.5 15.5 2.5-2.5 2.5 2.5" />
      </svg>
    )
  },
  {
    to: '/add-transaction',
    label: 'Add Transaction',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    )
  }
]

function Layout({ children }) {
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') || 'FinPilot User'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col justify-between bg-slate-900 p-6 text-slate-300 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 7.5h16" />
                <path d="M7 4h10" />
                <path d="M6 11h12" />
                <path d="M8 15h8" />
                <path d="M10 19h4" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">FinPilot</p>
              <p className="text-sm text-slate-400">AI finance OS</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <span className="shrink-0">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm font-medium text-white">{userName}</p>
          <p className="mt-1 text-sm text-slate-400">Premium AI assistant</p>
          <button
            onClick={handleLogout}
            className="mt-4 w-full rounded-xl border border-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-60">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur lg:hidden">
          <div>
            <p className="text-lg font-semibold text-slate-800">FinPilot</p>
            <p className="text-sm text-slate-500">AI financial assistant</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
          >
            Logout
          </button>
        </div>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

export default Layout
