# Sistema Web Inmobiliario - TerraNova Group
## Proyecto Academico ADSO-19

---

## 1. Descripcion General

Aplicacion web full-stack para la gestion inmobiliaria de venta de lotes de terreno. El sistema permite a los clientes explorar un catalogo de lotes, realizar compras con planes de financiacion a cuotas mensuales, hacer seguimiento de sus pagos y comunicarse con la empresa mediante el modulo PQRS (Peticiones, Quejas, Reclamos y Sugerencias).

El sistema cuenta con dos roles de usuario:
- **Administrador**: Gestion completa de lotes, usuarios, pagos y PQRS
- **Cliente**: Consulta de catalogo, compra de lotes, registro de pagos y envio de PQRS

---

## 2. Arquitectura del Sistema

| Capa | Tecnologia |
|------|-----------|
| **Frontend** | React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui + wouter (enrutamiento) |
| **Backend** | Express 5 + TypeScript + Node.js |
| **ORM** | Drizzle ORM con esquema mysql-core |
| **Base de datos** | MySQL 8 (driver mysql2 para Node.js) |
| **Autenticacion** | Passport.js con estrategia local + express-session (sesiones almacenadas en MySQL via express-mysql-session) |
| **Correo electronico** | Brevo (anteriormente Sendinblue) via API HTTP |
| **Generacion de PDF** | PDFKit (documentos tecnicos, comprobantes, certificados, manual de usuario) |
| **Despliegue** | Railway (servidor + base de datos MySQL) |

---

## 3. Modelo de Datos (shared/schema.ts)

### 3.1 Tabla `users` (Usuarios del sistema)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (AUTO_INCREMENT) | Identificador unico |
| email | TEXT | Correo electronico (usado como usuario de acceso) |
| password | TEXT | Contrasena hasheada con crypto.scryptSync |
| nombre | TEXT | Nombre del usuario |
| apellido | TEXT | Apellido del usuario |
| documento | VARCHAR(50) | Numero de documento de identidad |
| telefono | TEXT | Numero de telefono (opcional) |
| role | ENUM('admin', 'cliente') | Rol del usuario en el sistema |
| created_at | TIMESTAMP | Fecha de registro |

### 3.2 Tabla `lotes` (Lotes de terreno)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (AUTO_INCREMENT) | Identificador unico |
| codigo | VARCHAR(10) | Codigo del lote (ej: L01, L02) |
| etapa | ENUM | Etapa del proyecto: Lanzamiento, Preventa, Construccion, Entrega |
| area | INT | Area del lote en metros cuadrados |
| precio | DECIMAL(15,2) | Precio del lote en pesos colombianos |
| estado | ENUM | Estado: Disponible, Reservado, Vendido |
| ubicacion | TEXT | Ubicacion dentro del proyecto (manzana) |
| descripcion | TEXT | Descripcion detallada del lote |

### 3.3 Tabla `ventas` (Registro de ventas)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (AUTO_INCREMENT) | Identificador unico |
| user_id | INT (FK -> users) | Cliente que realizo la compra |
| lote_id | INT (FK -> lotes) | Lote adquirido |
| valor_total | DECIMAL(15,2) | Valor total de la venta |
| cuotas | INT | Numero de cuotas del plan de pago (1-36) |
| valor_cuota | DECIMAL(15,2) | Valor de cada cuota mensual |
| fecha | TIMESTAMP | Fecha de la venta |

### 3.4 Tabla `pagos` (Registro de pagos)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (AUTO_INCREMENT) | Identificador unico |
| venta_id | INT (FK -> ventas) | Venta asociada al pago |
| user_id | INT (FK -> users) | Cliente que realizo el pago |
| monto | DECIMAL(15,2) | Monto del pago |
| concepto | TEXT | Descripcion o concepto del pago |
| fecha | TIMESTAMP | Fecha del registro del pago |
| estado | VARCHAR(50) | Estado: "En proceso", "Aprobado", "Rechazado" |
| motivo_rechazo | TEXT | Motivo del rechazo (obligatorio al rechazar) |

