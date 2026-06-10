// lib/services/esp32_service.dart
// ─────────────────────────────────────────────────────────────
// Handles:
//  • UDP socket for low-latency state transmission (10–20 Hz)
//  • TCP telemetry listener for GPS data from ESP32
//  • MJPEG stream URL exposed for the UI layer
// ─────────────────────────────────────────────────────────────

import 'dart:async';
import 'dart:convert';
import 'dart:io';

typedef GpsCallback = void Function(double lat, double lng);
typedef ConnectionCallback = void Function(bool connected);

class Esp32Service {
  // ── Configuration ─────────────────────────────────────────
  static const String esp32Ip = '192.168.4.1'; // ESP32 AP default
  static const int cmdPort = 4210; // UDP command port
  static const int telemetryPort = 4211; // TCP telemetry port
  static const int mjpegPort = 81; // HTTP MJPEG port

  String get mjpegUrl => 'http://$esp32Ip:$mjpegPort/stream';

  // ── Internals ─────────────────────────────────────────────
  RawDatagramSocket? _udpSocket;
  Socket? _tcpSocket;
  Timer? _heartbeatTimer;
  Timer? _reconnectTimer;
  bool _disposed = false;

  // ── Callbacks ─────────────────────────────────────────────
  GpsCallback? onGpsData;
  ConnectionCallback? onConnectionChanged;

  // ── Lifecycle ─────────────────────────────────────────────

  Future<void> init() async {
    await _bindUdp();
    await _connectTcp();
  }

  Future<void> _bindUdp() async {
    try {
      _udpSocket = await RawDatagramSocket.bind(InternetAddress.anyIPv4, 0);
      _udpSocket!.broadcastEnabled = false;
    } catch (e) {
      _scheduleReconnect();
    }
  }

  Future<void> _connectTcp() async {
    try {
      _tcpSocket = await Socket.connect(
        esp32Ip,
        telemetryPort,
        timeout: const Duration(seconds: 3),
      );
      _tcpSocket!.setOption(SocketOption.tcpNoDelay, true);

      onConnectionChanged?.call(true);

      _tcpSocket!
          .cast<List<int>>() // Tell Dart to treat the stream as List<int>
          .transform(utf8.decoder)
          .transform(const LineSplitter())
          .listen(
            _parseTelemetry,
            onError: (_) => _onTcpError(),
            onDone: _onTcpError,
          );

      _heartbeatTimer?.cancel();
      _heartbeatTimer = Timer.periodic(
        const Duration(seconds: 2),
        (_) => _tcpSocket?.add(utf8.encode('PING\n')),
      );
    } catch (_) {
      onConnectionChanged?.call(false);
      _scheduleReconnect();
    }
  }

  void _onTcpError() {
    onConnectionChanged?.call(false);
    _tcpSocket?.destroy();
    _tcpSocket = null;
    _heartbeatTimer?.cancel();
    _scheduleReconnect();
  }

  void _scheduleReconnect() {
    if (_disposed) return;
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 4), () {
      if (!_disposed) _connectTcp();
    });
  }

  // ── GPS Telemetry parser ───────────────────────────────────
  // Expected format from ESP32:  GPS:12.3456,98.7654
  void _parseTelemetry(String line) {
    if (line.startsWith('GPS:')) {
      final parts = line.substring(4).split(',');
      if (parts.length == 2) {
        final lat = double.tryParse(parts[0]);
        final lng = double.tryParse(parts[1]);
        if (lat != null && lng != null) {
          onGpsData?.call(lat, lng);
        }
      }
    }
  }

  // ── Command Transmission ──────────────────────────────────
  /// Send current [CarState] JSON as a UDP datagram
  void sendState(Map<String, dynamic> json) {
    if (_udpSocket == null) return;
    final payload = utf8.encode(jsonEncode(json));
    _udpSocket!.send(payload, InternetAddress(esp32Ip), cmdPort);
  }

  // ── Cleanup ───────────────────────────────────────────────
  void dispose() {
    _disposed = true;
    _heartbeatTimer?.cancel();
    _reconnectTimer?.cancel();
    _udpSocket?.close();
    _tcpSocket?.destroy();
  }
}
