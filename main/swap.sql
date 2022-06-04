create table swap
(
    tid  integer not null
        constraint swap_pk
            primary key,
    data TEXT
);

create unique index swap_tid_uindex
    on swap (tid);

