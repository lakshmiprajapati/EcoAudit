# carbon-cli.py
import requests
import sys
import argparse

# Configuration
API_URL = "http://localhost:8000/audit"

def run_audit(url, threshold):
    print(f"\n🚀 Starting Carbon Audit for: {url}")
    print("⏳ Waiting for analysis...")
    
    try:
        # Call our own API (defaulting to Global region for standardization)
        response = requests.post(API_URL, json={"url": url, "region": "global"})
        
        if response.status_code != 200:
            print(f"❌ Error: API returned {response.status_code}")
            sys.exit(1)
            
        data = response.json()
        
        # Extract Metrics
        co2 = data['co2_grams']
        grade = data['grade']
        # Safely get ML prediction
        predicted_kg = data.get('annual_projection_kg', 0)
        
        print("\n" + "="*40)
        print(f"🌍 ECO-AUDIT CLI REPORT")
        print("="*40)
        print(f"Target URL:       {url}")
        print(f"Carbon per Visit: {round(co2, 3)}g")
        print(f"Annual Est.:      {predicted_kg} kg")
        print(f"Grade:            {grade}")
        print(f"Pass Threshold:   {threshold}g")
        print("="*40 + "\n")
        
        # The CI/CD Logic (Pass or Fail)
        if co2 > threshold:
            print(f"❌ BUILD FAILED: Website exceeds carbon limit of {threshold}g!")
            # In a real CI/CD pipeline (GitHub Actions), exit(1) stops the deployment.
            sys.exit(1) 
        else:
            print(f"✅ BUILD PASSED: Website is sustainable.")
            sys.exit(0) 

    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        print("Make sure your core-api is running on port 8000!")
        sys.exit(1)

if __name__ == "__main__":
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='EcoAudit CI/CD Tool')
    parser.add_argument('--url', required=True, help='The website to scan')
    parser.add_argument('--limit', type=float, default=0.5, help='Max CO2 grams allowed')
    
    args = parser.parse_args()
    run_audit(args.url, args.limit)