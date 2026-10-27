# Sincronização do projeto com o Azure — 21/10/2026

## Aplicativo web

Aplicativo consultado: `techlearn-proj-pim`, no grupo `techlearn-pim`.
O Azure informou o aplicativo em execução e a última alteração em 18/10/2026.

- Os arquivos HTML, CSS e JavaScript publicados são iguais aos arquivos-fonte em `TechLearnAcademy.Web/wwwroot`. Os arquivos `.br` e `.gz` presentes apenas no Azure são cópias compactadas geradas na publicação.
- A DLL e o PDB publicados da API têm o mesmo SHA-256 dos arquivos em `TechLearnAcademy.Api/bin/Release/net10.0`. Assim, a cópia local do código e a compilação Release correspondem à versão publicada.
- `publicacao/azure/site` e `publicacao/azure/site.zip` foram atualizados com os 168 arquivos obtidos do Azure. Os 168 arquivos extraídos foram comparados por SHA-256 com o ZIP atualizado, sem divergências.
- O ZIP anterior, de 11/10/2026, foi preservado em `publicacao/azure/site-antes-sincronizacao-20261021.zip`.

## Banco de dados

Com autorização do usuário, o banco do Azure foi exportado para `Banco/Backups/TechLearnAcademy_PIMIV-Azure-20261021.bacpac` (24.461.910 bytes). O arquivo foi aberto e suas 28 entradas foram lidas integralmente. SHA-256: `182D0444D84B7789AE6DFF57FFF51726BB4CB3A3806FC880CA059659255387FB`.

Foi criada uma regra temporária de firewall limitada ao IP do computador para a exportação. A regra foi removida ao terminar; uma consulta posterior confirmou que só restaram as duas regras anteriores do site.

Com autorização específica do usuário, a opção `contained database authentication` foi habilitada no LocalDB e o BACPAC foi importado com sucesso em `TechLearnAcademy_PIMIV_Azure_20261021`. O banco local anterior `TechLearnAcademy_PIMIV` continua intacto.

O arquivo `TechLearnAcademy.Api/appsettings.Development.json` agora aponta para a cópia importada. Ao iniciar o perfil de desenvolvimento da API no Visual Studio, o site local usará esse banco. Para voltar ao banco anterior, basta trocar o nome do banco nessa conexão de volta para `TechLearnAcademy_PIMIV`.

Comparação após a importação: o banco anterior tem 5 usuários, 3 matrículas, 7 tentativas de avaliação e 1 chamado; a cópia do Azure tem 9 usuários, 5 matrículas, 11 tentativas e 3 chamados. Cursos, módulos, materiais, avaliações e questões mantiveram as mesmas quantidades (8, 27, 52, 27 e 77). Nenhuma dessas contagens expõe dados pessoais.

Esta é uma cópia de 21/10/2026. Novas alterações feitas no site do Azure depois da exportação não aparecem automaticamente no banco local, e mudanças locais não alteram o Azure.
