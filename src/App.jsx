import { useEffect, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB = 'https://api.themoviedb.org/3'

export default function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [library, setLibrary] = useState(
    JSON.parse(localStorage.getItem('cinevault')) || []
  )

  useEffect(() => {
    localStorage.setItem('cinevault', JSON.stringify(library))
  }, [library])

  async function searchMovie(title) {
    if (!title) return
    const res = await fetch(
      `${TMDB}/search/movie?api_key=${API_KEY}&language=es-ES&query=${title}`
    )
    const data = await res.json()
    setResults(data.results || [])
  }

  async function addMovie(movie) {
    if (library.find(m => m.id === movie.id)) return
    setLibrary([...library, movie])
  }

  async function startScanner() {
    const scanner = new Html5Qrcode('scanner')
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 150 } },
      async code => {
        scanner.stop()
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=isbn:${code}`
        )
        const data = await res.json()
        if (!data.items) return
        const title = data.items[0].volumeInfo.title
          .replace(/\\(Blu-ray\\)/gi, '')
          .trim()
        searchMovie(title)
      }
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ color: '#D4AF37', fontSize: 28 }}>🎬 CineVault</h1>

      <input
        placeholder="Buscar película"
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          searchMovie(e.target.value)
        }}
        style={{
          width: '100%',
          padding: 12,
          background: '#1a1a1a',
          color: 'white',
          marginTop: 12
        }}
      />

      <button
        onClick={startScanner}
        style={{
          marginTop: 12,
          width: '100%',
          background: '#D4AF37',
          color: 'black',
          padding: 12
        }}
      >
        Escanear Blu-ray
      </button>

      <div id="scanner" style={{ marginTop: 12 }}></div>

      <h2 style={{ marginTop: 24 }}>Resultados</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {results.map(m => (
          <div
            key={m.id}
            style={{ background: '#1a1a1a', padding: 8 }}
            onClick={() => addMovie(m)}
          >
            {m.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                style={{ width: '100%' }}
              />
            )}
            <p>{m.title}</p>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 24 }}>Mi colección</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {library.map(m => (
          <div key={m.id} style={{ background: '#1a1a1a', padding: 8 }}>
            {m.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                style={{ width: '100%' }}
              />
            )}
            <p>{m.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

