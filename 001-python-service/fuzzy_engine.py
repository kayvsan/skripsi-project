import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

class FuzzyIrrigationEngine:
    def __init__(self):
        # 1. New Antecedent/Consequent objects hold universe variables and membership functions
        self.temperature = ctrl.Antecedent(np.arange(15, 41, 0.1), 'temperature')
        self.humidity = ctrl.Antecedent(np.arange(0, 101, 0.1), 'humidity')
        self.soil_moisture = ctrl.Antecedent(np.arange(0, 101, 0.1), 'soil_moisture')
        self.duration = ctrl.Consequent(np.arange(0, 61, 0.1), 'duration')

        # 2. Define Membership Functions based on fuzzy.py
        # Suhu Udara (Dingin, Ideal, Panas)
        self.temperature['dingin'] = fuzz.trimf(self.temperature.universe, [15, 15, 24])
        self.temperature['ideal'] = fuzz.trapmf(self.temperature.universe, [22, 24, 28, 30])
        self.temperature['panas'] = fuzz.trimf(self.temperature.universe, [28, 30, 40])

        # Kelembapan Udara (Rendah, Ideal, Tinggi)
        self.humidity['rendah'] = fuzz.trimf(self.humidity.universe, [0, 0, 70])
        self.humidity['ideal'] = fuzz.trimf(self.humidity.universe, [65, 75, 85])
        self.humidity['tinggi'] = fuzz.trimf(self.humidity.universe, [80, 85, 100])

        # Kelembapan Tanah (Kering, Ideal, Basah)
        self.soil_moisture['kering'] = fuzz.trimf(self.soil_moisture.universe, [0, 0, 60])
        self.soil_moisture['ideal'] = fuzz.trapmf(self.soil_moisture.universe, [55, 60, 80, 85])
        self.soil_moisture['basah'] = fuzz.trimf(self.soil_moisture.universe, [80, 85, 100])

        # Durasi Penyiraman (Singkat, Sedang, Lama)
        self.duration['singkat'] = fuzz.trimf(self.duration.universe, [0, 0, 25])
        self.duration['sedang'] = fuzz.trimf(self.duration.universe, [15, 30, 45])
        self.duration['lama'] = fuzz.trimf(self.duration.universe, [35, 50, 60])

        # 3. Define 27 Rules exactly like fuzzy.py
        rule1 = ctrl.Rule(self.temperature['dingin'] & self.humidity['rendah'] & self.soil_moisture['kering'], self.duration['sedang'])
        rule2 = ctrl.Rule(self.temperature['dingin'] & self.humidity['rendah'] & self.soil_moisture['ideal'], self.duration['sedang'])
        rule3 = ctrl.Rule(self.temperature['dingin'] & self.humidity['rendah'] & self.soil_moisture['basah'], self.duration['singkat'])
        
        rule4 = ctrl.Rule(self.temperature['dingin'] & self.humidity['ideal'] & self.soil_moisture['kering'], self.duration['sedang'])
        rule5 = ctrl.Rule(self.temperature['dingin'] & self.humidity['ideal'] & self.soil_moisture['ideal'], self.duration['singkat'])
        rule6 = ctrl.Rule(self.temperature['dingin'] & self.humidity['ideal'] & self.soil_moisture['basah'], self.duration['singkat'])
        
        rule7 = ctrl.Rule(self.temperature['dingin'] & self.humidity['tinggi'] & self.soil_moisture['kering'], self.duration['sedang'])
        rule8 = ctrl.Rule(self.temperature['dingin'] & self.humidity['tinggi'] & self.soil_moisture['ideal'], self.duration['singkat'])
        rule9 = ctrl.Rule(self.temperature['dingin'] & self.humidity['tinggi'] & self.soil_moisture['basah'], self.duration['singkat'])
        
        rule10 = ctrl.Rule(self.temperature['ideal'] & self.humidity['rendah'] & self.soil_moisture['kering'], self.duration['lama'])
        rule11 = ctrl.Rule(self.temperature['ideal'] & self.humidity['rendah'] & self.soil_moisture['ideal'], self.duration['sedang'])
        rule12 = ctrl.Rule(self.temperature['ideal'] & self.humidity['rendah'] & self.soil_moisture['basah'], self.duration['singkat'])
        
        rule13 = ctrl.Rule(self.temperature['ideal'] & self.humidity['ideal'] & self.soil_moisture['kering'], self.duration['sedang'])
        rule14 = ctrl.Rule(self.temperature['ideal'] & self.humidity['ideal'] & self.soil_moisture['ideal'], self.duration['sedang'])
        rule15 = ctrl.Rule(self.temperature['ideal'] & self.humidity['ideal'] & self.soil_moisture['basah'], self.duration['singkat'])
        
        rule16 = ctrl.Rule(self.temperature['ideal'] & self.humidity['tinggi'] & self.soil_moisture['kering'], self.duration['sedang'])
        rule17 = ctrl.Rule(self.temperature['ideal'] & self.humidity['tinggi'] & self.soil_moisture['ideal'], self.duration['singkat'])
        rule18 = ctrl.Rule(self.temperature['ideal'] & self.humidity['tinggi'] & self.soil_moisture['basah'], self.duration['singkat'])
        
        rule19 = ctrl.Rule(self.temperature['panas'] & self.humidity['rendah'] & self.soil_moisture['kering'], self.duration['lama'])
        rule20 = ctrl.Rule(self.temperature['panas'] & self.humidity['rendah'] & self.soil_moisture['ideal'], self.duration['lama'])
        rule21 = ctrl.Rule(self.temperature['panas'] & self.humidity['rendah'] & self.soil_moisture['basah'], self.duration['sedang'])
        
        rule22 = ctrl.Rule(self.temperature['panas'] & self.humidity['ideal'] & self.soil_moisture['kering'], self.duration['lama'])
        rule23 = ctrl.Rule(self.temperature['panas'] & self.humidity['ideal'] & self.soil_moisture['ideal'], self.duration['sedang'])
        rule24 = ctrl.Rule(self.temperature['panas'] & self.humidity['ideal'] & self.soil_moisture['basah'], self.duration['sedang'])
        
        rule25 = ctrl.Rule(self.temperature['panas'] & self.humidity['tinggi'] & self.soil_moisture['kering'], self.duration['sedang'])
        rule26 = ctrl.Rule(self.temperature['panas'] & self.humidity['tinggi'] & self.soil_moisture['ideal'], self.duration['sedang'])
        rule27 = ctrl.Rule(self.temperature['panas'] & self.humidity['tinggi'] & self.soil_moisture['basah'], self.duration['singkat'])

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
