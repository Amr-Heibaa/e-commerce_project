-- V16__create_refund_requests.sql
-- Depends on: V1 (users), V12 (orders)

CREATE TABLE refund_requests (
                                 id          BIGINT        NOT NULL AUTO_INCREMENT,
                                 user_id     BIGINT        NOT NULL,
                                 order_id    BIGINT        NOT NULL,
                                 reason      VARCHAR(1000) NOT NULL,
                                 status      VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
                                 created_at  DATETIME(6)   NOT NULL,
                                 resolved_at DATETIME(6),

                                 PRIMARY KEY (id),
                                 CONSTRAINT fk_refund_user
                                     FOREIGN KEY (user_id) REFERENCES users(id)
                                         ON DELETE CASCADE,
                                 CONSTRAINT fk_refund_order
                                     FOREIGN KEY (order_id) REFERENCES orders(id)
                                         ON DELETE CASCADE
);