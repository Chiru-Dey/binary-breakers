import requests
import json
import sys

BASE_URL = "http://127.0.0.1:5000/api"

def run_test():
    print("🚀 Starting End-to-End Verification...")
    
    # 1. Create Tournament
    print("\n1. Creating Tournament...")
    t_data = {
        "name": "Self-Test Championship",
        "game_type": "Chess"
    }
    r = requests.post(f"{BASE_URL}/tournaments", json=t_data)
    if r.status_code != 201:
        print(f"❌ Failed to create tournament: {r.text}")
        return
    tournament = r.json()
    t_id = tournament['id']
    print(f"✅ Tournament Created: {tournament['name']} (ID: {t_id})")

    # 2. Add Teams
    print("\n2. Adding Teams...")
    teams = ["Red Dragons", "Blue Knights", "Green Giants", "Yellow Wizards"]
    for name in teams:
        r = requests.post(f"{BASE_URL}/tournaments/{t_id}/teams", json={"name": name})
        if r.status_code != 201:
             print(f"❌ Failed to add team {name}: {r.text}")
             return
    print(f"✅ Added {len(teams)} teams.")

    # 3. Generate Matches
    print("\n3. Generating Matches...")
    r = requests.post(f"{BASE_URL}/tournaments/{t_id}/generate-matches")
    if r.status_code != 201:
        print(f"❌ Failed to generate matches: {r.text}")
        return
    matches = r.json()
    print(f"✅ Generated {len(matches)} matches.")
    
    # 4. Update a Match
    if matches:
        m_id = matches[0]['id']
        t1 = matches[0]['team1']['id']
        print(f"\n4. Updating Match {m_id} (Winner: Team {t1})...")
        
        r = requests.put(f"{BASE_URL}/matches/{m_id}", json={
            "score": "3-0",
            "winner_id": t1
        })
        if r.status_code != 200:
            print(f"❌ Failed to update match: {r.text}")
            return
        updated_match = r.json()
        print(f"✅ Match Updated: Score {updated_match['score']}, Winner ID {updated_match['winner_id']}")
    
    print("\n✨ Verification Complete!")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"❌ Error connecting to server: {e}")
