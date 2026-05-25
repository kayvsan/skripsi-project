import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

class FuzzyIrrigationEngine:
    def __init__(self):
        # 1. New Antecedent/Consequent objects hold universe variables and membership functions
        self.soil_moisture = ctrl.Antecedent(np.arange(0, 101, 1), 'soil_moisture')
        self.humidity = ctrl.Antecedent(np.arange(0, 101, 1), 'humidity')
        self.temperature = ctrl.Antecedent(np.arange(20, 41, 1), 'temperature')
        self.duration = ctrl.Consequent(np.arange(0, 101, 1), 'duration')

        # 2. Auto-membership function population (Optional: can be manual for better tuning)
        # Soil Moisture: Kering (0-30), Lembab (25-60), Basah (55-100)
        self.soil_moisture['kering'] = fuzz.trimf(self.soil_moisture.universe, [0, 0, 35])
        self.soil_moisture['lembab'] = fuzz.trimf(self.soil_moisture.universe, [25, 50, 75])
        self.soil_moisture['basah'] = fuzz.trimf(self.soil_moisture.universe, [65, 100, 100])

        # Humidity: Rendah (0-40), Sedang (35-70), Tinggi (65-100)
        self.humidity['rendah'] = fuzz.trimf(self.humidity.universe, [0, 0, 45])
        self.humidity['sedang'] = fuzz.trimf(self.humidity.universe, [35, 55, 75])
        self.humidity['tinggi'] = fuzz.trimf(self.humidity.universe, [65, 100, 100])

        # Temperature: Dingin (20-28), Normal (26-34), Panas (32-40)
        self.temperature['dingin'] = fuzz.trimf(self.temperature.universe, [20, 20, 28])
        self.temperature['normal'] = fuzz.trimf(self.temperature.universe, [26, 30, 34])
        self.temperature['panas'] = fuzz.trimf(self.temperature.universe, [32, 40, 40])

        # Duration: Tidak Perlu (0-20), Sedikit (15-50), Sedang (45-75), Banyak (70-100)
        self.duration['tidak_perlu'] = fuzz.trimf(self.duration.universe, [0, 0, 25])
        self.duration['sedikit'] = fuzz.trimf(self.duration.universe, [20, 35, 50])
        self.duration['sedang'] = fuzz.trimf(self.duration.universe, [45, 60, 75])
        self.duration['banyak'] = fuzz.trimf(self.duration.universe, [70, 100, 100])

        # 3. Define Rules
        rule1 = ctrl.Rule(self.soil_moisture['kering'] & self.temperature['panas'], self.duration['banyak'])
        rule2 = ctrl.Rule(self.soil_moisture['basah'], self.duration['tidak_perlu'])
        rule3 = ctrl.Rule(self.soil_moisture['lembab'] & self.humidity['tinggi'], self.duration['sedikit'])
        rule4 = ctrl.Rule(self.soil_moisture['lembab'] & self.temperature['normal'], self.duration['sedikit'])
        rule5 = ctrl.Rule(self.soil_moisture['kering'] & self.temperature['normal'], self.duration['sedang'])
        rule6 = ctrl.Rule(self.soil_moisture['kering'] & self.humidity['rendah'], self.duration['banyak'])
        rule7 = ctrl.Rule(self.soil_moisture['lembab'] & self.temperature['panas'], self.duration['sedang'])
        
        # Default safety rules
        rule8 = ctrl.Rule(self.soil_moisture['basah'] & self.temperature['panas'], self.duration['tidak_perlu'])
        rule9 = ctrl.Rule(self.soil_moisture['kering'] & self.humidity['tinggi'], self.duration['sedang'])

        self.irrigation_ctrl = ctrl.ControlSystem([rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8, rule9])
        self.irrigation_sim = ctrl.ControlSystemSimulation(self.irrigation_ctrl)

    def calculate(self, temp, hum, soil):
        try:
            self.irrigation_sim.input['temperature'] = temp
            self.irrigation_sim.input['humidity'] = hum
            self.irrigation_sim.input['soil_moisture'] = soil
            
            self.irrigation_sim.compute()
            return self.irrigation_sim.output['duration']
        except Exception as e:
            print(f"Error in fuzzy calculation: {e}")
            return 0.0

# Singleton instance
engine = FuzzyIrrigationEngine()
