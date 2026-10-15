-- =====================================================================
-- Projeto Solaris - script consolidado do banco (MySQL 8.4)
-- Conteúdo de: V1__schema.sql (estrutura) + V2__seed.sql (dados iniciais)
-- Fonte oficial: backend/src/main/resources/db/migration/
--
-- A aplicação NÃO precisa deste script: ao subir, o Flyway cria tudo.
-- Use-o para criar o banco manualmente e inspecionar as tabelas.
-- Usa outro nome de banco porque o Flyway recusa subir sobre um schema
-- já populado sem a tabela de histórico dele (flyway_schema_history).
-- O usuário administrador NÃO está aqui: ele é criado na inicialização
-- a partir de ADMIN_EMAIL / ADMIN_SENHA do .env (sem senha no código).
-- =====================================================================

DROP DATABASE IF EXISTS solaris_script;
CREATE DATABASE solaris_script
    CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE solaris_script;

-- ---------------------------------------------------------------------
-- V1 - estrutura
-- ---------------------------------------------------------------------

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


-- ---------------------------------------------------------------------
-- V2 - dados iniciais
-- ---------------------------------------------------------------------

INSERT INTO perfil (id, codigo, descricao) VALUES
    (1, 'ADMIN', 'Administra o catálogo de especie e os usuários'),
    (2, 'USUARIO', 'Cultiva e acompanha o próprio jardim');

INSERT INTO categoria (id, codigo, rotulo) VALUES
    (1, 'horta', 'Horta e ervas'),
    (2, 'interior', 'Planta de interior'),
    (3, 'suculenta', 'Suculenta ou cacto'),
    (4, 'flor', 'Flor ornamental'),
    (5, 'frutifera', 'Frutífera em vaso'),
    (6, 'geral', 'Planta');

INSERT INTO fase (id, codigo, rotulo, ordem, dia_inicio, dia_fim) VALUES
    (1, 'brotacao', 'Brotação', 1, 0, 15),
    (2, 'vegetativo', 'Crescimento Vegetativo', 2, 15, 30),
    (3, 'adulta', 'Fase Adulta', 3, 30, NULL);

INSERT INTO orientacao_fase (categoria_id, fase_id, texto) VALUES
    (1, 1, 'Mantenha o substrato levemente úmido e a semeadura rasa — sementes de horta germinam mal se enterradas fundo.'),
    (1, 2, 'É agora que a folhagem se forma. Adube a cada 20 dias com NPK 10-10-10 e retire as folhas de baixo que amarelarem.'),
    (1, 3, 'Colha as folhas externas primeiro e nunca mais de um terço da planta por vez: assim ela continua produzindo.'),
    (2, 1, 'Raízes novas em ambiente interno apodrecem com facilidade. Molhe pouco e confira se o vaso drena de verdade.'),
    (2, 2, 'Adube de forma diluída a cada 30 dias, só na primavera e no verão. Limpe o pó das folhas para ela respirar.'),
    (2, 3, 'Replante a cada dois anos, quando as raízes aparecerem no furo do vaso. Gire o vaso toda semana para o crescimento não pender.'),
    (3, 1, 'Substrato arenoso e rega bem espaçada. O erro mais comum com suculenta jovem é o excesso de água, não a falta.'),
    (3, 2, 'Adube no máximo uma vez na estação, com fertilizante de baixa concentração. Excesso de nitrogênio deixa a planta mole e estiolada.'),
    (3, 3, 'Folhas murchas e enrugadas pedem água; folhas translúcidas e moles indicam água demais. Na dúvida, espere mais um dia.'),
    (4, 1, 'Evite molhar as folhas na rega para não favorecer fungos. Água na base, sempre.'),
    (4, 2, 'Troque para um adubo mais rico em fósforo (tipo NPK 04-14-08) — é ele que prepara a floração.'),
    (4, 3, 'Remova as flores murchas assim que passarem do ponto. Isso redireciona a energia da planta para novos botões.'),
    (5, 1, 'Escolha desde já um vaso fundo: frutífera em vaso raso trava o crescimento antes de dar o primeiro fruto.'),
    (5, 2, 'Adube a cada 30 dias com NPK 10-10-10 e faça a poda de formação, deixando três ou quatro ramos principais.'),
    (5, 3, 'Na frutificação a demanda por água e potássio sobe. Se aparecerem muitos frutos pequenos, faça o raleio e fique com os melhores.'),
    (6, 1, 'Mantenha a terra levemente úmida enquanto as primeiras raízes se fixam no substrato.'),
    (6, 2, 'Acompanhe o crescimento das folhas e adube de forma equilibrada uma vez por mês.'),
    (6, 3, 'A planta atingiu maturidade. Mantenha a rotina de cuidados e observe sinais de floração ou frutificação.');

