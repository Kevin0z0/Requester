create table collections
(
    cid        integer not null
        constraint collections_pk
            primary key autoincrement,
    father_id  integer,
    name       TEXT           default '',
    doc        TEXT           default '',
    expand     integer        default 0,
    createTime date timestamp default (datetime('now', 'localtime'))
);

create unique index collections_cid_uindex
    on collections (cid);

