import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const FASES = ['Proposta solicitada', 'Proposta Recebida', 'Pedido Feito / Aguardando Maq', 'Proposta Concluida/ Maquina Recebida']

export default function FactoryKanban({ onCardClick }) {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('Proposta_Fabrica').select('*').order('id', { ascending: false })
      setOrders(data || [])
    }
    load()
  }, [])

  return (
    <div style={{ display: 'flex', gap: '25px', width: '100%', overflowX: 'auto' }}>
      {FASES.map(fase => (
        <div key={fase} style={{ minWidth: '320px', flex: 1 }}>
          <h3 style={ks.faseTitle}>{fase.toUpperCase()}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {orders.filter(o => o.status === fase).map(order => (
              <div 
                key={order.id} 
                onClick={() => onCardClick(order)} 
                style={{
                  ...ks.card,
                  backgroundColor: order.convertido ? '#10B981' : 'rgba(30, 41, 59, 0.5)',
                  border: order.convertido ? '1px solid #059669' : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{fontSize: '10px', fontWeight: '900', color: order.convertido ? '#ECFDF5' : '#94A3B8', marginBottom: '8px'}}>PEDIDO #{order.id}</div>
                <div style={{fontSize: '16px', fontWeight: '700', color: '#fff'}}>{order.cliente}</div>
                <div style={{fontSize: '13px', color: order.convertido ? '#D1FAE5' : '#64748B', marginTop: '5px'}}>{order.marca} • {order.modelo}</div>
                {order.convertido && <div style={ks.badge}>✓ CONVERTIDO EM VENDA</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const ks = {
  faseTitle: { fontSize: '11px', fontWeight: '900', color: '#94A3B8', marginBottom: '20px', letterSpacing: '1.5px', borderLeft: '3px solid #EF4444', paddingLeft: '10px' },
  card: { padding: '20px', borderRadius: '16px', cursor: 'pointer', backdropFilter: 'blur(10px)', transition: '0.3s ease' },
  badge: { marginTop: '15px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', textAlign: 'center' }
}