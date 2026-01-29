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
    maq_valor: '', valor_final: '', status: 'Proposta solicitada'
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
    const nomeExibir = c.nome || c.nome_fantasia || c.razao_social;
    setFormData({ ...formData, cliente: nomeExibir })
    setBuscaCli(nomeExibir)
    setShowCli(false)
  }

  const selecionarEquipamento = (e) => {
    setFormData({ ...formData, marca: e.marca, modelo: e.modelo })
    setBuscaEq(`${e.marca} ${e.modelo}`)
    setShowEq(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('Proposta_Fabrica').insert([formData])
    if (error) alert("Erro: " + error.message)
    else { alert("PEDIDO FÁBRICA CRIADO!"); window.location.reload(); }
    setLoading(false)
  }

  return (
    <div style={fStyles.overlay}>
      <div style={fStyles.modal}>
        <div style={fStyles.header}>
          <h2 style={{fontSize: '14px', fontWeight: '900', margin: 0}}>NOVA SOLICITAÇÃO FÁBRICA</h2>
          <button onClick={onClose} style={fStyles.closeBtn}>X</button>
        </div>
        <form onSubmit={handleSave} style={fStyles.form}>
          <div style={fStyles.scroll}>
            <div style={{position: 'relative', marginBottom: '15px'}}>
              <label style={fStyles.label}>BUSCAR CLIENTE (OMIE/MANUAL)</label>
              <input value={buscaCli} onChange={e => {setBuscaCli(e.target.value); setShowCli(true)}} style={fStyles.input} placeholder="Digite para pesquisar..." />
              {showCli && buscaCli && (
                <div style={fStyles.dropdown}>
                  {listaClientes.filter(c => (c.nome || c.nome_fantasia || "").toLowerCase().includes(buscaCli.toLowerCase())).slice(0, 8).map(c => (
                    <div key={c.id} style={fStyles.option} onClick={() => selecionarCliente(c)}>
                      {c.nome || c.nome_fantasia}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{position: 'relative', marginBottom: '15px'}}>
              <label style={fStyles.label}>EQUIPAMENTO DO ESTOQUE</label>
              <input value={buscaEq} onChange={e => {setBuscaEq(e.target.value); setShowEq(true)}} style={fStyles.input} placeholder="Pesquisar máquina..." />
              {showEq && buscaEq && (
                <div style={fStyles.dropdown}>
                  {listaEquipamentos.filter(e => e.modelo.toLowerCase().includes(buscaEq.toLowerCase())).map(e => (
                    <div key={e.id} style={fStyles.option} onClick={() => selecionarEquipamento(e)}>{e.marca} {e.modelo}</div>
                  ))}
                </div>
              )}
            </div>

            <div style={fStyles.grid}>
              <div style={fStyles.field}><label style={fStyles.label}>VENDEDOR</label>
              <input onChange={e => setFormData({...formData, vendedor_fab: e.target.value})} style={fStyles.input} /></div>
              <div style={fStyles.field}><label style={fStyles.label}>VALOR FINAL (R$)</label>
              <input type="number" onChange={e => setFormData({...formData, valor_final: e.target.value})} style={fStyles.input} /></div>
            </div>
          </div>
          <div style={fStyles.footer}><button type="submit" disabled={loading} style={fStyles.saveBtn}>{loading ? 'SALVANDO...' : 'CRIAR SOLICITAÇÃO'}</button></div>
        </form>
      </div>
    </div>
  )
}

const fStyles = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000 },
  modal: { backgroundColor: '#F3F4F6', width: '100%', maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '12px', border: '2px solid #000' },
  header: { padding: '18px 25px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', borderRadius: '12px 12px 0 0' },
  closeBtn: { background: 'none', border: 'none', color: '#000', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  form: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  scroll: { padding: '25px', overflowY: 'auto' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '10px', fontWeight: '900', color: '#666', textTransform: 'uppercase', marginBottom: '5px' },
  input: { padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box', backgroundColor: '#fff' },
  dropdown: { position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: '#fff', border: '2px solid #000', zIndex: 100, maxHeight: '150px', overflowY: 'auto', borderRadius: '8px' },
  option: { padding: '12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontWeight: '700' },
  footer: { padding: '20px', backgroundColor: '#fff', borderRadius: '0 0 12px 12px' },
  saveBtn: { width: '100%', backgroundColor: '#EF4444', color: '#fff', border: 'none', padding: '15px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }
}