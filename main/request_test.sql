create table request_test
(
    tid     integer not null
        constraint request_test_pk
            primary key autoincrement,
    rid     integer
        references request
            on delete cascade,
    pretest blob,
    test    blob
);

create unique index request_test_tid_uindex
    on request_test (tid);

