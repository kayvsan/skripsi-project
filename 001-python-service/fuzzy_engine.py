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

        # Soil Moisture: Kering, Ideal, Basah
        self.soil_moisture['kering'] = fuzz.trapmf(self.soil_moisture.universe, [0, 0, 55, 60])
        self.soil_moisture['ideal'] = fuzz.trapmf(self.soil_moisture.universe, [55, 60, 80, 85])
        self.soil_moisture['basah'] = fuzz.trapmf(self.soil_moisture.universe, [80, 85, 100, 100])

        # Humidity: Rendah, Ideal, Tinggi
        self.humidity['rendah'] = fuzz.trapmf(self.humidity.universe, [0, 0, 65, 70])
        self.humidity['ideal'] = fuzz.trimf(self.humidity.universe, [65, 75, 85])
        self.humidity['tinggi'] = fuzz.trapmf(self.humidity.universe, [80, 85, 100, 100])

        # Temperature: Dingin, Ideal, Panas
        self.temperature['dingin'] = fuzz.trapmf(self.temperature.universe, [15, 15, 22, 24])
        self.temperature['ideal'] = fuzz.trapmf(self.temperature.universe, [22, 24, 28, 30])
        self.temperature['panas'] = fuzz.trapmf(self.temperature.universe, [28, 30, 40, 40])

        # Duration: Mati, Singkat, Sedang, Lama
        self.duration['mati'] = fuzz.trimf(self.duration.universe, [0, 0, 5])
        self.duration['singkat'] = fuzz.trimf(self.duration.universe, [0, 10, 20])
        self.duration['sedang'] = fuzz.trimf(self.duration.universe, [15, 28, 40])
        self.duration['lama'] = fuzz.trapmf(self.duration.universe, [35, 50, 60, 60])

        # 3. Define 27 Rules (Complete Rule Base)
        # Soil Moisture = Basah (9 rules)
        rule1 = ctrl.Rule(self.soil_moisture['basah'] & self.temperature['dingin'] & self.humidity['tinggi'], self.duration['mati'])
        rule2 = ctrl.Rule(self.soil_moisture['basah'] & self.temperature['dingin'] & self.humidity['ideal'], self.duration['mati'])
        rule3 = ctrl.Rule(self.soil_moisture['basah'] & self.temperature['dingin'] & self.humidity['rendah'], self.duration['mati'])
        rule4 = ctrl.Rule(self.soil_moisture['basah'] & self.temperature['ideal'] & self.humidity['tinggi'], self.duration['mati'])
        rule5 = ctrl.Rule(self.soil_moisture['basah'] & self.temperature['ideal'] & self.humidity['ideal'], self.duration['mati'])
        rule6 = ctrl.Rule(self.soil_moisture['basah'] & self.temperature['ideal'] & self.humidity['rendah'], self.duration['mati'])
        rule7 = ctrl.Rule(self.soil_moisture['basah'] & self.temperature['panas'] & self.humidity['tinggi'], self.duration['mati'])
        rule8 = ctrl.Rule(self.soil_moisture['basah'] & self.temperature['panas'] & self.humidity['ideal'], self.duration['mati'])
        rule9 = ctrl.Rule(self.soil_moisture['basah'] & self.temperature['panas'] & self.humidity['rendah'], self.duration['singkat'])

        # Soil Moisture = Ideal (9 rules)
        rule10 = ctrl.Rule(self.soil_moisture['ideal'] & self.temperature['dingin'] & self.humidity['tinggi'], self.duration['mati'])
        rule11 = ctrl.Rule(self.soil_moisture['ideal'] & self.temperature['dingin'] & self.humidity['ideal'], self.duration['singkat'])
        rule12 = ctrl.Rule(self.soil_moisture['ideal'] & self.temperature['dingin'] & self.humidity['rendah'], self.duration['sedang'])
        rule13 = ctrl.Rule(self.soil_moisture['ideal'] & self.temperature['ideal'] & self.humidity['tinggi'], self.duration['singkat'])
        rule14 = ctrl.Rule(self.soil_moisture['ideal'] & self.temperature['ideal'] & self.humidity['ideal'], self.duration['singkat'])
        rule15 = ctrl.Rule(self.soil_moisture['ideal'] & self.temperature['ideal'] & self.humidity['rendah'], self.duration['sedang'])
        rule16 = ctrl.Rule(self.soil_moisture['ideal'] & self.temperature['panas'] & self.humidity['tinggi'], self.duration['singkat'])
        rule17 = ctrl.Rule(self.soil_moisture['ideal'] & self.temperature['panas'] & self.humidity['ideal'], self.duration['sedang'])
        rule18 = ctrl.Rule(self.soil_moisture['ideal'] & self.temperature['panas'] & self.humidity['rendah'], self.duration['lama'])

        # Soil Moisture = Kering (9 rules)
        rule19 = ctrl.Rule(self.soil_moisture['kering'] & self.temperature['dingin'] & self.humidity['tinggi'], self.duration['sedang'])
        rule20 = ctrl.Rule(self.soil_moisture['kering'] & self.temperature['dingin'] & self.humidity['ideal'], self.duration['sedang'])
        rule21 = ctrl.Rule(self.soil_moisture['kering'] & self.temperature['dingin'] & self.humidity['rendah'], self.duration['lama'])
        rule22 = ctrl.Rule(self.soil_moisture['kering'] & self.temperature['ideal'] & self.humidity['tinggi'], self.duration['sedang'])
        rule23 = ctrl.Rule(self.soil_moisture['kering'] & self.temperature['ideal'] & self.humidity['ideal'], self.duration['lama'])
        rule24 = ctrl.Rule(self.soil_moisture['kering'] & self.temperature['ideal'] & self.humidity['rendah'], self.duration['lama'])
        rule25 = ctrl.Rule(self.soil_moisture['kering'] & self.temperature['panas'] & self.humidity['tinggi'], self.duration['lama'])
        rule26 = ctrl.Rule(self.soil_moisture['kering'] & self.temperature['panas'] & self.humidity['ideal'], self.duration['lama'])
        rule27 = ctrl.Rule(self.soil_moisture['kering'] & self.temperature['panas'] & self.humidity['rendah'], self.duration['lama'])

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
