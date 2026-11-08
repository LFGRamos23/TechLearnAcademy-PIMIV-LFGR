# Estado atual e rastreabilidade da TechLearn Academy

**Fotografia documental:** 07/11/2026, ramo `main` no commit `da08c24`. Este inventário foi confrontado com os 136 arquivos de texto da árvore atual, a lista completa de 284 arquivos e o PIM em Word de 01/11/2026. Arquivos binários, aplicativos instalados e banco remoto não foram executados nesta revisão. Evidências de execução datadas continuam identificadas como registros históricos.

## Arquitetura e código

| Componente | Fonte vigente | Função comprovável no código |
| --- | --- | --- |
| Site | [TechLearnAcademy.Web/wwwroot](../TechLearnAcademy.Web/wwwroot/) | HTML, CSS e JavaScript; `fetch` envia pedidos à API. |
| API | [TechLearnAcademy.Api](../TechLearnAcademy.Api/) | ASP.NET Core/.NET 10 em C#; controllers, serviços, modelos, sessão e SQL. |
| Banco | [Banco](../Banco/) | Instalador e migrações SQL Server; o cliente não recebe credencial do banco. |
| Desktop entregue | [TechLearnAcademy.Desktop.Recuperado](../TechLearnAcademy.Desktop.Recuperado/) | Windows Forms nativo do Administrador, com `ApiCliente` e `servidor.txt`. |
| Mobile entregue | [página de aplicativos](../TechLearnAcademy.Web/wwwroot/aplicativos.html) | APK Android nativo em Java distribuído separadamente; projeto Java/Gradle original ausente da árvore. |
| Protótipo antigo | [TechLearnAcademy.Mobile](../TechLearnAcademy.Mobile/) | MAUI com WebView; não gera o APK Java entregue. |

O fluxo principal é navegador/desktop/Android → HTTPS e JSON → API → `ConexaoBanco` e SQL parametrizado → SQL Server. O código da API registra `UsuariosServico`, `CursosServico`, `AvaliacoesServico`, `GestaoServico` e `SessaoHandler`. O login usa sessão no servidor; o cadastro público cria Aluno. Há quatro perfis: Aluno, Mentor, Gestor e Administrador.

Os controllers implementam cadastro, login, recuperação, perfil, cursos, módulos, materiais/PDF, matrícula, avaliações, resultados, chamados, certificados e relatórios. Os nove modelos centrais e suas relações estão no [guia de POO](orientacao-a-objetos.md). Os clientes acessam a mesma API; isso não demonstra, por si só, que todos os fluxos de cada aplicativo foram homologados.

## Banco e dados pessoais

O [instalador atual](../Banco/Instalar-banco-do-site.sql) declara **19 tabelas**, `sp_RealizarMatricula`, `sp_RelatorioCurso`, `tr_AuditoriaUsuarios` e `tr_LimiteModulos`. O script `08-dados-pessoais-usuarios.sql` atualiza bases já existentes; os instaladores novos incorporam `Telefone`, `Sexo` e `SexoOutro` com restrições. Os nomes SQL continuam `Sexo` e `SexoOutro`, mas o formulário usa **Gênero**. O formulário de novas contas exige telefone e gênero; as colunas aceitam nulos para contas anteriores. A finalidade e a necessidade desses campos devem ser descritas na política de privacidade antes da operação pública.

Não execute o instalador de banco novo sobre uma base existente ou diretamente no Azure SQL. A migração e a restauração dependem do ambiente e de conferência prévia. O [guia de banco](banco.md) conserva trechos de 04/10 sobre 16 tabelas como histórico da evolução, não como contagem atual.

## Publicação e evidências datadas

O [registro de 07/11](sincronizacao-azure-20261107.md) relata comparação de 174 arquivos publicados, compilação local Release e importação de um BACPAC em LocalDB isolado. Nele constam 10 usuários, 8 cursos, 27 módulos, 52 materiais, 7 matrículas, 4 chamados e 14 tentativas na **cópia daquela data**. O BACPAC contém dados reais, ficou fora do Git e não deve ser anexado à entrega pública. A importação é pontual: novos dados no Azure não aparecem automaticamente no PC. O registro identifica a DLL publicada como derivada de `e5b69e0`; os commits seguintes de organização do repositório não constituem publicação automática.

O [registro de testes de 04/10](testes-executados.md), a [revisão de 07/10](revisao-exigencias.md) e o PIM consolidam conjuntos de testes em datas distintas. Contagens desses arquivos não devem ser somadas como requisitos aprovados nem tratadas como reteste em 07/11. Nesta revisão, os scripts e relatos foram lidos, mas API, SQL remoto, EXE e APK não foram executados.

## Aplicativos e modelagem

O [desktop recuperado](../TechLearnAcademy.Desktop.Recuperado/LEIA-ME.md) foi reconstruído por descompilação do EXE 1.0.2 e, conforme o registro de 27/10, compilou sem erros e avisos. Ele não é uma cópia literal dos arquivos-fonte originais. A equivalência funcional do binário recompilado ainda requer ensaio documentado. O antigo protótipo desktop WebView2 foi retirado da árvore atual e permanece no histórico Git.

O APK Java distribuído continua sem projeto-fonte original no repositório. O MAUI existente é legado e não deve ser apresentado como fonte do APK. Permanecem pendentes os casos M01–M06 com aparelho, versão Android, passos, resultados e evidências.

O [Astah editável](../Diagramas/TechLearnAcademy-Diagramas-simples.asta) reúne 14 casos de uso; [44 PNGs](../Diagramas/Imagens/) mostram casos de uso, classes, sequências e atividades. Esse conjunto não possui caso específico para todas as extensões posteriores, inclusive certificados e relatórios. O MER e o dicionário do PIM cobrem as 19 tabelas; novos campos de `Usuarios` exigiram a atualização do dicionário e do SQL no apêndice.

## Documentos a usar na apresentação

1. [README principal](../README.md): ponto de partida para a versão atual.
2. [PIM IV em Word](../Documentacao/TechLearnAcademy-PIMIV.pdf): o PDF versionado deve ser conferido contra a revisão mais recente do Word antes de distribuir; o Word atualizado está na entrega acadêmica do grupo.
3. [Diagramas](../Diagramas/README.md): projeto Astah editável e exportações.
4. [Aplicativos](../APLICATIVOS-LEIA-ME.md): versão desktop nativa e limite do APK.
5. [Roteiro atual](roteiro-banca.md): apresentação curta com caminhos reais no repositório.

`LEIA-ME.md`, `CONTRATO.md`, `relatorio-academico.md`, `requisitos.md` e `testes-executados.md` preservam estágios anteriores. As notas iniciais de cada arquivo orientam sua leitura. A documentação não substitui a execução dos fluxos pendentes, a revisão de acessibilidade nem a validação de custeio da plataforma gratuita.