### 3.5 Tabla `pqrs` (Peticiones, Quejas, Reclamos y Sugerencias)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (AUTO_INCREMENT) | Identificador unico |
| user_id | INT (FK -> users, nullable) | Usuario que envio la solicitud (null si es anonima) |
| tipo | ENUM | Tipo: Peticion, Queja, Reclamo, Sugerencia |
| asunto | TEXT | Titulo de la solicitud |
| mensaje | TEXT | Mensaje detallado |
| nombre | TEXT | Nombre del solicitante |
| email | TEXT | Correo del solicitante |
| lote_ref | TEXT | Referencia a un lote (opcional) |
| estado_pqrs | ENUM | Estado: Pendiente, En proceso, Resuelto |
| respuesta | TEXT | Respuesta del administrador |
| created_at | TIMESTAMP | Fecha de creacion |

### 3.6 Tabla `cuotas` (Cronograma de cuotas mensuales)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (AUTO_INCREMENT) | Identificador unico |
| venta_id | INT (FK -> ventas) | Venta asociada |
| numero_cuota | INT | Numero secuencial de la cuota |
| valor_base | DECIMAL(15,2) | Monto original de la cuota |
| interes | DECIMAL(15,2) | Interes acumulado por mora |
| valor_total | DECIMAL(15,2) | Valor base + interes |
| fecha_vencimiento | TIMESTAMP | Fecha limite de pago |
| estado_cuota | ENUM | Estado: Pendiente, Pagada, Vencida |
| pago_id | INT | Pago que cubrio esta cuota (si aplica) |
| fecha_pago | TIMESTAMP | Fecha en que se pago (si aplica) |

### 3.7 Tabla `password_resets` (Tokens de restablecimiento de contrasena)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT (AUTO_INCREMENT) | Identificador unico |
| user_id | INT (FK -> users) | Usuario que solicito el restablecimiento |
| token | VARCHAR(255) | Token unico de seguridad |
| expires_at | TIMESTAMP | Fecha de expiracion (1 hora) |
| used | INT | Indicador de uso (0 = no usado, 1 = usado) |
| created_at | TIMESTAMP | Fecha de creacion |

### 3.8 Tabla `sessions` (Sesiones de usuario)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| session_id | VARCHAR(128) | Identificador unico de sesion |
| expires | INT UNSIGNED | Timestamp de expiracion |
| data | MEDIUMTEXT | Datos serializados de la sesion |

---

## 4. Modelo Entidad-Relacion

```
users (1) ---< ventas (N)       : Un usuario puede tener multiples compras
lotes (1) ---< ventas (N)       : Un lote se vende una vez (relacion logica 1:1)
ventas (1) ---< pagos (N)       : Una venta tiene multiples pagos
ventas (1) ---< cuotas (N)      : Una venta tiene un cronograma de cuotas
users (1) ---< pagos (N)        : Un usuario realiza multiples pagos
users (1) ---< pqrs (N)         : Un usuario puede crear multiples PQRS
users (1) ---< password_resets (N) : Un usuario puede solicitar multiples tokens
```

Llaves foraneas:
- `ventas.user_id` -> `users.id` (ON DELETE CASCADE)
- `ventas.lote_id` -> `lotes.id` (ON DELETE CASCADE)
- `pagos.venta_id` -> `ventas.id` (ON DELETE CASCADE)
- `pagos.user_id` -> `users.id` (ON DELETE CASCADE)
- `pqrs.user_id` -> `users.id` (ON DELETE SET NULL)
- `cuotas.venta_id` -> `ventas.id` (ON DELETE CASCADE)
- `password_resets.user_id` -> `users.id` (ON DELETE CASCADE)

---

## 5. Funcionalidades Principales

### 5.1 Registro e Inicio de Sesion
- Registro de nuevos clientes con datos personales (nombre, apellido, documento, email, telefono, contrasena)
- Inicio de sesion con email y contrasena
- Cierre de sesion seguro
- Todos los usuarios nuevos se registran como "cliente"
- Las contrasenas se hashean con `crypto.scryptSync` (algoritmo seguro de Node.js)

### 5.2 Recuperacion de Contrasena
- El usuario solicita restablecimiento ingresando su email
- El sistema genera un token unico de 32 bytes con expiracion de 1 hora
- Se envia un correo con el enlace de restablecimiento via Brevo API
- El usuario ingresa su nueva contrasena y el token se marca como usado
- Archivos: `server/routes.ts` (endpoints), `server/email.ts` (envio), `client/src/pages/ForgotPassword.tsx`, `client/src/pages/ResetPassword.tsx`

