import time
import random
import json
import requests

def generate_telemetry(t_id, is_imbalanced=False):
    """
    Simulates electrical and physical parameters for a distribution transformer.
    Models normal operation vs. severe phase imbalance and oil degradation.
    """
    # Nominal values for a standard distribution transformer
    nominal_current = 400.0  # Amps
    ambient_temp = 25.0      # Celsius

    if is_imbalanced:
        # Simulate a neighborhood where Phase A is drawing far too much power
        phase_a = nominal_current * 1.45 + random.uniform(-15, 15)
        phase_b = nominal_current * 0.75 + random.uniform(-10, 10)
        phase_c = nominal_current * 0.80 + random.uniform(-10, 10)
        
        # Sustained overloading leads to higher internal heat and oil degradation
        oil_temp = ambient_temp + 65.0 + random.uniform(-2, 3) 
        status = "Warning: Phase Imbalance"
    else:
        # Healthy, balanced load
        phase_a = nominal_current + random.uniform(-10, 10)
        phase_b = nominal_current + random.uniform(-10, 10)
        phase_c = nominal_current + random.uniform(-10, 10)
        
        # Normal operating temperature
        oil_temp = ambient_temp + 35.0 + random.uniform(-2, 2)
        status = "Healthy"

    return {
        "transformer_id": t_id,
        "phase_a_amps": round(phase_a, 2),
        "phase_b_amps": round(phase_b, 2),
        "phase_c_amps": round(phase_c, 2),
        "oil_temp_c": round(oil_temp, 2),
        "status": status
    }

def run_simulation():
    print("Starting Grid Simulation and transmitting to backend...")
    
    transformers = [
        {"id": "TX-ADDIS-001", "imbalanced": False},
        {"id": "TX-ADDIS-002", "imbalanced": True}
    ]
    
    try:
        while True:
            for tx in transformers:
                data = generate_telemetry(tx["id"], tx["imbalanced"])
                
                # Send the data to the FastAPI backend
                try:
                    response = requests.post("http://127.0.0.1:8000/api/telemetry", json=data)
                    print(f"[{tx['id']}] Data sent | Status: {data['status']} | Temp: {data['oil_temp_c']}°C")
                except requests.exceptions.ConnectionError:
                    print(f"[{tx['id']}] Failed to connect. Is the FastAPI server running?")
            
            time.sleep(2)
            
    except KeyboardInterrupt:
        print("\nSimulation stopped.")

if __name__ == "__main__":
    run_simulation()