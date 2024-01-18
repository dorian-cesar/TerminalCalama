CREATE TABLE `custodiaestado` (
  `idestado` int NOT NULL AUTO_INCREMENT,
  `estado` varchar(200) DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  PRIMARY KEY (`idestado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `custodiaestado` (`idestado`, `estado`, `hora`, `fecha`)
VALUES (1,'|','10:20:00','2024-01-20');

CREATE TABLE `custodias` (
  `idcustodia` int NOT NULL AUTO_INCREMENT,
  `posicion` varchar(45) DEFAULT NULL,
  `rut` varchar(45) DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `talla` varchar(45) DEFAULT NULL,
  `tipo` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idcustodia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `restroom` (
  `idrestroom` int NOT NULL AUTO_INCREMENT,
  `Codigo` varchar(20) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  PRIMARY KEY (`idrestroom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
