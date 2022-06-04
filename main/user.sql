create table user
(
    uid        integer not null
        constraint user_pk
            primary key autoincrement,
    username   TEXT,
    password   TEXT,
    currentRid integer,
    current    integer default 0,
    currentEid integer
);

create unique index user_uid_uindex
    on user (uid);

