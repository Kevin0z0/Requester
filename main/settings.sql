create table settings
(
    groupName varchar(20),
    className varchar(30)  not null,
    name      varchar(255) not null,
    value     TEXT         not null,
    primary key (groupName, className, name)
);

