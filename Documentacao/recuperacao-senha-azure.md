# Recuperação de senha no Azure

Atualizado em 18/10/2026.

## Como funciona

1. Aluno, mentor ou gestor informa o e-mail de acesso ou de contato na página **Esqueci minha senha**.
2. O site envia um link para o e-mail de contato cadastrado. O link dura 30 minutos.
3. O usuário cria outra senha. O link só funciona uma vez e as sessões antigas são encerradas.

O administrador não recebe esse e-mail nem pode trocar a senha pelo site.

## Serviço escolhido

O envio usa **Azure Communication Services Email**, com o domínio gerenciado pelo Azure. Os recursos são `techlearn-pim-email` e `techlearn-pim-comunicacao`, no grupo `techlearn-pim`. O serviço usa a mesma conta Azure do site.

O Azure cobra pelo uso do envio. Acompanhe **Gerenciamento de Custos** na assinatura, especialmente quando os créditos gratuitos acabarem.

A conta universitária não permitiu registrar o aplicativo Entra exigido pelo SMTP do Azure. Por isso, no Azure o programa usa a biblioteca oficial `Azure.Communication.Email` e uma chave de conexão guardada nas configurações do App Service. O SMTP simples continua disponível no código para testes locais. Não é preciso preencher servidor, porta, usuário e senha SMTP quando `Email__ConexaoAzure` está configurada.

No App Service `techlearn-proj-pim`, as variáveis são:

| Nome | Uso |
| --- | --- |
| `Email__ConexaoAzure` | Chave de conexão do recurso de comunicação. **Secreta; nunca colocar no código ou em diagramas.** |
| `Email__Remetente` | Endereço `donotreply` do domínio gerenciado. |
| `Email__UrlRedefinicao` | Endereço HTTPS da página `redefinir-senha.html` no site publicado. |

Para conferir: **Portal do Azure → techlearn-proj-pim → Configurações → Variáveis de ambiente**. Não compartilhe uma captura que mostre o valor da chave. Para trocar a chave, gere uma nova no recurso de comunicação, substitua a variável do site e revogue a antiga depois de confirmar o envio.

## Conferências

O arquivo `Testes/verificar_senha_chamados.py` cria um banco **LocalDB separado** e um SMTP fictício no próprio computador. Ele verifica que o link usado duas vezes é recusado, que um link vencido é recusado e que o administrador não recebe recuperação pelo site. Também verifica que gestor e mentor não atendem nem respondem os chamados que abriram. O resultado sem senhas e sem tokens fica em `tmp/verificacao-senha-chamados/resultado.json`.

No Azure, foi criada uma conta de teste com um e-mail fornecido pelo proprietário e solicitada a recuperação pelo próprio site. O proprietário confirmou que a mensagem chegou e que conseguiu redefinir a senha pelo link. **Não compartilhe o link de recuperação nem o token.**

## Se o administrador perder a senha

Somente o proprietário ou um operador autorizado com acesso ao banco deve usar este procedimento, em um terminal confiável. Ele não cria uma rota pública e não precisa de e-mail:

1. Configure temporariamente a variável de ambiente `ConnectionStrings__Banco` para apontar ao banco correto. Não grave a cadeia de conexão no projeto, no histórico do terminal, em capturas ou em documentos.
2. Na pasta da solução, execute `dotnet run --project .\TechLearnAcademy.Api -- --redefinir-admin`.
3. Informe o e-mail de acesso do administrador e digite a nova senha duas vezes. Os caracteres não aparecem na tela.
4. O comando troca somente a senha do administrador ativo indicado e encerra as sessões anteriores. Entre no site com a nova senha.
5. Remova a variável temporária e encerre o terminal ao terminar.

Se não houver acesso autorizado ao banco, o proprietário deve recuperar primeiro o acesso administrativo ao Azure. Nenhum outro perfil pode redefinir a senha do administrador pelo site.
