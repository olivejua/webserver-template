create database if not exists testdb;

use testdb;

create table users (
    id bigint auto_increment primary key,
    email varchar(100) unique not null,
    password varchar(255) not null,
    name varchar(100) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table posts (
    id bigint auto_increment primary key,
    author_id bigint not null,
    title varchar(500) not null,
    content text not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table post_images (
    id bigint auto_increment primary key,
    post_id bigint not null,
    path varchar(255) not null,
    created_at timestamp not null default current_timestamp
);

