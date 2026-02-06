import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { supabaseOmie } from './supabaseOmieClient'

export default function FormModal({ onClose, initialData }) {
  const [loading, setLoading] = useState(false)
  const [tipoMaq, setTipoMaq] = useState('implemento') 
  const [temValidade, setTemValidade] = useState(true)
  const [listaClientes, setListaClientes] = useState([])
  const [listaEquipamentos, setListaEquipamentos] = useState([])
  const [listaTratores, setListaTratores] = useState([])
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
    'Niname/NCM': '',
    Ano: '',
    Prazo_Entrega: '',
    Valor_Total: '',
    Valor_A_Vista: '',
    Condicoes: '',
    validade: '',
    Imagem_Equipamento: '',
    status: 'Enviar Proposta',
    id_fabrica_ref: initialData?.id || '',
    // Campos técnicos para a tabela Formulario (com final _trator)
    motor_trator: '', 
    transmissao_diant_trator: '', 
    bomb_inje_trator: '', 
    bomb_hidra_trator: '',
    embreagem_trator: '', 
    capacit_comb_trator: '', 
    cambio_trator: '', 
    reversor_trator: '',
    trasmissao_tras_trator: '', 
    oleo_motor_trator: '', 
    oleo_trasmissao_trator: '',
    diant_min_max_trator: '', 
    tras_min_max_trator: ''
  })

  useEffect(() => {
    async function carregarDados() {
      try {
        // FUNÇÃO PARA BUSCAR ABSOLUTAMENTE TODOS OS REGISTROS (BYPASS 1000 ROWS)
        const fetchAll = async (tableName) => {
          let allData = [];
          let from = 0;
          const step = 1000;
          while (true) {
            const { data, error } = await supabase
              .from(tableName)
              .select('*')
              .range(from, from + step - 1);
            if (error) throw error;
            if (!data || data.length === 0) break;
            allData = [...allData, ...data];
            if (data.length < step) break;
            from += step;
          }
          return allData;
        };

        const [dataOmie, dataManual, dataEquip, dataTrator] = await Promise.all([
          fetchAll('Clientes_Omie'),
          fetchAll('Cliente_Manual'),
          supabase.from('Equipamentos').select('*'),
          supabase.from('cad_trator').select('*')
        ]);

        // Unifica as fontes de clientes
        const unidos = [
          ...(dataOmie || []).map(c => ({ ...c, origem: 'OMIE' })),
          ...(dataManual || []).map(c => ({ ...c, origem: 'MANUAL' }))
        ];

        setListaClientes(unidos)
        if (dataEquip.data) setListaEquipamentos(dataEquip.data)
        if (dataTrator.data) setListaTratores(dataTrator.data)
      } catch (err) { 
        console.error("Erro crítico ao carregar clientes:", err) 
      }
    }
    carregarDados()
  }, [])

  const handleSelecionarCliente = (c) => {
    // Normalização baseada nos CSVs enviados
    const nome = c.nome || 'Sem Nome'
    const documento = c['cpf/cnpj'] || c.cppf_cnpj || ''
    const ie = c['inscricao_estadual/municipal'] || c.inscricao || ''
    const local = c.endereco || c.endereco_completo || ''

    setFormData(prev => ({
      ...prev,
      Cliente: nome,
      'Cpf/Cpnj': documento,
      'inscricao_esta/mun': ie, 
      Cidade: c.cidade || '',
      Bairro: c.bairro || '',
      End_Entrega: local
    }))
    setBuscaCli(nome); 
    setShowCli(false)
  }

  const handleSelecionarEquipamento = (item) => {
    if (tipoMaq === 'implemento') {
      setFormData(prev => ({
        ...prev,
        Marca: item.marca, Modelo: item.modelo, Ano: item.ano,
        'Niname/NCM': item.finame, Imagem_Equipamento: item.imagem, Qtd_Eqp: '1'
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        Marca: item.marca, Modelo: item.modelo, Ano: item.ano || '',
        'Niname/NCM': item['finame/ncm'] || '', Imagem_Equipamento: item.imagem,
        motor_trator: item.motor || '',
        transmissao_diant_trator: item.transmissao_diant || '',
        bomb_inje_trator: item.bomb_inje || '',
        bomb_hidra_trator: item.bomb_hidra || '',
        embreagem_trator: item.embreagem || '',
        capacit_comb_trator: item.capacit_comb || '',
        cambio_trator: item.cambio || '',
        reversor_trator: item.reversor || '',
        trasmissao_tras_trator: item.trasmissao_tras || '',
        oleo_motor_trator: item.oleo_motor || '',
        oleo_trasmissao_trator: item.oleo_trasmissao || '',
        diant_min_max_trator: item.diant_min_max || '',
        tras_min_max_trator: item.tras_min_max || '',
        Qtd_Eqp: '1'
      }))
    }
    setBuscaEq(`${item.marca} ${item.modelo}`); setShowEq(false)
  }

  const handleSalvar = async (e) => {
    e.preventDefault(); setLoading(true)
    const payload = { ...formData };
    delete payload.cep; 
    delete payload.Tipo_Entrega;
    if (!temValidade) payload.validade = 'Sem validade';

    const { error } = await supabase.from('Formulario').insert([payload])
    if (!error) { alert("PROPOSTA GERADA COM SUCESSO!"); window.location.reload() }
    else { alert("Erro ao salvar: " + error.message); setLoading(false) }
  }

  return (
    <div style={f.overlay}>
      <div style={f.modal}>
        <div style={f.header}>
          <h2 style={{ fontWeight: '900', margin: 0 }}>NOVA PROPOSTA COMERCIAL</h2>
          <button onClick={onClose} style={f.closeBtn}>FECHAR [X]</button>
        </div>

        <div style={f.scroll}>
          <form onSubmit={handleSalvar} style={f.vList}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <label style={f.labelBusca}>1. BUSCAR CLIENTE (OMIE + MANUAL)</label>
                <input style={f.search} value={buscaCli} onFocus={() => setShowCli(true)} onChange={e => {setBuscaCli(e.target.value); setShowCli(true)}} placeholder="Pesquisar entre todos os 2600+ clientes..." />
                {showCli && (
                  <div style={f.dropdown}>
                    {listaClientes.filter(c => {
                        const termo = buscaCli.toLowerCase();
                        return !buscaCli || 
                          (c.nome || "").toLowerCase().includes(termo) || 
                          (c['cpf/cnpj'] || "").toLowerCase().includes(termo) || 
                          (c.cppf_cnpj || "").toLowerCase().includes(termo);
                      }).slice(0, 100).map((c, idx) => (
                        <div key={`${c.id}-${idx}`} style={f.option} onClick={() => handleSelecionarCliente(c)}>
                          <div style={{fontWeight: 'bold'}}>{c.nome}</div>
                          <div style={{fontSize: '10px', color: '#666'}}>
                            {c['cpf/cnpj'] || c.cppf_cnpj} | <span style={{color: c.origem === 'OMIE' ? '#EF4444' : '#10B981', fontWeight: '900'}}>{c.origem}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div style={{ flex: 1, position: 'relative' }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <label style={f.labelBusca}>2. SELECIONAR PRODUTO</label>
                  <select value={tipoMaq} onChange={(e) => {setTipoMaq(e.target.value); setBuscaEq('');}}
                    style={{fontSize: '10px', fontWeight: '900', border: '1px solid #000', borderRadius: '4px', cursor: 'pointer'}}>
                    <option value="implemento">IMPLEMENTO</option>
                    <option value="trator">TRATOR</option>
                  </select>
                </div>
                <input style={{...f.search, backgroundColor: tipoMaq === 'trator' ? '#1e293b' : '#000'}} 
                  value={buscaEq} onFocus={() => setShowEq(true)} onChange={e => {setBuscaEq(e.target.value); setShowEq(true)}} 
                  placeholder={tipoMaq === 'trator' ? "Pesquisar Trator..." : "Pesquisar Implemento..."} 
                />
                {showEq && (
                  <div style={f.dropdown}>
                    {(tipoMaq === 'implemento' ? listaEquipamentos : listaTratores)
                      .filter(e => {
                        const termo = buscaEq.toLowerCase();
                        return !buscaEq || (e.marca || "").toLowerCase().includes(termo) || (e.modelo || "").toLowerCase().includes(termo)
                      }).slice(0, 30).map(e => (
                        <div key={e.id} style={f.option} onClick={() => handleSelecionarEquipamento(e)}>{e.marca} {e.modelo}</div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {formData.Imagem_Equipamento && (
              <center><div style={f.imgBox}><label style={f.label}>FOTO SELECIONADA</label><br/><img src={formData.Imagem_Equipamento} style={f.preview} alt="Equipamento" /></div></center>
            )}

            <div style={f.sectionTitle}>I. DADOS DO CLIENTE</div>
            <div style={f.grid}>
              <div style={f.row}>
                <div style={f.cell}><label style={f.label}>CLIENTE</label><input value={formData.Cliente} readOnly style={f.input} /></div>
                <div style={f.cell}><label style={f.label}>CPF / CNPJ</label><input value={formData['Cpf/Cpnj']} readOnly style={f.input} /></div>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>I.E. / MUN.</label><input value={formData['inscricao_esta/mun']} readOnly style={f.input} /></div>
              </div>
              <div style={f.row}>
                <div style={f.cell}><label style={f.label}>CIDADE</label><input value={formData.Cidade} readOnly style={f.input} /></div>
                <div style={f.cell}><label style={f.label}>BAIRRO</label><input value={formData.Bairro} readOnly style={f.input} /></div>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>CEP</label><input value={formData.cep} readOnly style={{...f.input, color: '#999'}} /></div>
              </div>
              <div style={{...f.row, borderBottom: 'none'}}>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>ENDEREÇO COMPLETO</label><input value={formData.End_Entrega} readOnly style={f.input} /></div>
              </div>
            </div>

            <div style={f.sectionTitle}>II. DADOS DO {tipoMaq.toUpperCase()}</div>
            <div style={f.grid}>
              <div style={f.row}>
                <div style={f.cell}><label style={f.label}>MARCA</label><input value={formData.Marca} readOnly style={f.input} /></div>
                <div style={f.cell}><label style={f.label}>MODELO</label><input value={formData.Modelo} readOnly style={f.input} /></div>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>ANO</label><input value={formData.Ano} onChange={e => setFormData({...formData, Ano: e.target.value})} style={f.input} /></div>
              </div>

              {tipoMaq === 'trator' ? (
                <>
                  <div style={f.row}>
                    <div style={f.cell}><label style={f.label}>MOTOR</label><input value={formData.motor_trator} onChange={e => setFormData({...formData, motor_trator: e.target.value})} style={f.input} /></div>
                    <div style={f.cell}><label style={f.label}>BOMBA INJETORA</label><input value={formData.bomb_inje_trator} onChange={e => setFormData({...formData, bomb_inje_trator: e.target.value})} style={f.input} /></div>
                    <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>BOMBA HIDRÁULICA</label><input value={formData.bomb_hidra_trator} onChange={e => setFormData({...formData, bomb_hidra_trator: e.target.value})} style={f.input} /></div>
                  </div>
                  <div style={f.row}>
                    <div style={f.cell}><label style={f.label}>CÂMBIO</label><input value={formData.cambio_trator} onChange={e => setFormData({...formData, cambio_trator: e.target.value})} style={f.input} /></div>
                    <div style={f.cell}><label style={f.label}>REVERSOR</label><input value={formData.reversor_trator} onChange={e => setFormData({...formData, reversor_trator: e.target.value})} style={f.input} /></div>
                    <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>EMBREAGEM</label><input value={formData.embreagem_trator} onChange={e => setFormData({...formData, embreagem_trator: e.target.value})} style={f.input} /></div>
                  </div>
                  <div style={f.row}>
                    <div style={f.cell}><label style={f.label}>TRANS. DIANT.</label><input value={formData.transmissao_diant_trator} onChange={e => setFormData({...formData, transmissao_diant_trator: e.target.value})} style={f.input} /></div>
                    <div style={f.cell}><label style={f.label}>TRANS. TRAS.</label><input value={formData.trasmissao_tras_trator} onChange={e => setFormData({...formData, trasmissao_tras_trator: e.target.value})} style={f.input} /></div>
                    <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>CAP. COMB.</label><input value={formData.capacit_comb_trator} onChange={e => setFormData({...formData, capacit_comb_trator: e.target.value})} style={f.input} /></div>
                  </div>
                  <div style={f.row}>
                    <div style={f.cell}><label style={f.label}>ÓLEO MOTOR</label><input value={formData.oleo_motor_trator} onChange={e => setFormData({...formData, oleo_motor_trator: e.target.value})} style={f.input} /></div>
                    <div style={f.cell}><label style={f.label}>ÓLEO TRANS.</label><input value={formData.oleo_trasmissao_trator} onChange={e => setFormData({...formData, oleo_trasmissao_trator: e.target.value})} style={f.input} /></div>
                    <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>FINAME / NCM</label><input value={formData['Niname/NCM']} onChange={e => setFormData({...formData, 'Niname/NCM': e.target.value})} style={f.input} /></div>
                  </div>
                  <div style={{...f.row, borderBottom: 'none'}}>
                    <div style={f.cell}><label style={f.label}>DIANTEIRA MÍN/MÁX</label><input value={formData.diant_min_max_trator} onChange={e => setFormData({...formData, diant_min_max_trator: e.target.value})} style={f.input} /></div>
                    <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>TRASEIRA MÍN/MÁX</label><input value={formData.tras_min_max_trator} onChange={e => setFormData({...formData, tras_min_max_trator: e.target.value})} style={f.input} /></div>
                  </div>
                </>
              ) : (
                <div style={{...f.row, borderBottom: 'none'}}>
                  <div style={f.cell}><label style={f.label}>FINAME / NCM</label><input value={formData['Niname/NCM']} onChange={e => setFormData({...formData, 'Niname/NCM': e.target.value})} style={f.input} /></div>
                  <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>QUANTIDADE</label><input type="number" value={formData.Qtd_Eqp} onChange={e => setFormData({...formData, Qtd_Eqp: e.target.value})} style={f.input} /></div>
                </div>
              )}
            </div>

            <div style={f.sectionTitle}>III. CONDIÇÕES FINANCEIRAS</div>
            <div style={f.grid}>
              <div style={f.row}>
                <div style={f.cell}><label style={f.label}>VALOR TOTAL (R$)</label><input type="number" step="0.01" value={formData.Valor_Total} onChange={e => setFormData({...formData, Valor_Total: e.target.value})} style={{...f.input, color: 'red'}} /></div>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>VALOR À VISTA (R$)</label><input type="number" step="0.01" value={formData.Valor_A_Vista} onChange={e => setFormData({...formData, Valor_A_Vista: e.target.value})} style={{...f.input, color: 'green'}} /></div>
              </div>
              <div style={f.row}>
                <div style={f.cell}><label style={f.label}>PRAZO ENTREGA (DIAS)</label><input type="number" value={formData.Prazo_Entrega} onChange={e => setFormData({...formData, Prazo_Entrega: e.target.value})} style={f.input} /></div>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>TIPO DE ENTREGA</label><select value={formData.Tipo_Entrega} onChange={e => setFormData({...formData, Tipo_Entrega: e.target.value})} style={{...f.input, cursor: 'pointer'}}><option value="FOB">FOB (CLIENTE RETIRA)</option><option value="CIF">CIF (ENTREGA NA PROPRIEDADE)</option></select></div>
              </div>
              <div style={f.row}>
                <div style={f.cell}><label style={f.label}>TEM VALIDADE?</label><select value={temValidade} onChange={e => setTemValidade(e.target.value === 'true')} style={{...f.input, cursor: 'pointer', fontWeight: '900', color: temValidade ? '#B45309' : '#666'}}><option value="true">SIM</option><option value="false">NÃO</option></select></div>
                <div style={{...f.cell, borderRight: 'none'}}>{temValidade ? (<><label style={f.label}>DIAS DE VALIDADE</label><input type="number" value={formData.validade} onChange={e => setFormData({...formData, validade: e.target.value})} style={{...f.input, color: '#B45309'}} /></>) : (<div style={{color: '#999', fontSize: '11px', fontWeight: 'bold', paddingTop: '10px'}}>SEM VALIDADE</div>)}</div>
              </div>
              <div style={{...f.row, borderTop: '1px solid #000', borderBottom: 'none'}}>
                <div style={{...f.cell, borderRight: 'none'}}><label style={f.label}>CONDIÇÕES DE PAGAMENTO</label><input value={formData.Condicoes} onChange={e => setFormData({...formData, Condicoes: e.target.value})} style={f.input} /></div>
              </div>
            </div>
          </form>
        </div>
        <div style={f.footer}><button onClick={handleSalvar} disabled={loading} style={f.btnMain}>{loading ? 'GERANDO...' : 'CONFIRMAR E GERAR PROPOSTA'}</button></div>
      </div>
    </div>
  )
}

const f = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' },
  modal: { backgroundColor: '#F5F5DC', width: '95%', maxWidth: '1100px', height: '95vh', borderRadius: '20px', display: 'flex', flexDirection: 'column', border: '3px solid #000', overflow: 'hidden' },
  header: { padding: '20px 30px', backgroundColor: '#fff', borderBottom: '3px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  scroll: { padding: '25px 30px', overflowY: 'auto', flex: 1 },
  vList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  labelBusca: { fontSize: '11px', fontWeight: '900', color: '#000', marginBottom: '8px', display: 'block' },
  search: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '700' },
  dropdown: { position: 'absolute', top: '75px', left: 0, right: 0, backgroundColor: '#fff', border: '2px solid #000', zIndex: 100, maxHeight: '300px', overflowY: 'auto', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
  option: { padding: '12px', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#000', fontWeight: '700', fontSize: '13px' },
  imgBox: { backgroundColor: '#fff', padding: '10px', border: '2px solid #000', borderRadius: '10px', display: 'inline-block' },
  preview: { height: '140px', borderRadius: '5px', border: '1px solid #000' },
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