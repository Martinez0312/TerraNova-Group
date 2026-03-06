import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import session from "express-session";
import mysqlSession from "express-mysql-session";
import passport from "./auth";
import { pool } from "./db";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

const MySQLStore = mysqlSession(session as any);
const sessionStore = new MySQLStore({
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, pool as any);

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "terranova-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`password_resets\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`user_id\` INT NOT NULL,
        \`token\` VARCHAR(255) NOT NULL,
        \`expires_at\` TIMESTAMP NOT NULL,
        \`used\` INT NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_password_resets_token\` (\`token\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    log("Tabla password_resets verificada/creada");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`cuotas\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`venta_id\` INT NOT NULL,
        \`numero_cuota\` INT NOT NULL,
        \`valor_base\` DECIMAL(15,2) NOT NULL,
        \`interes\` DECIMAL(15,2) NOT NULL DEFAULT 0,
        \`valor_total\` DECIMAL(15,2) NOT NULL,
        \`fecha_vencimiento\` TIMESTAMP NOT NULL,
        \`estado_cuota\` ENUM('Pendiente', 'Pagada', 'Vencida') NOT NULL DEFAULT 'Pendiente',
        \`pago_id\` INT DEFAULT NULL,
        \`fecha_pago\` TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_cuotas_venta\` (\`venta_id\`),
        CONSTRAINT \`fk_cuotas_venta\` FOREIGN KEY (\`venta_id\`) REFERENCES \`ventas\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    log("Tabla cuotas verificada/creada");
  } catch (err) {
    console.error("Error creando tabla password_resets:", err);
  }

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
