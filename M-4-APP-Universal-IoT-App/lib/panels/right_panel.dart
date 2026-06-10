// lib/panels/right_panel.dart
// Camera feed (MJPEG), aim joystick, shoot button, camera toggle

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_mjpeg/flutter_mjpeg.dart';
import '../providers/car_provider.dart';
import '../services/esp32_service.dart';
import '../widgets/analog_joystick.dart';

class RightPanel extends ConsumerWidget {
  const RightPanel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cameraOn = ref.watch(carProvider.select((s) => s.cameraOn));
    final shooting = ref.watch(carProvider.select((s) => s.isShooting));
    final notifier = ref.read(carProvider.notifier);
    final mjpegUrl = ref.read(esp32ServiceProvider).mjpegUrl;

    return Container(
      margin: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFF0D0620),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF1E3A5F), width: 2.5),
      ),
      child: Row(
        children: [
          // ── Camera Feed ───────────────────────────────────
          Expanded(
            flex: 5,
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    // Feed or placeholder
                    cameraOn
                        ? Mjpeg(
                            isLive: true,
                            stream: mjpegUrl,
                            fit: BoxFit.cover,
                            loading: (_) => const _CamPlaceholder(),
                            error: (_, __, ___) => const _CamError(),
                          )
                        : const _CamPlaceholder(),

                    // Camera toggle button (bottom-right corner)
                    Positioned(
                      bottom: 8,
                      right: 8,
                      child: _CamToggle(
                        isOn: cameraOn,
                        onTap: notifier.toggleCamera,
                      ),
                    ),

                    // "LIVE" badge when camera on
                    if (cameraOn)
                      Positioned(
                        top: 8,
                        left: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.red.shade700,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.circle, color: Colors.white, size: 8),
                              SizedBox(width: 4),
                              Text(
                                'LIVE',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),

          // ── Aim + Shoot sidebar ────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                const Text(
                  'AIM',
                  style: TextStyle(
                    color: Colors.white24,
                    fontSize: 9,
                    letterSpacing: 2,
                    fontWeight: FontWeight.w700,
                  ),
                ),

                // Aim joystick
                LayoutBuilder(
                  builder: (ctx, constraints) {
                    return AnalogJoystick(
                      size: 90,
                      ringColor: const Color(0xFF1E3A5F),
                      thumbColor: const Color(0xFFFF4444),
                      bgColor: const Color(0xff12052499),
                      onChanged: (x, y) => notifier.setCamJoy(x, y),
                      onReleased: notifier.resetCamJoy,
                    );
                  },
                ),

                // SHOOT button
                GestureDetector(
                  onTapDown: (_) => notifier.setShooting(true),
                  onTapUp: (_) => notifier.setShooting(false),
                  onTapCancel: () => notifier.setShooting(false),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 100),
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: shooting
                          ? const Color(0xFFFF2222)
                          : const Color(0xFF5C1010),
                      border: Border.all(
                        color: shooting
                            ? const Color(0xFFFF6666)
                            : const Color(0xFFAA2222),
                        width: 2.5,
                      ),
                      boxShadow: shooting
                          ? [
                              BoxShadow(
                                color: Colors.red.withOpacity(0.6),
                                blurRadius: 18,
                                spreadRadius: 4,
                              ),
                            ]
                          : [],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.gps_fixed_rounded,
                          color: shooting ? Colors.white : Colors.red.shade300,
                          size: 22,
                        ),
                        Text(
                          'FIRE',
                          style: TextStyle(
                            fontSize: 9,
                            color:
                                shooting ? Colors.white : Colors.red.shade300,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 6),
        ],
      ),
    );
  }
}

// ── Subwidgets ────────────────────────────────────────────────

class _CamPlaceholder extends StatelessWidget {
  const _CamPlaceholder();
  @override
  Widget build(BuildContext context) => Container(
        color: const Color(0xFF0A0318),
        child: const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.videocam_off_rounded,
                  color: Color(0xFF3D2060), size: 48),
              SizedBox(height: 8),
              Text(
                'CAMERA OFF',
                style: TextStyle(
                  color: Color(0xFF3D2060),
                  letterSpacing: 3,
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ),
      );
}

class _CamError extends StatelessWidget {
  const _CamError();
  @override
  Widget build(BuildContext context) => Container(
        color: const Color(0xFF0A0318),
        child: const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.signal_wifi_statusbar_connected_no_internet_4_rounded,
                color: Color(0xFF8B0000),
                size: 40,
              ),
              SizedBox(height: 8),
              Text(
                'NO SIGNAL',
                style: TextStyle(color: Color(0xFF8B0000), letterSpacing: 2),
              ),
            ],
          ),
        ),
      );
}

class _CamToggle extends StatelessWidget {
  final bool isOn;
  final VoidCallback onTap;
  const _CamToggle({required this.isOn, required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: isOn ? Colors.black54 : const Color(0xFF2D1B4E),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isOn ? Colors.greenAccent : Colors.white24,
              width: 1.5,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isOn ? Icons.videocam_rounded : Icons.videocam_off_rounded,
                color: isOn ? Colors.greenAccent : Colors.white38,
                size: 14,
              ),
              const SizedBox(width: 4),
              Text(
                isOn ? 'ON' : 'OFF',
                style: TextStyle(
                  fontSize: 10,
                  color: isOn ? Colors.greenAccent : Colors.white38,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      );
}
