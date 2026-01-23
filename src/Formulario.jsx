import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Formulario() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    Cliente: '', 'Cpf/Cpnj': '', Cidade: '', End_Entrega: '', 
    Qtd_Eqp: '', Marca: '', Modelo: '', 'Niname/NCM': '', 
    Configuracao: '', Prazo_Entrega: '', Valor_Total: '', 
    Condicoes: '', Valor_A_Vista: '', status: 'Enviar Proposta'
  })
  const [imageFile, setImageFile] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    let imageUrl = ''
    if (imageFile) {
      const fileName = `${Date.now()}_${imageFile.name}`
      const { data, error: uploadError } = await supabase.storage
        .from('equipamentos')
        .upload(fileName, imageFile)
      
      if (!uploadError) {
        const { data: publicUrl } = supabase.storage.from('equipamentos').getPublicUrl(fileName)
        imageUrl = publicUrl.publicUrl
      }
    }

    const { error } = await supabase.from('Formulario').insert([{ ...formData, Imagem_Equipamento: imageUrl }])
    
    setLoading(false)
    if (error) alert(error.message)
    else alert('Proposta enviada para o Kanban!')
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center' }}>📝 Nova Proposta Comercial</h2>
      <form onSubmit={handleSubmit} style={gridStyle}>
        <div>
          <label>Cliente</label>
          <input type="text" required onChange={e => setFormData({...formData, Cliente: e.target.value})} />
        </div>
        <div>
          <label>Data de Entrega</label>
          <input type="date" required onChange={e => setFormData({...formData, Prazo_Entrega: e.target.value})} />
        </div>
        <div>
          <label>Valor Total (R$)</label>
          <input type="number" step="0.01" placeholder="0,00" required onChange={e => setFormData({...formData, Valor_Total: e.target.value})} />
        </div>
        <div>
          <label>Imagem do Equipamento</label>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
        </div>
        {/* Adicione os outros campos seguindo o mesmo padrão */}
        <button type="submit" disabled={loading} style={submitBtn}>
          {loading ? 'Salvando...' : 'Cadastrar Proposta'}
        </button>
      </form>
    </div>
  )
}

const containerStyle = { maxWidth: '800px', margin: 'auto', background: '#fff', padding: '30px', borderRadius: '12px' }
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }
const submitBtn = { gridColumn: 'span 2', padding: '15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }