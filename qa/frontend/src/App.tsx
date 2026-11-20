import { useSession } from './features/auth/hooks/useSession'
import { AuthPage } from './features/auth/routes/AuthPage'
import { DashboardPage } from './features/tasks/routes/DashboardPage'

export default function App() {
  const { session, reason, signIn, clear } = useSession()
  return (
    <>
      <header className="brand"><div className="wrap"><span className="mark" aria-hidden="true">D</span> Dohoro Task Desk</div></header>
      {session ? <DashboardPage key={session.user.id} session={session} clearSession={clear} /> : <AuthPage signIn={signIn} reason={reason} />}
    </>
  )
}
