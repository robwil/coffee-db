-- Machines
INSERT OR IGNORE INTO machines (id, name, manufacturer) VALUES
  ('machine_ecm_sync', 'ECM Synchronika', 'ECM'),
  ('machine_lm_micra', 'La Marzocco Linea Micra', 'La Marzocco'),
  ('machine_lm_levax', 'La Marzocco Leva X', 'La Marzocco'),
  ('machine_lelit_bianca', 'Lelit Bianca', 'Lelit'),
  ('machine_breville_bambino', 'Bambino Plus', 'Breville');

-- Grinders
INSERT OR IGNORE INTO grinders (id, name, manufacturer) VALUES
  ('grinder_niche_zero', 'Niche Zero', 'Niche'),
  ('grinder_df64', 'DF64', 'Turin'),
  ('grinder_comandante', 'Comandante C40', 'Comandante'),
  ('grinder_1zpresso_jx', '1Zpresso JX-Pro', '1Zpresso'),
  ('grinder_eureka_mignon', 'Eureka Mignon Specialita', 'Eureka');

-- Beans
INSERT OR IGNORE INTO beans (id, name, roaster, origin, roast_level, roaster_city, roaster_country, tasting_notes) VALUES
  ('bean_jairo', 'Jairo Arcila Espresso', 'Monogram', 'Colombia', 2, 'Calgary', 'Canada', 'Stone fruit, caramel, chocolate'),
  ('bean_honduras', 'Honduras Comsa', 'Red Rooster', 'Honduras', 3, NULL, 'United States', 'Nutty, sweet, balanced'),
  ('bean_wollega', '74158 Wollega Natural', 'Home Roast', 'Ethiopia', 2, NULL, 'Ukraine', 'Blueberry, wine, dark chocolate'),
  ('bean_berry', 'Berry Blues', 'DAK Coffee Roasters', 'Ethiopia', 2, 'Amsterdam', 'Netherlands', 'Blueberry, strawberry, floral'),
  ('bean_chelchele', 'Chelchele', 'PERC', 'Ethiopia', 2, 'Savannah', 'United States', 'Peach, jasmine, bergamot');

-- Espresso brews
INSERT OR IGNORE INTO espresso_brews (id, bean_id, machine_id, grinder_id, dose_grams, yield_grams, total_time_seconds, grind_setting, rating, tasting_notes) VALUES
  ('brew_jairo_1', 'bean_jairo', 'machine_ecm_sync', 'grinder_niche_zero', 18.0, 36.0, 28, '15', 9, 'Sweet, balanced, caramel finish'),
  ('brew_honduras_1', 'bean_honduras', 'machine_lm_micra', 'grinder_eureka_mignon', 18.0, 40.0, 32, '3.5', 10, 'Perfect sweetness, no bitterness'),
  ('brew_wollega_1', 'bean_wollega', 'machine_lm_levax', 'grinder_df64', 20.0, 40.0, 35, '2.0', 8, 'Fruity, winey, complex'),
  ('brew_berry_1', 'bean_berry', 'machine_lelit_bianca', 'grinder_comandante', 18.0, 36.0, 30, '12 clicks', 10, 'Intense berry, juicy, floral'),
  ('brew_chelchele_1', 'bean_chelchele', 'machine_breville_bambino', 'grinder_1zpresso_jx', 18.0, 38.0, 26, '24', 10, 'Bright, tea-like, peachy');
