import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { supabaseOmie } from './supabaseOmieClient'

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
    maq_valor: '', valor_final: '', status: 'Proposta solicitada'
  })

  useEffect(() => {
    async function fetchData() {
      const { data: clis } = await supabaseOmie.from('Clientes').select('*')
      const { data: equis } = await supabase.from('Equipamentos').select('*')
      if (clis) setListaClientes(clis)
      if (equis) setListaEquipamentos(equis)
    }
    fetchData()
  }, [])

  const selecionarCliente = (c) => {
    const nome = c.nome_fantasia || c.razao_social || c.nome || 'Sem Nome';
    setFormData(prev => ({ ...prev, cliente: nome }))
    setBuscaCli(nome); setShowCli(false)
  }

  const selecionarEquipamento = (e) => {
    setFormData(prev => ({ ...prev, marca: e.marca, modelo: e.modelo }))
    setBuscaEq(`${e.marca} ${e.modelo}`); setShowEq(false)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true)
    const { error } = await supabase.from('Proposta_Fabrica').insert([formData])
    if (!error) { alert("PEDIDO FÁBRICA CRIADO!"); window.location.reload() }
    else { alert("Erro: " + error.message); setLoading(false) }
  }

  return (
    <div style={fStyles.overlay}>
      <div style={fStyles.modal}>
        <div style={fStyles.header}>
          <h2 style={{ fontSize: '14px', fontWeight: 900, margin: 0 }}>NOVA SOLICITAÇÃO FÁBRICA</h2>
          <button onClick={onClose} style={fStyles.closeBtn}>X</button>
        </div>
        <form onSubmit={handleSave} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative' }}>
              <label style={fStyles.label}>CLIENTE (PROJETO EXTERNO)</label>
              <input style={fStyles.input} value={buscaCli} onChange={e => {setBuscaCli(e.target.value); setShowCli(true)}} placeholder="Pesquisar..." />
              {showCli && buscaCli && (
                <div style={fStyles.dropdown}>
                  {listaClientes.filter(c => (c.nome_fantasia || c.nome || "").toLowerCase().includes(buscaCli.toLowerCase())).slice(0, 8).map(c => (
                    <div key={c.id} style={fStyles.option} onClick={() => selecionarCliente(c)}>{c.nome_fantasia || c.nome}</div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <label style={fStyles.label}>MÁQUINA DO ESTOQUE</label>
              <input style={fStyles.input} value={buscaEq} onChange={e => {setBuscaEq(e.target.value); setShowEq(true)}} placeholder="Pesquisar..." />
              {showEq && buscaEq && (
                <div style={fStyles.dropdown}>
                  {listaEquipamentos.filter(e => e.modelo.toLowerCase().includes(buscaEq.toLowerCase())).map(e => (
                    <div key={e.id} style={fStyles.option} onClick={() => selecionarEquipamento(e)}>{e.marca} {e.modelo}</div>
                  ))}
                </div>
              )}
            </div>
            <label style={fStyles.label}>VENDEDOR</label>
            <input style={fStyles.input} onChange={e => setFormData({ ...formData, vendedor_fab: e.target.value })} />
          </div>
          <button type="submit" disabled={loading} style={fStyles.saveBtn}>{loading ? 'SALVANDO...' : 'CRIAR SOLICITAÇÃO'}</button>
        </form>
      </div>
    </div>
  )
}

const fStyles = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000 },
  modal: { backgroundColor: '#fff', width: '100%', maxWidth: '500px', borderRadius: '12px', border: '2px solid #000', overflow: 'hidden' },
  header: { padding: '15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' },
  label: { fontSize: '10px', fontWeight: 900, color: '#666', textTransform: 'uppercase' },
  input: { padding: '12px', border: '1px solid #ddd', borderRadius: '8px', width: '100%', boxSizing: 'border-box' },
  dropdown: { position: 'absolute', top: '65px', left: 0, width: '100%', backgroundColor: '#fff', border: '1px solid #000', zIndex: 100, maxHeight: '150px', overflowY: 'auto' },
  option: { padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' },
  saveBtn: { width: '100%', backgroundColor: '#EF4444', color: '#fff', border: 'none', padding: '15px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', marginTop: '20px' },
  closeBtn: { border: 'none', background: 'none', fontWeight: 'bold', cursor: 'pointer' }
}