#!/usr/bin/env node
/**
 * Nigerian Production Houses & Companies Scraper
 */

import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'nollywood_companies.json');
const SQL_FILE = path.join(__dirname, '..', 'supabase', 'seed', 'seed_companies.sql');

const HEADERS = { 'User-Agent': 'NollyCrewBot/1.0 (research)', 'Accept': 'text/html' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchPage(url) {
  try {
    const r = await fetch(url, { headers: HEADERS });
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; }
}

const PAGES = [
  // Main lists
  'https://en.wikipedia.org/wiki/List_of_Nigerian_film_studios',
  'https://en.wikipedia.org/wiki/Nollywood',
  'https://en.wikipedia.org/wiki/Kannywood',
  'https://en.wikipedia.org/wiki/Ghallywood',
  
  // Major studios
  'https://en.wikipedia.org/wiki/EbonyLife_Films',
  'https://en.wikipedia.org/wiki/Kunle_Afolayan_Production',
  'https://en.wikipedia.org/wiki/Tinapa_Studio',
  'https://en.wikipedia.org/wiki/Filmhouse_Cinema',
  'https://en.wikipedia.org/wiki/Bioskop_Nollywood',
  'https://en.wikipedia.org/wiki/Trendy_Net',
  'https://en.wikipedia.org/wiki/M-Net',
  'https://en.wikipedia.org/wiki/Multichoice',
  'https://en.wikipedia.org/wiki/DStv',
  'https://en.wikipedia.org/wiki/Showmax',
  'https://en.wikipedia.org/wiki/Netflix',
  'https://en.wikipedia.org/wiki/Amazon_Prime_Video',
  'https://en.wikipedia.org/wiki/Apple_TV%2B',
  'https://en.wikipedia.org/wiki/IROKOtv',
  'https://en.wikipedia.org/wiki/Netflix_Nollywood',
  
  // Production companies
  'https://en.wikipedia.org/wiki/Tinsel_(TV_series)',
  'https://en.wikipedia.org/wiki/Hush_(Nigerian_TV_series)',
  'https://en.wikipedia.org/wiki/The_Royal_Hibiscus_Hotel',
  'https://en.wikipedia.org/wiki/The_Wedding_Party_(film)',
  'https://en.wikipedia.org/wiki/King_of_Boys',
  'https://en.wikipedia.org/wiki/Lionheart_(2018_film)',
  'https://en.wikipedia.org/wiki/October_1_(film)',
  'https://en.wikipedia.org/wiki/Oloture',
  'https://en.wikipedia.org/wiki/Your_Excellency',
  'https://en.wikipedia.org/wiki/Chief_Daddy',
  'https://en.wikipedia.org/wiki/Glitch_(Nigerian_TV_series)',
  'https://en.wikipedia.org/wiki/Shanty_Town_(TV_series)',
  'https://en.wikipedia.org/wiki/Sugar_Rush_(film)',
  'https://en.wikipedia.org/wiki/Banana_Island_Ghost',
  'https://en.wikipedia.org/wiki/Citation_(film)',
  'https://en.wikipedia.org/wiki/Dry_(film)',
  'https://en.wikipedia.org/wiki/Wives_on_Strike',
  'https://en.wikipedia.org/wiki/My_Wife_and_I',
  'https://en.wikipedia.org/wiki/The_Million_Dollar_Hotel',
  'https://en.wikipedia.org/wiki/A_Tribe_Called_Judah',
  'https://en.wikipedia.org/wiki/Omo_Ghetto:_The_Saga',
  'https://en.wikipedia.org/wiki/Battle_on_Buka_Street',
  'https://en.wikipedia.org/wiki/Isoken_(film)',
  'https://en.wikipedia.org/wiki/The_Set_Up_(2018_film)',
  
  // Film commissions & regulatory
  'https://en.wikipedia.org/wiki/National_Film_and_Video_Censors_Board',
  'https://en.wikipedia.org/wiki/Nigerian_Film_Corporation',
  'https://en.wikipedia.org/wiki/Lagos_Film_Academy',
  
  // Streaming platforms
  'https://en.wikipedia.org/wiki/Africa_Magic',
  'https://en.wikipedia.org/wiki/Nollywood_Love',
  'https://en.wikipedia.org/wiki/Bongo_Videos',
  
  // More production houses from film pages
  'https://en.wikipedia.org/wiki/Jenifa_(film)',
  'https://en.wikipedia.org/wiki/Jenifa%27s_Diary',
  'https://en.wikipedia.org/wiki/Living_in_Bondage',
  'https://en.wikipedia.org/wiki/Living_in_Bondage:_Breaking_Free',
  'https://en.wikipedia.org/wiki/Oh_Brothers',
  'https://en.wikipedia.org/wiki/Saworoide',
  'https://en.wikipedia.org/wiki/Aiyetoro_Town',
  'https://en.wikipedia.org/wiki/Egun',
  'https://en.wikipedia.org/wiki/Issakaba',
  'https://en.wikipedia.org/wiki/Two_Beggars',
  'https://en.wikipedia.org/wiki/Thunder_Fire_You',
  'https://en.wikipedia.org/wiki/Nneka_The_Pretty_Serpent',
  'https://en.wikipedia.org/wiki/Confusion_Na_Wa',
  'https://en.wikipedia.org/wiki/The_Messengers_(Nigerian_TV_series)',
  'https://en.wikipedia.org/wiki/Bella_s_Coach',
  'https://en.wikipedia.org/wiki/Halita_(TV_series)',
  'https://en.wikipedia.org/wiki/Kasaita',
  'https://en.wikipedia.org/wiki/So_Sois_Bon',
  
  // Ghanaian production houses
  'https://en.wikipedia.org/wiki/Date_Banana',
  'https://en.wikipedia.org/wiki/The_Perfect_Picture',
  'https://en.wikipedia.org/wiki/Azoke',
  
  // South African production houses
  'https://en.wikipedia.org/wiki/Quizzical_Pictures',
  'https://en.wikipedia.org/wiki/Trigger_Fish_Animation',
  'https://en.wikipedia.org/wiki/Black_Titan_Pictures',
  
  // East African
  'https://en.wikipedia.org/wiki/Rock_Pictures',
  'https://en.wikipedia.org/wiki/Bahati_Films',
  'https://en.wikipedia.org/wiki/AFRICAN_MAGIC',
];

const badWords = new Set([
  'main page', 'contents', 'current events', 'random article', 'about wikipedia',
  'contact us', 'community portal', 'recent changes', 'upload file', 'special pages',
  'permanent link', 'page information', 'cite this page', 'wikidata item', 'edit links',
  'in other projects', 'wikimedia commons', 'wikibooks', 'wikiquote', 'wikisource',
  'wikiversity', 'wiktionary', 'print/export', 'download as pdf', 'printable version',
  'languages', 'name', 'talk', 'read', 'edit', 'view history', 'wikipedia',
  'the free encyclopedia', 'jump to content', 'navigation', 'search', 'donate',
  'contribute', 'help', 'learn to edit', 'what links here', 'related changes',
  'edit interlanguage links', 'edit wikidata item', 'short', 'portal', 'category',
  'articles', 'edit source', 'history', 'move', 'watch', 'tools', 'get shortened url',
  'download qr code', 'page', 'references', 'external links', 'notes', 'further reading',
  'bibliography', 'see also', 'retrieved', 'archived', 'original', 'dead link',
  'template', 'infobox', 'stub', 'navbox', 'citation', 'reflist',
  'film', 'nollywood', 'hausa', 'igbo', 'yoruba', 'bahasa', 'indonesia',
  'egyptian', 'arabic', 'bengali', 'deutsch', 'espanol', 'francais', 'italiano',
  'norsk', 'portugues', 'svenska', 'tieng', 'turkce', 'polski', 'ceska', 'dansk',
  'suomi', 'korean', 'japanese', 'chinese', 'hindi', 'nigerian', 'ghanaian',
  'kenyan', 'south', 'african', 'british', 'american', 'canadian', 'austradian',
  'indian', 'pakistani', 'sport', 'traditional', 'video', 'gaming', 'cuisine',
  'actor', 'actress', 'director', 'producer', 'series', 'season', 'episode',
  'plot', 'cast', 'crew', 'soundtrack', 'production', 'release', 'distribution',
  'awards', 'nominations', 'budget', 'runtime', 'language', 'country', 'gross',
]);

async function main() {
  console.log('🏢 Nigerian Production Houses & Companies Scraper\n');
  
  let existing = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    console.log(`Loaded ${existing.length} existing companies\n`);
  }
  
  const seenNames = new Set(existing.map(c => c.name.toLowerCase()));
  let added = 0;
  
  for (let i = 0; i < PAGES.length; i++) {
    const url = PAGES[i];
    const pageName = url.split('/').pop().replace(/_/g, ' ');
    process.stdout.write(`  [${i+1}/${PAGES.length}] ${pageName.substring(0, 45).padEnd(45)} `);
    
    const html = await fetchPage(url);
    if (!html) { console.log('SKIP'); continue; }
    
    const $ = cheerio.load(html);
    const companies = [];
    
    // Look for company names in links and text
    $('#mw-content-text').find('a[href*="/wiki/"]').each((_, el) => {
      const href = $(el).attr('href');
      const name = $(el).text().trim();
      if (!name || name.length < 3) return;
      if (href.includes('File:') || href.includes('Category:') || href.includes('Help:')) return;
      if (href.includes('Wikipedia:') || href.includes('Template:') || href.includes('Special:')) return;
      if (href.includes('Portal:') || href.includes('Talk:') || href.includes('User:')) return;
      
      // Check if it looks like a company (contains keywords)
      const lower = name.toLowerCase();
      const isCompany = lower.includes('film') || lower.includes('studio') || lower.includes('media') ||
        lower.includes('production') || lower.includes('pictures') || lower.includes('entertainment') ||
        lower.includes('network') || lower.includes('broadcast') || lower.includes('television') ||
        lower.includes('cinema') || lower.includes('arts') || lower.includes('creative') ||
        lower.includes('content') || lower.includes('digital') || lower.includes('arts') ||
        lower.includes('group') || lower.includes('global') || lower.includes('international') ||
        lower.includes('limited') || lower.includes('inc') || lower.includes('llc');
      
      if (isCompany) {
        companies.push({ name, wiki_url: `https://en.wikipedia.org${href}` });
      }
    });
    
    // Also extract from infobox
    $('.infobox').each((_, el) => {
      const name = $(el).find('caption, th').first().text().trim();
      if (name && name.length > 3) {
        const lower = name.toLowerCase();
        const isCompany = lower.includes('film') || lower.includes('studio') || lower.includes('media') ||
          lower.includes('production') || lower.includes('pictures') || lower.includes('entertainment') ||
          lower.includes('network') || lower.includes('broadcast') || lower.includes('cinema');
        if (isCompany) {
          companies.push({ name, wiki_url: url });
        }
      }
    });
    
    let newCount = 0;
    for (const c of companies) {
      const nameLower = c.name.toLowerCase().trim();
      if (seenNames.has(nameLower)) continue;
      if (badWords.has(nameLower)) continue;
      
      seenNames.add(nameLower);
      existing.push({
        name: c.name,
        wiki_url: c.wiki_url,
        source: 'wikipedia',
      });
      newCount++;
      added++;
    }
    
    console.log(`+${newCount} (${existing.length} total)`);
    await sleep(1500);
  }
  
  // Save
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existing, null, 2));
  
  // Generate SQL
  const lines = ['-- NollyCrew Production Houses & Companies', `-- ${existing.length} companies`,
    '-- Run in Supabase SQL Editor', '', 'BEGIN;', ''];
  
  // Create companies table if not exists
  lines.push(`CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    wiki_url TEXT,
    website TEXT,
    location TEXT,
    industry TEXT DEFAULT 'film',
    description TEXT,
    founded_year INTEGER,
    founder TEXT,
    claim_status TEXT DEFAULT 'unclaimed',
    claimed_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`);
  lines.push('');
  lines.push('ALTER TABLE companies ENABLE ROW LEVEL SECURITY;');
  lines.push('CREATE POLICY "Public companies" ON companies FOR SELECT USING (true);');
  lines.push('CREATE POLICY "Users can claim" ON companies FOR UPDATE USING (auth.uid() = claimed_by);');
  lines.push('');
  
  for (const c of existing) {
    const ne = c.name.replace(/'/g, "''");
    const we = (c.wiki_url || '').replace(/'/g, "''");
    lines.push(`INSERT INTO companies (name, wiki_url, claim_status) VALUES ('${ne}', '${we}', 'unclaimed') ON CONFLICT DO NOTHING;`);
  }
  
  lines.push('', 'COMMIT;', `-- Total: ${existing.length} companies`);
  fs.writeFileSync(SQL_FILE, lines.join('\n'));
  
  console.log(`\n✅ Done! Added ${added} new companies`);
  console.log(`Total: ${existing.length} companies`);
}

main().catch(console.error);
