// lib/screens/home_screen.dart
// ─────────────────────────────────────────────────────────────
// Root screen.
// Column:  Header (10%) | Content Row (70%) | Toolbar (20%)
// Content Row: LeftPanel(Flex 3) | CenterPanel(Flex 1) | RightPanel(Flex 4)
// ─────────────────────────────────────────────────────────────

import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/car_provider.dart';
import '../panels/left_panel.dart';
import '../panels/center_panel.dart';
import '../panels/right_panel.dart';
import '../panels/bottom_toolbar.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isConnected = ref.watch(carProvider.select((s) => s.isConnected));

    return Scaffold(
      backgroundColor: const Color(0xFF120524),
      body: SafeArea(
        child: Stack(
          children: [
            // ── Star field background ─────────────────────────
            const _StarField(),

            // ── Main layout ───────────────────────────────────
            Column(
              children: [
                // Header — 10%
                Expanded(flex: 10, child: _Header(isConnected: isConnected)),

                // Content row — 70%
                const Expanded(
                  flex: 70,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(flex: 3, child: LeftPanel()),
                      Expanded(flex: 1, child: CenterPanel()),
                      Expanded(flex: 4, child: RightPanel()),
                    ],
                  ),
                ),

                // Bottom toolbar — 20%
                const Expanded(flex: 20, child: BottomToolbar()),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Header ─────────────────────────────────────────────────────
class _Header extends StatelessWidget {
  final bool isConnected;
  const _Header({required this.isConnected});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFF2D1B4E), width: 1)),
      ),
      child: Row(
        children: [
          // Back button
          GestureDetector(
            onTap: () => Navigator.maybePop(context),
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFFFE000).withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: const Color(0xFFFFE000).withOpacity(0.5),
                  width: 1.5,
                ),
              ),
              child: const Icon(
                Icons.arrow_back_ios_new_rounded,
                color: Color(0xFFFFE000),
                size: 16,
              ),
            ),
          ),

          // Title
          const Expanded(
            child: Center(
              child: Text(
                'SMART CAR CONTROLLER',
                style: TextStyle(
                  color: Color(0xFFFFE000),
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 3,
                ),
              ),
            ),
          ),

          // Connection status
          Row(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 400),
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isConnected ? Colors.greenAccent : Colors.redAccent,
                  boxShadow: [
                    BoxShadow(
                      color:
                          (isConnected ? Colors.greenAccent : Colors.redAccent)
                              .withOpacity(0.6),
                      blurRadius: 8,
                      spreadRadius: 2,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text(
                isConnected ? 'CONNECTED' : 'DISCONNECTED',
                style: TextStyle(
                  fontSize: 10,
                  color: isConnected ? Colors.greenAccent : Colors.redAccent,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Starfield Background ───────────────────────────────────────
class _StarField extends StatelessWidget {
  const _StarField();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(painter: _StarPainter(), child: const SizedBox.expand());
  }
}

class _StarPainter extends CustomPainter {
  static final List<_Star> _stars = _generateStars(120);

  static List<_Star> _generateStars(int count) {
    final rng = Random(42);
    return List.generate(
      count,
      (_) => _Star(
        x: rng.nextDouble(),
        y: rng.nextDouble(),
        r: rng.nextDouble() * 1.2 + 0.3,
        opacity: rng.nextDouble() * 0.5 + 0.1,
      ),
    );
  }

  @override
  void paint(Canvas canvas, Size size) {
    for (final s in _stars) {
      canvas.drawCircle(
        Offset(s.x * size.width, s.y * size.height),
        s.r,
        Paint()..color = Colors.white.withOpacity(s.opacity),
      );
    }
  }

  @override
  bool shouldRepaint(_StarPainter old) => false;
}

class _Star {
  final double x, y, r, opacity;
  const _Star({
    required this.x,
    required this.y,
    required this.r,
    required this.opacity,
  });
}
