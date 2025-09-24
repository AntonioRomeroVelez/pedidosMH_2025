import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Obtener todos los productos
export const obtenerProductos = () => api.get("/productos");

// Crear un nuevo producto (con datos en el body)
export const crearProducto = (data) => api.post("/productos", data);

// Ver un producto específico
export const verProducto = (id) => api.get(`/productos/${id}`);

export const actualizarProducto = (id, data) =>
  api.put(`/productos/${id}`, data);

export const eliminarProducto = (id) => api.delete(`/productos/${id}`);

export const registrarLote = (data) => api.post("/productos/lote", data);

