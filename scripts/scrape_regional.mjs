#!/usr/bin/env node
/**
 * Regional Nollywood scraper - Yoruba, Igbo, Hausa, Asaba films
 */

import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'nollywood_people_clean.json');
const SQL_FILE = path.join(__dirname, '..', 'supabase', 'seed', 'seed_industry.sql');

const HEADERS = {
  'User-Agent': 'NollyCrewBot/1.0 (research)',
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

// Regional film pages
const REGIONAL_PAGES = [
  // Yoruba films
  'https://en.wikipedia.org/wiki/Yoruba_cinema',
  'https://en.wikipedia.org/wiki/Tunde_Kilani',
  'https://en.wikipedia.org/wiki/Oladipo_Jogunwo',
  'https://en.wikipedia.org/wiki/Hubert_Ogunde',
  'https://en.wikipedia.org/wiki/Duro_Ladipo',
  'https://en.wikipedia.org/wiki/Pa_Akinwunmi_Isola',
  'https://en.wikipedia.org/wiki/Baba_Wande',
  'https://en.wikipedia.org/wiki/Ogunde',
  'https://en.wikipedia.org/wiki/Akinwunmi_Isola',
  'https://en.wikipedia.org/wiki/Lamidi_Fadeyi',
  'https://en.wikipedia.org/wiki/Funke_Akindele',
  'https://en.wikipedia.org/wiki/Jenifa_(film)',
  'https://en.wikipedia.org/wiki/Jenifa%27s_Diary',
  'https://en.wikipedia.org/wiki/Sola_Sobowale',
  'https://en.wikipedia.org/wiki/Fathia_Balogun',
  'https://en.wikipedia.org/wiki/Femi_Adebayo',
  'https://en.wikipedia.org/wiki/Odunlade_Adekola',
  'https://en.wikipedia.org/wiki/Muyiwa_Ademola',
  'https://en.wikipedia.org/wiki/Yinka_Quadri',
  'https://en.wikipedia.org/wiki/Moji_Afolayan',
  'https://en.wikipedia.org/wiki/Kola_Olawale',
  'https://en.wikipedia.org/wiki/Adebayo_Salami',
  'https://en.wikipedia.org/wiki/Dejumo_Lewis',
  'https://en.wikipedia.org/wiki/Jide_Kosoko',
  'https://en.wikipedia.org/wiki/Peter_Fatomisin',
  'https://en.wikipedia.org/wiki/Bukky_Wright',
  'https://en.wikipedia.org/wiki/Toyin_Abamolahun',
  'https://en.wikipedia.org/wiki/Aisha_Olawale',
  'https://en.wikipedia.org/wiki/Mojisola_Oladigbo',
  'https://en.wikipedia.org/wiki/Bolanle_Ninalowo',
  'https://en.wikipedia.org/wiki/Muji_Afolayan',
  'https://en.wikipedia.org/wiki/Tade_Ogidan',
  'https://en.wikipedia.org/wiki/Muritala_Shagaya',
  'https://en.wikipedia.org/wiki/Kunle_Afolayan',
  'https://en.wikipedia.org/wiki/Akin_Omolayo',
  'https://en.wikipedia.org/wiki/Okwy_Chukwudi',
  'https://en.wikipedia.org/wiki/Toyin_Abraham',
  'https://en.wikipedia.org/wiki/Iyabo_Ojo',
  'https://en.wikipedia.org/wiki/Toyin_Kolade',
  
  // Igbo films
  'https://en.wikipedia.org/wiki/Igbo_cinema',
  'https://en.wikipedia.org/wiki/Living_in_Bondage',
  'https://en.wikipedia.org/wiki/Living_in_Bondage:_Breaking_Free',
  'https://en.wikipedia.org/wiki/Kanayo_O._Kanayo',
  'https://en.wikipedia.org/wiki/Patience_Ozokwor',
  'https://en.wikipedia.org/wiki/Pete_Edochie',
  'https://en.wikipedia.org/wiki/Nkem_Owoh',
  'https://en.wikipedia.org/wiki/Chinwetalu_Agu',
  'https://en.wikipedia.org/wiki/Osuofia',
  'https://en.wikipedia.org/wiki/John_Okafor',
  'https://en.wikipedia.org/wiki/Chioma_Chukwuka',
  'https://en.wikipedia.org/wiki/Chioma_Akpotha',
  'https://en.wikipedia.org/wiki/Nonso_Diobi',
  'https://en.wikipedia.org/wiki/Yul_Edochie',
  'https://en.wikipedia.org/wiki/Mike_Ezuruonye',
  'https://en.wikipedia.org/wiki/Uche_Jombo',
  'https://en.wikipedia.org/wiki/Desmond_Elliot',
  'https://en.wikipedia.org/wiki/Jim_Iyke',
  'https://en.wikipedia.org/wiki/Van_Vicker',
  'https://en.wikipedia.org/wiki/John_Dumelo',
  'https://en.wikipedia.org/wiki/Kalu_Ikeagwu',
  'https://en.wikipedia.org/wiki/Frank_Edward_Nwine',
  'https://en.wikipedia.org/wiki/Chidi_Mokeme',
  'https://en.wikipedia.org/wiki/Stella_Damascus',
  'https://en.wikipedia.org/wiki/Ini_Edo',
  'https://en.wikipedia.org/wiki/Regina_Daniels',
  'https://en.wikipedia.org/wiki/Zubby_Michael',
  'https://en.wikipedia.org/wiki/President_Oliseh',
  'https://en.wikipedia.org/wiki/Emma_SDL',
  'https://en.wikipedia.org/wiki/Deva_Capital',
  'https://en.wikipedia.org/wiki/Ego_Nwosu',
  'https://en.wikipedia.org/wiki/Munachi_Abote',
  'https://en.wikipedia.org/wiki/Queen_Nwokoye',
  'https://en.wikipedia.org/wiki/Chizzy_Alichi',
  'https://en.wikipedia.org/wiki/Oluchi_Onweagba',
  
  // Hausa/Kannywood
  'https://en.wikipedia.org/wiki/Kannywood',
  'https://en.wikipedia.org/wiki/Ali_Nuhu',
  'https://en.wikipedia.org/wiki/Sadiya_Harma',
  'https://en.wikipedia.org/wiki/Rahama_Sadau',
  'https://en.wikipedia.org/wiki/Adam_A._Zango',
  'https://en.wikipedia.org/wiki/Sani_Musa',
  'https://en.wikipedia.org/wiki/Abubakar_Bashir_Maishadda',
  'https://en.wikipedia.org/wiki/Umar_M._Shareef',
  'https://en.wikipedia.org/wiki/Fiddians_Womiyama',
  'https://en.wikipedia.org/wiki/Hafiz_Ibrahim',
  'https://en.wikipedia.org/wiki/Fatima_Washi',
  'https://en.wikipedia.org/wiki/Hamisu_Lamido_Iyanaji',
  'https://en.wikipedia.org/wiki/Muhammed_Jammal',
  'https://en.wikipedia.org/wiki/Samaila_Sambu',
  'https://en.wikipedia.org/wiki/Aminu_Saira',
  'https://en.wikipedia.org/wiki/Ishaq_Hilawu',
  'https://en.wikipedia.org/wiki/Abdulrasheed_Bawa',
  'https://en.wikipedia.org/wiki/Sadiya_Umar_Farouq',
  
  // Asaba (lower budget, direct-to-video)
  'https://en.wikipedia.org/wiki/Asaba_film_industry',
  'https://en.wikipedia.org/wiki/Mercy_Johnson',
  'https://en.wikipedia.org/wiki/Ernest_Asubi',
  'https://en.wikipedia.org/wiki/Nonso_Diobi',
  'https://en.wikipedia.org/wiki/Priscilla_Okwu',
  'https://en.wikipedia.org/wiki/Jackie_Appiah',
  'https://en.wikipedia.org/wiki/Yvonne_Nelson',
  'https://en.wikipedia.org/wiki/Majid_Michel',
  'https://en.wikipedia.org/wiki/Bishop_Daniel_Olukoya',
  'https://en.wikipedia.org/wiki/Olisa_Odiboh',
  'https://en.wikipedia.org/wiki/Zack_Orji',
  'https://en.wikipedia.org/wiki/Sam_Dede',
  'https://en.wikipedia.org/wiki/Obi_Nwankwo',
  'https://en.wikipedia.org/wiki/Chika_Ike',
  'https://en.wikipedia.org/wiki/Doris_Simoron',
  'https://en.wikipedia.org/wiki/Uche_Elendu',
  'https://en.wikipedia.org/wiki/Dan_Nwankwo',
  'https://en.wikipedia.org/wiki/Ebele_Okaro',
  'https://en.wikipedia.org/wiki/Sophia_Ighodalo',
  
  // More actors from all regions
  'https://en.wikipedia.org/wiki/Olu_Jacobs',
  'https://en.wikipedia.org/wiki/Joke_Silva',
  'https://en.wikipedia.org/wiki/Rita_Dominic',
  'https://en.wikipedia.org/wiki/Geoffrey_Omega',
  'https://en.wikipedia.org/wiki/O.C._Ukeje',
  'https://en.wikipedia.org/wiki/Genevieve_Nnaji',
  'https://en.wikipedia.org/wiki/Omotola_Jalade-Ekeinde',
  'https://en.wikipedia.org/wiki/Richard_Mofe-Damijo',
  'https://en.wikipedia.org/wiki/Ramsey_Nouah',
  'https://en.wikipedia.org/wiki/Adewale_Akinnuoye-Agbaje',
  'https://en.wikipedia.org/wiki/Hakeem_Kae-Kazim',
  'https://en.wikipedia.org/wiki/Chiwetel_Ejiofor',
  'https://en.wikipedia.org/wiki/David_Oyelowo',
  'https://en.wikipedia.org/wiki/Lupita_Nyong%27o',
  'https://en.wikipedia.org/wiki/Jackie_Appiah',
  'https://en.wikipedia.org/wiki/Ivanka_Obi',
  'https://en.wikipedia.org/wiki/Flora_Ogbuchi',
  'https://en.wikipedia.org/wiki/Monarch_Ogugua',
  'https://en.wikipedia.org/wiki/Theresa_Onuorah',
  'https://en.wikipedia.org/wiki/Ebere_Ohakwe',
  'https://en.wikipedia.org/wiki/Celestine_Okeke',
  'https://en.wikipedia.org/wiki/Chioma_Omeruah',
  'https://en.wikipedia.org/wiki/Omotunde_David',
  'https://en.wikipedia.org/wiki/Adenike_Ogensanwo',
  'https://en.wikipedia.org/wiki/Selassie_Ibrahim',
  'https://en.wikipedia.org/wiki/Kiki_Omeili',
  'https://en.wikipedia.org/wiki/Emma_Okoro',
  'https://en.wikipedia.org/wiki/Keppy_Ekpenyong',
  'https://en.wikipedia.org/wiki/Patrick_Doit',
  'https://en.wikipedia.org/wiki/Bimbo_Oshin',
  'https://en.wikipedia.org/wiki/Sola_Fosudo',
  'https://en.wikipedia.org/wiki/Lere_Paimo',
  'https://en.wikipedia.org/wiki/Kayode_Odumosu',
  'https://en.wikipedia.org/wiki/Yemi_Sodimu',
  'https://en.wikipedia.org/wiki/Segun_Arinze',
  'https://en.wikipedia.org/wiki/Amaka_Igwe',
  'https://en.wikipedia.org/wiki/Chico_Ejiro',
  'https://en.wikipedia.org/wiki/Tade_Ogidan',
  'https://en.wikipedia.org/wiki/Lancelot_Imasuen',
  'https://en.wikipedia.org/wiki/Kunle_Afolayan',
  'https://en.wikipedia.org/wiki/Kemi_Adetiba',
  'https://en.wikipedia.org/wiki/Niyi_Akinmolayan',
  'https://en.wikipedia.org/wiki/Mo_Abudu',
  'https://en.wikipedia.org/wiki/Jade_Osiberu',
  'https://en.wikipedia.org/wiki/Biodun_Stephen',
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
  'template', 'infobox', 'stub', 'navbox', 'citation', 'reflist', 'film',
  'nollywood', 'hausa', 'igbo', 'yoruba', 'bahasa', 'indonesia', 'egyptian',
  'arabic', 'bengali', 'deutsch', 'espanol', 'francais', 'italiano', 'norsk',
  'portugues', 'svenska', 'tieng', 'turkce', 'polski', 'ceska', 'dansk', 'suomi',
  'korean', 'japanese', 'chinese', 'hindi', 'nigerian', 'ghanaian', 'kenyan',
  'south', 'african', 'british', 'american', 'canadian', 'austradian', 'indian',
  'pakistani', 'sport', 'traditional', 'video', 'gaming', 'cuisine', 'afang',
  'abacha', 'amala', 'edikang', 'ikong', 'ukodo', 'egusi', 'puff', 'suya',
  'jollof', 'fufu', 'garr', 'new', 'yam', 'festivals', 'outline',
  'olokun', 'omabe', 'sango', 'umatu', 'oronna', 'actor', 'actress', 'director',
  'producer', 'series', 'season', 'episode', 'part', 'volume', 'chapter',
  'section', 'box', 'office', 'critics', 'reception', 'plot', 'cast', 'crew',
  'soundtrack', 'production', 'release', 'distribution', 'awards', 'nominations',
  'budget', 'runtime', 'language', 'country', 'gross', 'opening', 'weekend',
  'domestic', 'international', 'worldwide', 'rating', 'reviews',
  'yoruba cinema', 'igbo cinema', 'kannywood', 'asaba', 'direct-to-video',
]);

