#!/usr/bin/env node
/**
 * Deep Wikipedia scraper - extracts people from Nollywood-related pages
 */

import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'nollywood_people_clean.json');

const HEADERS = {
  'User-Agent': 'NollyCrewBot/1.0 (research; contact@nollycrew.com)',
  'Accept': 'text/html',
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchPage(url) {
  try {
    const r = await fetch(url, { headers: HEADERS });
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; }
}

// Additional Wikipedia pages to scrape
const WIKI_PAGES = [
  // State-specific Nollywood
  'https://en.wikipedia.org/wiki/Hausa_language_film_industry',
  'https://en.wikipedia.org/wiki/Kannywood',
  'https://en.wikipedia.org/wiki/Ghallywood',
  'https://en.wikipedia.org/wiki/Kumawood',
  'https://en.wikipedia.org/wiki/Tollywood_(Nigeria)',
  // Film lists
  'https://en.wikipedia.org/wiki/List_of_Nigerian_films_of_2023',
  'https://en.wikipedia.org/wiki/List_of_Nigerian_films_of_2024',
  'https://en.wikipedia.org/wiki/List_of_Nigerian_films_of_2025',
  'https://en.wikipedia.org/wiki/List_of_Nigerian_films_of_2022',
  'https://en.wikipedia.org/wiki/List_of_Nigerian_films_of_2021',
  'https://en.wikipedia.org/wiki/List_of_Nigerian_films_of_2020',
  'https://en.wikipedia.org/wiki/List_of_Nigerian_films_of_2019',
  'https://en.wikipedia.org/wiki/List_of_Nigerian_films_of_2018',
  'https://en.wikipedia.org/wiki/List_of_Nigerian_films_of_2017',
  'https://en.wikipedia.org/wiki/List_of_Nigerian_films_of_2016',
  'https://en.wikipedia.org/wiki/List_of_Nigerian_films_of_2015',
  // Awards
  'https://en.wikipedia.org/wiki/Africa_Movie_Academy_Award_for_Best_Actor_in_a_Leading_Role',
  'https://en.wikipedia.org/wiki/Africa_Movie_Academy_Award_for_Best_Actress_in_a_Leading_Role',
  'https://en.wikipedia.org/wiki/Africa_Movie_Academy_Award_for_Best_Director',
  'https://en.wikipedia.org/wiki/Africa_Movie_Academy_Award_for_Best_Film',
  'https://en.wikipedia.org/wiki/Best_Director_Africa_Movie_Academy_Award',
  'https://en.wikipedia.org/wiki/Best_Film_Africa_Movie_Academy_Award',
  // Major films with full cast
  'https://en.wikipedia.org/wiki/The_Wedding_Party_(film)',
  'https://en.wikipedia.org/wiki/The_Wedding_Party_2',
  'https://en.wikipedia.org/wiki/King_of_Boys',
  'https://en.wikipedia.org/wiki/Lionheart_(2018_film)',
  'https://en.wikipedia.org/wiki/October_1_(film)',
  'https://en.wikipedia.org/wiki/The_Set_Up_(2018_film)',
  'https://en.wikipedia.org/wiki/Isoken_(film)',
  'https://en.wikipedia.org/wiki/Your_Excellency',
  'https://en.wikipedia.org/wiki/Chief_Daddy',
  'https://en.wikipedia.org/wiki/Oloture',
  'https://en.wikipedia.org/wiki/Omo_Ghetto:_The_Saga',
  'https://en.wikipedia.org/wiki/Battle_on_Buka_Street',
  'https://en.wikipedia.org/wiki/Ghost_Legs',
  'https://en.wikipedia.org/wiki/Dinner_at_My_Place',
  'https://en.wikipedia.org/wiki/The_Underdoggs',
  'https://en.wikipedia.org/wiki/A_Tribe_Called_Judah',
  'https://en.wikipedia.org/wiki/Funke_Akindele',
  'https://en.wikipedia.org/wiki/Genevieve_Nnaji',
  'https://en.wikipedia.org/wiki/Omotola_Jalade-Ekeinde',
  'https://en.wikipedia.org/wiki/Richard_Mofe-Damijo',
  'https://en.wikipedia.org/wiki/Ramsey_Nouah',
  'https://en.wikipedia.org/wiki/Jim_Iyke',
  'https://en.wikipedia.org/wiki/Desmond_Elliot',
  'https://en.wikipedia.org/wiki/Kunle_Afolayan',
  'https://en.wikipedia.org/wiki/Kemi_Adetiba',
  'https://en.wikipedia.org/wiki/Mo_Abudu',
  'https://en.wikipedia.org/wiki/Niyi_Akinmolayan',
  'https://en.wikipedia.org/wiki/Lancelot_Imasuen',
  'https://en.wikipedia.org/wiki/Rita_Dominic',
  'https://en.wikipedia.org/wiki/Joke_Silva',
  'https://en.wikipedia.org/wiki/Olu_Jacobs',
  'https://en.wikipedia.org/wiki/Patience_Ozokwor',
  'https://en.wikipedia.org/wiki/Mercy_Johnson',
  'https://en.wikipedia.org/wiki/Ini_Edo',
  'https://en.wikipedia.org/wiki/Chioma_Chukwuka',
  'https://en.wikipedia.org/wiki/Bimbo_Ademoye',
  'https://en.wikipedia.org/wiki/Odunlade_Adekola',
  'https://en.wikipedia.org/wiki/Femi_Adebayo',
  'https://en.wikipedia.org/wiki/Sola_Sobowale',
  'https://en.wikipedia.org/wiki/Kanayo_O._Kanayo',
  'https://en.wikipedia.org/wiki/Segun_Arinze',
  'https://en.wikipedia.org/wiki/Akin_Lewis',
  'https://en.wikipedia.org/wiki/Kenneth_Okonkwo',
  'https://en.wikipedia.org/wiki/John_Dumelo',
  'https://en.wikipedia.org/wiki/Majid_Michel',
  'https://en.wikipedia.org/wiki/David_Oyelowo',
  'https://en.wikipedia.org/wiki/Adewale_Akinnuoye-Agbaje',
  'https://en.wikipedia.org/wiki/Hakeem_Kae-Kazim',
  'https://en.wikipedia.org/wiki/Chiwetel_Ejiofor',
];

// Known blacklist
const nonPerson = new Set([
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
  'template', 'infobox', 'stub', 'navbox', 'citation', 'reflist', 'film',
  'nollywood', 'hausa', 'igbo', 'yoruba', 'bahasa', 'indonesia', 'egyptian',
  'arabic', 'bengali', 'deutsch', 'espanol', 'francais', 'italiano', 'norsk',
  'portugues', 'svenska', 'tieng', 'turkce', 'polski', 'ceska', 'dansk', 'suomi',
  'korean', 'japanese', 'chinese', 'hindi', 'nigerian', 'ghanaian', 'kenyan',
  'south', 'african', 'british', 'american', 'canadian', 'austradian', 'indian',
  'pakistani', 'sport', 'traditional', 'video', 'gaming', 'cuisine', 'afang',
  'abacha', 'amala', 'edikang', 'ikong', 'ukodo', 'egusi', 'puff', 'suya',
  'jollof', 'amala', 'fufu', 'garr', 'new', 'yam', 'festivals', 'outline',
  'olokun', 'omabe', 'sango', 'umatu', 'oronna', 'actor', 'actress', 'director',
  'producer', 'series', 'season', 'episode', 'part', 'volume', 'chapter',
  'section', 'box', 'office', 'critics', 'reception', 'plot', 'cast', 'crew',
  'soundtrack', 'production', 'release', 'distribution', 'awards', 'nominations',
  'budget', 'runtime', 'language', 'country', 'budget', 'gross', 'opening',
  'weekend', 'domestic', 'international', 'worldwide', 'rating', 'reviews',
]);

function parseName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

async function extractPeopleFromPage(html, sourceUrl) {
  const $ = cheerio.load(html);
  const people = [];
  
  // Extract from links in content area
  const content = $('#mw-content-text');
  content.find('a[href*="/wiki/"]').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    const name = $el.text().trim();
    
    if (!name || name.length < 3) return;
    if (href.includes('File:') || href.includes('Category:') || href.includes('Help:')) return;
    if (href.includes('Wikipedia:') || href.includes('Template:') || href.includes('Special:')) return;
    if (href.includes('Portal:') || href.includes('Talk:') || href.includes('User:')) return;
    
    const wikiPage = href.replace('/wiki/', '');
    if (wikiPage.includes('#')) return;
    
    people.push({ name, wiki_url: `https://en.wikipedia.org${href}` });
  });
  
  return people;
}

