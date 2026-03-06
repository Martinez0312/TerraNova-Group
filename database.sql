-- =====================================================
-- Script SQL - Sistema Inmobiliario TerraNova Group
-- Base de datos: MySQL
-- Proyecto Académico ADSO-19
-- =====================================================

CREATE DATABASE IF NOT EXISTS railway;
USE railway;

-- =====================================================
-- TABLA: users (Usuarios del sistema)
-- =====================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` TEXT NOT NULL,
  `password` TEXT NOT NULL,
  `nombre` TEXT NOT NULL,
  `apellido` TEXT NOT NULL,
  `documento` VARCHAR(50) NOT NULL,
  `telefono` TEXT,
  `role` ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_documento` (`documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: lotes (Lotes de terreno)
-- =====================================================
CREATE TABLE IF NOT EXISTS `lotes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(10) NOT NULL,
  `etapa` ENUM('Lanzamiento', 'Preventa', 'Construcción', 'Entrega') NOT NULL DEFAULT 'Preventa',
  `area` INT NOT NULL,
  `precio` DECIMAL(15,2) NOT NULL,
  `estado` ENUM('Disponible', 'Reservado', 'Vendido') NOT NULL DEFAULT 'Disponible',
  `ubicacion` TEXT NOT NULL,
  `descripcion` TEXT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_lotes_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: ventas (Registro de ventas)
-- =====================================================
CREATE TABLE IF NOT EXISTS `ventas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `lote_id` INT NOT NULL,
  `valor_total` DECIMAL(15,2) NOT NULL,
  `cuotas` INT NOT NULL DEFAULT 1,
  `valor_cuota` DECIMAL(15,2) NOT NULL,
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ventas_user` (`user_id`),
  KEY `idx_ventas_lote` (`lote_id`),
  CONSTRAINT `fk_ventas_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ventas_lote` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: pagos (Registro de pagos por cuotas)
-- =====================================================
CREATE TABLE IF NOT EXISTS `pagos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `venta_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `monto` DECIMAL(15,2) NOT NULL,
  `concepto` TEXT NOT NULL,
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `estado` VARCHAR(50) NOT NULL DEFAULT 'En proceso',
  `motivo_rechazo` TEXT,
  PRIMARY KEY (`id`),
  KEY `idx_pagos_venta` (`venta_id`),
  KEY `idx_pagos_user` (`user_id`),
  CONSTRAINT `fk_pagos_venta` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pagos_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- MIGRACIÓN: Si la tabla pagos ya existe en Railway
-- Ejecutar estas sentencias para actualizar:
-- ALTER TABLE `pagos` ADD COLUMN `motivo_rechazo` TEXT AFTER `estado`;
-- ALTER TABLE `pagos` ALTER COLUMN `estado` SET DEFAULT 'En proceso';
-- =====================================================

-- =====================================================
-- TABLA: pqrs (Peticiones, Quejas, Reclamos y Sugerencias)
-- =====================================================
CREATE TABLE IF NOT EXISTS `pqrs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT DEFAULT NULL,
  `tipo` ENUM('Petición', 'Queja', 'Reclamo', 'Sugerencia') NOT NULL,
  `asunto` TEXT NOT NULL,
  `mensaje` TEXT NOT NULL,
  `nombre` TEXT NOT NULL,
  `email` TEXT NOT NULL,
  `lote_ref` TEXT,
  `estado_pqrs` ENUM('Pendiente', 'En proceso', 'Resuelto') NOT NULL DEFAULT 'Pendiente',
  `respuesta` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pqrs_user` (`user_id`),
  CONSTRAINT `fk_pqrs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: cuotas (Cronograma de cuotas mensuales)
-- =====================================================
CREATE TABLE IF NOT EXISTS `cuotas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `venta_id` INT NOT NULL,
  `numero_cuota` INT NOT NULL,
  `valor_base` DECIMAL(15,2) NOT NULL,
  `interes` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `valor_total` DECIMAL(15,2) NOT NULL,
  `fecha_vencimiento` TIMESTAMP NOT NULL,
  `estado_cuota` ENUM('Pendiente', 'Pagada', 'Vencida') NOT NULL DEFAULT 'Pendiente',
  `pago_id` INT DEFAULT NULL,
  `fecha_pago` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cuotas_venta` (`venta_id`),
  CONSTRAINT `fk_cuotas_venta` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: password_resets (Tokens de restablecimiento)
-- =====================================================
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `used` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_password_resets_token` (`token`),
  KEY `idx_password_resets_user` (`user_id`),
  CONSTRAINT `fk_password_resets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: sessions (Sesiones de usuario)
-- =====================================================
CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` VARCHAR(128) NOT NULL,
  `expires` INT UNSIGNED NOT NULL,
  `data` MEDIUMTEXT,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DATOS INICIALES (Seed Data)
-- =====================================================

-- Usuario Administrador (contraseña: admin123)
-- NOTA: Las contraseñas se insertan en texto plano aquí.
-- Después de insertar, ejecutar POST /api/debug/migrate-passwords para hashearlas con scrypt.
INSERT INTO `users` (`email`, `password`, `nombre`, `apellido`, `documento`, `telefono`, `role`)
VALUES ('admin@terranovagroup.com', 'admin123', 'Administrador', 'TerraNova', '0000000001', '3001234567', 'admin');

-- Usuario Cliente de prueba (contraseña: cliente123)
INSERT INTO `users` (`email`, `password`, `nombre`, `apellido`, `documento`, `telefono`, `role`)
VALUES ('carlos@ejemplo.com', 'cliente123', 'Carlos', 'Rodríguez', '1023456789', '3109876543', 'cliente');

-- Lotes de terreno
INSERT INTO `lotes` (`codigo`, `etapa`, `area`, `precio`, `estado`, `ubicacion`, `descripcion`) VALUES
('L01', 'Preventa', 120, 45000000.00, 'Disponible', 'Manzana A', 'Lote esquinero con excelente iluminación'),
('L02', 'Preventa', 150, 56000000.00, 'Reservado', 'Manzana A', 'Lote medianero con vista a la montaña'),
('L03', 'Construcción', 200, 80000000.00, 'Vendido', 'Manzana B', 'Lote premium de gran tamaño'),
('L04', 'Preventa', 110, 41000000.00, 'Disponible', 'Manzana A', 'Lote compacto ideal para primera vivienda'),
('L05', 'Lanzamiento', 180, 65000000.00, 'Disponible', 'Manzana C', 'Lote amplio con zona verde colindante'),
('L06', 'Construcción', 130, 50000000.00, 'Disponible', 'Manzana B', 'Lote con acceso directo a vía principal'),
('L07', 'Lanzamiento', 145, 53000000.00, 'Reservado', 'Manzana C', 'Lote con topografía plana'),
('L08', 'Preventa', 160, 60000000.00, 'Disponible', 'Manzana A', 'Lote familiar con amplias dimensiones');

-- =====================================================
-- MODELO ENTIDAD-RELACIÓN (Descripción)
-- =====================================================
-- 
-- users (1) ---< ventas (N) : Un usuario puede tener múltiples ventas
-- lotes (1) ---< ventas (N) : Un lote puede tener una venta (relación lógica 1:1)
-- ventas (1) ---< pagos (N) : Una venta tiene múltiples pagos (cuotas)
-- users (1) ---< pagos (N) : Un usuario realiza múltiples pagos
-- users (1) ---< pqrs (N) : Un usuario puede crear múltiples solicitudes PQRS
-- users (1) ---< password_resets (N) : Un usuario puede tener múltiples tokens de restablecimiento
--
-- Relaciones:
--   ventas.user_id -> users.id (FK)
--   ventas.lote_id -> lotes.id (FK)
--   pagos.venta_id -> ventas.id (FK)
--   pagos.user_id -> users.id (FK)
--   pqrs.user_id -> users.id (FK, nullable para solicitudes anónimas)
--   password_resets.user_id -> users.id (FK)
-- =====================================================
