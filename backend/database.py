import sqlite3
import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), "mine_rover.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Telemetry Log Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS telemetry_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        battery_voltage REAL,
        battery_percent REAL,
        temperature_c REAL,
        humidity_pct REAL,
        pressure_hpa REAL,
        mq135_ppm REAL,
        mq7_ppm REAL,
        obstacle_distance_cm REAL,
        obstacle_detected INTEGER,
        audio_ambient_db REAL,
        acoustic_tapping_detected INTEGER,
        thermal_hotspots_count INTEGER,
        thermal_max_temp_c REAL,
        ai_detected_survivors INTEGER,
        motor_state TEXT,
        buzzer_active INTEGER,
        searchlight_active INTEGER
    )
    """)

    # Incident Alerts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incident_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        alert_type TEXT,
        severity TEXT,
        message TEXT,
        value REAL,
        threshold REAL
    )
    """)

    # Survivor Triage Records
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS survivor_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        triage_category TEXT,
        thermal_temp_c REAL,
        acoustic_detected INTEGER,
        visual_detected INTEGER,
        tunnel_sector TEXT,
        notes TEXT
    )
    """)

    conn.commit()
    conn.close()

def log_telemetry(data: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO telemetry_logs (
        battery_voltage, battery_percent, temperature_c, humidity_pct,
        pressure_hpa, mq135_ppm, mq7_ppm, obstacle_distance_cm, obstacle_detected,
        audio_ambient_db, acoustic_tapping_detected, thermal_hotspots_count,
        thermal_max_temp_c, ai_detected_survivors, motor_state, buzzer_active, searchlight_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("battery_voltage", 0.0),
        data.get("battery_percent", 0.0),
        data.get("temperature_c", 25.0),
        data.get("humidity_pct", 60.0),
        data.get("pressure_hpa", 1013.25),
        data.get("mq135_ppm", 150.0),
        data.get("mq7_ppm", 5.0),
        data.get("obstacle_distance_cm", 100.0),
        1 if data.get("obstacle_detected") else 0,
        data.get("audio_ambient_db", 40.0),
        1 if data.get("acoustic_tapping_detected") else 0,
        data.get("thermal_hotspots_count", 0),
        data.get("thermal_max_temp_c", 25.0),
        data.get("ai_detected_survivors", 0),
        data.get("motor_state", "STOPPED"),
        1 if data.get("buzzer_active") else 0,
        1 if data.get("searchlight_active") else 0
    ))
    conn.commit()
    conn.close()

def log_alert(alert: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO incident_alerts (alert_type, severity, message, value, threshold)
    VALUES (?, ?, ?, ?, ?)
    """, (
        alert.get("alert_type"),
        alert.get("severity"),
        alert.get("message"),
        alert.get("value"),
        alert.get("threshold")
    ))
    conn.commit()
    conn.close()

def get_recent_telemetry(limit: int = 60) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM telemetry_logs ORDER BY id DESC LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in reversed(rows)]

def get_recent_alerts(limit: int = 20) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM incident_alerts ORDER BY id DESC LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
