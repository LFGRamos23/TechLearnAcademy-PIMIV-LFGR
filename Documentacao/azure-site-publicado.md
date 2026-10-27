# TechLearn Academy publicado no Azure

Publicação concluída em **11/10/2026**.

## Abrir o site

[Entrar no TechLearn Academy](https://techlearn-proj-pim-hyayf7cehyd3edfq.westus3-01.azurewebsites.net/)

Entre com os mesmos e-mails e senhas que já estavam cadastrados no projeto. Os perfis e os dados foram levados para o banco do Azure.

## Onde cada parte ficou

| Parte | Nome no Azure |
| --- | --- |
| Grupo que reúne os recursos | `techlearn-pim` |
| Site e API | `techlearn-proj-pim` |
| Plano do site | `ASP-techlearnpim-8536`, gratuito F1, Windows, .NET 10 |
| Servidor SQL | `techlearn-pim-sql-27110e0a.database.windows.net` |
| Banco de dados | `TechLearnAcademy_PIMIV` |
| Região | West US 3 |

O projeto **TechLearnAcademy.Api** publica também o HTML, CSS e JavaScript do site. Os PDFs ficam no banco, junto dos materiais cadastrados.

## Dados transferidos

A cópia usada foi `publicacao/azure/banco/TechLearnAcademy_PIMIV-20261011-180400.bacpac`. A importação terminou com sucesso, preservando os IDs existentes. As quantidades abaixo conferem com a origem:

| Registro | Quantidade |
| --- | ---: |
| Usuários | 5 |
| Cursos | 8 |
| Módulos | 27 |
| Materiais | 52 |
| Avaliações | 27 |
| Questões | 77 |
| Matrículas | 3 |
| Avaliações realizadas | 7 |

Os materiais incluem **51 arquivos PDF**. A quantidade de arquivos e o tamanho total dos PDFs também foram conferidos: **25.218.763 bytes** na origem e no Azure.

Os cadastros feitos pelo endereço publicado passam a ser gravados no banco do Azure. O banco local é uma cópia separada e não recebe automaticamente essas alterações.

## Plano gratuito

O site está no **F1 gratuito**. O Azure SQL foi criado com a **oferta gratuita aplicada**, até 32 GB, backup local e opção **AutoPause** ao atingir o limite mensal. Após a importação, essa configuração foi conferida novamente.

Ao atingir o limite mensal gratuito, o banco pausa até o próximo mês. A pausa por inatividade ficou em 60 minutos, valor exigido pela oferta. O primeiro acesso após uma pausa pode demorar mais. Consulte a [oferta gratuita do Azure SQL](https://learn.microsoft.com/en-us/azure/azure-sql/database/free-offer?view=azuresql).

## Como enviar mudanças no site

1. Abra a solução no Visual Studio.
2. Clique com o botão direito em **TechLearnAcademy.Api → Publicar**.
3. Na primeira vez, escolha **Novo perfil → Azure → Azure App Service (Windows)** e entre na mesma conta do Azure.
4. Selecione **Azure subscription 1 → techlearn-pim → techlearn-proj-pim**.
5. Conclua e clique em **Publicar**.

Nas próximas vezes, abra esse perfil e clique em **Publicar**. Esse envio atualiza o programa. Alterações na estrutura do banco precisam de uma atualização SQL própria; importar novamente a cópia inicial não é o procedimento de atualização.

## Configuração e conferência

- A conexão fica no App Service, em **Configurações → Variáveis de ambiente → Cadeias de conexão**, com nome **Banco** e tipo **SQLAzure**.
- O site usa o usuário SQL `techlearn_site`, com leitura, gravação e execução dos procedimentos do projeto.
- O ambiente foi definido como **Production**, e o endereço de redefinição foi ajustado para o site publicado.
- A liberação temporária do computador usada na transferência foi removida. O banco mantém as regras de conexão do site.
- A página inicial, o arquivo de configuração JavaScript e `/versao-site` responderam por HTTPS com status **200** e cache **no-store**.
- A leitura dos dados foi conferida com o usuário SQL usado pelo site. As senhas foram protegidas localmente pelo Windows e não estão neste documento nem nos arquivos públicos.

Em 18/10/2026, a recuperação foi conectada ao Azure Communication Services Email e uma versão atualizada do site foi publicada. A solicitação de teste retornou HTTP 200; consulte [recuperacao-senha-azure.md](recuperacao-senha-azure.md) e [evidencia-recuperacao-20261018.md](evidencia-recuperacao-20261018.md) para os detalhes e o estado da confirmação de entrega.
