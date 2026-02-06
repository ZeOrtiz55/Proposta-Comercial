import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function TratorModal({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    motor: '',
    transmissao_diant: '',
    bomb_inje: '',
    bomb_hidra: '',
    embreagem: '',
    capacit_comb: '',
    cambio: '',
    reversor: '',
    trasmissao_tras: '',
    oleo_motor: '',
    oleo_trasmissao: '',
    diant_min_max: '', 
    tras_min_max: '',  
    obs: '',
    imagem: '',
    ano: '',          // NOVO CAMPO
    'finame/ncm': ''  // NOVO CAMPO
  })

  // FUNÇÃO PARA UPLOAD DE IMAGEM
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
      
    } catch (error) {
      alert('Erro no upload: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.from('cad_trator').insert([formData])
    
    if (error) {
      alert("Erro ao cadastrar trator: " + error.message)
    } else {
      alert("TRATOR CADASTRADO COM SUCESSO!")
      window.location.reload()
    }
    setLoading(false)
  }

  return (
    <div style={st.overlay}>
      <div style={st.modal}>
        <div style={st.header}>
          <h2 style={{ fontWeight: '900', margin: 0 }}>CADASTRAR NOVO TRATOR</h2>
          <button onClick={onClose} style={st.closeBtn}>FECHAR [X]</button>
        </div>

        <div style={st.scroll}>
          <form onSubmit={handleSave} style={st.vList}>
            
            <div style={st.sectionTitle}>I. IDENTIFICAÇÃO E FOTO</div>
            <center>
              <div style={st.imgBox}>
                {formData.imagem ? (
                  <img src={formData.imagem} style={st.preview} alt="Trator" />
                ) : (
                  <div style={st.placeholder}>SEM FOTO</div>
                )}
                <input 
                  type="file" 
                  id="fileTrator" 
                  onChange={handleUpload} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                />
                <button 
                  type="button" 
                  onClick={() => document.getElementById('fileTrator').click()} 
                  style={st.btnAnexar}
                >
                  {uploading ? 'ENVIANDO...' : '📷 ANEXAR FOTO DO TRATOR'}
                </button>
              </div>
            </center>

            <div style={st.grid}>
              <div style={st.row}>
                <div style={st.cell}><label style={st.label}>MARCA</label>
                  <input required value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} style={st.input} placeholder="Ex: Massey Ferguson" />
                </div>
                <div style={{...st.cell, borderRight: 'none'}}><label style={st.label}>MODELO</label>
                  <input required value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} style={st.input} placeholder="Ex: 4707" />
                </div>
              </div>
              <div style={st.row}>
                <div style={st.cell}><label style={st.label}>ANO</label>
                  <input value={formData.ano} onChange={e => setFormData({...formData, ano: e.target.value})} style={st.input} placeholder="Ex: 2025" />
                </div>
                <div style={{...st.cell, borderRight: 'none'}}><label style={st.label}>FINAME / NCM</label>
                  <input value={formData['finame/ncm']} onChange={e => setFormData({...formData, 'finame/ncm': e.target.value})} style={st.input} />
                </div>
              </div>
            </div>

            <div style={st.sectionTitle}>II. MOTOR E SISTEMA DE COMBUSTÍVEL</div>
            <div style={st.grid}>
              <div style={st.row}>
                <div style={st.cell}><label style={st.label}>MOTOR</label>
                  <input value={formData.motor} onChange={e => setFormData({...formData, motor: e.target.value})} style={st.input} />
                </div>
                <div style={st.cell}><label style={st.label}>BOMBA INJETORA</label>
                  <input value={formData.bomb_inje} onChange={e => setFormData({...formData, bomb_inje: e.target.value})} style={st.input} />
                </div>
                <div style={{...st.cell, borderRight: 'none'}}><label style={st.label}>CAPACIDADE TANQUE (L)</label>
                  <input value={formData.capacit_comb} onChange={e => setFormData({...formData, capacit_comb: e.target.value})} style={st.input} />
                </div>
              </div>
            </div>

            <div style={st.sectionTitle}>III. TRANSMISSÃO E MECÂNICA</div>
            <div style={st.grid}>
              <div style={st.row}>
                <div style={st.cell}><label style={st.label}>CÂMBIO</label>
                  <input value={formData.cambio} onChange={e => setFormData({...formData, cambio: e.target.value})} style={st.input} />
                </div>
                <div style={st.cell}><label style={st.label}>REVERSOR</label>
                  <input value={formData.reversor} onChange={e => setFormData({...formData, reversor: e.target.value})} style={st.input} />
                </div>
                <div style={{...st.cell, borderRight: 'none'}}><label style={st.label}>EMBREAGEM</label>
                  <input value={formData.embreagem} onChange={e => setFormData({...formData, embreagem: e.target.value})} style={st.input} />
                </div>
              </div>
              <div style={st.row}>
                <div style={st.cell}><label style={st.label}>TRANSMISSÃO DIANTEIRA</label>
                  <input value={formData.transmissao_diant} onChange={e => setFormData({...formData, transmissao_diant: e.target.value})} style={st.input} />
                </div>
                <div style={{...st.cell, borderRight: 'none'}}><label style={st.label}>TRANSMISSÃO TRASEIRA</label>
                  <input value={formData.trasmissao_tras} onChange={e => setFormData({...formData, trasmissao_tras: e.target.value})} style={st.input} />
                </div>
              </div>
              <div style={{...st.row, borderBottom: 'none'}}>
                <div style={{...st.cell, borderRight: 'none'}}><label style={st.label}>BOMBA HIDRÁULICA</label>
                  <input value={formData.bomb_hidra} onChange={e => setFormData({...formData, bomb_hidra: e.target.value})} style={st.input} />
                </div>
              </div>
            </div>

            <div style={st.sectionTitle}>IV. FLUIDOS E PNEUMÁTICOS</div>
            <div style={st.grid}>
              <div style={st.row}>
                <div style={st.cell}><label style={st.label}>ÓLEO MOTOR</label>
                  <input value={formData.oleo_motor} onChange={e => setFormData({...formData, oleo_motor: e.target.value})} style={st.input} />
                </div>
                <div style={{...st.cell, borderRight: 'none'}}><label style={st.label}>ÓLEO TRANSMISSÃO</label>
                  <input value={formData.oleo_trasmissao} onChange={e => setFormData({...formData, oleo_trasmissao: e.target.value})} style={st.input} />
                </div>
              </div>
              <div style={{...st.row, borderBottom: 'none'}}>
                <div style={st.cell}>
                  <label style={st.label}>DIANTEIRA MÍNIMA E MÁXIMA</label>
                  <input value={formData.diant_min_max} onChange={e => setFormData({...formData, diant_min_max: e.target.value})} style={st.input} placeholder="Ex: 12.4-24" />
                </div>
                <div style={{...st.cell, borderRight: 'none'}}>
                  <label style={st.label}>TRASEIRA MÍNIMA E MÁXIMA</label>
                  <input value={formData.tras_min_max} onChange={e => setFormData({...formData, tras_min_max: e.target.value})} style={st.input} placeholder="Ex: 18.4-30" />
                </div>
              </div>
            </div>

            <div style={st.sectionTitle}>V. OBSERVAÇÕES</div>
            <textarea 
              value={formData.obs}
              onChange={e => setFormData({...formData, obs: e.target.value})} 
              style={st.textarea} 
              placeholder="Informações técnicas adicionais..."
            />

          </form>
        </div>

        <div style={st.footer}>
          <button onClick={handleSave} disabled={loading || uploading} style={st.btnMain}>
            {loading ? 'CADASTRANDO...' : 'SALVAR TRATOR NO SISTEMA'}
          </button>
        </div>
      </div>
    </div>
  )
}

