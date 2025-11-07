import { useEffect, useRef, useState } from 'react'
import { createStompClient, subscribeBlueprint } from './lib/stompClient.js'
import { createSocket } from './lib/socketIoClient.js'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080' // Spring
const IO_BASE  = import.meta.env.VITE_IO_BASE  ?? 'http://localhost:3001' // Node/Socket.IO

// ============================================
// LOGGING UTILITIES
// ============================================
const isDev = import.meta.env.DEV;

const log = {
  info: (msg, data) => isDev && console.log(`ℹ️  [INFO] ${msg}`, data || ''),
  success: (msg, data) => isDev && console.log(`✅ [SUCCESS] ${msg}`, data || ''),
  error: (msg, data) => console.error(`❌ [ERROR] ${msg}`, data || ''),
  warn: (msg, data) => isDev && console.warn(`⚠️  [WARN] ${msg}`, data || ''),
  socket: (msg, data) => isDev && console.log(`🔌 [SOCKET] ${msg}`, data || ''),
  canvas: (msg, data) => isDev && console.log(`🎨 [CANVAS] ${msg}`, data || ''),
}

export default function App() {
  const [tech, setTech] = useState('socketio')
  const [author, setAuthor] = useState('juan')
  const [name, setName] = useState('plano-1')
  const [blueprints, setBlueprints] = useState([])
  const [currentBp, setCurrentBp] = useState(null)
  const [newBpName, setNewBpName] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const canvasRef = useRef(null)

  const stompRef = useRef(null)
  const unsubRef = useRef(null)
  const socketRef = useRef(null)

  // Load blueprints list for the author
  const loadBlueprintsList = () => {
    log.info(`Loading blueprints for author: ${author}`);
    fetch(`${tech==='stomp'?API_BASE:IO_BASE}/api/blueprints/${author}`)
      .then(r=>r.json())
      .then(list => {
        setBlueprints(list)
        log.success(`Loaded ${list.length} blueprints for ${author}`);
      })
      .catch(err => {
        log.error('Error loading blueprints list', err)
        console.error('Error loading blueprints list:', err)
      })
  }

  useEffect(() => {
    loadBlueprintsList()
  }, [tech, author])

  useEffect(() => {
    log.info(`Fetching blueprint: ${author}/${name}`);
    fetch(`${tech==='stomp'?API_BASE:IO_BASE}/api/blueprints/${author}/${name}`)
      .then(r=>r.json())
      .then(bp => {
        setCurrentBp(bp)
        drawAll(bp)
        log.success(`Blueprint loaded: ${author}/${name}`, { points: bp.points?.length || 0 });
      })
      .catch(err => {
        log.error('Error loading blueprint', err)
        console.error('Error loading blueprint:', err)
      })
  }, [tech, author, name])

  function drawAll(bp) {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0,0,600,400)
    if (!bp || !bp.points || bp.points.length === 0) {
      log.canvas('Canvas cleared - no points to draw');
      return
    }
    
    ctx.strokeStyle = '#2563eb'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    ctx.beginPath()
    bp.points.forEach((p,i)=> {
      if (i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y)
    })
    ctx.stroke()
    
    // Draw points as circles
    ctx.fillStyle = '#dc2626'
    bp.points.forEach(p => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
      ctx.fill()
    })
    
    log.canvas(`Drew ${bp.points.length} points on canvas`);
  }

  useEffect(() => {
    unsubRef.current?.(); unsubRef.current = null
    stompRef.current?.deactivate?.(); stompRef.current = null
    socketRef.current?.disconnect?.(); socketRef.current = null

    if (tech === 'stomp') {
      log.info('Initializing STOMP connection', { server: API_BASE });
      setConnectionStatus('connecting');
      const client = createStompClient(API_BASE)
      stompRef.current = client
      client.onConnect = () => {
        setConnectionStatus('connected');
        log.success('STOMP connected', { server: API_BASE });
        unsubRef.current = subscribeBlueprint(client, author, name, (upd)=> {
          const bp = { author, name, points: upd.points }
          setCurrentBp(bp)
          drawAll(bp)
          log.socket('Received blueprint update via STOMP', { points: upd.points.length });
        })
        log.socket(`Subscribed to blueprint: ${author}/${name}`);
      }
      client.activate()
    } else {
      log.info('Initializing Socket.IO connection', { server: IO_BASE });
      setConnectionStatus('connecting');
      const s = createSocket(IO_BASE)
      socketRef.current = s
      const room = `blueprints.${author}.${name}`
      
      s.on('connect', () => {
        setConnectionStatus('connected');
        log.success('Socket.IO connected', { socketId: s.id, server: IO_BASE });
      });
      
      s.on('disconnect', (reason) => {
        setConnectionStatus('disconnected');
        log.warn('Socket.IO disconnected', { reason });
      });
      
      s.on('connect_error', (error) => {
        setConnectionStatus('error');
        log.error('Socket.IO connection error', error.message);
      });
      
      s.emit('join-room', room)
      log.socket(`Joining room: ${room}`);
      
      s.on('blueprint-update', (upd)=> {
        const bp = { author: upd.author, name: upd.name, points: upd.points }
        setCurrentBp(bp)
        drawAll(bp)
        log.socket('Received blueprint-update', { author: upd.author, name: upd.name, points: upd.points.length });
      })
      s.on('blueprints-list-update', (data) => {
        if (data.author === author) {
          log.socket('Received blueprints-list-update', { author: data.author });
          loadBlueprintsList()
        }
      })
    }
    return () => {
      log.info('Cleaning up connections');
      unsubRef.current?.(); unsubRef.current = null
      stompRef.current?.deactivate?.()
      socketRef.current?.disconnect?.()
      setConnectionStatus('disconnected');
    }
  }, [tech, author, name])

  function onClick(e) {
    const rect = e.target.getBoundingClientRect()
    const point = { x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) }

    log.canvas(`Point clicked: (${point.x}, ${point.y})`);

    // Immediately add point to local state and redraw
    const newPoints = [...(currentBp?.points || []), point]
    const updatedBp = { ...currentBp, points: newPoints }
    setCurrentBp(updatedBp)
    drawAll(updatedBp)

    if (tech === 'stomp' && stompRef.current?.connected) {
      stompRef.current.publish({ destination: '/app/draw', body: JSON.stringify({ author, name, point }) })
      log.socket('Sent draw-event via STOMP', { point });
    } else if (tech === 'socketio' && socketRef.current?.connected) {
      const room = `blueprints.${author}.${name}`
      socketRef.current.emit('draw-event', { room, author, name, point })
      log.socket('Sent draw-event via Socket.IO', { room, point });
    }
  }

  async function createBlueprint() {
    if (!newBpName.trim()) return alert('Por favor ingresa un nombre para el plano')
    
    log.info(`Creating blueprint: ${author}/${newBpName}`);
    try {
      const response = await fetch(`${tech==='stomp'?API_BASE:IO_BASE}/api/blueprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, name: newBpName, points: [] })
      })
      
      if (response.ok) {
        setNewBpName('')
        loadBlueprintsList()
        setName(newBpName)
        log.success(`Blueprint created: ${author}/${newBpName}`);
      } else {
        const error = await response.json()
        log.error(`Failed to create blueprint: ${error.error}`);
        alert(error.error || 'Error al crear el plano')
      }
    } catch (err) {
      log.error('Error creating blueprint', err)
      console.error('Error creating blueprint:', err)
      alert('Error al crear el plano')
    }
  }

  async function saveBlueprint() {
    if (!currentBp) return
    
    log.info(`Saving blueprint: ${author}/${name}`, { points: currentBp.points.length });
    try {
      const response = await fetch(`${tech==='stomp'?API_BASE:IO_BASE}/api/blueprints/${author}/${name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: currentBp.points })
      })
      
      if (response.ok) {
        log.success(`Blueprint saved: ${author}/${name}`, { points: currentBp.points.length });
        alert('Plano guardado exitosamente')
        loadBlueprintsList()
      }
    } catch (err) {
      log.error('Error saving blueprint', err)
      console.error('Error saving blueprint:', err)
      alert('Error al guardar el plano')
    }
  }

  async function deleteBlueprint() {
    if (!confirm(`¿Estás seguro de eliminar el plano "${name}"?`)) return
    
    log.warn(`Deleting blueprint: ${author}/${name}`);
    try {
      const response = await fetch(`${tech==='stomp'?API_BASE:IO_BASE}/api/blueprints/${author}/${name}`, {
        method: 'DELETE'
      })
      
      if (response.ok || response.status === 204) {
        log.success(`Blueprint deleted: ${author}/${name}`);
        alert('Plano eliminado exitosamente')
        loadBlueprintsList()
        // Load the first available blueprint or create a new one
        if (blueprints.length > 1) {
          const otherBp = blueprints.find(bp => bp.name !== name)
          if (otherBp) setName(otherBp.name)
        } else {
          setName('plano-1')
        }
      }
    } catch (err) {
      log.error('Error deleting blueprint', err)
      console.error('Error deleting blueprint:', err)
      alert('Error al eliminar el plano')
    }
  }

  const totalPoints = currentBp?.points?.length || 0
  
  const getConnectionStatusColor = () => {
    switch(connectionStatus) {
      case 'connected': return '#10b981';
      case 'connecting': return '#f59e0b';
      case 'disconnected': return '#6b7280';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };
  
  const getConnectionStatusText = () => {
    switch(connectionStatus) {
      case 'connected': return '● Conectado';
      case 'connecting': return '⏳ Conectando...';
      case 'disconnected': return '○ Desconectado';
      case 'error': return '⚠️ Error';
      default: return '○ Desconectado';
    }
  };

  return (
    <div style={{fontFamily:'Inter, system-ui', padding:16, maxWidth:1200}}>
      <h2>BluePrints RT – Socket.IO vs STOMP</h2>
      
      <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:16, flexWrap:'wrap'}}>
        <label>Tecnología:</label>
        <select value={tech} onChange={e=>setTech(e.target.value)} style={{padding:'4px 8px'}}>
          <option value="stomp">STOMP (Spring)</option>
          <option value="socketio">Socket.IO (Node)</option>
        </select>
        <input 
          value={author} 
          onChange={e=>setAuthor(e.target.value)} 
          placeholder="autor"
          style={{padding:'4px 8px'}}
        />
        <select 
          value={name} 
          onChange={e=>setName(e.target.value)}
          style={{padding:'4px 8px', minWidth:150}}
        >
          {blueprints.map(bp => (
            <option key={bp.name} value={bp.name}>{bp.name}</option>
          ))}
        </select>
        <div style={{
          marginLeft:'auto',
          padding:'4px 12px',
          borderRadius:4,
          fontSize:12,
          fontWeight:'bold',
          color: getConnectionStatusColor(),
          border: `1px solid ${getConnectionStatusColor()}`,
          backgroundColor: `${getConnectionStatusColor()}22`
        }}>
          {getConnectionStatusText()}
        </div>
      </div>

      <div style={{display:'flex', gap:16, marginBottom:16}}>
        <div style={{flex:1}}>
          <div style={{marginBottom:8}}>
            <strong>Plano actual: {name}</strong>
            <span style={{marginLeft:16, color:'#666'}}>Total de puntos: {totalPoints}</span>
          </div>
          
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            style={{border:'2px solid #ddd', borderRadius:8, cursor:'crosshair', display:'block'}}
            onClick={onClick}
          />
          
          <p style={{opacity:.7, marginTop:8, fontSize:14}}>
            👆 Haz clic en el canvas para agregar puntos
          </p>
        </div>

        <div style={{width:280, display:'flex', flexDirection:'column', gap:12}}>
          <div style={{padding:16, border:'1px solid #ddd', borderRadius:8, backgroundColor:'#f9fafb'}}>
            <h3 style={{marginTop:0, marginBottom:12, fontSize:16}}>Crear Plano</h3>
            <input 
              value={newBpName}
              onChange={e=>setNewBpName(e.target.value)}
              placeholder="Nombre del plano"
              style={{width:'100%', padding:'8px', marginBottom:8, boxSizing:'border-box'}}
              onKeyPress={e => e.key === 'Enter' && createBlueprint()}
            />
            <button 
              onClick={createBlueprint}
              style={{width:'100%', padding:'8px 16px', backgroundColor:'#10b981', color:'white', border:'none', borderRadius:4, cursor:'pointer', fontWeight:'bold'}}
            >
              ➕ Crear
            </button>
          </div>

          <div style={{padding:16, border:'1px solid #ddd', borderRadius:8, backgroundColor:'#f9fafb'}}>
            <h3 style={{marginTop:0, marginBottom:12, fontSize:16}}>Acciones</h3>
            <button 
              onClick={saveBlueprint}
              style={{width:'100%', padding:'8px 16px', backgroundColor:'#3b82f6', color:'white', border:'none', borderRadius:4, cursor:'pointer', marginBottom:8, fontWeight:'bold'}}
            >
              💾 Guardar
            </button>
            <button 
              onClick={deleteBlueprint}
              style={{width:'100%', padding:'8px 16px', backgroundColor:'#ef4444', color:'white', border:'none', borderRadius:4, cursor:'pointer', fontWeight:'bold'}}
            >
              🗑️ Eliminar
            </button>
          </div>

          <div style={{padding:16, border:'1px solid #ddd', borderRadius:8, backgroundColor:'#fef3c7'}}>
            <h3 style={{marginTop:0, marginBottom:8, fontSize:16}}>Planos de {author}</h3>
            <div style={{fontSize:14, color:'#666'}}>
              Total: {blueprints.length} plano(s)
            </div>
            <ul style={{margin:'8px 0 0 0', padding:'0 0 0 20px', fontSize:14}}>
              {blueprints.map(bp => (
                <li key={bp.name} style={{marginBottom:4}}>
                  <span 
                    onClick={() => setName(bp.name)}
                    style={{cursor:'pointer', color: bp.name === name ? '#2563eb' : '#000', fontWeight: bp.name === name ? 'bold' : 'normal'}}
                  >
                    {bp.name}
                  </span>
                  <span style={{color:'#999', marginLeft:8}}>({bp.points?.length || 0} pts)</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p style={{opacity:.7, fontSize:14}}>
        💡 Tip: abre 2 pestañas y dibuja alternando para ver la colaboración en tiempo real.
      </p>
    </div>
  )
}
