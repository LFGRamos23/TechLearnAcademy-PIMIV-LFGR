# Roteiro atual de apresentação da TechLearn Academy

**Duração sugerida:** cinco minutos. Abra antes o [site publicado](https://techlearn-proj-pim-hyayf7cehyd3edfq.westus3-01.azurewebsites.net/), o [código](../README.md), o [Astah](../Diagramas/TechLearnAcademy-Diagramas-simples.asta) e o [estado atual](estado-atual-20261108.md). Use contas de demonstração criadas pelo grupo, sem expor senhas ou dados reais.

## 0:00 a 0:35 — Problema e proposta

**Mostrar:** página inicial e catálogo.

**Fala:** “Somos o grupo da TechLearn Academy. A plataforma organiza cursos gratuitos de programação, matrícula, materiais, avaliações e acompanhamento em um só lugar. A gratuidade é uma proposta educacional; custeio e capacidade de atendimento ainda precisam de validação para uma operação pública.”

## 0:35 a 1:20 — Arquitetura e integração

**Mostrar:** [README](../README.md), [Program.cs](../TechLearnAcademy.Api/Program.cs) e [ConexaoBanco.cs](../TechLearnAcademy.Api/Banco/ConexaoBanco.cs).

**Fala:** “A interface web usa HTML, CSS e JavaScript. O JavaScript faz pedidos HTTPS à API em C# e ASP.NET Core. O controller recebe, o serviço valida a regra e ConexaoBanco abre a conexão SQL Server e executa comandos parametrizados. Desktop e Android também usam essa API; nenhum cliente acessa o banco diretamente.”

## 1:20 a 2:05 — Jornada do aluno e segurança

**Mostrar:** cadastro, catálogo, curso, avaliação e resultado, sem registrar informação pessoal de terceiros.

**Fala:** “O cadastro público cria o perfil Aluno. A API controla login, sessão e permissões dos quatro perfis. O aluno encontra um curso, matricula-se, estuda o material e responde a avaliação. O gabarito permanece no servidor; a nota e o progresso são calculados e gravados pela API. Recuperação de senha e chamados usam as mesmas regras de acesso.”

**Código de apoio:** [UsuariosController](../TechLearnAcademy.Api/Controllers/UsuariosController.cs), [AvaliacoesServico](../TechLearnAcademy.Api/Servicos/AvaliacoesServico.cs) e [aluno.js](../TechLearnAcademy.Web/wwwroot/js/aluno.js).

## 2:05 a 2:50 — Banco e orientação a objetos

**Mostrar:** [instalador SQL](../Banco/Instalar-banco-do-site.sql) e [modelos C#](../TechLearnAcademy.Api/Modelos/).

**Fala:** “O esquema atual possui 19 tabelas, duas stored procedures e duas triggers. Usuario, Curso, Matricula, Questao e Resultado são exemplos das nove classes principais. Usuario valida também telefone e gênero; Resultado calcula nota e aprovação. O SQL conserva chaves e restrições, enquanto os serviços coordenam as regras de cada operação.”

## 2:50 a 3:30 — Modelagem

**Mostrar:** [arquivo Astah](../Diagramas/TechLearnAcademy-Diagramas-simples.asta) ou [imagens](../Diagramas/Imagens/).

**Fala:** “O modelo apresenta casos de uso, classes, sequência e atividade. Há 14 casos modelados e 44 imagens exportadas. No fluxo de avaliação, a pessoa interage com a tela; a API confere matrícula e respostas, calcula o resultado e grava os registros no SQL. O diagrama mostra responsabilidades e ordem das ações. Recursos incorporados depois, como certificados, ainda não têm um caso individual neste conjunto.”

## 3:30 a 4:15 — Aplicativos

**Mostrar:** [desktop recuperado](../TechLearnAcademy.Desktop.Recuperado/) e [página de aplicativos](../TechLearnAcademy.Web/wwwroot/aplicativos.html).

**Fala:** “O programa Windows Forms nativo é administrativo e consulta usuários e chamados pela API. O código disponível foi reconstruído do executável 1.0.2 por descompilação; não é o fonte original. O APK Android entregue usa telas nativas Java, mas seu projeto Java/Gradle original não está no GitHub. O MAUI da árvore é um protótipo antigo, não o código desse APK.”

## 4:15 a 5:00 — Gestão, testes e limites

**Mostrar:** [registro de 07/11](sincronizacao-azure-20261107.md), [testes históricos](testes-executados.md) e quadro de pendências do PIM.

**Fala:** “Organizamos a evolução por backlog, sprints e Git. O registro de 7 de novembro compara a publicação com a cópia local e descreve uma importação pontual do banco Azure. Há testes históricos da API e da interface, e um teste exploratório de usabilidade com três participantes. Para encerrar o aceite, faltam o relatório completo M01 a M06 do Android, o projeto Java original, a comparação do desktop recompilado e uma avaliação sistemática de acessibilidade. Os commits do GitHub não publicam automaticamente o site no Azure.”

**Antes de gravar:** confirme a disponibilidade do site, o estado da conta de demonstração e os arquivos abertos. Não anuncie como testado um fluxo que apenas aparece no código ou em relatório antigo.
