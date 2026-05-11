-- V13__create_order_items.sql
-- Line items for each order.
-- Depends on: V12 (orders), V6 Dev2 (product_variants)

CREATE TABLE order_items (
    id          BIGINT         NOT NULL AUTO_INCREMENT,
    order_id    BIGINT         NOT NULL,
    variant_id  BIGINT         NOT NULL,
    quantity    INT            NOT NULL,
    unit_price  DECIMAL(10,2)  NOT NULL,
    subtotal    DECIMAL(10,2)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)   REFERENCES orders          (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES product_variant (id) ON DELETE RESTRICT
);
