import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import jsPDF from 'jspdf'

export default function EditModal({ proposal, onClose }) {
  const [formData, setFormData] = useState(proposal || {})
  const [imagePreview, setImagePreview] = useState(proposal?.Imagem_Equipamento || '')
  const [assinaturaDiretor, setAssinaturaDiretor] = useState(null)

  useEffect(() => {
    if (proposal) {
      setFormData({ ...proposal })
      setImagePreview(proposal.Imagem_Equipamento)
      
      const fetchConfig = async () => {
        const { data } = await supabase.from('Configuracoes').select('assinatura_url').single()
        if (data) setAssinaturaDiretor(data.assinatura_url)
      }
      fetchConfig()
    }
  }, [proposal])

  // FUNÇÃO PARA CARREGAR IMAGEM E OBTER DIMENSÕES (ESSENCIAL PARA PROPORÇÃO)
  const getImageDimensions = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.onerror = reject
      img.src = url
    })
  }

  const handlePrint = async () => {
    const doc = new jsPDF()
    const margin = 15
    const pageWidth = doc.internal.pageSize.getWidth()
    const innerWidth = pageWidth - (margin * 2)
    let y = 15

    // --- CABEÇALHO ---
    doc.setFillColor(239, 68, 68) 
    doc.rect(0, 0, pageWidth, 20, 'F')
    doc.setTextColor(255)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("NOVA TRATORES MÁQUINAS AGRÍCOLAS LTDA.", margin, 12)
    doc.setFontSize(8)
    doc.text("CONCESSIONÁRIA AUTORIZADA", margin, 17)

    y = 30
    doc.setTextColor(0)
    doc.setFontSize(12)
    doc.text(`PROPOSTA COMERCIAL | Nº ${formData.id || ''}`, margin, y)
    doc.setFontSize(9)
    doc.text(`DATA: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin - 30, y)

    // --- GRADE 1: DADOS DO CLIENTE ---
    y += 8
    doc.setDrawColor(0)
    doc.setLineWidth(0.5)
    doc.rect(margin, y, innerWidth, 30)
    doc.line(margin, y + 8, margin + innerWidth, y + 8)
    doc.setFont("helvetica", "bold")
    doc.text("I. DADOS DO CLIENTE", margin + 2, y + 5)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`CLIENTE: ${formData.Cliente || ''}`, margin + 5, y + 14)
    doc.text(`CPF/CNPJ: ${formData['Cpf/Cpnj'] || ''}`, margin + 5, y + 21)
    doc.text(`ENDEREÇO: ${formData.End_Entrega || ''}`, margin + 5, y + 27)
    doc.text(`CIDADE/UF: ${formData.Cidade || ''}`, pageWidth / 2 + 10, y + 14)
    doc.text(`BAIRRO: ${formData.Bairro || ''}`, pageWidth / 2 + 10, y + 21)

    // --- GRADE 2: IMAGEM DO EQUIPAMENTO (PROPORCIONAL) ---
    y += 35
    doc.rect(margin, y, innerWidth, 65)
    doc.line(margin, y + 8, margin + innerWidth, y + 8)
    doc.setFont("helvetica", "bold")
    doc.text("II. VISUALIZAÇÃO DO EQUIPAMENTO", margin + 2, y + 5)
    
    if (formData.Imagem_Equipamento) {
      try {
        const dims = await getImageDimensions(formData.Imagem_Equipamento)
        const ratio = dims.width / dims.height
        let imgW = 100
        let imgH = imgW / ratio
        
        // Limita a altura para não sair da grade
        if (imgH > 50) {
          imgH = 50
          imgW = imgH * ratio
        }
        
        const centerX = (pageWidth - imgW) / 2
        doc.addImage(formData.Imagem_Equipamento, 'JPEG', centerX, y + 12, imgW, imgH)
      } catch (e) {
        doc.text("Preview do Equipamento", pageWidth / 2, y + 35, { align: "center" })
      }
    }

    // --- GRADE 3: ESPECIFICAÇÕES TÉCNICAS ---
    y += 70
    doc.rect(margin, y, innerWidth, 50)
    doc.line(margin, y + 8, margin + innerWidth, y + 8)
    doc.setFont("helvetica", "bold")
    doc.text("III. ESPECIFICAÇÕES TÉCNICAS", margin + 2, y + 5)
    doc.setFont("helvetica", "normal")
    doc.text(`MARCA: ${formData.Marca || ''}`, margin + 5, y + 15)
    doc.text(`MODELO: ${formData.Modelo || ''}`, margin + 5, y + 22)
    doc.text(`ANO: ${formData.Ano || ''}`, margin + 5, y + 29)
    doc.text(`NCM: ${formData['Niname/NCM'] || ''}`, pageWidth / 2 + 10, y + 15)
    doc.text(`QTD: ${formData.Qtd_Eqp || '1'}`, pageWidth / 2 + 10, y + 22)
    
    doc.setFont("helvetica", "bold")
    doc.text("DESCRIÇÃO TÉCNICA:", margin + 5, y + 38)
    doc.setFont("helvetica", "normal")
    const configTxt = formData.Configuracao || formData.Descricao || '';
    const splitConfig = doc.splitTextToSize(configTxt, innerWidth - 10)
    doc.text(splitConfig, margin + 5, y + 43)

    // --- FRASE AMARELA ---
    y += 58
    const frase = "CASO SEJA FINANCIADO TAXA FLAT POR CONTA DO CLIENTE"
    doc.setFont("helvetica", "bold")
    const tw = doc.getTextWidth(frase)
    doc.setFillColor(255, 255, 0)
    doc.rect((pageWidth - tw) / 2 - 2, y - 5, tw + 4, 8, 'F')
    doc.text(frase, pageWidth / 2, y, { align: "center" })

    // --- GRADE 4: FINANCEIRO ---
    y += 12
    doc.rect(margin, y, innerWidth, 25)
    doc.line(margin, y + 8, margin + innerWidth, y + 8)
    doc.text("IV. CONDIÇÕES FINANCEIRAS", margin + 2, y + 5)
    doc.text(`VALOR TOTAL: R$ ${formData.Valor_Total || '0,00'}`, margin + 5, y + 15)
    doc.setTextColor(16, 185, 129)
    doc.text(`VALOR À VISTA: R$ ${formData.Valor_A_Vista || '0,00'}`, margin + 5, y + 22)
    doc.setTextColor(0)
    doc.text(`PRAZO ENTREGA: ${formData.Prazo_Entrega || '0'} DIAS`, pageWidth / 2 + 10, y + 15)
    doc.text(`CONDIÇÕES: ${formData.Condicoes || ''}`, pageWidth / 2 + 10, y + 22)

    // --- ÁREA DE ASSINATURAS ---
    y = 260
    const lineW = 80
    
    // Cliente (Esquerda) - Centralizado sob a linha
    doc.line(margin, y, margin + lineW, y)
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    const midPoint = margin + (lineW / 2)
    doc.text(`${formData.Cliente || ''}`.toUpperCase(), midPoint, y + 5, { align: "center" })
    doc.setFont("helvetica", "normal")
    doc.text(`CPF/CNPJ: ${formData['Cpf/Cpnj'] || ''}`, midPoint, y + 9, { align: "center" })
    doc.text(`${formData.End_Entrega || ''} - ${formData.Cidade || ''}`, midPoint, y + 13, { align: "center" })

    // Diretor (Direita) - Alinhado pelo topo na linha
    doc.line(pageWidth - margin - lineW, y, pageWidth - margin, y)
    if (assinaturaDiretor) {
      try {
        // A imagem começa em Y (em cima da linha) e desce 20 unidades
        doc.addImage(assinaturaDiretor, 'PNG', pageWidth - margin - lineW, y, lineW, 20)
      } catch (e) {
        doc.text("NOVA TRATORES", pageWidth - margin - (lineW/2), y + 5, { align: "center" })
      }
    } else {
        doc.text("NOVA TRATORES", pageWidth - margin - (lineW/2), y + 5, { align: "center" })
    }

    doc.save(`Proposta_${formData.Cliente || 'NovaTratores'}.pdf`)
  }

  const handleUpdate = async () => {
    const { error } = await supabase.from('Formulario').update(formData).eq('id', proposal.id)
    if (!error) {
      alert("ATUALIZADO COM SUCESSO!")
      // Em vez de reload total, apenas feche ou atualize o estado local se preferir
      window.location.reload() 
    } else {
      alert("Erro ao atualizar: " + error.message)
    }
  }

  if (!proposal) return null

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '4px', height: '25px', backgroundColor: '#EF4444' }}></div>
            <h2 style={{ fontWeight: '900', color: '#000', margin: 0 }}>EDIÇÃO | PROPOSTA #{formData.id}</h2>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handlePrint} style={s.btnPrint}>GERAR PDF</button>
            <button onClick={onClose} style={s.closeBtn}>FECHAR [X]</button>
          </div>
        </div>

        <div style={s.scroll}>
          <div style={s.vList}>
            <div style={s.sectionTitle}>I. DADOS DO CLIENTE</div>
            <div style={s.gridContainer}>
              <div style={s.row}>
                <div style={s.cell}><label style={s.label}>NOME DO CLIENTE</label><input value={formData.Cliente || ''} onChange={e => setFormData({ ...formData, Cliente: e.target.value })} style={s.input} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>CPF / CNPJ</label><input value={formData['Cpf/Cpnj'] || ''} onChange={e => setFormData({ ...formData, 'Cpf/Cpnj': e.target.value })} style={s.input} /></div>
              </div>
              <div style={s.row}>
                <div style={s.cell}><label style={s.label}>CIDADE / UF</label><input value={formData.Cidade || ''} onChange={e => setFormData({ ...formData, Cidade: e.target.value })} style={s.input} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>ENDEREÇO COMPLETO</label><input value={formData.End_Entrega || ''} onChange={e => setFormData({ ...formData, End_Entrega: e.target.value })} style={s.input} /></div>
              </div>
            </div>

            <div style={s.sectionTitle}>II. DETALHES DO EQUIPAMENTO</div>
            <center>
              {imagePreview && <img src={imagePreview} style={{ width: '320px', border: '4px solid #000', borderRadius: '12px', marginBottom: '15px', backgroundColor: '#fff' }} alt="Preview" />}
            </center>
            <div style={s.gridContainer}>
              <div style={s.row}>
                <div style={s.cell}><label style={s.label}>MARCA</label><input value={formData.Marca || ''} onChange={e => setFormData({ ...formData, Marca: e.target.value })} style={s.input} /></div>
                <div style={s.cell}><label style={s.label}>MODELO</label><input value={formData.Modelo || ''} onChange={e => setFormData({ ...formData, Modelo: e.target.value })} style={s.input} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>ANO</label><input value={formData.Ano || ''} onChange={e => setFormData({ ...formData, Ano: e.target.value })} style={s.input} /></div>
              </div>
              <div style={s.row}>
                <div style={s.cell}><label style={s.label}>DESCRIÇÃO TÉCNICA DETALHADA</label><textarea value={formData.Configuracao || formData.Descricao || ''} onChange={e => setFormData({ ...formData, Configuracao: e.target.value })} style={s.textarea} /></div>
              </div>
            </div>

            <div style={s.sectionTitle}>III. CONDIÇÕES COMERCIAIS</div>
            <div style={s.gridContainer}>
              <div style={s.row}>
                <div style={s.cell}><label style={s.label}>VALOR BRUTO (R$)</label><input value={formData.Valor_Total || ''} onChange={e => setFormData({ ...formData, Valor_Total: e.target.value })} style={{ ...s.input, color: '#dc2626', fontWeight: '900' }} /></div>
                <div style={s.cell}><label style={s.label}>VALOR LÍQUIDO À VISTA (R$)</label><input value={formData.Valor_A_Vista || ''} onChange={e => setFormData({ ...formData, Valor_A_Vista: e.target.value })} style={{ ...s.input, color: '#16a34a', fontWeight: '900' }} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>PRAZO (DIAS)</label><input value={formData.Prazo_Entrega || ''} onChange={e => setFormData({ ...formData, Prazo_Entrega: e.target.value })} style={s.input} /></div>
              </div>
            </div>
          </div>
        </div>

        <div style={s.footer}>
          <button onClick={handleUpdate} style={s.btnMain}>CONCLUIR E SALVAR ALTERAÇÕES</button>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modal: { backgroundColor: '#F5F5DC', width: '95%', maxWidth: '1100px', height: '92vh', borderRadius: '20px', display: 'flex', flexDirection: 'column', border: '3px solid #000', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
  header: { padding: '20px 40px', backgroundColor: '#fff', borderBottom: '3px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '17px', borderTopRightRadius: '17px' },
  scroll: { padding: '30px 40px', overflowY: 'auto', flex: 1 },
  vList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionTitle: { fontSize: '12px', fontWeight: '900', color: '#EF4444', letterSpacing: '1px', textTransform: 'uppercase' },
  gridContainer: { border: '2px solid #000', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff' },
  row: { display: 'flex', borderBottom: '2px solid #f0f0f0' },
  cell: { flex: 1, padding: '12px 15px', borderRight: '2px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '9px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
  input: { border: 'none', outline: 'none', fontSize: '15px', fontWeight: '700', color: '#000', background: 'none', width: '100%' },
  textarea: { border: 'none', outline: 'none', fontSize: '14px', width: '100%', minHeight: '100px', background: 'none', resize: 'none', fontWeight: '600', lineHeight: '1.4' },
  footer: { padding: '20px 40px', backgroundColor: '#fff', borderTop: '3px solid #000', borderBottomLeftRadius: '17px', borderBottomRightRadius: '17px' },
  btnMain: { width: '100%', padding: '18px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s' },
  btnPrint: { padding: '12px 25px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '12px' },
  closeBtn: { border: 'none', background: 'none', color: '#000', fontWeight: '900', cursor: 'pointer', fontSize: '12px', opacity: 0.6 }
}