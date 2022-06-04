create table request_headers
(
    rid          INTEGER
        references request
            on delete cascade,
    hid          INTEGER not null
        constraint request_headers_pk
            primary key autoincrement,
    value        TEXT    default '[]',
    defaultValue INTEGER default 31
);

create unique index request_headers_hid_uindex
    on request_headers (hid);

