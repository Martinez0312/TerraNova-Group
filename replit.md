# Sistema Web Inmobiliario - TerraNova Group

## Overview
Full-stack real estate management web application for lot sales (ADSO-19 academic project). Built with React frontend and Express/MySQL backend. Designed for deployment on Railway with MySQL database.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui + wouter routing
- **Backend**: Express + TypeScript + Drizzle ORM
- **Database**: MySQL (mysql2 driver) with Drizzle schema management (mysql-core)
- **Auth**: Passport.js with local strategy + express-session (MySQL-backed sessions via express-mysql-session)

## Data Model (shared/schema.ts)
- **users**: id, email, password, nombre, apellido, documento, telefono, role (admin/cliente)
- **lotes**: id, codigo, etapa, area, precio, estado, ubicacion, descripcion
- **ventas**: id, userId, loteId, valorTotal, cuotas, valorCuota, fecha
- **pagos**: id, ventaId, userId, monto, concepto, fecha, estado (default: "En proceso"), motivoRechazo
- **pqrs**: id, userId, tipo, asunto, mensaje, nombre, email, loteRef, estado, respuesta
- **cuotas**: id, ventaId, numeroCuota, valorBase, interes, valorTotal, fechaVencimiento, estado (Pendiente/Pagada/Vencida), pagoId, fechaPago
- **password_resets**: id, userId, token, expiresAt, used

## Key Features
- User registration and login with roles (admin/cliente)
- Lot catalog with filtering by stage and status
- Lot purchase with installment plans (1-36 months)
- Payment tracking with admin approval flow (En proceso -> Aprobado/Rechazado)
- Payment approval: admin approves or rejects with mandatory reason for rejection
- Only approved payments count toward balance/progress calculations
- Installment schedule (cuotas): auto-generated monthly due dates when purchase has >1 cuota
- Overdue interest: 1.5% monthly on base value for overdue cuotas, calculated on demand
- Client can view full cronograma de pagos with due dates, interest, and status
- PQRS system (Peticiones, Quejas, Reclamos, Sugerencias)
- Admin dashboard with CRUD for lots, user management, payment tracking, PQRS management
- Client dashboard with lot portfolio, payment history, and PQRS tracking

## API Routes (all prefixed with /api)
- POST /api/auth/register, /api/auth/login, /api/auth/logout
- GET /api/auth/me
- GET/POST /api/lotes, PATCH/DELETE /api/lotes/:id
- GET/POST /api/ventas, GET /api/ventas/:id
- GET /api/cuotas/:ventaId (installment schedule with interest calculation)
- GET/POST /api/pagos, PATCH /api/pagos/:id/estado (admin approve/reject)
- GET/POST /api/pqrs, PATCH /api/pqrs/:id
- GET /api/admin/stats, /api/admin/users
- POST /api/seed (seeds initial data)

## Test Accounts
- Admin: admin@terranovagroup.com / admin123
- Client: carlos@ejemplo.com / cliente123

## Frontend Pages
- / (Home - landing page)
- /catalogo (Lot catalog with filters)
- /login, /registro (Auth page)
- /dashboard (Client dashboard)
- /admin (Admin dashboard)
- /proyecto (Project information)
- /pqrs (Customer service form)

## Design
- Typography: Playfair Display (headings) + Montserrat (body)
- Color scheme: Green forest primary (#2C5346), beige secondary, bronze accent
- Professional real estate portal aesthetic

## Database Configuration
- **Driver**: mysql2 (MySQL driver for Node.js)
- **ORM**: Drizzle ORM with mysql-core
- **Session Store**: express-mysql-session
- **Connection**: Uses DATABASE_URL env var, or individual DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME vars
- **SQL Script**: `database.sql` contains full schema + seed data for Railway deployment
- **Note**: MySQL does not support .returning() — storage layer uses insertId pattern with follow-up SELECT

## Email Notifications (server/email.ts)
- **Payment receipt**: Sent when admin approves a payment (PDF comprobante attached)
- **Payment rejection**: Sent when admin rejects (includes motivo de rechazo, PDF attached)
- **Congratulations**: Auto-sent when client completes all installment payments (certificado PDF attached)
- **Password reset**: Sent via forgot-password flow with token link (1hr expiry)
- Uses Brevo HTTP API (not SMTP — Railway blocks SMTP)
- PDF generated with PDFKit — professional design with shared helpers (pdfHeader, pdfSectionTitle, pdfRow, pdfDivider, pdfFooter)
- HTML emails use shared helpers (emailWrapper, emailInfoTable) for consistent branding
- Environment variables: BREVO_API_KEY, BREVO_SENDER_EMAIL (le.mj0312@gmail.com)
- Password hashing uses Node.js crypto.scryptSync (not bcryptjs — build issues on Railway)

## Password Reset Flow
- **POST /api/auth/forgot-password**: Generates token, stores in password_resets table, sends email via Brevo
- **POST /api/auth/reset-password**: Validates token (1hr expiry), updates user password
- password_resets table auto-created on server startup (server/index.ts)
- Frontend pages: ForgotPassword.tsx, ResetPassword.tsx

## Deployment (Railway)
1. Create MySQL database on Railway
2. Set DATABASE_URL environment variable
3. Run `database.sql` to create tables and seed data
4. Deploy the application
