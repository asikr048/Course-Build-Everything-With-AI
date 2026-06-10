// lib/widgets/analog_joystick.dart
// ─────────────────────────────────────────────────────────────
// Self-contained analog joystick.
// Outputs dx, dy in range [-255, 255].
// ─────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';

class AnalogJoystick extends StatefulWidget {
  final double size;
  final Color ringColor;
  final Color thumbColor;
  final Color bgColor;
  final void Function(double dx, double dy) onChanged;
  final VoidCallback onReleased;

  const AnalogJoystick({
    super.key,
    required this.size,
    required this.onChanged,
    required this.onReleased,
    this.ringColor   = const Color(0xFF2D1B4E),
    this.thumbColor  = const Color(0xFFFFE000),
    this.bgColor     = const Color(0xFF1A0A35),
  });

  @override
  State<AnalogJoystick> createState() => _AnalogJoystickState();
}

class _AnalogJoystickState extends State<AnalogJoystick> {
  Offset _thumbPos = Offset.zero;

  double get _radius => widget.size / 2;
  double get _thumbRadius => widget.size * 0.22;

  void _handleDrag(Offset localPos) {
    final center = Offset(_radius, _radius);
    var delta = localPos - center;
    if (delta.distance > _radius - _thumbRadius) {
      delta = delta / delta.distance * (_radius - _thumbRadius);
    }
    setState(() => _thumbPos = delta);

    final norm = _radius - _thumbRadius;
    final dx = (delta.dx / norm * 255).clamp(-255.0, 255.0);
    final dy = (-delta.dy / norm * 255).clamp(-255.0, 255.0); // invert Y
    widget.onChanged(dx, dy);
  }

  void _handleRelease() {
    setState(() => _thumbPos = Offset.zero);
    widget.onReleased();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanStart:  (d) => _handleDrag(d.localPosition),
      onPanUpdate: (d) => _handleDrag(d.localPosition),
      onPanEnd:    (_) => _handleRelease(),
      onPanCancel:     _handleRelease,
      child: SizedBox(
        width: widget.size,
        height: widget.size,
        child: CustomPaint(
          painter: _JoystickPainter(
            thumbPos:    _thumbPos,
            ringColor:   widget.ringColor,
            thumbColor:  widget.thumbColor,
            bgColor:     widget.bgColor,
            thumbRadius: _thumbRadius,
          ),
        ),
      ),
    );
  }
}

class _JoystickPainter extends CustomPainter {
  final Offset thumbPos;
  final Color ringColor, thumbColor, bgColor;
  final double thumbRadius;

  const _JoystickPainter({
    required this.thumbPos,
    required this.ringColor,
    required this.thumbColor,
    required this.bgColor,
    required this.thumbRadius,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    final r = size.width / 2;

    // Background circle
    canvas.drawCircle(center, r, Paint()..color = bgColor);

    // Thick outer ring with slight "hand-drawn" dash
    final ringPaint = Paint()
      ..color = ringColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = r * 0.18;
    canvas.drawCircle(center, r * 0.88, ringPaint);

    // Inner cross guides
    final guidePaint = Paint()
      ..color = ringColor.withOpacity(0.35)
      ..strokeWidth = 1.5;
    canvas.drawLine(center - Offset(r * 0.6, 0), center + Offset(r * 0.6, 0), guidePaint);
    canvas.drawLine(center - Offset(0, r * 0.6), center + Offset(0, r * 0.6), guidePaint);

    // Shadow under thumb
    canvas.drawCircle(
      center + thumbPos + const Offset(2, 3),
      thumbRadius,
      Paint()..color = Colors.black38,
    );

    // Thumb
    final thumbPaint = Paint()
      ..color = thumbColor
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center + thumbPos, thumbRadius, thumbPaint);

    // Thumb inner shine
    canvas.drawCircle(
      center + thumbPos - Offset(thumbRadius * 0.25, thumbRadius * 0.25),
      thumbRadius * 0.3,
      Paint()..color = Colors.white.withOpacity(0.3),
    );
  }

  @override
  bool shouldRepaint(_JoystickPainter old) => old.thumbPos != thumbPos;
}