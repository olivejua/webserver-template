create database if not exists testdb;

use testdb;

create table users (
    id bigint auto_increment primary key,
    email varchar(100) not null,
    password varchar(255) not null,
    name varchar(100) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create unique index idx_uq_email on users (email);

create table follows (
    id bigint auto_increment primary key,
    follower_id bigint not null, -- follow 하는 유저
    followee_id bigint not null, -- follow 받는 유저
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create unique index idx_uq_follower_id_followee_id on follows (follower_id, followee_id);

create table categories (
    id bigint auto_increment primary key,
    name varchar(50) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table posts (
    id bigint auto_increment primary key,
    author_id bigint not null,
    category_id bigint not null,
    title varchar(500) not null,
    content text not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table post_tags (
    id bigint auto_increment primary key ,
    post_id bigint not null,
    name varchar(30) not null
);

create index idx_post_id on post_tags (post_id);
create index idx_name on post_tags (name);

create table post_images (
    id bigint auto_increment primary key,
    post_id bigint not null,
    path varchar(255) not null,
    created_at timestamp not null default current_timestamp
);

insert into users(email, password, name)
values
    ('john@example.com', 'test', 'John'),
    ('sophia@example.com', 'test', 'Sophia'),
    ('david@example.com', '$2b$12$Tz5b80T1N6CVjLPZLQf4LOX8sucHj6I0kK6tmDnLxoHix.qXnQacG', 'David'),
    ('joseph@example.com', '$2b$12$H.yk.EtJwTPk0.230WPWF.qON7EvVsf5AhRxYMa6tSKSCv08mIJXm', 'Joseph'),
    ('grace@example.com', '$2b$12$qHXckg37jw8GM33Z.xUzDu3I0XLUA3x8r2ZXaDjkrYVsGefXLhAne', 'Grace');

insert into categories (name)
values
    ('notice'),
    ('community'),
    ('qna');