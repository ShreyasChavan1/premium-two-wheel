create type public.app_role as enum ('admin','staff');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can read own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid());
create policy "Admins can read all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- Bootstrap: the first authenticated user can claim admin if no admin exists yet.
create or replace function public.claim_admin()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    return false;
  end if;
  if exists (select 1 from public.user_roles where role = 'admin') then
    return public.has_role(auth.uid(),'admin');
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin')
  on conflict do nothing;
  return true;
end;
$$;
grant execute on function public.claim_admin() to authenticated;

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null default 'scooter',
  short_description text not null default '',
  description text not null default '',
  price_from numeric(12,2),
  image_url text not null default '',
  gallery text[] not null default '{}',
  variants text[] not null default '{}',
  colors text[] not null default '{}',
  specs jsonb not null default '{}'::jsonb,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.vehicles to anon;
grant select, insert, update, delete on public.vehicles to authenticated;
grant all on public.vehicles to service_role;
alter table public.vehicles enable row level security;
create policy "Vehicles are publicly viewable" on public.vehicles for select using (true);
create policy "Admins manage vehicles" on public.vehicles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  applicable_vehicles text not null default '',
  benefit text not null default '',
  valid_until date,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.offers to anon;
grant select, insert, update, delete on public.offers to authenticated;
grant all on public.offers to service_role;
alter table public.offers enable row level security;
create policy "Active offers are publicly viewable" on public.offers for select using (is_active = true);
create policy "Admins read all offers" on public.offers for select to authenticated
  using (public.has_role(auth.uid(),'admin'));
create policy "Admins manage offers" on public.offers for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  vehicle_interest text,
  message text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now()
);
grant insert on public.enquiries to anon;
grant select, insert, update, delete on public.enquiries to authenticated;
grant all on public.enquiries to service_role;
alter table public.enquiries enable row level security;
create policy "Anyone can submit an enquiry" on public.enquiries for insert to anon, authenticated with check (true);
create policy "Admins read enquiries" on public.enquiries for select to authenticated
  using (public.has_role(auth.uid(),'admin'));
create policy "Admins update enquiries" on public.enquiries for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins delete enquiries" on public.enquiries for delete to authenticated
  using (public.has_role(auth.uid(),'admin'));

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
create trigger vehicles_touch before update on public.vehicles for each row execute function public.touch_updated_at();
create trigger offers_touch before update on public.offers for each row execute function public.touch_updated_at();

