import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function FactoryFormModal({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [listaClientes, setListaClientes] = useState([])
  const [listaEquipamentos, setListaEquipamentos] = useState([])
  const [buscaCli, setBuscaCli] = useState('')
  const [buscaEq, setBuscaEq] = useState('')
  const [showCli, setShowCli] = useState(false)
  const [showEq, setShowEq] = useState(false)

  const [formData, setFormData] = useState({
    vendedor_fab: '', cliente: '', marca: '', modelo: '',
    maq_valor: '', maquina2: '', maq_valor2: '', desconto: '',
    valor_final: '', forma_pagamento: '', tipo_entrega: '', obs: '',
    status: 'Proposta solicitada'
  })

  useEffect(() => {
    const fetchData = async () => {
      const { data: clis } = await supabase.from('Clientes').select('*')
      const { data: equis } = await supabase.from('Equipamentos').select('*')
      if (clis) setListaClientes(clis)
      if (equis) setListaEquipamentos(equis)
    }
    fetchData()
  }, [])

  const selecionarCliente = (c) => {
    setFormData({ ...formData, cliente: c.nome })
    setBuscaCli(c.nome); setShowCli(false);
  }

  const selecionarEquipamento = (e) => {
    setFormData({ ...formData, marca: e.marca, modelo: e.modelo })
    setBuscaEq(`${e.marca} ${e.modelo}`); setShowEq(false);
  }

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true)
    const { error } = await supabase.from('Proposta_Fabrica').insert([formData])
    if (error) alert("Erro: " + error.message)
    else { alert("PEDIDO FÁBRICA CRIADO!"); window.location.reload(); }
    setLoading(false)
  }

  return (
    <div style={fStyles.overlay}>
      <div style={fStyles.modal}>
        <div style={fStyles.header}>
          <h2 style={{fontSize: '14px', fontWeight: '900', margin: 0}}>NOVA SOLICITAÇÃO PARA FÁBRICA</h2>
          <button onClick={onClose} style={fStyles.closeBtn}>FECHAR</button>
        </div>
        <form onSubmit={handleSave} style={fStyles.form}>
          <div style={fStyles.scroll}>
            <h3 style={fStyles.section}>DADOS INICIAIS</h3>
            <div style={fStyles.grid}>
              <div style={fStyles.field}>
                <label style={fStyles.label}>VENDEDOR FÁBRICA</label>
                <input name="vendedor_fab" onChange={e => setFormData({...formData, vendedor_fab: e.target.value})} style={fStyles.input} />
              </div>
              <div style={{...fStyles.field, position: 'relative'}}>
                <label style={fStyles.label}>CLIENTE INTERESSADO</label>
                <input value={buscaCli} onChange={e => {setBuscaCli(e.target.value); setShowCli(true)}} style={fStyles.input} placeholder="Pesquisar..." />
                {showCli && buscaCli && (
                  <div style={fStyles.dropdown}>{listaClientes.filter(c => c.nome.toLowerCase().includes(buscaCli.toLowerCase())).map(c => (
                    <div key={c.id} style={fStyles.option} onClick={() => selecionarCliente(c)}>{c.nome}</div>
                  ))}</div>
                )}
              </div>
            </div>

            <h3 style={fStyles.section}>EQUIPAMENTO SOLICITADO</h3>
            <div style={{position: 'relative', marginBottom: '15px'}}>
              <input value={buscaEq} onChange={e => {setBuscaEq(e.target.value); setShowEq(true)}} style={fStyles.input} placeholder="Pesquisar máquina no estoque..." />
              {showEq && buscaEq && (
                <div style={fStyles.dropdown}>{listaEquipamentos.filter(e => e.modelo.toLowerCase().includes(buscaEq.toLowerCase())).map(e => (
                  <div key={e.id} style={fStyles.option} onClick={() => selecionarEquipamento(e)}>{e.marca} {e.modelo}</div>
                ))}</div>
              )}
            </div>

            <div style={fStyles.grid}>
              <div style={fStyles.field}><label style={fStyles.label}>VALOR MÁQUINA (R$)</label>
              <input type="number" onChange={e => setFormData({...formData, maq_valor: e.target.value})} style={fStyles.input} /></div>
              <div style={fStyles.field}><label style={fStyles.label}>DESCONTO FÁBRICA</label>
              <input type="number" onChange={e => setFormData({...formData, desconto: e.target.value})} style={fStyles.input} /></div>
              <div style={fStyles.field}><label style={fStyles.label}>VALOR FINAL</label>
              <input type="number" onChange={e => setFormData({...formData, valor_final: e.target.value})} style={fStyles.input} /></div>
            </div>

            <h3 style={fStyles.section}>LOGÍSTICA E OBSERVAÇÕES</h3>
            <div style={fStyles.field}><label style={fStyles.label}>TIPO DE ENTREGA</label>
            <input placeholder="Ex: Frete FOB / Fábrica" onChange={e => setFormData({...formData, tipo_entrega: e.target.value})} style={fStyles.input} /></div>
            <textarea placeholder="Observações internas..." onChange={e => setFormData({...formData, obs: e.target.value})} style={{...fStyles.input, height: '80px', marginTop: '10px'}} />
          </div>
          <div style={fStyles.footer}><button type="submit" style={fStyles.saveBtn}>SOLICITAR PROPOSTA</button></div>
        </form>
      </div>
    </div>
  )
}

const fStyles = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 },
  modal: { backgroundColor: '#F3F4F6', width: '100%', maxWidth: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '12px' },
  header: { padding: '18px 25px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', borderRadius: '12px 12px 0 0' },
  closeBtn: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' },
  form: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  scroll: { padding: '25px', overflowY: 'auto' },
  section: { color: '#FF0000', fontSize: '10px', fontWeight: '900', margin: '20px 0 10px 0', letterSpacing: '1px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '10px', fontWeight: 'bold', color: '#9CA3AF' },
  input: { padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box', backgroundColor: '#fff' },
  dropdown: { position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: '#fff', border: '1px solid #ddd', zIndex: 10, maxHeight: '150px', overflowY: 'auto' },
  option: { padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '13px' },
  footer: { padding: '20px', backgroundColor: '#fff', borderRadius: '0 0 12px 12px' },
  saveBtn: { width: '100%', backgroundColor: '#111827', color: '#fff', border: 'none', padding: '15px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }
}