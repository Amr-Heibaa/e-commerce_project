-- V4__create_refresh_tokens.sql
-- Stores refresh tokens for JWT authentication.
-- Depends on: V1 (users table)

CREATE TABLE refresh_tokens (
                                id          BIGINT       NOT NULL AUTO_INCREMENT,
                                token       VARCHAR(512) NOT NULL,
                                expiry_date DATETIME(6)  NOT NULL,
                                user_id     BIGINT       NOT NULL,

                                PRIMARY KEY (id),
                                UNIQUE KEY uq_refresh_token (token),
                                CONSTRAINT fk_refresh_token_user
                                    FOREIGN KEY (user_id) REFERENCES users(id)
                                        ON DELETE CASCADE
);