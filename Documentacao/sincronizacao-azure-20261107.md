# Estado da cópia local — 07/11/2026

Esta pasta foi conferida com o aplicativo `techlearn-proj-pim` e o banco `TechLearnAcademy_PIMIV` no Azure. A estrutura do projeto foi mantida.

## Código e site

- O código local está no commit `be1ce7017b5e830431793aee20985b49db8d0e15`, igual ao ramo `main` do GitHub.
- A publicação atual foi baixada para `publicacao/azure/site.zip` e extraída em `publicacao/azure/site/`. Seus 174 arquivos foram conferidos por SHA-256. O ZIP anterior foi preservado como `publicacao/azure/site-antes-sincronizacao-20261107.zip`.
- Os arquivos do site publicados coincidem com `TechLearnAcademy.Web/wwwroot/`. A DLL publicada da API foi compilada no commit `e5b69e0`; o commit local posterior `be1ce70` só muda duas frases de “sexo” para “gênero” no comando de criar o administrador. Por isso, o código-fonte local é o mais recente sem mudar a lógica da API.
- A API local compilou em Release sem erros ou avisos. O site local abriu com HTTP 200.
- O arquivo `TechLearnAcademy.Desktop.Codigo-Recuperado.zip` foi atualizado nos três arquivos que estavam diferentes da pasta `TechLearnAcademy.Desktop.Recuperado/`. Seus 21 arquivos agora conferem com a pasta. O ZIP anterior foi guardado como `TechLearnAcademy.Desktop.Codigo-Recuperado-antes-atualizacao-20261107.zip`.

## Banco de dados

- Backup atual: `Banco/Backups/TechLearnAcademy_PIMIV-Azure-20261107-211435.bacpac`. SHA-256: `FC04857FBD5290C898D3AAB875146F3423CE11744701B5E54480E94B0512D3E5`. O pacote contém 28 entradas, todas lidas sem erro.
- O backup foi importado em uma base LocalDB separada: `TechLearnAcademy_PIMIV_Azure_20261107`. As bases locais anteriores foram preservadas.
- `TechLearnAcademy.Api/appsettings.Development.json` aponta para essa base local. A conexão usa `Encrypt=false` apenas no LocalDB do PC; a configuração do Azure não foi alterada.
- Conferência por contagem: 10 usuários, 8 cursos, 27 módulos, 52 materiais, 7 matrículas, 4 chamados e 14 tentativas de avaliação. As colunas `Telefone`, `Sexo` e `SexoOutro` estão presentes. O nome técnico `Sexo` permanece no banco; a interface usa “Gênero”.
- Um login local com e-mail inexistente retornou HTTP 401 e a mensagem esperada, confirmando que a API conseguiu consultar essa base.
- A permissão SQL `VIEW DEFINITION` dada temporariamente ao usuário técnico foi revogada e conferida; a regra temporária de firewall do IP deste PC também foi removida.

O BACPAC contém registros reais e está fora do Git. Entregue esse arquivo somente por um meio privado. Esta é uma cópia pontual: alterações feitas no Azure depois da exportação não entram automaticamente no banco local.
