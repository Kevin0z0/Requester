create table environment
(
    id         integer not null
        constraint environment_pk
            primary key autoincrement,
    name       TEXT,
    creator    integer,
    createTime date timestamp default (datetime('now', 'localtime')),
    value      text           default '[]'
);

create unique index environment_id_uindex
    on environment (id);

