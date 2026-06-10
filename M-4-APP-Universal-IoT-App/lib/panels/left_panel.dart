// lib/panels/left_panel.dart
// Movement joystick + L/R steering arrow buttons

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/car_provider.dart';
import '../widgets/analog_joystick.dart';

class LeftPanel extends ConsumerWidget {
  const LeftPanel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(carProvider.notifier);

    return Container(
      margin: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFF1A0A35),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF3D2060), width: 1.5),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // ── Panel Label ───────────────────────────────────
          const Padding(
            padding: EdgeInsets.only(top: 10),
            child: Text(
              'DRIVE',
              style: TextStyle(
                color: Colors.white24,
                fontSize: 10,
                letterSpacing: 3,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),

          // ── Joystick ──────────────────────────────────────
          Expanded(
            child: Center(
              child: LayoutBuilder(
                builder: (ctx, constraints) {
                  final size = (constraints.maxHeight * 0.75).clamp(
                    80.0,
                    200.0,
                  );
                  return AnalogJoystick(
                    size: size,
                    onChanged: (x, y) => notifier.setJoy(x, y),
                    onReleased: notifier.resetJoy,
                  );
                },
              ),
            ),
          ),

          // ── Steering Arrows ───────────────────────────────
          Padding(
            padding: const EdgeInsets.only(bottom: 14, left: 16, right: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _SteerButton(
                  icon: Icons.arrow_back_ios_rounded,
                  label: 'LEFT',
                  onPress: () => notifier.setSteering(-1),
                  onRelease: () => notifier.setSteering(0),
                ),
                _SteerButton(
                  icon: Icons.arrow_forward_ios_rounded,
                  label: 'RIGHT',
                  onPress: () => notifier.setSteering(1),
                  onRelease: () => notifier.setSteering(0),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SteerButton extends StatefulWidget {
  final IconData icon;
  final String label;
  final VoidCallback onPress;
  final VoidCallback onRelease;

  const _SteerButton({
    required this.icon,
    required this.label,
    required this.onPress,
    required this.onRelease,
  });

  @override
  State<_SteerButton> createState() => _SteerButtonState();
}

class _SteerButtonState extends State<_SteerButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) {
        setState(() => _pressed = true);
        widget.onPress();
      },
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onRelease();
      },
      onTapCancel: () {
        setState(() => _pressed = false);
        widget.onRelease();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: _pressed
              ? const Color(0xFFFFE000).withOpacity(0.25)
              : const Color(0xFF2D1B4E),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: _pressed ? const Color(0xFFFFE000) : const Color(0xFF5A3D8A),
            width: 2,
          ),
          boxShadow: _pressed
              ? [
                  BoxShadow(
                    color: const Color(0xFFFFE000).withOpacity(0.3),
                    blurRadius: 8,
                  ),
                ]
              : [],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              widget.icon,
              size: 16,
              color: _pressed ? const Color(0xFFFFE000) : Colors.white54,
            ),
            const SizedBox(width: 4),
            Text(
              widget.label,
              style: TextStyle(
                fontSize: 10,
                color: _pressed ? const Color(0xFFFFE000) : Colors.white54,
                fontWeight: FontWeight.bold,
                letterSpacing: 1,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
