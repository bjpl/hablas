#!/usr/bin/env python3
"""
Voice Correctness Verification Script
Tests the is_spanish() function for accuracy
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from regenerate_all_resources_final import is_spanish


# Test cases
TEST_CASES = [
    # English phrases that SHOULD NOT be detected as Spanish
    ("Hi, I have your delivery", False, "Basic English greeting"),
    ("Are you Michael?", False, "English question with name"),
    ("Here's your order from Chipotle", False, "English with brand name"),
    ("Can you confirm the code, please?", False, "English polite request"),
    ("Have a great day!", False, "English farewell"),
    ("I'm outside, can you come out?", False, "English location phrase"),
    ("I left it at the door", False, "English past tense"),
    ("Thank you so much!", False, "English gratitude"),
    ("customer", False, "CRITICAL: Should NOT match 'tome'"),
    ("The customer is waiting", False, "English with 'customer'"),
    ("Good service for customers", False, "English plural 'customers'"),
    ("Customer service", False, "Common English phrase"),

    # Spanish phrases that SHOULD be detected as Spanish
    ("Hola, tengo su entrega", True, "Spanish greeting"),
    ("¿Usted es Michael?", True, "Spanish question"),
    ("Aquí está su pedido de Chipotle", True, "Spanish delivery phrase"),
    ("¿Puede confirmar el código, por favor?", True, "Spanish polite request"),
    ("¡Que tenga un excelente día!", True, "Spanish farewell"),
    ("Estoy afuera, ¿puede salir?", True, "Spanish location phrase"),
    ("Lo dejé en la puerta", True, "Spanish past tense"),
    ("¡Muchas gracias!", True, "Spanish gratitude"),
    ("tome", True, "Spanish verb (standalone)"),
    ("Por favor, tome el pedido", True, "Spanish with 'tome'"),

    # Edge cases
    ("", False, "Empty string"),
    ("Hi", False, "Very short English"),
    ("Hola", True, "Very short Spanish"),
    ("123", False, "Numbers only"),
    ("OK", False, "Universal acknowledgment"),
]


def run_tests():
    """Run all test cases and report results."""
    print("="*70)
    print("🧪 VOICE DETECTION ACCURACY TEST")
    print("="*70)
    print()

    passed = 0
    failed = 0
    failed_cases = []

    for i, (text, expected_spanish, description) in enumerate(TEST_CASES, 1):
        result = is_spanish(text)
        expected_label = "SPANISH" if expected_spanish else "ENGLISH"
        result_label = "SPANISH" if result else "ENGLISH"

        if result == expected_spanish:
            status = "✅ PASS"
            passed += 1
        else:
            status = "❌ FAIL"
            failed += 1
            failed_cases.append((text, expected_label, result_label, description))

        print(f"{status} | Test {i:2d}: {description}")
        print(f"         Text: '{text}'")
        print(f"         Expected: {expected_label}, Got: {result_label}")
        print()

    # Summary
    print("="*70)
    print("📊 TEST SUMMARY")
    print("="*70)
    print(f"✅ Passed: {passed}/{len(TEST_CASES)}")
    print(f"❌ Failed: {failed}/{len(TEST_CASES)}")
    print(f"📈 Accuracy: {passed/len(TEST_CASES)*100:.1f}%")
    print()

    if failed_cases:
        print("="*70)
        print("❌ FAILED TEST CASES:")
        print("="*70)
        for text, expected, got, desc in failed_cases:
            print(f"\n{desc}")
            print(f"  Text: '{text}'")
            print(f"  Expected: {expected}, Got: {got}")
        print()
    else:
        print("🎉 All tests passed! Voice detection is working correctly.")

    return failed == 0


def test_word_boundary_fix():
    """Specifically test the word boundary fix for 'customer' vs 'tome'."""
    print("="*70)
    print("🎯 WORD BOUNDARY FIX VERIFICATION")
    print("="*70)
    print()

    critical_tests = [
        ("customer", False, "Standalone 'customer'"),
        ("The customer is here", False, "Customer in sentence"),
        ("customers", False, "Plural form"),
        ("Customer service", False, "Common phrase"),
        ("tome", True, "Spanish verb 'tome'"),
        ("Por favor tome", True, "Spanish with 'tome'"),
        ("tome el pedido", True, "Spanish phrase with 'tome'"),
    ]

    all_passed = True

    for text, expected_spanish, description in critical_tests:
        result = is_spanish(text)
        expected_label = "SPANISH" if expected_spanish else "ENGLISH"
        result_label = "SPANISH" if result else "ENGLISH"

        if result == expected_spanish:
            print(f"✅ PASS: {description}")
        else:
            print(f"❌ FAIL: {description}")
            all_passed = False

        print(f"         '{text}' → {result_label} (expected {expected_label})")
        print()

    if all_passed:
        print("🎉 Word boundary fix is working correctly!")
        print("   'customer' will no longer be misdetected as Spanish.")
    else:
        print("⚠️  Word boundary fix needs adjustment")

    return all_passed


if __name__ == "__main__":
    print("\n")
    test_word_boundary_fix()
    print("\n")
    run_tests()
