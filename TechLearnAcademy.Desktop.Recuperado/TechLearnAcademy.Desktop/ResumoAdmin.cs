using System.Collections.Generic;

namespace TechLearnAcademy.Desktop;

public class ResumoAdmin
{
	public int Ativos { get; set; }

	public int Inativos { get; set; }

	public List<ContagemPerfil> Perfis { get; set; } = new List<ContagemPerfil>();
}