const st = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000, backdropFilter: 'blur(4px)' },
  modal: { backgroundColor: '#F5F5DC', width: '95%', maxWidth: '1100px', height: '90vh', borderRadius: '20px', display: 'flex', flexDirection: 'column', border: '3px solid #000', overflow: 'hidden' },
  header: { padding: '20px 30px', backgroundColor: '#fff', borderBottom: '3px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  scroll: { padding: '25px 30px', overflowY: 'auto', flex: 1 },
  vList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionTitle: { fontSize: '12px', fontWeight: '900', color: '#EF4444', textTransform: 'uppercase' },
  grid: { border: '2px solid #000', backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden' },
  row: { display: 'flex', borderBottom: '1px solid #000' },
  cell: { flex: 1, padding: '12px', borderRight: '1px solid #000', display: 'flex', flexDirection: 'column' },
  label: { fontSize: '9px', fontWeight: '900', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' },
  input: { border: 'none', outline: 'none', width: '100%', fontSize: '14px', fontWeight: '700', background: 'none' },
  textarea: { padding: '15px', border: '2px solid #000', borderRadius: '10px', fontSize: '14px', width: '100%', minHeight: '80px', background: '#fff', resize: 'none', fontWeight: '700' },
  footer: { padding: '20px 30px', backgroundColor: '#fff', borderTop: '3px solid #000' },
  btnMain: { width: '100%', padding: '18px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '16px' },
  closeBtn: { border: 'none', background: 'none', fontWeight: '900', cursor: 'pointer', color: '#000' },
  imgBox: { marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  preview: { width: '300px', height: '200px', objectFit: 'cover', border: '3px solid #000', borderRadius: '10px' },
  placeholder: { width: '300px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee', border: '3px dashed #ccc', borderRadius: '10px', color: '#aaa', fontWeight: 'bold' },
  btnAnexar: { padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '11px' }
}