"""
Directorate General of Mines Safety (DGMS) Safety Standards & Preset Rules
Al-Powered Mine Safety & Rescue Rover — SIH Jharkhand Coal Mine Context
"""

class DGMSPreset:
    STANDARD = "DGMS Coal Mines Regulations 2017 (Standard)"
    FIRE_SMOLDERING = "Active Coal Mine Fire / Smoldering Zone"
    FLOOD_INUNDATION = "Inundation & Flash Flooding Risk Zone"

# Default DGMS Standard Thresholds
DGMS_RULES = {
    DGMSPreset.STANDARD: {
        # Carbon Monoxide (CO - Afterdamp)
        "co_warning_ppm": 25.0,
        "co_danger_ppm": 50.0,   # DGMS statutory limit for human entry
        # Air Quality / Smoke / Inundation Gases (MQ-135)
        "air_warning_ppm": 400.0,
        "air_danger_ppm": 800.0,
        # Mine Temperature (Wet/Dry bulb heat stress)
        "temp_warning_c": 30.5,
        "temp_danger_c": 34.0,   # DGMS limit for manual rescue operations
        # Barometric Pressure (hPa)
        "pressure_nominal_hpa": 1013.25,
        "pressure_drop_alert_hpa": 15.0,  # Sudden 15 hPa drop warns of strata movement / collapse
        # Obstacle Safety (cm)
        "obstacle_min_safe_cm": 18.0,
        # Battery Voltage thresholds (3S Li-ion)
        "battery_low_voltage": 10.5,     # ~25%
        "battery_critical_voltage": 9.9,  # ~5% cut-off
    },
    DGMSPreset.FIRE_SMOLDERING: {
        "co_warning_ppm": 15.0,
        "co_danger_ppm": 35.0,
        "air_warning_ppm": 300.0,
        "air_danger_ppm": 600.0,
        "temp_warning_c": 28.0,
        "temp_danger_c": 32.0,
        "pressure_nominal_hpa": 1013.25,
        "pressure_drop_alert_hpa": 10.0,
        "obstacle_min_safe_cm": 25.0,
        "battery_low_voltage": 10.5,
        "battery_critical_voltage": 9.9,
    },
    DGMSPreset.FLOOD_INUNDATION: {
        "co_warning_ppm": 25.0,
        "co_danger_ppm": 50.0,
        "air_warning_ppm": 350.0,
        "air_danger_ppm": 700.0,
        "temp_warning_c": 30.0,
        "temp_danger_c": 33.0,
        "pressure_nominal_hpa": 1013.25,
        "pressure_drop_alert_hpa": 20.0,
        "obstacle_min_safe_cm": 20.0,
        "battery_low_voltage": 10.5,
        "battery_critical_voltage": 9.9,
    }
}