### 5.3 Catalogo de Lotes
- Galeria publica de todos los lotes del proyecto (no requiere autenticacion)
- Filtros por estado (Disponible, Reservado, Vendido) y etapa (Lanzamiento, Preventa, Construccion, Entrega)
- Busqueda por texto (codigo de lote o ubicacion)
- Cada lote muestra: imagen, codigo, area, precio, estado, etapa, ubicacion y descripcion

### 5.4 Compra de Lotes
- Solo disponible para usuarios autenticados con rol "cliente"
- El cliente selecciona un lote disponible y elige el numero de cuotas (1 a 36 meses)
- El valor de cada cuota se calcula: `valor_cuota = precio_total / numero_cuotas`
- Al confirmar la compra, el lote cambia automaticamente a estado "Vendido"
- Si se selecciona mas de 1 cuota, se genera automaticamente un cronograma de cuotas con fechas de vencimiento mensuales

### 5.5 Gestion de Pagos (Flujo de aprobacion)
- El cliente registra un pago indicando el monto y un concepto descriptivo
- El monto debe ser igual o mayor al valor de una cuota
- El pago queda en estado "En proceso" hasta que el administrador lo revise
- **Aprobacion**: El administrador aprueba el pago, se marca la cuota pendiente mas antigua como "Pagada" y se envia un correo con comprobante PDF al cliente
- **Rechazo**: El administrador rechaza con motivo obligatorio y se envia correo de notificacion con PDF informativo
- Solo los pagos aprobados cuentan para el calculo de saldo y progreso

### 5.6 Cronograma de Cuotas e Intereses por Mora
- Se genera automaticamente al crear una venta con mas de 1 cuota
- Cada cuota tiene fecha de vencimiento mensual, valor base, interes y estado
- **Tasa de interes por mora**: 1.5% mensual sobre el valor base
- Formula: `interes = valor_base x 0.015 x meses_de_mora`
- Las cuotas vencidas cambian automaticamente a estado "Vencida"
- El cronograma muestra dias de mora y se resalta en rojo las cuotas vencidas
- Archivo: `server/routes.ts` (endpoint GET /api/cuotas/:ventaId con calculo de interes)

### 5.7 Sistema PQRS
- Modulo de atencion al cliente para Peticiones, Quejas, Reclamos y Sugerencias
- Disponible para usuarios registrados y visitantes anonimos
- El administrador responde y actualiza el estado (Pendiente, En proceso, Resuelto)
- Los clientes autenticados pueden dar seguimiento desde su panel

### 5.8 Panel del Cliente
- Tarjetas de resumen: lotes adquiridos, total invertido, total pagado
- Pestana "Mis Lotes": tarjetas de cada lote con barra de progreso de pago
- Pestana "Pagos": formulario para registrar pagos, cronograma de cuotas, historial de pagos con estado
- Pestana "Mis PQRS": listado de solicitudes enviadas con estado y respuesta

### 5.9 Panel de Administracion
- **Dashboard**: metricas de resumen (lotes disponibles, vendidos, ingresos del mes, PQRS pendientes) y tabla de ultimas ventas
- **Gestion de Lotes**: CRUD completo (crear, editar, eliminar lotes)
- **Gestion de Usuarios**: tabla con todos los usuarios registrados
- **Gestion Financiera**: lista de pagos pendientes con botones de aprobar/rechazar
- **Gestion de PQRS**: responder y actualizar estado de solicitudes

### 5.10 Correo de Felicitaciones al Completar Pagos
- Cuando un cliente completa todos sus pagos (total pagado >= valor del lote), el sistema envia automaticamente un correo de felicitaciones con 6 documentos PDF adjuntos:
  1. Certificado de pago total
  2. Planos arquitectonicos completos (con imagen del plano)
  3. Planos estructurales
  4. Diseno de redes hidraulicas y sanitarias
  5. Diseno electrico
  6. Aprobacion para licencia de construccion
- Los documentos tecnicos se generan segun el modelo arquitectonico asignado al lote

---

## 6. Modelos Arquitectonicos

El modelo se asigna automaticamente segun el area del lote adquirido:

