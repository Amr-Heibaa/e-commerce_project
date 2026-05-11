-- V11__create_cart_items.sql
-- Items inside a cart. Each (cart, variant) pair is unique.
-- Depends on: V10 (carts), V6 Dev2 (product_variants)

CREATE TABLE cart_items (
    id          BIGINT         NOT NULL AUTO_INCREMENT,
    cart_id     BIGINT         NOT NULL,
    variant_id  BIGINT         NOT NULL,
    quantity    INT            NOT NULL,
    unit_price  DECIMAL(10,2)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cart_variant (cart_id, variant_id),
    CONSTRAINT fk_cart_items_cart    FOREIGN KEY (cart_id)    REFERENCES carts            (id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_variant FOREIGN KEY (variant_id) REFERENCES product_variant  (id) ON DELETE CASCADE
);
