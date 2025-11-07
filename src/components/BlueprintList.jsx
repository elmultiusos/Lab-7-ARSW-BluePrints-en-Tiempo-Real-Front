export default function BlueprintList({ blueprints, currentName, onSelectBlueprint }) {
  return (
    <div style={{padding:16, border:'1px solid #ddd', borderRadius:8, backgroundColor:'#fef3c7'}}>
      <h3 style={{marginTop:0, marginBottom:8, fontSize:16}}>Mis Planos</h3>
      <div style={{fontSize:14, color:'#666', marginBottom:8}}>
        Total: {blueprints.length} plano(s)
      </div>
      <ul style={{margin:'8px 0 0 0', padding:'0 0 0 20px', fontSize:14, maxHeight:200, overflowY:'auto'}}>
        {blueprints.length === 0 ? (
          <li style={{color:'#999'}}>No hay planos disponibles</li>
        ) : (
          blueprints.map(bp => (
            <li key={bp.name} style={{marginBottom:4}}>
              <span 
                onClick={() => onSelectBlueprint(bp.name)}
                style={{
                  cursor:'pointer', 
                  color: bp.name === currentName ? '#2563eb' : '#000', 
                  fontWeight: bp.name === currentName ? 'bold' : 'normal',
                  textDecoration: bp.name === currentName ? 'underline' : 'none'
                }}
              >
                {bp.name}
              </span>
              <span style={{color:'#999', marginLeft:8}}>
                ({bp.points?.length || 0} pts)
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
