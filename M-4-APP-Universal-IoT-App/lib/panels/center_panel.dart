// lib/panels/center_panel.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/car_provider.dart';
import '../widgets/speed_selector.dart';

class CenterPanel extends ConsumerWidget {
  const CenterPanel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final speed    = ref.watch(carProvider.select((s) => s.carSpeed));
    final notifier = ref.read(carProvider.notifier);

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF1A0A35),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF3D2060), width: 1.5),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text(
            'SPD',
            style: TextStyle(
              color: Colors.white24,
              fontSize: 9,
              letterSpacing: 3,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: SpeedSelector(
              selected: speed,
              onSelect: notifier.setSpeed,
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}