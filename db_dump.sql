--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: detalle_venta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_venta (
    id_detalle integer NOT NULL,
    id_venta integer NOT NULL,
    id_producto integer NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL
);


ALTER TABLE public.detalle_venta OWNER TO postgres;

--
-- Name: detalle_venta_id_detalle_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_venta_id_detalle_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_venta_id_detalle_seq OWNER TO postgres;

--
-- Name: detalle_venta_id_detalle_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_venta_id_detalle_seq OWNED BY public.detalle_venta.id_detalle;


--
-- Name: empresas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresas (
    id_empresa integer NOT NULL,
    nombre text NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now()
);


ALTER TABLE public.empresas OWNER TO postgres;

--
-- Name: empresas_id_empresa_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empresas_id_empresa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.empresas_id_empresa_seq OWNER TO postgres;

--
-- Name: empresas_id_empresa_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empresas_id_empresa_seq OWNED BY public.empresas.id_empresa;


--
-- Name: gastos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gastos (
    id_gasto integer NOT NULL,
    concepto text NOT NULL,
    categoria character varying(50),
    monto numeric(10,2) NOT NULL,
    fecha date NOT NULL,
    id_usuario integer NOT NULL
);


ALTER TABLE public.gastos OWNER TO postgres;

--
-- Name: gastos_id_gasto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gastos_id_gasto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gastos_id_gasto_seq OWNER TO postgres;

--
-- Name: gastos_id_gasto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gastos_id_gasto_seq OWNED BY public.gastos.id_gasto;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    id_producto integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    categoria character varying(50),
    precio_unitario numeric(10,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    stock_minimo integer DEFAULT 5,
    id_usuario integer NOT NULL
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- Name: productos_id_producto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_id_producto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_id_producto_seq OWNER TO postgres;

--
-- Name: productos_id_producto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_id_producto_seq OWNED BY public.productos.id_producto;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    nombre character varying(100) NOT NULL,
    correo character varying(100) NOT NULL,
    "contrase├▒a" text NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_empresa integer DEFAULT 1 NOT NULL,
    rol text DEFAULT 'empleado'::text NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_usuario_seq OWNER TO postgres;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- Name: ventas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ventas (
    id_venta integer NOT NULL,
    fecha date DEFAULT now() NOT NULL,
    total numeric(10,2) NOT NULL,
    id_usuario integer NOT NULL
);


ALTER TABLE public.ventas OWNER TO postgres;

--
-- Name: ventas_id_venta_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ventas_id_venta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ventas_id_venta_seq OWNER TO postgres;

--
-- Name: ventas_id_venta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ventas_id_venta_seq OWNED BY public.ventas.id_venta;


--
-- Name: detalle_venta id_detalle; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_venta ALTER COLUMN id_detalle SET DEFAULT nextval('public.detalle_venta_id_detalle_seq'::regclass);


--
-- Name: empresas id_empresa; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresas ALTER COLUMN id_empresa SET DEFAULT nextval('public.empresas_id_empresa_seq'::regclass);


--
-- Name: gastos id_gasto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gastos ALTER COLUMN id_gasto SET DEFAULT nextval('public.gastos_id_gasto_seq'::regclass);


--
-- Name: productos id_producto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN id_producto SET DEFAULT nextval('public.productos_id_producto_seq'::regclass);


--
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- Name: ventas id_venta; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas ALTER COLUMN id_venta SET DEFAULT nextval('public.ventas_id_venta_seq'::regclass);


--
-- Data for Name: detalle_venta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_venta (id_detalle, id_venta, id_producto, cantidad, precio_unitario, subtotal) FROM stdin;
1	1	2	2	30.00	60.00
2	2	1	2	25.00	50.00
3	2	2	3	30.00	90.00
4	3	3	2	300.00	600.00
\.


--
-- Data for Name: empresas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empresas (id_empresa, nombre, fecha_creacion) FROM stdin;
1	Empresa por defecto	2025-04-19 01:04:11.751139
2	Magnetron	2025-04-19 01:39:58.160654
\.


--
-- Data for Name: gastos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gastos (id_gasto, concepto, categoria, monto, fecha, id_usuario) FROM stdin;
1	Pago de servicios	Servicio de energ├¡a	100.00	2025-04-19	1
2	Pago de alquiler	Alquiler	500.00	2025-04-15	1
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (id_producto, nombre, descripcion, categoria, precio_unitario, stock, stock_minimo, id_usuario) FROM stdin;
1	Camiseta 	Color negro en algod├│n	Ropa	25.00	51	5	1
2	Pantalon	En jean pegado al cuerpo	Ropa	30.00	20	5	1
3	Reloj 	Reloj en acero, marca Casio	Accesorio	300.00	18	5	2
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id_usuario, nombre, correo, "contrase├▒a", fecha_registro, id_empresa, rol) FROM stdin;
2	Yeison Rivera	yeison197@gmail.com	$2b$10$IiS74sqPYSSBJbE8hoFtc.qLhtN4xvbB2bKwUsVUCSkFkxZji5FDG	2025-04-19 01:47:02.497583	2	empleado
1	Yefferson Rivera	yefersonrivera96@gmail.com	$2b$10$kZWzFr8.38Y7EglZR39fB.Wpjxs4KlEA.HrNsWqOx98DkcaYQNZCy	2025-04-19 01:39:58.242719	2	admin
3	Luis Rodriguez	luis@gmail.com	$2b$10$T1UO5Um3EI0omLOt0a/9J.nEQL1tCl8GJdxDypnUsakbCwoKk5CFy	2025-04-19 01:49:30.483494	2	empleado
4	Admin Principal	admin@empresa.com	$2b$10$...	2025-04-19 04:29:05.43313	1	admin
5	Angela Mazuera	angela1974@gmail.com	$2b$10$TxuqHO8YA.hH5YeZjTetp.9UvT/WsLOCJdTiu3s87LfjqeHethRU6	2025-04-19 21:59:55.055479	2	empleado
\.


