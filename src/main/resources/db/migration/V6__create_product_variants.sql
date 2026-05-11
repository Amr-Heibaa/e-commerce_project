CREATE TABLE product_variant (
                                 id             BIGINT         NOT NULL AUTO_INCREMENT,
                                 size           VARCHAR(50)    NOT NULL,
                                 price          DECIMAL(19, 2) NOT NULL,
                                 stock_quantity INT            NOT NULL,
                                 active         TINYINT(1)     NOT NULL DEFAULT 1,
                                 product_id     BIGINT         NOT NULL,
                                 PRIMARY KEY (id),
                                 CONSTRAINT fk_variant_product
                                     FOREIGN KEY (product_id)
                                         REFERENCES product (id)
);