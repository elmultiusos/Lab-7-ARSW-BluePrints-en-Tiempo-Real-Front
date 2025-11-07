import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function AuthModal({ tech }) {
  const { register, login } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (authMode === 'login') {
        await login(username, password, tech);
      } else {
        await register(username, password, tech);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{
      position:'fixed', top:0, left:0, right:0, bottom:0,
      backgroundColor:'rgba(0,0,0,0.5)', display:'flex',
      alignItems:'center', justifyContent:'center', zIndex:1000
    }}>
      <div style={{
        backgroundColor:'white', padding:32, borderRadius:8,
        width:400, maxWidth:'90%', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{marginTop:0}}>
          {authMode === 'login' ? '🔐 Iniciar Sesión' : '📝 Registro'}
        </h2>
        
        {error && (
          <div style={{
            padding:12, marginBottom:16, backgroundColor:'#fee2e2',
            color:'#991b1b', borderRadius:4, fontSize:14
          }}>
            ⚠️ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:16}}>
            <label style={{display:'block', marginBottom:4, fontWeight:'bold'}}>
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="tu_usuario"
              required
              disabled={loading}
              style={{
                width:'100%', padding:'8px', fontSize:14,
                border:'1px solid #ddd', borderRadius:4, boxSizing:'border-box'
              }}
            />
          </div>
          
          <div style={{marginBottom:16}}>
            <label style={{display:'block', marginBottom:4, fontWeight:'bold'}}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              style={{
                width:'100%', padding:'8px', fontSize:14,
                border:'1px solid #ddd', borderRadius:4, boxSizing:'border-box'
              }}
            />
            {authMode === 'register' && (
              <small style={{color:'#666', fontSize:12}}>
                Mínimo 6 caracteres
              </small>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width:'100%', padding:'12px', fontSize:16, fontWeight:'bold',
              backgroundColor: loading ? '#93c5fd' : '#3b82f6', 
              color:'white', border:'none',
              borderRadius:4, cursor: loading ? 'not-allowed' : 'pointer', 
              marginBottom:12
            }}
          >
            {loading ? '⏳ Procesando...' : (authMode === 'login' ? '🔓 Entrar' : '✨ Registrarse')}
          </button>
        </form>
        
        <div style={{textAlign:'center', fontSize:14, color:'#666'}}>
          {authMode === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => { setAuthMode('register'); setError(''); }}
                disabled={loading}
                style={{
                  background:'none', border:'none', color:'#3b82f6',
                  cursor:'pointer', textDecoration:'underline', padding:0
                }}
              >
                Regístrate aquí
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => { setAuthMode('login'); setError(''); }}
                disabled={loading}
                style={{
                  background:'none', border:'none', color:'#3b82f6',
                  cursor:'pointer', textDecoration:'underline', padding:0
                }}
              >
                Inicia sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