INSERT INTO nivel_luz (id, codigo, rotulo, orientacao) VALUES
    (1, 'SOL_PLENO', 'Sol pleno', 'Ela pede sol pleno: deixe em um ponto com pelo menos seis horas de sol direto.'),
    (2, 'MEIA_SOMBRA', 'Meia-sombra', 'Ela prefere meia-sombra: sol da manhã sim, sol forte da tarde não.'),
    (3, 'LUZ_INDIRETA', 'Luz indireta', 'Ela vive bem com luz indireta: perto de uma janela, mas fora do sol direto.');

INSERT INTO regime_rega (id, codigo, intervalo_dias, descricao) VALUES
    (1, 'FREQUENTE', 2, 'quase todo dia'),
    (2, 'MEDIA', 4, 'a cada tres ou quatro dias'),
    (3, 'ESPACADA', 10, 'só quando o substrato secar por completo');


INSERT INTO especie
    (id, nome_popular, nome_cientifico, categoria_id, nivel_luz_id, regime_rega_id, dificuldade, foto_url, origem)
VALUES
    (1, 'Tomate cereja', 'Solanum lycopersicum', 1, 1, 2, 'MEDIA', 'assets/images/tomate-cereja.jpg', 'LOCAL'),
    (2, 'Manjericão', 'Ocimum basilicum', 1, 1, 2, 'FACIL', NULL, 'LOCAL'),
    (3, 'Alecrim', 'Salvia rosmarinus', 1, 1, 2, 'FACIL', NULL, 'LOCAL'),
    (4, 'Hortelã', 'Mentha', 1, 2, 2, 'FACIL', NULL, 'LOCAL'),
    (5, 'Salsinha', 'Petroselinum crispum', 1, 2, 2, 'FACIL', NULL, 'LOCAL'),
    (6, 'Cebolinha', 'Allium fistulosum', 1, 1, 2, 'FACIL', NULL, 'LOCAL'),
    (7, 'Orégano', 'Origanum vulgare', 1, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (8, 'Tomilho', 'Thymus vulgaris', 1, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (9, 'Coentro', 'Coriandrum sativum', 1, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (10, 'Alface Crespa', 'Lactuca sativa', 1, 1, 2, 'FACIL', NULL, 'LOCAL'),
    (11, 'Rúcula', 'Eruca vesicaria', 1, 2, 2, 'FACIL', NULL, 'LOCAL'),
    (12, 'Espinafre', 'Spinacia oleracea', 1, 2, 2, 'MEDIA', NULL, 'LOCAL'),
    (13, 'Cenoura', 'Daucus carota', 1, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (14, 'Rabanete', 'Raphanus sativus', 1, 1, 2, 'FACIL', NULL, 'LOCAL'),
    (15, 'Beterraba', 'Beta vulgaris', 1, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (16, 'Pimenta Malagueta', 'Capsicum frutescens', 1, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (17, 'Pimentão', 'Capsicum annuum', 1, 1, 1, 'DIFICIL', NULL, 'LOCAL'),
    (18, 'Morango', 'Fragaria', 1, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (19, 'Couve-manteiga', 'Brassica oleracea', 1, 2, 2, 'FACIL', NULL, 'LOCAL'),
    (20, 'Sálvia', 'Salvia officinalis', 1, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (21, 'Jiboia', 'Epipremnum ureum', 2, 2, 2, 'FACIL', 'assets/images/jiboia.jpg', 'LOCAL'),
    (22, 'Espada-de-São-Jorge', 'Sansevieria trifasciata', 2, 3, 3, 'MUITO_FACIL', 'assets/images/espada.jpg', 'LOCAL'),
    (23, 'Zamioculca', 'Zamioculcas zamiifolia', 2, 3, 3, 'MUITO_FACIL', NULL, 'LOCAL'),
    (24, 'Costela-de-Adão', 'Monstera deliciosa', 2, 2, 2, 'MEDIA', NULL, 'LOCAL'),
    (25, 'Lírio-da-paz', 'Spathiphyllum wallisii', 2, 2, 2, 'MEDIA', NULL, 'LOCAL'),
    (26, 'Ficus lyrata', 'Ficus lyrata', 2, 2, 1, 'DIFICIL', NULL, 'LOCAL'),
    (27, 'Antúrio', 'Anthurium andraeanum', 2, 2, 2, 'MEDIA', NULL, 'LOCAL'),
    (28, 'Comigo-ninguém-pode', 'Dieffenbachia seguine', 2, 2, 2, 'FACIL', NULL, 'LOCAL'),
    (29, 'Singônio', 'Syngonium podophyllum', 2, 2, 2, 'FACIL', NULL, 'LOCAL'),
    (30, 'Peperômia', 'Peperomia caperata', 2, 3, 2, 'MEDIA', NULL, 'LOCAL'),
    (31, 'Maranta-pavão', 'Calathea makoyana', 2, 3, 1, 'DIFICIL', NULL, 'LOCAL'),
    (32, 'Filodendro-brasil', 'Philodendron hederaceum', 2, 2, 2, 'FACIL', NULL, 'LOCAL'),
    (33, 'Begônia-maculata', 'Begonia maculata', 2, 3, 1, 'DIFICIL', NULL, 'LOCAL'),
    (34, 'Alocásia-polly', 'Alocasia amazonica', 2, 2, 1, 'DIFICIL', NULL, 'LOCAL'),
    (35, 'Asplênio', 'Asplenium nidus', 2, 3, 2, 'MEDIA', NULL, 'LOCAL'),
    (36, 'Samambaia-americana', 'Nephrolepis exaltata', 2, 2, 2, 'MEDIA', NULL, 'LOCAL'),
    (37, 'Avenca', 'Adiantum capillus-veneris', 2, 3, 1, 'DIFICIL', NULL, 'LOCAL'),
    (38, 'Caládio', 'Caladium bicolor', 2, 2, 1, 'DIFICIL', NULL, 'LOCAL'),
    (39, 'Clorofito', 'Chlorophytum comosum', 2, 2, 2, 'FACIL', NULL, 'LOCAL'),
    (40, 'Bambu-da-sorte', 'Dracaena sanderiana', 2, 3, 2, 'FACIL', NULL, 'LOCAL'),
    (41, 'Pata-de-elefante', 'Beaucarnea recurvata', 2, 1, 2, 'FACIL', NULL, 'LOCAL'),
    (42, 'Árvore-da-felicidade', 'Polyscias fruticosa', 2, 2, 2, 'MEDIA', NULL, 'LOCAL'),
    (43, 'Palmeira-rápis', 'Rhapis excelsa', 2, 2, 2, 'MEDIA', NULL, 'LOCAL'),
    (44, 'Dracena-de-Madagascar', 'Dracaena marginata', 2, 2, 2, 'FACIL', NULL, 'LOCAL'),
    (45, 'Fitônia', 'Fittonia albivenis', 2, 3, 2, 'MEDIA', NULL, 'LOCAL'),
    (46, 'Babosa (Aloe Vera)', 'Aloe barbadensis', 3, 1, 3, 'FACIL', NULL, 'LOCAL'),
    (47, 'Echeveria', 'Echeveria elegans', 3, 1, 3, 'MEDIA', NULL, 'LOCAL'),
    (48, 'Planta-jade', 'Crassula ovata', 3, 1, 3, 'FACIL', NULL, 'LOCAL'),
    (49, 'Cacto-amendoim', 'Echinopsis chamaecereus', 3, 1, 3, 'FACIL', NULL, 'LOCAL'),
    (50, 'Coroa-de-frades', 'Melocactus', 3, 1, 3, 'MEDIA', NULL, 'LOCAL'),
    (51, 'Rabo-de-burro', 'Sedum morganianum', 3, 1, 3, 'MEDIA', NULL, 'LOCAL'),
    (52, 'Orelha-de-Shrek', 'Crassula ovata ''Gollum''', 3, 1, 3, 'FACIL', NULL, 'LOCAL'),
    (53, 'Colar-de-pérolas', 'Senecio rowleyanus', 3, 2, 3, 'DIFICIL', NULL, 'LOCAL'),
    (54, 'Flor-de-maio', 'Schlumbergera truncata', 3, 2, 3, 'MEDIA', NULL, 'LOCAL'),
    (55, 'Cacto-macarrão', 'Rhipsalis baccifera', 3, 2, 3, 'MEDIA', NULL, 'LOCAL'),
    (56, 'Rosa-de-pedra', 'Graptopetalum paraguayense', 3, 1, 3, 'FACIL', NULL, 'LOCAL'),
    (57, 'Kalanchoe', 'Kalanchoe blossfeldiana', 3, 1, 3, 'FACIL', NULL, 'LOCAL'),
    (58, 'Coração-emaranhado', 'Ceropegia woodii', 3, 2, 3, 'MEDIA', NULL, 'LOCAL'),
    (59, 'Haworthia', 'Haworthia fasciata', 3, 2, 3, 'FACIL', NULL, 'LOCAL'),
    (60, 'Avelós', 'Euphorbia tirucalli', 3, 1, 3, 'FACIL', NULL, 'LOCAL'),
    (61, 'Cacto-mandacaru', 'Cereus jamacaru', 3, 1, 3, 'FACIL', NULL, 'LOCAL'),
    (62, 'Cacto-saguaro', 'Carnegiea gigantea', 3, 1, 3, 'MEDIA', NULL, 'LOCAL'),
    (63, 'Dedo-de-moça', 'Sedum pachyphyllum', 3, 1, 3, 'FACIL', NULL, 'LOCAL'),
    (64, 'Agave', 'Agave americana', 3, 1, 3, 'FACIL', NULL, 'LOCAL'),
    (65, 'Coroa-de-cristo', 'Euphorbia milii', 3, 1, 3, 'FACIL', NULL, 'LOCAL'),
    (66, 'Planta-fantasma', 'Graptopetalum paraguayense', 3, 1, 3, 'FACIL', NULL, 'LOCAL'),
    (67, 'Cacto-bola', 'Parodia magnifica', 3, 1, 3, 'FACIL', NULL, 'LOCAL'),
    (68, 'Colar-de-rubi', 'Othonna capensis', 3, 2, 3, 'MEDIA', NULL, 'LOCAL'),
    (69, 'Cacto-estrela', 'Stapelia hirsuta', 3, 2, 3, 'MEDIA', NULL, 'LOCAL'),
    (70, 'Gasteria', 'Gasteria spp.', 3, 2, 3, 'FACIL', NULL, 'LOCAL'),
    (71, 'Girassol', 'Helianthus annuus', 4, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (72, 'Rosa Vermelha', 'Rosa gallica', 4, 1, 1, 'DIFICIL', NULL, 'LOCAL'),
    (73, 'Orquídea Phalaenopsis', 'Phalaenopsis aphrodite', 4, 3, 2, 'MEDIA', NULL, 'LOCAL'),
    (74, 'Violeta', 'Saintpaulia ionantha', 4, 3, 2, 'MEDIA', NULL, 'LOCAL'),
    (75, 'Margarida', 'Leucanthemum vulgare', 4, 1, 2, 'FACIL', NULL, 'LOCAL'),
    (76, 'Hibisco', 'Hibiscus rosa-sinensis', 4, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (77, 'Azaleia', 'Rhododendron simsii', 4, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (78, 'Hortênsia', 'Hydrangea macrophylla', 4, 2, 2, 'MEDIA', NULL, 'LOCAL'),
    (79, 'Copo-de-leite', 'Zantedeschia aethiopica', 4, 2, 1, 'DIFICIL', NULL, 'LOCAL'),
    (80, 'Tulipa', 'Tulipa gesneriana', 4, 1, 1, 'DIFICIL', NULL, 'LOCAL'),
    (81, 'Boca-de-leão', 'Antirrhinum majus', 4, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (82, 'Primavera (Bougainvillea)', 'Bougainvillea glabra', 4, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (83, 'Onze-horas', 'Portulaca grandiflora', 4, 1, 2, 'FACIL', NULL, 'LOCAL'),
    (84, 'Jasmim', 'Jasminum officinale', 4, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (85, 'Lavanda', 'Lavandula angustifolia', 4, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (86, 'Camélia', 'Camellia japonica', 4, 2, 2, 'MEDIA', NULL, 'LOCAL'),
    (87, 'Amor-perfeito', 'Viola tricolor', 4, 2, 2, 'FACIL', NULL, 'LOCAL'),
    (88, 'Cravo', 'Dianthus caryophyllus', 4, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (89, 'Gérbera', 'Gerbera jamesonii', 4, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (90, 'Crisântemo', 'Chrysanthemum', 4, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (91, 'Limoeiro Siciliano', 'Citrus limon', 5, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (92, 'Jabuticabeira', 'Plinia cauliflora', 5, 1, 1, 'DIFICIL', NULL, 'LOCAL'),
    (93, 'Pitangueira', 'Eugenia uniflora', 5, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (94, 'Pé de Amora', 'Morus nigra', 5, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (95, 'Acerola', 'Malpighia emarginata', 5, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (96, 'Romã', 'Punica granatum', 5, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (97, 'Figueira', 'Ficus carica', 5, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (98, 'Maracujá', 'Passiflora edulis', 5, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (99, 'Goiabeira', 'Psidium guajava', 5, 1, 2, 'MEDIA', NULL, 'LOCAL'),
    (100, 'Araçá', 'Psidium cattleianum', 5, 1, 2, 'FACIL', NULL, 'LOCAL');