#!/usr/bin/env node
/**
 * Seeds Supabase with scraped IMDb data
 * 
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_KEY=service-role-key node seed_from_json.mjs
 * 
 * Input: ../data/nollywood_people.json
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'data', 'nollywood_people.json');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_KEY environment variables');
  process.exit(1);
}

if (!fs.existsSync(DATA_FILE)) {
  console.error(`Data file not found: ${DATA_FILE}`);
  console.error('Run scrape_imdb.mjs first');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function parseName(name) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return { first_name: parts[0], last_name: '' };
  return {
    first_name: parts.slice(0, -1).join(' '),
    last_name: parts[parts.length - 1],
  };
}

function inferRole(description, knownFor) {
  const text = ((description || '') + ' ' + (knownFor || []).join(' ')).toLowerCase();
  if (text.includes('director')) return 'director';
  if (text.includes('producer')) return 'producer';
  if (text.includes('cinematographer') || text.includes('dop') || text.includes('dp')) return 'crew';
  if (text.includes('editor') || text.includes('editing')) return 'crew';
  if (text.includes('sound') || text.includes('music')) return 'crew';
  if (text.includes('screenwriter') || text.includes('writer')) return 'director';
  if (text.includes('actor') || text.includes('actress')) return 'actor';
  return 'actor'; // default
}

function inferLocation(placeOfBirth, description) {
  const text = ((placeOfBirth || '') + ' ' + (description || '')).toLowerCase();
  if (text.includes('lagos')) return 'Lagos, Nigeria';
  if (text.includes('abuja')) return 'Abuja, Nigeria';
  if (text.includes('enugu')) return 'Enugu, Nigeria';
  if (text.includes('ibadan')) return 'Ibadan, Nigeria';
  if (text.includes('port harcourt') || text.includes('ph')) return 'Port Harcourt, Nigeria';
  if (text.includes('ghana') || text.includes('accra')) return 'Accra, Ghana';
  if (text.includes('south africa') || text.includes('cape town')) return 'Cape Town, South Africa';
  if (text.includes('uk') || text.includes('london') || text.includes('england')) return 'London, UK';
  if (text.includes('us') || text.includes('america') || text.includes('new york') || text.includes('los angeles')) return 'USA';
  return 'Nigeria';
}

function inferGender(name, description) {
  const text = ((name || '') + ' ' + (description || '')).toLowerCase();
  if (text.includes('actress') || text.includes('she ') || text.includes(' her ')) return 'female';
  if (text.includes('actor') || text.includes(' he ') || text.includes(' his ')) return 'male';
  return null;
}

async function seed() {
  console.log('🌱 Seeding Supabase with scraped Nollywood data...\n');
  
  const rawData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  console.log(`Loaded ${rawData.length} people from JSON\n`);
  
  const profiles = [];
  let inserted = 0;
  let skipped = 0;
  
  for (const person of rawData) {
    const nameParts = parseName(person.name || '');
    if (!nameParts.first_name) {
      skipped++;
      continue;
    }
    
    const profile = {
      email: `${nameParts.first_name.toLowerCase().replace(/[^a-z]/g, '')}.${nameParts.last_name.toLowerCase().replace(/[^a-z]/g, '')}@nollycrew.com`,
      first_name: nameParts.first_name,
      last_name: nameParts.last_name,
      nickname: person.nickname || null,
      stage_name: person.stage_name || null,
      bio: person.bio || null,
      location: inferLocation(person.place_of_birth, person.raw_description),
      industry_role: inferRole(person.raw_description, person.known_for),
      gender: inferGender(person.name, person.raw_description),
      date_of_birth: person.date_of_birth || null,
      imdb_id: person.imdb_id || null,
      known_works: person.known_for || [],
      filmography: person.filmography || [],
      notable_works: person.known_for || [],
      career_start_year: null,
      data_source: person.source || 'imdb',
      claim_status: 'unclaimed',
      is_verified: false,
    };
    
    profiles.push(profile);
  }
  
  console.log(`Prepared ${profiles.length} profiles (${skipped} skipped)\n`);
  
  // Insert in batches
  const BATCH_SIZE = 100;
  for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
    const batch = profiles.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from('profiles')
      .upsert(batch, { onConflict: 'email', ignoreDuplicates: true })
      .select();
    
    if (error) {
      console.error(`  ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} error: ${error.message}`);
    } else {
      inserted += data?.length || 0;
      console.log(`  ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${data?.length || 0} (total: ${inserted})`);
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(`\n✅ Done! Inserted: ${inserted}, Skipped: ${skipped}`);
  
  // Stats
  const { count: totalProfiles } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  
  const { count: unclaimed } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('claim_status', 'unclaimed');
  
  console.log(`\n📊 Database stats:`);
  console.log(`  Total profiles: ${totalProfiles}`);
  console.log(`  Unclaimed: ${unclaimed}`);
  console.log(`  Claimable: ${unclaimed}`);
}

seed().catch(console.error);
