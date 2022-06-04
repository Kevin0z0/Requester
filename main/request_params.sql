create table request_params
(
    rid   INTEGER
        references request
            on delete cascade,
    pid   INTEGER not null
        constraint request_params_pk
            primary key autoincrement,
    value TEXT default '[]'
);

create unique index request_params_pid_uindex
    on request_params (pid);

