import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function ClientEditModal({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [clientes, setClientes] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)

  const loadClientes = async () => {
    let query = supabase.from('Clientes').select('*').order('nome', { ascending: true })

    if (searchTerm.trim() !== '') {
      query = query.ilike('nome', `%${searchTerm}%`)
    }

    const { data, error } = await query.limit(50)
    if (!error) setClientes(data || [])
  }

  useEffect(() => {
    const timer = setTimeout(loadClientes, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('Clientes').update(selectedClient).eq('id', selectedClient.id)
    if (!error) {
      alert("CLIENTE ATUALIZADO!");
      onClose();
    } else {
      alert("Erro: " + error.message);
    }
    setLoading(false)
  }

  return (
    <div style={mStyles.overlay}>
      <div style={mStyles.modal}>
        <div style={mStyles.header}>
          <h2 style={mStyles.title}>{selectedClient ? 'EDITANDO: ' + selectedClient.nome : 'GERENCIAR CLIENTES'}</h2>
          <button onClick={onClose} style={mStyles.closeBtn}>FECHAR [X]</button>
        </div>

        <div style={mStyles.scroll}>
          {!selectedClient ? (
            <div style={{ padding: '10px' }}>
              <label style={mStyles.label}>PESQUISAR CLIENTE</label>
              <input 
                style={mStyles.input} 
                placeholder="Busque por nome ou CPF..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
              <div style={{ marginTop: '20px' }}>
                {clientes.map(c => (
                  <div key={c.id} onClick={() => setSelectedClient(c)} style={mStyles.listItem}>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <strong style={{fontSize: '16px'}}>{c.nome}</strong>
                        <span style={{fontSize: '12px', color: '#666'}}>
                          {c.cidade} | CPF/CNPJ: {c.cppf_cnpj} | IE: {c.inscricao || 'N/A'}
                        </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate} style={{padding: '10px'}}>
              <div style={mStyles.grid}>
                <div style={mStyles.field}><label style={mStyles.label}>NOME / RAZÃO SOCIAL</label>
                <input value={selectedClient.nome || ''} style={mStyles.input} onChange={e => setSelectedClient({...selectedClient, nome: e.target.value})} /></div>
                
                <div style={mStyles.field}><label style={mStyles.label}>CPF / CNPJ</label>
                <input value={selectedClient.cppf_cnpj || ''} style={mStyles.input} onChange={e => setSelectedClient({...selectedClient, cppf_cnpj: e.target.value})} /></div>

                {/* CAMPO NOVO: INSCRIÇÃO NA EDIÇÃO */}
                <div style={mStyles.field}><label style={mStyles.label}>INSCRIÇÃO ESTADUAL / MUN.</label>
                <input value={selectedClient.inscricao || ''} style={mStyles.input} onChange={e => setSelectedClient({...selectedClient, inscricao: e.target.value})} /></div>
                
                <div style={mStyles.field}><label style={mStyles.label}>CIDADE</label>
                <input value={selectedClient.cidade || ''} style={mStyles.input} onChange={e => setSelectedClient({...selectedClient, cidade: e.target.value})} /></div>
                
                <div style={mStyles.field}><label style={mStyles.label}>TELEFONE</label>
                <input value={selectedClient.num_telefone || ''} style={mStyles.input} onChange={e => setSelectedClient({...selectedClient, num_telefone: e.target.value})} /></div>
                
                <div style={mStyles.field}><label style={mStyles.label}>ENDEREÇO</label>
                <input value={selectedClient.endereco || ''} style={mStyles.input} onChange={e => setSelectedClient({...selectedClient, endereco: e.target.value})} /></div>

                <div style={mStyles.field}><label style={mStyles.label}>BAIRRO</label>
                <input value={selectedClient.bairro || ''} style={mStyles.input} onChange={e => setSelectedClient({...selectedClient, bairro: e.target.value})} /></div>

                <div style={mStyles.field}><label style={mStyles.label}>EMAIL</label>
                <input value={selectedClient.email || ''} style={mStyles.input} onChange={e => setSelectedClient({...selectedClient, email: e.target.value})} /></div>
              </div>
              <button type="submit" disabled={loading} style={mStyles.saveBtn}>{loading ? 'PROCESSANDO...' : 'SALVAR ALTERAÇÕES'}</button>
              <button type="button" onClick={() => setSelectedClient(null)} style={{...mStyles.saveBtn, backgroundColor: '#6B7280', marginTop: '10px'}}>VOLTAR PARA LISTA</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

const mStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modal: { backgroundColor: '#F3F4F6', width: '100%', maxWidth: '850px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', borderRadius: '15px', border: '3px solid #000', overflow: 'hidden' },
  header: { padding: '20px 30px', borderBottom: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: '18px', fontWeight: '900', color: '#111827' },
  closeBtn: { background: 'none', border: 'none', color: '#FF0000', cursor: 'pointer', fontWeight: 'bold' },
  scroll: { padding: '25px', overflowY: 'auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '800', color: '#4B5563' },
  input: { padding: '12px', backgroundColor: '#fff', border: '1px solid #D1D5DB', fontSize: '15px', borderRadius: '6px', width: '100%', boxSizing: 'border-box', outline: 'none' },
  saveBtn: { width: '100%', backgroundColor: '#EF4444', color: '#fff', border: 'none', padding: '18px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', borderRadius: '10px' },
  listItem: { padding: '15px', backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }
}