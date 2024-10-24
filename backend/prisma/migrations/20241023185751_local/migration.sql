-- CreateTable
CREATE TABLE `boletos_reservas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `cliente_id` INTEGER NOT NULL,
    `modelo_patente` VARCHAR(100) NOT NULL,
    `equipo` VARCHAR(100) NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `reforma_escape` BOOLEAN NULL DEFAULT false,
    `carga_externa` BOOLEAN NULL DEFAULT false,
    `sena` BOOLEAN NULL DEFAULT false,
    `monto_final_abonar` DECIMAL(10, 2) NOT NULL,
    `fecha_instalacion` DATE NOT NULL,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `cliente_id`(`cliente_id`),
    INDEX `usuario_id`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_completo` VARCHAR(200) NOT NULL,
    `dni` BIGINT NOT NULL,
    `domicilio` VARCHAR(255) NULL,
    `localidad` VARCHAR(100) NULL,
    `telefono` BIGINT NULL,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `dni`(`dni`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comandas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `boleto_reserva_id` INTEGER NOT NULL,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `estado` ENUM('pendiente', 'en_proceso', 'completado') NULL DEFAULT 'pendiente',
    `reductor_cod` VARCHAR(100) NULL,
    `reductor_numero` INTEGER NULL,
    `cilindro_1_cod` VARCHAR(100) NULL,
    `cilindro_1_numero` INTEGER NULL,
    `valvula_1_cod` VARCHAR(100) NULL,
    `valvula_1_numero` INTEGER NULL,
    `reforma_escape_texto` TEXT NULL,
    `carga_externa` BOOLEAN NULL DEFAULT false,
    `precio_carga_externa` DECIMAL(10, 2) NULL,
    `cilindro_2_cod` VARCHAR(100) NULL,
    `cilindro_2_numero` INTEGER NULL,
    `valvula_2_cod` VARCHAR(100) NULL,
    `valvula_2_numero` INTEGER NULL,
    `cuna` VARCHAR(255) NULL,
    `materiales` TEXT NULL,
    `tecnica_id` INTEGER NOT NULL,

    INDEX `boleto_reserva_id`(`boleto_reserva_id`),
    INDEX `tecnica_id`(`tecnica_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tecnica` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dia` VARCHAR(20) NOT NULL,
    `mes` INTEGER NOT NULL,
    `propietario` VARCHAR(100) NOT NULL,
    `dni` BIGINT NOT NULL,
    `marca_vehiculo` VARCHAR(100) NOT NULL,
    `modelo` VARCHAR(100) NOT NULL,
    `anio_fabricacion` INTEGER NOT NULL,
    `patente` VARCHAR(20) NOT NULL,
    `dominio` VARCHAR(100) NOT NULL,
    `color` VARCHAR(50) NOT NULL,
    `anio` INTEGER NOT NULL,
    `detalle1` DECIMAL(10, 2) NULL,
    `detalle2` DECIMAL(10, 2) NULL,
    `detalle3` DECIMAL(10, 2) NULL,
    `detalle4` DECIMAL(10, 2) NULL,
    `observaciones_personales` TEXT NOT NULL,
    `observaciones_tecnicas` TEXT NOT NULL,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `perdidas_gas` BOOLEAN NULL DEFAULT false,
    `cableado` BOOLEAN NULL DEFAULT false,
    `nivel_agua` BOOLEAN NULL DEFAULT false,
    `nivel_aceite` BOOLEAN NULL DEFAULT false,
    `inspeccion_instalacion` TEXT NULL,
    `funcionamiento_unidad` BOOLEAN NULL DEFAULT false,
    `herramientas` TEXT NULL,
    `otras_observaciones` TEXT NULL,
    `firma` VARCHAR(255) NULL,
    `usuario_id` INTEGER NULL,
    `comanda_id` INTEGER NOT NULL,

    UNIQUE INDEX `unique_comanda_id`(`comanda_id`),
    INDEX `idx_usuario_id`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_usuario` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `contraseña` VARCHAR(255) NOT NULL,
    `cover_image` VARCHAR(255) NULL,
    `role_id` INTEGER NOT NULL,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `nombre_usuario`(`nombre_usuario`),
    UNIQUE INDEX `email`(`email`),
    INDEX `role_id`(`role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `boletos_reservas` ADD CONSTRAINT `boletos_reservas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `boletos_reservas` ADD CONSTRAINT `boletos_reservas_ibfk_2` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comandas` ADD CONSTRAINT `comandas_ibfk_1` FOREIGN KEY (`boleto_reserva_id`) REFERENCES `boletos_reservas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comandas` ADD CONSTRAINT `comandas_ibfk_2` FOREIGN KEY (`tecnica_id`) REFERENCES `tecnica`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tecnica` ADD CONSTRAINT `fk_tecnica_comanda` FOREIGN KEY (`comanda_id`) REFERENCES `comandas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tecnica` ADD CONSTRAINT `tecnica_ibfk_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
