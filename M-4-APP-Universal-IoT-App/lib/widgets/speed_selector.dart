// lib/widgets/speed_selector.dart

import 'package:flutter/material.dart';

class SpeedSelector extends StatelessWidget {
  final int selected;
  final void Function(int) onSelect;

  const SpeedSelector({
    super.key,
    required this.selected,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: List.generate(5, (i) {
        final speed = 5 - i; // 5 at top, 1 at bottom
        final isSelected = speed == selected;
        return GestureDetector(
          onTap: () => onSelect(speed),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            width: isSelected ? 48 : 38,
            height: isSelected ? 48 : 38,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isSelected
                  ? const Color(0xFFFFE000)
                  : const Color(0xFF2D1B4E),
              border: Border.all(
                color: isSelected
                    ? const Color(0xFFFFE000)
                    : const Color(0xFF5A3D8A),
                width: isSelected ? 2.5 : 1.5,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: const Color(0xFFFFE000).withOpacity(0.45),
                        blurRadius: 12,
                        spreadRadius: 2,
                      ),
                    ]
                  : [],
            ),
            child: Center(
              child: Text(
                '$speed',
                style: TextStyle(
                  fontSize: isSelected ? 18 : 14,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? const Color(0xFF120524) : Colors.white60,
                ),
              ),
            ),
          ),
        );
      }),
    );
  }
}
