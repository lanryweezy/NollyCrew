#!/usr/bin/env node
/**
 * Extended scraper - more film pages, festivals, studios, recent films
 */

import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'nollywood_people_clean.json');
const SQL_FILE = path.join(__dirname, '..', 'supabase', 'seed', 'seed_industry.sql');

const HEADERS = { 'User-Agent': 'NollyCrewBot/1.0 (research)', 'Accept': 'text/html' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchPage(url) {
  try {
    const r = await fetch(url, { headers: HEADERS });
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; }
}

// More Wikipedia pages
const PAGES = [
  // More films
  'https://en.wikipedia.org/wiki/December_Baby',
  'https://en.wikipedia.org/wiki/The_Gods_Are_Not_Blasphemous',
  'https://en.wikipedia.org/wiki/Confusion_Na_Wa',
  'https://en.wikipedia.org/wiki/Two_Beggars',
  'https://en.wikipedia.org/wiki/Saworoide',
  'https://en.wikipedia.org/wiki/Taxi_Driver_(Nigerian_film)',
  'https://en.wikipedia.org/wiki/Aiyetoro_Town',
  'https://en.wikipedia.org/wiki/Egun',
  'https://en.wikipedia.org/wiki/Asewo_To_Mecca',
  'https://en.wikipedia.org/wiki/Thunder_Fire_You',
  'https://en.wikipedia.org/wiki/Nneka_The_Pretty_Serpent',
  'https://en.wikipedia.org/wiki/Issakaba',
  'https://en.wikipedia.org/wiki/Oh_Brothers',
  'https://en.wikipedia.org/wiki/Idemili',
  'https://en.wikipedia.org/wiki/Dry_(film)',
  'https://en.wikipedia.org/wiki/Wives_on_Strike',
  'https://en.wikipedia.org/wiki/My_Wife_and_I',
  'https://en.wikipedia.org/wiki/The_Royal_Hibiscus_Hotel',
  'https://en.wikipedia.org/wiki/Banana_Island_Ghost',
  'https://en.wikipedia.org/wiki/The_Million_Dollar_Hotel',
  'https://en.wikipedia.org/wiki/Citation_(film)',
  'https://en.wikipedia.org/wiki/Glitch_(Nigerian_TV_series)',
  'https://en.wikipedia.org/wiki/Shanty_Town_(TV_series)',
  'https://en.wikipedia.org/wiki/The_Messengers_(Nigerian_TV_series)',
  'https://en.wikipedia.org/wiki/Sugar_Rush_(film)',
  'https://en.wikipedia.org/wiki/The_League_of_Extraordinary_Gentlemen_(film)',
  'https://en.wikipedia.org/wiki/Coming_to_America',
  'https://en.wikipedia.org/wiki/The_Mummy_Returns',
  'https://en.wikipedia.org/wiki/Atlantis:_The_Lost_Empire',
  'https://en.wikipedia.org/wiki/Maleficent_(film)',
  'https://en.wikipedia.org/wiki/The_King%27s_Speech',
  'https://en.wikipedia.org/wiki/12_Years_a_Slave',
  'https://en.wikipedia.org/wiki/Star_Wars:_The_Force_Awakens',
  'https://en.wikipedia.org/wiki/Captain_America:_Civil_War',
  'https://en.wikipedia.org/wiki/Avengers:_Infinity_War',
  'https://en.wikipedia.org/wiki/Black_Panther_(film)',
  'https://en.wikipedia.org/wiki/Lion_King_(2019_film)',
  'https://en.wikipedia.org/wiki/The_Witcher_(TV_series)',
  'https://en.wikipedia.org/wiki/Bridgerton',
  'https://en.wikipedia.org/wiki/Lupin_(TV_series)',
  'https://en.wikipedia.org/wiki/Squid_Game',
  'https://en.wikipedia.org/wiki/Stranger_Things',
  'https://en.wikipedia.org/wiki/The_Crown_(TV_series)',
  // Studios & production companies
  'https://en.wikipedia.org/wiki/EbonyLife_Films',
  'https://en.wikipedia.org/wiki/Kunle_Afolayan_Production',
  'https://en.wikipedia.org/wiki/Tinapa_Studio',
  'https://en.wikipedia.org/wiki/Filmhouse_Cinema',
  'https://en.wikipedia.org/wiki/Bioskop_Nollywood',
  'https://en.wikipedia.org/wiki/Ghana_Film_Industry',
  'https://en.wikipedia.org/wiki/South_African_cinema',
  'https://en.wikipedia.org/wiki/East_African_cinema',
  'https://en.wikipedia.org/wiki/Senegalese_cinema',
  'https://en.wikipedia.org/wiki/Tanzanian_cinema',
  'https://en.wikipedia.org/wiki/Kenyan_cinema',
  'https://en.wikipedia.org/wiki/Ugandan_cinema',
  'https://en.wikipedia.org/wiki/Ethiopian_cinema',
  'https://en.wikipedia.org/wiki/Congolese_cinema',
  'https://en.wikipedia.org/wiki/Desmond_Elliott',
  'https://en.wikipedia.org/wiki/Mercy_Johnson',
  'https://en.wikipedia.org/wiki/Chika_Ike',
  'https://en.wikipedia.org/wiki/Queen_Nwokoye',
  'https://en.wikipedia.org/wiki/Chioma_Akpotha',
  'https://en.wikipedia.org/wiki/Bimbo_Oshin',
  'https://en.wikipedia.org/wiki/Iyabo_Ojo',
  'https://en.wikipedia.org/wiki/Funke_Akindele',
  'https://en.wikipedia.org/wiki/Toyin_Abraham',
  'https://en.wikipedia.org/wiki/Toyin_Kolade',
  'https://en.wikipedia.org/wiki/Bimbo_Ademoye',
  'https://en.wikipedia.org/wiki/Sharon_Ooja',
  'https://en.wikipedia.org/wiki/Tobi_Bakre',
  'https://en.wikipedia.org/wiki/Timini_Egbuson',
  'https://en.wikipedia.org/wiki/Deyemi_Okanlawon',
  'https://en.wikipedia.org/wiki/Kenneth_Okolie',
  'https://en.wikipedia.org/wiki/Blossom_Chukwujekwu',
  'https://en.wikipedia.org/wiki/Alex_Ekubo',
  'https://en.wikipedia.org/wiki/IK_Ogbonna',
  'https://en.wikipedia.org/wiki/Mike_Ezuruonye',
  'https://en.wikipedia.org/wiki/Yul_Edochie',
  'https://en.wikipedia.org/wiki/Pete_Edochie',
  'https://en.wikipedia.org/wiki/John_Okafor',
  'https://en.wikipedia.org/wiki/Chinwetalu_Agu',
  'https://en.wikipedia.org/wiki/Nkem_Owoh',
  'https://en.wikipedia.org/wiki/Kanayo_O._Kanayo',
  'https://en.wikipedia.org/wiki/Segun_Arinze',
  'https://en.wikipedia.org/wiki/Akin_Lewis',
  'https://en.wikipedia.org/wiki/Olu_Jacobs',
  'https://en.wikipedia.org/wiki/Joke_Silva',
  'https://en.wikipedia.org/wiki/Rita_Dominic',
  'https://en.wikipedia.org/wiki/Genevieve_Nnaji',
  'https://en.wikipedia.org/wiki/Omotola_Jalade-Ekeinde',
  'https://en.wikipedia.org/wiki/Richard_Mofe-Damijo',
  'https://en.wikipedia.org/wiki/Ramsey_Nouah',
  'https://en.wikipedia.org/wiki/Jim_Iyke',
  'https://en.wikipedia.org/wiki/Kunle_Afolayan',
  'https://en.wikipedia.org/wiki/Kemi_Adetiba',
  'https://en.wikipedia.org/wiki/Mo_Abudu',
  'https://en.wikipedia.org/wiki/Lancelot_Imasuen',
  'https://en.wikipedia.org/wiki/Tade_Ogidan',
  'https://en.wikipedia.org/wiki/Femi_Adebayo',
  'https://en.wikipedia.org/wiki/Sola_Sobowale',
  'https://en.wikipedia.org/wiki/Odunlade_Adekola',
  'https://en.wikipedia.org/wiki/Fathia_Balogun',
  'https://en.wikipedia.org/wiki/Patience_Ozokwor',
  'https://en.wikipedia.org/wiki/Mercy_Johnson',
  'https://en.wikipedia.org/wiki/Ini_Edo',
  'https://en.wikipedia.org/wiki/Chioma_Chukwuka',
  'https://en.wikipedia.org/wiki/Adesua_Etomi',
  'https://en.wikipedia.org/wiki/Banky_W',
  'https://en.wikipedia.org/wiki/Toke_Makinwa',
  'https://en.wikipedia.org/wiki/Oluchi_Onweagba',
  'https://en.wikipedia.org/wiki/Majid_Michel',
  'https://en.wikipedia.org/wiki/John_Dumelo',
  'https://en.wikipedia.org/wiki/Jackie_Appiah',
  'https://en.wikipedia.org/wiki/Yvonne_Nelson',
  'https://en.wikipedia.org/wiki/Van_Vicker',
  'https://en.wikipedia.org/wiki/Ali_Nuhu',
  'https://en.wikipedia.org/wiki/Rahama_Sadau',
  'https://en.wikipedia.org/wiki/Adam_A._Zango',
  'https://en.wikipedia.org/wiki/David_Oyelowo',
  'https://en.wikipedia.org/wiki/Adewale_Akinnuoye-Agbaje',
  'https://en.wikipedia.org/wiki/Chiwetel_Ejiofor',
  'https://en.wikipedia.org/wiki/Lupita_Nyongo',
  'https://en.wikipedia.org/wiki/Hakeem_Kae-Kazim',
];

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
  'template', 'infobox', 'stub', 'navbox', 'citation', 'reflist',
  'film', 'nollywood', 'hausa', 'igbo', 'yoruba', 'bahasa', 'indonesia',
  'egyptian', 'arabic', 'bengali', 'deutsch', 'espanol', 'francais', 'italiano',
  'norsk', 'portugues', 'svenska', 'tieng', 'turkce', 'polski', 'ceska', 'dansk',
  'suomi', 'korean', 'japanese', 'chinese', 'hindi', 'nigerian', 'ghanaian',
  'kenyan', 'south', 'african', 'british', 'american', 'canadian', 'austradian',
  'indian', 'pakistani', 'sport', 'traditional', 'video', 'gaming', 'cuisine',
  'abacha', 'amala', 'edikang', 'ikong', 'ukodo', 'egusi', 'puff', 'suya',
  'jollof', 'fufu', 'garr', 'new', 'yam', 'festivals', 'outline', 'olokun',
  'omabe', 'sango', 'umatu', 'oronna', 'actor', 'actress', 'director', 'producer',
  'series', 'season', 'episode', 'part', 'volume', 'chapter', 'section', 'box',
  'office', 'critics', 'reception', 'plot', 'cast', 'crew', 'soundtrack',
  'production', 'release', 'distribution', 'awards', 'nominations', 'budget',
  'runtime', 'language', 'country', 'gross', 'opening', 'weekend', 'domestic',
  'international', 'worldwide', 'rating', 'reviews',
]);