| Criterio de Area | Modelo | Area Construida | Pisos | Habitaciones |
|-------------------|--------|-----------------|-------|-------------|
| >= 150 m2 | El Nogal | 180 m2 | 2 | 4 habitaciones + sala TV |
| >= 120 m2 y < 150 m2 | El Roble | 145 m2 | 2 | 3 habitaciones + estudio |
| < 120 m2 | El Cedro | 95 m2 | 1 | 2 habitaciones + sala de estar |

### El Roble (145 m2)
- 2 pisos, 3 habitaciones + estudio
- 3 banos (1 social, 2 privados con ducha)
- Sala-comedor integrado (32 m2), terraza panoramica (18 m2)
- Cocina americana con isla central (14 m2)
- Garaje cubierto para 2 vehiculos (28 m2)
- Extras: terraza panoramica, estudio multiuso, closets empotrados

### El Cedro (95 m2)
- 1 piso, 2 habitaciones + sala de estar
- 2 banos (1 social, 1 privado)
- Sala-comedor abierto (24 m2), jardin interior con iluminacion cenital
- Cocina integral lineal (10 m2)
- Zona de parqueo descubierta (15 m2)
- Extras: jardin interior, ventilacion cruzada, diseno bioclimatico

### El Nogal (180 m2)
- 2 pisos, 4 habitaciones + sala de TV
- 4 banos (1 social, 3 privados, 1 con tina)
- Sala principal (28 m2), comedor formal (16 m2), sala TV segundo piso (20 m2)
- Cocina gourmet con isla y despensa (22 m2)
- Garaje cubierto para 2 vehiculos con bodega (35 m2)
- Extras: zona BBQ (25 m2), walking closet, bano con tina, balcon

Logica de asignacion implementada en: `server/technical-docs.ts` (funcion `determinarModelo()`)

---

## 7. Rutas de la API (prefijo /api)

### 7.1 Autenticacion
| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| POST | /api/auth/register | Registro de nuevo usuario | Publico |
| POST | /api/auth/login | Inicio de sesion | Publico |
| POST | /api/auth/logout | Cierre de sesion | Autenticado |
| GET | /api/auth/me | Obtener perfil del usuario actual | Autenticado |
| POST | /api/auth/forgot-password | Solicitar restablecimiento de contrasena | Publico |
| POST | /api/auth/reset-password | Restablecer contrasena con token | Publico |

### 7.2 Lotes
| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| GET | /api/lotes | Listar todos los lotes | Publico |
| GET | /api/lotes/:id | Obtener detalle de un lote | Publico |
| POST | /api/lotes | Crear nuevo lote | Admin |
| PATCH | /api/lotes/:id | Actualizar un lote | Admin |
| DELETE | /api/lotes/:id | Eliminar un lote | Admin |

### 7.3 Ventas
| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| GET | /api/ventas | Listar ventas (del usuario o todas si admin) | Autenticado |
| GET | /api/ventas/:id | Detalle de una venta con total pagado e historial | Autenticado |
| POST | /api/ventas | Registrar una compra | Autenticado |

### 7.4 Pagos
| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| GET | /api/pagos | Listar pagos (del usuario o todos si admin) | Autenticado |
| POST | /api/pagos | Registrar un nuevo pago | Autenticado |
| PATCH | /api/pagos/:id/estado | Aprobar o rechazar un pago | Admin |

### 7.5 Cuotas
| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| GET | /api/cuotas/:ventaId | Obtener cronograma de cuotas con calculo de intereses | Autenticado |

### 7.6 PQRS
| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| GET | /api/pqrs | Listar solicitudes PQRS | Autenticado |
| POST | /api/pqrs | Crear nueva solicitud | Publico |
| PATCH | /api/pqrs/:id | Responder y actualizar estado | Admin |

### 7.7 Administracion y Utilidades
| Metodo | Ruta | Descripcion | Acceso |
|--------|------|-------------|--------|
| GET | /api/admin/stats | Obtener estadisticas del dashboard | Admin |
| GET | /api/admin/users | Listar todos los usuarios | Admin |
| POST | /api/seed | Sembrar datos iniciales (admin + cliente + 8 lotes) | Publico |
| POST | /api/debug/migrate-passwords | Migrar contrasenas en texto plano a hash scrypt | Publico |
| GET | /api/manual-usuario | Descargar manual de usuario completo en PDF | Publico |

