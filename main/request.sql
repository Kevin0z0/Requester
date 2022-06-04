create table request
(
    createTime     date timestamp default (datetime('now', 'localtime')),
    modifyTime     date timestamp default (datetime('now', 'localtime')),
    requestMethod  TEXT           default 'GET',
    resultFormat   TEXT           default 'Auto',
    id             INTEGER not null
        constraint request_pk
            primary key autoincrement,
    url            TEXT           default '',
    bodyType       TEXT           default 'none',
    authentication TEXT           default 'none',
    showIndex      INTEGER,
    name           TEXT,
    environment    INTEGER,
    star           INTEGER        default 0,
    father_id      integer,
    description    TEXT
);

create unique index request_id_uindex
    on request (id);

