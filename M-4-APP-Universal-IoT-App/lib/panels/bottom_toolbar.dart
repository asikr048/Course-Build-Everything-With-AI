// lib/panels/bottom_toolbar.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/car_provider.dart';
import '../widgets/toggle_button.dart';

class BottomToolbar extends ConsumerWidget {
  const BottomToolbar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(carProvider);
    final notifier = ref.read(carProvider.notifier);

    return Stack(
      children: [
        // ── Toolbar strip ────────────────────────────────────
        Container(
          decoration: const BoxDecoration(
            color: Color(0xFF130826),
            border: Border(
              top: BorderSide(color: Color(0xFF2D1B4E), width: 1.5),
            ),
          ),
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            children: [
              CarToggleButton(
                label: 'LIGHT',
                icon: Icons.lightbulb_outline_rounded,
                isOn: state.lightOn,
                onTap: notifier.toggleLight,
              ),
              CarToggleButton(
                label: 'SOUND',
                icon: Icons.volume_up_rounded,
                isOn: state.soundOn,
                onTap: notifier.toggleSound,
              ),
              CarToggleButton(
                label: 'BTN 1',
                icon: Icons.radio_button_checked_rounded,
                isOn: state.btn1,
                onTap: notifier.toggleBtn1,
              ),
              CarToggleButton(
                label: 'BTN 2',
                icon: Icons.radio_button_checked_rounded,
                isOn: state.btn2,
                onTap: notifier.toggleBtn2,
              ),
              CarToggleButton(
                label: 'BTN 3',
                icon: Icons.radio_button_checked_rounded,
                isOn: state.btn3,
                onTap: notifier.toggleBtn3,
              ),
              CarToggleButton(
                label: 'GPS',
                icon: Icons.location_on_rounded,
                isOn: state.gpsOn,
                onTap: notifier.toggleGps,
              ),

              // Speed indicator badge
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        color: const Color(0xFF2D1B4E),
                        border: Border.all(
                          color: const Color(0xFFFFE000).withOpacity(0.5),
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.speed_rounded,
                            color: Color(0xFFFFE000),
                            size: 14,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'SPD ${state.carSpeed}',
                            style: const TextStyle(
                              color: Color(0xFFFFE000),
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Joy readout
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'X:${state.joyX.round()}  Y:${state.joyY.round()}',
                      style: const TextStyle(
                        color: Colors.white24,
                        fontSize: 9,
                        fontFamily: 'monospace',
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'CAM ${state.camX.round()},${state.camY.round()}',
                      style: const TextStyle(
                        color: Colors.white24,
                        fontSize: 9,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // ── GPS Overlay (only when gpsOn) ────────────────────
        if (state.gpsOn && state.gpsLat != null && state.gpsLng != null)
          Positioned(
            top: 0,
            right: 16,
            child: Transform.translate(
              offset: const Offset(0, -32),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFF0D1F0D).withOpacity(0.92),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: Colors.greenAccent.withOpacity(0.6),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.gps_fixed_rounded,
                      color: Colors.greenAccent,
                      size: 12,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'LAT ${state.gpsLat!.toStringAsFixed(5)}  '
                      'LNG ${state.gpsLng!.toStringAsFixed(5)}',
                      style: const TextStyle(
                        color: Colors.greenAccent,
                        fontSize: 10,
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}
