import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function ClientModal({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '', 
    cppf_cnpj: '', 
    inscricao: '', // NOVO CAMPO
    cidade: '', 
    endereco: '', 
    bairro: '', 
    num_telefone: '', 
    email: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('Clientes').insert([formData])
    if (error) {
      alert("Erro ao cadastrar: " + error.message)
    } else {
      alert("CLIENTE CADASTRADO COM SUCESSO!");
      onClose();
    }
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
              <div style={mStyles.field}>
                <label style={mStyles.label}>NOME / RAZÃO SOCIAL</label>
                <input name="nome" required style={mStyles.input} onChange={handleChange} placeholder="Nome do cliente" />
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>CPF / CNPJ</label>
                <input name="cppf_cnpj" style={mStyles.input} onChange={handleChange} placeholder="000.000.000-00" />
              </div>
              {/* CAMPO NOVO: INSCRIÇÃO */}
              <div style={mStyles.field}>
                <label style={mStyles.label}>INSCRIÇÃO ESTADUAL / MUN.</label>
                <input name="inscricao" style={mStyles.input} onChange={handleChange} placeholder="Isento ou Número" />
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>CIDADE</label>
                <input name="cidade" style={mStyles.input} onChange={handleChange} placeholder="Ex: Piraju" />
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>ENDEREÇO</label>
                <input name="endereco" style={mStyles.input} onChange={handleChange} placeholder="Rua, número" />
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>BAIRRO</label>
                <input name="bairro" style={mStyles.input} onChange={handleChange} placeholder="Bairro" />
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>TELEFONE</label>
                <input name="num_telefone" style={mStyles.input} onChange={handleChange} placeholder="(00) 00000-0000" />
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>EMAIL</label>
                <input name="email" type="email" style={mStyles.input} onChange={handleChange} placeholder="email@exemplo.com" />
              </div>
            </div>
          </div>
          <div style={mStyles.footer}>
            <button type="submit" disabled={loading} style={mStyles.saveBtn}>
              {loading ? 'GRAVANDO...' : 'SALVAR CLIENTE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const mStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '10px' },
  modal: { backgroundColor: '#F3F4F6', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '12px', border: '3px solid #000', overflow: 'hidden' },
  header: { padding: '20px 30px', borderBottom: '3px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: '18px', fontWeight: '900', color: '#111827' },
  closeBtn: { background: 'none', border: 'none', color: '#FF0000', cursor: 'pointer', fontWeight: 'bold' },
  form: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  scroll: { padding: '30px', overflowY: 'auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px' },
  input: { padding: '15px', backgroundColor: '#fff', border: '1px solid #D1D5DB', fontSize: '15px', borderRadius: '6px', width: '100%', boxSizing: 'border-box' },
  footer: { padding: '20px 30px', borderTop: '3px solid #000', backgroundColor: '#fff' },
  saveBtn: { width: '100%', backgroundColor: '#111827', color: '#fff', border: 'none', padding: '18px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', borderRadius: '8px' }
}