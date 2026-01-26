import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function EditModal({ proposal, onClose }) {
  const [formData, setFormData] = useState(proposal || {})
  const [historiaFabrica, setHistoriaFabrica] = useState(null)

  useEffect(() => {
    if (proposal?.id_fabrica_ref) {
      const fetchHistory = async () => {
        const { data } = await supabase.from('Proposta_Fabrica').select('*').eq('id', proposal.id_fabrica_ref).single()
        setHistoriaFabrica(data)
      }
      fetchHistory()
    }
    setFormData({ ...proposal })
  }, [proposal])

  return (
    <div style={m.overlay}>
      <div style={m.modal}>
        
        <div style={m.main}>
          <div style={m.header}>
            <div>
              <h2 style={{fontSize: '18px', fontWeight: '900', color: '#1E293B', margin: 0}}>DETALHES DA PROPOSTA</h2>
              <p style={{fontSize: '10px', color: '#94A3B8', margin: 0}}>CONTROLE DE VENDAS NOVA TRATORES</p>
            </div>
            <button onClick={onClose} style={m.closeBtn}>FECHAR [X]</button>
          </div>
          
          <div style={m.scroll}>
            <div style={m.vList}>
              
              <section style={m.sectionBox}>
                <div style={m.sectionHeader}>DADOS DO CLIENTE</div>
                <div style={m.grid}>
                  <div style={m.cell}><label style={m.label}>NOME COMPLETO</label><input value={formData.Cliente} onChange={e => setFormData({...formData, Cliente: e.target.value})} style={m.input} /></div>
                  <div style={{...m.cell, borderRight: 'none'}}><label style={m.label}>CPF / CNPJ</label><input value={formData['Cpf/Cpnj']} style={m.input} /></div>
                </div>
                <div style={{...m.grid, borderTop: '1px solid #F1F5F9'}}>
                  <div style={m.cell}><label style={m.label}>CIDADE</label><input value={formData.Cidade} style={m.input} /></div>
                  <div style={{...m.cell, borderRight: 'none'}}><label style={m.label}>BAIRRO</label><input value={formData.Bairro} style={m.input} /></div>
                </div>
              </section>

              <section style={m.sectionBox}>
                <div style={m.sectionHeader}>EQUIPAMENTO</div>
                <div style={m.grid}>
                  <div style={m.cell}><label style={m.label}>MARCA</label><input value={formData.Marca} style={m.input} /></div>
                  <div style={m.cell}><label style={m.label}>MODELO</label><input value={formData.Modelo} style={m.input} /></div>
                  <div style={{...m.cell, borderRight: 'none'}}><label style={m.label}>ANO</label><input value={formData.Ano} style={m.input} /></div>
                </div>
                <div style={{...m.grid, borderTop: '1px solid #F1F5F9'}}>
                  <div style={{...m.cell, borderRight: 'none'}}><label style={m.label}>CONFIGURAÇÃO TÉCNICA</label><textarea value={formData.Descricao} style={m.textarea} /></div>
                </div>
              </section>

              <section style={m.sectionBox}>
                <div style={m.sectionHeader}>CONDIÇÕES COMERCIAIS</div>
                <div style={m.grid}>
                  <div style={m.cell}><label style={m.label}>VALOR TOTAL CLIENTE (R$)</label><input type="number" value={formData.Valor_Total} style={{...m.input, color: '#EF4444', fontWeight: '800'}} /></div>
                  <div style={{...m.cell, borderRight: 'none'}}><label style={m.label}>VALOR À VISTA (R$)</label><input type="number" value={formData.Valor_A_Vista} style={{...m.input, color: '#10B981', fontWeight: '800'}} /></div>
                </div>
              </section>

            </div>
          </div>
          <div style={m.footer}>
            <button style={m.btnSave}>SALVAR ALTERAÇÕES</button>
          </div>
        </div>

        {/* SIDEBAR COM HISTÓRICO DA FÁBRICA */}
        <div style={m.sidebar}>
          <h3 style={m.sideTitle}>VÍNCULO FÁBRICA</h3>
          {historiaFabrica ? (
            <div style={m.sideList}>
              <div style={m.sideItem}><label>REF. ORIGINAL</label><p>#{historiaFabrica.id}</p></div>
              <div style={m.sideItem}><label>VENDEDOR FÁB.</label><p>{historiaFabrica.vendedor_fab}</p></div>
              <div style={m.sideItem}><label>CUSTO FÁBRICA</label><p>R$ {historiaFabrica.valor_final}</p></div>
              <div style={m.sideItem}><label>ENTREGA</label><p>{historiaFabrica.tipo_entrega}</p></div>
              <div style={m.sideBadge}>ORIGEM CONCLUÍDA</div>
            </div>
          ) : (
            <p style={{fontSize: '11px', color: '#94A3B8', textAlign: 'center'}}>Sem histórico de fábrica.</p>
          )}
        </div>
      </div>
    </div>
  )
}

const m = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modal: { backgroundColor: '#F8FAFC', width: '98%', maxWidth: '1150px', height: '90vh', borderRadius: '24px', display: 'flex', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)' },
  main: { flex: 1, display: 'flex', flexDirection: 'column' },
  sidebar: { width: '280px', backgroundColor: '#1E293B', padding: '40px 25px', color: '#fff' },
  header: { padding: '25px 40px', backgroundColor: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  scroll: { padding: '30px 40px', overflowY: 'auto', flex: 1 },
  vList: { display: 'flex', flexDirection: 'column', gap: '25px' },
  sectionBox: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' },
  sectionHeader: { padding: '12px 20px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '10px', fontWeight: '900', color: '#64748B', letterSpacing: '1px' },
  grid: { display: 'flex' },
  cell: { flex: 1, padding: '20px', borderRight: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '9px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' },
  input: { border: 'none', outline: 'none', fontSize: '15px', fontWeight: '600', color: '#1E293B', width: '100%', background: 'none' },
  textarea: { border: 'none', outline: 'none', fontSize: '14px', color: '#475569', width: '100%', minHeight: '80px', background: 'none', resize: 'none' },
  footer: { padding: '25px 40px', backgroundColor: '#fff', borderTop: '1px solid #E2E8F0' },
  btnSave: { width: '100%', padding: '16px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '14px' },
  sideTitle: { fontSize: '11px', fontWeight: '900', color: '#94A3B8', letterSpacing: '2px', marginBottom: '30px' },
  sideList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  sideItem: { borderBottom: '1px solid #334155', paddingBottom: '10px' },
  sideBadge: { backgroundColor: '#10B981', color: '#fff', padding: '10px', borderRadius: '8px', fontSize: '9px', fontWeight: '900', textAlign: 'center', marginTop: '20px' },
  closeBtn: { border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: '900', fontSize: '12px' }
}