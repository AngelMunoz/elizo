create table if not exists users (
    id integer primary key,
    name text not null,
    nickname text not null,
    password text not null,
    created_at timestamp default CURRENT_TIMESTAMP not null,
    updated_at timestamp default CURRENT_TIMESTAMP not null
);
create table if not exists pictures (
    id integer primary key,
    name text not null,
    file_path text not null,
    description text,
    created_at timestamp default CURRENT_TIMESTAMP not null,
    updated_at timestamp default CURRENT_TIMESTAMP not null
);
create table if not exists users_pictures (
    id integer primary key,
    user_id integer not null,
    picture_id integer not null,
    foreign key (user_id) references users(id),
    foreign key (picture_id) references pictures(id)
);
--
CREATE UNIQUE INDEX unique_nickname ON users(nickname);
--
CREATE TRIGGER if not exists update_ts_users
AFTER
UPDATE On users BEGIN
UPDATE users
SET updated_at = CURRENT_TIMESTAMP
WHERE id = NEW.id;
END;
--
CREATE TRIGGER if not exists update_ts_pictures
AFTER
UPDATE On pictures BEGIN
UPDATE pictures
SET updated_at = CURRENT_TIMESTAMP
WHERE id = NEW.id;
END;