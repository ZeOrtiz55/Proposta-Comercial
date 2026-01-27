import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function EquipamentoEditModal({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [file, setFile] = useState(null)
  const [localPreview, setLocalPreview] = useState(null)

  const anosRecentes = Array.from({ length: 25 }, (_, i) => (new Date().getFullYear() + 1 - i).toString())

  const loadEquipamentos = async () => {
    let query = supabase.from('Equipamentos').select('*').order('modelo', { ascending: true })
    if (searchTerm.trim() !== '') {
      query = query.ilike('modelo', `%${searchTerm}%`)
    }
    const { data, error } = await query.limit(50)
    if (!error) setResults(data || [])
  }

  useEffect(() => {
    const timer = setTimeout(loadEquipamentos, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Função para sanitizar o nome do arquivo (evita erro de Invalid Key)
  const sanitizeFileName = (name) => {
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '')
  }

  // Quando o usuário escolhe uma foto nova, gera um preview local
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setLocalPreview(URL.createObjectURL(selectedFile))
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let imageUrl = selectedItem.imagem

      // Se houver um novo arquivo, faz o upload
      if (file) {
        const cleanName = sanitizeFileName(file.name)
        const filePath = `equipamentos/${Math.random()}-${cleanName}`
        const { error: uploadError } = await supabase.storage.from('equipamentos').upload(filePath, file)
        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('equipamentos').getPublicUrl(filePath)
        imageUrl = data.publicUrl
      }

      const { error } = await supabase.from('Equipamentos')
        .update({
          marca: selectedItem.marca,
          modelo: selectedItem.modelo,
          descricao: selectedItem.descricao,
          finame: selectedItem.finame,
          configuracao: selectedItem.configuracao,
          ano: selectedItem.ano,
          imagem: imageUrl
        })
        .eq('id', selectedItem.id)

      if (error) throw error
      alert("EQUIPAMENTO ATUALIZADO COM SUCESSO!");
      onClose();
    } catch (err) {
      alert("Erro ao salvar: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={mStyles.overlay}>
      <div style={mStyles.modal}>
        <div style={mStyles.header}>
          <h2 style={mStyles.title}>{selectedItem ? 'EDITAR: ' + selectedItem.modelo : 'GERENCIAR ESTOQUE'}</h2>
          <button onClick={onClose} style={mStyles.closeBtn}>FECHAR [X]</button>
        </div>

        <div style={mStyles.scroll}>
          {!selectedItem ? (
            <div style={{ padding: '10px' }}>
              <label style={mStyles.label}>PESQUISAR OU SELECIONAR DA LISTA</label>
              <input 
                style={mStyles.input} 
                placeholder="Busque por modelo ou marca..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
              <div style={{ marginTop: '20px' }}>
                {results.map(eq => (
                  <div key={eq.id} onClick={() => { setSelectedItem(eq); setLocalPreview(null); setFile(null); }} style={mStyles.listItem}>
                    <img src={eq.imagem} style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} alt="" />
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <span style={{fontWeight: '900', fontSize: '15px'}}>{eq.marca} {eq.modelo}</span>
                        <span style={{fontSize: '11px', color: '#666'}}>ANO: {eq.ano} | ID: {eq.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate} style={{padding: '10px'}}>
              {/* ÁREA DA FOTO */}
              <div style={mStyles.photoSection}>
                <label style={mStyles.label}>FOTO DO EQUIPAMENTO</label>
                <div style={mStyles.imageContainer}>
                   <img 
                    src={localPreview || selectedItem.imagem} 
                    style={mStyles.bigPreview} 
                    alt="Preview" 
                   />
                   <div style={mStyles.fileInputWrapper}>
                     <input type="file" accept="image/*" onChange={handleFileChange} style={mStyles.fileInput} />
                     <button type="button" style={mStyles.fileBtn}>ALTERAR IMAGEM</button>
                   </div>
                </div>
                {file && <p style={{fontSize: '10px', color: '#10B981', fontWeight: 'bold', marginTop: '5px'}}>✓ Nova imagem selecionada: {file.name}</p>}
              </div>

              <div style={mStyles.grid}>
                <div style={mStyles.field}><label style={mStyles.label}>MARCA</label>
                <input value={selectedItem.marca || ''} style={mStyles.input} onChange={e => setSelectedItem({...selectedItem, marca: e.target.value})} /></div>
                
                <div style={mStyles.field}><label style={mStyles.label}>MODELO</label>
                <input value={selectedItem.modelo || ''} style={mStyles.input} onChange={e => setSelectedItem({...selectedItem, modelo: e.target.value})} /></div>
                
                <div style={mStyles.field}><label style={mStyles.label}>ANO</label>
                  <select value={selectedItem.ano || ''} style={mStyles.input} onChange={e => setSelectedItem({...selectedItem, ano: e.target.value})}>
                    {anosRecentes.map(ano => <option key={ano} value={ano}>{ano}</option>)}
                  </select>
                </div>
                
                <div style={mStyles.field}><label style={mStyles.label}>FINAME / NCM</label>
                <input value={selectedItem.finame || ''} style={mStyles.input} onChange={e => setSelectedItem({...selectedItem, finame: e.target.value})} /></div>
              </div>

              <div style={{...mStyles.field, marginTop: '20px'}}>
                <label style={mStyles.label}>DESCRIÇÃO CURTA</label>
                <input value={selectedItem.descricao || ''} style={mStyles.input} onChange={e => setSelectedItem({...selectedItem, descricao: e.target.value})} />
              </div>

              <div style={{...mStyles.field, marginTop: '20px'}}>
                <label style={mStyles.label}>CONFIGURAÇÃO DETALHADA</label>
                <textarea rows="6" value={selectedItem.configuracao || ''} style={mStyles.input} onChange={e => setSelectedItem({...selectedItem, configuracao: e.target.value})} />
              </div>

              <button type="submit" disabled={loading} style={mStyles.saveBtn}>{loading ? 'PROCESSANDO...' : 'SALVAR TODAS AS ALTERAÇÕES'}</button>
              <button type="button" onClick={() => setSelectedItem(null)} style={{...mStyles.saveBtn, backgroundColor: '#6B7280', marginTop: '10px'}}>VOLTAR PARA LISTA</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

const mStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modal: { backgroundColor: '#F3F4F6', width: '95%', maxWidth: '850px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', borderRadius: '15px', border: '3px solid #000', overflow: 'hidden' },
  header: { padding: '20px 30px', borderBottom: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: '18px', fontWeight: '900', color: '#111827' },
  closeBtn: { background: 'none', border: 'none', color: '#FF0000', cursor: 'pointer', fontWeight: 'bold' },
  scroll: { padding: '25px', overflowY: 'auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '800', color: '#4B5563', textTransform: 'uppercase' },
  input: { padding: '12px', backgroundColor: '#fff', border: '1px solid #D1D5DB', fontSize: '15px', borderRadius: '6px', width: '100%', boxSizing: 'border-box', outline: 'none' },
  saveBtn: { width: '100%', backgroundColor: '#EF4444', color: '#fff', border: 'none', padding: '18px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', borderRadius: '10px' },
  listItem: { padding: '15px', backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px', transition: '0.2s' },
  
  // ESTILOS DE FOTO
  photoSection: { marginBottom: '25px', backgroundColor: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #D1D5DB' },
  imageContainer: { display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' },
  bigPreview: { width: '150px', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '3px solid #000' },
  fileInputWrapper: { position: 'relative', overflow: 'hidden', display: 'inline-block' },
  fileInput: { position: 'absolute', fontSize: '100px', right: 0, top: 0, opacity: 0, cursor: 'pointer' },
  fileBtn: { backgroundColor: '#1E293B', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }
}