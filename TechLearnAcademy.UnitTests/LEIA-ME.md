# Teste unitário do cadastro

Este projeto contém um único teste unitário, criado com xUnit.

## Regra verificada

O cadastro deve recusar quando a senha e a confirmação são diferentes.

O teste chama diretamente `Regras.Senha`, que é a mesma regra usada pelo cadastro real da API. Ele não abre o site, não acessa o SQL Server e não cria usuários.

## Como executar no Visual Studio

1. Abra `TechLearnAcademy.slnx`.
2. Aguarde a restauração dos pacotes.
3. No menu **Teste**, abra o **Gerenciador de Testes**.
4. Clique em **Executar Todos os Testes**.

Resultado esperado:

```text
SenhasDiferentes_DevemSerRecusadas — Aprovado
```

Também é possível executar pelo terminal:

```text
dotnet test TechLearnAcademy.UnitTests/TechLearnAcademy.UnitTests.csproj
```

## Explicação para a banca

O teste prepara duas senhas válidas, mas diferentes. Depois chama a regra de validação do cadastro e confirma que ela gera um erro de validação HTTP 400 com a mensagem `As senhas devem ser exatamente iguais.`.
