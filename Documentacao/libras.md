# Libras no site

**Ferramenta:** [VLibras Widget](https://www.vlibras.gov.br/doc/widget/installation/webpageintegration.html), serviço gratuito de tradução automática de texto em português para Libras.

**Aplicação:** o arquivo `TechLearnAcademy.Web/wwwroot/js/config.js`, carregado por todas as páginas, adiciona o script oficial do VLibras. Ele cria automaticamente um botão flutuante. O visitante clica no botão e seleciona o texto que deseja traduzir. Não foi necessário criar classe, rota ou tabela no banco.

**Limite:** o recurso depende de internet e traduz o texto das páginas. Ele não traduz automaticamente o conteúdo dentro dos PDFs dos cursos nem substitui um intérprete humano.
