// lib/models/car_state.dart
// ─────────────────────────────────────────────────────────────
// Single source-of-truth for every variable transmitted to ESP32
// ─────────────────────────────────────────────────────────────

class CarState {
  // ── Movement ──────────────────────────────────────────────
  final double joyX; // -255 … 255
  final double joyY; // -255 … 255
  final int steeringDir; // -1 left | 0 neutral | 1 right

  // ── Speed ─────────────────────────────────────────────────
  final int carSpeed; // 1 … 5

  // ── Camera / Aiming ───────────────────────────────────────
  final double camX; // -255 … 255
  final double camY; // -255 … 255
  final bool isShooting;
  final bool cameraOn;

  // ── Toggles ───────────────────────────────────────────────
  final bool lightOn;
  final bool soundOn;
  final bool btn1;
  final bool btn2;
  final bool btn3;
  final bool gpsOn;

  // ── Telemetry (received from ESP32) ───────────────────────
  final double? gpsLat;
  final double? gpsLng;
  final bool isConnected;

  const CarState({
    this.joyX = 0,
    this.joyY = 0,
    this.steeringDir = 0,
    this.carSpeed = 1,
    this.camX = 0,
    this.camY = 0,
    this.isShooting = false,
    this.cameraOn = false,
    this.lightOn = false,
    this.soundOn = false,
    this.btn1 = false,
    this.btn2 = false,
    this.btn3 = false,
    this.gpsOn = false,
    this.gpsLat,
    this.gpsLng,
    this.isConnected = false,
  });

  CarState copyWith({
    double? joyX,
    double? joyY,
    int? steeringDir,
    int? carSpeed,
    double? camX,
    double? camY,
    bool? isShooting,
    bool? cameraOn,
    bool? lightOn,
    bool? soundOn,
    bool? btn1,
    bool? btn2,
    bool? btn3,
    bool? gpsOn,
    double? gpsLat,
    double? gpsLng,
    bool? isConnected,
  }) {
    return CarState(
      joyX: joyX ?? this.joyX,
      joyY: joyY ?? this.joyY,
      steeringDir: steeringDir ?? this.steeringDir,
      carSpeed: carSpeed ?? this.carSpeed,
      camX: camX ?? this.camX,
      camY: camY ?? this.camY,
      isShooting: isShooting ?? this.isShooting,
      cameraOn: cameraOn ?? this.cameraOn,
      lightOn: lightOn ?? this.lightOn,
      soundOn: soundOn ?? this.soundOn,
      btn1: btn1 ?? this.btn1,
      btn2: btn2 ?? this.btn2,
      btn3: btn3 ?? this.btn3,
      gpsOn: gpsOn ?? this.gpsOn,
      gpsLat: gpsLat ?? this.gpsLat,
      gpsLng: gpsLng ?? this.gpsLng,
      isConnected: isConnected ?? this.isConnected,
    );
  }

  /// Serialise to JSON-encoded byte array for transmission
  Map<String, dynamic> toJson() => {
    'jX': joyX.round(),
    'jY': joyY.round(),
    'sd': steeringDir,
    'sp': carSpeed,
    'cX': camX.round(),
    'cY': camY.round(),
    'sh': isShooting ? 1 : 0,
    'li': lightOn ? 1 : 0,
    'so': soundOn ? 1 : 0,
    'b1': btn1 ? 1 : 0,
    'b2': btn2 ? 1 : 0,
    'b3': btn3 ? 1 : 0,
  };
}