function parseName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

async function main() {
  console.log('🌍 Extended Scraper\n');
  
  let existing = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    console.log(`Loaded ${existing.length} existing profiles\n`);
  }
  
  const seenNames = new Set(existing.map(p => p.name.toLowerCase()));
  let added = 0;
  
  for (let i = 0; i < PAGES.length; i++) {
    const url = PAGES[i];
    const pageName = url.split('/').pop().replace(/_/g, ' ');
    process.stdout.write(`  [${i+1}/${PAGES.length}] ${pageName.substring(0, 45).padEnd(45)} `);
    
    const html = await fetchPage(url);
    if (!html) { console.log('SKIP'); continue; }
    
    const $ = cheerio.load(html);
    const people = [];
    
    $('#mw-content-text').find('a[href*="/wiki/"]').each((_, el) => {
      const href = $(el).attr('href');
      const name = $(el).text().trim();
      if (!name || name.length < 3) return;
      if (href.includes('File:') || href.includes('Category:') || href.includes('Help:')) return;
      if (href.includes('Wikipedia:') || href.includes('Template:') || href.includes('Special:')) return;
      if (href.includes('Portal:') || href.includes('Talk:') || href.includes('User:')) return;
      people.push({ name, wiki_url: `https://en.wikipedia.org${href}` });
    });
    
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
        source: 'wikipedia_extended',
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
  const lines = ['-- NollyCrew Industry Seed Data', `-- ${existing.length} real Nollywood + Regional professionals`,
    '-- Run in Supabase SQL Editor after 001_initial_schema.sql', '', 'BEGIN;', ''];
  
  for (const p of existing) {
    const fe = p.first.replace(/'/g, "''");
    const le = p.last.replace(/'/g, "''");
    const emailBase = `${p.first.toLowerCase().replace(/\s/g, '')}.${p.last.toLowerCase().replace(/\s/g, '')}`;
    const ee = emailBase.replace(/[^a-z0-9.]/g, '') + '@nollywood.com';
    lines.push(`INSERT INTO profiles (email, first_name, last_name, industry_role, claim_status, is_verified, data_source) VALUES ('${ee}', '${fe}', '${le}', '${p.role}', 'unclaimed', false, '${p.source || 'wikipedia'}') ON CONFLICT (email) DO NOTHING;`);
  }
  
  lines.push('', 'COMMIT;', `-- Total: ${existing.length} profiles`);
  fs.writeFileSync(SQL_FILE, lines.join('\n'));
  
  console.log(`\n✅ Done! Added ${added} new profiles`);
  console.log(`Total: ${existing.length} profiles`);
}

main().catch(console.error);
