-- V1__create_users_and_roles.sql
-- Creates the core users and roles tables.
-- Dev 4's V4 migration (refresh_tokens) has a FK to users.
-- Push this FIRST before any other developer pushes their migrations.

CREATE TABLE roles (
                       id   BIGINT       NOT NULL AUTO_INCREMENT,
                       name VARCHAR(50)  NOT NULL,
                       PRIMARY KEY (id),
                       UNIQUE KEY uq_roles_name (name)
);

CREATE TABLE users (
                       id          BIGINT       NOT NULL AUTO_INCREMENT,
                       first_name  VARCHAR(100) NOT NULL,
                       last_name   VARCHAR(100) NOT NULL,
                       email       VARCHAR(150) NOT NULL,
                       password    VARCHAR(255) NOT NULL,
                       phone       VARCHAR(20),
                       enabled     TINYINT(1)   NOT NULL DEFAULT 1,
                       created_at  DATETIME(6)  NOT NULL,
                       updated_at  DATETIME(6)  NOT NULL,
                       PRIMARY KEY (id),
                       UNIQUE KEY uq_users_email (email)
);
