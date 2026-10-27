namespace TechLearnAcademy.Desktop;

public class Usuario
{
	public int Id { get; set; }

	public string Nome { get; set; } = "";

	public string Email { get; set; } = "";

	public string? EmailContato { get; set; }

	public string Perfil { get; set; } = "";

	public bool Ativo { get; set; } = true;
}
