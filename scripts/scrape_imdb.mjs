#!/usr/bin/env node
/**
 * NollyCrew IMDb Scraper
 * Scrapes Nollywood actors, directors, crew from IMDb
 * 
 * Usage:
 *   cd scripts && npm install && node scrape_imdb.mjs
 * 
 * Output: ../data/nollywood_people.json
 */

import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'nollywood_people.json');

// IMDb search URLs for Nigerian film industry
const SEARCH_URLS = [
  // Nigerian films and TV
  'https://www.imdb.com/search/title/?country_of_origin=NG&title_type=feature,tv_movie,short,video&sort=num_votes,desc&count=250',
  'https://www.imdb.com/search/title/?country_of_origin=NG&title_type=feature,tv_movie,short,video&sort=num_votes,desc&count=250&start=251',
  'https://www.imdb.com/search/title/?country_of_origin=NG&title_type=feature,tv_movie,short,video&sort=num_votes,desc&count=250&start=501',
  'https://www.imdb.com/search/title/?country_of_origin=NG&title_type=feature,tv_movie,short,video&sort=num_votes,desc&count=250&start=751',
  'https://www.imdb.com/search/title/?country_of_origin=NG&title_type=feature,tv_movie,short,video&sort=num_votes,desc&count=250&start=1001',
  'https://www.imdb.com/search/title/?country_of_origin=NG&title_type=feature,tv_movie,short,video&sort=num_votes,desc&count=250&start=1251',
  'https://www.imdb.com/search/title/?country_of_origin=NG&title_type=feature,tv_movie,short,video&sort=num_votes,desc&count=250&start=1501',
  'https://www.imdb.com/search/title/?country_of_origin=NG&title_type=feature,tv_movie,short,video&sort=num_votes,desc&count=250&start=1751',
];

// IMDb person search for Nigerian actors
const PERSON_SEARCH_URLS = [
  'https://www.imdb.com/search/name/?nationality=NG&sort=starmeter,asc&count=100',
  'https://www.imdb.com/search/name/?nationality=NG&sort=starmeter,asc&count=100&start=101',
  'https://www.imdb.com/search/name/?nationality=NG&sort=starmeter,asc&count=100&start=201',
  'https://www.imdb.com/search/name/?nationality=NG&sort=starmeter,asc&count=100&start=301',
  'https://www.imdb.com/search/name/?nationality=NG&sort=starmeter,asc&count=100&start=401',
  'https://www.imdb.com/search/name/?nationality=NG&sort=starmeter,asc&count=100&start=501',
  'https://www.imdb.com/search/name/?nationality=NG&sort=starmeter,asc&count=100&start=601',
  'https://www.imdb.com/search/name/?nationality=NG&sort=starmeter,asc&count=100&start=701',
  'https://www.imdb.com/search/name/?nationality=NG&sort=starmeter,asc&count=100&start=801',
  'https://www.imdb.com/search/name/?nationality=NG&sort=starmeter,asc&count=100&start=901',
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchPage(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { headers: HEADERS });
      if (response.status === 429) {
        console.log(`  Rate limited, waiting 30s...`);
        await sleep(30000);
        continue;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (e) {
      console.log(`  Retry ${i + 1}/${retries}: ${e.message}`);
      await sleep(5000);
    }
  }
  return null;
}

