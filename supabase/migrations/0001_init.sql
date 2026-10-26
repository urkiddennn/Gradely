-- ============================================================
--  Gradely — initial database schema
--  Run this once in the Supabase SQL Editor.
--  Safe to re-run: tables, columns, indexes and policies are
--  created only when missing, then policies are refreshed.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- 1. Grading schemes
-- ------------------------------------------------------------
create table if not exists public.grading_schemes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  lecture_weight numeric default 60 not null,
  lab_weight numeric default 40 not null,
  term_weights jsonb default '{"prelim":25,"midterm":25,"prefinal":25,"final_exam":25}'::jsonb not null,
  lecture_components jsonb default '[
    {"id":"lec_quiz","name":"Quizzes","weight":20},
    {"id":"lec_assignment","name":"Assignments","weight":20},
    {"id":"lec_project","name":"Projects","weight":20},
    {"id":"lec_exam","name":"Exams","weight":40}
  ]'::jsonb not null,
  lab_components jsonb default '[
    {"id":"lab_attendance","name":"Attendance","weight":10},
    {"id":"lab_report","name":"Lab Reports","weight":40},
    {"id":"lab_practical","name":"Practical Exam","weight":50}
  ]'::jsonb not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Keep older installs in sync (added columns)
alter table public.grading_schemes
  add column if not exists term_weights jsonb default '{"prelim":25,"midterm":25,"prefinal":25,"final_exam":25}'::jsonb,
  add column if not exists lecture_components jsonb default '[
    {"id":"lec_quiz","name":"Quizzes","weight":20},
    {"id":"lec_assignment","name":"Assignments","weight":20},
    {"id":"lec_project","name":"Projects","weight":20},
    {"id":"lec_exam","name":"Exams","weight":40}
  ]'::jsonb,
  add column if not exists lab_components jsonb default '[
    {"id":"lab_attendance","name":"Attendance","weight":10},
    {"id":"lab_report","name":"Lab Reports","weight":40},
    {"id":"lab_practical","name":"Practical Exam","weight":50}
  ]'::jsonb,
  add column if not exists updated_at timestamptz default timezone('utc'::text, now());

-- Refresh the defaults for future direct inserts as well
alter table public.grading_schemes
  alter column lecture_components set default '[
    {"id":"lec_quiz","name":"Quizzes","weight":20},
    {"id":"lec_assignment","name":"Assignments","weight":20},
    {"id":"lec_project","name":"Projects","weight":20},
    {"id":"lec_exam","name":"Exams","weight":40}
  ]'::jsonb,
  alter column lab_components set default '[
    {"id":"lab_attendance","name":"Attendance","weight":10},
    {"id":"lab_report","name":"Lab Reports","weight":40},
    {"id":"lab_practical","name":"Practical Exam","weight":50}
  ]'::jsonb;

-- ------------------------------------------------------------
-- 2. Scale mappings
-- ------------------------------------------------------------
create table if not exists public.scale_mappings (
  id uuid default gen_random_uuid() primary key,
  scheme_id uuid references public.grading_schemes(id) on delete cascade not null,
  min_percentage numeric not null,
  max_percentage numeric not null,
  grade_point numeric not null,
  remarks text
);

-- ------------------------------------------------------------
-- 3. Subjects
-- ------------------------------------------------------------
create table if not exists public.subjects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  scheme_id uuid references public.grading_schemes(id) on delete set null,
  code text not null,
  name text not null,
  has_lab boolean default false not null,
  semester text default '1st Semester',
  school_year text,
  units numeric default 3 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.subjects
  add column if not exists semester text default '1st Semester',
  add column if not exists school_year text,
  add column if not exists units numeric default 3;

-- Deleting a scheme should never delete the student's subjects.
alter table public.subjects drop constraint if exists subjects_scheme_id_fkey;
alter table public.subjects
  add constraint subjects_scheme_id_fkey
  foreign key (scheme_id) references public.grading_schemes(id)
  on delete set null;

-- ------------------------------------------------------------
-- 4. Grade entries
-- ------------------------------------------------------------
create table if not exists public.grade_entries (
  id uuid default gen_random_uuid() primary key,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  term text not null check (term in ('prelim', 'midterm', 'prefinal', 'final_exam')),
  category text not null,
  label text,
  score numeric not null,
  max_score numeric default 100 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.grade_entries
  add column if not exists label text;

-- ------------------------------------------------------------
-- 5. Indexes
-- ------------------------------------------------------------
create index if not exists grading_schemes_user_idx on public.grading_schemes (user_id);
create index if not exists scale_mappings_scheme_idx on public.scale_mappings (scheme_id);
create index if not exists subjects_user_idx on public.subjects (user_id);
create index if not exists subjects_scheme_idx on public.subjects (scheme_id);
create index if not exists grade_entries_subject_idx on public.grade_entries (subject_id);
create index if not exists grade_entries_term_idx on public.grade_entries (subject_id, term);

-- ------------------------------------------------------------
-- 6. Row Level Security
-- ------------------------------------------------------------
alter table public.grading_schemes enable row level security;
alter table public.subjects enable row level security;
alter table public.grade_entries enable row level security;
alter table public.scale_mappings enable row level security;

drop policy if exists "Users manage own schemes" on public.grading_schemes;
create policy "Users manage own schemes"
  on public.grading_schemes
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own subjects" on public.subjects;
create policy "Users manage own subjects"
  on public.subjects
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      scheme_id is null
      or exists (
        select 1 from public.grading_schemes
        where grading_schemes.id = subjects.scheme_id
          and grading_schemes.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Users manage own grades" on public.grade_entries;
create policy "Users manage own grades"
  on public.grade_entries
  for all
  to authenticated
  using (
    exists (
      select 1 from public.subjects
      where subjects.id = grade_entries.subject_id
        and subjects.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.subjects
      where subjects.id = grade_entries.subject_id
        and subjects.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own scale mappings" on public.scale_mappings;
create policy "Users manage own scale mappings"
  on public.scale_mappings
  for all
  to authenticated
  using (
    exists (
      select 1 from public.grading_schemes
      where grading_schemes.id = scale_mappings.scheme_id
        and grading_schemes.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.grading_schemes
      where grading_schemes.id = scale_mappings.scheme_id
        and grading_schemes.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 7. API grants (RLS still restricts every row)
-- ------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.grading_schemes to authenticated;
grant select, insert, update, delete on public.scale_mappings to authenticated;
grant select, insert, update, delete on public.subjects to authenticated;
grant select, insert, update, delete on public.grade_entries to authenticated;

-- ------------------------------------------------------------
-- 8. updated_at helper
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists grading_schemes_set_updated_at on public.grading_schemes;
create trigger grading_schemes_set_updated_at
  before update on public.grading_schemes
  for each row execute function public.set_updated_at();
