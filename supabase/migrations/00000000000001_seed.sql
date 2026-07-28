-- Opening hours, site settings, categories and the salon's real treatment list.

insert into public.business_hours (weekday, is_closed, open_time, close_time) values
  (0, true,  '10:00', '17:00'),
  (1, false, '09:00', '19:00'),
  (2, false, '09:00', '19:00'),
  (3, false, '09:00', '19:00'),
  (4, false, '09:00', '19:00'),
  (5, false, '09:00', '20:00'),
  (6, false, '09:00', '20:00')
on conflict (weekday) do nothing;

insert into public.settings (key, value) values
  ('business_name', '"Kuenphen Beauty Spa"'::jsonb),
  ('tagline', '"Relax. Refresh. Rejuvenate."'::jsonb),
  ('logo_url', '"/logo.svg"'::jsonb),
  ('phone', '"+975 17 00 00 00"'::jsonb),
  ('email', '"hello@kuenphenbeautyspa.com"'::jsonb),
  ('whatsapp', '"+97517000000"'::jsonb),
  ('address', '"Norzin Lam, Thimphu, Bhutan"'::jsonb),
  ('map_embed_url', '"https://www.google.com/maps?q=Thimphu,Bhutan&output=embed"'::jsonb),
  ('facebook_url', '"https://facebook.com"'::jsonb),
  ('instagram_url', '"https://instagram.com"'::jsonb),
  ('about_story', '"Founded in 2020, Kuenphen Beauty Spa was born from a simple belief: that true beauty begins with rest."'::jsonb),
  ('about_mission', '"To offer every guest a moment of genuine calm — through expert hands, honest products, and unhurried care."'::jsonb),
  ('about_vision', '"To be the most trusted name in beauty and wellness in Bhutan, known for warmth as much as for results."'::jsonb),
  ('booking_slot_interval_minutes', '"30"'::jsonb),
  ('timezone', '"Asia/Thimphu"'::jsonb)
on conflict (key) do nothing;

insert into public.categories (name, slug, description, sort_order) values
  ('Facial', 'facial', 'Deep-cleansing and brightening treatments for every skin type.', 1),
  ('Massage', 'massage', 'Therapeutic bodywork to release tension and restore balance.', 2),
  ('Body Spa', 'body-spa', 'Full-body rituals, scrubs and wraps.', 4),
  ('Waxing', 'waxing', 'Gentle, precise hair removal.', 5),
  ('Pedicure', 'pedicure', 'Restorative foot and nail treatments.', 8),
  ('Manicure', 'manicure', 'Hand and nail grooming.', 9)
on conflict (slug) do nothing;

insert into public.staff (full_name, title, bio, sort_order) values
  ('Sonam Choden', 'Senior Aesthetician', 'Twelve years in advanced facials and skin analysis.', 1),
  ('Tashi Wangmo', 'Massage Therapist', 'Trained in Swedish, deep tissue and aromatherapy.', 2),
  ('Pema Dorji', 'Senior Stylist', 'Precision cutting and colour specialist.', 3),
  ('Karma Lhamo', 'Nail & Bridal Artist', 'Nail artistry with a soft, natural finish.', 4)
on conflict do nothing;

insert into public.services
  (category_id, name, slug, short_description, duration_minutes, price, is_featured, sort_order)
