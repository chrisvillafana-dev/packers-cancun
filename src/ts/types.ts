export interface NewsItem {
  id: string;
  date: string; // formato: "2026-07-04"
  tag: string; // ej. "Resultado", "Aviso", "Convocatoria"
  title: string;
  excerpt: string;
  image?: string; // ruta dentro de /images, ej. "/images/noticia-1.jpg"
}

export interface Game {
  id: string;
  date: string;
  time: string;
  category: string; // ej. "Mixto Libre"
  opponent: string;
  location: string;
  status: "proximo" | "jugado";
  result?: string; // ej. "Packers 28 - 14 Rivales"
  outcome?: "victoria" | "derrota" | "empate";
}

export interface Category {
  id: string;
  name: string;
  description: string;
  schedule: string;
  image?: string;
}

export interface PlayerStat {
  jugador: string;
  categoria: string;
  touchdowns: number;
  intercepciones: number;
  banderas: number;
  partidosJugados: number;
}

export interface Reel {
  id: string;
  title: string;
  video?: string; // ruta dentro de /videos
  thumbnail?: string; // ruta dentro de /images
  caption: string;
}
