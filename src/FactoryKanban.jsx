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
    <div style={{ display: 'flex', gap: '20px', width: '100%', overflowX: 'auto' }}>
      {FASES.map(fase => (
        <div key={fase} style={{ minWidth: '300px', flex: 1 }}>
          <h3 style={ks.faseTitle}>{fase.toUpperCase()}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {orders.filter(o => o.status === fase).map(order => (
              <div 
                key={order.id} 
                onClick={() => onCardClick(order)} 
                className="glass-card"
                style={{
                  padding: '20px', borderRadius: '16px', cursor: 'pointer', 
                  borderLeft: order.convertido ? '5px solid #10B981' : '5px solid #EF4444',
                  transition: '0.2s transform',
                  transform: 'translateY(0)'
                }}
              >
                <div style={ks.idTag}>PEDIDO FÁBRICA #{order.id}</div>
                <div style={ks.clientName}>{order.cliente}</div>
                <div style={ks.modelInfo}>{order.marca} • {order.modelo}</div>
                
                {order.convertido && (
                  <div style={ks.soldBadge}>
                    ✓ VENDIDO: PROPOSTA GERADA
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const ks = {
  faseTitle: { fontSize: '10px', fontWeight: '900', color: '#94A3B8', marginBottom: '20px', letterSpacing: '1.5px', borderLeft: '3px solid #EF4444', paddingLeft: '10px' },
  idTag: { fontSize: '9px', fontWeight: '800', color: '#94A3B8', marginBottom: '8px' },
  clientName: { fontSize: '16px', fontWeight: '700', color: '#1E293B' },
  modelInfo: { fontSize: '13px', color: '#64748B', marginTop: '4px' },
  soldBadge: { marginTop: '15px', padding: '8px', backgroundColor: '#DCFCE7', borderRadius: '8px', color: '#166534', fontSize: '10px', fontWeight: '900', textAlign: 'center' }
}