import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { supabaseOmie } from './supabaseOmieClient'

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
    Cidade: '', Bairro: '', cep: '', End_Entrega: '',
    Qtd_Eqp: '1', Marca: initialData?.marca || '', Modelo: initialData?.modelo || '',
    'Niname/NCM': '', Configuracao: '', Descricao: '', Ano: '',
    Prazo_Entrega: '', Valor_Total: '', Valor_A_Vista: '', Condicoes: '',
    Tipo_Entrega: 'FOB', validade: '', Imagem_Equipamento: '', status: 'Enviar Proposta',
    id_fabrica_ref: initialData?.id || ''
  })

  useEffect(() => {
    async function carregarDados() {
      const { data: c } = await supabaseOmie.from('Clientes').select('*')
      const { data: e } = await supabase.from('Equipamentos').select('*')
      if (c) setListaClientes(c)
      if (e) setListaEquipamentos(e)
    }
    carregarDados()
  }, [])

  const handleSelecionarCliente = (c) => {
    const nome = c.nome_fantasia || c.razao_social || c.nome || 'Sem Nome';
    const doc = c.cnpj_cpf || c.cppf_cnpj || '';
    setFormData(prev => ({
      ...prev,
      Cliente: nome, 'Cpf/Cpnj': doc,
      'inscricao_esta/mun': c.inscricao || '', 
      Cidade: c.cidade || '', Bairro: c.bairro || '',
      cep: c.cep || '', End_Entrega: c.endereco || ''
    }))
    setBuscaCli(nome); setShowCli(false)
  }

  const handleSelecionarEquipamento = (e) => {
    setFormData(prev => ({
      ...prev,
      Marca: e.marca, Modelo: e.modelo, Ano: e.ano,
      Descricao: e.descricao, Configuracao: e.configuracao,
      'Niname/NCM': e.finame, Imagem_Equipamento: e.imagem
    }))
    setBuscaEq(`${e.marca} ${e.modelo}`); setShowEq(false)
  }

  const handleSalvar = async (e) => {
    e.preventDefault(); setLoading(true)
    const { error } = await supabase.from('Formulario').insert([formData])
    if (!error) { alert("PROPOSTA GERADA!"); window.location.reload() }
    else { alert("Erro: " + error.message); setLoading(false) }
  }

  return (
    <div style={f.overlay}>
      <div style={f.modal}>
        <div style={f.header}>
          <h2 style={{ fontWeight: 900, margin: 0 }}>NOVA PROPOSTA COMERCIAL</h2>
          <button onClick={onClose} style={f.closeBtn}>FECHAR [X]</button>
        </div>
        <div style={f.scroll}>
          <div style={f.vList}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <label style={f.labelBusca}>1. BUSCAR CLIENTE (PROJETO EXTERNO)</label>
                <input style={f.search} value={buscaCli} onChange={e => {setBuscaCli(e.target.value); setShowCli(true)}} placeholder="Nome ou Fantasia..." />
                {showCli && buscaCli && (
                  <div style={f.dropdown}>
                    {listaClientes.filter(c => (c.nome || c.nome_fantasia || "").toLowerCase().includes(buscaCli.toLowerCase())).slice(0, 10).map(c => (
                      <div key={c.id} style={f.option} onClick={() => handleSelecionarCliente(c)}>
                        {c.nome || c.nome_fantasia} <small>({c.cnpj_cpf || c.cppf_cnpj})</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <label style={f.labelBusca}>2. SELECIONAR MÁQUINA</label>
                <input style={f.search} value={buscaEq} onChange={e => {setBuscaEq(e.target.value); setShowEq(true)}} placeholder="Marca ou Modelo..." />
                {showEq && buscaEq && (
                  <div style={f.dropdown}>
                    {listaEquipamentos.filter(e => e.modelo?.toLowerCase().includes(buscaEq.toLowerCase())).map(e => (
                      <div key={e.id} style={f.option} onClick={() => handleSelecionarEquipamento(e)}>{e.marca} {e.modelo}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={f.sectionTitle}>CONFERÊNCIA DE DADOS</div>
            <div style={f.grid}>
                <div style={f.row}>
                    <div style={f.cell}><label style={f.label}>CLIENTE</label><input value={formData.Cliente} readOnly style={f.input} /></div>
                    <div style={f.cell}><label style={f.label}>CPF/CNPJ</label><input value={formData['Cpf/Cpnj']} readOnly style={f.input} /></div>
                    <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>CEP</label><input value={formData.cep} readOnly style={f.input} /></div>
                </div>
            </div>
          </div>
        </div>
        <div style={f.footer}><button onClick={handleSalvar} style={f.btnMain}>{loading ? 'SALVANDO...' : 'CONFIRMAR E GERAR PROPOSTA'}</button></div>
      </div>
    </div>
  )
}

const f = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
  modal: { backgroundColor: '#F5F5DC', width: '95%', maxWidth: '1000px', height: '90vh', borderRadius: '20px', display: 'flex', flexDirection: 'column', border: '3px solid #000', overflow: 'hidden' },
  header: { padding: '20px', backgroundColor: '#fff', borderBottom: '3px solid #000', display: 'flex', justifyContent: 'space-between' },
  scroll: { padding: '20px', overflowY: 'auto', flex: 1 },
  vList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  labelBusca: { fontSize: '11px', fontWeight: '900', marginBottom: '5px' },
  search: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', borderRadius: '10px' },
  dropdown: { position: 'absolute', top: '70px', left: 0, right: 0, backgroundColor: '#fff', border: '2px solid #000', zIndex: 100, maxHeight: '200px', overflowY: 'auto' },
  option: { padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' },
  sectionTitle: { fontSize: '12px', fontWeight: '900', color: '#EF4444' },
  grid: { border: '2px solid #000', backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden' },
  row: { display: 'flex', borderBottom: '1px solid #000' },
  cell: { flex: 1, padding: '10px', borderRight: '1px solid #000', display: 'flex', flexDirection: 'column' },
  label: { fontSize: '9px', fontWeight: '900', color: '#64748B' },
  input: { border: 'none', outline: 'none', width: '100%', fontSize: '14px', fontWeight: '700' },
  footer: { padding: '20px', backgroundColor: '#fff', borderTop: '3px solid #000' },
  btnMain: { width: '100%', padding: '15px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900' },
  closeBtn: { border: 'none', background: 'none', fontWeight: '900', cursor: 'pointer' }
}