---

## 8. Paginas del Frontend

| Ruta | Componente | Descripcion |
|------|-----------|-------------|
| / | Home | Pagina principal con hero, caracteristicas y modelos |
| /catalogo | Catalog | Galeria de lotes con filtros y busqueda |
| /login | Auth | Formulario de inicio de sesion |
| /registro | Auth | Formulario de registro de nuevo usuario |
| /dashboard | ClientDashboard | Panel del cliente (lotes, pagos, PQRS) |
| /admin | AdminDashboard | Panel de administracion |
| /proyecto | ProjectInfo | Informacion del proyecto y modelos arquitectonicos |
| /pqrs | PQRS | Formulario de peticiones, quejas, reclamos y sugerencias |
| /recuperar-password | ForgotPassword | Solicitar restablecimiento de contrasena |
| /restablecer-password | ResetPassword | Ingresar nueva contrasena con token |

---

## 9. Notificaciones por Correo Electronico

El sistema envia correos automaticos en los siguientes eventos, todos con documentos PDF adjuntos con diseno profesional:

| Evento | Destinatario | Contenido |
|--------|-------------|-----------|
| Pago aprobado | Cliente | Comprobante PDF con datos del cliente, lote, cuota, monto y resumen financiero con barra de progreso |
| Pago rechazado | Cliente | Notificacion con motivo de rechazo detallado y PDF informativo |
| Pago completado | Cliente | Correo de felicitaciones + 6 PDFs (certificado + 5 documentos tecnicos del modelo asignado) |
| Recuperar contrasena | Cliente | Enlace de restablecimiento con token de seguridad (expira en 1 hora) |

### Documentos Tecnicos (al completar pago)
1. **Certificado de Pago Total**: Documento oficial que certifica la completitud de todos los pagos
2. **Planos Arquitectonicos**: Distribucion de espacios, areas, fachadas, planta general con imagen del plano
3. **Planos Estructurales**: Cimentacion, columnas, vigas, sistema estructural (NSR-10)
4. **Diseno Hidraulico y Sanitario**: Redes de agua potable, aguas negras, aguas lluvias
5. **Diseno Electrico**: Circuitos, tablero de distribucion, puntos electricos (RETIE, NTC 2050)
6. **Licencia de Construccion**: Documento de aprobacion para tramite ante curaduria urbana

Archivos relacionados:
- `server/email.ts`: Generacion de PDFs de comprobantes y envio de correos via Brevo API
- `server/technical-docs.ts`: Generacion de los 5 documentos tecnicos por modelo
- `server/manual-usuario.ts`: Generacion del manual de usuario en PDF

---

## 10. Diseno Visual