def evaluate_telemetry_against_dgms(telemetry: dict, preset_name: str = DGMSPreset.STANDARD) -> dict:
    rules = DGMS_RULES.get(preset_name, DGMS_RULES[DGMSPreset.STANDARD])
    alerts = []
    compliance = "COMPLIANT"

    # 1. Carbon Monoxide (MQ-7)
    co = telemetry.get("mq7_ppm", 0.0)
    if co >= rules["co_danger_ppm"]:
        compliance = "NON_COMPLIANT"
        alerts.append({
            "alert_type": "GAS_CO",
            "severity": "CRITICAL",
            "message": f"DGMS VIOLATION: Toxic CO level at {co:.1f} ppm exceeds statutory limit ({rules['co_danger_ppm']} ppm)!",
            "value": co,
            "threshold": rules["co_danger_ppm"]
        })
    elif co >= rules["co_warning_ppm"]:
        if compliance != "NON_COMPLIANT": compliance = "WARNING"
        alerts.append({
            "alert_type": "GAS_CO",
            "severity": "WARNING",
            "message": f"Elevated Carbon Monoxide ({co:.1f} ppm) detected. Smoldering risk.",
            "value": co,
            "threshold": rules["co_warning_ppm"]
        })

    # 2. General Air Quality / Smoke (MQ-135)
    air = telemetry.get("mq135_ppm", 0.0)
    if air >= rules["air_danger_ppm"]:
        compliance = "NON_COMPLIANT"
        alerts.append({
            "alert_type": "GAS_AIR",
            "severity": "CRITICAL",
            "message": f"Hazardous air contamination / smoke density ({air:.1f} ppm)!",
            "value": air,
            "threshold": rules["air_danger_ppm"]
        })
    elif air >= rules["air_warning_ppm"]:
        if compliance != "NON_COMPLIANT": compliance = "WARNING"
        alerts.append({
            "alert_type": "GAS_AIR",
            "severity": "WARNING",
            "message": f"Degraded tunnel air quality ({air:.1f} ppm).",
            "value": air,
            "threshold": rules["air_warning_ppm"]
        })

    # 3. Ambient Temperature (BME280)
    temp = telemetry.get("temperature_c", 25.0)
    if temp >= rules["temp_danger_c"]:
        compliance = "NON_COMPLIANT"
        alerts.append({
            "alert_type": "HEAT_STRESS",
            "severity": "CRITICAL",
            "message": f"Dangerous heat stress condition ({temp:.1f}°C)! Approaching tunnel flash threshold.",
            "value": temp,
            "threshold": rules["temp_danger_c"]
        })
    elif temp >= rules["temp_warning_c"]:
        if compliance != "NON_COMPLIANT": compliance = "WARNING"
        alerts.append({
            "alert_type": "HEAT_STRESS",
            "severity": "WARNING",
            "message": f"High tunnel temperature ({temp:.1f}°C). Human endurance restricted.",
            "value": temp,
            "threshold": rules["temp_warning_c"]
        })

    # 4. Barometric Pressure Drop (Strata Shift / Cave-In)
    press = telemetry.get("pressure_hpa", 1013.25)
    delta_press = abs(press - rules["pressure_nominal_hpa"])
    if delta_press >= rules["pressure_drop_alert_hpa"]:
        alerts.append({
            "alert_type": "PRESSURE_COLLAPSE",
            "severity": "WARNING",
            "message": f"Barometric pressure abnormality ({press:.1f} hPa, Δ{delta_press:.1f}). Possible air displacement or ventilation shaft breach.",
            "value": press,
            "threshold": rules["pressure_nominal_hpa"] - rules["pressure_drop_alert_hpa"]
        })

    # 5. Obstacle Proximity
    dist = telemetry.get("obstacle_distance_cm", 100.0)
    if 0.0 < dist <= rules["obstacle_min_safe_cm"]:
        alerts.append({
            "alert_type": "OBSTACLE",
            "severity": "CRITICAL",
            "message": f"Imminent collision risk: Obstacle at {dist:.1f} cm! Auto-brake engaged.",
            "value": dist,
            "threshold": rules["obstacle_min_safe_cm"]
        })

    # 6. Battery Cutoff
    bat_v = telemetry.get("battery_voltage", 12.0)
    if bat_v <= rules["battery_critical_voltage"] and bat_v > 1.0:
        compliance = "NON_COMPLIANT"
        alerts.append({
            "alert_type": "LOW_BATTERY",
            "severity": "CRITICAL",
            "message": f"CRITICAL BATTERY: Pack voltage ({bat_v:.2f}V) below deep discharge threshold! Return rover immediately.",
            "value": bat_v,
            "threshold": rules["battery_critical_voltage"]
        })
    elif bat_v <= rules["battery_low_voltage"] and bat_v > 1.0:
        alerts.append({
            "alert_type": "LOW_BATTERY",
            "severity": "WARNING",
            "message": f"Low Battery: Pack voltage at {bat_v:.2f}V ({telemetry.get('battery_percent', 25):.0f}%).",
            "value": bat_v,
            "threshold": rules["battery_low_voltage"]
        })

    # 7. Survivor Signal Alert
    if telemetry.get("acoustic_tapping_detected", False) or telemetry.get("ai_detected_survivors", 0) > 0:
        survivors = telemetry.get("ai_detected_survivors", 0)
        alerts.append({
            "alert_type": "SURVIVOR",
            "severity": "CRITICAL",
            "message": f"SURVIVOR DETECTED! Visual: {survivors} person(s), Acoustic Tapping: {'YES' if telemetry.get('acoustic_tapping_detected') else 'NO'}. Initiate rescue protocol.",
            "value": float(survivors),
            "threshold": 1.0
        })

    return {
        "compliance_status": compliance,
        "alerts": alerts
    }

def classify_survivor_triage(thermal_max_c: float, tapping_detected: bool, visual_detected: int, co_ppm: float) -> str:
    """
    AI Survivor Triage Classification for Underground Mine Disasters
    Categories:
    - PRIORITY_1_RED: Immediate life threat (trapped, heat signature confirmed, tapping heard, toxic environment)
    - PRIORITY_2_YELLOW: Delayed / Stable (responsive or sheltered from direct flame/CO)
    - PRIORITY_3_GREEN: Minor / Ambulatory (mobile survivor detected in safe atmosphere)
    - NONE: No human activity detected
    """
    has_human_signal = (visual_detected > 0) or tapping_detected or (34.0 <= thermal_max_c <= 39.5)

    if not has_human_signal:
        return "NONE"

    # If toxic atmosphere is high (>30 ppm CO) or body heat detected with tapping in rubble
    if co_ppm >= 30.0 or (tapping_detected and visual_detected == 0):
        return "PRIORITY_1_RED (Immediate Rescue Required)"

    if visual_detected > 0 and 34.0 <= thermal_max_c <= 39.5:
        return "PRIORITY_2_YELLOW (Stable / Trapped Survivor Located)"

    return "PRIORITY_3_GREEN (Ambulatory Survivor Detected)"
