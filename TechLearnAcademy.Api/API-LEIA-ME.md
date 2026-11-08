# API TechLearn Academy — referência de 08/11/2026

Fonte conferida no commit `94da0a8`. Para o inventário e os limites das evidências, consulte [estado atual](../Documentacao/estado-atual-20261108.md). Este guia explica o código; não certifica execução dos serviços remotos na data da revisão.

## Estrutura e execução local

- `Program.cs` registra controllers, `ConexaoBanco`, `UsuariosServico`, `CursosServico`, `AvaliacoesServico`, `GestaoServico`, autenticação `SessaoHandler` e autorização. Também entrega os arquivos da pasta Web em desenvolvimento e os publicados em `wwwroot`.
- `Controllers/` recebe HTTP e exige os perfis; `Servicos/` valida regras; `Modelos/` representa dados; `Banco/ConexaoBanco.cs` usa `Microsoft.Data.SqlClient` e parâmetros SQL.
- Para um banco **novo e isolado**, leia `../Banco/Instalar-banco-do-site.sql` e `../Documentacao/banco.md` antes de executar no SSMS. Não execute o instalador de banco novo sobre uma base com dados nem diretamente como migração Azure SQL.
- Copie `appsettings.Development.example.json` para `appsettings.Development.json` e ajuste a conexão local. Credenciais e strings reais não pertencem ao Git. O perfil local usa `https://localhost:7291/`; configure o certificado HTTPS de desenvolvimento se necessário.
- O comando `dotnet run --project TechLearnAcademy.Api -- --criar-admin` cria o primeiro Administrador após solicitar nome, e-mail, telefone, gênero e senha. Não cria conta ao iniciar o servidor. `--redefinir-admin` redefine localmente a senha de um Administrador existente, com acesso operacional ao servidor e ao banco.

## Contratos principais

| Área | Rotas de exemplo | Perfis |
| --- | --- | --- |
| Conta | `POST /api/usuarios/cadastro`; `POST /api/usuarios/login`; `GET/PUT /api/usuarios/perfil` | Público para cadastro/login; autenticado para perfil. |
| Recuperação | `POST /api/usuarios/recuperar-senha`; `POST /api/usuarios/redefinir-senha` | Contas não administrativas; Administrador usa comando local. |
| Cursos | `GET /api/cursos`; `POST /api/matriculas`; `GET /api/matriculas/minhas` | Consulta para Aluno/Gestor; matrícula para Aluno. |
| Avaliações | `POST /api/avaliacoes/{id}/respostas`; `GET /api/resultados` | Aluno; o Gestor mantém avaliações e questões. |
| Gestão | `GET /api/relatorios`; `GET /api/administracao/usuarios` | Gestor para relatórios; Administrador e Gestor têm acesso limitado às rotas de usuários conforme regras do serviço. |
| Ajuda e certificado | `POST /api/chamados`; `GET /api/certificados`; `POST /api/certificados` | Chamado por Aluno/Mentor/Gestor; solicitação de certificado por Aluno. |

Consulte os quatro controllers para rotas completas, verbos, perfis e modelos de entrada. O resultado acadêmico e a checagem de matrícula são feitos no servidor.

## Segurança implementada

`Regras.Senha` exige **8 caracteres ou mais**, letra maiúscula, número e símbolo, sem espaço. `Regras.HashSenha` usa PBKDF2-HMAC-SHA256, sal aleatório de 16 bytes e 600.000 iterações; `ConferirSenha` compara os hashes em tempo constante. A API usa sessão aleatória com hash no banco; cookie HttpOnly e SameSite Strict na web, Secure quando HTTPS; clientes compatíveis podem enviar `Bearer`. O serviço verifica a sessão e a conta ativa. Não há JWT.

O código valida e-mail, telefone e gênero no servidor, confere permissões nos endpoints e usa SQL parametrizado. Bloqueio de origem em gravações e CORS configurável complementam a proteção. Esses mecanismos devem ser testados no ambiente de publicação após mudanças; não afirmam imunidade a todos os ataques.

## Recuperação por e-mail

A aplicação lê `Email:ConexaoAzure` para Azure Communication Services Email **ou** `Email:Servidor` e demais parâmetros de SMTP. Exige `Email:Remetente` e `Email:UrlRedefinicao`. O link funciona uma vez por até 30 minutos; o código armazena apenas o hash do token de recuperação. Configure valores por variáveis de ambiente ou segredo do serviço. Para os nomes e passos de produção, consulte [recuperação no Azure](../Documentacao/recuperacao-senha-azure.md).

Na revisão documental, não foram reexecutados banco, e-mail, API nem APK. A conferência de publicação mais recente registrada permanece em [sincronização de 07/11](../Documentacao/sincronizacao-azure-20261107.md).
