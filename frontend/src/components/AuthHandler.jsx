import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AUTH_LOGOUT_EVENT } from '../api/authEvents'

/**
 * Listens for auth-logout events dispatched from outside the React tree
 * (e.g. the axios response interceptor) and performs a SPA-friendly
 * navigation to /login using React Router.
 *
 * Mount this once, inside <BrowserRouter>.
 */
function AuthHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleLogout = () => {
      // Avoid redirect loop if we're already on the login page
      if (!window.location.pathname.startsWith('/login')) {
        navigate('/login', { replace: true })
      }
    }

    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout)
    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout)
    }
  }, [navigate])

  return null
}

export default AuthHandler
