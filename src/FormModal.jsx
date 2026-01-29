import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function FormModal({ onClose, initialData }) {
  const [loading, setLoading] = useState(false)
  const [listaClientes, setListaClientes] = useState([])
  const [listaEquipamentos, setListaEquipamentos] = useState([])
  const [buscaCli, setBuscaCli] = useState(initialData?.cliente || '')
  const [buscaEq, setBuscaEq] = useState(initialData?.modelo || '')
  const [showCli, setShowCli] = useState(false)
  const [showEq, setShowEq] = useState(false)

  const [formData, setFormData] = useState({
    Cliente: initialData?.cliente || '',
    'Cpf/Cpnj': '',
    'inscricao_esta/mun': '',
    Cidade: '',
    Bairro: '',
    cep: '',
    End_Entrega: '',
    Qtd_Eqp: '1',
    Marca: initialData?.marca || '',
    Modelo: initialData?.modelo || '',
    status: 'Enviar Proposta',
    id_fabrica_ref: initialData?.id || ''
  })

  useEffect(() => {
    async function carregar() {
      const { data: c } = await supabase.from('Clientes').select('*')
      const { data: e } = await supabase.from('Equipamentos').select('*')
      if (c) setListaClientes(c)
      if (e) setListaEquipamentos(e)
    }
    carregar()
  }, [])

  const handleSelecionarCliente = (c) => {
    setFormData(prev => ({
      ...prev,
      Cliente: c.nome,
      'Cpf/Cpnj': c.cppf_cnpj,
      'inscricao_esta/mun': c.inscricao || '',
      Cidade: c.cidade, Bairro: c.bairro, cep: c.cep || '', End_Entrega: c.endereco
    }))
    setBuscaCli(c.nome); setShowCli(false)
  }

  const handleSalvar = async (e) => {
    e.preventDefault(); setLoading(true)
    const { error } = await supabase.from('Formulario').insert([formData])
    if (!error) { alert("PROPOSTA GERADA!"); window.location.reload() }
    setLoading(false)
  }

  return (
    <div style={f.overlay}>
      <div style={f.modal}>
        <div style={f.header}>
          <h2 style={{fontWeight:900, margin:0}}>NOVA PROPOSTA</h2>
          <button onClick={onClose} style={f.closeBtn}>X</button>
        </div>
        <div style={f.scroll}>
          <form onSubmit={handleSalvar} style={f.vList}>
             <label style={f.labelBusca}>PESQUISAR CLIENTE</label>
             <input style={f.search} value={buscaCli} onChange={e => {setBuscaCli(e.target.value); setShowCli(true)}} />
             {showCli && (
               <div style={f.dropdown}>
                 {listaClientes.filter(c => c.nome?.toLowerCase().includes(buscaCli.toLowerCase())).map(c => (
                   <div key={c.id} style={f.option} onClick={() => handleSelecionarCliente(c)}>{c.nome}</div>
                 ))}
               </div>
             )}
             <div style={f.grid}>
                <div style={f.cell}><label style={f.label}>CLIENTE</label><input value={formData.Cliente} readOnly style={f.input} /></div>
                <div style={f.cell}><label style={s.label}>IE/MUN</label><input value={formData['inscricao_esta/mun']} onChange={e => setFormData({...formData, 'inscricao_esta/mun': e.target.value})} style={f.input} /></div>
             </div>
          </form>
        </div>
        <div style={f.footer}><button onClick={handleSalvar} style={f.btnMain}>GERAR PROPOSTA</button></div>
      </div>
    </div>
  )
}

const f = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
  modal: { backgroundColor: '#F5F5DC', width: '90%', maxWidth: '900px', height: '80vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '3px solid #000', overflow: 'hidden' },
  header: { padding: '15px', backgroundColor: '#fff', borderBottom: '3px solid #000', display: 'flex', justifyContent: 'space-between' },
  scroll: { padding: '20px', overflowY: 'auto', flex: 1 },
  vList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  search: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', borderRadius: '8px' },
  dropdown: { backgroundColor: '#fff', border: '2px solid #000', maxHeight: '150px', overflowY: 'auto' },
  option: { padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' },
  grid: { border: '2px solid #000', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden' },
  cell: { padding: '10px', borderBottom: '1px solid #eee' },
  label: { fontSize: '9px', fontWeight: '900' },
  input: { border: 'none', width: '100%', fontSize: '14px', fontWeight: '700' },
  footer: { padding: '15px', borderTop: '3px solid #000' },
  btnMain: { width: '100%', padding: '15px', backgroundColor: '#EF4444', color: '#fff', border: 'none', fontWeight: '900', cursor: 'pointer' },
  closeBtn: { border: 'none', background: 'none', fontWeight: '900', cursor: 'pointer' },
  labelBusca: { fontSize: '11px', fontWeight: '900' }
}

const s = { label: { fontSize: '9px', fontWeight: '900' } }