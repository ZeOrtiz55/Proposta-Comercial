import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const COLUNAS = [
  { nome: 'Enviar Proposta', cor: '#3B82F6' },
  { nome: 'AGUARDANDO RESPOSTA CLIENTE', cor: '#F59E0B' },
  { nome: 'AGUARDANDO RESPOSTA BANCO', cor: '#8B5CF6' },
  { nome: 'Concluida-Vendido', cor: '#10B981' },
  { nome: 'Concluida- Não vendido.', cor: '#EF4444' }
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
              {cards.filter(c => c.status === col.nome).map(card => {
                const isFromFactory = !!card.id_fabrica_ref;
                
                return (
                  <div 
                    key={card.id} 
                    style={{
                      ...kStyles.card,
                      backgroundColor: isFromFactory ? '#F0FDF4' : '#fff',
                      borderColor: isFromFactory ? '#10B981' : '#E5E7EB',
                      transform: hoveredCard === card.id ? 'translateY(-5px)' : 'none',
                      boxShadow: hoveredCard === card.id ? '0 10px 20px rgba(0,0,0,0.1)' : '0 2px 5px rgba(0,0,0,0.05)'
                    }} 
                    onMouseEnter={() => setHoveredCard(card.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => onCardClick(card)}
                  >
                    <div style={{...kStyles.statusTab, backgroundColor: isFromFactory ? '#10B981' : col.cor}}></div>
                    
                    <div style={kStyles.cardTop}>
                      <div style={{display: 'flex', flexDirection: 'column'}}>
                        <span style={kStyles.client}>{card.Cliente || 'SEM NOME'}</span>
                        {isFromFactory && (
                          <span style={{color: '#059669', fontSize: '9px', fontWeight: '900'}}>✓ ORIGEM FÁBRICA #{card.id_fabrica_ref}</span>
                        )}
                      </div>
                      <span style={kStyles.id}>ID #{card.id}</span>
                    </div>

                    <div style={kStyles.details}>
                      <p style={kStyles.modelText}>{card.Marca} {card.Modelo}</p>
                      <p style={kStyles.subText}>{card.Cidade || 'Cidade não inf.'}</p>
                    </div>

                    <div style={kStyles.cardFooter}>
                      <div style={kStyles.price}>R$ {Number(card.Valor_Total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
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
                )
              })}
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
  col: { minWidth: '320px', width: '320px' },
  colHeader: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    marginBottom: '15px', backgroundColor: '#fff', padding: '12px 15px', 
    borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' 
  },
  colTitle: { fontSize: '11px', fontWeight: '800', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px' },
  badge: { backgroundColor: '#F3F4F6', color: '#111827', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { 
    borderRadius: '12px', padding: '16px', border: '1px solid',
    position: 'relative', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden'
  },
  statusTab: { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  client: { fontSize: '14px', fontWeight: '700', color: '#111827', maxWidth: '85%', overflow: 'hidden', textOverflow: 'ellipsis' },
  id: { fontSize: '10px', color: '#9CA3AF', fontWeight: 'bold' },
  details: { marginBottom: '12px' },
  modelText: { margin: 0, color: '#374151', fontSize: '13px', fontWeight: '600' },
  subText: { margin: '4px 0 0 0', color: '#9CA3AF', fontSize: '11px' },
  cardFooter: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    borderTop: '1px solid #F3F4F6', paddingTop: '10px', marginTop: '5px' 
  },
  price: { color: '#EF4444', fontSize: '14px', fontWeight: '800' },
  statusSelect: { backgroundColor: '#F3F4F6', border: 'none', color: '#4B5563', fontSize: '9px', fontWeight: '900', padding: '6px', borderRadius: '6px', outline: 'none', cursor: 'pointer', textTransform: 'uppercase' }
}