import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { supabaseOmie } from './supabaseOmieClient' // Projeto dos Clientes Omie

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
    Marca: initialData?.marca || '', Modelo: initialData?.modelo || '',
    status: 'Enviar Proposta', id_fabrica_ref: initialData?.id || ''
  })

  useEffect(() => {
    async function carregarDados() {
      // BUSCA CLIENTES NO OUTRO PROJETO
      const { data: c } = await supabaseOmie.from('Clientes').select('*')
      // BUSCA EQUIPAMENTOS NO PROJETO ATUAL
      const { data: e } = await supabase.from('Equipamentos').select('*')
      
      if (c) setListaClientes(c)
      if (e) setListaEquipamentos(e)
    }
    carregarDados()
  }, [])

  const handleSelecionarCliente = (c) => {
    // Mapeando as colunas exatas do CSV que você mandou (nome_fantasia, cnpj_cpf, etc)
    const nomeExibir = c.nome_fantasia || c.razao_social || c.nome;
    const documento = c.cnpj_cpf || c.cppf_cnpj;
    
    setFormData(prev => ({
      ...prev,
      Cliente: nomeExibir,
      'Cpf/Cpnj': documento,
      'inscricao_esta/mun': c.inscricao || '', 
      Cidade: c.cidade || '',
      Bairro: c.bairro || '',
      cep: c.cep || '',
      End_Entrega: c.endereco ? `${c.endereco}, ${c.numero || ''}` : ''
    }))
    setBuscaCli(nomeExibir)
    setShowCli(false)
  }
  return (
    <div style={f.overlay}>
      <div style={f.modal}>
        <div style={f.header}>
          <h2 style={{ fontWeight: '900', margin: 0 }}>NOVA PROPOSTA COMERCIAL</h2>
          <button onClick={onClose} style={f.closeBtn}>[FECHAR X]</button>
        </div>

        <div style={f.scroll}>
          <div style={f.vList}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <label style={f.labelBusca}>BUSCAR CLIENTE (OMIE + MANUAL)</label>
                <input style={f.search} value={buscaCli} onChange={e => {setBuscaCli(e.target.value); setShowCli(true)}} placeholder="Nome ou Fantasia..." />
                {showCli && buscaCli && (
                  <div style={f.dropdown}>
                    {listaClientes.filter(c => (c.nome || c.nome_fantasia || "").toLowerCase().includes(buscaCli.toLowerCase())).slice(0, 10).map(c => (
                      <div key={c.id} style={f.option} onClick={() => handleSelecionarCliente(c)}>
                        {c.nome || c.nome_fantasia} <small style={{color: '#666'}}>({c.cppf_cnpj || c.cnpj_cpf})</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ flex: 1, position: 'relative' }}>
                <label style={f.labelBusca}>SELECIONAR MÁQUINA</label>
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

            <div style={f.sectionTitle}>I. DADOS DO CLIENTE</div>
            <div style={f.grid}>
              <div style={f.row}>
                <div style={f.cell}><label style={f.label}>CLIENTE</label><input value={formData.Cliente} readOnly style={f.input} /></div>
                <div style={f.cell}><label style={f.label}>CPF / CNPJ</label><input value={formData['Cpf/Cpnj']} readOnly style={f.input} /></div>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>INSCRIÇÃO ESTADUAL / MUN.</label>
                  <input value={formData['inscricao_esta/mun']} onChange={e => setFormData({...formData, 'inscricao_esta/mun': e.target.value})} style={f.input} placeholder="Número ou Isento" />
                </div>
              </div>
              <div style={f.row}>
                <div style={f.cell}><label style={f.label}>CIDADE</label><input value={formData.Cidade} readOnly style={f.input} /></div>
                <div style={f.cell}><label style={f.label}>BAIRRO</label><input value={formData.Bairro} readOnly style={f.input} /></div>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>CEP</label>
                  <input value={formData.cep} onChange={e => setFormData({...formData, cep: e.target.value})} style={f.input} placeholder="00000-000" />
                </div>
              </div>
              <div style={{...f.row, borderBottom: 'none'}}>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>ENDEREÇO COMPLETO</label><input value={formData.End_Entrega} readOnly style={f.input} /></div>
              </div>
            </div>

            <div style={f.sectionTitle}>II. DADOS DO EQUIPAMENTO</div>
            <div style={f.grid}>
              <div style={f.row}>
                <div style={f.cell}><label style={f.label}>MARCA</label><input value={formData.Marca} readOnly style={f.input} /></div>
                <div style={f.cell}><label style={f.label}>MODELO</label><input value={formData.Modelo} readOnly style={f.input} /></div>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>ANO</label><input value={formData.Ano} readOnly style={f.input} /></div>
              </div>
            </div>

            <div style={f.sectionTitle}>III. FINANCEIRO</div>
            <div style={f.grid}>
              <div style={f.row}>
                <div style={f.cell}><label style={f.label}>VALOR TOTAL (R$)</label><input type="number" placeholder="0.00" onChange={e => setFormData({...formData, Valor_Total: e.target.value})} style={{...f.input, color: 'red'}} /></div>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>VALOR À VISTA (R$)</label><input type="number" placeholder="0.00" onChange={e => setFormData({...formData, Valor_A_Vista: e.target.value})} style={{...f.input, color: 'green'}} /></div>
              </div>
              <div style={{...f.row, borderBottom: 'none'}}>
                <div style={f.cell}><label style={f.label}>VALIDADE (DIAS)</label><input type="number" placeholder="Ex: 7" onChange={e => setFormData({...formData, validade: e.target.value})} style={{...f.input, color: '#B45309'}} /></div>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>PRAZO ENTREGA (DIAS)</label><input type="number" onChange={e => setFormData({...formData, Prazo_Entrega: e.target.value})} style={f.input} /></div>
              </div>
            </div>
          </div>
        </div>

        <div style={f.footer}>
          <button onClick={handleSalvar} disabled={loading} style={f.btnMain}>
            {loading ? 'GERANDO PROPOSTA...' : 'CONFIRMAR E GERAR PROPOSTA'}
          </button>
        </div>
      </div>
    </div>
  )
}

const f = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' },
  modal: { backgroundColor: '#F5F5DC', width: '95%', maxWidth: '1100px', height: '90vh', borderRadius: '20px', display: 'flex', flexDirection: 'column', border: '3px solid #000', overflow: 'hidden' },
  header: { padding: '20px 30px', backgroundColor: '#fff', borderBottom: '3px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  scroll: { padding: '25px 30px', overflowY: 'auto', flex: 1 },
  vList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  labelBusca: { fontSize: '11px', fontWeight: '900', color: '#000', marginBottom: '8px', display: 'block' },
  search: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '700' },
  dropdown: { position: 'absolute', top: '75px', left: 0, right: 0, backgroundColor: '#fff', border: '2px solid #000', zIndex: 100, maxHeight: '200px', overflowY: 'auto', borderRadius: '10px' },
  option: { padding: '12px', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#000', fontWeight: '700', fontSize: '13px' },
  sectionTitle: { fontSize: '12px', fontWeight: '900', color: '#EF4444', textTransform: 'uppercase' },
  grid: { border: '2px solid #000', backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden' },
  row: { display: 'flex', borderBottom: '1px solid #000' },
  cell: { flex: 1, padding: '12px', borderRight: '1px solid #000', display: 'flex', flexDirection: 'column' },
  label: { fontSize: '9px', fontWeight: '900', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' },
  input: { border: 'none', outline: 'none', width: '100%', fontSize: '14px', fontWeight: '700', background: 'none' },
  footer: { padding: '20px 30px', backgroundColor: '#fff', borderTop: '3px solid #000' },
  btnMain: { width: '100%', padding: '18px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '16px' },
  closeBtn: { border: 'none', background: 'none', fontWeight: '900', cursor: 'pointer', color: '#000' }
}