- **Tipografia**: Playfair Display (titulos y encabezados) + Montserrat (cuerpo de texto)
- **Paleta de colores**: Verde bosque primario (#2C5346), beige secundario, bronce como acento
- **Estetica**: Portal inmobiliario profesional con componentes de shadcn/ui
- **Responsivo**: Se adapta a dispositivos moviles, tablets y escritorio
- **Logo**: `/client/public/logo-terranova.png`

---

## 11. Configuracion de Base de Datos

- **Motor**: MySQL 8
- **Driver**: mysql2 (driver nativo para Node.js)
- **ORM**: Drizzle ORM con tipos mysql-core
- **Almacen de sesiones**: express-mysql-session (sesiones en tabla `sessions`)
- **Conexion**: Utiliza la variable de entorno `DATABASE_URL`, o variables individuales: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- **Script SQL**: El archivo `database.sql` contiene el esquema completo de todas las tablas con datos iniciales (seed) para despliegue en Railway
- **Nota tecnica**: MySQL no soporta `.returning()` en consultas INSERT/UPDATE/DELETE — la capa de almacenamiento (`server/storage.ts`) utiliza el patron `insertId` con un SELECT posterior

---

## 12. Estructura de Archivos Principales

```
/
├── client/                         # Frontend React
│   ├── src/
│   │   ├── pages/                  # Paginas de la aplicacion
│   │   │   ├── Home.tsx            # Pagina principal
│   │   │   ├── Catalog.tsx         # Catalogo de lotes
│   │   │   ├── Auth.tsx            # Login y registro
│   │   │   ├── ClientDashboard.tsx # Panel del cliente
│   │   │   ├── AdminDashboard.tsx  # Panel de administracion
│   │   │   ├── ProjectInfo.tsx     # Informacion del proyecto
│   │   │   ├── PQRS.tsx            # Formulario PQRS
│   │   │   ├── ForgotPassword.tsx  # Recuperar contrasena
│   │   │   └── ResetPassword.tsx   # Restablecer contrasena
│   │   ├── components/             # Componentes reutilizables
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx      # Contenedor principal (Navbar + Footer)
│   │   │   │   ├── Navbar.tsx      # Barra de navegacion
│   │   │   │   └── Footer.tsx      # Pie de pagina
│   │   │   └── ui/                 # Componentes shadcn/ui
│   │   ├── hooks/
│   │   │   └── use-auth.tsx        # Hook de autenticacion
│   │   ├── lib/
│   │   │   └── queryClient.ts      # Configuracion de React Query
│   │   └── App.tsx                 # Enrutador principal
│   ├── public/                     # Archivos estaticos
│   │   ├── logo-terranova.png      # Logo de TerraNova Group
│   │   └── plano-arquitectonico.png # Imagen del plano para PDFs
│   └── index.html                  # HTML principal con meta tags
├── server/                         # Backend Express
│   ├── index.ts                    # Punto de entrada del servidor
│   ├── routes.ts                   # Rutas de la API REST
│   ├── storage.ts                  # Capa de almacenamiento (interfaz + implementacion)
│   ├── db.ts                       # Conexion a MySQL con mysql2
│   ├── auth.ts                     # Configuracion de Passport.js y hash de contrasenas
│   ├── email.ts                    # Generacion de PDFs y envio de correos via Brevo
│   ├── technical-docs.ts           # Generacion de 5 documentos tecnicos por modelo
│   ├── manual-usuario.ts           # Generacion del manual de usuario en PDF
│   ├── static.ts                   # Servir archivos estaticos en produccion
│   └── vite.ts                     # Configuracion de Vite para desarrollo
├── shared/
│   └── schema.ts                   # Esquema de base de datos (Drizzle) + tipos TypeScript + validaciones Zod
├── database.sql                    # Script SQL completo para crear tablas y datos iniciales
├── drizzle.config.ts               # Configuracion de Drizzle Kit (dialecto MySQL)
├── package.json                    # Dependencias y scripts
└── Manual_Usuario_TerraNova_Group.pdf  # Manual de usuario descargable
```

---

## 13. Variables de Entorno

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| DATABASE_URL | URL de conexion a MySQL | mysql://user:pass@host:3306/terranova |
| DB_HOST | Host del servidor MySQL (alternativa) | localhost |
| DB_PORT | Puerto del servidor MySQL (alternativa) | 3306 |
| DB_USER | Usuario de MySQL (alternativa) | root |
| DB_PASSWORD | Contrasena de MySQL (alternativa) | password |
| DB_NAME | Nombre de la base de datos (alternativa) | terranova |
| SESSION_SECRET | Clave secreta para las sesiones | terranova-secret-key-2024 |
| BREVO_API_KEY | Clave de API de Brevo para envio de correos | xkeysib-... |
| BREVO_SENDER_EMAIL | Correo remitente para notificaciones | le.mj0312@gmail.com |
| PORT | Puerto del servidor (por defecto 5000) | 5000 |
| NODE_ENV | Entorno de ejecucion | production / development |

---

## 14. Cuentas de Prueba

| Rol | Correo | Contrasena |
|-----|--------|------------|
| Administrador | admin@terranovagroup.com | admin123 |
| Cliente | carlos@ejemplo.com | cliente123 |

Nota: Despues de insertar los datos iniciales con el script `database.sql`, es necesario ejecutar `POST /api/debug/migrate-passwords` para hashear las contrasenas que se insertan en texto plano.

---

## 15. Despliegue en Railway

1. Crear un servicio MySQL en Railway
2. Configurar las variables de entorno (DATABASE_URL, SESSION_SECRET, BREVO_API_KEY, BREVO_SENDER_EMAIL, PORT=5000, NODE_ENV=production)
3. Ejecutar el script `database.sql` en la base de datos para crear las tablas y los datos iniciales
4. Desplegar la aplicacion desde el repositorio de GitHub
5. Ejecutar `POST /api/debug/migrate-passwords` para hashear las contrasenas de los usuarios seed

### Scripts de NPM
| Script | Comando | Descripcion |
|--------|---------|-------------|
| dev | `NODE_ENV=development tsx server/index.ts` | Inicia el servidor en modo desarrollo con Vite |
| build | `tsx script/build.ts` | Compila frontend (Vite) y backend (esbuild) |
| start | `NODE_ENV=production node dist/index.cjs` | Inicia el servidor en produccion |
| check | `tsc` | Verifica tipos TypeScript |
| db:push | `drizzle-kit push` | Sincroniza el esquema con la base de datos |

---

## 16. Seguridad

- Las contrasenas se hashean con `crypto.scryptSync` (algoritmo aprobado por NIST)
- Las sesiones se almacenan en MySQL (no en memoria)
- Los tokens de restablecimiento de contrasena expiran en 1 hora y solo se usan una vez
- Los endpoints protegidos requieren autenticacion via middleware `requireAuth`
- Los endpoints de administracion requieren rol "admin" via middleware `requireAdmin`
- Las validaciones de entrada se realizan con esquemas Zod (drizzle-zod)
- Railway maneja HTTPS/TLS automaticamente

---

## 17. Tecnologias: Requisitos vs. Implementacion

### 17.1 Tecnologias Minimas Requeridas por la Tarea

El proyecto academico ADSO-19 establece las siguientes tecnologias minimas:

| Capa | Tecnologia Requerida |
|------|---------------------|
| **Backend** | Node.js, Express |
| **Frontend** | HTML5, CSS3, JavaScript |

### 17.2 Cumplimiento de los Requisitos

El proyecto cumple al 100% con todas las tecnologias exigidas. A continuacion se detalla como se implementa cada una:

| Tecnologia Requerida | Estado | Como se usa en el proyecto |
|----------------------|--------|---------------------------|
| **Node.js** | Cumplida | El servidor se ejecuta sobre Node.js (v20). Es el entorno de ejecucion tanto para el backend (Express) como para el proceso de compilacion (Vite, esbuild, tsx). Todo el codigo del servidor en la carpeta `server/` se ejecuta sobre Node.js |
| **Express** | Cumplida | Express 5 es el framework HTTP del backend. Gestiona todas las rutas de la API REST (`server/routes.ts`), los middlewares de autenticacion, el manejo de sesiones, la validacion de datos y el servicio de archivos estaticos en produccion (`server/static.ts`) |
| **HTML5** | Cumplida | El punto de entrada de la aplicacion es `client/index.html`, un documento HTML5 estandar con meta tags Open Graph, carga de fuentes y el contenedor raiz de React. Toda la interfaz se renderiza como HTML5 semantico en el navegador |
| **CSS3** | Cumplida | Los estilos de toda la aplicacion se escriben con CSS3 a traves de Tailwind CSS, que genera CSS3 puro y optimizado. Las clases como `flex`, `grid`, `transition`, `shadow`, `rounded`, `animate` y los media queries responsivos son todas caracteristicas nativas de CSS3. El archivo compilado final es CSS3 estandar |
| **JavaScript** | Cumplida | Todo el codigo del frontend y backend esta escrito en TypeScript, que es un superconjunto de JavaScript. TypeScript se compila a JavaScript estandar antes de ejecutarse. El navegador recibe y ejecuta JavaScript puro (ES2020+). Node.js ejecuta JavaScript en el servidor |

### 17.3 Tecnologias Adicionales Utilizadas

Ademas de las tecnologias minimas requeridas, el proyecto incorpora tecnologias modernas del ecosistema JavaScript que agregan valor al desarrollo sin salir del stack exigido:

| Tecnologia Adicional | Justificacion |
|----------------------|---------------|
| **TypeScript** | Superconjunto de JavaScript que agrega tipado estatico. Se compila a JavaScript estandar. Previene errores en tiempo de desarrollo y mejora la mantenibilidad del codigo. No reemplaza JavaScript, lo extiende |
| **React 19** | Biblioteca de JavaScript para construir interfaces de usuario con componentes reutilizables. Genera HTML5 y JavaScript estandar en el navegador. Es la biblioteca frontend mas utilizada en la industria |
| **Tailwind CSS v4** | Framework de utilidades CSS que genera CSS3 puro y optimizado. No introduce un lenguaje diferente a CSS; las clases son atajos para propiedades CSS3 nativas (flexbox, grid, transiciones, media queries) |
| **MySQL 8** | Base de datos relacional. Se eligio MySQL por ser la base de datos mas enseñada en el programa ADSO y por su compatibilidad con Railway para despliegue en la nube |
| **Drizzle ORM** | ORM (Object-Relational Mapping) para Node.js que permite escribir consultas a MySQL de forma tipada y segura. Genera consultas SQL estandar. Evita inyeccion SQL y errores de sintaxis |
| **Passport.js** | Middleware de autenticacion para Express (Node.js). Implementa el flujo de login/logout con sesiones almacenadas en MySQL |
| **PDFKit** | Biblioteca de Node.js para generar documentos PDF programaticamente. Se usa para los comprobantes de pago, certificados, documentos tecnicos y el manual de usuario |
| **Brevo API** | Servicio de correo electronico transaccional. Se integra via API HTTP desde Node.js/Express para enviar notificaciones automaticas con archivos PDF adjuntos |
| **shadcn/ui** | Coleccion de componentes de interfaz (botones, dialogos, tablas, formularios) construidos con React y CSS3. Proporciona una apariencia profesional y accesible |
| **Vite** | Herramienta de compilacion y servidor de desarrollo para el frontend. Compila TypeScript a JavaScript y optimiza los archivos CSS y HTML para produccion |
| **Railway** | Plataforma de despliegue en la nube. Aloja el servidor Node.js/Express y la base de datos MySQL con HTTPS automatico |

### 17.4 Relacion entre Tecnologias Requeridas y Adicionales

```
Tecnologias Requeridas          Tecnologias del Proyecto
========================        ========================

Node.js  ──────────────────────  Node.js v20 (identico)
Express  ──────────────────────  Express v5 (identico)

HTML5    ──────────────────────  React genera HTML5 en el navegador
                                 (client/index.html es HTML5 puro)

CSS3     ──────────────────────  Tailwind CSS compila a CSS3 puro
                                 (flexbox, grid, transiciones, media queries)

JavaScript ────────────────────  TypeScript se compila a JavaScript
                                 (el navegador ejecuta JS estandar)
```

### 17.5 Nota Importante

El proyecto NO reemplaza ninguna tecnologia exigida. Todas las tecnologias adicionales son extensiones o herramientas del ecosistema JavaScript/CSS que se compilan a las tecnologias base requeridas:

- TypeScript -> se compila a **JavaScript**
- React -> genera **HTML5** y ejecuta **JavaScript** en el navegador
- Tailwind CSS -> genera **CSS3** puro
- Express 5 -> es **Express** (version actualizada)
- Node.js v20 -> es **Node.js** (version LTS actual)

La eleccion de estas herramientas adicionales refleja las practicas actuales de la industria del desarrollo web y agrega valor academico al demostrar conocimiento de tecnologias modernas, manteniendo total compatibilidad con los requisitos establecidos.

---

## 18. Dependencias Principales

| Paquete | Version | Uso |
|---------|---------|-----|
| react | ^19.2.0 | Biblioteca de interfaz de usuario |
| express | ^5.0.1 | Framework web del backend |
| mysql2 | ^3.18.2 | Driver MySQL para Node.js |
| drizzle-orm | ^0.39.3 | ORM para consultas tipadas a MySQL |
| passport | ^0.7.0 | Autenticacion de usuarios |
| express-session | ^1.18.1 | Gestion de sesiones |
| express-mysql-session | ^3.0.3 | Almacenamiento de sesiones en MySQL |
| pdfkit | ^0.17.2 | Generacion de documentos PDF |
| drizzle-zod | ^0.7.0 | Validacion de esquemas con Zod |
| tailwindcss | ^4.1.14 | Framework CSS utilitario |
| wouter | ^3.3.5 | Enrutamiento del frontend |
| @tanstack/react-query | ^5.60.5 | Manejo de estado asincronico |
| framer-motion | ^12.23.24 | Animaciones del frontend |
| lucide-react | ^0.545.0 | Iconos SVG |
