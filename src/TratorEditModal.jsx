import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function TratorEditModal({ onClose }) {
  const [listaTratores, setListaTratores] = useState([])
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const [formData, setFormData] = useState({
    marca: '', modelo: '', motor: '', transmissao_diant: '',
    bomb_inje: '', bomb_hidra: '', embreagem: '', capacit_comb: '',
    cambio: '', reversor: '', trasmissao_tras: '', oleo_motor: '',
    oleo_trasmissao: '', diant_min_max: '', tras_min_max: '', 
    obs: '', imagem: '', ano: '', 'finame/ncm': ''
  })

  useEffect(() => {
    fetchTratores()
  }, [])

  const fetchTratores = async () => {
    const { data } = await supabase.from('cad_trator').select('*').order('marca')
    if (data) setListaTratores(data)
  }

  const handleSelecionar = (t) => {
    setSelecionado(t)
    setFormData({ ...t })
    setBusca(`${t.marca} ${t.modelo}`)
    setShowDropdown(false)
  }

  const handleUpload = async (e) => {
    try {
      setUploading(true)
      const file = e.target.files[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('equipamentos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('equipamentos').getPublicUrl(filePath)
      setFormData({ ...formData, imagem: data.publicUrl })
    } catch (err) {
      alert("Erro upload: " + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('cad_trator')
      .update(formData)
      .eq('id', selecionado.id)

    if (!error) {
      alert("TRATOR ATUALIZADO COM SUCESSO!")
      window.location.reload()
    } else {
      alert("Erro: " + error.message)
      setLoading(false)
    }
  }

  return (
    <div style={st.overlay}>
      <div style={st.modal}>
        <div style={st.header}>
          <h2 style={{fontWeight:900, margin:0}}>EDIÇÃO DE TRATORES</h2>
          <button onClick={onClose} style={st.closeBtn}>FECHAR [X]</button>
        </div>

        <div style={st.scroll}>
          {/* BUSCA EM CASCATA */}
          <div style={{position:'relative', marginBottom:25}}>
            <label style={st.labelBusca}>PESQUISAR TRATOR PARA EDITAR</label>
            <input 
              style={st.search} 
              value={busca} 
              onFocus={() => setShowDropdown(true)}
              onChange={e => {setBusca(e.target.value); setSelecionado(null); setShowDropdown(true)}} 
              placeholder="Clique para ver todos ou digite marca/modelo..."
            />
            
            {showDropdown && !selecionado && (
              <div style={st.dropdown}>
                {listaTratores
                  .filter(t => {
                    const termo = busca.toLowerCase();
                    return !busca || 
                           (t.marca || "").toLowerCase().includes(termo) || 
                           (t.modelo || "").toLowerCase().includes(termo);
                  })
                  .slice(0, 40)
                  .map(t => (
                    <div key={t.id} style={st.option} onClick={() => handleSelecionar(t)}>
                      <strong>{t.marca}</strong> {t.modelo} {t.ano ? `(${t.ano})` : ''}
                    </div>
                  ))}
              </div>
            )}

            {selecionado && (
              <button onClick={() => {setSelecionado(null); setBusca(''); setShowDropdown(true)}} style={st.btnLimpar}>Trocar Trator (Nova Busca)</button>
            )}
          </div>

          {selecionado && (
            <form onSubmit={handleUpdate} style={st.vList}>
              <div style={st.sectionTitle}>I. IDENTIFICAÇÃO E FOTO</div>
              <center>
                <div style={st.imgBox}>
                  {formData.imagem ? (
                    <img src={formData.imagem} style={st.preview} alt="Trator" />
                  ) : (
                    <div style={{width: 250, height: 150, backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, border: '2px dashed #ccc'}}>SEM FOTO</div>
                  )}
                  <input type="file" id="editTratorImg" style={{display:'none'}} onChange={handleUpload} />
                  <button type="button" onClick={() => document.getElementById('editTratorImg').click()} style={st.btnAnexar}>
                    {uploading ? 'ENVIANDO...' : '📷 ALTERAR FOTO'}
                  </button>
                </div>
              </center>

              <div style={st.grid}>
                <div style={st.row}>
                  <div style={st.cell}><label style={st.label}>MARCA</label>
                    <input value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} style={st.input} />
                  </div>
                  <div style={{...st.cell, borderRight:'none'}}><label style={st.label}>MODELO</label>
                    <input value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} style={st.input} />
                  </div>
                </div>
                <div style={{...st.row, borderBottom: 'none'}}>
                  <div style={st.cell}><label style={st.label}>ANO</label>
                    <input value={formData.ano} onChange={e => setFormData({...formData, ano: e.target.value})} style={st.input} />
                  </div>
                  <div style={{...st.cell, borderRight:'none'}}><label style={st.label}>FINAME / NCM</label>
                    <input value={formData['finame/ncm']} onChange={e => setFormData({...formData, 'finame/ncm': e.target.value})} style={st.input} />
                  </div>
                </div>
              </div>

              <div style={st.sectionTitle}>II. MOTOR E COMBUSTÍVEL</div>
              <div style={st.grid}>
                <div style={st.row}>
                  <div style={st.cell}><label style={st.label}>MOTOR</label><input value={formData.motor} onChange={e => setFormData({...formData, motor: e.target.value})} style={st.input} /></div>
                  <div style={st.cell}><label style={st.label}>BOMBA INJETORA</label><input value={formData.bomb_inje} onChange={e => setFormData({...formData, bomb_inje: e.target.value})} style={st.input} /></div>
                  <div style={{...st.cell, borderRight: 'none'}}><label style={st.label}>CAPACIDADE TANQUE</label><input value={formData.capacit_comb} onChange={e => setFormData({...formData, capacit_comb: e.target.value})} style={st.input} /></div>
                </div>
              </div>

              <div style={st.sectionTitle}>III. TRANSMISSÃO E MECÂNICA</div>
              <div style={st.grid}>
                <div style={st.row}>
                  <div style={st.cell}><label style={st.label}>CÂMBIO</label><input value={formData.cambio} onChange={e => setFormData({...formData, cambio: e.target.value})} style={st.input} /></div>
                  <div style={st.cell}><label style={st.label}>REVERSOR</label><input value={formData.reversor} onChange={e => setFormData({...formData, reversor: e.target.value})} style={st.input} /></div>
                  <div style={{...st.cell, borderRight: 'none'}}><label style={st.label}>EMBREAGEM</label><input value={formData.embreagem} onChange={e => setFormData({...formData, embreagem: e.target.value})} style={st.input} /></div>
                </div>
                <div style={st.row}>
                  <div style={st.cell}><label style={st.label}>TRANSMISSÃO DIANT.</label><input value={formData.transmissao_diant} onChange={e => setFormData({...formData, transmissao_diant: e.target.value})} style={st.input} /></div>
                  <div style={st.cell}><label style={st.label}>TRANSMISSÃO TRAS.</label><input value={formData.trasmissao_tras} onChange={e => setFormData({...formData, trasmissao_tras: e.target.value})} style={st.input} /></div>
                  <div style={{...st.cell, borderRight: 'none'}}><label style={st.label}>BOMBA HIDRÁULICA</label><input value={formData.bomb_hidra} onChange={e => setFormData({...formData, bomb_hidra: e.target.value})} style={st.input} /></div>
                </div>
              </div>

              <div style={st.sectionTitle}>IV. FLUIDOS E PNEUS</div>
              <div style={st.grid}>
                <div style={st.row}>
                  <div style={st.cell}><label style={st.label}>ÓLEO MOTOR</label><input value={formData.oleo_motor} onChange={e => setFormData({...formData, oleo_motor: e.target.value})} style={st.input} /></div>
                  <div style={{...st.cell, borderRight: 'none'}}><label style={st.label}>ÓLEO TRANSMISSÃO</label><input value={formData.oleo_trasmissao} onChange={e => setFormData({...formData, oleo_trasmissao: e.target.value})} style={st.input} /></div>
                </div>
                <div style={{...st.row, borderBottom: 'none'}}>
                  <div style={st.cell}><label style={st.label}>DIANTEIRA MÍNIMA E MÁXIMA</label><input value={formData.diant_min_max} onChange={e => setFormData({...formData, diant_min_max: e.target.value})} style={st.input} /></div>
                  <div style={{...st.cell, borderRight: 'none'}}><label style={st.label}>TRASEIRA MÍNIMA E MÁXIMA</label><input value={formData.tras_min_max} onChange={e => setFormData({...formData, tras_min_max: e.target.value})} style={st.input} /></div>
                </div>
              </div>

              <div style={st.sectionTitle}>V. OBSERVAÇÕES</div>
              <textarea 
                value={formData.obs}
                onChange={e => setFormData({...formData, obs: e.target.value})} 
                style={st.textarea} 
              />

              <button type="submit" disabled={loading || uploading} style={st.btnMain}>
                {loading ? 'SALVANDO...' : 'ATUALIZAR CADASTRO DO TRATOR'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

const st = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 6000, backdropFilter: 'blur(4px)' },
  modal: { backgroundColor: '#F5F5DC', width: '95%', maxWidth: '1000px', height: '90vh', borderRadius: '20px', display: 'flex', flexDirection: 'column', border: '3px solid #000', overflow: 'hidden' },
  header: { padding: '20px 30px', backgroundColor: '#fff', borderBottom: '3px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  scroll: { padding: '25px 30px', overflowY: 'auto', flex: 1 },
  labelBusca: { fontSize: '11px', fontWeight: '900', color: '#000', marginBottom: '8px', display: 'block' },
  search: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', borderRadius: '10px', border: 'none', fontSize: '14px' },
  dropdown: { position: 'absolute', top: '75px', left: 0, right: 0, backgroundColor: '#fff', border: '2px solid #000', zIndex: 100, maxHeight: '250px', overflowY: 'auto', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  option: { padding: '12px', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#000', fontWeight: '600', fontSize: '13px' },
  btnLimpar: { marginTop: '10px', backgroundColor: '#eee', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' },
  vList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionTitle: { fontSize: '12px', fontWeight: '900', color: '#EF4444', textTransform: 'uppercase' },
  grid: { border: '2px solid #000', backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden' },
  row: { display: 'flex', borderBottom: '1px solid #000' },
  cell: { flex: 1, padding: '12px', borderRight: '1px solid #000', display: 'flex', flexDirection: 'column' },
  label: { fontSize: '9px', fontWeight: '900', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' },
  input: { border: 'none', outline: 'none', width: '100%', fontSize: '14px', fontWeight: '700', background: 'none' },
  btnMain: { width: '100%', padding: '18px', backgroundColor: '#1E293B', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', marginTop: 20, marginBottom: 20 },
  closeBtn: { border: 'none', background: 'none', fontWeight: '900', cursor: 'pointer' },
  imgBox: { marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  preview: { width: '250px', maxHeight: '180px', objectFit: 'contain', border: '2px solid #000', borderRadius: '10px' },
  btnAnexar: { padding: '8px 15px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '10px', fontWeight: '800' },
  textarea: { padding: '15px', border: '2px solid #000', borderRadius: '10px', fontSize: '14px', width: '100%', minHeight: '80px', background: '#fff', resize: 'none', fontWeight: '700' }
}