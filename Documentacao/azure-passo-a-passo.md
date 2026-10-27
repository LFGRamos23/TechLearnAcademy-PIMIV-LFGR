# Colocar o TechLearn Academy no Azure

## Site publicado em 11/10/2026

Abra o [TechLearn Academy](https://techlearn-proj-pim-hyayf7cehyd3edfq.westus3-01.azurewebsites.net/). O site e a API foram enviados ao Azure, e o banco com os dados existentes foi importado e conectado.

Use os mesmos e-mails e senhas já cadastrados. Veja [o resumo da publicação e como atualizar o site](azure-site-publicado.md).

As etapas abaixo ficam como referência do processo realizado. Sua conta é gratuita com créditos.

O **App Service** é o lugar onde o site vai funcionar. O **Azure SQL** vai guardar os usuários, cursos, avaliações e PDFs. O banco que está no seu computador precisa ser levado para lá também.

## 1. Criar o espaço do site

1. Entre no [Portal do Azure](https://portal.azure.com/).
2. Na pesquisa de cima, digite **App Services** e abra o resultado.
3. Clique em **Criar → Aplicativo Web**.
4. Preencha assim:

| Campo | O que escolher |
| --- | --- |
| Assinatura | Sua assinatura gratuita com créditos |
| Grupo de recursos | **Criar novo**: `techlearn-pim` |
| Nome | Um nome disponível, como `techlearn-luis-pim` |
| Publicar | **Código** |
| Pilha de runtime | **.NET 10 (LTS)** |
| Sistema operacional | **Windows** |
| Região | Uma região com o plano gratuito disponível |
| Plano do App Service | Criar novo: `techlearn-plano` |
| Plano de preços | **Gratuito F1** |

O grupo de recursos funciona como uma pasta que reúne os serviços do projeto. O nome do aplicativo será usado no endereço do site.

Na aba **Monitoramento**, deixe o **Application Insights** desativado nesta primeira publicação. Na aba **Implantação**, deixe a implantação contínua desativada; enviaremos o projeto pelo Visual Studio.

Clique em **Revisar + criar** e confira o plano **F1** antes de criar. Se o gratuito não aparecer, envie uma captura dessa tela para escolhermos o próximo passo.

Essas escolhas seguem o [guia da Microsoft para publicar aplicações .NET](https://learn.microsoft.com/en-us/azure/app-service/quickstart-dotnetcore).

## 2. Enviar pelo Visual Studio

Depois que o aplicativo existir no Azure:

1. No Visual Studio, clique com o botão direito em **TechLearnAcademy.Api**.
2. Escolha **Publicar**. Se já houver um perfil aberto, use **Novo perfil**.
3. Escolha **Azure → Azure App Service (Windows)**.
4. Entre na mesma conta usada no Portal do Azure.
5. Selecione o aplicativo que acabou de criar e conclua o assistente.
6. Clique em **Publicar**.

O projeto **TechLearnAcademy.Api** já inclui as páginas do site na publicação. Depois, novas alterações podem ser enviadas usando o mesmo botão **Publicar**. [Passos oficiais do Visual Studio](https://learn.microsoft.com/en-us/azure/app-service/quickstart-dotnetcore).

## 3. Levar o banco e conectar o site

Esta etapa já foi concluída. Para referência, o processo foi:

1. Criar um banco **Azure SQL**, conferindo a oferta gratuita na sua conta.
2. Importar a cópia `.bacpac` preparada na pasta `publicacao/azure/banco`.
3. No App Service, abrir **Configurações → Variáveis de ambiente → Cadeias de conexão**.
4. Adicionar uma conexão com nome **Banco**, tipo **SQLAzure**, e o valor da conexão do banco criado.
5. Aplicar a configuração e abrir o endereço do site.

A conexão **Banco** já está configurada no Azure. A aplicação usa um usuário próprio do banco para consultar e gravar os dados. As senhas não foram colocadas no código ou neste guia.

A Microsoft documenta a [importação de BACPAC](https://learn.microsoft.com/en-us/azure/azure-sql/database/database-import?view=azuresql), a [oferta gratuita do Azure SQL](https://learn.microsoft.com/en-us/azure/azure-sql/database/free-offer?view=azuresql) e as [cadeias de conexão do App Service](https://learn.microsoft.com/en-us/azure/app-service/configure-common). A oferta gratuita possui limites; selecione a opção de pausar ao atingir o limite mensal para evitar uso adicional pago.

## O que já foi preparado no computador

- `publicacao/azure/site`: aplicação compilada com as páginas do site.
- `publicacao/azure/site.zip`: pacote para envio, caso necessário.
- `publicacao/azure/banco`: cópia do banco com os dados existentes.
- `TechLearnAcademy.Api/Properties/PublishProfiles/Azure-Pasta.pubxml`: perfil para gerar o pacote local novamente.

O perfil **Azure-Pasta** apenas gera arquivos no computador. Nesta publicação, o envio foi realizado pela ferramenta oficial Azure CLI. Para atualizar pelo Visual Studio, crie o perfil de envio conforme o passo 2. A configuração de desenvolvimento com LocalDB foi retirada do pacote de publicação.

**Situação atual:** site e banco publicados. A recuperação por e-mail continua dependendo de configurar um serviço de envio; vocês ainda não escolheram esse serviço.
