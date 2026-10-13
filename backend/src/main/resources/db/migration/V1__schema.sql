CREATE TABLE perfil (
    id TINYINT UNSIGNED NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    descricao VARCHAR(100) NOT NULL,

    CONSTRAINT pk_perfil PRIMARY KEY (id),
    CONSTRAINT uq_perfil_codigo UNIQUE (codigo)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE usuario (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(80) NOT NULL,
    email VARCHAR(254) NOT NULL,
    senha_hash VARCHAR(100) NOT NULL,
    perfil_id TINYINT UNSIGNED NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_login_em DATETIME NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_usuario PRIMARY KEY (id),
    CONSTRAINT uq_usuario_email UNIQUE (email),
    CONSTRAINT fk_usuario_perfil FOREIGN KEY (perfil_id)
        REFERENCES perfil (id) ON DELETE RESTRICT,
    CONSTRAINT ck_usuario_nome CHECK (CHAR_LENGTH(TRIM(nome)) >= 2),
    CONSTRAINT ck_usuario_email CHECK (email LIKE '_%@_%._%')
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE categoria (
    id TINYINT UNSIGNED NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    rotulo VARCHAR(40) NOT NULL,

    CONSTRAINT pk_categoria PRIMARY KEY (id),
    CONSTRAINT uq_categoria_codigo UNIQUE (codigo)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;


CREATE TABLE fase (
    id TINYINT UNSIGNED NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    rotulo VARCHAR(40) NOT NULL,
    ordem TINYINT UNSIGNED NOT NULL,
    dia_inicio SMALLINT UNSIGNED NOT NULL,
    dia_fim SMALLINT UNSIGNED NULL,

    CONSTRAINT pk_fase PRIMARY KEY (id),
    CONSTRAINT uq_fase_codigo UNIQUE (codigo),
    CONSTRAINT uq_fase_ordem UNIQUE (ordem),
    CONSTRAINT ck_fase_dias CHECK (dia_fim IS NULL OR dia_fim > dia_inicio)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE orientacao_fase (
    categoria_id TINYINT UNSIGNED NOT NULL,
    fase_id TINYINT UNSIGNED NOT NULL,
    texto VARCHAR(500) NOT NULL,

    CONSTRAINT pk_orientacao_fase PRIMARY KEY (categoria_id, fase_id),
    CONSTRAINT fk_orientacao_fase_categoria FOREIGN KEY (categoria_id)
        REFERENCES categoria (id) ON DELETE CASCADE,
    CONSTRAINT fk_orientacao_fase_fase FOREIGN KEY (fase_id)
        REFERENCES fase (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE nivel_luz (
    id TINYINT UNSIGNED NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    rotulo VARCHAR(40) NOT NULL,
    orientacao VARCHAR(300) NOT NULL,

    CONSTRAINT pk_nivel_luz PRIMARY KEY (id),
    CONSTRAINT uq_nivel_luz_codigo UNIQUE (codigo)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE regime_rega (
    id TINYINT UNSIGNED NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    intervalo_dias TINYINT UNSIGNED NOT NULL,
    descricao VARCHAR(80) NOT NULL,

    CONSTRAINT pk_regime_rega PRIMARY KEY (id),
    CONSTRAINT uq_regime_rega_codigo UNIQUE (codigo),
    CONSTRAINT ck_regime_rega_intervalo CHECK (intervalo_dias > 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE especie (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome_popular VARCHAR(100) NOT NULL,
    nome_cientifico VARCHAR(150) NOT NULL,
    categoria_id TINYINT UNSIGNED NOT NULL,
    nivel_luz_id TINYINT UNSIGNED NULL,
    regime_rega_id TINYINT UNSIGNED NOT NULL,
    dificuldade VARCHAR(15) NOT NULL,
    foto_url VARCHAR(255) NULL,
    origem VARCHAR(10) NOT NULL,
    perenual_id INT UNSIGNED NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_especie PRIMARY KEY (id),
    CONSTRAINT uq_especie_perenual UNIQUE (perenual_id),
    CONSTRAINT fk_especie_categoria FOREIGN KEY (categoria_id)
        REFERENCES categoria (id) ON DELETE RESTRICT,
    CONSTRAINT fk_especie_nivel_luz FOREIGN KEY (nivel_luz_id)
        REFERENCES nivel_luz (id) ON DELETE RESTRICT,
    CONSTRAINT fk_especie_regime_rega FOREIGN KEY (regime_rega_id)
        REFERENCES regime_rega (id) ON DELETE RESTRICT,
    CONSTRAINT ck_especie_nome CHECK (CHAR_LENGTH(TRIM(nome_popular)) > 0),
    CONSTRAINT ck_especie_dificuldade CHECK (dificuldade IN ('MUITO_FACIL', 'FACIL', 'MEDIA', 'DIFICIL')),
    CONSTRAINT ck_especie_origem CHECK (origem IN ('LOCAL', 'PERENUAL')),
    CONSTRAINT ck_especie_perenual CHECK (origem <> 'PERENUAL' OR perenual_id IS NOT NULL)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE INDEX idx_especie_nome_popular ON especie (nome_popular);

CREATE TABLE planta (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT UNSIGNED NOT NULL,
    especie_id INT UNSIGNED NOT NULL,
    apelido VARCHAR(60) NULL,
    data_plantio DATE NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                                           ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_planta PRIMARY KEY (id),
    CONSTRAINT fk_planta_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuario (id) ON DELETE CASCADE,
    CONSTRAINT fk_planta_especie FOREIGN KEY (especie_id)
        REFERENCES especie (id) ON DELETE RESTRICT,
    CONSTRAINT ck_planta_apelido CHECK (apelido IS NULL OR CHAR_LENGTH(TRIM(apelido)) > 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE INDEX idx_planta_usuario_criado ON planta (usuario_id, criado_em);

CREATE TABLE rega (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    planta_id BIGINT UNSIGNED NOT NULL,
    regada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_rega PRIMARY KEY (id),
    CONSTRAINT fk_rega_planta FOREIGN KEY (planta_id)
        REFERENCES planta (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE INDEX idx_rega_planta_data ON rega (planta_id, regada_em);