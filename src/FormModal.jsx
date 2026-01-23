import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function FormModal({ onClose, initialData }) {
  const [loading, setLoading] = useState(false)
  const [listaClientes, setListaClientes] = useState([])
  const [listaEquipamentos, setListaEquipamentos] = useState([])
  const [buscaCli, setBuscaCli] = useState(initialData?.cliente || '')
  const [showCli, setShowCli] = useState(false)

  const [formData, setFormData] = useState({
    Cliente: initialData?.cliente || '',
    'Cpf/Cpnj': '',
    Cidade: '',
    Bairro: '',
    End_Entrega: '',
    Qtd_Eqp: '1',
    Marca: initialData?.marca || '',
    Modelo: initialData?.modelo || '',
    'Niname/NCM': '',
    Configuracao: '',
    Descricao: initialData?.modelo || '',
    Ano: '',
    Prazo_Entrega: '',
    Valor_Total: '',
    Valor_A_Vista: '',
    Condicoes: initialData?.forma_pagamento || '',
    Imagem_Equipamento: '',
    id_fabrica_ref: initialData?.id || '',
    status: 'Enviar Proposta'
  })

  useEffect(() => {
    const fetchData = async () => {
      const { data: clis } = await supabase.from('Clientes').select('*')
      const { data: equis } = await supabase.from('Equipamentos').select('*')
      if (clis) setListaClientes(clis)
      if (equis) setListaEquipamentos(equis)

      // Se veio da fábrica, tenta preencher os dados do cliente e máquina automaticamente
      if (initialData) {
        const cli = clis?.find(c => c.nome === initialData.cliente)
        if (cli) {
          setFormData(prev => ({
            ...prev,
            'Cpf/Cpnj': cli.cppf_cnpj,
            Cidade: cli.cidade,
            Bairro: cli.bairro,
            End_Entrega: cli.endereco
          }))
        }
        const eqp = equis?.find(e => e.modelo === initialData.modelo)
        if (eqp) {
          setFormData(prev => ({
            ...prev,
            'Niname/NCM': eqp.finame,
            Configuracao: eqp.configuracao,
            Imagem_Equipamento: eqp.imagem,
            Ano: eqp.ano,
            Descricao: eqp.descricao
          }))
        }
      }
    }
    fetchData()
  }, [initialData])

  const selecionarCliente = (c) => {
    setFormData({
      ...formData,
      Cliente: c.nome,
      'Cpf/Cpnj': c.cppf_cnpj,
      Cidade: c.cidade,
      Bairro: c.bairro,
      End_Entrega: c.endereco
    })
    setBuscaCli(c.nome); setShowCli(false);
  }

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true)
    const { error } = await supabase.from('Formulario').insert([formData])
    if (error) alert("Erro ao salvar proposta: " + error.message)
    else { alert("PROPOSTA COMERCIAL CRIADA!"); window.location.reload(); }
    setLoading(false)
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.header}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <div style={{width: '4px', height: '18px', backgroundColor: '#FF0000'}}></div>
            <h2 style={{fontSize: '14px', fontWeight: '900', margin: 0}}>NOVA PROPOSTA COMERCIAL</h2>
          </div>
          <button onClick={onClose} style={s.closeBtn}>FECHAR</button>
        </div>

        <div style={s.scroll}>
          <form onSubmit={handleSave} style={s.vList}>
            
            {/* BUSCA DE CLIENTE */}
            <section style={s.card}>
              <span style={s.tag}>IDENTIFICAÇÃO DO CLIENTE</span>
              <div style={{position: 'relative', marginBottom: '10px'}}>
                <input 
                  placeholder="PESQUISAR CLIENTE CADASTRADO..." 
                  style={s.searchInput} 
                  value={buscaCli} 
                  onChange={e => {setBuscaCli(e.target.value); setShowCli(true)}} 
                />
                {showCli && buscaCli && (
                  <div style={s.dropdown}>
                    {listaClientes.filter(c => c.nome.toLowerCase().includes(buscaCli.toLowerCase())).map(c => (
                      <div key={c.id} style={s.option} onClick={() => selecionarCliente(c)}>{c.nome}</div>
                    ))}
                  </div>
                )}
              </div>
              <div style={s.grid}>
                <div style={{flex: 2}}><label style={s.label}>NOME / RAZÃO SOCIAL</label>
                <input value={formData.Cliente} readOnly style={s.input} /></div>
                <div style={{flex: 1}}><label style={s.label}>CPF / CNPJ</label>
                <input value={formData['Cpf/Cpnj']} readOnly style={s.input} /></div>
              </div>
              <div style={{...s.grid, marginTop: '10px'}}>
                <input placeholder="CIDADE" value={formData.Cidade} readOnly style={s.input} />
                <input placeholder="BAIRRO" value={formData.Bairro} readOnly style={s.input} />
              </div>
            </section>

            {/* DADOS DA MÁQUINA */}
            <section style={s.card}>
              <span style={s.tag}>ESPECIFICAÇÕES DO EQUIPAMENTO</span>
              <div style={s.grid}>
                <div style={{flex: 2}}><label style={s.label}>DESCRIÇÃO</label>
                <input value={formData.Descricao} onChange={e => setFormData({...formData, Descricao: e.target.value})} style={s.input} /></div>
                <div style={{flex: 1}}><label style={s.label}>ANO</label>
                <input value={formData.Ano} onChange={e => setFormData({...formData, Ano: e.target.value})} style={s.input} /></div>
              </div>
              <div style={{...s.grid, marginTop: '10px'}}>
                <input placeholder="MARCA" value={formData.Marca} readOnly style={s.input} />
                <input placeholder="MODELO" value={formData.Modelo} readOnly style={s.input} />
                <input placeholder="QUANTIDADE" type="number" value={formData.Qtd_Eqp} onChange={e => setFormData({...formData, Qtd_Eqp: e.target.value})} style={s.input} />
              </div>
              <textarea placeholder="CONFIGURAÇÃO TÉCNICA" value={formData.Configuracao} onChange={e => setFormData({...formData, Configuracao: e.target.value})} style={{...s.input, marginTop: '10px', height: '60px'}} />
            </section>

            {/* FINANCEIRO */}
            <section style={s.card}>
              <span style={s.tag}>CONDIÇÕES COMERCIAIS</span>
              <div style={s.grid}>
                <div style={s.field}><label style={s.label}>VALOR TOTAL (R$)</label>
                <input type="number" required onChange={e => setFormData({...formData, Valor_Total: e.target.value})} style={s.input} /></div>
                <div style={s.field}><label style={s.label}>VALOR À VISTA (R$)</label>
                <input type="number" onChange={e => setFormData({...formData, Valor_A_Vista: e.target.value})} style={s.input} /></div>
                <div style={s.field}><label style={s.label}>PRAZO (DIAS)</label>
                <input type="number" onChange={e => setFormData({...formData, Prazo_Entrega: e.target.value})} style={s.input} /></div>
              </div>
              <input placeholder="CONDIÇÕES DE PAGAMENTO / FINANCIAMENTO" value={formData.Condicoes} onChange={e => setFormData({...formData, Condicoes: e.target.value})} style={{...s.input, marginTop: '10px'}} />
            </section>

          </form>
        </div>

        <div style={s.footer}>
          <button onClick={handleSave} disabled={loading} style={s.saveBtn}>
            {loading ? 'PROCESSANDO...' : 'CONFIRMAR E GERAR PROPOSTA FINAL'}
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300 },
  modal: { backgroundColor: '#F0F2F5', width: '95%', maxWidth: '650px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', borderRadius: '12px' },
  header: { padding: '15px 25px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB' },
  closeBtn: { border: 'none', background: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  scroll: { padding: '20px', overflowY: 'auto', flex: 1 },
  vList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { backgroundColor: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #E5E7EB' },
  tag: { fontSize: '9px', fontWeight: '900', color: '#FF0000', letterSpacing: '1px', marginBottom: '12px', display: 'block' },
  grid: { display: 'flex', gap: '10px' },
  field: { flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '10px', fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase' },
  input: { padding: '10px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  searchInput: { padding: '12px', backgroundColor: '#111827', color: '#fff', border: 'none', width: '100%', borderRadius: '8px' },
  dropdown: { backgroundColor: '#fff', border: '1px solid #ddd', maxHeight: '150px', overflowY: 'auto', position: 'absolute', width: '100%', zIndex: 10, borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  option: { padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '13px' },
  footer: { padding: '15px 25px', backgroundColor: '#fff', borderTop: '1px solid #eee' },
  saveBtn: { width: '100%', padding: '14px', backgroundColor: '#FF0000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
}