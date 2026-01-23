import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function ClientModal({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '', cppf_cnpj: '', cidade: '', endereco: '', bairro: '', num_telefone: '', email: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('Clientes').insert([formData])
    if (error) alert(error.message)
    else { alert("CLIENTE CADASTRADO!"); onClose(); }
    setLoading(false)
  }

  return (
    <div style={mStyles.overlay}>
      <div style={mStyles.modal}>
        <div style={mStyles.header}>
          <h2 style={mStyles.title}>CADASTRAR NOVO CLIENTE</h2>
          <button onClick={onClose} style={mStyles.closeBtn}>FECHAR [X]</button>
        </div>
        <form onSubmit={handleSave} style={mStyles.form}>
          <div style={mStyles.scroll}>
            <div style={mStyles.grid}>
              <div style={mStyles.field}><label style={mStyles.label}>NOME / RAZÃO SOCIAL</label><input name="nome" required style={mStyles.input} onChange={handleChange} /></div>
              <div style={mStyles.field}><label style={mStyles.label}>CPF / CNPJ</label><input name="cppf_cnpj" style={mStyles.input} onChange={handleChange} /></div>
              <div style={mStyles.field}><label style={mStyles.label}>CIDADE</label><input name="cidade" style={mStyles.input} onChange={handleChange} /></div>
              <div style={mStyles.field}><label style={mStyles.label}>ENDEREÇO</label><input name="endereco" style={mStyles.input} onChange={handleChange} /></div>
              {/* CAMPO NOVO: BAIRRO */}
              <div style={mStyles.field}><label style={mStyles.label}>BAIRRO</label><input name="bairro" style={mStyles.input} onChange={handleChange} /></div>
              <div style={mStyles.field}><label style={mStyles.label}>TELEFONE</label><input name="num_telefone" style={mStyles.input} onChange={handleChange} /></div>
            </div>
          </div>
          <div style={mStyles.footer}>
            <button type="submit" disabled={loading} style={mStyles.saveBtn}>{loading ? 'GRAVANDO...' : 'SALVAR CLIENTE'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const mStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '10px' },
  modal: { backgroundColor: '#E5E7EB', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '4px' },
  header: { padding: '20px 30px', borderBottom: '2px solid #D1D5DB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: '18px', fontWeight: '900', color: '#111827' },
  closeBtn: { background: 'none', border: 'none', color: '#FF0000', cursor: 'pointer', fontWeight: 'bold' },
  form: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  scroll: { padding: '30px', overflowY: 'auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: '800', color: '#4B5563' },
  input: { padding: '15px', backgroundColor: '#fff', border: '1px solid #D1D5DB', fontSize: '16px', borderRadius: '4px' },
  footer: { padding: '20px 30px', borderTop: '2px solid #D1D5DB', backgroundColor: '#fff' },
  saveBtn: { width: '100%', backgroundColor: '#111827', color: '#fff', border: 'none', padding: '18px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }
}