import { supabase } from './supabaseClient'

const OMIE_APP_KEY = "2729522270475";
const OMIE_APP_SECRET = "113d785bb86c48d064889d4d73348131";

export const syncOmieToSupabase = async () => {
  let pagina = 1;
  let totalPaginas = 1;
  let sincronizados = 0;

  try {
    while (pagina <= totalPaginas) {
      const response = await fetch("https://app.omie.com.br/api/v1/geral/clientes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          call: "ListarClientes",
          app_key: OMIE_APP_KEY,
          app_secret: OMIE_APP_SECRET,
          param: [{
            pagina: pagina,
            registros_por_pagina: 100,
            apenas_importado_api: "N"
          }]
        })
      });

      const json = await response.json();
      if (!json.clientes_cadastro) break;

      totalPaginas = json.total_de_paginas;

      const clientesFormatados = json.clientes_cadastro.map(c => ({
        nome: c.nome_fantasia || c.razao_social,
        cppf_cnpj: c.cnpj_cpf,
        inscricao: c.inscricao_estadual || "",
        cidade: c.cidade,
        endereco: c.endereco,
        bairro: c.bairro,
        cep: c.cep,
        num_telefone: c.telefone1_numero ? `(${c.telefone1_ddd || ''}) ${c.telefone1_numero}` : "",
        email: c.email,
        id_omie: c.codigo_cliente_omie // Certifique-se de ter essa coluna no Supabase
      }));

      const { error } = await supabase
        .from('Clientes')
        .upsert(clientesFormatados, { onConflict: 'id_omie' });

      if (error) throw error;

      sincronizados += clientesFormatados.length;
      pagina++;
    }
    return { success: true, count: sincronizados };
  } catch (err) {
    return { success: false, error: err.message };
  }
};