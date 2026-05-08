import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

class FuzzyIrrigationEngine:
    """
    Singleton Fuzzy Logic Mamdani engine.
    Uses scikit-fuzzy to compute irrigation duration based on soil moisture, 
    air humidity, and temperature.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FuzzyIrrigationEngine, cls).__new__(cls)
            cls._instance._build_system()
        return cls._instance

    def _build_system(self):
        # 1. Define Antecedents (Inputs)
        # Soil Moisture: 0-100%
        # User Feedback: Kering (< 50%), Optimal (50%-80%), Basah (> 80%)
        # Membership params: [start, peak, end]
        self.soil_moisture = ctrl.Antecedent(np.arange(0, 101, 1), 'soil_moisture')
        self.soil_moisture['kering'] = fuzz.trimf(self.soil_moisture.universe, [0, 0, 55])
        self.soil_moisture['optimal'] = fuzz.trimf(self.soil_moisture.universe, [50, 65, 80])
        self.soil_moisture['basah'] = fuzz.trimf(self.soil_moisture.universe, [75, 100, 100])

        # Air Humidity: 0-100%
        self.air_humidity = ctrl.Antecedent(np.arange(0, 101, 1), 'air_humidity')
        self.air_humidity['rendah'] = fuzz.trimf(self.air_humidity.universe, [0, 0, 45])
        self.air_humidity['sedang'] = fuzz.trimf(self.air_humidity.universe, [35, 52.5, 70])
        self.air_humidity['tinggi'] = fuzz.trimf(self.air_humidity.universe, [65, 100, 100])

        # Temperature: 20-40°C
        self.temperature = ctrl.Antecedent(np.arange(20, 41, 1), 'temperature')
        self.temperature['dingin'] = fuzz.trimf(self.temperature.universe, [20, 20, 28])
        self.temperature['normal'] = fuzz.trimf(self.temperature.universe, [26, 30, 34])
        self.temperature['panas'] = fuzz.trimf(self.temperature.universe, [32, 40, 40])

        # 2. Define Consequent (Output)
        # Duration Percent: 0-100%
        self.duration = ctrl.Consequent(np.arange(0, 101, 1), 'duration')
        self.duration['tidak_perlu'] = fuzz.trimf(self.duration.universe, [0, 0, 25])
        self.duration['sedikit'] = fuzz.trimf(self.duration.universe, [15, 32.5, 50])
        self.duration['sedang'] = fuzz.trimf(self.duration.universe, [45, 60, 75])
        self.duration['banyak'] = fuzz.trimf(self.duration.universe, [70, 100, 100])

        # 3. Define 27 Rules
        rules = [
            # Kering
            ctrl.Rule(self.soil_moisture['kering'] & self.air_humidity['rendah'] & self.temperature['dingin'], self.duration['sedang']),
            ctrl.Rule(self.soil_moisture['kering'] & self.air_humidity['rendah'] & self.temperature['normal'], self.duration['banyak']),
            ctrl.Rule(self.soil_moisture['kering'] & self.air_humidity['rendah'] & self.temperature['panas'], self.duration['banyak']),
            ctrl.Rule(self.soil_moisture['kering'] & self.air_humidity['sedang'] & self.temperature['dingin'], self.duration['sedikit']),
            ctrl.Rule(self.soil_moisture['kering'] & self.air_humidity['sedang'] & self.temperature['normal'], self.duration['sedang']),
            ctrl.Rule(self.soil_moisture['kering'] & self.air_humidity['sedang'] & self.temperature['panas'], self.duration['banyak']),
            ctrl.Rule(self.soil_moisture['kering'] & self.air_humidity['tinggi'] & self.temperature['dingin'], self.duration['sedikit']),
            ctrl.Rule(self.soil_moisture['kering'] & self.air_humidity['tinggi'] & self.temperature['normal'], self.duration['sedikit']),
            ctrl.Rule(self.soil_moisture['kering'] & self.air_humidity['tinggi'] & self.temperature['panas'], self.duration['sedang']),

            # Optimal
            ctrl.Rule(self.soil_moisture['optimal'] & self.air_humidity['rendah'] & self.temperature['dingin'], self.duration['sedikit']),
            ctrl.Rule(self.soil_moisture['optimal'] & self.air_humidity['rendah'] & self.temperature['normal'], self.duration['sedang']),
            ctrl.Rule(self.soil_moisture['optimal'] & self.air_humidity['rendah'] & self.temperature['panas'], self.duration['sedang']),
            ctrl.Rule(self.soil_moisture['optimal'] & self.air_humidity['sedang'] & self.temperature['dingin'], self.duration['tidak_perlu']),
            ctrl.Rule(self.soil_moisture['optimal'] & self.air_humidity['sedang'] & self.temperature['normal'], self.duration['sedikit']),
            ctrl.Rule(self.soil_moisture['optimal'] & self.air_humidity['sedang'] & self.temperature['panas'], self.duration['sedang']),
            ctrl.Rule(self.soil_moisture['optimal'] & self.air_humidity['tinggi'] & self.temperature['dingin'], self.duration['tidak_perlu']),
            ctrl.Rule(self.soil_moisture['optimal'] & self.air_humidity['tinggi'] & self.temperature['normal'], self.duration['tidak_perlu']),
            ctrl.Rule(self.soil_moisture['optimal'] & self.air_humidity['tinggi'] & self.temperature['panas'], self.duration['sedikit']),

            # Basah
            ctrl.Rule(self.soil_moisture['basah'] & self.air_humidity['rendah'] & self.temperature['dingin'], self.duration['tidak_perlu']),
            ctrl.Rule(self.soil_moisture['basah'] & self.air_humidity['rendah'] & self.temperature['normal'], self.duration['sedikit']),
            ctrl.Rule(self.soil_moisture['basah'] & self.air_humidity['rendah'] & self.temperature['panas'], self.duration['sedikit']),
            ctrl.Rule(self.soil_moisture['basah'] & self.air_humidity['sedang'] & self.temperature['dingin'], self.duration['tidak_perlu']),
            ctrl.Rule(self.soil_moisture['basah'] & self.air_humidity['sedang'] & self.temperature['normal'], self.duration['tidak_perlu']),
            ctrl.Rule(self.soil_moisture['basah'] & self.air_humidity['sedang'] & self.temperature['panas'], self.duration['sedikit']),
            ctrl.Rule(self.soil_moisture['basah'] & self.air_humidity['tinggi'] & self.temperature['dingin'], self.duration['tidak_perlu']),
            ctrl.Rule(self.soil_moisture['basah'] & self.air_humidity['tinggi'] & self.temperature['normal'], self.duration['tidak_perlu']),
            ctrl.Rule(self.soil_moisture['basah'] & self.air_humidity['tinggi'] & self.temperature['panas'], self.duration['tidak_perlu']),
        ]

        # 4. Create Control System & Simulation
        self.system_ctrl = ctrl.ControlSystem(rules)
        self.simulation = ctrl.ControlSystemSimulation(self.system_ctrl)

    def compute(self, soil_moisture_val, air_humidity_val, temperature_val):
        """
        Computes the fuzzy output.
        """
        try:
            self.simulation.input['soil_moisture'] = soil_moisture_val
            self.simulation.input['air_humidity'] = air_humidity_val
            self.simulation.input['temperature'] = temperature_val

            self.simulation.compute()
            
            duration_val = self.simulation.output['duration']
            
            # Determine dominant fuzzy categories for logging
            sm_fuzzy = self._get_dominant_membership(self.soil_moisture, soil_moisture_val)
            ah_fuzzy = self._get_dominant_membership(self.air_humidity, air_humidity_val)
            temp_fuzzy = self._get_dominant_membership(self.temperature, temperature_val)
            decision_fuzzy = self._get_dominant_membership(self.duration, duration_val)

            return {
                "duration_percent": float(duration_val),
                "decision": decision_fuzzy,
                "soil_moisture_fuzzy": sm_fuzzy,
                "air_humidity_fuzzy": ah_fuzzy,
                "temperature_fuzzy": temp_fuzzy,
                "confidence": 1.0  # Simplified
            }
        except Exception as e:
            print(f"Error in fuzzy computation: {e}")
            return None

    def _get_dominant_membership(self, variable, value):
        memberships = {}
        for term in variable.terms:
            memberships[term] = fuzz.interp_membership(variable.universe, variable[term].mf, value)
        return max(memberships, key=memberships.get)
