CREATE TABLE product_image (
                               id            BIGINT        NOT NULL AUTO_INCREMENT,
                               image_url     VARCHAR(500)  NOT NULL,
                               alt_text      VARCHAR(200),
                               display_order INT           NOT NULL,
                               is_primary    TINYINT(1)    NOT NULL DEFAULT 0,
                               created_at    DATETIME(6)   NOT NULL,
                               product_id    BIGINT        NOT NULL,
                               PRIMARY KEY (id),
                               CONSTRAINT fk_image_product
                                   FOREIGN KEY (product_id)
                                       REFERENCES product (id)
);