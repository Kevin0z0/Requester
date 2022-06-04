create table history
(
    hid           integer not null
        constraint history_pk
            primary key autoincrement,
    createTime    date timestamp default (datetime('now', 'localtime')),
    requestMethod text           default 'GET',
    resultFormat  TEXT           default 'Auto'
);

create unique index history_hid_uindex
    on history (hid);

create unique index history_hid_uindex_2
    on history (hid);

