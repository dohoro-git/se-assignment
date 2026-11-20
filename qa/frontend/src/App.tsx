import { useState } from 'react'
import { useSession } from './features/auth/hooks/useSession'
import { AuthPage } from './features/auth/routes/AuthPage'
import { DashboardPage } from './features/tasks/routes/DashboardPage'

export default function App() {
  const { sessions, session, reason, signIn, activate, clear } = useSession()
  const [showAccountForm, setShowAccountForm] = useState(false)

  return (
    <>
      <header className="brand"><div className="wrap"><span className="mark" aria-hidden="true">D</span> Dohoro Task Desk</div></header>
      {session && !showAccountForm ? (
        <DashboardPage
          key={session.token}
          session={session}
          sessions={sessions}
          clearSession={clear}
          switchSession={activate}
          onAddAccount={() => setShowAccountForm(true)}
        />
      ) : (
        <AuthPage
          signIn={signIn}
          reason={reason}
          onAuthenticated={() => setShowAccountForm(false)}
          onCancel={sessions.length ? () => setShowAccountForm(false) : undefined}
        />
      )}
    </>
  )
}
