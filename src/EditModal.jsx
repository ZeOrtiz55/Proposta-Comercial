import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import jsPDF from 'jspdf'

export default function EditModal({ proposal, onClose }) {
  const [formData, setFormData] = useState(proposal || {})
  const [imagePreview, setImagePreview] = useState(proposal?.Imagem_Equipamento || '')
  const [assinaturaDiretor, setAssinaturaDiretor] = useState(null)
  
  // ESTADOS PARA HISTÓRICO E FÁBRICA
  const [history, setHistory] = useState([])
  const [newNote, setNewNote] = useState('')
  const [factoryData, setFactoryData] = useState(null)

  useEffect(() => {
    if (proposal) {
      setFormData({ ...proposal })
      setImagePreview(proposal.Imagem_Equipamento)
      fetchConfig()
      fetchHistory()
      // Gatilho para buscar info da fábrica se o ID existir
      if (proposal.id_fabrica_ref) {
        fetchFactoryInfo(proposal.id_fabrica_ref)
      } else {
        setFactoryData(null) // Limpa se for uma proposta direta
      }
    }
  }, [proposal])

  const fetchConfig = async () => {
    const { data } = await supabase.from('Configuracoes').select('assinatura_url').single()
    if (data) setAssinaturaDiretor(data.assinatura_url)
  }

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('Historico')
      .select('*')
      .eq('proposal_id', proposal.id)
      .order('created_at', { ascending: false })
    
    if (error) console.error("Erro histórico:", error)
    if (data) setHistory(data)
  }

  const fetchFactoryInfo = async (idRef) => {
    const { data, error } = await supabase
      .from('Proposta_Fabrica')
      .select('*')
      .eq('id', idRef)
      .single()
    
    if (error) console.error("Erro fábrica:", error)
    if (data) setFactoryData(data)
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    const { error } = await supabase
      .from('Historico')
      .insert([{ proposal_id: proposal.id, texto: newNote }])
    
    if (!error) {
      setNewNote('')
      fetchHistory()
    }
  }

  const getImageDimensions = (url) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.onerror = () => resolve({ width: 100, height: 50 }) // Fallback
      img.src = url
    })
  }

  // --- PDF COMPLETO RESTAURADO ---
  const handlePrint = async () => {
    const doc = new jsPDF()
    const margin = 15
    const pageWidth = doc.internal.pageSize.getWidth()
    const innerWidth = pageWidth - (margin * 2)
    let y = 15

    // CABEÇALHO
    doc.setFillColor(239, 68, 68); doc.rect(0, 0, pageWidth, 20, 'F')
    doc.setTextColor(255); doc.setFontSize(14); doc.setFont("helvetica", "bold")
    doc.text("NOVA TRATORES MÁQUINAS AGRÍCOLAS LTDA.", margin, 12)
    doc.setFontSize(8); doc.text("CONCESSIONÁRIA AUTORIZADA", margin, 17)

    y = 30; doc.setTextColor(0); doc.setFontSize(12)
    doc.text(`PROPOSTA COMERCIAL | Nº ${formData.id || ''}`, margin, y)
    doc.setFontSize(9); doc.text(`DATA: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin - 35, y)

    // GRADE I: CLIENTE
    y += 8; doc.setDrawColor(0); doc.setLineWidth(0.5)
    doc.rect(margin, y, innerWidth, 30)
    doc.line(margin, y + 8, margin + innerWidth, y + 8)
    doc.setFont("helvetica", "bold"); doc.text("I. DADOS DO CLIENTE", margin + 2, y + 5)
    doc.setFontSize(9); doc.setFont("helvetica", "normal")
    doc.text(`CLIENTE: ${formData.Cliente || ''}`, margin + 5, y + 14)
    doc.text(`CPF/CNPJ: ${formData['Cpf/Cpnj'] || ''}`, margin + 5, y + 21)
    doc.text(`ENDEREÇO: ${formData.End_Entrega || ''}`, margin + 5, y + 27)
    doc.text(`CIDADE/UF: ${formData.Cidade || ''}`, pageWidth / 2 + 10, y + 14)
    doc.text(`BAIRRO: ${formData.Bairro || ''}`, pageWidth / 2 + 10, y + 21)

    // GRADE II: IMAGEM PROPORCIONAL
    y += 35; doc.rect(margin, y, innerWidth, 65)
    doc.line(margin, y + 8, margin + innerWidth, y + 8)
    doc.setFont("helvetica", "bold"); doc.text("II. VISUALIZAÇÃO DO EQUIPAMENTO", margin + 2, y + 5)
    if (formData.Imagem_Equipamento) {
      const dims = await getImageDimensions(formData.Imagem_Equipamento)
      const ratio = dims.width / dims.height; let imgW = 110; let imgH = imgW / ratio
      if (imgH > 52) { imgH = 52; imgW = imgH * ratio }
      doc.addImage(formData.Imagem_Equipamento, 'JPEG', (pageWidth - imgW) / 2, y + 10, imgW, imgH)
    }

    // GRADE III: TÉCNICO
    y += 70; doc.rect(margin, y, innerWidth, 50)
    doc.line(margin, y + 8, margin + innerWidth, y + 8)
    doc.setFont("helvetica", "bold"); doc.text("III. ESPECIFICAÇÕES TÉCNICAS", margin + 2, y + 5)
    doc.setFontSize(9); doc.setFont("helvetica", "normal")
    doc.text(`MARCA: ${formData.Marca || ''}`, margin + 5, y + 15)
    doc.text(`MODELO: ${formData.Modelo || ''}`, margin + 5, y + 22)
    doc.text(`ANO: ${formData.Ano || ''}`, margin + 5, y + 29)
    doc.text(`NCM: ${formData['Niname/NCM'] || ''}`, pageWidth / 2 + 10, y + 15)
    doc.text(`QTD: ${formData.Qtd_Eqp || '1'}`, pageWidth / 2 + 10, y + 22)
    doc.setFont("helvetica", "bold"); doc.text("DESCRIÇÃO TÉCNICA:", margin + 5, y + 38)
    doc.setFont("helvetica", "normal")
    const configTxt = formData.Configuracao || formData.Descricao || ''
    const splitConfig = doc.splitTextToSize(configTxt, innerWidth - 10)
    doc.text(splitConfig, margin + 5, y + 43)

    // FRASE AMARELA
    y += 58; const frase = "CASO SEJA FINANCIADO TAXA FLAT POR CONTA DO CLIENTE"
    const tw = doc.getTextWidth(frase); doc.setFillColor(255, 255, 0)
    doc.rect((pageWidth - tw) / 2 - 2, y - 5, tw + 4, 8, 'F')
    doc.setFont("helvetica", "bold"); doc.text(frase, pageWidth / 2, y, { align: "center" })

    // GRADE IV: FINANCEIRO
    y += 12; doc.rect(margin, y, innerWidth, 25)
    doc.line(margin, y + 8, margin + innerWidth, y + 8)
    doc.text("IV. CONDIÇÕES FINANCEIRAS", margin + 2, y + 5)
    doc.text(`VALOR TOTAL: R$ ${formData.Valor_Total || '0,00'}`, margin + 5, y + 15)
    doc.setTextColor(16, 185, 129); doc.text(`VALOR À VISTA: R$ ${formData.Valor_A_Vista || '0,00'}`, margin + 5, y + 22)
    doc.setTextColor(0); doc.text(`PRAZO ENTREGA: ${formData.Prazo_Entrega || '0'} DIAS`, pageWidth / 2 + 10, y + 15)
    doc.text(`CONDIÇÕES: ${formData.Condicoes || ''}`, pageWidth / 2 + 10, y + 22)

    // ASSINATURAS
    y = 260; const lineW = 80; const midPoint = margin + (lineW / 2)
    doc.line(margin, y, margin + lineW, y); doc.setFontSize(7)
    doc.text(`${formData.Cliente || ''}`.toUpperCase(), midPoint, y + 5, { align: "center" })
    doc.text(`CPF/CNPJ: ${formData['Cpf/Cpnj'] || ''}`, midPoint, y + 9, { align: "center" })

    doc.line(pageWidth - margin - lineW, y, pageWidth - margin, y)
    if (assinaturaDiretor) { doc.addImage(assinaturaDiretor, 'PNG', pageWidth - margin - lineW, y, lineW, 20) }

    doc.save(`Proposta_${formData.Cliente || 'NovaTratores'}.pdf`)
  }

  const handleUpdate = async () => {
    const { error } = await supabase.from('Formulario').update(formData).eq('id', proposal.id)
    if (!error) { alert("ATUALIZADO!"); window.location.reload(); }
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '4px', height: '25px', backgroundColor: '#EF4444' }}></div>
            <div>
              <h2 style={{ fontWeight: '900', color: '#000', margin: 0 }}>PROPOSTA CLIENTE #{formData.id}</h2>
              {formData.id_fabrica_ref && <span style={s.factoryTag}>✓ ORIGEM FÁBRICA #{formData.id_fabrica_ref}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={handlePrint} style={s.btnPrint}>IMPRIMIR PDF</button>
            <button onClick={onClose} style={s.closeBtn}>FECHAR [X]</button>
          </div>
        </div>

        <div style={s.scroll}>
          <div style={s.vList}>
            {/* PAINEL INFORMATIVO DA FÁBRICA */}
            {factoryData && (
              <div style={s.factoryBox}>
                <div style={s.factoryTitle}>DADOS VINCULADOS AO PEDIDO DE FÁBRICA</div>
                <div style={s.factoryGrid}>
                   <div><strong>VENDEDOR FÁBRICA:</strong> {factoryData.vendedor_fab}</div>
                   <div><strong>STATUS NA FÁBRICA:</strong> {factoryData.status}</div>
                   <div><strong>VALOR FINAL FÁBRICA:</strong> R$ {factoryData.valor_final}</div>
                </div>
              </div>
            )}

            <div style={s.sectionTitle}>I. DADOS DO CLIENTE</div>
            <div style={s.gridContainer}>
              <div style={s.row}>
                <div style={s.cell}><label style={s.label}>NOME</label><input value={formData.Cliente || ''} onChange={e => setFormData({ ...formData, Cliente: e.target.value })} style={s.input} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>CPF / CNPJ</label><input value={formData['Cpf/Cpnj'] || ''} onChange={e => setFormData({ ...formData, 'Cpf/Cpnj': e.target.value })} style={s.input} /></div>
              </div>
              <div style={s.row}>
                <div style={s.cell}><label style={s.label}>CIDADE</label><input value={formData.Cidade || ''} onChange={e => setFormData({ ...formData, Cidade: e.target.value })} style={s.input} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>ENDEREÇO</label><input value={formData.End_Entrega || ''} onChange={e => setFormData({ ...formData, End_Entrega: e.target.value })} style={s.input} /></div>
              </div>
            </div>

            <div style={s.sectionTitle}>II. EQUIPAMENTO</div>
            <center>{imagePreview && <img src={imagePreview} style={s.imgPreview} alt="Preview" />}</center>
            <div style={s.gridContainer}>
              <div style={s.row}>
                <div style={s.cell}><label style={s.label}>MARCA</label><input value={formData.Marca || ''} onChange={e => setFormData({ ...formData, Marca: e.target.value })} style={s.input} /></div>
                <div style={s.cell}><label style={s.label}>MODELO</label><input value={formData.Modelo || ''} onChange={e => setFormData({ ...formData, Modelo: e.target.value })} style={s.input} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>ANO</label><input value={formData.Ano || ''} onChange={e => setFormData({ ...formData, Ano: e.target.value })} style={s.input} /></div>
              </div>
              <div style={s.row}>
                <div style={s.cell}><label style={s.label}>NCM / FINAME</label><input value={formData['Niname/NCM'] || ''} onChange={e => setFormData({ ...formData, 'Niname/NCM': e.target.value })} style={s.input} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>QTD</label><input value={formData.Qtd_Eqp || ''} onChange={e => setFormData({ ...formData, Qtd_Eqp: e.target.value })} style={s.input} /></div>
              </div>
              <div style={s.row}>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>DESCRIÇÃO TÉCNICA</label><textarea value={formData.Configuracao || formData.Descricao || ''} onChange={e => setFormData({ ...formData, Configuracao: e.target.value })} style={s.textarea} /></div>
              </div>
            </div>

            <div style={s.sectionTitle}>III. FINANCEIRO</div>
            <div style={s.gridContainer}>
              <div style={s.row}>
                <div style={s.cell}><label style={s.label}>VALOR TOTAL</label><input value={formData.Valor_Total || ''} onChange={e => setFormData({ ...formData, Valor_Total: e.target.value })} style={{ ...s.input, color: 'red' }} /></div>
                <div style={s.cell}><label style={s.label}>À VISTA</label><input value={formData.Valor_A_Vista || ''} onChange={e => setFormData({ ...formData, Valor_A_Vista: e.target.value })} style={{ ...s.input, color: 'green' }} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>PRAZO ENTREGA</label><input value={formData.Prazo_Entrega || ''} onChange={e => setFormData({ ...formData, Prazo_Entrega: e.target.value })} style={s.input} /></div>
              </div>
              <div style={s.row}>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>CONDIÇÕES DE PAGAMENTO</label><input value={formData.Condicoes || ''} onChange={e => setFormData({ ...formData, Condicoes: e.target.value })} style={s.input} /></div>
              </div>
            </div>

            {/* IV. HISTÓRICO - CORREÇÃO DE FUNCIONALIDADE */}
            <div style={s.sectionTitle}>IV. HISTÓRICO DE INTERAÇÕES</div>
            <div style={s.historyContainer}>
               <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                  <textarea placeholder="Adicionar nota..." value={newNote} onChange={e => setNewNote(e.target.value)} style={s.noteTextarea} />
                  <button onClick={handleAddNote} style={s.btnAddNote}>SALVAR</button>
               </div>
               <div style={s.historyList}>
                  {history.length === 0 ? <p style={{fontSize: '11px', color: '#999'}}>Nenhuma nota registrada.</p> : 
                    history.map(item => (
                      <div key={item.id} style={s.historyItem}>
                          <span style={s.historyDate}>{new Date(item.created_at).toLocaleString('pt-BR')}</span>
                          <div style={s.historyText}>{item.texto}</div>
                      </div>
                    ))
                  }
               </div>
            </div>
          </div>
        </div>

        <div style={s.footer}>
          <button onClick={handleUpdate} style={s.btnMain}>SALVAR ALTERAÇÕES NA PROPOSTA</button>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modal: { backgroundColor: '#F5F5DC', width: '95%', maxWidth: '1100px', height: '95vh', borderRadius: '20px', display: 'flex', flexDirection: 'column', border: '3px solid #000', overflow: 'hidden' },
  header: { padding: '20px 40px', backgroundColor: '#fff', borderBottom: '3px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  factoryTag: { color: '#10B981', fontSize: '9px', fontWeight: '900', display: 'block' },
  scroll: { padding: '30px 40px', overflowY: 'auto', flex: 1 },
  vList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionTitle: { fontSize: '12px', fontWeight: '900', color: '#EF4444', textTransform: 'uppercase' },
  gridContainer: { border: '2px solid #000', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff' },
  row: { display: 'flex', borderBottom: '1px solid #eee' },
  cell: { flex: 1, padding: '12px 15px', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '9px', fontWeight: '800', color: '#94a3b8' },
  input: { border: 'none', outline: 'none', fontSize: '15px', fontWeight: '700', color: '#000', background: 'none', width: '100%' },
  textarea: { border: 'none', outline: 'none', fontSize: '14px', width: '100%', minHeight: '80px', background: 'none', resize: 'none', fontWeight: '600' },
  imgPreview: { width: '320px', border: '4px solid #000', borderRadius: '12px', marginBottom: '15px' },
  historyContainer: { backgroundColor: '#fff', border: '2px solid #000', borderRadius: '10px', padding: '20px' },
  noteTextarea: { flex: 1, minHeight: '60px', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', fontSize: '13px' },
  btnAddNote: { padding: '0 25px', backgroundColor: '#000', color: '#fff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  historyList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  historyItem: { padding: '10px', borderLeft: '4px solid #EF4444', backgroundColor: '#f9f9f9' },
  historyDate: { fontSize: '10px', color: '#666', fontWeight: 'bold' },
  historyText: { fontSize: '13px', fontWeight: '600', marginTop: '3px' },
  factoryBox: { backgroundColor: '#F0FDF4', border: '2px solid #10B981', borderRadius: '10px', padding: '15px' },
  factoryTitle: { fontSize: '10px', fontWeight: '900', color: '#059669', marginBottom: '10px' },
  factoryGrid: { display: 'flex', gap: '40px', fontSize: '13px', fontWeight: '700' },
  footer: { padding: '20px 40px', backgroundColor: '#fff', borderTop: '3px solid #000' },
  btnMain: { width: '100%', padding: '18px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' },
  btnPrint: { padding: '12px 25px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' },
  closeBtn: { border: 'none', background: 'none', color: '#000', fontWeight: '900', cursor: 'pointer' }
}