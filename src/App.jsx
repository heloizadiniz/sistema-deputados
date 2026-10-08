import { useEffect, useState } from "react";
import api from "./services/api";
import "./App.css";

function App() {
  const [deputados, setDeputados] = useState([]);
  const [busca, setBusca] = useState("");
  const [estado, setEstado] = useState("");
  const [partido, setPartido] = useState("");
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);

  const [selecionado, setSelecionado] = useState(null);
  const [detalhes, setDetalhes] = useState(null);
  const [carregando, setCarregando] = useState(false);

  // ⭐ FAVORITOS
  const [favoritos, setFavoritos] = useState(() => {
    const salvos = localStorage.getItem("favoritos");
    return salvos ? JSON.parse(salvos) : [];
  });

  // BUSCAR DEPUTADOS
  useEffect(() => {
    api.get("/deputados")
      .then((response) => setDeputados(response.data.dados))
      .catch((error) =>
        console.error("Erro ao buscar deputados:", error)
      );
  }, []);

  // BUSCAR DETALHES DO DEPUTADO
  useEffect(() => {
    if (!selecionado) return;

    setCarregando(true);
    setDetalhes(null);

    api.get(`/deputados/${selecionado.id}`)
      .then((response) => setDetalhes(response.data.dados))
      .catch((error) =>
        console.error("Erro ao buscar detalhes:", error)
      )
      .finally(() => setCarregando(false));
  }, [selecionado]);

  // ⭐ ADICIONAR OU REMOVER FAVORITO
  function alternarFavorito(deputado) {
    let novosFavoritos;

    if (favoritos.includes(deputado.id)) {
      novosFavoritos = favoritos.filter(
        (id) => id !== deputado.id
      );
    } else {
      novosFavoritos = [...favoritos, deputado.id];
    }

    setFavoritos(novosFavoritos);

    localStorage.setItem(
      "favoritos",
      JSON.stringify(novosFavoritos)
    );
  }

  // ESTADOS E PARTIDOS
  const estados = [
    ...new Set(deputados.map((d) => d.siglaUf))
  ].sort();

  const partidos = [
    ...new Set(deputados.map((d) => d.siglaPartido))
  ].sort();

  // FILTROS
  const deputadosFiltrados = deputados.filter((d) =>
    d.nome.toLowerCase().includes(busca.toLowerCase()) &&
    (!estado || d.siglaUf === estado) &&
    (!partido || d.siglaPartido === partido) &&
    (!mostrarFavoritos || favoritos.includes(d.id))
  );

  // =========================
  // TELA DE DETALHES
  // =========================

  if (selecionado) {
    return (
      <div className="app">

        <header>
          <h1>🏛️ Sistema de Deputados</h1>
          <p>Informações dos Deputados Federais</p>
        </header>

        <main>

          <button
            className="botao-voltar"
            onClick={() => {
              setSelecionado(null);
              setDetalhes(null);
            }}
          >
            ← Voltar para a lista
          </button>

          {carregando && (
            <p>Carregando informações...</p>
          )}

          {detalhes && (
            <section className="detalhes">

              <img
                className="foto-detalhe"
                src={detalhes.ultimoStatus?.urlFoto}
                alt={`Foto de ${detalhes.nome}`}
              />

              <div>

                <h2>
                  {detalhes.ultimoStatus?.nome ||
                    detalhes.nome}
                </h2>

                <p>
                  <strong>Partido:</strong>{" "}
                  {detalhes.ultimoStatus?.siglaPartido ||
                    "Não informado"}
                </p>

                <p>
                  <strong>Estado:</strong>{" "}
                  {detalhes.ultimoStatus?.siglaUf ||
                    "Não informado"}
                </p>

                <p>
                  <strong>Nome completo:</strong>{" "}
                  {detalhes.nomeCivil ||
                    "Não informado"}
                </p>

                <p>
                  <strong>Escolaridade:</strong>{" "}
                  {detalhes.escolaridade ||
                    "Não informado"}
                </p>

                <p>
                  <strong>Data de nascimento:</strong>{" "}
                  {detalhes.dataNascimento ||
                    "Não informado"}
                </p>

                <h3>🏢 Gabinete</h3>

                <p>
                  <strong>Prédio:</strong>{" "}
                  {detalhes.ultimoStatus?.gabinete?.predio ||
                    "Não informado"}
                </p>

                <p>
                  <strong>Sala:</strong>{" "}
                  {detalhes.ultimoStatus?.gabinete?.sala ||
                    "Não informado"}
                </p>

                <p>
                  <strong>Andar:</strong>{" "}
                  {detalhes.ultimoStatus?.gabinete?.andar ||
                    "Não informado"}
                </p>

                <p>
                  <strong>Telefone:</strong>{" "}
                  {detalhes.ultimoStatus?.gabinete?.telefone ||
                    "Não informado"}
                </p>

                <p>
                  <strong>E-mail:</strong>{" "}
                  {detalhes.ultimoStatus?.gabinete?.email ||
                    "Não informado"}
                </p>

                {/* ⭐ FAVORITO */}
                <button
                  className="botao-favorito"
                  onClick={() =>
                    alternarFavorito(selecionado)
                  }
                >
                  {favoritos.includes(selecionado.id)
                    ? "⭐ Remover dos favoritos"
                    : "☆ Adicionar aos favoritos"}
                </button>

              </div>
            </section>
          )}

        </main>
      </div>
    );
  }

  // =========================
  // LISTA DE DEPUTADOS
  // =========================

  return (
    <div className="app">

      <header>
        <h1>🏛️ Sistema de Deputados</h1>
        <p>
          Consulte informações dos Deputados Federais
        </p>
      </header>

      <main>

        <h2>Deputados Federais</h2>

        <p>
          {deputadosFiltrados.length} deputado(s)
          encontrado(s)
        </p>

        <div className="filtros">

          {/* BUSCA */}
          <input
            placeholder="🔎 Buscar por nome..."
            value={busca}
            onChange={(e) =>
              setBusca(e.target.value)
            }
          />

          {/* ESTADO */}
          <select
            value={estado}
            onChange={(e) =>
              setEstado(e.target.value)
            }
          >
            <option value="">
              Todos os estados
            </option>

            {estados.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>

          {/* PARTIDO */}
          <select
            value={partido}
            onChange={(e) =>
              setPartido(e.target.value)
            }
          >
            <option value="">
              Todos os partidos
            </option>

            {partidos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* ⭐ FILTRO DE FAVORITOS */}
          <button
            className="botao-favoritos"
            onClick={() =>
              setMostrarFavoritos(!mostrarFavoritos)
            }
          >
            {mostrarFavoritos
              ? "👥 Ver todos"
              : "⭐ Ver favoritos"}
          </button>

        </div>

        {/* CARDS */}

        <div className="cards">

          {deputadosFiltrados.map((d) => (

            <button
              className="card card-clicavel"
              key={d.id}
              onClick={() =>
                setSelecionado(d)
              }
            >

              <img
                className="foto-card"
                src={d.urlFoto}
                alt={`Foto de ${d.nome}`}
              />

              <h3>{d.nome}</h3>

              <div className="informacoes">

                <span>
                  Partido: {d.siglaPartido}
                </span>

                <span>
                  Estado: {d.siglaUf}
                </span>

              </div>

              <span className="ver-detalhes">
                Ver detalhes →
              </span>

              {/* ⭐ FAVORITO */}
              <span
                className="favorito"
                onClick={(e) => {
                  e.stopPropagation();
                  alternarFavorito(d);
                }}
              >
                {favoritos.includes(d.id)
                  ? "⭐ Favorito"
                  : "☆ Favoritar"}
              </span>

            </button>

          ))}

        </div>

        {deputadosFiltrados.length === 0 && (
          <p className="sem-resultados">
            {mostrarFavoritos
              ? "Você ainda não possui deputados favoritos."
              : "Nenhum deputado encontrado."}
          </p>
        )}

      </main>
    </div>
  );
}

export default App;