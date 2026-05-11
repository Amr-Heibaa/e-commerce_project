-- V15__create_reviews.sql
-- Depends on: V1 (users), Dev 2's products table

CREATE TABLE reviews (
                         id          BIGINT        NOT NULL AUTO_INCREMENT,
                         user_id     BIGINT        NOT NULL,
                         product_id  BIGINT        NOT NULL,
                         rating      TINYINT       NOT NULL,
                         comment     VARCHAR(1000),
                         created_at  DATETIME(6)   NOT NULL,

                         PRIMARY KEY (id),
                         CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5),
                         CONSTRAINT fk_review_user
                             FOREIGN KEY (user_id) REFERENCES users(id)
                                 ON DELETE CASCADE,
                         CONSTRAINT fk_review_product
                             FOREIGN KEY (product_id) REFERENCES product(id)
                                 ON DELETE CASCADE
);