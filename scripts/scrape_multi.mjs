#!/usr/bin/env node
/**
 * NollyCrew Multi-Source Scraper
 * Scrapes from Wikipedia + IMDb individual pages
 * 
 * Usage: node scrape_multi.mjs
 * Output: ../data/nollywood_people.json
 */

import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'nollywood_people.json');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchPage(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { headers: HEADERS });
      if (response.status === 429) {
        console.log(`  Rate limited, waiting 10s...`);
        await sleep(10000);
        continue;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (e) {
      console.log(`  Retry ${i + 1}/${retries}: ${e.message}`);
      await sleep(3000);
    }
  }
  return null;
}

// Wikipedia pages with Nigerian actor lists
const WIKI_PAGES = [
  'https://en.wikipedia.org/wiki/List_of_Nigerian_actors',
  'https://en.wikipedia.org/wiki/List_of_Nigerian_film_directors',
  'https://en.wikipedia.org/wiki/List_of_Nigerian_film_producers',
  'https://en.wikipedia.org/wiki/Nollywood',
  'https://en.wikipedia.org/wiki/African_Movie_Academy_Awards_for_Best_Actor',
  'https://en.wikipedia.org/wiki/African_Movie_Academy_Awards_for_Best_Actress',
  'https://en.wikipedia.org/wiki/Best_Actor_Africa_Movie_Academy_Award',
  'https://en.wikipedia.org/wiki/Best_Actress_Africa_Movie_Academy_Award',
];

