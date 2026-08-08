import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

class FuzzyIrrigationEngine:
    def __init__(self):
        # 1. New Antecedent/Consequent objects hold universe variables and membership functions
        self.soil_moisture = ctrl.Antecedent(np.arange(0, 101, 1), 'soil_moisture')
        self.humidity = ctrl.Antecedent(np.arange(0, 101, 1), 'humidity')
        self.temperature = ctrl.Antecedent(np.arange(15, 41, 1), 'temperature')
        self.duration = ctrl.Consequent(np.arange(0, 61, 1), 'duration')

        # 2. Define Membership Functions based on Manuscript
        # Soil Moisture (Table 6): Dingin (Kering), Normal, Panas (Basah)
        self.soil_moisture['dingin'] = fuzz.trapmf(self.soil_moisture.universe, [0, 0, 55, 60])
        self.soil_moisture['normal'] = fuzz.trapmf(self.soil_moisture.universe, [55, 60, 80, 85])
        self.soil_moisture['panas'] = fuzz.trapmf(self.soil_moisture.universe, [80, 85, 100, 100])

        # Humidity (Table 8): Rendah, Normal, Tinggi
        self.humidity['rendah'] = fuzz.trapmf(self.humidity.universe, [0, 0, 65, 70])
        self.humidity['normal'] = fuzz.trimf(self.humidity.universe, [65, 75, 85])
        self.humidity['tinggi'] = fuzz.trapmf(self.humidity.universe, [80, 85, 100, 100])

        # Temperature (Table 7): Dingin, Normal, Panas
        self.temperature['dingin'] = fuzz.trapmf(self.temperature.universe, [15, 15, 22, 24])
        self.temperature['normal'] = fuzz.trapmf(self.temperature.universe, [22, 24, 28, 30])
        self.temperature['panas'] = fuzz.trapmf(self.temperature.universe, [28, 30, 40, 40])

        # Duration (Table 9): Singkat, Sedang, Lama
        self.duration['singkat'] = fuzz.trapmf(self.duration.universe, [0, 0, 10, 25])
        self.duration['sedang'] = fuzz.trimf(self.duration.universe, [15, 30, 45])
        self.duration['lama'] = fuzz.trapmf(self.duration.universe, [35, 50, 60, 60])

        # 3. Define 27 Rules (Table 10 in Manuscript)
        # Note: Soil Moisture mapping -> Kering=dingin, Normal=normal, Basah=panas (based on Table 6 naming)
        
        # Soil Moisture = Kering (mapped to 'dingin')
        rule1 = ctrl.Rule(self.soil_moisture['dingin'] & self.temperature['dingin'] & self.humidity['rendah'], self.duration['sedang'])
        rule2 = ctrl.Rule(self.soil_moisture['dingin'] & self.temperature['dingin'] & self.humidity['normal'], self.duration['sedang'])
        rule3 = ctrl.Rule(self.soil_moisture['dingin'] & self.temperature['dingin'] & self.humidity['tinggi'], self.duration['singkat'])
        rule4 = ctrl.Rule(self.soil_moisture['dingin'] & self.temperature['normal'] & self.humidity['rendah'], self.duration['lama'])
        rule5 = ctrl.Rule(self.soil_moisture['dingin'] & self.temperature['normal'] & self.humidity['normal'], self.duration['lama'])
        rule6 = ctrl.Rule(self.soil_moisture['dingin'] & self.temperature['normal'] & self.humidity['tinggi'], self.duration['sedang'])
        rule7 = ctrl.Rule(self.soil_moisture['dingin'] & self.temperature['panas'] & self.humidity['rendah'], self.duration['lama'])
        rule8 = ctrl.Rule(self.soil_moisture['dingin'] & self.temperature['panas'] & self.humidity['normal'], self.duration['lama'])
        rule9 = ctrl.Rule(self.soil_moisture['dingin'] & self.temperature['panas'] & self.humidity['tinggi'], self.duration['lama'])

        # Soil Moisture = Normal (mapped to 'normal')
        rule10 = ctrl.Rule(self.soil_moisture['normal'] & self.temperature['dingin'] & self.humidity['rendah'], self.duration['singkat'])
        rule11 = ctrl.Rule(self.soil_moisture['normal'] & self.temperature['dingin'] & self.humidity['normal'], self.duration['singkat'])
        rule12 = ctrl.Rule(self.soil_moisture['normal'] & self.temperature['dingin'] & self.humidity['tinggi'], self.duration['singkat'])
        rule13 = ctrl.Rule(self.soil_moisture['normal'] & self.temperature['normal'] & self.humidity['rendah'], self.duration['sedang'])
        rule14 = ctrl.Rule(self.soil_moisture['normal'] & self.temperature['normal'] & self.humidity['normal'], self.duration['sedang'])
        rule15 = ctrl.Rule(self.soil_moisture['normal'] & self.temperature['normal'] & self.humidity['tinggi'], self.duration['singkat'])
        rule16 = ctrl.Rule(self.soil_moisture['normal'] & self.temperature['panas'] & self.humidity['rendah'], self.duration['lama'])
        rule17 = ctrl.Rule(self.soil_moisture['normal'] & self.temperature['panas'] & self.humidity['normal'], self.duration['sedang'])
        rule18 = ctrl.Rule(self.soil_moisture['normal'] & self.temperature['panas'] & self.humidity['tinggi'], self.duration['sedang'])

        # Soil Moisture = Basah (mapped to 'panas')
        rule19 = ctrl.Rule(self.soil_moisture['panas'] & self.temperature['dingin'] & self.humidity['rendah'], self.duration['singkat'])
        rule20 = ctrl.Rule(self.soil_moisture['panas'] & self.temperature['dingin'] & self.humidity['normal'], self.duration['singkat'])
        rule21 = ctrl.Rule(self.soil_moisture['panas'] & self.temperature['dingin'] & self.humidity['tinggi'], self.duration['singkat'])
        rule22 = ctrl.Rule(self.soil_moisture['panas'] & self.temperature['normal'] & self.humidity['rendah'], self.duration['singkat'])
        rule23 = ctrl.Rule(self.soil_moisture['panas'] & self.temperature['normal'] & self.humidity['normal'], self.duration['singkat'])
        rule24 = ctrl.Rule(self.soil_moisture['panas'] & self.temperature['normal'] & self.humidity['tinggi'], self.duration['singkat'])
        rule25 = ctrl.Rule(self.soil_moisture['panas'] & self.temperature['panas'] & self.humidity['rendah'], self.duration['sedang'])
        rule26 = ctrl.Rule(self.soil_moisture['panas'] & self.temperature['panas'] & self.humidity['normal'], self.duration['singkat'])
        rule27 = ctrl.Rule(self.soil_moisture['panas'] & self.temperature['panas'] & self.humidity['tinggi'], self.duration['singkat'])

        self.irrigation_ctrl = ctrl.ControlSystem([
            rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8, rule9,
            rule10, rule11, rule12, rule13, rule14, rule15, rule16, rule17, rule18,
            rule19, rule20, rule21, rule22, rule23, rule24, rule25, rule26, rule27
        ])
        self.irrigation_sim = ctrl.ControlSystemSimulation(self.irrigation_ctrl)

    def calculate(self, temp, hum, soil):
        try:
            # Clip input values to ensure they fall within the defined universe
            self.irrigation_sim.input['temperature'] = float(np.clip(temp, 15, 40))
            self.irrigation_sim.input['humidity'] = float(np.clip(hum, 0, 100))
            self.irrigation_sim.input['soil_moisture'] = float(np.clip(soil, 0, 100))
            
            self.irrigation_sim.compute()
            return self.irrigation_sim.output['duration']
        except Exception as e:
            print(f"Error in fuzzy calculation: {e}")
            return 0.0

# Singleton instance
engine = FuzzyIrrigationEngine()
