// lib/providers/car_provider.dart
// ─────────────────────────────────────────────────────────────
// Riverpod NotifierProvider — single source of truth.
// Every mutation automatically transmits state to ESP32.
// ─────────────────────────────────────────────────────────────

import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/car_state.dart';
import '../services/esp32_service.dart';

// ── Service provider ──────────────────────────────────────────
final esp32ServiceProvider = Provider<Esp32Service>((ref) {
  final svc = Esp32Service();
  ref.onDispose(svc.dispose);
  return svc;
});

// ── Car Notifier ──────────────────────────────────────────────
class CarNotifier extends Notifier<CarState> {
  late Esp32Service _svc;
  Timer? _txTimer;

  @override
  CarState build() {
    _svc = ref.read(esp32ServiceProvider);

    // Wire callbacks
    _svc.onConnectionChanged = (connected) {
      state = state.copyWith(isConnected: connected);
    };
    _svc.onGpsData = (lat, lng) {
      state = state.copyWith(gpsLat: lat, gpsLng: lng);
    };

    // Init network
    _svc.init();

    // High-frequency TX timer (20 Hz)
    _txTimer = Timer.periodic(const Duration(milliseconds: 50), (_) {
      _svc.sendState(state.toJson());
    });

    ref.onDispose(() => _txTimer?.cancel());
    return const CarState();
  }

  // ── Joystick (Movement) ───────────────────────────────────
  void setJoy(double x, double y) {
    state = state.copyWith(joyX: x, joyY: y);
  }

  void resetJoy() => state = state.copyWith(joyX: 0, joyY: 0);

  // ── Steering Arrows ───────────────────────────────────────
  void setSteering(int dir) => state = state.copyWith(steeringDir: dir);

  // ── Speed ─────────────────────────────────────────────────
  void setSpeed(int speed) =>
      state = state.copyWith(carSpeed: speed.clamp(1, 5));

  // ── Camera Joystick ───────────────────────────────────────
  void setCamJoy(double x, double y) =>
      state = state.copyWith(camX: x, camY: y);
  void resetCamJoy() => state = state.copyWith(camX: 0, camY: 0);

  // ── Shoot ─────────────────────────────────────────────────
  void setShooting(bool v) => state = state.copyWith(isShooting: v);

  // ── Camera Toggle ─────────────────────────────────────────
  void toggleCamera() => state = state.copyWith(cameraOn: !state.cameraOn);

  // ── Boolean Toggles ───────────────────────────────────────
  void toggleLight() => state = state.copyWith(lightOn: !state.lightOn);
  void toggleSound() => state = state.copyWith(soundOn: !state.soundOn);
  void toggleBtn1() => state = state.copyWith(btn1: !state.btn1);
  void toggleBtn2() => state = state.copyWith(btn2: !state.btn2);
  void toggleBtn3() => state = state.copyWith(btn3: !state.btn3);
  void toggleGps() => state = state.copyWith(gpsOn: !state.gpsOn);
}

final carProvider = NotifierProvider<CarNotifier, CarState>(CarNotifier.new);