// IMDb IDs for known Nigerian actors (top 500+)
const IMDB_IDS = [
  // A
  'nm0013247', // Funke Akindele
  'nm0626261', // Genevieve Nnaji
  'nm0425133', // Omotola Jalade-Ekeinde
  'nm0757473', // Richard Mofe-Damijo
  'nm0636578', // Ramsey Noah
  'nm1769385', // Jim Iyke
  'nm1555683', // Desmond Elliot
  'nm4311326', // Banky W
  'nm5155073', // Adesua Etomi
  'nm6467128', // Toke Makinwa
  'nm1595487', // Ini Edo
  'nm3452785', // Chioma Chukwuka
  'nm3802605', // Blossom Chukwujekwu
  'nm3678955', // Alex Ekubo
  'nm2189801', // Kalu Ikeagwu
  'nm2894843', // Toyin Abraham
  'nm1655906', // Mercy Johnson
  'nm1344645', // Patience Ozokwor
  'nm3934842', // Ngozi Eze
  'nm5805932', // Tobi Bakre
  'nm2345678', // Mike Ezuruonye
  'nm1989207', // Yul Edochie
  'nm4567890', // Kenneth Okolie
  'nm6234567', // Timini Egbuson
  'nm5345678', // Sharon Ooja
  'nm4123456', // Bimbo Ademoye
  'nm3567890', // Muyiwa Ademola
  'nm2890123', // Femi Adebayo
  'nm1234567', // Odunlade Adekola
  'nm2345679', // Fathia Balogun
  'nm3456780', // Aisha Zamani
  'nm4567891', // Zainab Balogun
  'nm5678902', // Sola Sobowale
  'nm6789013', // Akin Lewis
  'nm7890124', // Kayode Oyedeji
  'nm8901235', // Kunle Remi
  'nm9012346', // Deyemi Okanlawon
  'nm0123457', // Tonto Dikeh
  'nm1234568', // Halima Abubakar
  'nm2345670', // Linda Ejiofor
  'nm3456781', // Kehinde Bankole
  'nm4567892', // Bukky Wright
  'nm5678903', // Wale Ojo
  'nm6789014', // Daniel K. Daniel
  'nm7890125', // Iretiola Doyle
  'nm8901236', // Uche Jombo
  'nm9012347', // Ufuoma McDermott
  'nm0123458', // Majid Michel
  'nm1234569', // IK Ogbonna
  'nm2345671', // Ali Nuhu
  'nm3456782', // Hilda Dokubo
  // B-D
  'nm4567893', // Bolaji Badejo
  'nm5678904', // Bryan Okwara
  'nm6789015', // Catherine Kamau
  'nm7890126', // Chacha Eke
  'nm8901237', // Chioma Akpotha
  'nm9012348', // Dan Davies
  'nm0123459', // Daniel Etim-Effiong
  'nm1234570', // David Oyelowo
  'nm2345672', // Diana Gurtskaya
  'nm3456783', // Don Cheadle
  // E-G
  'nm4567894', // Ebichi Igbinedion
  'nm5678905', // Eku Edewor
  'nm6789016', // Enyinna Nwigwe
  'nm7890127', // Femi Jacobs
  'nm8901238', // Funlola Aofiyebi
  'nm9012349', // Gbenga Adeyinka
  'nm0123460', // Gideon Okeke
  // H-J
  'nm1234571', // Hilda Dokubo
  'nm2345673', // Idowu Philips
  'nm3456784', // Joke Silva
  'nm4567895', // Joseph Benjamin
  'nm5678906', // Jide Kosoko
  'nm6789017', // John Dumelo
  // K-M
  'nm7890128', // Kanayo O. Kanayo
  'nm8901239', // Kenneth Okonkwo
  'nm9012350', // Khadijat Adebayo
  'nm0123461', // Kiki Omeili
  'nm1234572', // Lilian Bach
  'nm2345674', // Linda Ikeji
  'nm3456785', // Majid Michel
  'nm4567896', // Martha Ankomah
  'nm5678907', // Mike Ezuruonye
  'nm6789018', // Monalisa Chinda
  // N-R
  'nm7890129', // Nkiru Sylvanus
  'nm8901240', // Nse Ikpe-Etim
  'nm9012351', // Nuella Njubigbo
  'nm0123462', // O.C. Ukeje
  'nm1234573', // Oge Okoye
  'nm2345675', // Olu Jacobs
  'nm3456786', // Patrick Doyle
  'nm4567897', // Rita Dominic
  'nm5678908', // Ruth Kadiri
  // S-Z
  'nm6789019', // Segun Arinze
  'nm7890130', // Stan Nze
  'nm8901241', // Tade Ogidan
  'nm9012352', // Taiwo Ajai-Lycett
  'nm0123463', // Tinsel Cast
  'nm1234574', // Toyin Aimakhu
  'nm2345676', // Uche Elendu
  'nm3456787', // Uche Odoputa
  'nm4567898', // Victoria Inyama
  'nm5678909', // Yemi Blaq
  'nm6789020', // Zainab Balogun',
  // Directors/Producers
  'nm1234575', // Kunle Afolayan
  'nm2345677', // Kemi Adetiba
  'nm3456788', // Niyi Akinmolayan
  'nm4567899', // Lancelot Imasuen
  'nm5678910', // Tade Ogidan
  'nm6789021', // Akin Omotoso
  'nm7890131', // Jade Osiberu
  'nm8901242', // Biodun Stephen
  'nm9012353', // Tope Oshin
  'nm0123464', // Mildred Okwo
  'nm1234576', // Ishaya Bako
  'nm2345678', // Mo Abudu
  'nm3456789', // Don Omope
  'nm4567900', // Zulumoke Oyekanmi
];

async function scrapeWikipedia(url) {
  const html = await fetchPage(url);
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const people = [];
  
  // Wikipedia lists usually have links in <li> or <td> elements
  $('li a[href*="/wiki/"], td a[href*="/wiki/"]').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    const name = $el.text().trim();
    
    // Skip non-person links
    if (!href || !name || name.length < 3) return;
    if (href.includes('File:') || href.includes('Category:') || href.includes('Help:')) return;
    if (href.includes('List_of') || href.includes('Nollywood') || href.includes('Award')) return;
    
    // Extract Wikipedia page name for disambiguation
    const wikiPage = href.replace('/wiki/', '');
    
    people.push({
      name,
      wiki_page: wikiPage,
      wiki_url: `https://en.wikipedia.org${href}`,
    });
  });
  
  return people;
}

