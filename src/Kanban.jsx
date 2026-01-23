import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const COLUNAS = [
  { nome: 'Enviar Proposta', cor: '#3B82F6' },
  { nome: 'Proposta Enviada', cor: '#F59E0B' },
  { nome: 'Aguardando', cor: '#8B5CF6' },
  { nome: 'Concluida-Vendido', cor: '#10B981' },
  { nome: 'Concluida- Não vendido', cor: '#EF4444' }
]

export default function Kanban({ onCardClick }) {
  const [cards, setCards] = useState([])
  const [hoveredCard, setHoveredCard] = useState(null)

  const loadData = async () => {
    const { data } = await supabase.from('Formulario').select('*').order('id', { ascending: false })
    setCards(data || [])
  }

  useEffect(() => { loadData() }, [])

  const updateStatus = async (id, newStatus, e) => {
    e.stopPropagation()
    const { error } = await supabase.from('Formulario').update({ status: newStatus }).eq('id', id)
    if (!error) loadData()
  }

  return (
    <div style={kStyles.scrollContainer}>
      <div style={kStyles.wrapper}>
        {COLUNAS.map(col => (
          <div key={col.nome} style={kStyles.col}>
            <div style={{...kStyles.colHeader, borderTop: `4px solid ${col.cor}`}}>
              <h3 style={kStyles.colTitle}>{col.nome}</h3>
              <span style={kStyles.badge}>{cards.filter(c => c.status === col.nome).length}</span>
            </div>
            
            <div style={kStyles.list}>
              {cards.filter(c => c.status === col.nome).map(card => (
                <div 
                  key={card.id} 
                  style={{
                    ...kStyles.card,
                    transform: hoveredCard === card.id ? 'translateY(-5px)' : 'none',
                    boxShadow: hoveredCard === card.id ? '0 10px 20px rgba(0,0,0,0.1)' : '0 2px 5px rgba(0,0,0,0.05)'
                  }} 
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => onCardClick(card)}
                >
                  <div style={{...kStyles.statusTab, backgroundColor: col.cor}}></div>
                  
                  <div style={kStyles.cardTop}>
                    <span style={kStyles.client}>{card.Cliente || 'SEM NOME'}</span>
                    <span style={kStyles.id}>ID #{card.id}</span>
                  </div>

                  <div style={kStyles.details}>
                    <p style={kStyles.modelText}>{card.Marca} {card.Modelo}</p>
                    <p style={kStyles.subText}>{card.Cidade || 'Cidade não inf.'}</p>
                  </div>

                  <div style={kStyles.cardFooter}>
                    <div style={kStyles.price}>R$ {Number(card.Valor_Total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <select 
                      style={kStyles.statusSelect} 
                      value={card.status} 
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateStatus(card.id, e.target.value, e)}
                    >
                      {COLUNAS.map(f => <option key={f.nome} value={f.nome}>{f.nome}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const kStyles = {
  scrollContainer: { width: '100%', overflowX: 'auto', paddingBottom: '20px' },
  wrapper: { display: 'flex', gap: '24px', padding: '10px', minWidth: 'min-content' },
  col: { minWidth: '300px', width: '300px' },
  colHeader: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    marginBottom: '15px', backgroundColor: '#fff', padding: '12px 15px', 
    borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' 
  },
  colTitle: { fontSize: '13px', fontWeight: '800', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px' },
  badge: { backgroundColor: '#F3F4F6', color: '#111827', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { 
    backgroundColor: '#fff', borderRadius: '8px', padding: '16px', 
    position: 'relative', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden', border: '1px solid #E5E7EB'
  },
  statusTab: { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  client: { fontSize: '15px', fontWeight: '700', color: '#111827', maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis' },
  id: { fontSize: '10px', color: '#9CA3AF', fontWeight: 'bold' },
  details: { marginBottom: '12px' },
  modelText: { margin: 0, color: '#374151', fontSize: '14px', fontWeight: '500' },
  subText: { margin: '4px 0 0 0', color: '#9CA3AF', fontSize: '11px' },
  cardFooter: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    borderTop: '1px solid #F3F4F6', paddingTop: '10px', marginTop: '5px' 
  },
  price: { color: '#FF0000', fontSize: '15px', fontWeight: '800' },
  statusSelect: { backgroundColor: '#F9FAFB', border: 'none', color: '#6B7280', fontSize: '10px', fontWeight: 'bold', padding: '4px', borderRadius: '4px', outline: 'none' }
}