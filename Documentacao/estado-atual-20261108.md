# Estado do repositório — 08/11/2026

Revisão documental do ramo `main` com base no commit `81f2d947edcc876bf35bf9e27124af816edd95b3`. Até esse ponto, os quinze commits posteriores a `94da0a8` acrescentaram o projeto de teste unitário xUnit, a modelagem completa do banco e atualizações documentais, sem alterar os fluxos funcionais da API, da web ou do desktop. A árvore contém 295 arquivos, incluindo 51 arquivos C#, 9 SQL, 50 PNG e 6 SVG. As contagens são de arquivos, não de testes aprovados. Foram lidos os arquivos de orientação e os fontes centrais da API, web, banco e desktop. Esta revisão não executou o servidor, o banco remoto, o EXE, o APK nem o teste xUnit; o registro de sincronização e os resultados de testes mantêm suas datas próprias.

## Qual versão usar

| Entrega | Arquivos de referência | Situação observável |
| --- | --- | --- |
| Web | `TechLearnAcademy.Web/wwwroot/` e `TechLearnAcademy.Api/Program.cs` | HTML, CSS e JavaScript enviados com a API; a prévia Web isolada exige API configurada. |
| API | `TechLearnAcademy.Api/Controllers/`, `Servicos/`, `Modelos/` e `Banco/ConexaoBanco.cs` | ASP.NET Core em .NET 10, C#, endpoints HTTP/JSON, regras e acesso SQL parametrizado. |
| Banco | `Banco/Instalar-banco-do-site.sql` e `Banco/08-dados-pessoais-usuarios.sql` | Instalador de banco novo com 19 tabelas; atualização separada de bases existentes. Não executada nesta revisão. |
| Desktop distribuído | `TechLearnAcademy.Desktop.Recuperado/` | Fonte C# reconstruído do executável Windows Forms 1.0.2; não é o projeto-fonte original. |
| Android distribuído | `TechLearnAcademy.Web/wwwroot/aplicativos.html` | Página aponta a downloads no Azure. APK e fonte Java/Gradle da versão nativa não estão nesta árvore Git. |
| Mobile antigo | `TechLearnAcademy.Mobile/` | Protótipo .NET MAUI/WebView; não é o código do APK nativo. |
| UML | `Diagramas/TechLearnAcademy-Diagramas-simples.asta` e `Diagramas/Imagens/` | Astah editável e 44 PNG dos quatro tipos: casos de uso, classes, sequência e atividade. |\n| Modelagem do banco | `Diagramas/BancoDados/` | Draw.io editável, três SVG e inventário do esquema exportado do Azure SQL: MER conceitual, modelo lógico e modelo físico. |\n| Teste unitário | `TechLearnAcademy.UnitTests/` | Um teste xUnit da confirmação de senha está implementado; execução e captura no Visual Studio permanecem pendentes. |

O diagrama de classes resume nove classes de negócio. Controllers, serviços, tipos de pedido, componentes do desktop e tabelas SQL existem além dessas nove; a contagem de classes do diagrama não representa o total de arquivos C# ou das tabelas. Os 14 casos de uso modelados não incluem um caso separado para cada função posterior, como certificado e relatório.

## Fluxos e regras conferidos no código

- A web chama a API por `fetch`; o desktop recuperado usa `HttpClient` e cookies; o APK é descrito no PIM como cliente HTTPS/JSON. As interfaces não acessam SQL diretamente.
- `UsuariosController` oferece cadastro, login, perfil, recuperação, redefinição e saída. O cadastro público cria Aluno; os demais perfis são provisionados em rotas administrativas. `SessaoHandler` aceita cookie ou `Authorization: Bearer`, consulta no banco a sessão válida e verifica o perfil autorizado.
- `Regras.Senha` exige pelo menos **8 caracteres**, maiúscula, número e símbolo, e proíbe espaço. `Regras.HashSenha` usa PBKDF2-SHA256 com sal aleatório e 600.000 iterações. O token de sessão é guardado no banco por seu hash; o navegador recebe cookie HttpOnly.
- `UsuariosServico.Recuperar` aceita Azure Communication Services Email quando `Email:ConexaoAzure` estiver configurada, ou SMTP quando `Email:Servidor` estiver configurado. O link expira em 30 minutos. A recuperação pública exclui Administrador; a redefinição administrativa é um comando local no `Program.cs`.
- O formulário de cadastro atual pede telefone com DDD e gênero, e a API valida ambos. `dbo.Usuarios` usa as colunas técnicas `Telefone`, `Sexo` e `SexoOutro`; as colunas aceitam nulo para contas anteriores. A justificativa e retenção desses dados ainda exigem decisão editorial e operacional antes de divulgação ampla.
- Cursos, módulos, materiais, matrícula, avaliações, resultados, chamados, orientações, relatórios e certificados têm endpoints nos quatro controllers. A correção e o acesso são feitos na API; menus visíveis não substituem autorização por perfil.
- O site inclui o script remoto VLibras. Portanto, embora não use framework de frontend, existe essa dependência externa para o widget.

## Publicação, evidência e material acadêmico

O registro `sincronizacao-azure-20261107.md` documenta uma conferência pontual do Azure e importação de BACPAC em LocalDB. Essa cópia não é sincronizada automaticamente. A DLL então publicada correspondia a `e5b69e0`; o commit `94da0a8` atualiza documentação do Git e não constitui publicação no Azure. A leitura de `Dockerfile` prova uma opção de empacotamento; não demonstra implantação por contêiner ou pipeline.

`Documentacao/TechLearnAcademy-PIMIV.pdf` foi atualizado em 08/11/2026 com o teste unitário e a modelagem completa do banco. Para a entrega acadêmica, manter o Word principal e o PDF sincronizados e conferir visualmente todas as páginas antes de enviar o arquivo único. `Documentacao/relatorio-academico.md`, `requisitos.md`, `testes-executados.md`, `CONTRATO.md` e `LEIA-ME.md` estão marcados como registros históricos e contêm regras de versões anteriores.

**Pendências de aceite:** obter o projeto-fonte Java correspondente ao APK, executar e registrar M01–M06 em aparelho, comparar o desktop recompilado ao executável distribuído, conferir fluxos web e permissões na publicação atual, validar acessibilidade com teclado/tecnologias assistivas e decidir a necessidade e retenção de telefone e gênero. Os resultados de 04/10, 18/10 e 07/11 não devem ser apresentados como reteste de 08/11.

Para preparar a banca: mostrar um fluxo completo da web à API e ao SQL, explicar uma regra no serviço, abrir o Astah e distinguir a demonstração do desktop reconstruído da origem do APK. A apresentação acadêmica deve usar o Word/PDF principal revisado, o manual web e os diagramas editáveis; não usar os rascunhos de outubro como descrição final.
