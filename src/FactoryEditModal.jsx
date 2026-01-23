import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function FactoryEditModal({ order, onClose, onConvert }) {
  const [formData, setFormData] = useState(order || {})

  const handleUpdate = async () => {
    const { error } = await supabase.from('Proposta_Fabrica').update(formData).eq('id', order.id)
    if (!error) { alert("PEDIDO SALVO!"); window.location.reload(); }
  }

  return (
    <div style={fe.overlay}>
      <div style={fe.modal}>
        <div style={fe.header}>
          <h2 style={{fontSize: '16px', fontWeight: '900'}}>REGISTRO DE FÁBRICA #{formData.id}</h2>
          <button onClick={onClose} style={fe.closeBtn}>FECHAR</button>
        </div>
        
        <div style={fe.scroll}>
          <div style={fe.vList}>
            <section style={fe.sectionBox}>
              <div style={fe.sectionHeader}><div style={fe.indicator}></div> LOGÍSTICA FÁBRICA</div>
              <div style={fe.grid}>
                 <div style={fe.cell}><label style={fe.label}>VENDEDOR FÁBRICA</label>
                 <input value={formData.vendedor_fab} onChange={e => setFormData({...formData, vendedor_fab: e.target.value})} style={fe.input} /></div>
                 <div style={{...fe.cell, borderRight: 'none'}}><label style={fe.label}>CLIENTE INTERESSADO</label>
                 <input value={formData.cliente} readOnly style={fe.input} /></div>
              </div>
            </section>

            <section style={fe.sectionBox}>
              <div style={fe.sectionHeader}><div style={fe.indicator}></div> FASE E VALOR</div>
              <div style={fe.grid}>
                 <div style={fe.cell}><label style={fe.label}>VALOR FINAL (R$)</label>
                 <input type="number" value={formData.valor_final} onChange={e => setFormData({...formData, valor_final: e.target.value})} style={fe.input} /></div>
                 <div style={{...fe.cell, borderRight: 'none'}}>
                    <label style={fe.label}>FASE ATUAL</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={fe.select}>
                      {['Proposta solicitada', 'Proposta Recebida', 'Pedido Feito / Aguardando Maq', 'Proposta Concluida/ Maquina Recebida'].map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                 </div>
              </div>
            </section>
          </div>
        </div>

        <div style={fe.footer}>
          {formData.status.includes('Concluida') && !formData.convertido && (
            <button onClick={() => onConvert(formData)} style={fe.btnConvert}>GERAR PROPOSTA COMERCIAL</button>
          )}
          <button onClick={handleUpdate} style={fe.btnSave}>SALVAR DADOS</button>
        </div>
      </div>
    </div>
  )
}

const fe = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.95)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modal: { backgroundColor: '#F1F5F9', width: '95%', maxWidth: '650px', borderRadius: '24px', display: 'flex', flexDirection: 'column', animation: 'modalFadeIn 0.4s ease-out' },
  header: { padding: '25px 40px', backgroundColor: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  scroll: { padding: '30px 40px', overflowY: 'auto' },
  vList: { display: 'flex', flexDirection: 'column', gap: '25px' },
  sectionBox: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' },
  sectionHeader: { padding: '12px 20px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '10px', fontWeight: '800', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '10px' },
  indicator: { width: '4px', height: '12px', backgroundColor: '#1E293B', borderRadius: '2px' },
  grid: { display: 'flex', width: '100%' },
  cell: { flex: 1, padding: '15px', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '9px', fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase' },
  input: { border: 'none', outline: 'none', fontSize: '15px', fontWeight: '600', color: '#1E293B', width: '100%', background: 'none' },
  select: { border: 'none', background: 'none', fontSize: '13px', fontWeight: 'bold', outline: 'none', cursor: 'pointer' },
  footer: { padding: '25px 40px', backgroundColor: '#fff', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '15px' },
  btnSave: { flex: 1, padding: '16px', backgroundColor: '#1E293B', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  btnConvert: { flex: 1.5, padding: '16px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
  closeBtn: { border: 'none', background: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }
}