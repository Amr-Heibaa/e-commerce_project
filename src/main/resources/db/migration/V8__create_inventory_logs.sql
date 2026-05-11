CREATE TABLE inventory_log (
                               id                  BIGINT      NOT NULL AUTO_INCREMENT,
                               quantity_change     INT         NOT NULL,
                               reason              VARCHAR(50) NOT NULL,
                               created_at          DATETIME(6) NOT NULL,
                               product_variant_id  BIGINT      NOT NULL,
                               PRIMARY KEY (id),
                               CONSTRAINT fk_log_product_variant
                                   FOREIGN KEY (product_variant_id)
                                       REFERENCES product_variant (id)
);