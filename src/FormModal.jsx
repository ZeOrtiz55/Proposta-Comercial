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
    'inscricao_esta/mun': '', // NOVO CAMPO ADICIONADO
    Cidade: '',
    Bairro: '',
    End_Entrega: '',
    Qtd_Eqp: '1',
    Marca: initialData?.marca || '',
    Modelo: initialData?.modelo || '',
    'Niname/NCM': '',
    Configuracao: '',
    Descricao: '',
    Ano: '',
    Prazo_Entrega: '',
    Valor_Total: '',
    Valor_A_Vista: '',
    Condicoes: '',
    Tipo_Entrega: 'FOB',
    validade: '',
    Imagem_Equipamento: '',
    status: 'Enviar Proposta',
    id_fabrica_ref: initialData?.id || ''
  })

  useEffect(() => {
    async function carregarDados() {
      const { data: c } = await supabase.from('Clientes').select('*')
      const { data: e } = await supabase.from('Equipamentos').select('*')
      if (c) setListaClientes(c)
      if (e) setListaEquipamentos(e)
    }
    carregarDados()
  }, [])

  const handleSelecionarCliente = (c) => {
    setFormData(prev => ({
      ...prev,
      Cliente: c.nome,
      'Cpf/Cpnj': c.cppf_cnpj,
      'inscricao_esta/mun': c.inscricao_esta || '', // Auto-preenche se existir no cadastro
      Cidade: c.cidade,
      Bairro: c.bairro,
      End_Entrega: c.endereco
    }))
    setBuscaCli(c.nome)
    setShowCli(false)
  }

  const handleSelecionarEquipamento = (e) => {
    setFormData(prev => ({
      ...prev,
      Marca: e.marca,
      Modelo: e.modelo,
      Ano: e.ano,
      Descricao: e.descricao,
      Configuracao: e.configuracao,
      'Niname/NCM': e.finame,
      Imagem_Equipamento: e.imagem,
      Qtd_Eqp: '1'
    }))
    setBuscaEq(`${e.marca} ${e.modelo}`)
    setShowEq(false)
  }

  const handleSalvar = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('Formulario').insert([formData])
    if (!error) {
      alert("PROPOSTA GERADA COM SUCESSO!")
      window.location.reload()
    } else {
      alert("Erro ao salvar: " + error.message)
    }
    setLoading(false)
  }

  return (
    <div style={f.overlay}>
      <div style={f.modal}>
        <div style={f.header}>
          <h2 style={{ fontWeight: '900', margin: 0 }}>NOVA PROPOSTA COMERCIAL</h2>
          <button onClick={onClose} style={f.closeBtn}>X</button>
        </div>

        <div style={f.scroll}>
          <form onSubmit={handleSalvar} style={f.vList}>
            
            {/* BUSCAS */}
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <label style={f.labelBusca}>1. SELECIONAR CLIENTE</label>
                <input style={f.search} value={buscaCli} onChange={e => {setBuscaCli(e.target.value); setShowCli(true)}} placeholder="Pesquisar cliente..." />
                {showCli && buscaCli && (
                  <div style={f.dropdown}>
                    {listaClientes.filter(c => c.nome?.toLowerCase().includes(buscaCli.toLowerCase())).map(c => (
                      <div key={c.id} style={f.option} onClick={() => handleSelecionarCliente(c)}>{c.nome}</div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ flex: 1, position: 'relative' }}>
                <label style={f.labelBusca}>2. SELECIONAR EQUIPAMENTO</label>
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

            {formData.Imagem_Equipamento && (
              <center>
                <div style={f.imgBox}>
                  <label style={f.label}>FOTO DO EQUIPAMENTO</label><br/>
                  <img src={formData.Imagem_Equipamento} style={f.preview} alt="Equipamento" />
                </div>
              </center>
            )}

            {/* GRADE I: CLIENTE */}
            <div style={f.sectionTitle}>I. DADOS DO CLIENTE</div>
            <div style={f.grid}>
              <div style={f.row}>
                <div style={f.cell}><label style={f.label}>CLIENTE</label><input value={formData.Cliente} readOnly style={f.input} /></div>
                <div style={f.cell}><label style={f.label}>CPF / CNPJ</label><input value={formData['Cpf/Cpnj']} readOnly style={f.input} /></div>
                {/* CAMPO NOVO: IE */}
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>INSCRIÇÃO ESTADUAL / MUN.</label>
                  <input 
                    value={formData['inscricao_esta/mun']} 
                    onChange={e => setFormData({...formData, 'inscricao_esta/mun': e.target.value})} 
                    style={f.input} 
                    placeholder="Isento ou Número"
                  />
                </div>
              </div>
              <div style={{...f.row, borderBottom: 'none'}}>
                <div style={f.cell}><label style={f.label}>CIDADE</label><input value={formData.Cidade} readOnly style={f.input} /></div>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>ENDEREÇO ENTREGA</label><input value={formData.End_Entrega} readOnly style={f.input} /></div>
              </div>
            </div>

            {/* GRADE II: EQUIPAMENTO */}
            <div style={f.sectionTitle}>II. DADOS DO EQUIPAMENTO</div>
            <div style={f.grid}>
              <div style={f.row}>
                <div style={f.cell}><label style={f.label}>MARCA</label><input value={formData.Marca} readOnly style={f.input} /></div>
                <div style={f.cell}><label style={f.label}>MODELO</label><input value={formData.Modelo} readOnly style={f.input} /></div>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>ANO</label><input value={formData.Ano} readOnly style={f.input} /></div>
              </div>
              <div style={{...f.row, borderBottom: 'none'}}>
                <div style={f.cell}><label style={f.label}>FINAME / NCM</label><input value={formData['Niname/NCM']} readOnly style={f.input} /></div>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>QUANTIDADE</label><input type="number" value={formData.Qtd_Eqp} onChange={e => setFormData({...formData, Qtd_Eqp: e.target.value})} style={f.input} /></div>
              </div>
            </div>

            {/* GRADE III: FINANCEIRO E ENTREGA */}
            <div style={f.sectionTitle}>III. CONDIÇÕES FINANCEIRAS E ENTREGA</div>
            <div style={f.grid}>
              <div style={f.row}>
                <div style={f.cell}><label style={f.label}>VALOR TOTAL (R$)</label><input type="number" required placeholder="0.00" onChange={e => setFormData({...formData, Valor_Total: e.target.value})} style={{...f.input, color: 'red'}} /></div>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>VALOR À VISTA (R$)</label><input type="number" placeholder="0.00" onChange={e => setFormData({...formData, Valor_A_Vista: e.target.value})} style={{...f.input, color: 'green'}} /></div>
              </div>
              <div style={f.row}>
                <div style={f.cell}><label style={f.label}>PRAZO ENTREGA (DIAS)</label><input type="number" placeholder="Ex: 30" onChange={e => setFormData({...formData, Prazo_Entrega: e.target.value})} style={f.input} /></div>
                <div style={{...f.cell, borderRight: 'none'}}>
                  <label style={f.label}>TIPO DE ENTREGA</label>
                  <select 
                    value={formData.Tipo_Entrega} 
                    onChange={e => setFormData({...formData, Tipo_Entrega: e.target.value})}
                    style={{...f.input, cursor: 'pointer', appearance: 'none', background: 'none'}}
                  >
                    <option value="FOB">FOB (CLIENTE RETIRA NA LOJA)</option>
                    <option value="CIF">CIF (ENTREGA NA PROPRIEDADE)</option>
                  </select>
                </div>
              </div>
              <div style={{...f.row, borderBottom: 'none'}}>
                <div style={f.cell}>
                  <label style={f.label}>VALIDADE DA PROPOSTA (DIAS)</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 7" 
                    onChange={e => setFormData({...formData, validade: e.target.value})} 
                    style={{...f.input, color: '#B45309'}} 
                  />
                </div>
                <div style={{...f.cell, borderRight: 'none'}}>
                  <label style={f.label}>CONDIÇÕES DE PAGAMENTO</label>
                  <input placeholder="Ex: Financiamento / Banco" onChange={e => setFormData({...formData, Condicoes: e.target.value})} style={f.input} />
                </div>
              </div>
            </div>

          </form>
        </div>

        <div style={f.footer}>
          <button onClick={handleSalvar} disabled={loading} style={f.btnMain}>
            {loading ? 'GERANDO...' : 'CONFIRMAR E GERAR PROPOSTA'}
          </button>
        </div>
      </div>
    </div>
  )
}

const f = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
  modal: { backgroundColor: '#F5F5DC', width: '95%', maxWidth: '1100px', height: '90vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '3px solid #000', overflow: 'hidden' },
  header: { padding: '15px 30px', backgroundColor: '#fff', borderBottom: '3px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  scroll: { padding: '20px 30px', overflowY: 'auto', flex: 1 },
  vList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  labelBusca: { fontSize: '11px', fontWeight: '900', color: '#000', marginBottom: '5px', display: 'block' },
  search: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', borderRadius: '8px', border: 'none' },
  dropdown: { position: 'absolute', top: '65px', left: 0, right: 0, backgroundColor: '#fff', border: '2px solid #000', zIndex: 10, maxHeight: '150px', overflowY: 'auto' },
  option: { padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#000', fontWeight: '700' },
  imgBox: { backgroundColor: '#fff', padding: '10px', border: '2px solid #000', borderRadius: '10px', display: 'inline-block' },
  preview: { height: '140px', borderRadius: '5px', border: '1px solid #000' },
  sectionTitle: { fontSize: '13px', fontWeight: '900', color: '#EF4444', letterSpacing: '1px' },
  grid: { border: '2px solid #000', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden' },
  row: { display: 'flex', borderBottom: '1px solid #000' },
  cell: { flex: 1, padding: '10px', borderRight: '1px solid #000', display: 'flex', flexDirection: 'column' },
  label: { fontSize: '9px', fontWeight: '900', color: '#64748B', marginBottom: '3px' },
  input: { border: 'none', outline: 'none', width: '100%', fontSize: '14px', fontWeight: '700', background: 'none' },
  footer: { padding: '15px 30px', backgroundColor: '#fff', borderTop: '3px solid #000' },
  btnMain: { width: '100%', padding: '15px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '16px' },
  closeBtn: { border: 'none', background: 'none', fontWeight: '900', cursor: 'pointer' }
}