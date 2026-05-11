CREATE TABLE product (
                         id               BIGINT        NOT NULL AUTO_INCREMENT,
                         name             VARCHAR(100)  NOT NULL,
                         description      VARCHAR(500),
                         active           TINYINT(1)    NOT NULL DEFAULT 1,
                         fragrance_family VARCHAR(30)   NOT NULL,
                         category_id      BIGINT        NOT NULL,
                         PRIMARY KEY (id),
                         UNIQUE KEY uq_product_name (name),
                         CONSTRAINT fk_product_category
                             FOREIGN KEY (category_id)
                                 REFERENCES categories (id)
);