import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function EquipamentoModal({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  
  const anosRecentes = Array.from(
    { length: 22 }, 
    (_, i) => (new Date().getFullYear() + 1 - i).toString()
  )

  const [formData, setFormData] = useState({
    marca: '', 
    modelo: '', 
    descricao: '', 
    finame: '', 
    configuracao: '',
    ano: new Date().getFullYear().toString()
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const sanitizeFileName = (name) => {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.\-_]/g, '')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let imageUrl = ''
      
      if (file) {
        const cleanName = sanitizeFileName(file.name)
        const filePath = `equipamentos/${Math.random()}-${cleanName}`
        
        const { error: uploadError } = await supabase.storage.from('equipamentos').upload(filePath, file)
        if (uploadError) throw uploadError
        
        const { data } = supabase.storage.from('equipamentos').getPublicUrl(filePath)
        imageUrl = data.publicUrl
      }

      const { error } = await supabase.from('Equipamentos').insert([
        { 
          marca: formData.marca,
          modelo: formData.modelo,
          descricao: formData.descricao,
          finame: formData.finame,
          configuracao: formData.configuracao,
          ano: formData.ano,
          imagem: imageUrl 
        }
      ])
      
      if (error) throw error
      alert("EQUIPAMENTO CADASTRADO COM SUCESSO!");
      onClose();
    } catch (err) {
      alert("Erro ao salvar equipamento: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={mStyles.overlay}>
      <div style={mStyles.modal}>
        <div style={mStyles.header}>
          <h2 style={mStyles.title}>CADASTRAR EQUIPAMENTO</h2>
          <button onClick={onClose} style={mStyles.closeBtn}>FECHAR [X]</button>
        </div>
        <form onSubmit={handleSave} style={mStyles.form}>
          <div style={mStyles.scroll}>
            <div style={mStyles.grid}>
              <div style={mStyles.field}>
                <label style={mStyles.label}>MARCA</label>
                <input name="marca" required style={mStyles.input} onChange={handleChange} placeholder="Ex: Massey Ferguson" />
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>MODELO</label>
                <input name="modelo" required style={mStyles.input} onChange={handleChange} placeholder="Ex: MF 4275" />
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>ANO DE FABRICAÇÃO</label>
                <select name="ano" value={formData.ano} style={mStyles.input} onChange={handleChange}>
                  {anosRecentes.map(ano => (
                    <option key={ano} value={ano}>{ano}</option>
                  ))}
                </select>
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>FINAME / NCM</label>
                <input name="finame" style={mStyles.input} onChange={handleChange} placeholder="00000000" />
              </div>
            </div>

            <div style={{...mStyles.field, marginTop: '20px'}}>
               <label style={mStyles.label}>DESCRIÇÃO CURTA</label>
               <input name="descricao" placeholder="Ex: Trator Agrícola de Rodas" style={mStyles.input} onChange={handleChange} />
            </div>

            <div style={{...mStyles.field, marginTop: '20px'}}>
               <label style={mStyles.label}>FOTO DO EQUIPAMENTO</label>
               <input type="file" accept="image/*" required style={mStyles.input} onChange={(e) => setFile(e.target.files[0])} />
            </div>

            <div style={{...mStyles.field, marginTop: '20px'}}>
               <label style={mStyles.label}>CONFIGURAÇÃO PADRÃO (DETALHADA)</label>
               <textarea name="configuracao" rows="5" style={mStyles.input} onChange={handleChange} placeholder="Descreva os itens de série..."></textarea>
            </div>
          </div>
          <div style={mStyles.footer}>
            <button type="submit" disabled={loading} style={mStyles.saveBtn}>
              {loading ? 'GRAVANDO DADOS...' : 'SALVAR EQUIPAMENTO NO ESTOQUE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const mStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '10px' },
  modal: { backgroundColor: '#F3F4F6', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '12px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', border: '2px solid #000', overflow: 'hidden' },
  header: { padding: '20px 30px', borderBottom: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: '18px', fontWeight: '900', color: '#111827' },
  closeBtn: { background: 'none', border: 'none', color: '#FF0000', cursor: 'pointer', fontWeight: 'bold' },
  form: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  scroll: { padding: '30px', overflowY: 'auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px' },
  input: { padding: '12px', backgroundColor: '#fff', border: '1px solid #D1D5DB', fontSize: '15px', borderRadius: '4px', width: '100%', boxSizing: 'border-box', outline: 'none' },
  footer: { padding: '20px 30px', borderTop: '2px solid #000', backgroundColor: '#fff' },
  saveBtn: { width: '100%', backgroundColor: '#EF4444', color: '#fff', border: 'none', padding: '18px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', borderRadius: '8px' }
}