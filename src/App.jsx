import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { BlueprintService } from './services/api/blueprint.service.js';
import { useBlueprints, useBlueprint } from './hooks/useBlueprint.js';
import { useWebSocket } from './hooks/useWebSocket.js';
import AuthModal from './components/AuthModal.jsx';
import Canvas from './components/Canvas.jsx';
import BlueprintList from './components/BlueprintList.jsx';
import BlueprintActions from './components/BlueprintActions.jsx';
import ConnectionStatus from './components/ConnectionStatus.jsx';
import { log } from './utils/logger.js';

const blueprintService = new BlueprintService();


function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const [tech, setTech] = useState('socketio');
  const [name, setName] = useState('plano-1');
  
  const author = user?.username || '';
  
  // Load blueprints and current blueprint
  const { blueprints, reload: reloadBlueprints } = useBlueprints(author, tech, isAuthenticated);
  const { blueprint, updateBlueprint, addPoint } = useBlueprint(author, name, tech, isAuthenticated);
  
  // Setup WebSocket connection
  const { connectionStatus, sendDrawEvent } = useWebSocket(
    tech,
    author,
    name,
    isAuthenticated,
    (data) => {
      // On blueprint update from server
      updateBlueprint({ author: data.author, name: data.name, points: data.points });
    },
    () => {
      // On blueprints list update
      reloadBlueprints();
    }
  );
  
  // Handle canvas click
  const handleCanvasClick = (point) => {
    addPoint(point);
    sendDrawEvent(point);
  };
  
  // Handle create blueprint
  const handleCreateBlueprint = async (newName) => {
    try {
      await blueprintService.create(author, newName, [], tech);
      await reloadBlueprints();
      setName(newName);
      log.success(`Blueprint created: ${author}/${newName}`);
    } catch (error) {
      if (error.message === 'AUTH_ERROR') {
        logout();
      } else {
        alert(error.message || 'Error al crear el plano');
      }
    }
  };
  
  // Handle save blueprint
  const handleSaveBlueprint = async () => {
    if (!blueprint) return;
    
    try {
      await blueprintService.update(author, name, blueprint.points, tech);
      alert('Plano guardado exitosamente');
      await reloadBlueprints();
    } catch (error) {
      if (error.message === 'AUTH_ERROR') {
        logout();
      } else {
        alert(error.message || 'Error al guardar el plano');
      }
    }
  };
  
  // Handle delete blueprint
  const handleDeleteBlueprint = async () => {
    if (!confirm(`¿Estás seguro de eliminar el plano "${name}"?`)) return;
    
    try {
      await blueprintService.delete(author, name, tech);
      alert('Plano eliminado exitosamente');
      await reloadBlueprints();
      
      // Select another blueprint or default
      if (blueprints.length > 1) {
        const otherBp = blueprints.find(bp => bp.name !== name);
        if (otherBp) setName(otherBp.name);
      } else {
        setName('plano-1');
      }
    } catch (error) {
      if (error.message === 'AUTH_ERROR') {
        logout();
      } else {
        alert(error.message || 'Error al eliminar el plano');
      }
    }
  };
  
  if (!isAuthenticated) {
    return <AuthModal tech={tech} />;
  }
  
  const totalPoints = blueprint?.points?.length || 0;
  
  return (
    <div style={{fontFamily:'Inter, system-ui', padding:16, maxWidth:1200}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
        <h2 style={{margin:0}}>BluePrints RT – Socket.IO vs STOMP</h2>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <span style={{fontSize:14, color:'#666'}}>
            👤 <strong>{author}</strong>
          </span>
          <button
            onClick={logout}
            style={{
              padding:'6px 12px', fontSize:14,
              backgroundColor:'#6b7280', color:'white',
              border:'none', borderRadius:4, cursor:'pointer'
            }}
          >
            🚪 Salir
          </button>
        </div>
      </div>
      
      <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:16, flexWrap:'wrap'}}>
        <label>Tecnología:</label>
        <select 
          value={tech} 
          onChange={e => setTech(e.target.value)} 
          style={{padding:'4px 8px'}}
        >
          <option value="stomp">STOMP (Spring)</option>
          <option value="socketio">Socket.IO (Node)</option>
        </select>
        <span style={{color:'#666', fontSize:14, fontWeight:'bold'}}>
          Autor: {author}
        </span>
        <select 
          value={name} 
          onChange={e => setName(e.target.value)}
          style={{padding:'4px 8px', minWidth:150}}
        >
          {blueprints.map(bp => (
            <option key={bp.name} value={bp.name}>{bp.name}</option>
          ))}
        </select>
        <div style={{marginLeft:'auto'}}>
          <ConnectionStatus status={connectionStatus} />
        </div>
      </div>

      <div style={{display:'flex', gap:16, marginBottom:16}}>
        <div style={{flex:1}}>
          <div style={{marginBottom:8}}>
            <strong>Plano actual: {name}</strong>
            <span style={{marginLeft:16, color:'#666'}}>Total de puntos: {totalPoints}</span>
          </div>
          
          <Canvas currentBp={blueprint} onClick={handleCanvasClick} />
        </div>

        <div style={{width:280, display:'flex', flexDirection:'column', gap:12}}>
          <BlueprintActions
            onSave={handleSaveBlueprint}
            onDelete={handleDeleteBlueprint}
            onCreate={handleCreateBlueprint}
            disabled={!blueprint}
          />
          
          <BlueprintList
            blueprints={blueprints}
            currentName={name}
            onSelectBlueprint={setName}
          />
        </div>
      </div>

      <p style={{opacity:.7, fontSize:14}}>
        💡 Tip: abre 2 pestañas y dibuja alternando para ver la colaboración en tiempo real.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