function parseName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

async function main() {
  console.log('🇳🇬 Regional Nollywood Scraper\n');
  
  let existing = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    console.log(`Loaded ${existing.length} existing profiles\n`);
  }
  
  const seenNames = new Set(existing.map(p => p.name.toLowerCase()));
  let added = 0;
  
  for (let i = 0; i < REGIONAL_PAGES.length; i++) {
    const url = REGIONAL_PAGES[i];
    const pageName = url.split('/').pop().replace(/_/g, ' ');
    process.stdout.write(`  [${i+1}/${REGIONAL_PAGES.length}] ${pageName.substring(0, 45).padEnd(45)} `);
    
    const html = await fetchPage(url);
    if (!html) { console.log('SKIP'); continue; }
    
    const $ = cheerio.load(html);
    const people = [];
    
    // Extract people from content links
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
      
      // Determine region from page context
      let region = 'nollywood';
      const pageLower = pageName.toLowerCase();
      if (pageLower.includes('yoruba') || pageLower.includes('jogunwo') || pageLower.includes('ogunde')) region = 'yoruba';
      if (pageLower.includes('igbo') || pageLower.includes('living in bondage') || pageLower.includes('kanayo')) region = 'igbo';
      if (pageLower.includes('kannywood') || pageLower.includes('hau') || pageLower.includes('nuhu') || pageLower.includes('sadau') || pageLower.includes('zango')) region = 'hausa';
      if (pageLower.includes('asaba') || pageLower.includes('mercy johnson') || pageLower.includes('direct-to-video')) region = 'asaba';
      
      seenNames.add(nameLower);
      existing.push({
        name: p.name,
        first,
        last,
        role: 'actor',
        source: 'wikipedia_regional',
        region,
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
    '-- Yoruba, Igbo, Hausa/Kannywood, Asaba + Nollywood', '-- Run in Supabase SQL Editor after 001_initial_schema.sql', '', 'BEGIN;', ''];
  
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
  
  // Stats by source
  const bySource = {};
  for (const p of existing) {
    const s = p.region || p.source || 'unknown';
    bySource[s] = (bySource[s] || 0) + 1;
  }
  console.log('\nBy region:');
  for (const [k, v] of Object.entries(bySource).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }
}

main().catch(console.error);