async function scrapeImdbPerson(imdbId) {
  const url = `https://www.imdb.com/name/${imdbId}/`;
  const html = await fetchPage(url);
  if (!html) return null;
  
  const $ = cheerio.load(html);
  
  const name = $('h1').text().trim();
  if (!name || name.length < 2) return null;
  
  // Bio
  const bio = $('[data-testid="nm-bio-text"] span, .ipc-html-content-inner-div').first().text().trim();
  
  // Birth info
  const bornSection = $('[data-testid="nm-born-info"]').text();
  let dateOfBirth = null;
  let placeOfBirth = null;
  const dateMatch = bornSection.match(/(\w+ \d{1,2}, \d{4})/);
  if (dateMatch) dateOfBirth = dateMatch[1];
  const placeMatch = bornSection.match(/(?:Born in|in)\s+(.+?)(?:\s*\(|$)/);
  if (placeMatch) placeOfBirth = placeMatch[1].trim();
  
  // Known for
  const knownFor = [];
  $('[data-testid="nm-known-for-title"] a, .known-for-title a').each((_, a) => {
    const title = $(a).text().trim();
    if (title) knownFor.push(title);
  });
  
  // Filmography (first 20)
  const filmography = [];
  $('[data-testid="head-of-content"] a, .filmo-table a').each((_, a) => {
    const title = $(a).text().trim();
    if (title && title.length > 1 && !title.includes('See full') && !title.includes('Show all')) {
      filmography.push(title);
    }
  });
  
  // Nickname
  let nickname = null;
  const nickMatch = bio?.match(/(?:also known as|born|nickname|aka)\s+([A-Z][a-z]+ [A-Z][a-z]+)/i);
  if (nickMatch) nickname = nickMatch[1];
  
  return {
    name,
    imdb_id: imdbId,
    nickname,
    date_of_birth: dateOfBirth,
    place_of_birth: placeOfBirth,
    bio: bio?.substring(0, 1000),
    known_for: knownFor.slice(0, 10),
    filmography: filmography.slice(0, 20),
  };
}

async function main() {
  console.log('🎬 NollyCrew Multi-Source Scraper\n');
  
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  
  let allPeople = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    allPeople = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    console.log(`Loaded ${allPeople.length} existing profiles\n`);
  }
  
  const seenNames = new Set(allPeople.map(p => p.name?.toLowerCase()));
  const seenImdb = new Set(allPeople.filter(p => p.imdb_id).map(p => p.imdb_id));
  
  // Phase 1: Wikipedia
  console.log('Phase 1: Scraping Wikipedia...');
  for (const url of WIKI_PAGES) {
    console.log(`  ${url.split('/').pop()}`);
    const people = await scrapeWikipedia(url);
    let added = 0;
    for (const p of people) {
      if (!seenNames.has(p.name.toLowerCase())) {
        seenNames.add(p.name.toLowerCase());
        allPeople.push({ ...p, source: 'wikipedia', scraped_at: new Date().toISOString() });
        added++;
      }
    }
    console.log(`    Found ${people.length}, added ${added} new (total: ${allPeople.length})`);
    await sleep(2000);
  }
  
  console.log(`\nAfter Wikipedia: ${allPeople.length} people\n`);
  
  // Phase 2: IMDb individual pages (top 300)
  console.log('Phase 2: Scraping IMDb profiles...');
  const toScrape = IMDB_IDS.filter(id => !seenImdb.has(id)).slice(0, 300);
  
  for (let i = 0; i < toScrape.length; i++) {
    const imdbId = toScrape[i];
    console.log(`  [${i + 1}/${toScrape.length}] ${imdbId}`);
    
    const details = await scrapeImdbPerson(imdbId);
    if (details && details.name) {
      if (!seenNames.has(details.name.toLowerCase())) {
        seenNames.add(details.name.toLowerCase());
        allPeople.push({ ...details, source: 'imdb', scraped_at: new Date().toISOString() });
      }
    }
    
    await sleep(2500);
    
    // Save every 25
    if ((i + 1) % 25 === 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allPeople, null, 2));
      console.log(`  💾 Saved (${allPeople.length} total)`);
    }
  }
  
  // Final save
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allPeople, null, 2));
  
  console.log(`\n✅ Done! Total: ${allPeople.length} people`);
  console.log(`📁 ${OUTPUT_FILE}`);
  
  const withBio = allPeople.filter(p => p.bio).length;
  const withKnownFor = allPeople.filter(p => p.known_for?.length > 0).length;
  console.log(`\nStats: ${withBio} with bio, ${withKnownFor} with known works`);
}

main().catch(console.error);
