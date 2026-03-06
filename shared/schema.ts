import { mysqlTable, text, varchar, int, decimal, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  documento: varchar("documento", { length: 50 }).notNull(),
  telefono: text("telefono"),
  role: mysqlEnum("role", ["admin", "cliente"]).notNull().default("cliente"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lotes = mysqlTable("lotes", {
  id: int("id").primaryKey().autoincrement(),
  codigo: varchar("codigo", { length: 10 }).notNull(),
  etapa: mysqlEnum("etapa", ["Lanzamiento", "Preventa", "Construcción", "Entrega"]).notNull().default("Preventa"),
  area: int("area").notNull(),
  precio: decimal("precio", { precision: 15, scale: 2 }).notNull(),
  estado: mysqlEnum("estado", ["Disponible", "Reservado", "Vendido"]).notNull().default("Disponible"),
  ubicacion: text("ubicacion").notNull(),
  descripcion: text("descripcion"),
});

export const ventas = mysqlTable("ventas", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  loteId: int("lote_id").notNull(),
  valorTotal: decimal("valor_total", { precision: 15, scale: 2 }).notNull(),
  cuotas: int("cuotas").notNull().default(1),
  valorCuota: decimal("valor_cuota", { precision: 15, scale: 2 }).notNull(),
  fecha: timestamp("fecha").defaultNow(),
});

export const pagos = mysqlTable("pagos", {
  id: int("id").primaryKey().autoincrement(),
  ventaId: int("venta_id").notNull(),
  userId: int("user_id").notNull(),
  monto: decimal("monto", { precision: 15, scale: 2 }).notNull(),
  concepto: text("concepto").notNull(),
  fecha: timestamp("fecha").defaultNow(),
  estado: varchar("estado", { length: 50 }).notNull().default("En proceso"),
  motivoRechazo: text("motivo_rechazo"),
});

export const pqrs = mysqlTable("pqrs", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id"),
  tipo: mysqlEnum("tipo", ["Petición", "Queja", "Reclamo", "Sugerencia"]).notNull(),
  asunto: text("asunto").notNull(),
  mensaje: text("mensaje").notNull(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull(),
  loteRef: text("lote_ref"),
  estado: mysqlEnum("estado_pqrs", ["Pendiente", "En proceso", "Resuelto"]).notNull().default("Pendiente"),
  respuesta: text("respuesta"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cuotas = mysqlTable("cuotas", {
  id: int("id").primaryKey().autoincrement(),
  ventaId: int("venta_id").notNull(),
  numeroCuota: int("numero_cuota").notNull(),
  valorBase: decimal("valor_base", { precision: 15, scale: 2 }).notNull(),
  interes: decimal("interes", { precision: 15, scale: 2 }).notNull().default("0"),
  valorTotal: decimal("valor_total", { precision: 15, scale: 2 }).notNull(),
  fechaVencimiento: timestamp("fecha_vencimiento").notNull(),
  estado: mysqlEnum("estado_cuota", ["Pendiente", "Pagada", "Vencida"]).notNull().default("Pendiente"),
  pagoId: int("pago_id"),
  fechaPago: timestamp("fecha_pago"),
});

export const passwordResets = mysqlTable("password_resets", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: int("used").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCuotaSchema = createInsertSchema(cuotas).omit({ id: true, estado: true, pagoId: true, fechaPago: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, role: true });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(4) });
export const insertLoteSchema = createInsertSchema(lotes).omit({ id: true });
export const insertVentaSchema = createInsertSchema(ventas).omit({ id: true, fecha: true });
export const insertPagoSchema = createInsertSchema(pagos).omit({ id: true, fecha: true, estado: true });
export const insertPqrsSchema = createInsertSchema(pqrs).omit({ id: true, estado: true, respuesta: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Lote = typeof lotes.$inferSelect;
export type InsertLote = z.infer<typeof insertLoteSchema>;
export type Venta = typeof ventas.$inferSelect;
export type InsertVenta = z.infer<typeof insertVentaSchema>;
export type Pago = typeof pagos.$inferSelect;
export type InsertPago = z.infer<typeof insertPagoSchema>;
export type Pqrs = typeof pqrs.$inferSelect;
export type InsertPqrs = z.infer<typeof insertPqrsSchema>;
export type Cuota = typeof cuotas.$inferSelect;
export type InsertCuota = z.infer<typeof insertCuotaSchema>;
