import axios from "axios";

// Accedemos a la variable de entorno
const API_URL =
  import.meta.env.VITE_API_URL || "https://santeria-backend.onrender.com";
console.log("Intentando conectar a:", API_URL); // <--- REVISA ESTO EN LA CONSOLA

const api = axios.create({
  // URL de tu backend Flask (ajusta el puerto si es necesario)
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR: Pega el Token automáticamente en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response, // Si la respuesta es 2xx, la deja pasar normal
  (error) => {
    // Si no hay respuesta del servidor (backend caído)
    if (!error.response) {
      error.message = "No se pudo conectar con el servidor";
      return Promise.reject(error);
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Error en la operación";

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Opcional: window.location.href = "/login";
    }

    // 2. Modificamos el objeto de error antes de que llegue al componente
    // Así el componente solo tiene que leer err.message
    error.message = message;

    return Promise.reject(error);
  },
);

export default api;
