-- V14__create_payments.sql
-- One payment record per order.
-- Depends on: V12 (orders)

CREATE TABLE payments (
    id              BIGINT         NOT NULL AUTO_INCREMENT,
    order_id        BIGINT         NOT NULL,
    payment_method  VARCHAR(30)    NOT NULL,
    status          VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    amount          DECIMAL(10,2)  NOT NULL,
    transaction_ref VARCHAR(255),
    created_at      DATETIME(6)    NOT NULL,
    updated_at      DATETIME(6)    NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_payments_order (order_id),
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);
