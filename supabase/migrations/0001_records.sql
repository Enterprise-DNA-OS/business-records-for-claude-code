create function touch_updated() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create function immutable_history() returns trigger language plpgsql as $$ begin raise exception 'History is append-only'; end $$;
create table workspace(id integer primary key check(id=1), name text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table cabinets(id uuid primary key default gen_random_uuid(), name text not null unique, source_name text not null unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table retention_classes(id uuid primary key default gen_random_uuid(), name text not null unique, years integer not null check(years between 0 and 100), basis text not null, source text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table records(id uuid primary key default gen_random_uuid(), cabinet_id uuid not null references cabinets(id), name text not null check(length(trim(name))>0), source_id text, source_hash text, class_id uuid not null references retention_classes(id), document_date date not null, period_end date, retain_until date, review_due date, owner text not null default 'Unassigned', personal boolean, external_ref text not null default '', status text not null default 'active' check(status in ('active','archived')), revision integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(cabinet_id,source_id), check(period_end is null or period_end>=document_date));
create table versions(id uuid primary key default gen_random_uuid(), record_id uuid not null references records(id), version integer not null check(version>0), sha256 text not null check(sha256 ~ '^[0-9a-f]{64}$'), bytes bigint not null check(bytes>=0), original_name text not null, actor text not null, evidence text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(record_id,version));
create table reviews(id uuid primary key default gen_random_uuid(), record_id uuid not null references records(id), revision integer not null, version integer not null, outcome text not null check(outcome in ('keep','dispose-proposed')), next_review date not null, actor text not null, evidence text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table holds(id uuid primary key default gen_random_uuid(), record_id uuid not null references records(id), name text not null, reason text not null, imposed_by text not null, release_evidence text, released_by text, released_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check((released_at is null and released_by is null and release_evidence is null) or (released_at is not null and released_by is not null and release_evidence is not null)));
create table tasks(id uuid primary key default gen_random_uuid(), record_id uuid not null references records(id), name text not null, owner text not null, due date not null, completed_at timestamptz, evidence text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table controls(id uuid primary key default gen_random_uuid(), name text not null check(name in ('access-review','restore-test','storage-location')), actor text not null, evidence text not null, next_review date not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table events(id uuid primary key default gen_random_uuid(), record_id uuid references records(id), action text not null, actor text not null, detail jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index record_cabinet on records(cabinet_id);
create index version_record on versions(record_id);
create index hold_record on holds(record_id) where released_at is null;
create index review_record on reviews(record_id);
create index task_record on tasks(record_id);
do $$ declare t text; begin
 foreach t in array array['workspace','cabinets','retention_classes','records','holds','tasks'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated()',t);
 end loop;
 foreach t in array array['versions','reviews','controls','events'] loop
 execute format('create trigger immutable before update or delete on %I for each row execute function immutable_history()',t);
 end loop;
 foreach t in array array['workspace','cabinets','retention_classes','records','versions','reviews','holds','tasks','controls','events'] loop
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 end loop;
end $$;
create view record_register as
select r.*,c.name cabinet,k.name record_class,k.years,k.basis,
 case when k.years>0 and r.period_end is not null then (r.period_end+make_interval(years=>k.years))::date end statutory_floor,
 case when k.years>0 and r.period_end is not null then greatest(r.retain_until,(r.period_end+make_interval(years=>k.years))::date) else r.retain_until end retention_end,
 coalesce(v.version,0) current_version,v.sha256,v.bytes,
 (select count(*)::integer from holds h where h.record_id=r.id and h.released_at is null) active_holds,
 q.outcome last_outcome,q.created_at last_review,q.next_review,
 (q.revision=r.revision and q.version=coalesce(v.version,0)) review_current
from records r join cabinets c on c.id=r.cabinet_id join retention_classes k on k.id=r.class_id
left join lateral (select * from versions where record_id=r.id order by version desc limit 1) v on true
left join lateral (select * from reviews where record_id=r.id order by created_at desc,id desc limit 1) q on true;
create view review_queue as
select id,name,cabinet,owner,record_class,current_version,active_holds,retention_end,
 coalesce(next_review,review_due) review_on,
 case when current_version=0 then 'Original not attached'
 when record_class='unclassified' then 'Classification required'
 when not coalesce(review_current,false) then 'Current record not reviewed'
 else 'Review date due' end reason
from record_register where status='active' and (current_version=0 or record_class='unclassified' or not coalesce(review_current,false) or coalesce(next_review,review_due,current_date)<=current_date);
create view retention_queue as
select id,name,cabinet,owner,retention_end,active_holds,
 case when active_holds>0 then 'Held: do not dispose'
 when retention_end is null then 'Retention date missing'
 when years>0 and period_end is null then 'Tax period end missing'
 when current_version=0 then 'Original not attached'
 when retention_end<current_date then 'Eligible for human review, not deletion'
 else 'Retain' end decision
from record_register;
create view attention_queue as
select id,name,owner,'document'::text kind,reason from review_queue
union all select id,name,owner,'task','Overdue follow-up' from tasks where completed_at is null and due<current_date;
