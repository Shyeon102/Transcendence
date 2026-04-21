import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../store/index'
import { logout } from '../store/slices/authSlice'

const Header = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const user = useSelector((state: RootState) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header>
      <h1 onClick={() => navigate('/')}>미디어 플랫폼 navigate</h1>
      <nav>
        {isAuthenticated ? (
          <>
            <span>{user?.username}</span>
            <button onClick={() => navigate('/home')}>홈</button>
            <button onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')}>로그인</button>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header