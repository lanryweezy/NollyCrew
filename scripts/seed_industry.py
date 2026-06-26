#!/usr/bin/env python3
"""
NollyCrew Industry Seed Data
Seeds the Supabase database with real Nollywood industry profiles.
Run: python3 scripts/seed_industry.py

Requires: pip install supabase
Set env: SUPABASE_URL, SUPABASE_KEY (service role key for admin inserts)
"""

import os
import json
from datetime import datetime

try:
    from supabase import create_client
except ImportError:
    print("Install supabase: pip install supabase")
    exit(1)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")  # Service role key

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Set SUPABASE_URL and SUPABASE_KEY environment variables")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================================
# REAL NOLLYWOOD INDUSTRY PROFILES
# ============================================

ACTORS = [
    # A-L: Major names
    {"first_name": "Funke", "last_name": "Akindele", "known_works": ["Jenifa", "Omo Ghetto: The Saga", "Battle on Buka Street"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Genevieve", "last_name": "Nnaji", "known_works": ["Lionheart", "Ije", "The Meeting"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Omotola", "last_name": "Jalade-Ekeinde", "known_works": ["Reloaded", "The Wedding Party", "Omo Sesan"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "RMD", "last_name": "Richard Mofe-Damijo", "known_works": ["The Wedding Party", "Lunch Hour", "Out of Bounds"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Ramsey", "last_name": "Noah", "known_works": ["30 Days in Atlanta", "The Wedding Party", "Living in Bondage"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Jim", "last_name": "Iyke", "known_works": ["And Then There Was You", "Double", "Lagos Cougars"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Desmond", "last_name": "Elliot", "known_works": ["Dry", "Lekki Wives", "The Wedding Party"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Banky", "last_name": "W", "known_works": ["The Wedding Party", "Up North", "Lagos to Jozi"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Adesua", "last_name": "Etomi-Wellington", "known_works": ["The Wedding Party", "Up North", "Banana Island Ghost"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Toke", "last_name": "Makinwa", "known_works": ["O-Tokunbo", "Circle", "One Room"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Ini", "last_name": "Edo", "known_works": ["Madam CEO", "The Mistress", "Desperate Housewives Africa"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Chioma", "last_name": "Chukwuka", "known_works": ["Lionheart", "The Wedding Party", "Road to Yesterday"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Blossom", "last_name": "Chukwujekwu", "known_works": ["The Wedding Party", "A Few Good Men", "Lust"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Alex", "last_name": "Ekubo", "known_works": ["The Wedding Party", "The Island", "Fifty"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Kalu", "last_name": "Ikeagwu", "known_works": ["Living in Bondage", "The Other Side", "October 1"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Toyin", "last_name": "Abraham", "known_works": ["Tattelot", "Esohe", "Gold Statue"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Mercy", "last_name": "Johnson", "known_works": ["Dumebi the Dirty Girl", "Heart of a Fighter", "The Machine Girl"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Patience", "last_name": "Ozokwor", "known_works": ["Thy Will Be Done", "Thunder Fire You", "Two Beggars"], "industry_role": "actor", "location": "Enugu, Nigeria"},
    {"first_name": "Chinwe", "last_name": "Olatunde", "known_works": ["Secret Shadows", "Twin Brothers", "Married but Living Single"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Ngozi", "last_name": "Eze", "known_works": ["Gidi Up", "The Date", "Love and Lies"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Tobi", "last_name": "Bakre", "known_works": ["The Wedding Party 2", "Up North", "Sugar Rush"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Mike", "last_name": "Ezuruonye", "known_works": ["Pretty Liars 1", "Unwanted", "Nnunu"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Yul", "last_name": "Edochie", "known_works": ["Excess Luggage", "Royal Soap Opera", "Wide Angle"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Kenneth", "last_name": "Okolie", "known_works": ["The Wedding Party", "One Lagos Night", "Ordinary Fellows"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Timini", "last_name": "Egbuson", "known_works": ["Ego", "Big Brother Naija", "The Royal Hibiscus Hotel"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Sharon", "last_name": "Ooja", "known_works": ["The Royal Hibiscus Hotel", "Your Excellency", "Living in Bondage"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Bimbo", "last_name": "Ademoye", "known_works": ["The Wedding Party", "King of Boys", "Your Excellency"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Muyiwa", "last_name": "Ademola", "known_works": ["Ise Oluwa", "Alase Akeem", "Ayanmo"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Femi", "last_name": "Adebayo", "known_works": ["Sola Arik", "Ijakumo", "A Thousand Colors"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Odunlade", "last_name": "Adekola", "known_works": ["Adura", "Esin", "Oyenusi"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Fathia", "last_name": "Balogun", "known_works": ["Ase", "Omo Elemosho", "Omo Ibadan"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Aisha", "last_name": "Zamani", "known_works": ["The Bridge", "Beneath the Surface", "Muna"], "industry_role": "actor", "location": "Abuja, Nigeria"},
    {"first_name": "Zainab", "last_name": "Balogun", "known_works": ["The King of Boys", "The Royal Hibiscus Hotel", "Lagos Real Fake Life"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Sola", "last_name": "Sobowale", "known_works": ["The Wedding Party", "King of Boys", "Your Excellency"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Akin", "last_name": "Lewis", "known_works": ["October 1", "The Tribunal", "Lagos Cougars"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Kayode", "last_name": "Oyedeji", "known_works": ["The Covenant", "Indecent Proposal", "Ojukokoro"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Kunle", "last_name": "Remi", "known_works": ["Gidi Up", "The Wedding Party", "Banana Island Ghost"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Deyemi", "last_name": "Okanlawon", "known_works": ["The Royal Hibiscus Hotel", "Isoken", "Ojuju"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Blossom", "last_name": "Chukwujekwu", "known_works": ["The Wedding Party", "A Few Good Men", "Lust"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Tonto", "last_name": "Dikeh", "known_works": ["Dirty Secret", "Celebrity Marriage", "Zina"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Halima", "last_name": "Abubakar", "known_works": ["The Department", "Road to Yesterday", "Scorned"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Linda", "last_name": "Ejiofor", "known_works": ["The Meeting", "Gidi Up", "Before 30"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Kehinde", "last_name": "Bankole", "known_works": ["October 1", "Ojukokoro", "The Set Up"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Bukky", "last_name": "Wright", "known_works": ["Wives on Strike", "My Wife & I", "The Royal Hibiscus Hotel"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Wale", "last_name": "Ojo", "known_works": ["The Masked Rider", "Lions of 76", "October 1"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Daniel", "last_name": "K. Daniel", "known_works": ["The Audition", "Just Not Married", "Slow Country"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Kalu", "last_name": "Ikeagwu", "known_works": ["Living in Bondage", "The Other Side", "October 1"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Toyin", "last_name": "Abraham", "known_works": ["Tattelot", "Esohe", "Gold Statue"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Iretiola", "last_name": "Doyle", "known_works": ["Lekki Wives", "Forbidden", "The Royal Hibiscus Hotel"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Uche", "last_name": "Jombo", "known_works": ["Losing Control", "Couple of Days", "Thorn"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Ufuoma", "last_name": "McDermott", "known_works": ["The Wedding Party", "The Royal Hibiscus Hotel", "Isoken"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Majid", "last_name": "Michel", "known_works": ["30 Days in Atlanta", "The Wedding Party", "New Money"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "IK", "last_name": "Ogbonna", "known_works": ["The Wedding Party", "Couple of Days", "Lagos to Jozi"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Ali", "last_name": "Nuhu", "known_works": ["The Milkmaid", "Mansoor", "Oshodi Oke"], "industry_role": "actor", "location": "Lagos, Nigeria"},
    {"first_name": "Hilda", "last_name": "Dokubo", "known_works": ["The Other Side", "Ije", "Asewo To Mecca"], "industry_role": "actor", "location": "Lagos, Nigeria"},
]

DIRECTORS = [
    {"first_name": "Kunle", "last_name": "Afolayan", "known_works": ["October 1", "The CEO", "Mokalik"], "industry_role": "director", "location": "Lagos, Nigeria"},
    {"first_name": "Kemi", "last_name": "Adetiba", "known_works": ["The Wedding Party", "King of Boys", "King of Boys: The Return"], "industry_role": "director", "location": "Lagos, Nigeria"},
    {"first_name": "Niyi", "last_name": "Akinmolayan", "known_works": ["The Wedding Party", "Chief Daddy", "Oloture"], "industry_role": "director", "location": "Lagos, Nigeria"},
    {"first_name": "Lancelot", "last_name": "Imasuen", "known_works": ["Living in Bondage", "October 1", "Laughter Gate"], "industry_role": "director", "location": "Benin, Nigeria"},
    {"first_name": "Tade", "last_name": "Ogidan", "known_works": ["Owo Blow", "Dangerous Twins", "Jenifa"], "industry_role": "director", "location": "Lagos, Nigeria"},
    {"first_name": "Akin", "last_name": "Omotoso", "known_works": ["The Violation", "Felicidade", "The Story of a Mujrah"], "industry_role": "director", "location": "Lagos, Nigeria"},
    {"first_name": "Jade", "last_name": "Osiberu", "known_works": ["The Wedding Party", "Isoken", "Your Excellency"], "industry_role": "director", "location": "Lagos, Nigeria"},
    {"first_name": "Biodun", "last_name": "Stephen", "known_works": ["Gidi Up", "Before 30", "The Royal Hibiscus Hotel"], "industry_role": "director", "location": "Lagos, Nigeria"},
    {"first_name": "Tope", "last_name": "Oshin", "known_works": ["Lotanna", "The Long Night", "Ratnik"], "industry_role": "director", "location": "Lagos, Nigeria"},
    {"first_name": "Mildred", "last_name": "Okwo", "known_works": ["The Meeting", "La Femme Anjola", "Scorned"], "industry_role": "director", "location": "Lagos, Nigeria"},
    {"first_name": "Ishaya", "last_name": "Bako", "known_works": ["76", "The Garbage Collector", "Road to Yesterday"], "industry_role": "director", "location": "Lagos, Nigeria"},
    {"first_name": "Dimeji", "last_name": "Ajibola", "known_works": ["Rattlesnake", "Diamonds in the Sky", "Ailatu"], "industry_role": "director", "location": "Lagos, Nigeria"},
]

PRODUCERS = [
    {"first_name": "Mo", "last_name": "Abudu", "known_works": ["The Wedding Party", "Eclipse", "Fifty"], "industry_role": "producer", "location": "Lagos, Nigeria"},
    {"first_name": "Don", "last_name": "Omope", "known_works": ["The Wedding Party", "Chief Daddy", "Oloture"], "industry_role": "producer", "location": "Lagos, Nigeria"},
    {"first_name": "Zulumoke", "last_name": "Oyekanmi", "known_works": ["The Wedding Party", "Isoken", "Your Excellency"], "industry_role": "producer", "location": "Lagos, Nigeria"},
    {"first_name": "Kemi", "last_name": "Adetiba", "known_works": ["King of Boys", "King of Boys: The Return", "The Wedding Party"], "industry_role": "producer", "location": "Lagos, Nigeria"},
    {"first_name": "Adebayo", "last_name": "Ojeyemi", "known_works": ["Okafor's Law", "The Antique", "Love in the Air"], "industry_role": "producer", "location": "Lagos, Nigeria"},
    {"first_name": "Priscilla", "last_name": "Nwanah", "known_works": ["The Royal Hibiscus Hotel", "Banana Island Ghost", "Up North"], "industry_role": "producer", "location": "Lagos, Nigeria"},
    {"first_name": "Tola", "last_name": "Odewale", "known_works": ["Breaded Life", "Dwindle", "The Perfect Arrangement"], "industry_role": "producer", "location": "Lagos, Nigeria"},
    {"first_name": "Sam", "last_name": "Mordi", "known_works": ["Ojuju", "O-Tokunbo", "The Set Up"], "industry_role": "producer", "location": "Lagos, Nigeria"},
    {"first_name": "Emmanuel", "last_name": "Ughamadu", "known_works": ["Burning", "Lagos to London", "Gidi Up"], "industry_role": "producer", "location": "Lagos, Nigeria"},
    {"first_name": "Blessing", "last_name": "Egbe", "known_works": ["The Millions", "Ojuju", "Burning"], "industry_role": "producer", "location": "Lagos, Nigeria"},
]

CREW = [
    {"first_name": "Yinka", "last_name": "Edward", "known_works": ["October 1", "The CEO", "Mokalik"], "industry_role": "crew", "location": "Lagos, Nigeria", "skills": ["Cinematography"]},
    {"first_name": "Patrick", "last_name": "Matthew", "known_works": ["The Wedding Party", "Isoken", "Your Excellency"], "industry_role": "crew", "location": "Lagos, Nigeria", "skills": ["Sound Design"]},
    {"first_name": "Tunde", "last_name": "Babatunde", "known_works": ["76", "The Wedding Party", "Lionheart"], "industry_role": "crew", "location": "Lagos, Nigeria", "skills": ["Editing"]},
    {"first_name": "Matthieu", "last_name": "Planche", "known_works": ["The Milkmaid", "October 1", "Lionheart"], "industry_role": "crew", "location": "Lagos, Nigeria", "skills": ["Cinematography"]},
    {"first_name": "Jerry", "last_name": "Clerk", "known_works": ["Ojukokoro", "The Set Up", "Burning"], "industry_role": "crew", "location": "Lagos, Nigeria", "skills": ["Cinematography"]},
    {"first_name": "Akin", "last_name": "Alabi", "known_works": ["The Wedding Party", "Chief Daddy", "Oloture"], "industry_role": "crew", "location": "Lagos, Nigeria", "skills": ["Production Design"]},
    {"first_name": "Babatunde", "last_name": "Sokunbi", "known_works": ["October 1", "The CEO", "Mokalik"], "industry_role": "crew", "location": "Lagos, Nigeria", "skills": ["Costume Design"]},
    {"first_name": "Pat", "last_name": "Okeke", "known_works": ["Living in Bondage", "The Wedding Party", "Lionheart"], "industry_role": "crew", "location": "Lagos, Nigeria", "skills": ["Makeup"]},
    {"first_name": "Gbenga", "last_name": "Salami", "known_works": ["The Set Up", "Ojuju", "Burning"], "industry_role": "crew", "location": "Lagos, Nigeria", "skills": ["Stunt Coordination"]},
    {"first_name": "Kunle", "last_name": "Adeyemi", "known_works": ["October 1", "Lionheart", "The Wedding Party"], "industry_role": "crew", "location": "Lagos, Nigeria", "skills": ["VFX"]},
]

ALL_PROFILES = ACTORS + DIRECTORS + PRODUCERS + CREW

def seed():
    print(f"Seeding {len(ALL_PROFILES)} industry profiles...")
    
    profiles_data = []
    for p in ALL_PROFILES:
        profiles_data.append({
            "email": f"{p['first_name'].lower()}.{p['last_name'].lower().replace(' ', '')}@nollycrew.com",
            "first_name": p["first_name"],
            "last_name": p["last_name"],
            "location": p.get("location", ""),
            "industry_role": p.get("industry_role", "actor"),
            "known_works": json.dumps(p.get("known_works", [])),
            "claim_status": "unclaimed",
            "is_verified": False,
        })
    
    # Insert in batches of 50
    batch_size = 50
    for i in range(0, len(profiles_data), batch_size):
        batch = profiles_data[i:i+batch_size]
        try:
            result = supabase.table("profiles").insert(batch).execute()
            print(f"  Inserted batch {i//batch_size + 1}: {len(batch)} profiles")
        except Exception as e:
            print(f"  Error inserting batch {i//batch_size + 1}: {e}")
    
    print("Done!")

if __name__ == "__main__":
    seed()
