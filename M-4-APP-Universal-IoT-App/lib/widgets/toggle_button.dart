// lib/widgets/toggle_button.dart

import 'package:flutter/material.dart';

class CarToggleButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isOn;
  final VoidCallback onTap;

  const CarToggleButton({
    super.key,
    required this.label,
    required this.icon,
    required this.isOn,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isOn
                    ? const Color(0xFFFFE000).withOpacity(0.2)
                    : const Color(0xFF2D1B4E),
                border: Border.all(
                  color: isOn
                      ? const Color(0xFFFFE000)
                      : const Color(0xFF5A3D8A),
                  width: 2,
                ),
                boxShadow: isOn
                    ? [
                        BoxShadow(
                          color: const Color(0xFFFFE000).withOpacity(0.3),
                          blurRadius: 10,
                          spreadRadius: 1,
                        ),
                      ]
                    : [],
              ),
              child: Icon(
                icon,
                color: isOn ? const Color(0xFFFFE000) : Colors.white38,
                size: 22,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 9,
                color: isOn ? const Color(0xFFFFE000) : Colors.white38,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
