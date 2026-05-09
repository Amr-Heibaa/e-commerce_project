-- V3__create_categories.sql
-- Dev 2's products table (V5) has a FK to this table.
-- Push V1 → V2 → V3 together in a single merge before Dev 2 pushes.

CREATE TABLE categories (
                            id          BIGINT        NOT NULL AUTO_INCREMENT,
                            name        VARCHAR(100)  NOT NULL,
                            description TEXT,
                            image_url   VARCHAR(255),
                            active      TINYINT(1)    NOT NULL DEFAULT 1,
                            created_at  DATETIME(6)   NOT NULL,
                            updated_at  DATETIME(6)   NOT NULL,
                            PRIMARY KEY (id),
                            UNIQUE KEY uq_categories_name (name)
);