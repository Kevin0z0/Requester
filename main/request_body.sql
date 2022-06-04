create table request_body
(
    rid   INTEGER
        references request
            on delete cascade,
    bid   INTEGER not null
        constraint request_body_pk
            primary key autoincrement,
    type  TEXT,
    value TEXT default '[]'
);

create unique index request_body_bid_uindex
    on request_body (bid);

