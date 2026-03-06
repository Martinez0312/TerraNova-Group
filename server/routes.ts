import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import passport from "./auth";
import { requireAuth, requireAdmin } from "./auth";
import { insertUserSchema, loginSchema, insertLoteSchema, insertPagoSchema, insertPqrsSchema, type Cuota } from "@shared/schema";
import { ZodError } from "zod";
import { sendPaymentReceipt, sendPaymentRejection, sendPasswordResetEmail, sendCompletionCongratulations } from "./email";
import { randomBytes } from "crypto";
import { hashPassword } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByEmail(data.email);
      if (existing) return res.status(400).json({ message: "El correo ya está registrado" });
      const user = await storage.createUser(data);
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Error al iniciar sesión" });
        const { password, ...safe } = user;
        return res.status(201).json(safe);
      });
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: err.errors[0].message });
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ message: "Error del servidor" });
      if (!user) return res.status(401).json({ message: info?.message || "Credenciales incorrectas" });
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Error al iniciar sesión" });
        const { password, ...safe } = user;
        return res.json(safe);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Sesión cerrada" });
    });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "El correo es requerido" });

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña." });
      }

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await storage.createPasswordReset(user.id, token, expiresAt);

      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers["x-forwarded-host"] || req.headers.host;
      const baseUrl = `${protocol}://${host}`;
      await sendPasswordResetEmail(user, token, baseUrl);

      return res.json({ message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña." });
    } catch (err) {
      console.error("Error en forgot-password:", err);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) return res.status(400).json({ message: "Token y contraseña son requeridos" });
      if (password.length < 4) return res.status(400).json({ message: "La contraseña debe tener al menos 4 caracteres" });

      const resetRecord = await storage.getPasswordResetByToken(token);
      if (!resetRecord) return res.status(400).json({ message: "El enlace no es válido o ya fue utilizado" });
      if (resetRecord.used) return res.status(400).json({ message: "Este enlace ya fue utilizado" });
      if (new Date() > resetRecord.expiresAt) return res.status(400).json({ message: "El enlace ha expirado. Solicite uno nuevo." });

      const hashed = hashPassword(password);
      await storage.updateUserPassword(resetRecord.userId, hashed);
      await storage.markPasswordResetUsed(resetRecord.id);

      return res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (err) {
      console.error("Error en reset-password:", err);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "No autorizado" });
    const { password, ...safe } = req.user!;
    res.json(safe);
  });

  app.post("/api/debug/migrate-passwords", async (_req, res) => {
    const { hashPassword, comparePassword } = await import("./auth");
    const { db: database } = await import("./db");
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const allUsers = await storage.getAllUsers();
    let migrated = 0;
    for (const user of allUsers) {
      if (!user.password.includes(":")) {
        const hashed = hashPassword(user.password);
        await database.update(users).set({ password: hashed }).where(eq(users.id, user.id));
        migrated++;
      }
    }
    res.json({ message: `${migrated} contraseñas migradas`, total: allUsers.length, migrated });
  });

  app.get("/api/lotes", async (_req, res) => {
    const allLotes = await storage.getLotes();
    res.json(allLotes);
  });

  app.get("/api/lotes/:id", async (req, res) => {
    const lote = await storage.getLote(parseInt(req.params.id));
    if (!lote) return res.status(404).json({ message: "Lote no encontrado" });
    res.json(lote);
  });

  app.post("/api/lotes", requireAdmin, async (req, res) => {
    try {
      const data = insertLoteSchema.parse(req.body);
      const lote = await storage.createLote(data);
      res.status(201).json(lote);
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: err.errors[0].message });
      return res.status(500).json({ message: "Error al crear lote" });
    }
  });

  app.patch("/api/lotes/:id", requireAdmin, async (req, res) => {
    const lote = await storage.updateLote(parseInt(req.params.id), req.body);
    if (!lote) return res.status(404).json({ message: "Lote no encontrado" });
    res.json(lote);
  });

  app.delete("/api/lotes/:id", requireAdmin, async (req, res) => {
    await storage.deleteLote(parseInt(req.params.id));
    res.json({ message: "Lote eliminado" });
  });

  app.get("/api/ventas", requireAuth, async (req, res) => {
    if (req.user!.role === "admin") {
      const all = await storage.getAllVentas();
      res.json(all);
    } else {
      const userVentas = await storage.getVentasByUser(req.user!.id);
      res.json(userVentas);
    }
  });

  app.get("/api/ventas/:id", requireAuth, async (req, res) => {
    const venta = await storage.getVenta(parseInt(req.params.id));
    if (!venta) return res.status(404).json({ message: "Venta no encontrada" });
    if (req.user!.role !== "admin" && venta.userId !== req.user!.id) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    const totalPagado = await storage.getTotalPagadoByVenta(venta.id);
    const pagosList = await storage.getPagosByVenta(venta.id);
    res.json({ ...venta, totalPagado, pagos: pagosList });
  });

  app.post("/api/ventas", requireAuth, async (req, res) => {
    try {
      if (req.user!.role === "admin") {
        return res.status(403).json({ message: "Los administradores no pueden comprar lotes" });
      }
      const lote = await storage.getLote(req.body.loteId);
      if (!lote) return res.status(404).json({ message: "Lote no encontrado" });
      if (lote.estado !== "Disponible") return res.status(400).json({ message: "El lote no está disponible" });

      const cuotas = req.body.cuotas || 1;
      const valorTotal = parseFloat(lote.precio);
      const valorCuota = Math.ceil(valorTotal / cuotas);

      const venta = await storage.createVenta({
        userId: req.user!.id,
        loteId: lote.id,
        valorTotal: lote.precio,
        cuotas,
        valorCuota: valorCuota.toString(),
      });

      if (cuotas > 1) {
        await storage.createCuotasForVenta(venta.id, cuotas, valorCuota, new Date());
      }

      res.status(201).json(venta);
    } catch (err) {
      return res.status(500).json({ message: "Error al crear la venta" });
    }
  });

  app.get("/api/pagos", requireAuth, async (req, res) => {
    if (req.user!.role === "admin") {
      res.json(await storage.getAllPagos());
    } else {
      res.json(await storage.getPagosByUser(req.user!.id));
    }
  });

  app.post("/api/pagos", requireAuth, async (req, res) => {
    try {
      const data = insertPagoSchema.parse({ ...req.body, userId: req.user!.id });
      const venta = await storage.getVenta(data.ventaId);
      if (!venta) return res.status(404).json({ message: "Venta no encontrada" });
      if (req.user!.role !== "admin" && venta.userId !== req.user!.id) {
        return res.status(403).json({ message: "Acceso denegado" });
      }
      const montoMinimo = parseFloat(venta.valorCuota);
      const montoPago = parseFloat(data.monto);
      if (montoPago < montoMinimo) {
        return res.status(400).json({ message: `El monto mínimo de pago es ${montoMinimo.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })} (valor de la cuota)` });
      }

      const pago = await storage.createPago(data);
      res.status(201).json(pago);
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: err.errors[0].message });
      return res.status(500).json({ message: "Error al registrar pago" });
    }
  });

  app.get("/api/pqrs", requireAuth, async (req, res) => {
    if (req.user!.role === "admin") {
      res.json(await storage.getAllPqrs());
    } else {
      res.json(await storage.getPqrsByUser(req.user!.id));
    }
  });

  app.post("/api/pqrs", async (req, res) => {
    try {
      const data = insertPqrsSchema.parse({
        ...req.body,
        userId: req.user?.id || null,
      });
      const created = await storage.createPqrs(data);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: err.errors[0].message });
      return res.status(500).json({ message: "Error al crear solicitud" });
    }
  });

  app.patch("/api/pqrs/:id", requireAdmin, async (req, res) => {
    const updated = await storage.updatePqrsEstado(
      parseInt(req.params.id),
      req.body.estado,
      req.body.respuesta
    );
    if (!updated) return res.status(404).json({ message: "PQRS no encontrado" });
    res.json(updated);
  });

  app.patch("/api/pagos/:id/estado", requireAdmin, async (req, res) => {
    try {
      const pagoId = parseInt(req.params.id);
      const { estado, motivoRechazo } = req.body;
      if (!["Aprobado", "Rechazado"].includes(estado)) {
        return res.status(400).json({ message: "Estado debe ser 'Aprobado' o 'Rechazado'" });
      }
      if (estado === "Rechazado" && !motivoRechazo) {
        return res.status(400).json({ message: "Debe indicar el motivo del rechazo" });
      }

      const pago = await storage.updatePagoEstado(pagoId, estado, estado === "Rechazado" ? motivoRechazo : undefined);
      if (!pago) return res.status(404).json({ message: "Pago no encontrado" });

      const venta = await storage.getVenta(pago.ventaId);
      const lote = venta ? await storage.getLote(venta.loteId) : null;
      const user = await storage.getUser(pago.userId);

      if (venta && lote && user) {
        if (estado === "Aprobado") {
          const cuotasList = await storage.getCuotasByVenta(venta.id);
          const cuotaPendiente = cuotasList
            .filter(c => c.estado !== "Pagada")
            .sort((a, b) => a.numeroCuota - b.numeroCuota)[0];
          if (cuotaPendiente) {
            await storage.marcarCuotaPagada(cuotaPendiente.id, pago.id);
          }

          const totalPagado = await storage.getTotalPagadoByVenta(venta.id);
          const pagosList = await storage.getPagosByVenta(venta.id);
          const numeroCuota = pagosList.filter(p => p.estado === "Aprobado").length;
          sendPaymentReceipt(pago, venta, lote, user, totalPagado, numeroCuota).catch(err => {
            console.error("Error enviando comprobante:", err);
          });

          if (totalPagado >= parseFloat(venta.valorTotal)) {
            sendCompletionCongratulations(venta, lote, user, totalPagado).catch(err => {
              console.error("Error enviando felicitaciones:", err);
            });
          }
        } else {
          sendPaymentRejection(pago, venta, lote, user, motivoRechazo).catch(err => {
            console.error("Error enviando rechazo:", err);
          });
        }
      }

      res.json(pago);
    } catch (err) {
      return res.status(500).json({ message: "Error al actualizar estado del pago" });
    }
  });

  const TASA_INTERES_MENSUAL = 0.015;

  app.get("/api/cuotas/:ventaId", requireAuth, async (req, res) => {
    try {
      const ventaId = parseInt(req.params.ventaId);
      const venta = await storage.getVenta(ventaId);
      if (!venta) return res.status(404).json({ message: "Venta no encontrada" });
      if (req.user!.role !== "admin" && venta.userId !== req.user!.id) {
        return res.status(403).json({ message: "Acceso denegado" });
      }

      await storage.actualizarEstadoCuotasVencidas();

      const cuotasList = await storage.getCuotasByVenta(ventaId);

      const now = new Date();
      for (const cuota of cuotasList) {
        if (cuota.estado === "Vencida" || (cuota.estado === "Pendiente" && new Date(cuota.fechaVencimiento) < now)) {
          const fechaVenc = new Date(cuota.fechaVencimiento);
          const mesesAtraso = Math.max(0, Math.floor((now.getTime() - fechaVenc.getTime()) / (1000 * 60 * 60 * 24 * 30)));
          if (mesesAtraso > 0) {
            const valorBase = parseFloat(cuota.valorBase);
            const interes = Math.round(valorBase * TASA_INTERES_MENSUAL * mesesAtraso);
            const valorTotal = valorBase + interes;
            if (interes !== parseFloat(cuota.interes)) {
              await storage.actualizarInteresCuota(cuota.id, interes, valorTotal);
              cuota.interes = interes.toString();
              cuota.valorTotal = valorTotal.toString();
            }
          }
        }
      }

      const updated = await storage.getCuotasByVenta(ventaId);
      res.json(updated);
    } catch (err) {
      console.error("Error obteniendo cuotas:", err);
      return res.status(500).json({ message: "Error al obtener cuotas" });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    const allUsers = await storage.getAllUsers();
    const safeUsers = allUsers.map(({ password, ...u }) => u);
    res.json(safeUsers);
  });

  app.post("/api/seed", async (_req, res) => {
    try {
      const existingLotes = await storage.getLotes();
      if (existingLotes.length > 0) {
        return res.json({ message: "Data already seeded" });
      }

      const admin = await storage.getUserByEmail("admin@terranovagroup.com");
      if (!admin) {
        await storage.createUser({
          email: "admin@terranovagroup.com",
          password: "admin123",
          nombre: "Administrador",
          apellido: "TerraNova",
          documento: "0000000001",
          telefono: "3001234567",
        });
        const created = await storage.getUserByEmail("admin@terranovagroup.com");
        if (created) {
          const { db: database } = await import("./db");
          const { users } = await import("@shared/schema");
          const { eq } = await import("drizzle-orm");
          await database.update(users).set({ role: "admin" }).where(eq(users.id, created.id));
        }
      }

      const cliente = await storage.getUserByEmail("carlos@ejemplo.com");
      if (!cliente) {
        await storage.createUser({
          email: "carlos@ejemplo.com",
          password: "cliente123",
          nombre: "Carlos",
          apellido: "Rodríguez",
          documento: "1023456789",
          telefono: "3109876543",
        });
      }

      const lotesData = [
        { codigo: "L01", etapa: "Preventa" as const, area: 120, precio: "45000000", estado: "Disponible" as const, ubicacion: "Manzana A", descripcion: "Lote esquinero con excelente iluminación" },
        { codigo: "L02", etapa: "Preventa" as const, area: 150, precio: "56000000", estado: "Reservado" as const, ubicacion: "Manzana A", descripcion: "Lote medianero con vista a la montaña" },
        { codigo: "L03", etapa: "Construcción" as const, area: 200, precio: "80000000", estado: "Vendido" as const, ubicacion: "Manzana B", descripcion: "Lote premium de gran tamaño" },
        { codigo: "L04", etapa: "Preventa" as const, area: 110, precio: "41000000", estado: "Disponible" as const, ubicacion: "Manzana A", descripcion: "Lote compacto ideal para primera vivienda" },
        { codigo: "L05", etapa: "Lanzamiento" as const, area: 180, precio: "65000000", estado: "Disponible" as const, ubicacion: "Manzana C", descripcion: "Lote amplio con zona verde colindante" },
        { codigo: "L06", etapa: "Construcción" as const, area: 130, precio: "50000000", estado: "Disponible" as const, ubicacion: "Manzana B", descripcion: "Lote con acceso directo a vía principal" },
        { codigo: "L07", etapa: "Lanzamiento" as const, area: 145, precio: "53000000", estado: "Reservado" as const, ubicacion: "Manzana C", descripcion: "Lote con topografía plana" },
        { codigo: "L08", etapa: "Preventa" as const, area: 160, precio: "60000000", estado: "Disponible" as const, ubicacion: "Manzana A", descripcion: "Lote familiar con amplias dimensiones" },
      ];

      for (const l of lotesData) {
        await storage.createLote(l);
      }

      res.json({ message: "Datos sembrados correctamente" });
    } catch (err: any) {
      console.error("Seed error:", err);
      res.status(500).json({ message: err.message });
    }
  });

  return httpServer;
}
