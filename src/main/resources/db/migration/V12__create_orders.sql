-- V12__create_orders.sql
-- Customer orders. Depends on: V9 (addresses), V2 (users)

CREATE TABLE orders (
    id           BIGINT         NOT NULL AUTO_INCREMENT,
    user_id      BIGINT         NOT NULL,
    address_id   BIGINT         NOT NULL,
    status       VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10,2)  NOT NULL,
    notes        VARCHAR(500),
    created_at   DATETIME(6)    NOT NULL,
    updated_at   DATETIME(6)    NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_orders_user    FOREIGN KEY (user_id)    REFERENCES users     (id) ON DELETE RESTRICT,
    CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses (id) ON DELETE RESTRICT
);