async function scrapePersonListPage(url) {
  const html = await fetchPage(url);
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const people = [];
  
  // IMDb name list format
  $('.lister-item.mode-detail').each((_, el) => {
    const $el = $(el);
    const nameTag = $el.find('.lister-item-header a');
    const name = nameTag.text().trim();
    const profileUrl = nameTag.attr('href');
    const imdbId = profileUrl?.match(/\/nm(\d+)\//)?.[1];
    
    const meta = $el.find('.text-muted').text();
    const description = $el.find('.lister-item-content p').text().trim();
    
    // Extract known-for from the description
    const knownFor = [];
    $el.find('.lister-item-content a').each((_, a) => {
      const title = $(a).text().trim();
      if (title && !title.includes('See full bio')) {
        knownFor.push(title);
      }
    });
    
    if (name && imdbId) {
      people.push({
        name,
        imdb_id: `nm${imdbId}`,
        imdb_url: `https://www.imdb.com${profileUrl}`,
        known_for: knownFor.slice(0, 5),
        raw_description: description,
      });
    }
  });
  
  return people;
}

async function scrapePersonPage(imdbId) {
  const url = `https://www.imdb.com/name/${imdbId}/`;
  const html = await fetchPage(url);
  if (!html) return null;
  
  const $ = cheerio.load(html);
  
  const name = $('h1').text().trim();
  
  // Bio section
  const bio = $('[data-testid="hero-qn-header"] span').text().trim() || 
               $('.ipc-html-content-inner-div').first().text().trim();
  
  // Birth info
  const bornText = $('[data-testid="nm-born-info"]').text().trim();
  let dateOfBirth = null;
  let placeOfBirth = null;
  const dateMatch = bornText.match(/(\w+ \d{1,2}, \d{4})/);
  if (dateMatch) dateOfBirth = dateMatch[1];
  const placeMatch = bornText.match(/in (.+)/);
  if (placeMatch) placeOfBirth = placeMatch[1];
  
  // Known for section
  const knownFor = [];
  $('[data-testid="nm-known-for-title"] a').each((_, a) => {
    const title = $(a).text().trim();
    if (title) knownFor.push(title);
  });
  
  // Filmography (top 10)
  const filmography = [];
  $('[data-testid="head-of-content"] a, .ipc-metadata-list-item a').each((_, a) => {
    const title = $(a).text().trim();
    if (title && !title.includes('See full') && !title.includes('Show all')) {
      filmography.push(title);
    }
  });
  
  // Nickname / birth name from bio
  let nickname = null;
  const nicknameMatch = bio?.match(/(?:also known as|born|nickname|aka)\s+([A-Z][a-z]+ [A-Z][a-z]+)/i);
  if (nicknameMatch) nickname = nicknameMatch[1];
  
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

async function scrapeFilmCast(filmUrl) {
  const html = await fetchPage(filmUrl);
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const cast = [];
  
  // Full cast & crew page
  $('.cast_list tr').each((_, row) => {
    const $row = $(row);
    const nameTag = $row.find('td a[href*="/name/"]');
    const name = nameTag.text().trim();
    const href = nameTag.attr('href');
    const imdbId = href?.match(/\/nm(\d+)\//)?.[1];
    const role = $row.find('.character').text().trim();
    
    if (name && imdbId) {
      cast.push({
        name,
        imdb_id: `nm${imdbId}`,
        role: role || 'actor',
      });
    }
  });
  
  return cast;
}

async function main() {
  console.log('🎬 NollyCrew IMDb Scraper\n');
  
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  // Load existing data if any
  let allPeople = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    allPeople = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    console.log(`Loaded ${allPeople.length} existing profiles\n`);
  }
  
  const seenIds = new Set(allPeople.map(p => p.imdb_id));
  
  // Phase 1: Scrape person list pages (Nigerian nationals)
  console.log('Phase 1: Scraping IMDb person list (Nigerian nationals)...');
  for (const url of PERSON_SEARCH_URLS) {
    console.log(`  Fetching: ${url.substring(0, 60)}...`);
    const people = await scrapePersonListPage(url);
    for (const person of people) {
      if (!seenIds.has(person.imdb_id)) {
        seenIds.add(person.imdb_id);
        allPeople.push({
          ...person,
          source: 'imdb_list',
          scraped_at: new Date().toISOString(),
        });
      }
    }
    console.log(`  Found ${people.length} people (total unique: ${seenIds.size})`);
    await sleep(3000); // Rate limit
  }
  
  console.log(`\nPhase 1 complete: ${allPeople.length} people\n`);
  
  // Phase 2: Scrape individual person pages for top 200 (most popular)
  console.log('Phase 2: Scraping individual profiles (top 200)...');
  const toEnrich = allPeople
    .filter(p => !p.enriched)
    .slice(0, 200);
  
  for (let i = 0; i < toEnrich.length; i++) {
    const person = toEnrich[i];
    console.log(`  [${i + 1}/${toEnrich.length}] ${person.name} (${person.imdb_id})`);
    
    const details = await scrapePersonPage(person.imdb_id);
    if (details) {
      Object.assign(person, details, { enriched: true });
    }
    
    await sleep(2000); // Rate limit
    
    // Save progress every 50 people
    if ((i + 1) % 50 === 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allPeople, null, 2));
      console.log(`  💾 Saved progress (${allPeople.length} people)`);
    }
  }
  
  // Phase 3: Scrape Nigerian film pages for additional cast
  console.log('\nPhase 3: Scraping Nigerian film casts...');
  for (const url of SEARCH_URLS.slice(0, 4)) {
    console.log(`  Fetching films: ${url.substring(0, 60)}...`);
    const html = await fetchPage(url);
    if (!html) continue;
    
    const $ = cheerio.load(html);
    const filmLinks = [];
    $('h3 a').each((_, a) => {
      const href = $(a).attr('href');
      if (href?.includes('/title/')) {
        filmLinks.push(`https://www.imdb.com${href}`);
      }
    });
    
    // Scrape cast from top 20 films
    for (const filmUrl of filmLinks.slice(0, 20)) {
      const cast = await scrapeFilmCast(filmUrl);
      for (const member of cast) {
        if (!seenIds.has(member.imdb_id)) {
          seenIds.add(member.imdb_id);
          allPeople.push({
            ...member,
            source: 'film_cast',
            scraped_at: new Date().toISOString(),
          });
        }
      }
      await sleep(2000);
    }
    
    await sleep(5000);
  }
  
  // Save final data
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allPeople, null, 2));
  
  console.log(`\n✅ Done! Total unique people: ${allPeople.length}`);
  console.log(`📁 Saved to: ${OUTPUT_FILE}`);
  
  // Stats
  const withBio = allPeople.filter(p => p.bio).length;
  const withKnownFor = allPeople.filter(p => p.known_for?.length > 0).length;
  const withFilmography = allPeople.filter(p => p.filmography?.length > 0).length;
  console.log(`\nStats:`);
  console.log(`  With bio: ${withBio}`);
  console.log(`  With known works: ${withKnownFor}`);
  console.log(`  With filmography: ${withFilmography}`);
}

main().catch(console.error);
