import { eq, sql } from "drizzle-orm";
import { hashPassword } from "./auth";
import { db } from "./db";
import {
  users, lotes, ventas, pagos, pqrs, passwordResets, cuotas,
  type User, type InsertUser,
  type Lote, type InsertLote,
  type Venta, type InsertVenta,
  type Pago, type InsertPago,
  type Pqrs, type InsertPqrs,
  type Cuota,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  getLotes(): Promise<Lote[]>;
  getLote(id: number): Promise<Lote | undefined>;
  createLote(lote: InsertLote): Promise<Lote>;
  updateLote(id: number, data: Partial<InsertLote>): Promise<Lote | undefined>;
  deleteLote(id: number): Promise<void>;

  getVentasByUser(userId: number): Promise<Venta[]>;
  getVenta(id: number): Promise<Venta | undefined>;
  getAllVentas(): Promise<Venta[]>;
  createVenta(venta: InsertVenta): Promise<Venta>;

  getPagosByVenta(ventaId: number): Promise<Pago[]>;
  getPagosByUser(userId: number): Promise<Pago[]>;
  getAllPagos(): Promise<Pago[]>;
  createPago(pago: InsertPago): Promise<Pago>;
  getTotalPagadoByVenta(ventaId: number): Promise<number>;

  updatePagoEstado(id: number, estado: string, motivoRechazo?: string): Promise<Pago | undefined>;

  getPqrsByUser(userId: number): Promise<Pqrs[]>;
  getAllPqrs(): Promise<Pqrs[]>;
  createPqrs(p: InsertPqrs): Promise<Pqrs>;
  updatePqrsEstado(id: number, estado: string, respuesta?: string): Promise<Pqrs | undefined>;

  getStats(): Promise<{ lotesDisponibles: number; lotesVendidos: number; ingresosMes: number; pqrsPendientes: number }>;

  getCuotasByVenta(ventaId: number): Promise<Cuota[]>;
  getCuota(id: number): Promise<Cuota | undefined>;
  createCuotasForVenta(ventaId: number, numCuotas: number, valorCuota: number, fechaInicio: Date): Promise<void>;
  marcarCuotaPagada(cuotaId: number, pagoId: number): Promise<Cuota | undefined>;
  actualizarInteresCuota(cuotaId: number, interes: number, valorTotal: number): Promise<void>;
  actualizarEstadoCuotasVencidas(): Promise<void>;

  createPasswordReset(userId: number, token: string, expiresAt: Date): Promise<void>;
  getPasswordResetByToken(token: string): Promise<{ id: number; userId: number; token: string; expiresAt: Date; used: number } | undefined>;
  markPasswordResetUsed(id: number): Promise<void>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = hashPassword(insertUser.password);
    const result = await db.insert(users).values({ ...insertUser, password: hashedPassword });
    const insertId = (result as any)[0].insertId;
    return (await this.getUser(insertId))!;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getLotes(): Promise<Lote[]> {
    return db.select().from(lotes);
  }

  async getLote(id: number): Promise<Lote | undefined> {
    const [lote] = await db.select().from(lotes).where(eq(lotes.id, id));
    return lote;
  }

  async createLote(lote: InsertLote): Promise<Lote> {
    const result = await db.insert(lotes).values(lote);
    const insertId = (result as any)[0].insertId;
    return (await this.getLote(insertId))!;
  }

  async updateLote(id: number, data: Partial<InsertLote>): Promise<Lote | undefined> {
    await db.update(lotes).set(data).where(eq(lotes.id, id));
    return this.getLote(id);
  }

  async deleteLote(id: number): Promise<void> {
    await db.delete(lotes).where(eq(lotes.id, id));
  }

  async getVentasByUser(userId: number): Promise<Venta[]> {
    return db.select().from(ventas).where(eq(ventas.userId, userId));
  }

  async getVenta(id: number): Promise<Venta | undefined> {
    const [venta] = await db.select().from(ventas).where(eq(ventas.id, id));
    return venta;
  }

  async getAllVentas(): Promise<Venta[]> {
    return db.select().from(ventas);
  }

  async createVenta(venta: InsertVenta): Promise<Venta> {
    const result = await db.insert(ventas).values(venta);
    const insertId = (result as any)[0].insertId;
    await db.update(lotes).set({ estado: "Vendido" }).where(eq(lotes.id, venta.loteId));
    return (await this.getVenta(insertId))!;
  }

  async getPagosByVenta(ventaId: number): Promise<Pago[]> {
    return db.select().from(pagos).where(eq(pagos.ventaId, ventaId));
  }

  async getPagosByUser(userId: number): Promise<Pago[]> {
    return db.select().from(pagos).where(eq(pagos.userId, userId));
  }

  async getAllPagos(): Promise<Pago[]> {
    return db.select().from(pagos);
  }

  async createPago(pago: InsertPago): Promise<Pago> {
    const result = await db.insert(pagos).values(pago);
    const insertId = (result as any)[0].insertId;
    const [created] = await db.select().from(pagos).where(eq(pagos.id, insertId));
    return created;
  }

  async getTotalPagadoByVenta(ventaId: number): Promise<number> {
    const result = await db.select({ total: sql<string>`COALESCE(SUM(${pagos.monto}), 0)` }).from(pagos).where(sql`${pagos.ventaId} = ${ventaId} AND ${pagos.estado} = 'Aprobado'`);
    return parseFloat(result[0]?.total || "0");
  }

  async updatePagoEstado(id: number, estado: string, motivoRechazo?: string): Promise<Pago | undefined> {
    const data: any = { estado };
    if (motivoRechazo !== undefined) data.motivoRechazo = motivoRechazo;
    await db.update(pagos).set(data).where(eq(pagos.id, id));
    const [updated] = await db.select().from(pagos).where(eq(pagos.id, id));
    return updated;
  }

  async getPqrsByUser(userId: number): Promise<Pqrs[]> {
    return db.select().from(pqrs).where(eq(pqrs.userId, userId));
  }

  async getAllPqrs(): Promise<Pqrs[]> {
    return db.select().from(pqrs);
  }

  async createPqrs(p: InsertPqrs): Promise<Pqrs> {
    const result = await db.insert(pqrs).values(p);
    const insertId = (result as any)[0].insertId;
    const [created] = await db.select().from(pqrs).where(eq(pqrs.id, insertId));
    return created;
  }

  async updatePqrsEstado(id: number, estado: string, respuesta?: string): Promise<Pqrs | undefined> {
    const data: any = { estado };
    if (respuesta) data.respuesta = respuesta;
    await db.update(pqrs).set(data).where(eq(pqrs.id, id));
    const [updated] = await db.select().from(pqrs).where(eq(pqrs.id, id));
    return updated;
  }

  async getStats() {
    const allLotes = await db.select().from(lotes);
    const lotesDisponibles = allLotes.filter(l => l.estado === "Disponible").length;
    const lotesVendidos = allLotes.filter(l => l.estado === "Vendido").length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const allPagos = await db.select().from(pagos);
    const ingresosMes = allPagos
      .filter(p => p.estado === "Aprobado" && p.fecha && new Date(p.fecha) >= startOfMonth)
      .reduce((sum, p) => sum + parseFloat(p.monto), 0);

    const allPqrs = await db.select().from(pqrs);
    const pqrsPendientes = allPqrs.filter(p => p.estado === "Pendiente").length;

    return { lotesDisponibles, lotesVendidos, ingresosMes, pqrsPendientes };
  }

  async getCuotasByVenta(ventaId: number): Promise<Cuota[]> {
    return db.select().from(cuotas).where(eq(cuotas.ventaId, ventaId));
  }

  async getCuota(id: number): Promise<Cuota | undefined> {
    const [cuota] = await db.select().from(cuotas).where(eq(cuotas.id, id));
    return cuota;
  }

  async createCuotasForVenta(ventaId: number, numCuotas: number, valorCuota: number, fechaInicio: Date): Promise<void> {
    for (let i = 1; i <= numCuotas; i++) {
      const fechaVencimiento = new Date(fechaInicio);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);
      await db.insert(cuotas).values({
        ventaId,
        numeroCuota: i,
        valorBase: valorCuota.toString(),
        interes: "0",
        valorTotal: valorCuota.toString(),
        fechaVencimiento,
      });
    }
  }

  async marcarCuotaPagada(cuotaId: number, pagoId: number): Promise<Cuota | undefined> {
    await db.update(cuotas).set({
      estado: "Pagada",
      pagoId,
      fechaPago: new Date(),
    }).where(eq(cuotas.id, cuotaId));
    return this.getCuota(cuotaId);
  }

  async actualizarInteresCuota(cuotaId: number, interes: number, valorTotal: number): Promise<void> {
    await db.update(cuotas).set({
      interes: interes.toString(),
      valorTotal: valorTotal.toString(),
    }).where(eq(cuotas.id, cuotaId));
  }

  async actualizarEstadoCuotasVencidas(): Promise<void> {
    const now = new Date();
    await db.update(cuotas)
      .set({ estado: "Vencida" })
      .where(sql`${cuotas.estado} = 'Pendiente' AND ${cuotas.fechaVencimiento} < ${now}`);
  }

  async createPasswordReset(userId: number, token: string, expiresAt: Date): Promise<void> {
    await db.insert(passwordResets).values({ userId, token, expiresAt });
  }

  async getPasswordResetByToken(token: string): Promise<{ id: number; userId: number; token: string; expiresAt: Date; used: number } | undefined> {
    const [row] = await db.select().from(passwordResets).where(eq(passwordResets.token, token));
    if (!row) return undefined;
    return { id: row.id, userId: row.userId, token: row.token, expiresAt: row.expiresAt!, used: row.used };
  }

  async markPasswordResetUsed(id: number): Promise<void> {
    await db.update(passwordResets).set({ used: 1 }).where(eq(passwordResets.id, id));
  }

  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
