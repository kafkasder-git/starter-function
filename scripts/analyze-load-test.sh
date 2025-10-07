#!/bin/bash

# ============================================================================
# LOAD TEST ANALYSIS SCRIPT
# ============================================================================
# Description: Analyze K6 load test results and generate report
# Usage: ./scripts/analyze-load-test.sh [results-file]
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default results file
RESULTS_FILE="${1:-load-test-results.json}"
REPORT_FILE="load-test-analysis-$(date +%Y%m%d_%H%M%S).md"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   LOAD TEST ANALYSIS${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if results file exists
if [ ! -f "$RESULTS_FILE" ]; then
    echo -e "${RED}Error: Results file not found: $RESULTS_FILE${NC}"
    echo "Run load tests first: npm run load:test"
    exit 1
fi

echo -e "${YELLOW}Analyzing results from: $RESULTS_FILE${NC}"
echo ""

# Create report header
cat > "$REPORT_FILE" <<EOF
# Load Test Analysis Report

**Generated:** $(date)  
**Results File:** $RESULTS_FILE

---

## Executive Summary

EOF

# Extract key metrics using jq (if available)
if command -v jq >/dev/null 2>&1; then
    echo -e "${YELLOW}Extracting metrics...${NC}"
    
    # Total requests
    TOTAL_REQUESTS=$(jq -r '.metrics.http_reqs.values.count // 0' "$RESULTS_FILE")
    
    # Failed requests
    FAILED_RATE=$(jq -r '.metrics.http_req_failed.values.rate // 0' "$RESULTS_FILE")
    FAILED_PERCENT=$(echo "$FAILED_RATE * 100" | bc -l | xargs printf "%.2f")
    
    # Response times
    AVG_RESPONSE=$(jq -r '.metrics.http_req_duration.values.avg // 0' "$RESULTS_FILE")
    P95_RESPONSE=$(jq -r '.metrics.http_req_duration.values["p(95)"] // 0' "$RESULTS_FILE")
    P99_RESPONSE=$(jq -r '.metrics.http_req_duration.values["p(99)"] // 0' "$RESULTS_FILE")
    MAX_RESPONSE=$(jq -r '.metrics.http_req_duration.values.max // 0' "$RESULTS_FILE")
    
    # VUs
    MAX_VUS=$(jq -r '.metrics.vus.values.max // 0' "$RESULTS_FILE")
    
    # Checks
    CHECKS_PASSED=$(jq -r '.metrics.checks.values.passes // 0' "$RESULTS_FILE")
    CHECKS_FAILED=$(jq -r '.metrics.checks.values.fails // 0' "$RESULTS_FILE")
    CHECKS_TOTAL=$((CHECKS_PASSED + CHECKS_FAILED))
    
    if [ $CHECKS_TOTAL -gt 0 ]; then
        CHECKS_RATE=$(echo "scale=2; $CHECKS_PASSED * 100 / $CHECKS_TOTAL" | bc)
    else
        CHECKS_RATE=0
    fi
    
    # Add to report
    cat >> "$REPORT_FILE" <<EOF
### Key Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Total Requests | $TOTAL_REQUESTS | ✓ |
| Failed Requests | $FAILED_PERCENT% | $([ $(echo "$FAILED_PERCENT < 1" | bc -l) -eq 1 ] && echo "✓" || echo "⚠") |
| Avg Response Time | ${AVG_RESPONSE}ms | $([ $(echo "$AVG_RESPONSE < 200" | bc -l) -eq 1 ] && echo "✓" || echo "⚠") |
| P95 Response Time | ${P95_RESPONSE}ms | $([ $(echo "$P95_RESPONSE < 500" | bc -l) -eq 1 ] && echo "✓" || echo "⚠") |
| P99 Response Time | ${P99_RESPONSE}ms | $([ $(echo "$P99_RESPONSE < 1000" | bc -l) -eq 1 ] && echo "✓" || echo "⚠") |
| Max Response Time | ${MAX_RESPONSE}ms | - |
| Max Virtual Users | $MAX_VUS | ✓ |
| Checks Passed | $CHECKS_RATE% | $([ $(echo "$CHECKS_RATE > 95" | bc -l) -eq 1 ] && echo "✓" || echo "⚠") |

---

## Detailed Analysis

### Performance Assessment

EOF

    # Performance assessment
    echo -e "${YELLOW}Assessing performance...${NC}"
    
    ISSUES=0
    
    # Check response times
    if [ $(echo "$AVG_RESPONSE > 200" | bc -l) -eq 1 ]; then
        echo "⚠️  **Warning:** Average response time exceeds 200ms" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((ISSUES++))
    fi
    
    if [ $(echo "$P95_RESPONSE > 500" | bc -l) -eq 1 ]; then
        echo "⚠️  **Warning:** P95 response time exceeds 500ms" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((ISSUES++))
    fi
    
    # Check error rate
    if [ $(echo "$FAILED_PERCENT > 1" | bc -l) -eq 1 ]; then
        echo "❌ **Critical:** Error rate exceeds 1%" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((ISSUES++))
    fi
    
    # Check success rate
    if [ $(echo "$CHECKS_RATE < 95" | bc -l) -eq 1 ]; then
        echo "⚠️  **Warning:** Check success rate below 95%" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((ISSUES++))
    fi
    
    if [ $ISSUES -eq 0 ]; then
        echo "✅ **All performance metrics within acceptable ranges**" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
    fi
    
    # Recommendations
    cat >> "$REPORT_FILE" <<EOF

### Recommendations

EOF

    if [ $(echo "$AVG_RESPONSE > 200" | bc -l) -eq 1 ]; then
        cat >> "$REPORT_FILE" <<EOF
1. **Optimize Response Time**
   - Enable caching for frequently accessed data
   - Optimize database queries
   - Consider CDN for static assets
   - Review and optimize slow endpoints

EOF
    fi
    
    if [ $(echo "$FAILED_PERCENT > 0.5" | bc -l) -eq 1 ]; then
        cat >> "$REPORT_FILE" <<EOF
2. **Reduce Error Rate**
   - Review error logs for patterns
   - Implement better error handling
   - Add retry logic for transient failures
   - Monitor database connection pool

EOF
    fi
    
    if [ $(echo "$P95_RESPONSE > 500" | bc -l) -eq 1 ]; then
        cat >> "$REPORT_FILE" <<EOF
3. **Improve P95 Response Time**
   - Identify and optimize slow queries
   - Implement request queuing
   - Scale horizontally if needed
   - Review resource utilization

EOF
    fi
    
    # Summary
    cat >> "$REPORT_FILE" <<EOF

---

## Summary

EOF

    if [ $ISSUES -eq 0 ]; then
        cat >> "$REPORT_FILE" <<EOF
✅ **System Performance: EXCELLENT**

The system handled the load test successfully with all metrics within acceptable ranges.

EOF
        echo -e "${GREEN}✅ Performance: EXCELLENT${NC}"
    elif [ $ISSUES -le 2 ]; then
        cat >> "$REPORT_FILE" <<EOF
⚠️  **System Performance: GOOD**

The system performed well but has some areas for improvement.

EOF
        echo -e "${YELLOW}⚠️  Performance: GOOD${NC}"
    else
        cat >> "$REPORT_FILE" <<EOF
❌ **System Performance: NEEDS IMPROVEMENT**

The system requires optimization to handle production load effectively.

EOF
        echo -e "${RED}❌ Performance: NEEDS IMPROVEMENT${NC}"
    fi
    
    # Console output
    echo ""
    echo -e "${BLUE}Key Metrics:${NC}"
    echo -e "  Total Requests: ${GREEN}$TOTAL_REQUESTS${NC}"
    echo -e "  Failed Rate: ${YELLOW}$FAILED_PERCENT%${NC}"
    echo -e "  Avg Response: ${YELLOW}${AVG_RESPONSE}ms${NC}"
    echo -e "  P95 Response: ${YELLOW}${P95_RESPONSE}ms${NC}"
    echo -e "  Max VUs: ${GREEN}$MAX_VUS${NC}"
    echo ""
    
else
    echo -e "${YELLOW}jq not found. Install jq for detailed analysis.${NC}"
    echo "Manual analysis required for: $RESULTS_FILE"
    
    cat >> "$REPORT_FILE" <<EOF
**Note:** Detailed analysis requires jq. Install with:
- macOS: \`brew install jq\`
- Ubuntu: \`sudo apt-get install jq\`

EOF
fi

# Add raw data section
cat >> "$REPORT_FILE" <<EOF

---

## Raw Data

\`\`\`json
$(cat "$RESULTS_FILE")
\`\`\`

EOF

echo -e "${GREEN}✅ Analysis complete!${NC}"
echo -e "${BLUE}Report saved to: $REPORT_FILE${NC}"
echo ""

# Open report if possible
if command -v open >/dev/null 2>&1; then
    read -p "Open report? (y/n): " OPEN_REPORT
    if [ "$OPEN_REPORT" = "y" ]; then
        open "$REPORT_FILE"
    fi
fi
