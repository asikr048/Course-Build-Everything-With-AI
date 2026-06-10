import 'package:flutter_test/flutter_test.dart'; // This line fixes testWidgets
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:myapp/main.dart'; // This relative import fixes the main.dart error

void main() {
  testWidgets('App loads smoke test', (WidgetTester tester) async {
    // We wrap SmartCarApp in ProviderScope just like we did in main.dart
    await tester.pumpWidget(const ProviderScope(child: SmartCarApp()));

    // Verify that our title text is on the screen
    expect(find.text('Smart Car'), findsOneWidget);
  });
}