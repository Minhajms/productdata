#!/bin/bash

# Script to run all test files in sequence

echo "==================================================="
echo "Starting Product Data Enhancer Test Suite"
echo "==================================================="

# Ensure environment variables are available
if [ -z "$OPENROUTER_API_KEY" ]; then
  echo "WARNING: OPENROUTER_API_KEY is not set. Some tests may fail."
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "WARNING: OPENAI_API_KEY is not set. Some tests may fail."
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "WARNING: ANTHROPIC_API_KEY is not set. Some fallback tests may fail."
fi

if [ -z "$GEMINI_API_KEY" ]; then
  echo "WARNING: GEMINI_API_KEY is not set. Some fallback tests may fail."
fi

# Run CSV Format tests
echo -e "\n==================================================="
echo "Running CSV Format Tests"
echo "==================================================="
npx tsx test_csv_formats.ts

# Run OpenRouter API tests
echo -e "\n==================================================="
echo "Running OpenRouter API Tests"
echo "==================================================="
npx tsx test_openrouter_api.ts

# Run Product Type Detection tests
echo -e "\n==================================================="
echo "Running Product Type Detection Tests"
echo "==================================================="
npx tsx test_product_detection.ts

# Run Field Mapping tests
echo -e "\n==================================================="
echo "Running Field Mapping Tests"
echo "==================================================="
npx tsx test_field_mapping.ts

echo -e "\n==================================================="
echo "All tests completed. Check logs for detailed results."
echo "==================================================="