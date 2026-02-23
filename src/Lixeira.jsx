import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Lixeira({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [itensExcluidos, setItensExcluidos] = useState([])
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    buscarExcluidos()
  }, [])

  const buscarExcluidos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('Formulario')
      .select('*')
      .eq('status', 'Lixeira')
      .order('id', { ascending: false })
    
    if (data) setItensExcluidos(data)
    setLoading(false)
  }

  const restaurarProposta = async (id) => {
    const { error } = await supabase
      .from('Formulario')
      .update({ status: 'Enviar Proposta' })
      .eq('id', id)

    if (!error) {
      alert("PROPOSTA RESTAURADA COM SUCESSO!")
      buscarExcluidos()
    }
  }

  const excluirParaSempre = async (id) => {
    if (confirm("ATENÇÃO: ESTA AÇÃO É IRREVERSÍVEL. DESEJA EXCLUIR PARA SEMPRE?")) {
      const { error } = await supabase
        .from('Formulario')
        .delete()
        .eq('id', id)

      if (!error) {
        alert("PROPOSTA ELIMINADA DO SISTEMA.")
        buscarExcluidos()
      }
    }
  }

  // FILTRO DINÂMICO
  const listaFiltrada = itensExcluidos.filter(item => 
    item.Cliente?.toLowerCase().includes(filtro.toLowerCase()) ||
    item.Modelo?.toLowerCase().includes(filtro.toLowerCase()) ||
    item.id?.toString().includes(filtro)
  )

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '24px' }}>🗑️</span>
            <h2 style={{ fontWeight: '900', margin: 0 }}>LIXEIRA DO SISTEMA</h2>
          </div>
          <button onClick={onClose} style={s.closeBtn}>FECHAR [X]</button>
        </div>

        <div style={s.searchBar}>
          <label style={s.labelBold}>PESQUISAR NA LIXEIRA</label>
          <input 
            style={s.inputBusca} 
            placeholder="Buscar por cliente, modelo ou ID..." 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        <div style={s.scroll}>
          {loading ? (
            <center style={{fontWeight: '900', marginTop: '50px'}}>CARREGANDO...</center>
          ) : listaFiltrada.length === 0 ? (
            <center style={{ color: '#999', marginTop: '50px', fontWeight: '900' }}>NENHUM ITEM ENCONTRADO</center>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>ID</th>
                  <th style={s.th}>CLIENTE</th>
                  <th style={s.th}>MAQUINA / MODELO</th>
                  <th style={s.th}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map(item => (
                  <tr key={item.id} style={s.tr}>
                    <td style={s.td}><strong>#{item.id}</strong></td>
                    <td style={s.td}>{item.Cliente}</td>
                    <td style={s.td}>{item.Marca} {item.Modelo}</td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => restaurarProposta(item.id)} style={s.btnRestore}>RESTAURAR</button>
                        <button onClick={() => excluirParaSempre(item.id)} style={s.btnDelete}>EXCLUIR DEFINITIVO</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
  modal: { backgroundColor: '#F5F5DC', width: '95%', maxWidth: '900px', height: '85vh', borderRadius: '20px', border: '3px solid #000', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { padding: '20px 30px', backgroundColor: '#fff', borderBottom: '3px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  searchBar: { padding: '20px 30px', backgroundColor: '#eee', borderBottom: '1px solid #000' },
  inputBusca: { width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #000', fontWeight: '700', fontSize: '14px' },
  scroll: { padding: '20px', overflowY: 'auto', flex: 1 },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', border: '2px solid #000' },
  th: { textAlign: 'left', padding: '15px', backgroundColor: '#000', color: '#fff', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '15px', fontSize: '13px', fontWeight: '700', color: '#333' },
  labelBold: { fontSize: '10px', fontWeight: '900', color: '#000', marginBottom: '5px', display: 'block' },
  closeBtn: { border: 'none', background: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '14px' },
  btnRestore: { backgroundColor: '#10B981', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: '900', cursor: 'pointer', fontSize: '10px' },
  btnDelete: { backgroundColor: '#EF4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: '900', cursor: 'pointer', fontSize: '10px' }
}