-- ############ DEMO DATA (replace with real showroom content) ############
insert into public.vehicles (slug,name,category,short_description,description,price_from,image_url,variants,colors,specs,is_available,is_featured,sort_order) values
('activa-6g','Activa 6G','scooter','DEMO: India''s most trusted family scooter with silent start and eSP technology.','DEMO CONTENT. The Activa 6G is a 110cc family scooter built for everyday comfort. It offers a smooth ride, generous under-seat storage and excellent fuel efficiency, making it a dependable choice for city commuting.',82000,'/images/demo/activa-6g.jpg','{Standard,Deluxe,"Smart Key"}','{"Pearl Precious White","Matte Axis Grey","Rebel Red Metallic","Black"}','{"Engine":"109.51 cc, Fan-cooled, 4-stroke","Power":"7.68 PS @ 8000 rpm","Mileage":"47 kmpl (claimed)","Fuel Tank":"5.3 litres","Brakes":"Drum with CBS","Kerb Weight":"106 kg","Starting":"Kick / Silent Start ACG"}',true,true,1),
('activa-125','Activa 125','scooter','DEMO: Premium 125cc scooter with more power and a refined ride.','DEMO CONTENT. The Activa 125 adds power and premium touches to the trusted Activa formula, with a digital-analogue console, front disc option and a comfortable seat for two.',94000,'/images/demo/activa-125.jpg','{Drum,"Drum Alloy","Disc Smart Key"}','{"Matte Axis Grey","Pearl Precious White","Heavy Grey Metallic"}','{"Engine":"123.92 cc, Fan-cooled, 4-stroke","Power":"8.29 PS @ 6500 rpm","Mileage":"47 kmpl (claimed)","Fuel Tank":"5.3 litres","Brakes":"Front disc / drum with CBS","Kerb Weight":"111 kg","Starting":"Silent Start ACG"}',true,true,2),
('dio','Dio','scooter','DEMO: Sporty, youthful 110cc scooter with bold styling.','DEMO CONTENT. The Dio is a sporty scooter aimed at younger riders, with sharp bodywork, an LED headlamp and a fully digital meter on higher variants.',78000,'/images/demo/dio.jpg','{Standard,"Deluxe","H-Smart"}','{"Sports Red","Matte Axis Grey","Pearl Siren Blue"}','{"Engine":"109.51 cc, Fan-cooled, 4-stroke","Power":"7.76 PS @ 8000 rpm","Mileage":"48 kmpl (claimed)","Fuel Tank":"5.3 litres","Brakes":"Drum with CBS","Kerb Weight":"105 kg","Starting":"Silent Start ACG"}',true,false,3),
('shine-100','Shine 100','motorcycle','DEMO: Light, easy-to-ride 100cc commuter motorcycle.','DEMO CONTENT. Shine 100 is built for value-focused daily riders — light kerb weight, low seat height and impressive fuel economy for city and semi-urban use.',72000,'/images/demo/shine-100.jpg','{Drum}','{"Black","Geny Grey Metallic","Imperial Red Metallic"}','{"Engine":"98.98 cc, Air-cooled, 4-stroke","Power":"7.38 PS @ 7500 rpm","Mileage":"65 kmpl (claimed)","Fuel Tank":"9 litres","Brakes":"Drum with CBS","Kerb Weight":"99 kg","Starting":"Kick"}',true,true,4),
('shine-125','Shine 125','motorcycle','DEMO: The refined 125cc commuter known for comfort and smoothness.','DEMO CONTENT. Shine 125 pairs a smooth 125cc engine with a plush ride and long service intervals — a favourite for riders covering long daily distances.',86000,'/images/demo/shine-125.jpg','{Drum,Disc}','{"Athletic Blue Metallic","Black","Geny Grey Metallic"}','{"Engine":"123.94 cc, Air-cooled, 4-stroke","Power":"10.59 PS @ 7500 rpm","Mileage":"64 kmpl (claimed)","Fuel Tank":"10.5 litres","Brakes":"Front disc / drum with CBS","Kerb Weight":"114 kg","Starting":"Self / Kick"}',true,false,5),
('sp-125','SP 125','motorcycle','DEMO: Sporty 125cc commuter with digital console and LED headlamp.','DEMO CONTENT. SP 125 brings sharper styling, a fully digital meter and an eSP engine for a livelier ride while keeping running costs low.',92000,'/images/demo/sp-125.jpg','{Drum,Disc}','{"Imperial Red Metallic","Matte Axis Grey","Pearl Siren Blue"}','{"Engine":"123.94 cc, Air-cooled, 4-stroke","Power":"10.72 PS @ 7500 rpm","Mileage":"65 kmpl (claimed)","Fuel Tank":"11.2 litres","Brakes":"Front disc / drum with CBS","Kerb Weight":"117 kg","Starting":"Self / Kick"}',false,false,6),
('unicorn','Unicorn','motorcycle','DEMO: Dependable 160cc motorcycle for confident highway riding.','DEMO CONTENT. The Unicorn is a comfortable 160cc motorcycle with strong mid-range performance, telescopic front suspension and a mono-shock rear for a planted ride.',118000,'/images/demo/unicorn.jpg','{Standard}','{"Matte Axis Grey","Imperial Red Metallic","Pearl Igneous Black"}','{"Engine":"162.71 cc, Air-cooled, 4-stroke","Power":"12.91 PS @ 7500 rpm","Mileage":"52 kmpl (claimed)","Fuel Tank":"13 litres","Brakes":"Front disc, rear drum with CBS","Kerb Weight":"140 kg","Starting":"Self"}',true,true,7);

insert into public.offers (title,description,applicable_vehicles,benefit,valid_until,is_active,sort_order) values
('Special Monsoon Offer','DEMO OFFER. Seasonal benefits on selected Honda scooters at our showroom. Visit us to know the exact benefit on your chosen variant.','Activa 6G, Activa 125, Dio','Up to ₹5,000 in total benefits','2026-09-30',true,1),
('Low Down Payment Finance','DEMO OFFER. Ride home your new Honda with an easy down payment and flexible EMI options through our finance partners.','All models','Down payment from ₹4,999*','2026-10-31',true,2),
('Exchange Bonus','DEMO OFFER. Exchange your old two-wheeler and get an additional bonus on top of its evaluated value.','Shine 125, SP 125, Unicorn','Extra ₹3,000 exchange bonus','2026-09-15',true,3),
('Free First Service + Accessory Pack','DEMO OFFER. Complimentary first service and a starter accessory pack on bookings made this month.','Selected models','Worth ₹2,500','2026-09-30',true,4);