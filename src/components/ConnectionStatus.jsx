export default function ConnectionStatus({ status }) {
  const getStatusColor = () => {
    switch(status) {
      case 'connected': return '#10b981';
      case 'connecting': return '#f59e0b';
      case 'disconnected': return '#6b7280';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };
  
  const getStatusText = () => {
    switch(status) {
      case 'connected': return '● Conectado';
      case 'connecting': return '⏳ Conectando...';
      case 'disconnected': return '○ Desconectado';
      case 'error': return '⚠️ Error';
      default: return '○ Desconectado';
    }
  };
  
  return (
    <div style={{
      padding:'4px 12px',
      borderRadius:4,
      fontSize:12,
      fontWeight:'bold',
      color: getStatusColor(),
      border: `1px solid ${getStatusColor()}`,
      backgroundColor: `${getStatusColor()}22`
    }}>
      {getStatusText()}
    </div>
  );
}