values
  ((select id from public.categories where slug='massage'), 'Deep Tissue Massage (60 min)', 'deep-tissue-massage-60', 'Firm, focused pressure for stubborn tension.', 60, 1500, true, 1),
  ((select id from public.categories where slug='massage'), 'Deep Tissue Massage (90 min)', 'deep-tissue-massage-90', 'A longer, full-body deep tissue session.', 90, 2000, true, 2),
  ((select id from public.categories where slug='massage'), 'Swedish Massage (60 min)', 'swedish-massage-60', 'Classic flowing massage at medium pressure.', 60, 1300, true, 3),
  ((select id from public.categories where slug='massage'), 'Swedish Massage (90 min)', 'swedish-massage-90', 'The full-length Swedish session.', 90, 1800, false, 4),
  ((select id from public.categories where slug='massage'), 'Aromatherapy Massage (60 min)', 'aromatherapy-massage-60', 'Gentle massage with a blend chosen for you.', 60, 1300, true, 5),
  ((select id from public.categories where slug='massage'), 'Aromatherapy Massage (90 min)', 'aromatherapy-massage-90', 'The extended aromatherapy ritual.', 90, 1800, false, 6),
  ((select id from public.categories where slug='massage'), 'Head, Neck & Back Massage (30 min)', 'head-neck-back-massage-30', 'Targeted relief where tension collects.', 30, 950, true, 7),
  ((select id from public.categories where slug='massage'), 'Head Massage (30 min)', 'head-massage-30', 'Scalp and temple massage with warm oil.', 30, 500, false, 8),
  ((select id from public.categories where slug='massage'), 'Feet Massage (30 min)', 'feet-massage-30', 'Pressure-point work for tired feet.', 30, 500, false, 9),
  ((select id from public.categories where slug='body-spa'), 'Body Scrub (45 min)', 'body-scrub-45', 'Full-body exfoliation for smoother skin.', 45, 1500, true, 10),
  ((select id from public.categories where slug='facial'), 'Acne Treatment', 'acne-treatment', 'Targeted treatment for breakout-prone skin.', 60, 1050, true, 11),
  ((select id from public.categories where slug='facial'), 'Cleansing Facial', 'cleansing-facial', 'A straightforward deep cleanse.', 30, 500, false, 12),
  ((select id from public.categories where slug='manicure'), 'Manicure (45 min)', 'manicure-45', 'Shape, cuticle care, massage and polish.', 45, 600, false, 13),
  ((select id from public.categories where slug='pedicure'), 'Pedicure (45 min)', 'pedicure-45', 'Soak, callus care, massage and polish.', 45, 700, true, 14),
  ((select id from public.categories where slug='waxing'), 'Leg Waxing', 'leg-waxing', 'From Nu. 150 — priced by half or full leg.', 30, 150, false, 15),
  ((select id from public.categories where slug='waxing'), 'Arm Waxing', 'arm-waxing', 'From Nu. 150 — priced by half or full arm.', 20, 150, false, 16),
  ((select id from public.categories where slug='waxing'), 'Under Arm Waxing', 'under-arm-waxing', 'Quick, gentle underarm waxing.', 15, 100, false, 17),
  ((select id from public.categories where slug='waxing'), 'Bikini Waxing', 'bikini-waxing', 'Careful, private and unhurried.', 45, 1800, false, 18),
  ((select id from public.categories where slug='waxing'), 'Full Body Waxing', 'full-body-waxing', 'Everything in one appointment.', 150, 3500, true, 19)
on conflict (slug) do nothing;

insert into public.staff_services (staff_id, service_id)
select s.id, sv.id
from public.staff s
join public.services sv on true
where (s.title = 'Massage Therapist' and sv.slug in (
         'deep-tissue-massage-60','deep-tissue-massage-90','swedish-massage-60','swedish-massage-90',
         'aromatherapy-massage-60','aromatherapy-massage-90','head-neck-back-massage-30',
         'head-massage-30','feet-massage-30','body-scrub-45'))
   or (s.title = 'Senior Aesthetician' and sv.slug in (
         'acne-treatment','cleansing-facial','body-scrub-45','leg-waxing','arm-waxing',
         'under-arm-waxing','bikini-waxing','full-body-waxing'))
   or (s.title = 'Nail & Bridal Artist' and sv.slug in (
         'manicure-45','pedicure-45','leg-waxing','arm-waxing','under-arm-waxing'))
   or (s.title = 'Senior Stylist' and sv.slug in ('head-massage-30','cleansing-facial'))
on conflict do nothing;
