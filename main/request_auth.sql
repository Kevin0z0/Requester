create table request_auth
(
    rid   INTEGER
        references request
            on delete cascade,
    aid   INTEGER,
    type  TEXT,
    value TEXT default '{}'
);

