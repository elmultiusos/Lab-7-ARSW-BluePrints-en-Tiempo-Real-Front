import { useState } from 'react';

export default function BlueprintActions({ 
  onSave, 
  onDelete, 
  onCreate,
  disabled 
}) {
  const [newBpName, setNewBpName] = useState('');
  const [creating, setCreating] = useState(false);
  
  const handleCreate = async () => {
    if (!newBpName.trim()) {
      alert('Por favor ingresa un nombre para el plano');
      return;
    }
    setCreating(true);
    try {
      await onCreate(newBpName.trim());
      setNewBpName('');
    } finally {
      setCreating(false);
    }
  };
  
  return (
    <>
      <div style={{padding:16, border:'1px solid #ddd', borderRadius:8, backgroundColor:'#f9fafb'}}>
        <h3 style={{marginTop:0, marginBottom:12, fontSize:16}}>Crear Plano</h3>
        <input 
          value={newBpName}
          onChange={e => setNewBpName(e.target.value)}
          placeholder="Nombre del plano"
          disabled={disabled || creating}
          style={{
            width:'100%', 
            padding:'8px', 
            marginBottom:8, 
            boxSizing:'border-box',
            border:'1px solid #ddd',
            borderRadius:4
          }}
          onKeyPress={e => e.key === 'Enter' && handleCreate()}
        />
        <button 
          onClick={handleCreate}
          disabled={disabled || creating}
          style={{
            width:'100%', 
            padding:'8px 16px', 
            backgroundColor: disabled || creating ? '#a7f3d0' : '#10b981', 
            color:'white', 
            border:'none', 
            borderRadius:4, 
            cursor: disabled || creating ? 'not-allowed' : 'pointer', 
            fontWeight:'bold'
          }}
        >
          {creating ? '⏳ Creando...' : '➕ Crear'}
        </button>
      </div>

      <div style={{padding:16, border:'1px solid #ddd', borderRadius:8, backgroundColor:'#f9fafb'}}>
        <h3 style={{marginTop:0, marginBottom:12, fontSize:16}}>Acciones</h3>
        <button 
          onClick={onSave}
          disabled={disabled}
          style={{
            width:'100%', 
            padding:'8px 16px', 
            backgroundColor: disabled ? '#93c5fd' : '#3b82f6', 
            color:'white', 
            border:'none', 
            borderRadius:4, 
            cursor: disabled ? 'not-allowed' : 'pointer', 
            marginBottom:8, 
            fontWeight:'bold'
          }}
        >
          💾 Guardar
        </button>
        <button 
          onClick={onDelete}
          disabled={disabled}
          style={{
            width:'100%', 
            padding:'8px 16px', 
            backgroundColor: disabled ? '#fca5a5' : '#ef4444', 
            color:'white', 
            border:'none', 
            borderRadius:4, 
            cursor: disabled ? 'not-allowed' : 'pointer', 
            fontWeight:'bold'
          }}
        >
          🗑️ Eliminar
        </button>
      </div>
    </>
  );
}
