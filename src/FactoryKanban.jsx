import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const FASES = ['Proposta solicitada', 'Proposta Recebida', 'Pedido Feito / Aguardando Maq', 'Proposta Concluida/ Maquina Recebida']

export default function FactoryKanban({ onCardClick }) {
  const [orders, setOrders] = useState([])

  const load = async () => {
    const { data } = await supabase.from('Proposta_Fabrica').select('*').order('id', { ascending: false })
    setOrders(data || [])
  }

  useEffect(() => { load() }, [])

  const handleStatusChange = async (e, id) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    const { error } = await supabase.from('Proposta_Fabrica').update({ status: newStatus }).eq('id', id)
    if (!error) load();
  }

  return (
    <div style={{ display: 'flex', gap: '20px', width: '100%', overflowX: 'auto', paddingBottom: '20px' }}>
      {FASES.map(fase => (
        <div key={fase} style={{ minWidth: '320px', flex: 1 }}>
          <h3 style={ks.faseTitle}>{fase.toUpperCase()}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {orders.filter(o => o.status === fase).map(order => (
              <div key={order.id} className="glass-card" style={{
                  padding: '20px', borderRadius: '16px', cursor: 'pointer', 
                  borderLeft: order.convertido ? '5px solid #10B981' : '5px solid #EF4444',
                  backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}
              >
                <div onClick={() => onCardClick(order)}>
                  <div style={ks.idTag}>PEDIDO FÁBRICA #{order.id}</div>
                  <div style={ks.clientName}>{order.cliente}</div>
                  <div style={ks.modelInfo}>{order.marca} • {order.modelo}</div>
                </div>

                <div style={{marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px'}}>
                  <label style={{fontSize: '9px', fontWeight: '900', color: '#94A3B8', display: 'block', marginBottom: '5px'}}>FASE:</label>
                  <select 
                    value={order.status} 
                    onClick={(e) => e.stopPropagation()} 
                    onChange={(e) => handleStatusChange(e, order.id)}
                    style={ks.select}
                  >
                    {FASES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
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
  select: { width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: '700', cursor: 'pointer', backgroundColor: '#F8FAFC' }
}