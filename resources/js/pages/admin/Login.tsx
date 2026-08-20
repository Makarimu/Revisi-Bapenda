import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../../api/admin/auth';
import { AuthContext } from '../../contexts/AuthContext';

const LOGO_URL = 'https://lh3.googleusercontent.com/d/1UJLWaokvtdtss1PGlPt4skw8lJwIi3Su';
const BG_URL = 'https://lh3.googleusercontent.com/d/1qsLqxQVafVsTz1nBp6IPDb0-4-UzhLfW';

export default function Login() {
  const navigate = useNavigate();
  const { loginContext } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    if (!username || !password) {
      setError('Masukkan username dan password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiLogin(username, password);
      // Handle both response formats
      const token = res.data?.token || res.token;
      const userData = res.data?.user || res.data?.admin || res.user || res.admin || { name: username };
      
      if (!token) throw new Error('Token tidak ditemukan dalam respons');
      
      loginContext(userData, token);
      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Username atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-screen { min-height:100vh; display:flex; align-items:center; justify-content:center; background:url('${BG_URL}') center/cover no-repeat; padding:20px; }
        .login-card { background:white; border-radius:14px; padding:36px; width:100%; max-width:380px; box-shadow:0 20px 60px rgba(0,0,0,0.25); border:1px solid #E5E7EB; }
        .login-logo { text-align:center; margin-bottom:24px; }
        .login-logo h2 { color:#2E7D32; font-size:20px; font-weight:700; margin-top:10px; }
        .login-logo p { color:#6B7280; font-size:13px; margin-top:3px; }
        .login-field { display:flex; flex-direction:column; gap:5px; margin-bottom:14px; }
        .login-field label { font-size:11px; font-weight:700; color:#6B7280; text-transform:uppercase; letter-spacing:0.5px; }
        .login-field input { border:1px solid #D9DEE5; border-radius:8px; padding:9px 12px; font-size:13px; font-family:inherit; background:#fff; width:100%; color:#222; box-sizing:border-box; transition:border-color 0.2s, box-shadow 0.2s; }
        .login-field input:focus { outline:none; border-color:#2E7D32; box-shadow:0 0 0 3px rgba(46,125,50,0.12); }
        .pw-wrapper { position:relative; }
        .pw-wrapper input { padding-right:42px !important; }
        .btn-pw { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#6B7280; padding:4px; display:flex; align-items:center; }
        .btn-pw:hover { color:#2E7D32; }
        .btn-login { width:100%; background:#2E7D32; color:white; border:none; border-radius:8px; padding:12px; font-size:15px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.2s; margin-top:4px; }
        .btn-login:hover:not(:disabled) { background:#256628; }
        .btn-login:disabled { background:#aaa; cursor:not-allowed; }
        .login-err { color:#e74c3c; font-size:13px; text-align:center; margin-top:10px; }
      `}</style>
      <div className="login-screen">
        <div className="login-card">
          <div className="login-logo">
            <img src={LOGO_URL} alt="Bappenda Juara" style={{height:'48px',width:'auto',margin:'0 auto',display:'block'}} referrerPolicy="no-referrer"/>
            <h2>Admin Login</h2>
            <p>Sistem Kunjungan Kerja</p>
          </div>

          <div className="login-field">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key==='Enter' && doLogin()}
              placeholder="Masukkan username"
            />
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="pw-wrapper">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key==='Enter' && doLogin()}
                placeholder="Masukkan password"
              />
              <button type="button" className="btn-pw" onClick={() => setShowPw(!showPw)}>
                {showPw ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button className="btn-login" disabled={loading} onClick={doLogin}>
            {loading ? 'Memeriksa...' : 'Masuk'}
          </button>

          {error && <p className="login-err">{error}</p>}
        </div>
      </div>
    </>
  );
}
