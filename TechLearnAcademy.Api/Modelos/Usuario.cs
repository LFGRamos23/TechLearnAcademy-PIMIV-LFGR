using System.Text.Json.Serialization;
using TechLearnAcademy.Api.Servicos;

namespace TechLearnAcademy.Api.Modelos;

public sealed class Usuario
{
    public int Id { get; }
    public string Nome { get; private set; }
    public string Email { get; private set; }
    public string? Telefone { get; private set; }
    public string? Sexo { get; private set; }
    public string? SexoOutro { get; private set; }
    public string Perfil { get; }
    public bool Ativo { get; }

    [JsonIgnore]
    public string SenhaHash { get; private set; }

    public Usuario(int id = 0, string nome = "", string email = "", string perfil = "Aluno",
        string senhaHash = "", bool ativo = true, string? telefone = null, string? sexo = null, string? sexoOutro = null)
    {
        Regras.Exigir(new[] { "Aluno", "Mentor", "Gestor", "Administrador" }.Contains(perfil), "Informe um perfil válido.");
        Id = id;
        Nome = nome;
        Email = email;
        Telefone = telefone;
        Sexo = sexo;
        SexoOutro = sexoOutro;
        Perfil = perfil;
        SenhaHash = senhaHash;
        Ativo = ativo;
    }

    public void AtualizarDados(string nome, string email)
    {
        string nomeValidado = Regras.Texto(nome, 2, 100, "Nome");
        string emailValidado = Regras.Email(email);
        Nome = nomeValidado;
        Email = emailValidado;
    }

    public void AtualizarDadosPessoais(string telefone, string sexo, string? sexoOutro)
    {
        string telefoneValidado = Regras.Telefone(telefone);
        var escolha = Regras.SexoInformado(sexo, sexoOutro);
        Telefone = telefoneValidado;
        Sexo = escolha.Sexo;
        SexoOutro = escolha.Outro;
    }

    public void DefinirSenha(string senha, string confirmacao)
    {
        Regras.Senha(senha, confirmacao);
        SenhaHash = Regras.HashSenha(senha);
    }

    public bool ConferirSenha(string senha) => Regras.ConferirSenha(senha, SenhaHash);

    // Carrega os dados retornados pelas consultas existentes, sem alterá-los.
    public static Usuario DoBanco(IReadOnlyDictionary<string, object?> linha) => new(
        (int)linha["id"]!, (string)linha["nome"]!, (string)linha["email"]!,
        (string)linha["perfil"]!,
        linha.TryGetValue("senhaHash", out var hash) ? (string)hash! : "",
        !linha.TryGetValue("ativo", out var ativo) || (bool)ativo!,
        linha.TryGetValue("telefone", out var telefone) ? telefone as string : null,
        linha.TryGetValue("sexo", out var sexo) ? sexo as string : null,
        linha.TryGetValue("sexoOutro", out var sexoOutro) ? sexoOutro as string : null);
}
