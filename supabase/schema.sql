CREATE TABLE IF NOT EXISTS contents (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  judul      text        NOT NULL,
  tipe       text        NOT NULL CHECK (tipe IN ('image', 'video', 'text')),
  payload    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS devices (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nama       text        NOT NULL,
  lokasi     text        NOT NULL,
  status     text        NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
  last_seen  timestamptz,
  content_id uuid        REFERENCES contents(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS playlist_items (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id  uuid    NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  content_id uuid    NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  urutan     integer NOT NULL DEFAULT 0,
  durasi     integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO contents (judul, tipe, payload) VALUES
  ('Promo Banner',       'image', 'https://mjsolution.co.id/assets/logo.BAhV8Lwj.png'),
  ('Company Video',      'video', 'https://www.w3schools.com/html/mov_bbb.mp4'),
  ('Welcome to Signage', 'text',  'Welcome to Signage');

INSERT INTO devices (nama, lokasi, status) VALUES
  ('TV Lobby',        'Main Lobby',    'offline'),
  ('TV Meeting Room', 'Meeting Room 1','offline'),
  ('TV Cafeteria',    'Cafeteria',     'offline');
