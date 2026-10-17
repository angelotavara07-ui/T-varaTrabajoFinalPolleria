
import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string;
}

interface ProductoCarrito {
  producto: Producto;
  cantidad: number;
}

interface Pedido {
  codigo: string;
  cliente: string;
  fecha: string;
  items: {
    nombre: string;
    precio: number;
    cantidad: number;
  }[];
  total: number;
  estado: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  categoriaSeleccionada = 'Todos';

  categorias = ['Todos', 'Hamburguesas', 'Pizzas', 'Bebidas', 'Complementos'];

  productos: Producto[] = [
    { id: 1, nombre: 'Hamburguesa Clásica', descripcion: 'Carne, queso, lechuga, tomate y salsa especial.', precio: 15.90, categoria: 'Hamburguesas', imagen: '🍔' },
    { id: 2, nombre: 'Doble Cheese', descripcion: 'Doble carne, doble queso y salsa de la casa.', precio: 21.90, categoria: 'Hamburguesas', imagen: '🍔' },
    { id: 3, nombre: 'Pizza Pepperoni', descripcion: 'Mozzarella, pepperoni y salsa de tomate.', precio: 24.90, categoria: 'Pizzas', imagen: '🍕' },
    { id: 4, nombre: 'Pizza Familiar', descripcion: 'Pizza para compartir con abundante queso.', precio: 34.90, categoria: 'Pizzas', imagen: '🍕' },
    { id: 5, nombre: 'Gaseosa Helada', descripcion: 'Bebida refrescante de 500 ml.', precio: 4.50, categoria: 'Bebidas', imagen: '🥤' },
    { id: 6, nombre: 'Limonada', descripcion: 'Limonada fresca preparada al momento.', precio: 6.00, categoria: 'Bebidas', imagen: '🍋' },
    { id: 7, nombre: 'Papas Fritas', descripcion: 'Papas doradas y crujientes.', precio: 7.90, categoria: 'Complementos', imagen: '🍟' },
    { id: 8, nombre: 'Nuggets', descripcion: 'Porción de nuggets de pollo.', precio: 10.90, categoria: 'Complementos', imagen: '🍗' }
  ];

  carrito: ProductoCarrito[] = [];
  pedidos: Pedido[] = [];
  pedidoReciente: Pedido | null = null;
  nombreClienteValue = '';
  constructor() {
    this.cargarDatos();
  }

  cargarDatos(): void {
    try {
      const carritoGuardado = localStorage.getItem('fastorder-carrito');
      const pedidosGuardados = localStorage.getItem('fastorder-pedidos');

      if (carritoGuardado) {
        this.carrito = JSON.parse(carritoGuardado);
      }

      if (pedidosGuardados) {
        this.pedidos = JSON.parse(pedidosGuardados);
      }
    } catch {
      this.carrito = [];
      this.pedidos = [];
    }
  }

  guardarCarrito(): void {
    localStorage.setItem('fastorder-carrito', JSON.stringify(this.carrito));
  }

  get productosFiltrados(): Producto[] {
    if (this.categoriaSeleccionada === 'Todos') {
      return this.productos;
    }

    return this.productos.filter(
      producto => producto.categoria === this.categoriaSeleccionada
    );
  }

  get cantidadTotal(): number {
    return this.carrito.reduce(
      (total, item) => total + item.cantidad, 0
    );
  }

  get total(): number {
    return this.carrito.reduce(
      (suma, item) => suma + item.producto.precio * item.cantidad, 0
    );
  }

  seleccionarCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
  }

  agregarAlCarrito(producto: Producto): void {
    const item = this.carrito.find(
      elemento => elemento.producto.id === producto.id
    );

    if (item) {
      item.cantidad++;
    } else {
      this.carrito.push({ producto, cantidad: 1 });
    }

    this.guardarCarrito();
  }

  cambiarCantidad(id: number, cambio: number): void {
    const item = this.carrito.find(
      elemento => elemento.producto.id === id
    );

    if (!item) {
      return;
    }

    item.cantidad += cambio;

    if (item.cantidad <= 0) {
      this.carrito = this.carrito.filter(
        elemento => elemento.producto.id !== id
      );
    }

    this.guardarCarrito();
  }

  vaciarCarrito(): void {
    this.carrito = [];
    this.guardarCarrito();
  }

  confirmarPedido(nombre: string): void {
    if (!nombre.trim() || this.carrito.length === 0) {
      return;
    }

    const pedido: Pedido = {
      codigo: 'FO-' + Date.now().toString().slice(-6),
      cliente: nombre.trim(),
      fecha: new Date().toLocaleString('es-PE'),
      items: this.carrito.map(item => ({
        nombre: item.producto.nombre,
        precio: item.producto.precio,
        cantidad: item.cantidad
      })),
      total: this.total,
      estado: 'Pendiente'
    };

    this.pedidos.unshift(pedido);
    this.pedidoReciente = pedido;

    localStorage.setItem(
      'fastorder-pedidos',
      JSON.stringify(this.pedidos)
    );

    this.vaciarCarrito();
  }

  cambiarEstadoPedido(codigo: string, estado: string): void {
    const pedido = this.pedidos.find(
      elemento => elemento.codigo === codigo
    );

    if (pedido) {
      pedido.estado = estado;

      localStorage.setItem(
        'fastorder-pedidos',
        JSON.stringify(this.pedidos)
      );
    }
  }
}
