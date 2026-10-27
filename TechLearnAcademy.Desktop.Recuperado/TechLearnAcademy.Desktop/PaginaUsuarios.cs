using System.Collections.Generic;

namespace TechLearnAcademy.Desktop;

public class PaginaUsuarios
{
	public List<Usuario> Itens { get; set; } = new List<Usuario>();

	public int Pagina { get; set; }

	public int TotalPaginas { get; set; }

	public int Total { get; set; }
}
