-- V9__create_addresses.sql
-- Shipping/billing addresses owned by a user.
-- Order (V12) has a FK to this table.

CREATE TABLE addresses (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    user_id        BIGINT        NOT NULL,
    full_name      VARCHAR(200)  NOT NULL,
    phone          VARCHAR(20)   NOT NULL,
    address_line1  VARCHAR(255)  NOT NULL,
    address_line2  VARCHAR(255),
    city           VARCHAR(100)  NOT NULL,
    state          VARCHAR(100)  NOT NULL,
    postal_code    VARCHAR(20)   NOT NULL,
    country        VARCHAR(100)  NOT NULL,
    is_default     TINYINT(1)    NOT NULL DEFAULT 0,
    created_at     DATETIME(6)   NOT NULL,
    updated_at     DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
