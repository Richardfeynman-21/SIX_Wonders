import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from typing import Dict, Any, List

def generate_incident_briefing_pdf(
    rover_status: Dict[str, Any],
    recent_telemetry: List[Dict[str, Any]],
    alerts: List[Dict[str, Any]],
    mission_notes: str = "Reconnaissance in Sector 4B — Smoldering fire & collapsed drift assessment."
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0F172A'),
        alignment=1
    )
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569'),
        alignment=1
    )
    heading2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )
    bold_label_style = ParagraphStyle(
        'BoldLabel',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor('#0F172A')
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("MINISTRY OF COAL / DGMS COMPLIANCE BRIEFING", subtitle_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("UNDERGROUND MINE RESCUE MISSION INCIDENT REPORT", title_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(
        f"Autonomous Robotic Assessment • Jharia Coalfield, Jharkhand • {datetime.now().strftime('%d %b %Y, %H:%M:%S IST')}",
        subtitle_style
    ))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#DC2626'), spaceAfter=12))

    # Mission Metadata Grid
    meta_data = [
        [
            Paragraph("<b>Rover Deployment ID:</b>", body_style),
            Paragraph(str(rover_status.get("rover_id", "MINER-ROVER-01")), body_style),
            Paragraph("<b>DGMS Safety Status:</b>", body_style),
            Paragraph(f"<font color='{colors.HexColor('#DC2626') if rover_status.get('dgms_compliance_status') != 'COMPLIANT' else colors.HexColor('#16A34A')}'><b>{rover_status.get('dgms_compliance_status', 'COMPLIANT')}</b></font>", body_style)
        ],
        [
            Paragraph("<b>Primary Power Rail:</b>", body_style),
            Paragraph(f"{rover_status.get('battery_voltage', 11.8):.2f} V ({rover_status.get('battery_percent', 75):.0f}%)", body_style),
            Paragraph("<b>Survivor Triage Level:</b>", body_style),
            Paragraph(f"<b>{rover_status.get('survivor_triage_priority', 'NONE')}</b>", body_style)
        ],
        [
            Paragraph("<b>Sector / Drift Location:</b>", body_style),
            Paragraph("Sector 4B (Dhanbad Strata)", body_style),
            Paragraph("<b>Surface Link Mode:</b>", body_style),
            Paragraph("Local High-Gain Wi-Fi Telemetry", body_style)
        ]
    ]

    meta_table = Table(meta_data, colWidths=[1.8*inch, 2.0*inch, 1.8*inch, 2.0*inch])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 12))

    # Gas & Microclimate Profile
    elements.append(Paragraph("1. ATMOSPHERIC & GAS HAZARD ANALYSIS", heading2_style))
    
    co_val = rover_status.get("mq7_ppm", 0.0)
    air_val = rover_status.get("mq135_ppm", 0.0)
    temp_val = rover_status.get("temperature_c", 25.0)
    hum_val = rover_status.get("humidity_pct", 60.0)
    press_val = rover_status.get("pressure_hpa", 1013.25)

    gas_data = [
        ["Hazard Parameter", "Current Value", "DGMS Permissible Limit", "Status Assessment"],
        [
            "Carbon Monoxide (CO / MQ-7)",
            f"{co_val:.1f} ppm",
            "50.0 ppm (Statutory Max)",
            "CRITICAL" if co_val >= 50 else ("WARNING" if co_val >= 25 else "SAFE")
        ],
        [
            "Air Quality / Smoke (MQ-135)",
            f"{air_val:.1f} ppm",
            "400.0 ppm (Normal Intake)",
            "HAZARDOUS" if air_val >= 800 else ("ELEVATED" if air_val >= 400 else "NORMAL")
        ],
        [
            "Tunnel Ambient Temperature",
            f"{temp_val:.1f} °C",
            "30.5 °C (Wet-Bulb Stress)",
            "OVERHEATING" if temp_val >= 34 else ("ELEVATED" if temp_val >= 30.5 else "NOMINAL")
        ],
        [
            "Relative Humidity",
            f"{hum_val:.1f} %",
            "< 90% (Inundation Risk)",
            "HIGH DAMP" if hum_val >= 85 else "NORMAL"
        ],
        [
            "Barometric Pressure",
            f"{press_val:.1f} hPa",
            "± 15 hPa Nominal Delta",
            "STRATA SHIFT" if abs(press_val - 1013.25) >= 15 else "STABLE"
        ]
    ]

    gas_table = Table(gas_data, colWidths=[2.4*inch, 1.4*inch, 2.0*inch, 1.8*inch])
    gas_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(gas_table)
    elements.append(Spacer(1, 12))

    # Survivor Detection & Acoustic Intercom Summary
    elements.append(Paragraph("2. SURVIVOR DETECTION & ACOUSTIC TRIAGE LOG", heading2_style))
    survivor_text = (
        f"<b>Visual Detections:</b> {rover_status.get('ai_detected_survivors', 0)} worker(s) recognized via edge AI model.<br/>"
        f"<b>Acoustic Tapping / Voice:</b> {'CONFIRMED (Periodic rhythm detected by INMP441)' if rover_status.get('acoustic_tapping_detected') else 'None recorded at this timestamp'}.<br/>"
        f"<b>Thermal Signature:</b> Peak heat hotspot at {rover_status.get('thermal_max_temp_c', 25.0):.1f} °C "
        f"({rover_status.get('thermal_hotspots_count', 0)} thermal anomaly zones identified)."
    )
    elements.append(Paragraph(survivor_text, body_style))
    elements.append(Spacer(1, 10))

    # Active Incident Alerts Table
    elements.append(Paragraph("3. CHRONOLOGICAL SAFETY ALERTS & SYSTEM EVENTS", heading2_style))
    alert_rows = [["Timestamp", "Severity", "Alert Type", "Dispatched Warning Message"]]
    
    if alerts:
        for a in alerts[:6]:
            alert_rows.append([
                str(a.get("timestamp", ""))[-8:],
                str(a.get("severity", "INFO")),
                str(a.get("alert_type", "GENERAL")),
                Paragraph(str(a.get("message", "")), body_style)
            ])
    else:
        alert_rows.append(["--", "NOMINAL", "NONE", Paragraph("No active statutory violations recorded.", body_style)])

    alert_table = Table(alert_rows, colWidths=[1.1*inch, 1.1*inch, 1.6*inch, 3.8*inch])
    alert_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#334155')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(alert_table)
    elements.append(Spacer(1, 16))

    # Signoff Box
    sign_data = [
        [
            Paragraph("<b>Autonomous Mine Rescue System:</b> Certified Tier 3 Edge-AI Architecture", body_style),
            Paragraph("<b>Incident Commander / Safety Officer:</b> ___________________________", body_style)
        ],
        [
            Paragraph("<i>Automated output generated by SIH Mine Safety Rover System.</i>", subtitle_style),
            Paragraph("<i>Signature & Official DGMS Authorization Stamp</i>", subtitle_style)
        ]
    ]
    sign_table = Table(sign_data, colWidths=[4.2*inch, 3.4*inch])
    elements.append(sign_table)

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
