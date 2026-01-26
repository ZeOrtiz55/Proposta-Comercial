import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function FactoryEditModal({ order, onClose, onConvert }) {
  const [formData, setFormData] = useState(order || {})
  const isLocked = order.convertido; // Bloqueia se já foi gerado

  const handleUpdate = async () => {
    if(isLocked) return;
    const { error } = await supabase.from('Proposta_Fabrica').update(formData).eq('id', order.id)
    if (!error) { alert("PEDIDO SALVO!"); window.location.reload(); }
  }

  return (
    <div style={fe.overlay}>
      <div style={{...fe.modal, border: isLocked ? '4px solid #10B981' : 'none'}}>
        <div style={fe.header}>
          <div>
            <h2 style={{fontSize: '16px', fontWeight: '900', margin: 0}}>
              {isLocked ? 'VISUALIZAÇÃO DE REGISTRO' : 'EDIÇÃO DE FÁBRICA'} #{formData.id}
            </h2>
            {isLocked && <div style={fe.statusBadge}>✓ CONVERTIDO EM PROPOSTA CLIENTE Nº {formData.proposta_id_gerada}</div>}
          </div>
          <button onClick={onClose} style={fe.closeBtn}>FECHAR</button>
        </div>
        
        <div style={{...fe.scroll, backgroundColor: isLocked ? '#F0FDF4' : '#F1F5F9'}}>
          <div style={fe.vList}>
            <section style={fe.sectionBox}>
              <div style={fe.sectionHeader}>LOGÍSTICA FÁBRICA</div>
              <div style={fe.grid}>
                 <div style={fe.cell}><label style={fe.label}>VENDEDOR FÁBRICA</label>
                 <input value={formData.vendedor_fab || ''} disabled={isLocked} onChange={e => setFormData({...formData, vendedor_fab: e.target.value})} style={fe.input} /></div>
                 <div style={{...fe.cell, borderRight: 'none'}}><label style={fe.label}>CLIENTE INTERESSADO</label>
                 <input value={formData.cliente || ''} readOnly style={fe.input} /></div>
              </div>
            </section>

            <section style={fe.sectionBox}>
              <div style={fe.sectionHeader}>FASE E VALOR</div>
              <div style={fe.grid}>
                 <div style={fe.cell}><label style={fe.label}>VALOR FINAL (R$)</label>
                 <input type="number" value={formData.valor_final || ''} disabled={isLocked} onChange={e => setFormData({...formData, valor_final: e.target.value})} style={fe.input} /></div>
                 <div style={{...fe.cell, borderRight: 'none'}}>
                    <label style={fe.label}>FASE ATUAL</label>
                    <input value={formData.status || ''} disabled={isLocked} style={fe.input} />
                 </div>
              </div>
            </section>
          </div>
        </div>

        <div style={fe.footer}>
          {isLocked ? (
             <p style={{color: '#059669', fontWeight: '900', textAlign: 'center', width: '100%', fontSize: '12px'}}>
               ESTE CARD ESTÁ BLOQUEADO PARA EDIÇÃO POIS JÁ FOI GERADA UMA PROPOSTA COMERCIAL.
             </p>
          ) : (
            <>
              {formData.status?.includes('Concluida') && (
                <button onClick={() => onConvert(formData)} style={fe.btnConvert}>GERAR PROPOSTA COMERCIAL</button>
              )}
              <button onClick={handleUpdate} style={fe.btnSave}>SALVAR DADOS</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const fe = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modal: { backgroundColor: '#F1F5F9', width: '95%', maxWidth: '650px', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { padding: '20px 40px', backgroundColor: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { backgroundColor: '#10B981', color: '#fff', fontSize: '9px', padding: '2px 8px', borderRadius: '4px', marginTop: '5px', fontWeight: '900', display: 'inline-block' },
  scroll: { padding: '30px 40px', overflowY: 'auto' },
  vList: { display: 'flex', flexDirection: 'column', gap: '25px' },
  sectionBox: { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' },
  sectionHeader: { padding: '10px 15px', backgroundColor: '#F8FAFC', fontSize: '9px', fontWeight: '800', color: '#94A3B8', borderBottom: '1px solid #E2E8F0' },
  grid: { display: 'flex' },
  cell: { flex: 1, padding: '15px', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '8px', fontWeight: 'bold', color: '#94A3B8' },
  input: { border: 'none', outline: 'none', fontSize: '15px', fontWeight: '600', color: '#1E293B', background: 'none' },
  footer: { padding: '25px 40px', backgroundColor: '#fff', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '15px' },
  btnSave: { flex: 1, padding: '16px', backgroundColor: '#1E293B', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  btnConvert: { flex: 1.5, padding: '16px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
  closeBtn: { border: 'none', background: 'none', color: '#EF4444', fontWeight: 'bold', cursor: 'pointer' }
}