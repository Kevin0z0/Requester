create table request_settings
(
    rid   integer
        constraint request_settings_request_id_fk
            references request
            on delete cascade,
    sid   integer not null
        constraint request_settings_pk
            primary key autoincrement,
    value TEXT default '{}'
);

create unique index request_settings_sid_uindex
    on request_settings (sid);

