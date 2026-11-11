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

INSERT INTO contents (judul, tipe, payload) VALUES
  ('Promo Banner',       'image', 'https://placehold.co/1920x1080/png?text=Promo+Banner'),
  ('Company Video',      'video', 'https://www.w3schools.com/html/mov_bbb.mp4'),
  ('Welcome to Signage', 'text',  'Welcome to Signage');

INSERT INTO devices (nama, lokasi, status) VALUES
  ('TV Lobby',        'Main Lobby',    'offline'),
  ('TV Meeting Room', 'Meeting Room 1','offline'),
  ('TV Cafeteria',    'Cafeteria',     'offline');
