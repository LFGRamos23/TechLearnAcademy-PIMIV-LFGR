using TechLearnAcademy.Api.Servicos;

namespace TechLearnAcademy.UnitTests;

public class CadastroSenhaTests
{
    [Fact]
    public void SenhasDiferentes_DevemSerRecusadas()
    {
        // Organização: duas senhas válidas, porém diferentes.
        string senha = "SenhaSegura1!";
        string confirmarSenha = "OutraSenha2!";

        // Ação: executa a mesma regra utilizada pelo cadastro real.
        ErroAplicacao erro = Assert.Throws<ErroAplicacao>(
            () => Regras.Senha(senha, confirmarSenha));

        // Verificação: o cadastro deve recusar com erro de validação.
        Assert.Equal(400, erro.Status);
        Assert.Equal("As senhas devem ser exatamente iguais.", erro.Message);
    }
}