--
-- Data for Name: ventas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ventas (id_venta, fecha, total, id_usuario) FROM stdin;
1	2025-04-19	60.00	2
2	2025-04-19	140.00	1
3	2025-04-19	600.00	5
\.


--
-- Name: detalle_venta_id_detalle_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_venta_id_detalle_seq', 4, true);


--
-- Name: empresas_id_empresa_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empresas_id_empresa_seq', 2, true);


--
-- Name: gastos_id_gasto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gastos_id_gasto_seq', 2, true);


--
-- Name: productos_id_producto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_id_producto_seq', 3, true);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 5, true);


--
-- Name: ventas_id_venta_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ventas_id_venta_seq', 3, true);


--
-- Name: detalle_venta detalle_venta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_venta
    ADD CONSTRAINT detalle_venta_pkey PRIMARY KEY (id_detalle);


--
-- Name: empresas empresas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_pkey PRIMARY KEY (id_empresa);


--
-- Name: gastos gastos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gastos
    ADD CONSTRAINT gastos_pkey PRIMARY KEY (id_gasto);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id_producto);


--
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: ventas ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_pkey PRIMARY KEY (id_venta);


--
-- Name: detalle_venta detalle_venta_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_venta
    ADD CONSTRAINT detalle_venta_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto);


--
-- Name: detalle_venta detalle_venta_id_venta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_venta
    ADD CONSTRAINT detalle_venta_id_venta_fkey FOREIGN KEY (id_venta) REFERENCES public.ventas(id_venta);


--
-- Name: gastos gastos_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gastos
    ADD CONSTRAINT gastos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- Name: productos productos_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- Name: usuarios usuarios_id_empresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa) ON DELETE CASCADE;


--
-- Name: ventas ventas_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- PostgreSQL database dump complete
--