async function main() {
  console.log('🔍 Deep Wikipedia Scraper\n');
  
  // Load existing
  let existing = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    console.log(`Loaded ${existing.length} existing profiles\n`);
  }
  
  const seenNames = new Set(existing.map(p => p.name.toLowerCase()));
  let added = 0;
  
  for (let i = 0; i < WIKI_PAGES.length; i++) {
    const url = WIKI_PAGES[i];
    const pageName = url.split('/').pop().replace(/_/g, ' ');
    process.stdout.write(`  [${i+1}/${WIKI_PAGES.length}] ${pageName.substring(0, 40)}... `);
    
    const html = await fetchPage(url);
    if (!html) { console.log('SKIP'); continue; }
    
    const people = await extractPeopleFromPage(html, url);
    let newCount = 0;
    
    for (const p of people) {
      const nameLower = p.name.toLowerCase().trim();
      if (seenNames.has(nameLower)) continue;
      if (nonPerson.has(nameLower)) continue;
      
      const words = nameLower.split(/\s+/);
      if (words.some(w => nonPerson.has(w))) continue;
      
      const { first, last } = parseName(p.name);
      if (first.length < 2) continue;
      
      seenNames.add(nameLower);
      existing.push({
        name: p.name,
        first,
        last,
        role: 'actor',
        source: 'wikipedia_deep',
        wiki_url: p.wiki_url,
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
  const lines = ['-- NollyCrew Industry Seed Data', `-- ${existing.length} real Nollywood professionals`,
    '-- Run in Supabase SQL Editor after 001_initial_schema.sql', '', 'BEGIN;', ''];
  
  for (const p of existing) {
    const fe = p.first.replace(/'/g, "''");
    const le = p.last.replace(/'/g, "''");
    const emailBase = `${p.first.toLowerCase().replace(/\s/g, '')}.${p.last.toLowerCase().replace(/\s/g, '')}`;
    const ee = emailBase.replace(/[^a-z0-9.]/g, '') + '@nollywood.com';
    lines.push(`INSERT INTO profiles (email, first_name, last_name, industry_role, claim_status, is_verified, data_source) VALUES ('${ee}', '${fe}', '${le}', '${p.role}', 'unclaimed', false, 'wikipedia') ON CONFLICT (email) DO NOTHING;`);
  }
  
  lines.push('', 'COMMIT;', `-- Total: ${existing.length} profiles`);
  
  const sqlPath = path.join(__dirname, '..', 'supabase', 'seed', 'seed_industry.sql');
  fs.writeFileSync(sqlPath, lines.join('\n'));
  
  console.log(`\n✅ Done! Added ${added} new profiles`);
  console.log(`Total: ${existing.length} profiles`);
  console.log(`📁 ${OUTPUT_FILE}`);
  console.log(`📁 ${sqlPath}`);
}

main().catch(console.error);
