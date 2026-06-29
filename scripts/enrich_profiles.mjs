#!/usr/bin/env node
/**
 * Enrich profiles with social media, contact info from Wikipedia/IMDb
 */

import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'nollywood_people_clean.json');
const SQL_FILE = path.join(__dirname, '..', 'supabase', 'seed', 'seed_industry_enriched.sql');

const HEADERS = { 'User-Agent': 'NollyCrewBot/1.0 (research)', 'Accept': 'text/html' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchPage(url) {
  try {
    const r = await fetch(url, { headers: HEADERS });
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; }
}

function extractSocialLinks(html) {
  const $ = cheerio.load(html);
  const links = { instagram: null, twitter: null, facebook: null, youtube: null, imdb: null, website: null };
  
  // Look for social media links in the page
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const lower = href.toLowerCase();
    
    if (lower.includes('instagram.com/') && !links.instagram) {
      const match = href.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
      if (match) links.instagram = match[1];
    }
    if (lower.includes('twitter.com/') || lower.includes('x.com/')) {
      if (!links.twitter) {
        const match = href.match(/(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/);
        if (match && !match[1].includes('intent')) links.twitter = match[1];
      }
    }
    if (lower.includes('facebook.com/') && !links.facebook) {
      const match = href.match(/facebook\.com\/([a-zA-Z0-9.]+)/);
      if (match) links.facebook = match[1];
    }
    if (lower.includes('youtube.com/') && !links.youtube) {
      const match = href.match(/youtube\.com\/(channel|user|c)\/([a-zA-Z0-9_-]+)/);
      if (match) links.youtube = match[2];
    }
    if (lower.includes('imdb.com/name/') && !links.imdb) {
      const match = href.match(/imdb\.com\/name\/(nm\d+)/);
      if (match) links.imdb = match[1];
    }
    if (lower.startsWith('http') && !lower.includes('wikipedia') && !lower.includes('imdb') && 
        !lower.includes('instagram') && !lower.includes('twitter') && !lower.includes('facebook') &&
        !lower.includes('youtube') && !links.website) {
      if (!lower.includes('wikidata') && !lower.includes('commons')) {
        links.website = href;
      }
    }
  });
  
  // Also check infobox for social links
  $('.infobox a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const lower = href.toLowerCase();
    if (lower.includes('instagram.com/') && !links.instagram) {
      const match = href.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
      if (match) links.instagram = match[1];
    }
    if ((lower.includes('twitter.com/') || lower.includes('x.com/')) && !links.twitter) {
      const match = href.match(/(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/);
      if (match && !match[1].includes('intent')) links.twitter = match[1];
    }
  });
  
  // Extract bio snippet
  let bio = null;
  const bioEl = $('[data-testid="nm-bio-text"] span, .ipc-html-content-inner-div, .biography p').first();
  if (bioEl.length) {
    bio = bioEl.text().trim().substring(0, 500);
  }
  
  // Extract birth info
  let born = null;
  const bornEl = $('[data-testid="nm-born-info"], .infobox-data').first();
  if (bornEl.length) {
    born = bornEl.text().trim();
  }
  
  return { ...links, bio, born };
}

async function main() {
  console.log('🔍 Enriching profiles with social media & contact info\n');
  
  let existing = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    console.log(`Loaded ${existing.length} profiles\n`);
  }
  
  // Get profiles that need enrichment (have wiki_url but no social data)
  const toEnrich = existing.filter(p => p.wiki_url && !p.enriched).slice(0, 500);
  console.log(`Enriching ${toEnrich.length} profiles...\n`);
  
  let enriched = 0;
  for (let i = 0; i < toEnrich.length; i++) {
    const profile = toEnrich[i];
    process.stdout.write(`  [${i+1}/${toEnrich.length}] ${profile.name.substring(0, 35).padEnd(35)} `);
    
    const html = await fetchPage(profile.wiki_url);
    if (!html) { console.log('SKIP'); continue; }
    
    const data = extractSocialLinks(html);
    
    // Update profile
    const idx = existing.findIndex(p => p.name === profile.name);
    if (idx !== -1) {
      if (data.instagram) existing[idx].instagram = data.instagram;
      if (data.twitter) existing[idx].twitter = data.twitter;
      if (data.facebook) existing[idx].facebook = data.facebook;
      if (data.youtube) existing[idx].youtube = data.youtube;
      if (data.imdb) existing[idx].imdb_id = data.imdb;
      if (data.website) existing[idx].website = data.website;
      if (data.bio && !existing[idx].bio) existing[idx].bio = data.bio;
      if (data.born) existing[idx].born_info = data.born;
      existing[idx].enriched = true;
      enriched++;
    }
    
    const socials = [data.instagram ? 'IG' : '', data.twitter ? 'TW' : '', data.imdb ? 'IMDb' : ''].filter(Boolean).join('+');
    console.log(socials || 'no socials');
    
    await sleep(2000);
    
    // Save every 50
    if ((i + 1) % 50 === 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existing, null, 2));
      console.log(`  💾 Saved (${enriched} enriched)`);
    }
  }
  
  // Final save
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existing, null, 2));
  
  // Generate enriched SQL
  const lines = ['-- NollyCrew Enriched Industry Data', `-- ${existing.length} profiles with social media`,
    '-- Run after seed_industry.sql', '', 'BEGIN;', ''];
  
  for (const p of existing) {
    const updates = [];
    if (p.instagram) updates.push(`instagram = '${p.instagram.replace(/'/g, "''")}'`);
    if (p.twitter) updates.push(`twitter = '${p.twitter.replace(/'/g, "''")}'`);
    if (p.facebook) updates.push(`facebook = '${p.facebook.replace(/'/g, "''")}'`);
    if (p.youtube) updates.push(`youtube = '${p.youtube.replace(/'/g, "''")}'`);
    if (p.imdb_id) updates.push(`imdb_id = '${p.imdb_id}'`);
    if (p.website) updates.push(`website = '${p.website.replace(/'/g, "''")}'`);
    if (p.bio) updates.push(`bio = '${p.bio.replace(/'/g, "''").substring(0, 500)}'`);
    
    if (updates.length > 0) {
      const fe = p.first.replace(/'/g, "''");
      const le = p.last.replace(/'/g, "''");
      lines.push(`UPDATE profiles SET ${updates.join(', ')} WHERE first_name = '${fe}' AND last_name = '${le}';`);
    }
  }
  
  lines.push('', 'COMMIT;', `-- Updated: ${enriched} profiles`);
  fs.writeFileSync(SQL_FILE, lines.join('\n'));
  
  // Stats
  const withIG = existing.filter(p => p.instagram).length;
  const withTW = existing.filter(p => p.twitter).length;
  const withIMDb = existing.filter(p => p.imdb_id).length;
  const withWeb = existing.filter(p => p.website).length;
  const withBio = existing.filter(p => p.bio).length;
  
  console.log(`\n✅ Done! Enriched ${enriched} profiles`);
  console.log(`\nStats:`);
  console.log(`  Instagram: ${withIG}`);
  console.log(`  Twitter: ${withTW}`);
  console.log(`  IMDb: ${withIMDb}`);
  console.log(`  Website: ${withWeb}`);
  console.log(`  Bio: ${withBio}`);
}

main().catch(console.error);
