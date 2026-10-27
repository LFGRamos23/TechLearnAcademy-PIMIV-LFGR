# Publicação e rotina DevOps

O site foi publicado no Azure em **11/10/2026**. Veja [o endereço, os recursos e como atualizar](azure-site-publicado.md). Para consultar os passos do Portal do Azure e do Visual Studio, use [o passo a passo simples](azure-passo-a-passo.md).

A solução foi criada para Visual Studio e SQL Server. A publicação pode usar IIS com ASP.NET Core Hosting Bundle .NET 10 ou um serviço compatível com ASP.NET Core. Não há conta de nuvem, domínio, certificado ou credencial de produção incluídos.

## Pacote

No terminal da solução:

    dotnet publish TechLearnAcademy.Api/TechLearnAcademy.Api.csproj -c Release -o publicacao

O projeto inclui os arquivos do Web em wwwroot durante publish. Configure ConnectionStrings__Banco e Email__... no servidor. Mantenha os segredos fora do repositório. Use SQL Server com usuário de privilégio mínimo (somente permissões necessárias; não sysadmin). O script de criação é executado uma vez pelo responsável pelo banco, em ambiente novo.

## HTTPS e rede

IIS deve encaminhar para a API e terminar HTTPS com certificado válido. Banco SQL fica em rede privada. Abra ao público somente o endereço HTTPS do site. Configure domínio, SMTP real, backup e logs sem dados sensíveis.

Dockerfile é uma opção de empacotamento, não uma hospedagem executada. Ele escuta HTTP8080 internamente: use proxy HTTPS confiável, habilite encaminhamento seguro de esquema somente de proxies conhecidos e ajuste o redirecionamento HTTPS conforme essa implantação. Não publique diretamente a porta HTTP como site final. A configuração de proxy/certificado depende da infraestrutura escolhida.

## Integração contínua

Antes de integrar alteração:
1. Compile API, Web, desktop e os alvos MAUI usados.
2. Confira a sintaxe JavaScript e os testes da instância SQL de teste.
3. Revise permissões e os casos da matriz de requisitos.
4. Faça backup antes de alterar estrutura do banco.
5. Publique primeiro em homologação e confirme o fluxo completo com contas criadas para teste.
6. Registre versão e responsável e só depois aprove produção.

Não execute scripts SQL destrutivos em pipeline. Os arquivos Banco/02-backup.sql e 03-restaurar-teste.sql exigem caminhos reais e recusam substituição do original. Faça restauração periódica em destino diferente para provar que o backup funciona. Veja as instruções no dicionário do banco.

## Limites

O site e a API estão no Azure App Service Windows F1, e o banco foi transferido para o Azure SQL com oferta gratuita e pausa ao atingir o limite mensal. Preços do relatório anterior são hipóteses acadêmicas. SMTP externo, certificado em celular e desempenho com muitos usuários exigem configuração ou verificação próprias. As telas são estáticas, mas todos os endpoints de dados aplicam autenticação e autorização; esconder menus não substitui essa proteção.

